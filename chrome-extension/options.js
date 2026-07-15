document.addEventListener('DOMContentLoaded', () => {
  const DEFAULT_CONFIG = {
    SHORTCUT_SPOTLIGHT: 'x',
    SHORTCUT_FILL_ALL: 'z',
    SHORTCUT_AI_TRIGGER: 's',
    AI_MANUAL_TRIGGER_MODE: true,
    AI_ENABLE_CLASSIFICATION: true,
    AI_ENABLE_PRELOAD: true,
    IGNORE_KEYWORDS: ['id', '创建', '更新', '主键', '忽略', '只读', '序号', 'id_', '_id', 'created', 'updated'],
    CUSTOM_DICTS: [],
    DEEPSEEK_API_URL: 'https://api.deepseek.com/v1/chat/completions',
    DEEPSEEK_API_MODEL: 'deepseek-v4-flash',
    DEEPSEEK_API_KEY: ''
  };

  let currentConfig = {};
  let currentKeywords = [];

  const tagsContainer = document.getElementById('tagsContainer');
  const newKeywordInput = document.getElementById('newKeyword');
  const addBtn = document.getElementById('addBtn');
  const saveBtn = document.getElementById('saveBtn');
  const statusEl = document.getElementById('status');
  const inputSpotlight = document.getElementById('shortcutSpotlight');
  const inputFill = document.getElementById('shortcutFill');
  const inputAiTrigger = document.getElementById('shortcutAiTrigger');
  const customDictsEl = document.getElementById('customDicts');
  const aiManualTriggerModeEl = document.getElementById('aiManualTriggerMode');
  const aiEnableClassificationEl = document.getElementById('aiEnableClassification');
  const aiEnablePreloadEl = document.getElementById('aiEnablePreload');
  const deepseekApiUrlEl = document.getElementById('deepseekApiUrl');
  const deepseekApiModelEl = document.getElementById('deepseekApiModel');
  const deepseekApiKeyEl = document.getElementById('deepseekApiKey');

  // 初始化加载配置
  chrome.storage.sync.get(['auto_mock_config'], (result) => {
    currentConfig = result.auto_mock_config || { ...DEFAULT_CONFIG };
    currentConfig = { ...DEFAULT_CONFIG, ...currentConfig };
    currentKeywords = currentConfig.IGNORE_KEYWORDS || [];
    
    inputSpotlight.value = currentConfig.SHORTCUT_SPOTLIGHT.toUpperCase();
    inputFill.value = currentConfig.SHORTCUT_FILL_ALL.toUpperCase();
    inputAiTrigger.value = currentConfig.SHORTCUT_AI_TRIGGER.toUpperCase();
    customDictsEl.value = currentConfig.CUSTOM_DICTS ? JSON.stringify(currentConfig.CUSTOM_DICTS, null, 2) : '';
    aiManualTriggerModeEl.checked = currentConfig.AI_MANUAL_TRIGGER_MODE !== false;
    aiEnableClassificationEl.checked = currentConfig.AI_ENABLE_CLASSIFICATION !== false;
    aiEnablePreloadEl.checked = currentConfig.AI_ENABLE_PRELOAD !== false;
    deepseekApiUrlEl.value = currentConfig.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    deepseekApiModelEl.value = currentConfig.DEEPSEEK_API_MODEL || 'deepseek-v4-flash';
    deepseekApiKeyEl.value = currentConfig.DEEPSEEK_API_KEY || '';
    renderTags();
  });

  // 绑定快捷键输入逻辑
  function bindShortcutInput(inputEl, keyField) {
    inputEl.addEventListener('keydown', (e) => {
      e.preventDefault();
      if (['Alt', 'Control', 'Shift', 'Meta'].includes(e.key)) return;
      
      const newKey = e.key.toLowerCase();
      inputEl.value = newKey.toUpperCase();
      currentConfig[keyField] = newKey;
    });
  }
  bindShortcutInput(inputSpotlight, 'SHORTCUT_SPOTLIGHT');
  bindShortcutInput(inputFill, 'SHORTCUT_FILL_ALL');
  bindShortcutInput(inputAiTrigger, 'SHORTCUT_AI_TRIGGER');

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
    let parsedDicts = [];
    const dictText = customDictsEl.value.trim();
    if (dictText) {
      try {
        parsedDicts = JSON.parse(dictText);
        if (!Array.isArray(parsedDicts)) throw new Error("Not an array");
      } catch (e) {
        alert("自定义字典 JSON 格式错误，请检查！\n" + e.message);
        return;
      }
    }

    currentConfig.IGNORE_KEYWORDS = currentKeywords;
    currentConfig.CUSTOM_DICTS = parsedDicts;
    currentConfig.AI_MANUAL_TRIGGER_MODE = aiManualTriggerModeEl.checked;
    currentConfig.AI_ENABLE_CLASSIFICATION = aiEnableClassificationEl.checked;
    currentConfig.AI_ENABLE_PRELOAD = aiEnablePreloadEl.checked;
    currentConfig.DEEPSEEK_API_URL = deepseekApiUrlEl.value.trim() || 'https://api.deepseek.com/v1/chat/completions';
    currentConfig.DEEPSEEK_API_MODEL = deepseekApiModelEl.value.trim() || 'deepseek-v4-flash';
    currentConfig.DEEPSEEK_API_KEY = deepseekApiKeyEl.value.trim();

    chrome.storage.sync.set({ auto_mock_config: currentConfig }, () => {
      statusEl.style.display = 'block';
      setTimeout(() => { statusEl.style.display = 'none'; }, 3000);

      // 通知所有已打开的网页更新配置
      chrome.tabs.query({}, (tabs) => {
        for (let tab of tabs) {
          if (tab.url && !tab.url.startsWith('chrome://')) {
            chrome.tabs.sendMessage(tab.id, { 
              action: "updateConfig", 
              config: currentConfig
            }).catch(err => {}); // 忽略无法接收消息的标签页
          }
        }
      });
    });
  });
});
