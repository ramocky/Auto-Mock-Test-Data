document.addEventListener('DOMContentLoaded', () => {
  const defaultKeywords = ['id', '创建', '更新', '主键', '忽略', '只读', '序号', 'id_', '_id', 'created', 'updated'];
  let currentKeywords = [];
  let shortcutSpotlight = 'x';
  let shortcutFill = 'z';

  const tagsContainer = document.getElementById('tagsContainer');
  const newKeywordInput = document.getElementById('newKeyword');
  const addBtn = document.getElementById('addBtn');
  const saveBtn = document.getElementById('saveBtn');
  const statusEl = document.getElementById('status');
  const inputSpotlight = document.getElementById('shortcutSpotlight');
  const inputFill = document.getElementById('shortcutFill');

  // 初始化加载配置
  chrome.storage.sync.get(['ignoreKeywords', 'shortcutSpotlight', 'shortcutFill'], (result) => {
    currentKeywords = result.ignoreKeywords || defaultKeywords;
    shortcutSpotlight = result.shortcutSpotlight || 'x';
    shortcutFill = result.shortcutFill || 'z';
    
    inputSpotlight.value = shortcutSpotlight.toUpperCase();
    inputFill.value = shortcutFill.toUpperCase();
    renderTags();
  });

  // 绑定快捷键输入逻辑
  function bindShortcutInput(inputEl, keyName) {
    inputEl.addEventListener('keydown', (e) => {
      e.preventDefault();
      // 忽略单纯修饰键
      if (['Alt', 'Control', 'Shift', 'Meta'].includes(e.key)) return;
      
      const newKey = e.key.toLowerCase();
      inputEl.value = newKey.toUpperCase();
      if (keyName === 'spotlight') shortcutSpotlight = newKey;
      if (keyName === 'fill') shortcutFill = newKey;
    });
  }
  bindShortcutInput(inputSpotlight, 'spotlight');
  bindShortcutInput(inputFill, 'fill');

  // 渲染标签
  function renderTags() {
    tagsContainer.innerHTML = '';
    currentKeywords.forEach((keyword, index) => {
      const tag = document.createElement('div');
      tag.className = 'tag';
      tag.innerText = keyword;
      
      const closeBtn = document.createElement('span');
      closeBtn.className = 'close';
      closeBtn.innerText = '×';
      closeBtn.onclick = () => {
        currentKeywords.splice(index, 1);
        renderTags();
      };
      
      tag.appendChild(closeBtn);
      tagsContainer.appendChild(tag);
    });
  }

  // 添加新词
  function addKeyword() {
    const val = newKeywordInput.value.trim();
    if (val && !currentKeywords.includes(val)) {
      currentKeywords.push(val);
      renderTags();
      newKeywordInput.value = '';
    }
  }

  addBtn.addEventListener('click', addKeyword);
  newKeywordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addKeyword();
  });

  // 保存配置
  saveBtn.addEventListener('click', () => {
    chrome.storage.sync.set({ 
      ignoreKeywords: currentKeywords,
      shortcutSpotlight: shortcutSpotlight,
      shortcutFill: shortcutFill
    }, () => {
      statusEl.style.display = 'block';
      setTimeout(() => { statusEl.style.display = 'none'; }, 3000);

      // 通知所有已打开的网页更新配置
      chrome.tabs.query({}, (tabs) => {
        for (let tab of tabs) {
          if (tab.url && !tab.url.startsWith('chrome://')) {
            chrome.tabs.sendMessage(tab.id, { 
              action: "updateConfig", 
              config: { 
                ignoreKeywords: currentKeywords,
                shortcutSpotlight: shortcutSpotlight,
                shortcutFill: shortcutFill
              } 
            }).catch(err => {}); // 忽略无法接收消息的标签页
          }
        }
      });
    });
  });
});
