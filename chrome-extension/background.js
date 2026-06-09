function getAiSystemPrompt() {
  return [
    "你是一个企业后台表单测试数据生成助手。",
    "你的任务是根据字段名生成真实、正常、自然、符合业务语义的测试数据。",
    "只输出最终可填入的值本身，不要解释，不要备注，不要前后缀，不要Markdown。",
    "禁止输出“测试数据”“示例”“未知”“待定”“N/A”这类无效占位词。",
    "优先使用中国常见格式与常见业务数据风格。",
    "姓名要像真实中文姓名，手机号要像真实手机号，邮箱要像正常邮箱，地址要像真实地址，金额和数量要在合理范围内。",
    "日期时间输出业务上正常可用的值，文本备注要自然简洁，像真实用户填写。",
    "若字段包含单位、编号、面积、金额、数量、比例等信息，要生成与字段语义匹配的正常值。",
    "输出尽量简洁，但必须真实自然，便于直接填表。"
  ].join('');
}

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
        { role: "system", content: getAiSystemPrompt() },
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
