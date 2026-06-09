function isOfficialDeepSeekApi(url) {
  return typeof url === 'string' && /^https:\/\/api\.deepseek\.com\//i.test(url);
}

function extractDeepSeekResult(data) {
  if (!data || !data.choices || data.choices.length === 0) {
    return { error: data && data.error ? JSON.stringify(data.error) : "API返回结构中没有choices" };
  }

  const message = data.choices[0] && data.choices[0].message ? data.choices[0].message : {};
  const result = typeof message.content === 'string' ? message.content.trim() : '';
  if (result) {
    return { value: result };
  }

  const finishReason = data.choices[0].finish_reason || 'unknown';
  const hasReasoning = Boolean(message.reasoning_content);
  let errMsg = `AI未返回可填内容(finish_reason=${finishReason})`;
  if (hasReasoning) {
    errMsg += "；仅返回了thinking内容";
  }
  return { error: errMsg };
}

// 监听快捷键触发 (用于召唤悬浮窗)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "fill-mock-data") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action: "toggleSpotlight" }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn("未能在目标页面召唤控制台，请先强制刷新目标网页 (F5)。");
        }
      });
    }
  }
});

// 监听网页转发的后台请求
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'deepseek_request') {
    const { apiKey, apiUrl, modelName, label } = request.payload;
    const url = apiUrl || 'https://api.deepseek.com/v1/chat/completions';
    const model = modelName || 'deepseek-v4-flash';
    const requestBody = {
      model: model,
      messages: [
        { role: "system", content: "你是一个测试数据生成器。只需输出测试数据本身，绝对不要输出任何解释、思维过程、前言或后记！不要Markdown标记！纯文本结果尽量短于15个字符。" },
        { role: "user", content: `字段名：${label}` }
      ],
      temperature: 0.1,
      max_tokens: 200
    };
    if (isOfficialDeepSeekApi(url)) {
      requestBody.thinking = { type: "disabled" };
    }
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })
    .then(async res => {
      console.log(`[AutoMock AI] 收到响应: HTTP ${res.status}`);
      if (!res.ok) {
        let text = await res.text();
        console.error(`[AutoMock AI] API 返回错误:`, text);
        let errMsg = `HTTP ${res.status}`;
        try {
          const errData = JSON.parse(text);
          if (errData.error && errData.error.message) errMsg += ": " + errData.error.message;
        } catch(e) { errMsg += " " + text.substring(0, 50); }
        throw new Error(errMsg);
      }
      return res.json();
    })
    .then(data => {
      console.log("[AutoMock AI] JSON 解析成功:", data);
      const extracted = extractDeepSeekResult(data);
      if (extracted.value) {
        console.log("[AutoMock AI] 提取结果:", extracted.value);
        sendResponse({ success: true, data: extracted.value });
      } else {
        console.error("[AutoMock AI] 可填结果为空:", extracted.error, data);
        sendResponse({ success: false, error: extracted.error });
      }
    })
    .catch(err => {
      console.error("[AutoMock AI] Fetch失败:", err);
      sendResponse({ success: false, error: err.message });
    });
    
    return true; // 保持异步通道
  }
});
