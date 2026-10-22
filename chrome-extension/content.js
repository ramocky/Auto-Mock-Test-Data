(function () {
  const DEFAULT_CONFIG = {
    SHORTCUT_SPOTLIGHT: 'x',
    SHORTCUT_FILL_ALL: 'z',
    SHORTCUT_AI_TRIGGER: 's',
    AI_MANUAL_TRIGGER_MODE: true,
    AI_ENABLE_CLASSIFICATION: true,
    IGNORE_KEYWORDS: ['id', '创建', '更新', '主键', '忽略', '只读', '序号', 'id_', '_id', 'created', 'updated'],
    CUSTOM_DICTS: [],
    DEEPSEEK_API_URL: 'https://api.deepseek.com/v1/chat/completions',
    DEEPSEEK_API_MODEL: 'deepseek-v4-flash',
    DEEPSEEK_API_KEY: ''
  };

  const AI_RATE_LIMIT_WINDOW_MS = 60000;
  const AI_RATE_LIMIT_MAX = 30;
  const aiRequestTimestamps = [];

  let pageReady = false;
  let latestPageConfig = null;
  let latestRawConfig = {};

  function normalizeShortcut(value, fallback) {
    const text = String(value == null ? '' : value).trim().toLowerCase();
    if (/^f([1-9]|1[0-2])$/.test(text)) return text;
    if (text.length === 1 && !/\s/.test(text)) return text;
    return fallback;
  }

  function normalizeCustomDicts(value) {
    if (!Array.isArray(value)) return [];
    return value
      .filter(dict => dict && typeof dict === 'object' && typeof dict.regex === 'string' && dict.regex.trim())
      .slice(0, 50)
      .map(dict => ({
        label: String(dict.label || '自定义值').slice(0, 50),
        regex: dict.regex.trim().slice(0, 200),
        values: Array.isArray(dict.values) ? dict.values.slice(0, 100).map(item => String(item)) : []
      }));
  }

  // 只向页面暴露渲染所需字段，API Key 永远不进入页面上下文
  function buildPageConfig(rawConfig) {
    const source = Object.assign({}, DEFAULT_CONFIG, rawConfig || {});
    return {
      SHORTCUT_SPOTLIGHT: normalizeShortcut(source.SHORTCUT_SPOTLIGHT, DEFAULT_CONFIG.SHORTCUT_SPOTLIGHT),
      SHORTCUT_FILL_ALL: normalizeShortcut(source.SHORTCUT_FILL_ALL, DEFAULT_CONFIG.SHORTCUT_FILL_ALL),
      SHORTCUT_AI_TRIGGER: normalizeShortcut(source.SHORTCUT_AI_TRIGGER, DEFAULT_CONFIG.SHORTCUT_AI_TRIGGER),
      AI_MANUAL_TRIGGER_MODE: source.AI_MANUAL_TRIGGER_MODE !== false,
      AI_ENABLED: Boolean(String(source.DEEPSEEK_API_KEY || '').trim()),
      AI_ENABLE_CLASSIFICATION: source.AI_ENABLE_CLASSIFICATION !== false,
      IGNORE_KEYWORDS: Array.isArray(source.IGNORE_KEYWORDS)
        ? source.IGNORE_KEYWORDS.map(item => String(item)).filter(Boolean).slice(0, 100)
        : DEFAULT_CONFIG.IGNORE_KEYWORDS.slice(),
      CUSTOM_DICTS: normalizeCustomDicts(source.CUSTOM_DICTS)
    };
  }

  function postConfig(config) {
    latestPageConfig = config;
    if (!pageReady) return;
    window.postMessage({ type: 'INIT_MOCK_CONFIG', config: config }, '*');
  }

  function loadConfigAndPost() {
    chrome.storage.sync.get(['auto_mock_config'], (result) => {
      if (chrome.runtime.lastError) {
        console.warn('[AutoMock] 读取配置失败:', chrome.runtime.lastError.message);
        latestRawConfig = {};
        postConfig(buildPageConfig(null));
        return;
      }
      latestRawConfig = (result && result.auto_mock_config) || {};
      postConfig(buildPageConfig(latestRawConfig));
    });
  }

  // 在桥接层再次执行 AI 开关，避免页面绕过注入脚本直接发请求
  function isAiEnabledForTab() {
    const config = latestRawConfig || {};
    const hasKey = Boolean(String(config.DEEPSEEK_API_KEY || '').trim());
    return hasKey && config.AI_ENABLE_CLASSIFICATION !== false;
  }

  // 注入 inject.js 到页面上下文
  function injectScript() {
    if (window._mockExtInjected) return;
    window._mockExtInjected = true;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = chrome.runtime.getURL('inject.js');
    script.onload = () => script.remove();
    script.onerror = () => console.error('[AutoMock] inject.js 注入失败');
    (document.head || document.documentElement || document.body).appendChild(script);
  }

  function isAiRateLimited() {
    const now = Date.now();
    while (aiRequestTimestamps.length > 0 && now - aiRequestTimestamps[0] > AI_RATE_LIMIT_WINDOW_MS) {
      aiRequestTimestamps.shift();
    }
    if (aiRequestTimestamps.length >= AI_RATE_LIMIT_MAX) return true;
    aiRequestTimestamps.push(now);
    return false;
  }

  function sanitizeAiPayload(payload) {
    const label = String(payload && payload.label || '').trim().slice(0, 100);
    const options = Array.isArray(payload && payload.options)
      ? payload.options.map(item => String(item == null ? '' : item).trim().slice(0, 50)).filter(Boolean).slice(0, 30)
      : [];
    return { label: label, options: options };
  }

  function respondAiResult(reqId, response) {
    window.postMessage({
      type: 'DEEPSEEK_RESPONSE',
      reqId: reqId,
      response: response
    }, '*');
  }

  // 监听网页发来的消息：注入就绪与 AI 请求
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data) return;
    const data = event.data;

    if (data.type === 'AUTO_MOCK_READY') {
      pageReady = true;
      if (latestPageConfig) {
        window.postMessage({ type: 'INIT_MOCK_CONFIG', config: latestPageConfig }, '*');
      } else {
        loadConfigAndPost();
      }
      return;
    }

    if (data.type === 'DEEPSEEK_REQUEST') {
      const reqId = typeof data.reqId === 'string' ? data.reqId : '';
      if (!reqId) return;
      if (!isAiEnabledForTab()) {
        respondAiResult(reqId, { success: false, error: 'AI 未启用' });
        return;
      }
      if (isAiRateLimited()) {
        respondAiResult(reqId, { success: false, error: 'AI 请求过于频繁，请稍后再试' });
        return;
      }
      const payload = sanitizeAiPayload(data.payload);
      if (!payload.label) {
        respondAiResult(reqId, { success: false, error: '字段名为空，无法请求 AI' });
        return;
      }
      chrome.runtime.sendMessage({ action: 'deepseek_request', payload: payload }, (response) => {
        if (chrome.runtime.lastError) {
          respondAiResult(reqId, { success: false, error: chrome.runtime.lastError.message });
          return;
        }
        respondAiResult(reqId, response || { success: false, error: '后台无响应' });
      });
    }
  });

  // 监听来自扩展 (popup, options) 的消息
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (!request) return;

    if (request.action === 'fillMockData') {
      window.postMessage({ type: 'AUTO_MOCK_FILL' }, '*');
      sendResponse({ status: 'ok' });
    } else if (request.action === 'toggleSpotlight') {
      window.postMessage({ type: 'TOGGLE_SPOTLIGHT' }, '*');
      sendResponse({ status: 'ok' });
    } else if (request.action === 'undoLastFill') {
      window.postMessage({ type: 'AUTO_MOCK_UNDO' }, '*');
      sendResponse({ status: 'ok' });
    } else if (request.action === 'updateConfig') {
      if (request.config) {
        latestRawConfig = request.config;
        postConfig(buildPageConfig(request.config));
        sendResponse({ status: 'ok' });
      } else {
        chrome.storage.sync.get(['auto_mock_config'], (result) => {
          latestRawConfig = (result && result.auto_mock_config) || {};
          postConfig(buildPageConfig(latestRawConfig));
          sendResponse({ status: 'ok' });
        });
        return true;
      }
    }
  });

  injectScript();
  loadConfigAndPost();
})();
