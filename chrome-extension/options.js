document.addEventListener('DOMContentLoaded', () => {
  const DEFAULT_CONFIG = {
    SHORTCUT_SPOTLIGHT: 'x',
    SHORTCUT_FILL_ALL: 'z',
    SHORTCUT_AI_TRIGGER: 's',
    AI_MANUAL_TRIGGER_MODE: true,
    AI_ENABLE_CLASSIFICATION: true,
    IGNORE_KEYWORDS: ['id', '创建', '更新', '主键', '忽略', '只读', '序号', 'id_', '_id', 'created', 'updated'],
    CUSTOM_DICTS: [],
    DEEPSEEK_API_URL: 'https://api.deepseek.com/v1/chat/completions',
    DEEPSEEK_API_MODEL: 'deepseek-v4-flash',
    DEEPSEEK_API_KEY: ''
  };

  const SHORTCUT_FIELDS = ['SHORTCUT_SPOTLIGHT', 'SHORTCUT_FILL_ALL', 'SHORTCUT_AI_TRIGGER'];

  let currentConfig = { ...DEFAULT_CONFIG };
  let currentKeywords = [];
  let statusTimer = null;

  const tagsContainer = document.getElementById('tagsContainer');
  const newKeywordInput = document.getElementById('newKeyword');
  const addBtn = document.getElementById('addBtn');
  const saveBtn = document.getElementById('saveBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFileInput = document.getElementById('importFile');
  const resetBtn = document.getElementById('resetBtn');
  const statusEl = document.getElementById('status');
  const inputSpotlight = document.getElementById('shortcutSpotlight');
  const inputFill = document.getElementById('shortcutFill');
  const inputAiTrigger = document.getElementById('shortcutAiTrigger');
  const customDictsEl = document.getElementById('customDicts');
  const aiManualTriggerModeEl = document.getElementById('aiManualTriggerMode');
  const aiEnableClassificationEl = document.getElementById('aiEnableClassification');
  const deepseekApiUrlEl = document.getElementById('deepseekApiUrl');
  const deepseekApiModelEl = document.getElementById('deepseekApiModel');
  const deepseekApiKeyEl = document.getElementById('deepseekApiKey');

  function normalizeShortcut(value, fallback) {
    const text = String(value == null ? '' : value).trim().toLowerCase();
    if (/^f([1-9]|1[0-2])$/.test(text)) return text;
    if (text.length === 1 && !/\s/.test(text)) return text;
    return fallback;
  }

  function showStatus(message, isError) {
    statusEl.innerText = message;
    statusEl.style.color = isError ? '#f56c6c' : '#67c23a';
    statusEl.style.display = 'block';
    if (statusTimer) clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
  }

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

  function applyConfigToForm() {
    currentKeywords = Array.isArray(currentConfig.IGNORE_KEYWORDS)
      ? currentConfig.IGNORE_KEYWORDS.slice()
      : DEFAULT_CONFIG.IGNORE_KEYWORDS.slice();

    currentConfig.SHORTCUT_SPOTLIGHT = normalizeShortcut(currentConfig.SHORTCUT_SPOTLIGHT, DEFAULT_CONFIG.SHORTCUT_SPOTLIGHT);
    currentConfig.SHORTCUT_FILL_ALL = normalizeShortcut(currentConfig.SHORTCUT_FILL_ALL, DEFAULT_CONFIG.SHORTCUT_FILL_ALL);
    currentConfig.SHORTCUT_AI_TRIGGER = normalizeShortcut(currentConfig.SHORTCUT_AI_TRIGGER, DEFAULT_CONFIG.SHORTCUT_AI_TRIGGER);

    inputSpotlight.value = currentConfig.SHORTCUT_SPOTLIGHT.toUpperCase();
    inputFill.value = currentConfig.SHORTCUT_FILL_ALL.toUpperCase();
    inputAiTrigger.value = currentConfig.SHORTCUT_AI_TRIGGER.toUpperCase();
    customDictsEl.value = currentConfig.CUSTOM_DICTS && currentConfig.CUSTOM_DICTS.length
      ? JSON.stringify(currentConfig.CUSTOM_DICTS, null, 2)
      : '';
    aiManualTriggerModeEl.checked = currentConfig.AI_MANUAL_TRIGGER_MODE !== false;
    aiEnableClassificationEl.checked = currentConfig.AI_ENABLE_CLASSIFICATION !== false;
    deepseekApiUrlEl.value = currentConfig.DEEPSEEK_API_URL || DEFAULT_CONFIG.DEEPSEEK_API_URL;
    deepseekApiModelEl.value = currentConfig.DEEPSEEK_API_MODEL || DEFAULT_CONFIG.DEEPSEEK_API_MODEL;
    deepseekApiKeyEl.value = currentConfig.DEEPSEEK_API_KEY || '';
    renderTags();
  }

  // 先渲染默认值，避免存储读取较慢时表单为空
  applyConfigToForm();

  // 初始化加载配置
  chrome.storage.sync.get(['auto_mock_config'], (result) => {
    if (chrome.runtime.lastError) {
      showStatus('读取配置失败：' + chrome.runtime.lastError.message, true);
      applyConfigToForm();
      return;
    }
    currentConfig = { ...DEFAULT_CONFIG, ...(result.auto_mock_config || {}) };
    delete currentConfig.AI_ENABLE_PRELOAD;
    applyConfigToForm();
  });

  // 绑定快捷键输入逻辑
  function bindShortcutInput(inputEl, keyField) {
    inputEl.addEventListener('keydown', (e) => {
      // 不拦截 Tab / Enter / Esc，保证键盘导航可用
      if (e.key === 'Tab' || e.key === 'Enter' || e.key === 'Escape') return;

      e.preventDefault();
      if (['Alt', 'Control', 'Shift', 'Meta'].includes(e.key)) return;

      const newKey = normalizeShortcut(e.key, '');
      if (!newKey) return;

      inputEl.value = newKey.toUpperCase();
      currentConfig[keyField] = newKey;
    });
  }
  bindShortcutInput(inputSpotlight, 'SHORTCUT_SPOTLIGHT');
  bindShortcutInput(inputFill, 'SHORTCUT_FILL_ALL');
  bindShortcutInput(inputAiTrigger, 'SHORTCUT_AI_TRIGGER');

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

  function parseCustomDicts(dictText) {
    if (!dictText) return [];
    const parsedDicts = JSON.parse(dictText);
    if (!Array.isArray(parsedDicts)) throw new Error('自定义字典必须是 JSON 数组');

    parsedDicts.forEach((item, index) => {
      const position = `第 ${index + 1} 项`;
      if (!item || typeof item !== 'object') throw new Error(`${position}必须是对象`);
      if (typeof item.regex !== 'string' || !item.regex.trim()) throw new Error(`${position}缺少 regex`);
      try {
        new RegExp(item.regex);
      } catch (err) {
        throw new Error(`${position} regex 无效：${err.message}`);
      }
      if (item.values !== undefined && !Array.isArray(item.values)) {
        throw new Error(`${position} values 必须是数组`);
      }
    });
    return parsedDicts;
  }

  function broadcastConfig(config) {
    chrome.tabs.query({}, (tabs) => {
      (tabs || []).forEach(tab => {
        if (!tab.url || /^(chrome|edge|about|chrome-extension):\/\//.test(tab.url)) return;
        chrome.tabs.sendMessage(tab.id, { action: 'updateConfig', config: config }, () => {
          // 读取 lastError，避免未处理的消息通道错误
          void chrome.runtime.lastError;
        });
      });
    });
  }

  // 保存配置
  saveBtn.addEventListener('click', () => {
    let parsedDicts = [];
    try {
      parsedDicts = parseCustomDicts(customDictsEl.value.trim());
    } catch (e) {
      showStatus('自定义字典格式错误：' + e.message, true);
      return;
    }

    const shortcuts = SHORTCUT_FIELDS.map(field => currentConfig[field]);
    if (new Set(shortcuts).size !== shortcuts.length) {
      showStatus('三个快捷键不能重复，请修改后再保存', true);
      return;
    }

    currentConfig.IGNORE_KEYWORDS = currentKeywords;
    currentConfig.CUSTOM_DICTS = parsedDicts;
    currentConfig.AI_MANUAL_TRIGGER_MODE = aiManualTriggerModeEl.checked;
    currentConfig.AI_ENABLE_CLASSIFICATION = aiEnableClassificationEl.checked;
    currentConfig.DEEPSEEK_API_URL = deepseekApiUrlEl.value.trim() || DEFAULT_CONFIG.DEEPSEEK_API_URL;
    currentConfig.DEEPSEEK_API_MODEL = deepseekApiModelEl.value.trim() || DEFAULT_CONFIG.DEEPSEEK_API_MODEL;
    currentConfig.DEEPSEEK_API_KEY = deepseekApiKeyEl.value.trim();
    delete currentConfig.AI_ENABLE_PRELOAD;

    chrome.storage.sync.set({ auto_mock_config: currentConfig }, () => {
      if (chrome.runtime.lastError) {
        showStatus('保存失败：' + chrome.runtime.lastError.message, true);
        return;
      }
      showStatus('配置已保存并热更新至所有页面！', false);
      broadcastConfig(currentConfig);
    });
  });

  // 导出 / 导入 / 恢复默认
  exportBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(currentConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'auto-mock-config.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showStatus('配置已导出', false);
  });

  importBtn.addEventListener('click', () => {
    importFileInput.click();
  });

  importFileInput.addEventListener('change', () => {
    const file = importFileInput.files && importFileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result || ''));
        if (!imported || typeof imported !== 'object' || Array.isArray(imported)) {
          throw new Error('配置文件根节点必须是对象');
        }
        currentConfig = { ...DEFAULT_CONFIG, ...imported };
        delete currentConfig.AI_ENABLE_PRELOAD;
        applyConfigToForm();
        showStatus('配置已导入，请点击保存生效', false);
      } catch (e) {
        showStatus('导入失败：' + e.message, true);
      } finally {
        importFileInput.value = '';
      }
    };
    reader.readAsText(file);
  });

  resetBtn.addEventListener('click', () => {
    if (!confirm('确定恢复默认配置吗？当前配置会被清除。')) return;

    chrome.storage.sync.remove('auto_mock_config', () => {
      if (chrome.runtime.lastError) {
        showStatus('重置失败：' + chrome.runtime.lastError.message, true);
        return;
      }
      currentConfig = { ...DEFAULT_CONFIG };
      applyConfigToForm();
      showStatus('已恢复默认配置', false);
      broadcastConfig(currentConfig);
    });
  });
});
