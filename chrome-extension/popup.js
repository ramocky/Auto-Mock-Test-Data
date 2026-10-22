function sendTabMessage(message, successText, closeAfter) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs && tabs[0];
    if (!tab) {
      showStatus('未找到当前标签页', true);
      return;
    }

    chrome.tabs.sendMessage(tab.id, message, (response) => {
      if (chrome.runtime.lastError) {
        showStatus('请刷新目标网页后再试！', true);
        return;
      }
      showStatus((response && response.message) || successText || '指令已下发！', false);
      if (closeAfter) window.close();
    });
  });
}

document.getElementById('fillBtn').addEventListener('click', () => {
  sendTabMessage({ action: 'fillMockData' }, '一键填充指令已下发！', false);
});

document.getElementById('undoBtn').addEventListener('click', () => {
  sendTabMessage({ action: 'undoLastFill' }, '撤销指令已下发！', false);
});

document.getElementById('spotlightBtn').addEventListener('click', () => {
  sendTabMessage({ action: 'toggleSpotlight' }, '悬浮控制台已唤出！', true);
});

document.getElementById('optionsBtn').addEventListener('click', () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});

function showStatus(message, isError) {
  const status = document.getElementById('status');
  status.innerText = message;
  status.style.color = isError ? '#f56c6c' : '#67c23a';
  status.style.display = 'block';
  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}
