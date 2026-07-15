// 注入 inject.js 到页面上下文中
function injectScript(file_path, tag) {
  var node = document.getElementsByTagName(tag)[0];
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', file_path);
  node.appendChild(script);
}

// 确保只注入一次
if (!window._mockExtInjected) {
  injectScript(chrome.runtime.getURL('inject.js'), 'body');
  window._mockExtInjected = true;
  
  // 从存储中读取用户配置并发送给 inject.js
  chrome.storage.sync.get(['auto_mock_config'], function(result) {
    const defaultKeywords = ['id', '创建', '更新', '主键', '忽略', '只读', '序号', 'id_', '_id', 'created', 'updated'];
    let configData = result.auto_mock_config || {};
    // 兼容补全
    configData.IGNORE_KEYWORDS = configData.IGNORE_KEYWORDS || defaultKeywords;
    configData.SHORTCUT_SPOTLIGHT = configData.SHORTCUT_SPOTLIGHT || 'x';
    configData.SHORTCUT_FILL_ALL = configData.SHORTCUT_FILL_ALL || 'z';
    configData.SHORTCUT_AI_TRIGGER = configData.SHORTCUT_AI_TRIGGER || 's';
    if (typeof configData.AI_MANUAL_TRIGGER_MODE !== 'boolean') configData.AI_MANUAL_TRIGGER_MODE = true;
    if (typeof configData.AI_ENABLE_CLASSIFICATION !== 'boolean') configData.AI_ENABLE_CLASSIFICATION = true;
    if (typeof configData.AI_ENABLE_PRELOAD !== 'boolean') configData.AI_ENABLE_PRELOAD = true;
    configData.DEEPSEEK_API_URL = configData.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    configData.DEEPSEEK_API_MODEL = configData.DEEPSEEK_API_MODEL || 'deepseek-v4-flash';
    configData.DEEPSEEK_API_KEY = configData.DEEPSEEK_API_KEY || '';
    
    // 异步注入，延迟发送
    setTimeout(() => {
      window.postMessage({ type: "INIT_MOCK_CONFIG", config: configData }, "*");
    }, 500);
  });
}

// 监听网页发来的 DeepSeek 请求，转发给 background
window.addEventListener("message", function(event) {
  if (event.source !== window || !event.data) return;
  if (event.data.type === "DEEPSEEK_REQUEST") {
    try {
      chrome.runtime.sendMessage({ action: "deepseek_request", payload: event.data.payload }, (response) => {
        if (chrome.runtime.lastError) {
          window.postMessage({ type: "DEEPSEEK_RESPONSE", reqId: event.data.reqId, response: { success: false, error: chrome.runtime.lastError.message } }, "*");
        } else {
          window.postMessage({ type: "DEEPSEEK_RESPONSE", reqId: event.data.reqId, response: response }, "*");
        }
      });
    } catch (e) {
      window.postMessage({ type: "DEEPSEEK_RESPONSE", reqId: event.data.reqId, response: { success: false, error: e.message } }, "*");
    }
  }
});

// 监听来自扩展 (popup, background, options) 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fillMockData") {
    window.postMessage({ type: "AUTO_MOCK_FILL" }, "*");
    sendResponse({ status: "ok" });
  } else if (request.action === "toggleSpotlight") {
    window.postMessage({ type: "TOGGLE_SPOTLIGHT" }, "*");
    sendResponse({ status: "ok" });
  } else if (request.action === "updateConfig") {
    // 选项页更新了配置，实时同步给 inject.js
    window.postMessage({ type: "INIT_MOCK_CONFIG", config: request.config }, "*");
    sendResponse({ status: "ok" });
  }
});
