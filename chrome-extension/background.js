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
