const DEFAULT_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEFAULT_MODEL = 'deepseek-v4-flash';
const AI_REQUEST_TIMEOUT_MS = 15000;

// 与 inject.js 的 MOCK_CMD_LABELS 保持一致；页面无法伪造该列表
const AI_CMD_CATALOG = [
  ['name', '人名'],
  ['englishName', '英文名'],
  ['age', '年龄'],
  ['phone', '手机号'],
  ['email', '邮箱'],
  ['idcard', '身份证'],
  ['bankCard', '银行卡'],
  ['accountName', '账号名称'],
  ['title', '职务头衔'],
  ['address', '详细地址'],
  ['url', '随机链接'],
  ['number', '随机数字'],
  ['amount', '金额数值'],
  ['color', '颜色值'],
  ['date', '日期'],
  ['time', '时间'],
  ['text', '长文本段落'],
  ['creditCode', '信用代码'],
  ['company', '企业名称'],
  ['licensePlate', '车牌号'],
  ['zipCode', '邮政编码'],
  ['ipv4', 'IP地址'],
  ['mac', 'MAC地址'],
  ['password', '强密码']
];

function getAiSystemPrompt(hasOptions) {
  if (hasOptions) {
    return '你是表单测试数据助手。用户会给出字段名和候选项，请只返回最合适的一个候选项原文，不要解释、不要引号、不要换行。';
  }
  const catalog = AI_CMD_CATALOG.map(item => item[0] + ':' + item[1]).join('、');
  return '你是表单测试数据助手。用户会给出字段名，请从命令列表中选择最合适的一个命令，只返回 JSON：{"cmd":"命令"}。可用命令：' + catalog + '。不要返回其他内容。';
}

function isOfficialDeepSeekApi(url) {
  return typeof url === 'string' && /^https:\/\/api\.deepseek\.com\//i.test(url);
}

function extractDeepSeekResult(data) {
  if (!data || !data.choices || data.choices.length === 0) {
    return { error: data && data.error ? JSON.stringify(data.error) : 'API返回结构中没有choices' };
  }

  const message = data.choices[0] && data.choices[0].message ? data.choices[0].message : {};
  const result = typeof message.content === 'string' ? message.content.trim() : '';
  if (result) return { value: result };

  const finishReason = data.choices[0].finish_reason || 'unknown';
  const hasReasoning = Boolean(message.reasoning_content);
  let errMsg = `AI未返回可填内容(finish_reason=${finishReason})`;
  if (hasReasoning) errMsg += '；仅返回了thinking内容';
  return { error: errMsg };
}

function getStoredConfig() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['auto_mock_config'], (result) => {
      if (chrome.runtime.lastError) {
        console.warn('[AutoMock AI] 读取配置失败:', chrome.runtime.lastError.message);
        resolve({});
        return;
      }
      resolve((result && result.auto_mock_config) || {});
    });
  });
}

function normalizePayload(payload) {
  const label = String(payload && payload.label || '').trim().slice(0, 100);
  const options = Array.isArray(payload && payload.options)
    ? payload.options.map(item => String(item == null ? '' : item).trim().slice(0, 50)).filter(Boolean).slice(0, 30)
    : [];
  return { label: label, options: options };
}

async function requestDeepSeek(payload) {
  const config = await getStoredConfig();
  const apiKey = String(config.DEEPSEEK_API_KEY || '').trim();
  const apiUrl = String(config.DEEPSEEK_API_URL || DEFAULT_API_URL).trim() || DEFAULT_API_URL;
  const model = String(config.DEEPSEEK_API_MODEL || DEFAULT_MODEL).trim() || DEFAULT_MODEL;

  if (!apiKey) return { success: false, error: '未配置 API Key' };
  if (config.AI_ENABLE_CLASSIFICATION === false) return { success: false, error: 'AI 分类已关闭' };
  if (!payload.label) return { success: false, error: '字段名为空' };

  const hasOptions = payload.options.length > 0;
  const userContent = hasOptions
    ? `字段名：${payload.label}\n候选项：${payload.options.join('、')}`
    : `字段名：${payload.label}`;

  const requestBody = {
    model: model,
    messages: [
      { role: 'system', content: getAiSystemPrompt(hasOptions) },
      { role: 'user', content: userContent }
    ],
    temperature: 0.1,
    max_tokens: 200
  };
  if (isOfficialDeepSeekApi(apiUrl)) {
    requestBody.thinking = { type: 'disabled' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    if (!res.ok) {
      const text = await res.text();
      let errMsg = `HTTP ${res.status}`;
      try {
        const errData = JSON.parse(text);
        if (errData.error && errData.error.message) errMsg += ': ' + errData.error.message;
      } catch (e) {
        errMsg += ' ' + text.substring(0, 50);
      }
      return { success: false, error: errMsg };
    }

    const data = await res.json();
    const extracted = extractDeepSeekResult(data);
    if (extracted.value) return { success: true, data: extracted.value };
    return { success: false, error: extracted.error };
  } catch (err) {
    if (err && err.name === 'AbortError') {
      return { success: false, error: 'AI 请求超时（15 秒）' };
    }
    return { success: false, error: err && err.message ? err.message : String(err) };
  } finally {
    clearTimeout(timeoutId);
  }
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (!request || request.action !== 'deepseek_request') return;

  const payload = normalizePayload(request.payload);
  requestDeepSeek(payload)
    .then(sendResponse)
    .catch(err => sendResponse({ success: false, error: err && err.message ? err.message : String(err) }));

  return true; // 保持异步通道
});

// 清理已移除的「AI 预加载」配置，避免设置页继续展示无效开关
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['auto_mock_config'], (result) => {
    const config = result && result.auto_mock_config;
    if (!config || !Object.prototype.hasOwnProperty.call(config, 'AI_ENABLE_PRELOAD')) return;
    delete config.AI_ENABLE_PRELOAD;
    chrome.storage.sync.set({ auto_mock_config: config });
  });
});
