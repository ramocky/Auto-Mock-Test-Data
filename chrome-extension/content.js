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
  chrome.storage.sync.get(['ignoreKeywords', 'shortcutSpotlight', 'shortcutFill'], function(result) {
    const defaultKeywords = ['id', '创建', '更新', '主键', '忽略', '只读', '序号', 'id_', '_id', 'created', 'updated'];
    
    const configData = {
      ignoreKeywords: result.ignoreKeywords || defaultKeywords,
      shortcutSpotlight: result.shortcutSpotlight || 'x',
      shortcutFill: result.shortcutFill || 'z'
    };
    
    // 异步注入，延迟发送
    setTimeout(() => {
      window.postMessage({ type: "INIT_MOCK_CONFIG", config: configData }, "*");
    }, 500);
  });
}

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
