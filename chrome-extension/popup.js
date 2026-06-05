document.getElementById('fillBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, { action: "fillMockData" }, (response) => {
      showStatus(chrome.runtime.lastError);
    });
  }
});

document.getElementById('spotlightBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, { action: "toggleSpotlight" }, (response) => {
      showStatus(chrome.runtime.lastError);
      if (!chrome.runtime.lastError) {
        window.close(); // 唤出成功后自动关闭扩展面板
      }
    });
  }
});

document.getElementById('optionsBtn').addEventListener('click', () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});

function showStatus(hasError) {
  const status = document.getElementById('status');
  if (hasError) {
    status.innerText = "请刷新目标网页后再试！";
    status.style.color = "#f56c6c";
  } else {
    status.innerText = "指令已下发！";
    status.style.color = "#67c23a";
  }
  status.style.display = 'block';
  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}
