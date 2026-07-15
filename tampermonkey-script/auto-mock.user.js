// ==UserScript==
// @name         Auto Mock Test Data
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  一键填充页面Element UI表单测试数据，自带悬浮控制台
// @author       You
// @match        *://*/*
// @include      *
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @connect      api.deepseek.com
// @license      MIT
// @icon         https://ui-avatars.com/api/?name=M&background=24292e&color=fff&size=128&font-size=0.6&length=1
// ==/UserScript==

(function() {
  'use strict';

  // ==========================================
  // [用户配置区] 扩展动态配置参数
  // ==========================================
  const DEFAULT_CONFIG = {
    SHORTCUT_SPOTLIGHT: 'x',
    SHORTCUT_FILL_ALL: 'z',
    SHORTCUT_AI_TRIGGER: 's',
    AI_MANUAL_TRIGGER_MODE: true,
    AI_ENABLE_CLASSIFICATION: true,
    AI_ENABLE_PRELOAD: false,
    IGNORE_KEYWORDS: ['id', '创建', '更新', '主键', '忽略', '只读', '序号', 'id_', '_id', 'created', 'updated'],
    CUSTOM_DICTS: [],
    DATA_PROFILE: 'general',
    RANDOM_SEED: '',
    NUMBER_FILL_STRATEGY: 'normal',
    FILL_VALIDATION_MODE: 'normal',
    VALIDATE_AFTER_FILL: true,
    SITE_RULES: [],
    REMOTE_OPTION_RETRY_COUNT: 4,
    REMOTE_OPTION_RETRY_DELAY_MS: 250,
    DYNAMIC_FILL_WINDOW_MS: 8000,
    DYNAMIC_FILL_MAX_DIALOG_STEPS: 3,
    DEEPSEEK_API_URL: 'https://api.deepseek.com/v1/chat/completions',
    DEEPSEEK_API_MODEL: 'deepseek-v4-flash',
    DEEPSEEK_API_KEY: ''
  };

  let CONFIG = (typeof GM_getValue !== 'undefined') ? GM_getValue('auto_mock_config', DEFAULT_CONFIG) : DEFAULT_CONFIG;
  CONFIG = { ...DEFAULT_CONFIG, ...(CONFIG || {}) };
  let lastFillOperation = null;

  const DATA_PROFILES = {
    general: { label: '通用后台数据', code: 'GEN' },
    employee: { label: '员工档案数据', code: 'EMP' },
    enterprise: { label: '企业入驻数据', code: 'BIZ' },
    order: { label: '订单业务数据', code: 'ORD' }
  };
  const STICKY_MOCK_COMMANDS = new Set([
    'name', 'englishName', 'nickname', 'gender', 'phone', 'email', 'idcard', 'bankCard', 'password',
    'company', 'department', 'accountName', 'jobNumber', 'orderNo', 'address', 'city', 'zipCode', 'creditCode', 'licensePlate'
  ]);

  // ==========================================
  // 1. 高阶内置 Mock 数据工厂 (Mock Engine)
  // ==========================================
  const ID_CARD_REGIONS = ['110101', '310101', '440101', '350203', '440304'];
  const CREDIT_CODE_CHARS = '0123456789ABCDEFGHJKLMNPQRTUWXY';

  function randomDigitString(length) {
    let value = '';
    for (let i = 0; i < length; i++) value += Math.floor(Math.random() * 10);
    return value;
  }

  function randomBirthDateText() {
    const start = new Date(1970, 0, 1).getTime();
    const latest = new Date();
    latest.setFullYear(latest.getFullYear() - 18);
    const date = new Date(start + Math.floor(Math.random() * (latest.getTime() - start + 1)));
    return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  }

  function appendIdCardCheckDigit(body) {
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const checkCodes = '10X98765432';
    const sum = body.split('').reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
    return body + checkCodes[sum % 11];
  }

  function appendLuhnCheckDigit(body) {
    let sum = 0;
    let shouldDouble = true;
    for (let i = body.length - 1; i >= 0; i--) {
      let digit = Number(body[i]);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return body + ((10 - (sum % 10)) % 10);
  }

  function appendCreditCodeCheckDigit(body) {
    const weights = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28];
    const sum = body.split('').reduce((total, char, index) => {
      return total + CREDIT_CODE_CHARS.indexOf(char) * weights[index];
    }, 0);
    return body + CREDIT_CODE_CHARS[(31 - (sum % 31)) % 31];
  }

  const MockFactory = {
    name: () => {
      const familyNames = "赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐费廉岑薛雷贺倪汤滕殷罗毕郝邬安常乐于时傅皮卞齐康伍余元卜顾孟平黄和穆萧尹姚邵湛汪祁毛禹狄米贝明臧计伏成戴谈宋茅庞熊纪舒屈项祝董梁杜阮蓝闵席季麻强贾路娄危江童颜郭梅盛林刁钟徐邱骆高夏蔡田樊胡凌霍虞万支柯昝管卢莫经房裘缪干解应宗丁宣贲邓郁单杭洪包诸左石崔吉钮龚程嵇邢滑裴陆荣翁荀羊於惠甄曲家封芮羿储靳汲邴糜松井段富巫乌焦巴弓牧隗山谷车侯宓蓬全郗班仰秋仲伊宫宁仇栾暴甘钭厉戎祖武符刘景詹束龙叶幸司韶郜黎蓟薄印宿白怀蒲邰从鄂索咸籍赖卓蔺屠蒙池乔阴鬱胥能苍双闻莘党翟谭贡劳逄姬申扶堵冉宰郦雍卻璩桑桂濮牛寿通边扈燕冀郏浦尚农温别庄晏柴瞿阎充慕连茹习宦艾鱼容向古易慎戈廖庾终暨居衡步都耿满弘匡国文寇广禄阙东欧殳沃利蔚越夔隆师巩厍聂晁勾敖融冷訾辛阚那简饶空曾毋沙乜养鞠须丰巢关蒯相查后荆红游竺权逯盖益强贾路娄危江童颜郭梅盛林刁钟徐邱骆高夏蔡田樊胡凌霍虞万支柯昝管卢莫经房裘缪干解应宗丁宣贲邓郁单杭洪包诸左石崔吉钮龚程嵇邢滑裴陆荣翁荀羊於惠甄曲家封芮羿储靳汲邴糜松井段富巫乌焦巴弓牧隗山谷车侯宓蓬全郗班仰秋仲伊宫宁仇栾暴甘钭厉戎祖武符刘景詹束龙叶幸司韶郜黎蓟薄印宿白怀蒲邰从鄂索咸籍赖卓蔺屠蒙池乔阴鬱胥能苍双闻莘党翟谭贡劳逄姬申扶堵冉宰郦雍卻璩桑桂濮牛寿通边扈燕冀郏浦尚农温别庄晏柴瞿阎充慕连茹习宦艾鱼容向古易慎戈廖庾终暨居衡步都耿满弘匡国文寇广禄阙东欧殳沃利蔚越夔隆师巩厍聂晁勾敖融冷訾辛阚那简饶空曾毋沙乜养鞠须丰巢关蒯相查后荆红游竺权逯盖益桓公万俟司马上官欧阳夏侯诸葛闻人东方赫连皇甫尉迟公羊澹台公冶宗政濮阳淳于单于太叔申屠公孙仲孙轩辕令狐钟离宇文长孙慕容鲜于闾丘司徒司空亓官司寇仉督子车颛孙端木巫马公西漆雕乐正壤驷公良拓跋夹谷宰父谷梁晋楚阎法汝鄢涂钦段干百里东郭南门呼延归海羊舌微生岳帅缑亢况郈有琴梁丘左丘东门西门商牟佘佴伯赏南宫墨哈谯笪年爱阳佟第五言福";
      const givenNames = "伟刚勇毅俊峰强军平保东文辉力明国胜健世广志义兴良海山仁波宁贵福生龙元全国胜学祥才发武新利清飞彬富顺信子杰涛昌成康星光天达安岩中茂进林有坚和彪博诚先敬震振壮会思群豪心邦承乐绍功松善厚庆磊民友裕河哲江超浩亮政谦亨奇固之轮翰朗伯宏言若鸣朋斌梁栋维启克伦翔旭鹏泽晨辰士以建家致树炎德行时泰盛雄琛钧冠策腾楠榕风航弘秀娟英华慧巧美娜静淑惠珠翠雅芝玉萍红娥玲芬芳燕彩春菊兰凤洁梅琳素云莲真环雪荣爱妹霞香月莺媛艳瑞凡佳嘉琼勤珍贞莉桂娣叶璧璐娅琦晶妍茜秋珊莎锦黛青倩婷姣婉娴瑾颖露瑶怡婵雁蓓纨仪荷丹蓉眉君琴蕊薇菁梦岚苑婕馨瑗琰韵融园艺咏卿聪澜纯毓悦昭冰爽琬茗羽希宁欣飘育滢馥筠柔竹霭凝晓欢霄枫芸菲寒伊亚宜可姬舒影荔枝思丽";
      const getRandomChar = (str) => str.charAt(Math.floor(Math.random() * str.length));
      return getRandomChar(familyNames) + getRandomChar(givenNames) + (Math.random() > 0.5 ? getRandomChar(givenNames) : '');
    },
    phone: () => {
      const prefixes = ['138','139','150','151','152','158','159','188','187','186','185','183','182','130','131','132','155','156','133','153','180','181','189'];
      return prefixes[Math.floor(Math.random() * prefixes.length)] + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    },
    email: () => {
      const domains = ['@qq.com', '@163.com', '@gmail.com', '@jomoo.cn', '@test.com'];
      return Math.random().toString(36).substring(2, 10) + domains[Math.floor(Math.random() * domains.length)];
    },
    idcard: () => {
      const region = ID_CARD_REGIONS[Math.floor(Math.random() * ID_CARD_REGIONS.length)];
      const sequence = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
      return appendIdCardCheckDigit(region + randomBirthDateText() + sequence);
    },
    bankCard: () => {
      const totalLength = 16 + Math.floor(Math.random() * 4);
      const body = '62' + randomDigitString(totalLength - 3);
      return appendLuhnCheckDigit(body);
    },
    title: () => {
      const titles = ['总经理', '副总经理', '研发总监', '产品经理', '项目经理', '资深开发工程师', '视觉设计师', '财务专员', '人事主管', '销售代表', '渠道总监', '大区经理'];
      return titles[Math.floor(Math.random() * titles.length)];
    },
    address: () => {
      const cities = ['北京市朝阳区', '上海市浦东新区', '福建省厦门市思明区', '广东省深圳市南山区', '浙江省杭州市余杭区'];
      const streets = ['高林中路', '软件园二期', '深南大道', '世纪大道', '文三路'];
      return cities[Math.floor(Math.random() * cities.length)] + streets[Math.floor(Math.random() * streets.length)] + Math.floor(Math.random() * 999 + 1) + '号';
    },
    url: () => "https://www.example.com/" + Math.random().toString(36).substring(2, 6),
    number: () => Math.floor(Math.random() * 10000) + 1,
    randomString: () => "测试输入" + Math.floor(Math.random() * 1000),
    date: () => {
      const d = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },
    time: () => {
      const d = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    },
    text: () => {
      const texts = [
        "这是一段由自动测试工具生成的随机中文长文本备注内容，仅供占位使用。",
        "根据最新的业务需求，此处填写相关的详细描述和背景情况。",
        "测试环境下的多行文本输入测试，为了验证系统对大数据量的边界承受能力和展示效果。",
        "暂无特殊备注说明，系统默认自动生成的占位数据段落。"
      ];
      return texts[Math.floor(Math.random() * texts.length)] + Math.floor(Math.random() * 1000);
    },
    creditCode: () => {
      const region = ID_CARD_REGIONS[Math.floor(Math.random() * ID_CARD_REGIONS.length)];
      let organizationCode = '';
      for (let i = 0; i < 9; i++) {
        organizationCode += CREDIT_CODE_CHARS[Math.floor(Math.random() * CREDIT_CODE_CHARS.length)];
      }
      return appendCreditCodeCheckDigit('91' + region + organizationCode);
    },
    company: () => {
      const cities = ['北京', '上海', '广州', '深圳', '杭州', '厦门', '成都', '武汉'];
      const names = ['科技', '网络', '信息', '软件', '互动', '教育', '智能', '创投'];
      const chars = "星辰大海华夏神州创智明远腾飞卓石天瑞云翔";
      const char1 = chars.charAt(Math.floor(Math.random() * chars.length));
      const char2 = chars.charAt(Math.floor(Math.random() * chars.length));
      return cities[Math.floor(Math.random() * cities.length)] + char1 + char2 + names[Math.floor(Math.random() * names.length)] + '有限公司';
    },
    licensePlate: () => {
      const provs = ['京','沪','粤','闽','浙','苏','川','鲁'];
      const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      const nums = '0123456789';
      let p = provs[Math.floor(Math.random() * provs.length)] + letters.charAt(Math.floor(Math.random() * letters.length));
      for(let i=0; i<5; i++) p += (Math.random()>0.5 ? letters.charAt(Math.floor(Math.random() * letters.length)) : nums.charAt(Math.floor(Math.random() * nums.length)));
      return p;
    },
    zipCode: () => {
      return Math.floor(Math.random() * 900000 + 100000).toString();
    },
    ipv4: () => {
      return `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
    },
    mac: () => {
      return "XX:XX:XX:XX:XX:XX".replace(/X/g, () => "0123456789ABCDEF".charAt(Math.floor(Math.random() * 16)));
    },
    password: () => {
      const lower = "abcdefghijklmnopqrstuvwxyz";
      const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const num = "0123456789";
      const special = "!@#$%^&*";
      let pwd = lower.charAt(Math.floor(Math.random()*lower.length)) + upper.charAt(Math.floor(Math.random()*upper.length)) + num.charAt(Math.floor(Math.random()*num.length)) + special.charAt(Math.floor(Math.random()*special.length));
      for(let i=0; i<6; i++) {
        const all = lower + upper + num + special;
        pwd += all.charAt(Math.floor(Math.random()*all.length));
      }
      return pwd.split('').sort(() => Math.random() - 0.5).join('');
    },
    englishName: () => {
      const firsts = ['James','John','Robert','Michael','William','David','Richard','Mary','Patricia','Linda','Barbara','Elizabeth','Jennifer'];
      const lasts = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez'];
      return firsts[Math.floor(Math.random() * firsts.length)] + ' ' + lasts[Math.floor(Math.random() * lasts.length)];
    },
    gender: () => (Math.random() > 0.5 ? '男' : '女'),
    nickname: () => {
      const prefixes = ['测试', '演示', '体验', '样例', '模拟'];
      return prefixes[Math.floor(Math.random() * prefixes.length)] + '用户' + Math.floor(Math.random() * 9000 + 1000);
    },
    department: () => {
      const departments = ['总经办', '研发部', '产品部', '市场部', '销售部', '财务部', '人事部', '运营部', '采购部', '客服部'];
      return departments[Math.floor(Math.random() * departments.length)];
    },
    accountName: () => {
      const prefixes = ['test', 'demo', 'user', 'mock', 'auto'];
      return prefixes[Math.floor(Math.random() * prefixes.length)] + '_' + Math.random().toString(36).substring(2, 8);
    },
    jobNumber: () => 'EMP' + Math.floor(Math.random() * 900000 + 100000),
    orderNo: () => {
      const d = new Date();
      const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}`;
      return 'ORD' + stamp + Math.floor(Math.random() * 900 + 100);
    },
    percentage: () => (Math.random() * 100).toFixed(2) + '%',
    city: () => {
      const cities = ['北京市', '上海市', '广州市', '深圳市', '杭州市', '厦门市', '成都市', '武汉市'];
      return cities[Math.floor(Math.random() * cities.length)];
    },
    age: () => Math.floor(Math.random() * 43) + 18,
    amount: () => (Math.random() * 9999).toFixed(2),
    color: () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
    dateTime: () => {
      const d = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    }
  };

  function hashSeed(seedText) {
    let hash = 2166136261;
    for (let i = 0; i < seedText.length; i++) {
      hash ^= seedText.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0 || 1;
  }

  function createSeededRandom(seedText) {
    let state = hashSeed(seedText);
    return () => {
      state += 0x6D2B79F5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function getSessionRandom(session) {
    return session && typeof session.random === 'function' ? session.random : Math.random;
  }

  function pickSessionValue(values, session) {
    if (!Array.isArray(values) || values.length === 0) return undefined;
    return values[Math.floor(getSessionRandom(session)() * values.length)];
  }

  function createMockSession() {
    const seed = String(CONFIG.RANDOM_SEED || '').trim();
    const profileKey = DATA_PROFILES[CONFIG.DATA_PROFILE] ? CONFIG.DATA_PROFILE : 'general';
    const random = seed ? createSeededRandom(seed) : Math.random;
    const baseDate = seed
      ? new Date(Date.UTC(2024, 0, 1) + Math.floor(random() * 63072000000))
      : new Date();
    return {
      values: new Map(),
      commandValues: new Map(),
      profileKey,
      profile: DATA_PROFILES[profileKey],
      seed,
      random,
      baseDate,
      boundaryIndex: 0,
      handledFieldElements: new WeakSet(),
      handledDialogRoots: new WeakSet(),
      dialogStep: 0,
      dynamicFillInProgress: false
    };
  }

  function cloneSnapshotValue(value) {
    if (Array.isArray(value)) return value.slice();
    if (value instanceof Date) return new Date(value.getTime());
    return value;
  }

  function readVueFieldValue(vueInstance) {
    if (!vueInstance) return { exists: false };
    const candidates = [
      vueInstance.modelValue,
      vueInstance.value,
      vueInstance.$props && vueInstance.$props.modelValue,
      vueInstance.$props && vueInstance.$props.value
    ];
    for (let i = 0; i < candidates.length; i++) {
      if (candidates[i] !== undefined) return { exists: true, value: cloneSnapshotValue(candidates[i]) };
    }
    return { exists: false };
  }

  function captureFieldSnapshot(inputEl) {
    if (!inputEl || !inputEl.isConnected) return null;
    const vueInstance = getVueInstance(inputEl);
    const snapshot = {
      inputEl,
      label: getLabelForInput(inputEl, vueInstance) || '未命名字段',
      kind: getFieldKind(inputEl),
      vueValue: readVueFieldValue(vueInstance)
    };
    if (inputEl.isContentEditable) snapshot.content = inputEl.textContent || '';
    else if (inputEl.tagName === 'SELECT' && inputEl.multiple) snapshot.selectedValues = Array.from(inputEl.selectedOptions || []).map(option => option.value);
    else if (inputEl.type === 'radio' && inputEl.name) {
      snapshot.radioStates = Array.from(document.getElementsByName(inputEl.name))
        .filter(input => input.type === 'radio')
        .map(input => ({ input, checked: input.checked }));
    } else if (inputEl.type === 'checkbox') snapshot.checked = inputEl.checked;
    else snapshot.value = inputEl.value;
    return snapshot;
  }

  function restoreFieldSnapshot(snapshot) {
    if (!snapshot || !snapshot.inputEl || !snapshot.inputEl.isConnected) return false;
    const inputEl = snapshot.inputEl;
    const vueInstance = getVueInstance(inputEl);
    if (snapshot.vueValue && snapshot.vueValue.exists && emitComponentValue(vueInstance, snapshot.vueValue.value)) return true;
    if (inputEl.isContentEditable) {
      inputEl.textContent = snapshot.content || '';
      dispatchFieldEvents(inputEl);
      return true;
    }
    if (Array.isArray(snapshot.selectedValues)) {
      Array.from(inputEl.options || []).forEach(option => setNativeProperty(option, 'selected', snapshot.selectedValues.includes(option.value)));
      dispatchFieldEvents(inputEl);
      return true;
    }
    if (Array.isArray(snapshot.radioStates)) {
      snapshot.radioStates.forEach(item => {
        if (item.input && item.input.isConnected) setNativeProperty(item.input, 'checked', item.checked);
      });
      dispatchFieldEvents(inputEl);
      return true;
    }
    if (typeof snapshot.checked === 'boolean') {
      setNativeProperty(inputEl, 'checked', snapshot.checked);
      dispatchFieldEvents(inputEl);
      return true;
    }
    if (!setNativeProperty(inputEl, 'value', snapshot.value == null ? '' : snapshot.value)) return false;
    dispatchFieldEvents(inputEl);
    return true;
  }

  function createFillOperation(source) {
    return { source, createdAt: Date.now(), snapshots: [], filled: 0, skipped: 0, failed: 0 };
  }

  function recordOperationSnapshot(operation, snapshot, outcome) {
    if (!operation || !snapshot || !outcome) return;
    if (outcome.status === 'filled') {
      if (operation.snapshots.length < 500) operation.snapshots.push(snapshot);
      operation.filled++;
    } else operation.skipped++;
  }

  function withSessionRandom(session, callback) {
    if (!session || !session.seed) return callback();
    const originalRandom = Math.random;
    try {
      // MockFactory is synchronous, so a temporary source keeps existing generators deterministic.
      Math.random = session.random;
    } catch (error) {
      return callback();
    }
    try {
      return callback();
    } finally {
      try { Math.random = originalRandom; } catch (error) {}
    }
  }

  function getProfileSerial(session) {
    if (session.profileSerial) return session.profileSerial;
    session.profileSerial = String(Math.floor(getSessionRandom(session)() * 900000) + 100000);
    return session.profileSerial;
  }

  function getProfileCity(session) {
    if (session.profileCity) return session.profileCity;
    session.profileCity = pickSessionValue(['北京', '上海', '深圳', '杭州', '厦门'], session);
    return session.profileCity;
  }

  function buildProfileMockValue(command, session) {
    const profileKey = session && session.profileKey ? session.profileKey : 'general';
    if (profileKey === 'general') return undefined;

    const serial = getProfileSerial(session);
    const city = getProfileCity(session);
    if (command === 'city') return `${city}市`;
    if (profileKey === 'employee') {
      const values = {
        company: `${city}测试科技有限公司`,
        department: pickSessionValue(['研发部', '产品部', '运营部', '市场部'], session),
        title: pickSessionValue(['测试工程师', '产品专员', '运营专员'], session),
        accountName: `employee_${serial}`,
        jobNumber: `EMP${serial}`,
        email: `employee_${serial}@test.example.com`,
        text: `员工档案测试数据，编号 EMP${serial}，用于验证录入、审核和查询流程。`
      };
      return values[command];
    }
    if (profileKey === 'enterprise') {
      const values = {
        company: `${city}星航测试科技有限公司`,
        accountName: `biz_${serial}`,
        email: `contact_${serial}@test.example.com`,
        address: `${city}市高新区测试大道${serial.slice(-3)}号`,
        text: `企业入驻测试资料，统一编号 BIZ${serial}，用于验证资质、联系人和开户地址字段。`
      };
      return values[command];
    }
    if (profileKey === 'order') {
      const values = {
        orderNo: `ORD${serial}${serial.slice(-3)}`,
        accountName: `buyer_${serial}`,
        email: `buyer_${serial}@test.example.com`,
        address: `${city}市测试路${serial.slice(-3)}号`,
        amount: (Number(serial.slice(-4)) / 10).toFixed(2),
        text: `订单测试备注，订单编号 ORD${serial}${serial.slice(-3)}，用于验证下单和履约流程。`
      };
      return values[command];
    }
    return undefined;
  }

  function buildSessionTemporalValue(command, session) {
    if (!session || !session.seed || !session.baseDate) return undefined;
    const date = new Date(session.baseDate);
    const pad = value => String(value).padStart(2, '0');
    if (command === 'date') return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    if (command === 'time') return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    if (command === 'dateTime') return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    if (command === 'orderNo') {
      const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
      return `ORD${stamp}${Math.floor(getSessionRandom(session)() * 900 + 100)}`;
    }
    return undefined;
  }

  function generateMockValue(command, session) {
    if (!command || !MockFactory[command]) return withSessionRandom(session, () => MockFactory.randomString());
    if (session && STICKY_MOCK_COMMANDS.has(command) && session.commandValues.has(command)) {
      return session.commandValues.get(command);
    }

    const profileValue = buildProfileMockValue(command, session);
    const temporalValue = buildSessionTemporalValue(command, session);
    const value = profileValue !== undefined
      ? profileValue
      : temporalValue !== undefined
        ? temporalValue
        : withSessionRandom(session, () => MockFactory[command]());
    if (session && STICKY_MOCK_COMMANDS.has(command)) session.commandValues.set(command, value);
    return value;
  }

  function normalizeStringList(value) {
    const source = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
    return source.map(item => String(item || '').trim()).filter(Boolean).slice(0, 100);
  }

  function normalizeSiteRule(rule) {
    if (!rule || typeof rule !== 'object') return null;
    const hosts = normalizeStringList(rule.hosts || rule.host);
    if (!hosts.length) return null;
    const fieldAliases = {};
    if (rule.fieldAliases && typeof rule.fieldAliases === 'object' && !Array.isArray(rule.fieldAliases)) {
      Object.entries(rule.fieldAliases).slice(0, 100).forEach(([pattern, label]) => {
        const normalizedPattern = String(pattern || '').trim();
        const normalizedLabel = String(label || '').trim();
        if (!normalizedPattern || !normalizedLabel) return;
        try {
          new RegExp(normalizedPattern, 'i');
          fieldAliases[normalizedPattern] = normalizedLabel;
        } catch (error) {}
      });
    }
    return {
      name: String(rule.name || hosts[0]).trim().slice(0, 80),
      hosts: hosts.map(host => host.toLowerCase()),
      fieldAliases,
      ignoreKeywords: normalizeStringList(rule.ignoreKeywords),
      optionSkipKeywords: normalizeStringList(rule.optionSkipKeywords),
      inputSelectors: normalizeStringList(rule.inputSelectors),
      dialogSelectors: normalizeStringList(rule.dialogSelectors)
    };
  }

  function normalizeSiteRules(rules) {
    if (!Array.isArray(rules)) return [];
    return rules.map(normalizeSiteRule).filter(Boolean).slice(0, 50);
  }

  function parseSiteRulesText(text) {
    const parsed = JSON.parse(String(text || '[]'));
    if (!Array.isArray(parsed)) throw new Error('站点规则必须是 JSON 数组');
    return normalizeSiteRules(parsed);
  }

  function isHostMatched(host, pattern) {
    const normalizedHost = String(host || '').toLowerCase();
    const normalizedPattern = String(pattern || '').toLowerCase().trim();
    if (!normalizedHost || !normalizedPattern) return false;
    if (normalizedPattern.startsWith('*.')) {
      const suffix = normalizedPattern.slice(2);
      return normalizedHost === suffix || normalizedHost.endsWith(`.${suffix}`);
    }
    return normalizedHost === normalizedPattern;
  }

  function getActiveSiteRule() {
    const host = typeof window !== 'undefined' && window.location ? window.location.hostname : '';
    const rules = normalizeSiteRules(CONFIG.SITE_RULES);
    return rules.find(rule => rule.hosts.some(pattern => isHostMatched(host, pattern))) || null;
  }

  function getRuleStringList(key) {
    const rule = getActiveSiteRule();
    return rule && Array.isArray(rule[key]) ? rule[key] : [];
  }

  function getEffectiveInputSelectors() {
    return [...FIELD_INPUT_SELECTORS, ...getRuleStringList('inputSelectors')];
  }

  function getEffectiveDialogSelectors() {
    return [...ACTIVE_DIALOG_SELECTORS, ...getRuleStringList('dialogSelectors')];
  }

  function queryAllBySelectors(root, selectors) {
    const queryRoot = root && typeof root.querySelectorAll === 'function' ? root : document;
    const seen = new Set();
    const elements = [];
    selectors.forEach(selector => {
      try {
        queryRoot.querySelectorAll(selector).forEach(element => {
          if (seen.has(element)) return;
          seen.add(element);
          elements.push(element);
        });
      } catch (error) {}
    });
    return elements;
  }

  function getEffectiveIgnoreKeywords() {
    return [...(CONFIG.IGNORE_KEYWORDS || DEFAULT_CONFIG.IGNORE_KEYWORDS), ...getRuleStringList('ignoreKeywords')];
  }

  function getEffectiveOptionSkipKeywords() {
    return [...SELECT_SKIP_KEYWORDS, ...getRuleStringList('optionSkipKeywords')];
  }

  function applySiteFieldAlias(labelText) {
    const rule = getActiveSiteRule();
    if (!rule || !rule.fieldAliases) return labelText;
    const label = String(labelText || '').trim();
    for (const [pattern, alias] of Object.entries(rule.fieldAliases)) {
      try {
        if (new RegExp(pattern, 'i').test(label)) return alias;
      } catch (error) {}
    }
    return label;
  }

  const BUILTIN_MOCK_GROUPS = [
    {
      title: '👤 个人信息',
      items: [
        { label: '人名', cmd: 'name', hints: '姓名、联系人、负责人、收件人', patterns: [/姓名|名字|联系人|负责人|收件人|持卡人|真实姓名|法人|客户名/, /\bname\b/, /real.?name/, /full.?name/] },
        { label: '英文名', cmd: 'englishName', hints: '英文姓名、英文联系人', patterns: [/英文名|英文姓名/, /\benglish\b/, /english.?name/] },
        { label: '性别', cmd: 'gender', hints: '性别、男女、先生女士', patterns: [/性别|男女|先生|女士|称谓/, /\bgender\b/] },
        { label: '昵称', cmd: 'nickname', hints: '昵称、花名、显示名', patterns: [/昵称|花名|别名|显示名/, /\bnick\b/] },
        { label: '身份证', cmd: 'idcard', hints: '身份证、证件号', patterns: [/身份证|证件号|身份号码/, /\bidcard\b/, /id_card/] },
        { label: '年龄', cmd: 'age', hints: '年龄、岁数', patterns: [/年龄|岁数/, /\bage\b/] },
        { label: '手机号', cmd: 'phone', hints: '手机号、联系电话、手机号码', patterns: [/手机|电话|联系方式|联系号码|手机号/, /\bphone\b/, /\bmobile\b/, /\btel\b/] },
        { label: '邮箱', cmd: 'email', hints: '邮箱、电子邮件', patterns: [/邮箱|邮件/, /\bemail\b/, /e-mail/, /\bmail\b/] }
      ]
    },
    {
      title: '🏢 企业与业务',
      items: [
        { label: '企业名称', cmd: 'company', hints: '公司、企业、单位、商户', patterns: [/公司|企业|单位|商户|厂商|供应商/, /\bcompany\b/] },
        { label: '信用代码', cmd: 'creditCode', hints: '统一社会信用代码、企业代码', patterns: [/信用代码|统一社会信用代码|企业代码/, /\bcredit\b/] },
        { label: '职务头衔', cmd: 'title', hints: '职务、岗位、职位、头衔', patterns: [/头衔|职务|岗位|职位|职称/, /\btitle\b/, /\bposition\b/, /\bjob\b/] },
        { label: '部门名称', cmd: 'department', hints: '部门、科室、事业部、小组', patterns: [/部门|科室|中心|事业部|小组/, /\bdepartment\b/] },
        { label: '账号名称', cmd: 'accountName', hints: '账号、账户、用户名、登录名', patterns: [/账号|账户|用户名|登录名/, /\baccount\b/, /\blogin\b/, /user(?:name)?/] },
        { label: '工号编号', cmd: 'jobNumber', hints: '工号、员工号、人员编号、学号', patterns: [/工号|员工号|员工编号|人员编号|学号/, /jobno/, /job_no/, /employee_no/] },
        { label: '订单编号', cmd: 'orderNo', hints: '订单号、单号、流水号、运单号', patterns: [/订单号|订单编号|单号|流水号|运单号/, /\border\b/, /\bserial\b/] },
        { label: '车牌号', cmd: 'licensePlate', hints: '车牌、车牌号', patterns: [/车牌/, /license_plate/] },
        { label: '银行卡', cmd: 'bankCard', hints: '银行卡、卡号', patterns: [/银行卡|卡号/, /bankcard/, /bank_card/] },
        { label: '金额数值', cmd: 'amount', hints: '金额、费用、价款、钱', patterns: [/金额|价税合计|价款|费用|货款|钱|元/, /\bamount\b/, /\bmoney\b/] },
        { label: '百分比', cmd: 'percentage', hints: '比例、百分比、税率、折扣', patterns: [/比例|百分比|占比|税率|折扣/, /\bpercent\b/, /\brate\b/] }
      ]
    },
    {
      title: '🌐 网络与位置',
      items: [
        { label: '详细地址', cmd: 'address', hints: '联系地址、收货地址、住址', patterns: [/详细地址|联系地址|开户地址|收货地址|住址|通讯地址/, /\baddress\b/] },
        { label: '所在城市', cmd: 'city', hints: '城市、地区、归属地、省市', patterns: [/城市|地区|区域|归属地|省市/, /\bcity\b/, /\bregion\b/, /\blocation\b/] },
        { label: '邮政编码', cmd: 'zipCode', hints: '邮编、邮政编码', patterns: [/邮编|邮政编码/, /\bzipcode\b/, /\bpostal\b/] },
        { label: 'IP地址', cmd: 'ipv4', hints: 'IP 地址、内网地址', patterns: [/ip地址/, /\bipv4\b/, /ip_/] },
        { label: 'MAC地址', cmd: 'mac', hints: 'MAC 地址、物理地址', patterns: [/\bmac\b/, /物理地址/] },
        { label: '随机链接', cmd: 'url', hints: '网址、链接、主页', patterns: [/网址|链接|主页/, /\burl\b/, /\bwebsite\b/, /\blink\b/] },
        { label: '强密码', cmd: 'password', hints: '密码、登录密码', patterns: [/密码/, /\bpassword\b/, /\bpwd\b/] }
      ]
    },
    {
      title: '📝 日期与文本',
      items: [
        { label: '日期', cmd: 'date', hints: '日期、生日、生效日期', patterns: [/日期|生日|生效日期|到期日期/, /\bdate\b/] },
        { label: '时间', cmd: 'time', hints: '时间、时刻', patterns: [/时间|时刻/, /\btime\b/] },
        { label: '日期时间', cmd: 'dateTime', hints: '日期时间、开始时间、结束时间', patterns: [/日期时间|时间戳|开始时间|结束时间|创建时间|更新时间/, /\bdatetime\b/] },
        { label: '随机数字', cmd: 'number', hints: '数字、数量、库存、价格', patterns: [/数字|数量|库存|总数|价格/, /\bnum\b/, /\bcount\b/, /\bprice\b/] },
        { label: '颜色值', cmd: 'color', hints: '颜色、色值', patterns: [/颜色|色值/, /\bcolor\b/] },
        { label: '简短文本', cmd: 'randomString', hints: '标题、简称、主题、标签', patterns: [/简称|标题|主题|短描述|标签|摘要|关键字/, /short.?text/] },
        { label: '长文本段落', cmd: 'text', hints: '描述、备注、详情、内容、说明', patterns: [/文本|描述|备注|详情|内容|说明|原因|留言/, /\btext\b/, /\bdesc\b/, /\bcontent\b/, /\bremark\b/] }
      ]
    }
  ];

  const BUILTIN_MOCK_ITEMS = BUILTIN_MOCK_GROUPS.reduce((list, group) => {
    group.items.forEach(item => list.push({ ...item, groupTitle: group.title }));
    return list;
  }, []);

  function getBuiltInMockGroups() {
    return BUILTIN_MOCK_GROUPS.map(group => ({
      title: group.title,
      items: group.items.map(item => ({ label: item.label, cmd: item.cmd }))
    }));
  }

  function getBuiltInMockItem(cmd) {
    for (let i = 0; i < BUILTIN_MOCK_ITEMS.length; i++) {
      if (BUILTIN_MOCK_ITEMS[i].cmd === cmd) return BUILTIN_MOCK_ITEMS[i];
    }
    return null;
  }

  function getDisplayItemByCommand(cmd) {
    if (!cmd) return null;
    if (cmd.startsWith('__custom_')) {
      const idx = parseInt(cmd.replace('__custom_', ''), 10);
      const dict = CONFIG.CUSTOM_DICTS[idx];
      return dict ? { label: dict.label || ('自定义项' + (idx + 1)), cmd } : null;
    }
    if (cmd === '__hook_default') return { label: '推荐操作', cmd };
    const builtInItem = getBuiltInMockItem(cmd);
    return builtInItem ? { label: builtInItem.label, cmd: builtInItem.cmd } : null;
  }

  function predictMockTypes(label, limit = 3) {
    const labelText = String(label == null ? '' : label).trim();
    const labelLower = labelText.toLowerCase();
    const predictions = [];

    if (CONFIG.CUSTOM_DICTS && CONFIG.CUSTOM_DICTS.length > 0) {
      for (let i = 0; i < CONFIG.CUSTOM_DICTS.length; i++) {
        const dict = CONFIG.CUSTOM_DICTS[i];
        if (!dict || !dict.regex) continue;
        try {
          if (new RegExp(dict.regex, 'i').test(labelLower)) {
            predictions.push({ cmd: '__custom_' + i, name: dict.label || '自定义值', score: 1000 - i });
          }
        } catch (e) {
          console.error("Auto Mock Regex Error:", e);
        }
      }
    }

    BUILTIN_MOCK_ITEMS.forEach((item, index) => {
      let score = 0;
      item.patterns.forEach(pattern => {
        if (pattern.test(labelLower)) score += 10;
      });
      if (score > 0) {
        predictions.push({ cmd: item.cmd, name: item.label, score, index });
      }
    });

    predictions.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.index || 0) - (b.index || 0);
    });

    const deduped = [];
    predictions.forEach(item => {
      if (deduped.some(existing => existing.cmd === item.cmd)) return;
      deduped.push({ cmd: item.cmd, name: item.name });
    });
    return deduped.slice(0, limit);
  }

  const predictMockType = (label) => predictMockTypes(label, 1)[0] || null;

  const resolveMockType = (label, session) => {
    const prediction = predictMockType(label);
    if (prediction && prediction.cmd) {
      if (prediction.cmd.startsWith('__custom_')) {
        const idx = parseInt(prediction.cmd.replace('__custom_', ''), 10);
        const dict = CONFIG.CUSTOM_DICTS[idx];
        if (dict && dict.values && dict.values.length > 0) return pickSessionValue(dict.values, session);
      } else if (MockFactory[prediction.cmd]) {
        return generateMockValue(prediction.cmd, session);
      }
    }
    return generateMockValue('randomString', session);
  };

  // ==========================================
  // 3. 业务组件自定义挂载钩子 (Custom Component Hooks)
  // ==========================================
  const CustomHooks = {
    ElSelect: (vueInstance, labelText, session) => {
      if (vueInstance.options && vueInstance.options.length > 0) {
        const validOptions = vueInstance.options.filter(opt => !opt.disabled);
        if (validOptions.length > 0) {
          const randomOpt = pickSessionValue(validOptions, session);
          return emitComponentValue(vueInstance, randomOpt.value);
        }
      }
      return false;
    },
    ElDatePicker: (vueInstance, labelText, session) => {
      return emitComponentValue(vueInstance, buildDatePickerValue(vueInstance, labelText, session));
    },
    ElTimePicker: (vueInstance, labelText, session) => {
      return emitComponentValue(vueInstance, buildDatePickerValue(vueInstance, labelText, session));
    },
    ElSwitch: (vueInstance) => {
      return emitComponentValue(vueInstance, true);
    },
    ElRadioGroup: (vueInstance, labelText, session) => {
      if (vueInstance.$children) {
        const children = vueInstance.$children.filter(c => c.$options.name === 'ElRadio' && !c.disabled);
        if (children.length > 0) {
          const randomOpt = pickSessionValue(children, session);
          return emitComponentValue(vueInstance, randomOpt.label);
        }
      }
      return false;
    }
  };

  const LocalHookDisplayNames = {
    ElSelect: '推荐选项',
    ElRadioGroup: '推荐选项',
    ElDatePicker: '当前日期',
    ElTimePicker: '当前时间',
    ElSwitch: '开启状态'
  };

  function getAiShortcutText() {
    return `Alt+${(CONFIG.SHORTCUT_AI_TRIGGER || 's').toUpperCase()}`;
  }

  function isAiSuggestionComponent(componentName) {
    return componentName === 'ElSelect' || componentName === 'ElRadioGroup';
  }

  function isLocalOnlyHookComponent(componentName) {
    return componentName === 'ElDatePicker' || componentName === 'ElTimePicker' || componentName === 'ElSwitch';
  }

  function createHookFillAction(vueInstance, componentName, labelText) {
    if (!CustomHooks[componentName]) return null;
    return (session) => CustomHooks[componentName](vueInstance, labelText, session);
  }

  function normalizeCandidateText(value) {
    return String(value == null ? '' : value)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[：:，,。、“”"'`（）()【】\[\]{}<>]/g, '');
  }

  function getCandidateOptions(vueInstance, componentName) {
    if (!vueInstance) return [];

    if (componentName === 'ElSelect' && Array.isArray(vueInstance.options)) {
      return vueInstance.options
        .filter(opt => opt && !opt.disabled)
        .map(opt => ({
          label: String(opt.currentLabel || opt.label || opt.value || '').trim(),
          value: opt.value,
          apply: () => emitComponentValue(vueInstance, opt.value)
        }))
        .filter(opt => opt.label);
    }

    if (componentName === 'ElRadioGroup' && Array.isArray(vueInstance.$children)) {
      return vueInstance.$children
        .filter(child => child && child.$options && child.$options.name === 'ElRadio' && !child.disabled)
        .map(child => ({
          label: String(child.label == null ? '' : child.label).trim(),
          value: child.label,
          apply: () => emitComponentValue(vueInstance, child.label)
        }))
        .filter(opt => opt.label);
    }

    return [];
  }

  function getAiRecommendationPrompt(context) {
    const lines = [];
    const labelText = String(context && context.labelText ? context.labelText : '').trim();
    lines.push(`字段名：${labelText || '未识别'}`);
    if (context && context.componentName) lines.push(`组件类型：${context.componentName}`);

    if (context && context.hookAction) {
      lines.push(`组件推荐：__hook_default|${context.localHookName}|优先使用当前组件的内置可用操作`);
    }

    const builtInChoices = BUILTIN_MOCK_ITEMS.map(item => `${item.cmd}|${item.label}|${item.hints}`).join('\n');
    lines.push('可选类目：');
    lines.push(builtInChoices);

    if (CONFIG.CUSTOM_DICTS && CONFIG.CUSTOM_DICTS.length > 0) {
      const customChoices = CONFIG.CUSTOM_DICTS.map((dict, index) => `__custom_${index}|${dict.label || ('自定义项' + (index + 1))}|${dict.regex || '自定义规则'}`).join('\n');
      lines.push('自定义类目：');
      lines.push(customChoices);
    }

    if (context && context.supportsAiSuggestion) {
      const options = getCandidateOptions(context.vueInstance, context.componentName);
      if (options.length > 0) {
        lines.push(`当前候选项：${options.slice(0, 20).map(opt => opt.label).join('、')}`);
      }
    }

    lines.push('请从以上类目中选择最适合当前字段的 1 到 3 个 cmd，按优先级返回，仅返回 JSON 数组，例如 ["name","phone"]。');
    return lines.join('\n');
  }

  function getAiRecommendationSystemPrompt() {
    return [
      "你是一个企业后台表单字段类目推荐助手。",
      "你的任务不是生成填充值，而是从给定类目列表中挑选最适合当前字段的内部 cmd。",
      "必须只从提供的 cmd 中选择，不能编造新 cmd。",
      "最多返回 3 个 cmd，按最匹配到次匹配排序。",
      "只返回 JSON 数组，不要解释，不要 Markdown，不要额外文本。"
    ].join('');
  }

  function parseAiRecommendationResult(rawText) {
    if (typeof rawText !== 'string' || !rawText.trim()) {
      return { error: 'AI 未返回推荐类目' };
    }

    let parsed;
    const text = rawText.trim();
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (nestedError) {
          return { error: 'AI 返回内容无法解析为类目数组' };
        }
      } else {
        parsed = text
          .split(/[\n,，]/)
          .map(item => item.replace(/["'\s]/g, '').trim())
          .filter(Boolean);
      }
    }

    if (!Array.isArray(parsed)) {
      return { error: 'AI 返回内容不是类目数组' };
    }

    const validCmds = [];
    parsed.forEach(item => {
      const cmd = String(item == null ? '' : item).trim();
      if (!cmd || validCmds.includes(cmd)) return;
      if (getDisplayItemByCommand(cmd)) validCmds.push(cmd);
    });

    if (validCmds.length === 0) {
      return { error: 'AI 返回的类目均无效' };
    }
    return { value: validCmds.slice(0, 3) };
  }

  // === DeepSeek 通信核心 ===
  const AI_REQUEST_TIMEOUT_MS = 15000;
  const DEEPSEEK_CACHE_LIMIT = 100;
  const deepseekCache = new Map();
  const deepseekPendingRequests = new Map();

  function cacheDeepSeekResult(promptKey, value) {
    if (deepseekCache.has(promptKey)) deepseekCache.delete(promptKey);
    deepseekCache.set(promptKey, value);
    while (deepseekCache.size > DEEPSEEK_CACHE_LIMIT) {
      const oldestKey = deepseekCache.keys().next().value;
      deepseekCache.delete(oldestKey);
    }
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

  function askDeepSeek(label, promptText, systemPrompt) {
    return new Promise((resolve) => {
      let settled = false;
      const settle = (value) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };

      if (!CONFIG.DEEPSEEK_API_KEY) return settle(null);
      if (typeof GM_xmlhttpRequest === 'undefined') {
        console.error("[AutoMock AI] 当前环境不支持 GM_xmlhttpRequest，无法发起跨域大模型请求。");
        return settle({ error: "由于环境限制 (非原生油猴)，无法发起跨域请求。" });
      }
      const promptKey = promptText || label;
      if (deepseekCache.has(promptKey)) return settle(deepseekCache.get(promptKey));
      
      const requestUrl = CONFIG.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
      const requestBody = {
        model: CONFIG.DEEPSEEK_API_MODEL || "deepseek-v4-flash",
        messages: [
          { role: "system", content: systemPrompt || getAiRecommendationSystemPrompt() },
          { role: "user", content: `字段名：${promptKey}` }
        ],
        temperature: 0.1,
        max_tokens: 200
      };
      if (isOfficialDeepSeekApi(requestUrl)) {
        requestBody.thinking = { type: "disabled" };
      }

      try {
        GM_xmlhttpRequest({
          method: 'POST',
          url: requestUrl,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.DEEPSEEK_API_KEY}`
          },
          data: JSON.stringify(requestBody),
          timeout: AI_REQUEST_TIMEOUT_MS,
          onload: function(res) {
            if (res.status < 200 || res.status >= 300) {
              console.error("[AutoMock AI] API Error:", res.status, res.responseText);
              let errMsg = `HTTP ${res.status}`;
              if (res.responseText) {
                try {
                  const errData = JSON.parse(res.responseText);
                  if (errData.error && errData.error.message) errMsg += ": " + errData.error.message;
                } catch(e) {}
              }
              return settle({ error: errMsg });
            }
            if (!res.responseText) {
              console.error("DeepSeek Empty Response");
              return settle({ error: "服务器返回了空内容" });
            }
            try {
              const data = JSON.parse(res.responseText);
              const extracted = extractDeepSeekResult(data);
              if (extracted.value) {
                cacheDeepSeekResult(promptKey, extracted.value);
                settle(extracted.value);
              } else {
                console.error("[AutoMock AI] 可填结果为空:", extracted.error, data);
                settle({ error: extracted.error });
              }
            } catch(e) {
              console.error("[AutoMock AI] 解析响应失败:", e, res.responseText);
              settle({ error: "解析JSON异常: " + String(e) });
            }
          },
          onerror: function(err) {
            console.error("[AutoMock AI] 网络请求失败:", err);
            settle({ error: "网络请求失败，可能是跨域或服务无法访问" });
          },
          ontimeout: function() {
            console.error(`[AutoMock AI] 请求超时 (${AI_REQUEST_TIMEOUT_MS}ms)`);
            settle({ error: "AI 请求超时，请稍后重试" });
          },
          onabort: function() {
            settle({ error: "AI 请求已取消" });
          }
        });
      } catch (error) {
        console.error("[AutoMock AI] 请求初始化失败:", error);
        settle({ error: "AI 请求初始化失败: " + String(error) });
      }
    });
  }

  function getCachedAiRecommendationResult(promptKey) {
    if (!promptKey || !deepseekCache.has(promptKey)) return null;
    const cachedText = deepseekCache.get(promptKey);
    if (!cachedText || (cachedText && cachedText.error)) return null;
    const parsed = parseAiRecommendationResult(cachedText);
    return parsed.error ? null : parsed.value;
  }

  function requestAiRecommendation(promptKey, labelText, systemPrompt) {
    if (!promptKey || !CONFIG.DEEPSEEK_API_KEY || CONFIG.AI_ENABLE_CLASSIFICATION === false) return Promise.resolve([]);

    const cachedResult = getCachedAiRecommendationResult(promptKey);
    if (cachedResult) {
      return Promise.resolve(cachedResult);
    }

    if (deepseekPendingRequests.has(promptKey)) {
      return deepseekPendingRequests.get(promptKey);
    }

    const requestPromise = askDeepSeek(labelText, promptKey, systemPrompt)
      .then((aiResult) => {
        if (!aiResult || (aiResult && aiResult.error)) {
          return [];
        }

        const parsed = parseAiRecommendationResult(aiResult);
        if (parsed.error) {
          return [];
        }
        return parsed.value;
      })
      .finally(() => {
        deepseekPendingRequests.delete(promptKey);
      });

    deepseekPendingRequests.set(promptKey, requestPromise);
    return requestPromise;
  }

  // ==========================================
  // 3. 字段上下文与直达填入
  // ==========================================
  let spotlightTargetElement = null;
  let latestInteractionTarget = null;
  let spotlightPreloadTimer = null;
  let latestPreloadPromptKey = '';
  let latestPreloadTriggerType = '';
  let deferredDialogObserver = null;
  let deferredDialogTimer = null;
  let deferredDialogDebounce = null;

  const FIELD_CONTAINER_SELECTORS = [
    '.el-input', '.el-textarea', '.el-select', '.el-date-editor', '.el-cascader', '.el-radio-group', '.el-checkbox-group', '.el-switch', '.el-form-item',
    '.el-select-v2', '.el-tree-select',
    '.ant-input', '.ant-select', '.ant-picker', '.ant-cascader', '.ant-radio-group', '.ant-checkbox-group', '.ant-switch', '.ant-form-item',
    '[role="combobox"]', '[role="listbox"]', '[contenteditable="true"]', 'select', 'input', 'textarea'
  ].join(', ');
  const FIELD_INPUT_SELECTORS = [
    '.el-select input.el-input__inner',
    '.el-date-editor input.el-input__inner',
    '.el-cascader .el-input__inner',
    '.el-select-v2 input',
    '.el-tree-select input',
    '.ant-select input',
    '.ant-picker input',
    '.ant-cascader input',
    '.el-textarea__inner',
    '.el-input__inner',
    '.el-radio__original',
    '.el-switch__input',
    'select:not([disabled])',
    '[contenteditable="true"]',
    '.ql-editor[contenteditable="true"]',
    '.ProseMirror[contenteditable="true"]',
    '.tiptap[contenteditable="true"]',
    '[role="textbox"][contenteditable="true"]',
    'input[type="checkbox"]:not([disabled])',
    'input[type="radio"]:not([disabled])',
    'textarea',
    'input:not([type="hidden"]):not([type="file"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="image"])'
  ];
  const FIELD_INPUT_SELECTOR_TEXT = FIELD_INPUT_SELECTORS.join(', ');
  const ACTIVE_DIALOG_SELECTORS = [
    '.el-dialog__wrapper',
    '.el-drawer__wrapper',
    '.el-message-box__wrapper',
    '.el-overlay-dialog',
    '.ant-modal-root',
    '.ant-drawer',
    '.ant-popover',
    '.ant-dropdown',
    '[role="dialog"]',
    '[aria-modal="true"]'
  ];
  const AUTO_MOCK_UI_SELECTOR = '#mock-ext-spotlight, #mock-ext-settings';
  const SELECT_SKIP_KEYWORDS = ['全部', '全选', '请选择', '不限', '无数据', '暂无数据', '加载中'];

  function isElementVisible(element) {
    if (!element || !element.isConnected || typeof element.getClientRects !== 'function') return false;
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse' || style.opacity === '0') {
      return false;
    }
    return element.getClientRects().length > 0;
  }

  function getEffectiveZIndex(element) {
    let maxZIndex = 0;
    let current = element;
    while (current && current !== document.documentElement) {
      const zIndex = Number.parseInt(window.getComputedStyle(current).zIndex, 10);
      if (Number.isFinite(zIndex)) maxZIndex = Math.max(maxZIndex, zIndex);
      current = current.parentElement;
    }
    return maxZIndex;
  }

  function getActiveDialogRoot() {
    const candidates = queryAllBySelectors(document, getEffectiveDialogSelectors())
      .filter(root => isElementVisible(root) && queryAllBySelectors(root, getEffectiveInputSelectors()).length > 0);

    return candidates.reduce((activeRoot, candidate) => {
      if (!activeRoot) return candidate;
      const activeZIndex = getEffectiveZIndex(activeRoot);
      const candidateZIndex = getEffectiveZIndex(candidate);
      if (candidateZIndex !== activeZIndex) {
        return candidateZIndex > activeZIndex ? candidate : activeRoot;
      }
      return activeRoot.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_FOLLOWING
        ? candidate
        : activeRoot;
    }, null);
  }

  function stopDeferredDialogFill() {
    if (deferredDialogObserver) deferredDialogObserver.disconnect();
    if (deferredDialogTimer) clearTimeout(deferredDialogTimer);
    if (deferredDialogDebounce) clearTimeout(deferredDialogDebounce);
    deferredDialogObserver = null;
    deferredDialogTimer = null;
    deferredDialogDebounce = null;
  }

  function startDeferredDialogFill(session) {
    stopDeferredDialogFill();
    const observeRoot = document.body || document.documentElement;
    if (!observeRoot || typeof MutationObserver === 'undefined') return;

    const scheduleDynamicFields = (delay = 120) => {
      if (!deferredDialogObserver) return;
      if (deferredDialogDebounce) clearTimeout(deferredDialogDebounce);
      deferredDialogDebounce = setTimeout(processDynamicFields, delay);
    };

    const fillAndContinue = (options, errorMessage) => {
      fillElementUiForms(options)
        .then(result => {
          if (result.total > 0) scheduleDynamicFields(0);
        })
        .catch(error => console.warn(errorMessage, error));
    };

    const processDynamicFields = () => {
      deferredDialogDebounce = null;
      if (session.dynamicFillInProgress) return;
      const dialogRoot = getActiveDialogRoot();
      const maxDialogSteps = getBoundedConfigNumber(CONFIG.DYNAMIC_FILL_MAX_DIALOG_STEPS, 3, 1, 10);

      if (dialogRoot && !session.handledDialogRoots.has(dialogRoot)) {
        if (session.dialogStep >= maxDialogSteps) return;
        session.handledDialogRoots.add(dialogRoot);
        session.dialogStep++;
        fillAndContinue(
          { root: dialogRoot, watchNextDialog: false, session, silent: false },
          '[AutoMock] 后续弹窗填充失败:'
        );
        return;
      }

      const dynamicRoot = dialogRoot || document;
      fillAndContinue(
        { root: dynamicRoot, watchNextDialog: false, session, silent: true },
        '[AutoMock] 动态字段填充失败:'
      );
    };

    deferredDialogObserver = new MutationObserver(() => scheduleDynamicFields());
    deferredDialogObserver.observe(observeRoot, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'aria-hidden']
    });
    scheduleDynamicFields(0);
    const windowMs = getBoundedConfigNumber(CONFIG.DYNAMIC_FILL_WINDOW_MS, 8000, 1000, 60000);
    deferredDialogTimer = setTimeout(stopDeferredDialogFill, windowMs);
  }

  function isFieldVisible(input) {
    if (isElementVisible(input)) return true;
    const componentRoot = input.closest(FIELD_CONTAINER_SELECTORS);
    return Boolean(componentRoot && isElementVisible(componentRoot));
  }

  function collectFillableInputs(root) {
    const queryRoot = root && typeof root.querySelectorAll === 'function' ? root : document;
    const seen = new Set();
    return queryAllBySelectors(queryRoot, getEffectiveInputSelectors()).filter(input => {
      if (seen.has(input)) return false;
      seen.add(input);
      if (input.closest(AUTO_MOCK_UI_SELECTOR)) return false;
      return isFieldVisible(input);
    });
  }

  function isFormFieldElement(target) {
    return Boolean(target) && (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable
    );
  }

  function normalizeElement(target) {
    if (!target) return null;
    if (target.nodeType === 1) return target;
    return target.parentElement || null;
  }

  function findFieldFromContainer(container) {
    const element = normalizeElement(container);
    if (!element) return null;
    if (isFormFieldElement(element) && element.type !== 'hidden') return element;
    if (typeof element.querySelector !== 'function') return null;

    const fields = queryAllBySelectors(element, getEffectiveInputSelectors());
    for (let i = 0; i < fields.length; i++) {
      if (isFormFieldElement(fields[i]) && fields[i].type !== 'hidden') return fields[i];
    }
    return null;
  }

  function resolveMockFieldElement(target) {
    const element = normalizeElement(target);
    if (!element) return null;
    if (isFormFieldElement(element) && element.type !== 'hidden') return element;

    const candidates = [];
    const pushCandidate = (candidate) => {
      const normalized = normalizeElement(candidate);
      if (!normalized || candidates.includes(normalized)) return;
      candidates.push(normalized);
    };

    pushCandidate(element);
    if (typeof element.closest === 'function') {
      pushCandidate(element.closest(FIELD_CONTAINER_SELECTORS));
      pushCandidate(element.closest('.el-form-item'));
      pushCandidate(element.closest('td, th'));
    }

    for (let i = 0; i < candidates.length; i++) {
      const field = findFieldFromContainer(candidates[i]);
      if (field) return field;
    }
    return null;
  }

  function getFieldKind(input) {
    if (!input) return 'text';
    if (input.isContentEditable) return 'contenteditable';
    if (input.tagName === 'SELECT') return input.multiple ? 'native-multi-select' : 'native-select';
    if (input.type === 'checkbox') return 'checkbox';
    if (input.type === 'radio') return 'radio';
    if (input.closest('.el-cascader, .ant-cascader, .el-tree-select')) return 'cascader';
    if (input.closest('.el-select, .el-select-v2, .ant-select, [role="combobox"]')) return 'semantic-select';
    if (input.closest('.el-date-editor, .ant-picker')) return 'date-picker';
    return 'text';
  }

  function getFieldIdentity(input) {
    const kind = getFieldKind(input);
    if (kind === 'radio' && input.name) return `radio:${input.name}`;
    if (kind === 'semantic-select' || kind === 'cascader' || kind === 'date-picker') {
      const wrapper = input.closest('.el-select, .el-select-v2, .el-cascader, .el-tree-select, .el-date-editor, .ant-select, .ant-cascader, .ant-picker, [role="combobox"]');
      if (wrapper) return wrapper;
    }
    return input;
  }

  function collectFillableFields(root) {
    const seen = new Set();
    return collectFillableInputs(root)
      .filter(input => {
        const identity = getFieldIdentity(input);
        if (seen.has(identity)) return false;
        seen.add(identity);
        return true;
      })
      .map(input => ({ inputEl: input, kind: getFieldKind(input) }));
  }

  function rememberLatestInteraction(target) {
    const element = normalizeElement(target);
    if (!element) return;

    const fieldElement = resolveMockFieldElement(element);
    if (fieldElement) {
      latestInteractionTarget = element;
      spotlightTargetElement = fieldElement;
      return;
    }

    if (typeof element.closest === 'function' && element.closest(FIELD_CONTAINER_SELECTORS)) {
      latestInteractionTarget = element;
    }
  }

  function getAiPreloadPromptKey(context) {
    if (!context || !CONFIG.DEEPSEEK_API_KEY || CONFIG.AI_ENABLE_CLASSIFICATION === false || CONFIG.AI_ENABLE_PRELOAD === false || isLocalOnlyHookComponent(context.componentName)) return '';
    return getAiRecommendationPrompt(context);
  }

  function scheduleAiRecommendationPreload(context, options = {}) {
    const triggerType = options.triggerType === 'hover' ? 'hover' : 'active';
    const promptKey = getAiPreloadPromptKey(context);
    if (!promptKey) {
      if (spotlightPreloadTimer) {
        clearTimeout(spotlightPreloadTimer);
        spotlightPreloadTimer = null;
      }
      latestPreloadPromptKey = '';
      latestPreloadTriggerType = '';
      return;
    }

    if (getCachedAiRecommendationResult(promptKey)) {
      latestPreloadPromptKey = promptKey;
      latestPreloadTriggerType = triggerType;
      return;
    }

    if (deepseekPendingRequests.has(promptKey)) {
      latestPreloadPromptKey = promptKey;
      latestPreloadTriggerType = triggerType;
      return;
    }

    const preloadDelay = triggerType === 'hover' ? 80 : 0;

    if (latestPreloadPromptKey === promptKey && spotlightPreloadTimer) {
      if (preloadDelay > 0 || latestPreloadTriggerType !== 'hover') {
        return;
      }
    }

    if (spotlightPreloadTimer) {
      clearTimeout(spotlightPreloadTimer);
      spotlightPreloadTimer = null;
    }

    latestPreloadPromptKey = promptKey;
    latestPreloadTriggerType = triggerType;

    const triggerPreloadRequest = () => {
      spotlightPreloadTimer = null;
      latestPreloadTriggerType = '';
      requestAiRecommendation(promptKey, context.labelText, getAiRecommendationSystemPrompt()).catch(err => {
        console.error('[AutoMock AI] 预加载推荐类目失败:', err);
      });
    };

    if (preloadDelay <= 0) {
      triggerPreloadRequest();
      return;
    }

    spotlightPreloadTimer = setTimeout(triggerPreloadRequest, preloadDelay);
  }

  function getVueInstanceFromElement(element) {
    if (!element) return null;
    const component = element.__vueParentComponent || element._vueParentComponent;
    return element.__vue__ || (component && (component.proxy || component)) || null;
  }

  function getVueComponentName(vueInstance) {
    if (!vueInstance) return '';
    return (
      (vueInstance.$options && vueInstance.$options.name) ||
      (vueInstance.$ && vueInstance.$.type && vueInstance.$.type.name) ||
      (vueInstance.type && vueInstance.type.name) ||
      ''
    );
  }

  function getVueInstance(input) {
    if (!input || typeof input.closest !== 'function') return null;
    const selectors = '.el-select, .el-select-v2, .el-date-editor, .el-cascader, .el-tree-select, .el-radio-group, .el-checkbox-group, .el-switch, .ant-select, .ant-picker, .ant-cascader, .ant-radio-group, .ant-checkbox-group, .ant-switch, .el-input, .el-textarea';
    const wrapper = input.closest(selectors);
    const directInstance = getVueInstanceFromElement(wrapper) || getVueInstanceFromElement(input);
    if (directInstance) return directInstance;

    let current = input.parentElement;
    for (let depth = 0; current && depth < 5; depth++, current = current.parentElement) {
      const instance = getVueInstanceFromElement(current);
      if (instance) return instance;
    }
    return null;
  }

  function emitComponentValue(vueInstance, value) {
    if (!vueInstance) return false;
    const emit = typeof vueInstance.$emit === 'function'
      ? vueInstance.$emit.bind(vueInstance)
      : typeof vueInstance.emit === 'function'
        ? vueInstance.emit.bind(vueInstance)
        : null;
    if (!emit) return false;

    emit('update:modelValue', value);
    emit('input', value);
    emit('change', value);
    return true;
  }

  function buildDatePickerValue(vueInstance, labelText = '', session) {
    const rawType = String(
      (vueInstance && vueInstance.type) ||
      (vueInstance && vueInstance.$props && vueInstance.$props.type) ||
      ''
    ).toLowerCase();
    const end = new Date(session && session.baseDate ? session.baseDate : Date.now());
    const start = new Date(end);
    start.setDate(start.getDate() - 7);
    if (rawType.includes('range')) return [start, end];
    if (/开始|起始|start|from/i.test(labelText)) return start;
    if (/结束|截止|到期|end|to/i.test(labelText)) return end;
    return end;
  }

  function setNativeProperty(element, property, value) {
    let prototype = element;
    while ((prototype = Object.getPrototypeOf(prototype))) {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, property);
      if (descriptor && typeof descriptor.set === 'function') {
        descriptor.set.call(element, value);
        return true;
      }
    }
    try {
      element[property] = value;
      return true;
    } catch (error) {
      return false;
    }
  }

  function dispatchFieldEvents(element) {
    ['input', 'change', 'blur'].forEach(type => {
      element.dispatchEvent(new Event(type, { bubbles: true }));
    });
  }

  function getLabelForInput(input, vueInstance) {
    let labelText = '';
    const formItem = input.closest('.el-form-item');
    if (formItem) {
      const labelEl = formItem.querySelector('.el-form-item__label');
      if (labelEl) labelText = labelEl.innerText;
    }
    if (!labelText && vueInstance) {
      let parent = vueInstance.$parent;
      while (parent) {
        if (parent.$options) {
          if (parent.$options.name === 'ElFormItem' && parent.label) {
            labelText = parent.label; break;
          }
          if (parent.$options.name === 'ElTableColumn' && parent.label) {
            labelText = parent.label; break;
          }
        }
        parent = parent.$parent;
      }
    }
    if (!labelText) {
      const descCell = input.closest('.el-descriptions-item__cell');
      if (descCell) {
        let labelEl = descCell.querySelector('.el-descriptions-item__label');
        if (!labelEl && descCell.previousElementSibling && descCell.previousElementSibling.classList.contains('el-descriptions-item__label')) {
          labelEl = descCell.previousElementSibling;
        }
        if (labelEl) labelText = (labelEl.innerText || labelEl.textContent || '').trim();
      }
    }
    if (!labelText) {
      const td = input.closest('td');
      if (td && typeof td.className === 'string' && td.className.includes('el-table_')) {
        const match = td.className.match(/el-table_[a-zA-Z0-9_]+/);
        if (match) {
          const tableWrap = input.closest('.el-table');
          const th = tableWrap ? tableWrap.querySelector(`th.${match[0]}`) : document.querySelector(`th.${match[0]}`);
          if (th) labelText = (th.innerText || th.textContent || '').trim();
        }
      }
    }
    if (!labelText) {
      const cell = input.closest('td, th');
      if (cell && cell.previousElementSibling) {
        let text = (cell.previousElementSibling.innerText || cell.previousElementSibling.textContent || '').trim();
        if (text && text.length > 0 && text.length < 50) labelText = text;
      }
    }
    if (!labelText) {
      let el = input;
      for (let i = 0; i < 10; i++) {
        if (!el || el.tagName === 'BODY') break;
        let sibling = el.previousElementSibling;
        let siblingCount = 0;
        while (sibling && siblingCount < 3) {
          let text = (sibling.innerText || sibling.textContent || '').trim();
          if (text && text.length > 0 && text.length < 50) { labelText = text; break; }
          sibling = sibling.previousElementSibling;
          siblingCount++;
        }
        if (labelText) break;
        el = el.parentElement;
      }
    }
    if (!labelText) labelText = input.placeholder || '';
    if (!labelText && input.name) labelText = input.name;
    return applySiteFieldAlias(labelText.trim());
  }


  function getFieldContext(inputEl) {
    if (!isFormFieldElement(inputEl)) return null;

    const vueInstance = getVueInstance(inputEl);
    const isNativeDisabled = inputEl.disabled || inputEl.hasAttribute('disabled') || inputEl.closest('.is-disabled');
    const isVueDisabled = vueInstance && (vueInstance.disabled || vueInstance.inputDisabled || vueInstance.selectDisabled);
    if (isNativeDisabled || isVueDisabled) return null;

    const componentName = getVueComponentName(vueInstance);
    const fieldKind = getFieldKind(inputEl);
    const isReadOnlyControl = fieldKind === 'semantic-select' || fieldKind === 'cascader' || fieldKind === 'date-picker';
    if ((inputEl.readOnly || inputEl.hasAttribute('readonly')) && !CustomHooks[componentName] && !isReadOnlyControl) return null;

    const labelText = getLabelForInput(inputEl, vueInstance);
    let vModelExpr = '';
    if (vueInstance && vueInstance.$vnode && vueInstance.$vnode.data && vueInstance.$vnode.data.model) {
      vModelExpr = vueInstance.$vnode.data.model.expression || '';
    }

    const ignoreList = getEffectiveIgnoreKeywords();
    const labelLower = labelText.toLowerCase();
    const modelLower = vModelExpr.toLowerCase();
    const isIgnored = ignoreList.some(keyword => {
      const kw = String(keyword == null ? '' : keyword).toLowerCase();
      return kw && (labelLower.includes(kw) || (modelLower && modelLower.includes(kw)));
    });
    if (isIgnored) return null;

    const hookAction = createHookFillAction(vueInstance, componentName, labelText);
    return {
      inputEl,
      vueInstance,
      componentName,
      fieldKind,
      labelText,
      hookAction,
      supportsAiSuggestion: isAiSuggestionComponent(componentName),
      localHookName: LocalHookDisplayNames[componentName] || '推荐值',
      fallbackPrediction: predictMockType(labelText)
    };
  }

  function buildMockValueFromCommand(cmd, session) {
    let mockValue = '';
    if (cmd.startsWith('__custom_')) {
      const idx = parseInt(cmd.replace('__custom_', ''), 10);
      const dict = CONFIG.CUSTOM_DICTS[idx];
      if (dict && dict.values && dict.values.length > 0) {
        mockValue = pickSessionValue(dict.values, session);
      } else {
        mockValue = generateMockValue('randomString', session);
      }
    } else if (MockFactory[cmd]) {
      mockValue = generateMockValue(cmd, session);
    } else {
      mockValue = resolveMockType(cmd, session);
    }
    return mockValue;
  }

  function normalizeOptionText(value) {
    return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  }

  function isSafeOptionElement(element) {
    if (!element || !isElementVisible(element)) return false;
    if (element.disabled || element.getAttribute('aria-disabled') === 'true') return false;
    if (element.closest('.is-disabled, .disabled, [disabled], [aria-disabled="true"]')) return false;
    const text = normalizeOptionText(element.innerText || element.textContent);
    return Boolean(text) && !getEffectiveOptionSkipKeywords().some(keyword => text.includes(keyword));
  }

  function getVisibleChoiceElements() {
    const selector = [
      '.el-select-dropdown__item', '.el-select-v2__item', '.el-cascader-node', '.el-tree-node__content',
      '.ant-select-item-option', '.ant-cascader-menu-item',
      '[role="listbox"] [role="option"]', '[role="option"]'
    ].join(', ');
    return Array.from(document.querySelectorAll(selector)).filter(isSafeOptionElement);
  }

  function waitForRender(delay = 80) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  function getBoundedConfigNumber(value, fallback, minimum, maximum) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(maximum, Math.max(minimum, parsed));
  }

  async function chooseDomOption(inputEl, session) {
    const wrapper = inputEl.closest('.el-select, .el-select-v2, .el-cascader, .el-tree-select, .ant-select, .ant-cascader, [role="combobox"]') || inputEl;
    wrapper.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    wrapper.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    if (typeof inputEl.focus === 'function') inputEl.focus();
    const retryCount = getBoundedConfigNumber(CONFIG.REMOTE_OPTION_RETRY_COUNT, 4, 0, 10);
    const retryDelay = getBoundedConfigNumber(CONFIG.REMOTE_OPTION_RETRY_DELAY_MS, 250, 50, 2000);

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      if (attempt > 0) await waitForRender(retryDelay);
      const options = getVisibleChoiceElements();
      if (!options.length) continue;
      const option = pickSessionValue(options, session);
      option.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      option.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      option.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    }
    return false;
  }

  function chooseNativeSelect(inputEl, session) {
    const options = Array.from(inputEl.options || []).filter(option => {
      const text = normalizeOptionText(option.textContent || option.label || option.value);
      return !option.disabled && option.value !== '' && !getEffectiveOptionSkipKeywords().some(keyword => text.includes(keyword));
    });
    if (!options.length) return false;

    if (inputEl.multiple) {
      const count = Math.min(options.length, Math.max(1, Math.ceil(getSessionRandom(session)() * 2)));
      const selected = [...options].sort(() => getSessionRandom(session)() - 0.5).slice(0, count);
      Array.from(inputEl.options).forEach(option => setNativeProperty(option, 'selected', selected.includes(option)));
    } else {
      const option = pickSessionValue(options, session);
      setNativeProperty(inputEl, 'value', option.value);
    }
    dispatchFieldEvents(inputEl);
    return true;
  }

  function chooseNativeCheck(inputEl, session) {
    if (inputEl.type === 'radio') {
      const group = inputEl.name
        ? Array.from(document.getElementsByName(inputEl.name)).filter(input => input.type === 'radio' && !input.disabled && isFieldVisible(input))
        : [inputEl];
      if (!group.length) return false;
      const selected = pickSessionValue(group, session);
      setNativeProperty(selected, 'checked', true);
      dispatchFieldEvents(selected);
      return true;
    }
    setNativeProperty(inputEl, 'checked', true);
    dispatchFieldEvents(inputEl);
    return true;
  }

  function getAssociationKey(inputEl, labelText) {
    const raw = String(labelText || inputEl.name || inputEl.id || '').toLowerCase();
    return raw.replace(/确认|再次|重复|重新|confirm|repeat|again|\s|[_-]/g, '');
  }

  function isConfirmationField(inputEl, labelText) {
    const text = `${labelText || ''} ${inputEl.name || ''} ${inputEl.id || ''}`.toLowerCase();
    return /确认|再次|重复|重新|confirm|repeat|again/.test(text);
  }

  function padNumber(value) {
    return String(value).padStart(2, '0');
  }

  function getValidationFillMode() {
    return ['normal', 'boundary', 'invalid'].includes(CONFIG.FILL_VALIDATION_MODE)
      ? CONFIG.FILL_VALIDATION_MODE
      : 'normal';
  }

  function takeBoundaryValue(session, first, second) {
    const index = session ? session.boundaryIndex++ : 0;
    return index % 2 === 0 ? first : second;
  }

  function buildInvalidMockValue(inputEl) {
    const fieldType = String(inputEl.type || '').toLowerCase();
    if (inputEl.required) return '';
    if (fieldType === 'email') return 'invalid-email';
    if (fieldType === 'url') return 'invalid-url';
    if (fieldType === 'number' || fieldType === 'range') {
      const min = Number(inputEl.min);
      const max = Number(inputEl.max);
      const step = Number(inputEl.step) || 1;
      if (Number.isFinite(max)) return String(max + step);
      if (Number.isFinite(min)) return String(min - step);
      return '-1';
    }
    if (['date', 'time', 'month', 'week', 'datetime-local'].includes(fieldType)) {
      if (inputEl.max) return `${inputEl.max}x`;
      if (inputEl.min) return `${inputEl.min}x`;
      return 'invalid-date';
    }
    if (inputEl.pattern) return 'INVALID';
    return '异常测试数据';
  }

  function applyBoundaryTextValue(value, inputEl, session) {
    if (getValidationFillMode() !== 'boundary') return value;
    const maxLength = Number(inputEl.maxLength);
    const minLength = Number(inputEl.minLength);
    const targetLength = Number.isFinite(maxLength) && maxLength > 0
      ? Math.min(maxLength, 256)
      : Number.isFinite(minLength) && minLength > 0
        ? Math.min(minLength, 256)
        : 0;
    if (!targetLength) return value;
    const source = '边界测试数据';
    const boundary = source.repeat(Math.ceil(targetLength / source.length)).slice(0, targetLength);
    return takeBoundaryValue(session, value, boundary);
  }

  function buildDateInputValue(inputEl, labelText, session) {
    if (getValidationFillMode() === 'boundary' && (inputEl.min || inputEl.max)) {
      return takeBoundaryValue(session, inputEl.min || inputEl.max, inputEl.max || inputEl.min);
    }
    const date = new Date(session && session.baseDate ? session.baseDate : Date.now());
    if (/开始|起始|start|from/i.test(labelText)) date.setDate(date.getDate() - 7);
    if (/结束|截止|到期|end|to/i.test(labelText)) date.setDate(date.getDate() + 7);
    const type = String(inputEl.type || '').toLowerCase();
    if (type === 'time') return `${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`;
    if (type === 'month') return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}`;
    if (type === 'datetime-local') return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}T${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`;
    return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
  }

  function buildConstrainedMockValue(inputEl, labelText, session) {
    const fieldType = String(inputEl.type || '').toLowerCase();
    const associationKey = getAssociationKey(inputEl, labelText);
    if (isConfirmationField(inputEl, labelText) && session.values.has(associationKey)) {
      return session.values.get(associationKey);
    }

    if (getValidationFillMode() === 'invalid') {
      const invalidValue = buildInvalidMockValue(inputEl);
      session.values.set(associationKey, invalidValue);
      return invalidValue;
    }

    let value;
    if (['date', 'time', 'month', 'week', 'datetime-local'].includes(fieldType)) {
      value = buildDateInputValue(inputEl, labelText, session);
    } else if (fieldType === 'email') {
      value = generateMockValue('email', session);
    } else if (fieldType === 'tel') {
      value = generateMockValue('phone', session);
    } else if (fieldType === 'url') {
      value = generateMockValue('url', session);
    } else if (fieldType === 'number' || fieldType === 'range') {
      const min = Number(inputEl.min);
      const max = Number(inputEl.max);
      const lower = Number.isFinite(min) ? min : 1;
      const upper = Number.isFinite(max) && max >= lower ? max : Math.max(lower + 100, 100);
      const step = Number(inputEl.step);
      const amount = CONFIG.NUMBER_FILL_STRATEGY === 'boundary' || getValidationFillMode() === 'boundary'
        ? takeBoundaryValue(session, lower, upper)
        : lower + getSessionRandom(session)() * (upper - lower);
      const rounded = Number.isFinite(step) && step > 0 ? Math.round((amount - lower) / step) * step + lower : Math.round(amount);
      value = String(Math.min(upper, Math.max(lower, rounded)));
    } else {
      value = String(resolveMockType(labelText, session));
      if (inputEl.pattern && /\d|\[0-9/.test(inputEl.pattern) && !/\D/.test(inputEl.pattern)) {
        value = String(generateMockValue('number', session));
      }
    }

    const maxLength = Number(inputEl.maxLength);
    value = applyBoundaryTextValue(value, inputEl, session);
    if (Number.isFinite(maxLength) && maxLength >= 0 && value.length > maxLength) {
      value = value.slice(0, maxLength);
    }
    session.values.set(associationKey, value);
    return value;
  }

  function applyNativeValue(inputEl, value) {
    if (inputEl.isContentEditable) {
      inputEl.textContent = value;
      dispatchFieldEvents(inputEl);
      return true;
    }
    if (!setNativeProperty(inputEl, 'value', value)) return false;
    dispatchFieldEvents(inputEl);
    return true;
  }

  function clearFieldForInvalidMode(inputEl, vueInstance, fieldKind) {
    if (fieldKind === 'native-select' || fieldKind === 'native-multi-select') {
      Array.from(inputEl.options || []).forEach(option => setNativeProperty(option, 'selected', false));
      setNativeProperty(inputEl, 'value', '');
      dispatchFieldEvents(inputEl);
      return true;
    }
    if (fieldKind === 'checkbox') {
      setNativeProperty(inputEl, 'checked', false);
      dispatchFieldEvents(inputEl);
      return true;
    }
    if (fieldKind === 'radio') {
      const radios = inputEl.name ? Array.from(document.getElementsByName(inputEl.name)) : [inputEl];
      radios.filter(radio => radio.type === 'radio').forEach(radio => setNativeProperty(radio, 'checked', false));
      dispatchFieldEvents(inputEl);
      return true;
    }
    if ((fieldKind === 'semantic-select' || fieldKind === 'cascader' || fieldKind === 'date-picker') && emitComponentValue(vueInstance, null)) {
      return true;
    }
    return false;
  }

  async function fillField(inputEl, session, forcedCommand) {
    const context = getFieldContext(inputEl);
    if (!context) return { status: 'skipped' };
    const { vueInstance, componentName, fieldKind, labelText } = context;

    if (!forcedCommand && getValidationFillMode() === 'invalid' && clearFieldForInvalidMode(inputEl, vueInstance, fieldKind)) {
      return { status: 'filled' };
    }

    if (fieldKind === 'native-select' || fieldKind === 'native-multi-select') {
      return { status: chooseNativeSelect(inputEl, session) ? 'filled' : 'skipped' };
    }
    if (fieldKind === 'checkbox' || fieldKind === 'radio') {
      return { status: chooseNativeCheck(inputEl, session) ? 'filled' : 'skipped' };
    }
    if (fieldKind === 'semantic-select' || fieldKind === 'cascader') {
      if (vueInstance && CustomHooks[componentName] && CustomHooks[componentName](vueInstance, labelText, session)) {
        return { status: 'filled' };
      }
      return { status: await chooseDomOption(inputEl, session) ? 'filled' : 'skipped' };
    }
    if (vueInstance && CustomHooks[componentName] && !forcedCommand) {
      return { status: CustomHooks[componentName](vueInstance, labelText, session) ? 'filled' : 'skipped' };
    }

    const value = forcedCommand ? buildMockValueFromCommand(forcedCommand, session) : buildConstrainedMockValue(inputEl, labelText, session);
    if (vueInstance && emitComponentValue(vueInstance, value)) return { status: 'filled' };
    return { status: applyNativeValue(inputEl, value) ? 'filled' : 'skipped' };
  }

  function applyDirectCommandToInput(inputEl, cmd) {
    if (!inputEl || !cmd) return false;
    const session = createMockSession();
    const operation = createFillOperation('spotlight');
    const snapshot = captureFieldSnapshot(inputEl);
    fillField(inputEl, session, cmd)
      .then(outcome => {
        recordOperationSnapshot(operation, snapshot, outcome);
        if (!operation.snapshots.length) return;
        lastFillOperation = operation;
        showUndoAction(operation);
      })
      .catch(error => console.warn('[AutoMock] 单字段填充失败:', error));
    return true;
  }

  function applyLocalFallback(context) {
    if (context.hookAction) {
      const session = createMockSession();
      const operation = createFillOperation('spotlight');
      const snapshot = captureFieldSnapshot(context.inputEl);
      const success = context.hookAction(session);
      if (success) {
        recordOperationSnapshot(operation, snapshot, { status: 'filled' });
        lastFillOperation = operation;
        showUndoAction(operation);
      }
      return success;
    }
    if (context.fallbackPrediction) {
      return applyDirectCommandToInput(context.inputEl, context.fallbackPrediction.cmd);
    }
    return false;
  }

  let latestSpotlightRequestId = 0;

  function buildRecommendationCardsFromCommands(commands, context) {
    const cards = [];
    const pushUniqueCard = (card) => {
      if (!card || !card.cmd) return;
      if (cards.some(existing => existing.cmd === card.cmd)) return;
      cards.push(card);
    };

    if (Array.isArray(commands)) {
      commands.forEach(cmd => {
        const displayItem = getDisplayItemByCommand(cmd);
        if (displayItem) pushUniqueCard(displayItem);
      });
    }

    if (cards.length === 0 && context) {
      if (context.hookAction) {
        pushUniqueCard({ label: context.localHookName, cmd: '__hook_default' });
      }

      predictMockTypes(context.labelText, 3).forEach(item => {
        pushUniqueCard({ label: item.name, cmd: item.cmd });
      });
    }

    return cards.slice(0, 3);
  }

  async function getAiRecommendedCommands(context) {
    if (!context || !CONFIG.DEEPSEEK_API_KEY || CONFIG.AI_ENABLE_CLASSIFICATION === false || isLocalOnlyHookComponent(context.componentName)) {
      return [];
    }

    const promptText = getAiRecommendationPrompt(context);
    return requestAiRecommendation(promptText, context.labelText, getAiRecommendationSystemPrompt());
  }

  async function loadSpotlightRecommendations(container, context, requestId) {
    if (!container || !context) return;
    const loadingHint = container.querySelector('[data-role="recommend-loading"]');
    if (loadingHint) loadingHint.innerText = '正在为当前字段匹配推荐类目...';

    const aiCommands = await getAiRecommendedCommands(context);
    if (requestId !== latestSpotlightRequestId) return;

    const recommendCards = buildRecommendationCardsFromCommands(aiCommands, context);
    renderRecommendationSection(container, recommendCards, !aiCommands.length);
  }

  function resolveSpotlightContext() {
    const candidates = [];
    const pushCandidate = (candidate) => {
      const normalized = normalizeElement(candidate);
      if (!normalized || candidates.includes(normalized)) return;
      candidates.push(normalized);
    };

    pushCandidate(latestInteractionTarget);
    pushCandidate(document.activeElement);
    pushCandidate(spotlightTargetElement);

    for (let i = 0; i < candidates.length; i++) {
      const fieldElement = resolveMockFieldElement(candidates[i]);
      if (!fieldElement) continue;
      const context = getFieldContext(fieldElement);
      if (!context) continue;
      spotlightTargetElement = context.inputEl;
      return context;
    }

    const fallbackField = resolveMockFieldElement(latestInteractionTarget) || resolveMockFieldElement(document.activeElement) || resolveMockFieldElement(spotlightTargetElement);
    if (fallbackField) spotlightTargetElement = fallbackField;
    return null;
  }

  function getCachedSpotlightRecommendation(context) {
    if (!context || !CONFIG.DEEPSEEK_API_KEY || CONFIG.AI_ENABLE_CLASSIFICATION === false || isLocalOnlyHookComponent(context.componentName)) {
      return null;
    }

    const promptText = getAiRecommendationPrompt(context);
    return getCachedAiRecommendationResult(promptText);
  }

  function renderSpotlightByContext(panel, context) {
    latestSpotlightRequestId += 1;
    const requestId = latestSpotlightRequestId;
    if (!panel) return;

    if (!context) {
      renderRecommendationSection(panel, [], true, {
        titleText: '✨ 智能推荐',
        emptyText: `请先点击一个表单字段，再按 Alt+${(CONFIG.SHORTCUT_SPOTLIGHT || 'x').toUpperCase()} 或 ${getAiShortcutText()} 打开智能推荐。`,
        hintText: '当前还没有识别到可推荐的目标字段。'
      });
      return;
    }

    const cachedAiCommands = getCachedSpotlightRecommendation(context);
    if (cachedAiCommands) {
      const cachedCards = buildRecommendationCardsFromCommands(cachedAiCommands, context);
      renderRecommendationSection(panel, cachedCards, !cachedAiCommands.length);
      return;
    }

    const fallbackCards = buildRecommendationCardsFromCommands([], context);
    renderRecommendationSection(panel, fallbackCards, true);
    if (CONFIG.AI_ENABLE_CLASSIFICATION !== false && CONFIG.DEEPSEEK_API_KEY && !isLocalOnlyHookComponent(context.componentName)) {
      loadSpotlightRecommendations(panel, context, requestId).catch(err => {
        console.error('[AutoMock AI] 刷新推荐类目失败:', err);
      });
    }
  }

  function ensureSpotlightVisible() {
    let container = document.getElementById('mock-ext-spotlight');
    if (!container || container.style.display === 'none') {
      createSpotlightUI();
      container = document.getElementById('mock-ext-spotlight');
      if (container) container.style.display = 'flex';
    }
    return container;
  }

  function refreshSpotlightRecommendations() {
    const context = resolveSpotlightContext();
    const container = ensureSpotlightVisible();
    const panel = container ? container.querySelector('div') : null;
    renderSpotlightByContext(panel, context);
  }

  document.addEventListener('pointerover', (e) => {
    if (!e.isTrusted) return;
    rememberLatestInteraction(e.target);
    const fieldElement = resolveMockFieldElement(e.target);
    if (!fieldElement) return;
    const context = getFieldContext(fieldElement);
    if (!context) return;
    scheduleAiRecommendationPreload(context, { triggerType: 'hover' });
  }, true);

  ['pointerdown', 'mousedown', 'click', 'focusin'].forEach((eventName) => {
    document.addEventListener(eventName, (e) => {
      if (!e.isTrusted) return;
      rememberLatestInteraction(e.target);
      const fieldElement = resolveMockFieldElement(e.target);
      if (!fieldElement) return;
      const context = getFieldContext(fieldElement);
      if (!context) return;
      scheduleAiRecommendationPreload(context, { triggerType: 'active' });
    }, true);
  });

  function renderRecommendationSection(panel, items, usedFallback, options = {}) {
    if (!panel) return;
    const oldSection = panel.querySelector('[data-role="recommend-section"]');
    if (oldSection) oldSection.remove();

    const section = document.createElement('div');
    section.setAttribute('data-role', 'recommend-section');

    const sectionTitle = document.createElement('h3');
    sectionTitle.innerText = options.titleText || (usedFallback ? '✨ 智能推荐 (本地回退)' : '✨ 智能推荐 (AI 匹配)');
    sectionTitle.style.cssText = 'font-size: 13px; color: #909399; margin: 0 0 10px 0; padding-bottom: 6px; border-bottom: 1px solid #ebeef5; font-weight: 500;';
    section.appendChild(sectionTitle);

    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 6px;';

    items.forEach(item => {
      const btn = document.createElement('button');
      btn.innerText = item.label;
      btn.style.cssText = `
        padding: 10px 0;
        background: #f0f9eb;
        border: 1px solid #e1f3d8;
        border-radius: 6px;
        color: #67c23a;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        outline: none;
      `;
      btn.onmouseover = () => { btn.style.background = '#e1f3d8'; btn.style.color = '#67c23a'; btn.style.borderColor = '#c2e7b0'; };
      btn.onmouseout = () => { btn.style.background = '#f0f9eb'; btn.style.color = '#67c23a'; btn.style.borderColor = '#e1f3d8'; };
      btn.onclick = () => {
        executeSpotlightCommand(item.cmd);
        closeSpotlight();
      };
      grid.appendChild(btn);
    });

    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.innerText = options.emptyText || '当前字段暂未匹配到推荐类目，可直接从下方手动选择。';
      empty.style.cssText = 'font-size: 12px; color: #909399; padding: 8px 0 2px 0;';
      section.appendChild(empty);
    } else {
      section.appendChild(grid);
    }

    const hint = document.createElement('div');
    hint.innerText = options.hintText || (usedFallback ? '当前为本地规则回退推荐。' : `按 ${getAiShortcutText()} 可刷新当前字段的 AI 推荐类目。`);
    hint.style.cssText = 'font-size: 12px; color: #b0b3b8; margin-bottom: 8px;';
    section.appendChild(hint);

    const loading = panel.querySelector('[data-role="recommend-loading"]');
    if (loading) loading.remove();

    const title = panel.querySelector('[data-role="spotlight-title"]');
    if (title) {
      title.insertAdjacentElement('afterend', section);
    } else {
      panel.prepend(section);
    }
  }

  function createSpotlightUI() {
    let container = document.getElementById('mock-ext-spotlight');
    if (container) container.remove();

    container = document.createElement('div');
    container.id = 'mock-ext-spotlight';
    container.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.45);
      z-index: 999999;
      display: none;
      justify-content: center;
      align-items: center;
    `;

    const panel = document.createElement('div');
    panel.style.cssText = `
      width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      background: rgba(255, 255, 255, 0.98);
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;
    
    // 自定义滚动条样式
    const style = document.createElement('style');
    style.innerHTML = `
      #mock-ext-spotlight > div::-webkit-scrollbar { width: 6px; }
      #mock-ext-spotlight > div::-webkit-scrollbar-thumb { background: #dcdfe6; border-radius: 3px; }
      #mock-ext-spotlight > div::-webkit-scrollbar-thumb:hover { background: #c0c4cc; }
    `;
    document.head.appendChild(style);
    
    const title = document.createElement('div');
    title.setAttribute('data-role', 'spotlight-title');
    title.innerText = '⚡ 选择要填入的数据格式';
    title.style.cssText = 'font-size: 16px; color: #333; margin-bottom: 20px; font-weight: bold; user-select: none; text-align: center;';
    panel.appendChild(title);

    const undoStatus = document.createElement('div');
    undoStatus.setAttribute('data-role', 'spotlight-undo-status');
    undoStatus.style.cssText = 'font-size:12px;color:#909399;margin:-12px 0 14px;text-align:center;';
    panel.appendChild(undoStatus);

    const loadingHint = document.createElement('div');
    loadingHint.setAttribute('data-role', 'recommend-loading');
    loadingHint.innerText = '正在准备推荐区...';
    loadingHint.style.cssText = 'font-size: 12px; color: #b0b3b8; margin: -8px 0 14px 0; text-align: center;';
    panel.appendChild(loadingHint);

    const mockGroups = getBuiltInMockGroups();

    mockGroups.forEach(group => {
      const sectionTitle = document.createElement('h3');
      sectionTitle.innerText = group.title;
      sectionTitle.style.cssText = 'font-size: 13px; color: #909399; margin: 16px 0 10px 0; padding-bottom: 6px; border-bottom: 1px solid #ebeef5; font-weight: 500;';
      panel.appendChild(sectionTitle);

      const grid = document.createElement('div');
      grid.style.cssText = 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;';

      group.items.forEach(item => {
        const btn = document.createElement('button');
        btn.innerText = item.label;
        btn.style.cssText = `
          padding: 10px 0;
          background: ${group.isRecommended ? '#f0f9eb' : '#f4f6f8'};
          border: 1px solid ${group.isRecommended ? '#e1f3d8' : '#e4e7ed'};
          border-radius: 6px;
          color: ${group.isRecommended ? '#67c23a' : '#606266'};
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          outline: none;
        `;
        if (group.isRecommended) {
          btn.onmouseover = () => { btn.style.background = '#e1f3d8'; btn.style.color = '#67c23a'; btn.style.borderColor = '#c2e7b0'; };
          btn.onmouseout = () => { btn.style.background = '#f0f9eb'; btn.style.color = '#67c23a'; btn.style.borderColor = '#e1f3d8'; };
        } else {
          btn.onmouseover = () => { btn.style.background = '#e6f1fc'; btn.style.color = '#409eff'; btn.style.borderColor = '#c6e2ff'; };
          btn.onmouseout = () => { btn.style.background = '#f4f6f8'; btn.style.color = '#606266'; btn.style.borderColor = '#e4e7ed'; };
        }
        btn.onclick = () => {
          executeSpotlightCommand(item.cmd);
          closeSpotlight();
        };
        grid.appendChild(btn);
      });
      panel.appendChild(grid);
    });

    // 动态渲染自定义配置区
    if (CONFIG.CUSTOM_DICTS && CONFIG.CUSTOM_DICTS.length > 0) {
      const sectionTitle = document.createElement('h3');
      sectionTitle.innerText = '🔧 自定义扩展数据';
      sectionTitle.style.cssText = 'font-size: 13px; color: #909399; margin: 16px 0 10px 0; padding-bottom: 6px; border-bottom: 1px solid #ebeef5; font-weight: 500;';
      panel.appendChild(sectionTitle);

      const grid = document.createElement('div');
      grid.style.cssText = 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;';

      CONFIG.CUSTOM_DICTS.forEach((dict, index) => {
        const btn = document.createElement('button');
        btn.innerText = dict.label || ('自定义项' + (index + 1));
        btn.style.cssText = `
          padding: 10px 0;
          background: #fdf6ec;
          border: 1px solid #faecd8;
          border-radius: 6px;
          color: #e6a23c;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          outline: none;
        `;
        btn.onmouseover = () => { btn.style.background = '#fef0f0'; btn.style.color = '#f56c6c'; btn.style.borderColor = '#fde2e2'; };
        btn.onmouseout = () => { btn.style.background = '#fdf6ec'; btn.style.color = '#e6a23c'; btn.style.borderColor = '#faecd8'; };
        btn.onclick = () => {
          executeSpotlightCommand('__custom_' + index);
          closeSpotlight();
        };
        grid.appendChild(btn);
      });
      panel.appendChild(grid);
    }

    container.appendChild(panel);
    document.body.appendChild(container);

    // 点击背景关闭
    container.addEventListener('click', (e) => {
      if (e.target === container) closeSpotlight();
    });

    // 监听 ESC 关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && container.style.display === 'flex') {
        closeSpotlight();
      }
    });
  }

  function toggleSpotlight() {
    let container = document.getElementById('mock-ext-spotlight');
    if (container && container.style.display !== 'none') {
      closeSpotlight();
      return;
    }

    const context = resolveSpotlightContext();
    container = ensureSpotlightVisible();
    const panel = container ? container.querySelector('div') : null;
    const undoStatus = panel ? panel.querySelector('[data-role="spotlight-undo-status"]') : null;
    if (undoStatus) undoStatus.textContent = lastFillOperation && lastFillOperation.snapshots.length
      ? `可撤销上次填充的 ${lastFillOperation.snapshots.length} 项字段`
      : '当前没有可撤销的填充操作';
    renderSpotlightByContext(panel, context);
  }

  function closeSpotlight() {
    const container = document.getElementById('mock-ext-spotlight');
    if (container) container.style.display = 'none';
    if (spotlightTargetElement && typeof spotlightTargetElement.focus === 'function') {
      spotlightTargetElement.focus();
    }
  }

  function executeSpotlightCommand(cmd) {
    if (!cmd) return;
    const context = resolveSpotlightContext();
    if (!context) {
      alert(`Auto Mock: 请先点击可编辑的表单字段，再按 Alt+${(CONFIG.SHORTCUT_SPOTLIGHT || 'x').toUpperCase()} 或 ${getAiShortcutText()} 使用智能推荐。`);
      return;
    }
    spotlightTargetElement = context.inputEl;
    if (cmd === '__hook_default') {
      applyLocalFallback(context);
      return;
    }
    applyDirectCommandToInput(context.inputEl, cmd);
  }

  function fillElement(inputEl, mockValue) {
    const vueInstance = getVueInstance(inputEl);
    if (emitComponentValue(vueInstance, mockValue)) return true;
    return applyNativeValue(inputEl, mockValue);
  }

  function getCurrentFieldValue(inputEl) {
    if (inputEl.isContentEditable) return (inputEl.textContent || '').trim();
    if (inputEl.type === 'radio' && inputEl.name) {
      return Array.from(document.getElementsByName(inputEl.name)).some(input => input.type === 'radio' && input.checked) ? 'checked' : '';
    }
    if (inputEl.type === 'checkbox' || inputEl.type === 'radio') return inputEl.checked ? 'checked' : '';
    if (inputEl.tagName === 'SELECT' && inputEl.multiple) {
      return Array.from(inputEl.selectedOptions || []).map(option => option.value).join(',');
    }
    return String(inputEl.value == null ? '' : inputEl.value).trim();
  }

  function getNativeValidityReason(validity) {
    if (!validity) return '';
    if (validity.valueMissing) return '必填项未填写';
    if (validity.typeMismatch) return '格式不符合字段类型';
    if (validity.patternMismatch) return '未匹配字段格式规则';
    if (validity.rangeUnderflow) return '小于允许的最小值';
    if (validity.rangeOverflow) return '超过允许的最大值';
    if (validity.stepMismatch) return '未匹配数值步长';
    if (validity.tooShort) return '长度不足';
    if (validity.tooLong) return '长度超限';
    if (validity.badInput) return '输入内容无效';
    if (validity.customError) return '自定义校验失败';
    return '';
  }

  function validateFilledForm(root) {
    const seen = new Set();
    const issues = [];
    collectFillableInputs(root).forEach(inputEl => {
      const identity = getFieldIdentity(inputEl);
      if (seen.has(identity)) return;
      seen.add(identity);
      if (inputEl.disabled || inputEl.closest('.is-disabled')) return;

      const label = getLabelForInput(inputEl, getVueInstance(inputEl)) || '未命名字段';
      const reasons = new Set();
      if (inputEl.required && !getCurrentFieldValue(inputEl)) reasons.add('必填项未填写');
      const nativeReason = getNativeValidityReason(inputEl.validity);
      if (nativeReason) reasons.add(nativeReason);
      if (inputEl.getAttribute('aria-invalid') === 'true') reasons.add('页面标记为无效');
      if (inputEl.closest('.el-form-item.is-error, .el-form-item--error, .ant-form-item-has-error')) {
        reasons.add('组件校验错误');
      }
      if (reasons.size > 0) issues.push({ label, reasons: Array.from(reasons) });
    });
    return issues;
  }

  function showValidationDiagnostics(issues) {
    const existing = document.getElementById('mock-ext-validation-diagnostics');
    if (existing) existing.remove();
    if (!issues || issues.length === 0) return;

    const panel = document.createElement('div');
    panel.id = 'mock-ext-validation-diagnostics';
    panel.style.cssText = [
      'position:fixed', 'right:24px', 'bottom:76px', 'z-index:10000000', 'width:340px',
      'max-height:320px', 'overflow:auto', 'box-sizing:border-box', 'padding:14px',
      'border:1px solid #f3d19e', 'border-radius:6px', 'background:#fffaf0', 'color:#606266',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', 'font-size:13px',
      'box-shadow:0 8px 22px rgba(0,0,0,.16)'
    ].join(';');

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;color:#e6a23c;font-weight:600;';
    const title = document.createElement('span');
    title.textContent = `表单校验提示 (${issues.length})`;
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '×';
    close.title = '关闭校验提示';
    close.style.cssText = 'border:0;background:transparent;color:#909399;font-size:20px;line-height:16px;cursor:pointer;padding:0 2px;';
    close.onclick = () => panel.remove();
    header.append(title, close);
    panel.appendChild(header);

    issues.slice(0, 12).forEach(issue => {
      const item = document.createElement('div');
      item.style.cssText = 'padding:8px 0;border-top:1px solid #f8e3bd;line-height:1.5;';
      const label = document.createElement('div');
      label.style.cssText = 'font-weight:600;color:#606266;';
      label.textContent = issue.label;
      const reason = document.createElement('div');
      reason.style.cssText = 'color:#909399;';
      reason.textContent = issue.reasons.join('；');
      item.append(label, reason);
      panel.appendChild(item);
    });
    if (issues.length > 12) {
      const more = document.createElement('div');
      more.style.cssText = 'padding-top:8px;color:#909399;';
      more.textContent = `另有 ${issues.length - 12} 项未展开`;
      panel.appendChild(more);
    }
    document.body.appendChild(panel);
  }

  function showOperationToast(message, success) {
    const existing = document.getElementById('mock-ext-operation-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'mock-ext-operation-toast';
    toast.textContent = message;
    toast.style.cssText = `position:fixed;right:24px;bottom:24px;z-index:10000001;padding:12px 16px;border-radius:6px;color:#fff;font-size:13px;background:${success ? '#67c23a' : '#e6a23c'};box-shadow:0 8px 22px rgba(0,0,0,.18);pointer-events:none;`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  function showUndoAction(operation) {
    const existing = document.getElementById('mock-ext-undo-action');
    if (existing) existing.remove();
    if (!operation || !operation.snapshots.length) return;
    const action = document.createElement('button');
    action.id = 'mock-ext-undo-action';
    action.type = 'button';
    action.textContent = `撤销本次填充 (${operation.snapshots.length})`;
    action.title = '恢复本次填充前的字段状态';
    action.style.cssText = 'position:fixed;right:24px;bottom:72px;z-index:10000001;padding:9px 12px;border:1px solid #c6e2ff;border-radius:6px;background:#ecf5ff;color:#409eff;font-size:13px;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,.12);';
    action.onclick = () => undoLastFillOperation();
    document.body.appendChild(action);
  }

  function undoLastFillOperation() {
    const operation = lastFillOperation;
    if (!operation || !operation.snapshots.length) {
      showOperationToast('Auto Mock：没有可撤销的填充操作', false);
      return;
    }
    let restored = 0;
    let skipped = 0;
    operation.snapshots.slice().reverse().forEach(snapshot => {
      if (restoreFieldSnapshot(snapshot)) restored++;
      else skipped++;
    });
    lastFillOperation = null;
    const action = document.getElementById('mock-ext-undo-action');
    if (action) action.remove();
    showOperationToast(`Auto Mock：已恢复 ${restored} 项${skipped ? `，跳过 ${skipped} 项` : ''}`, restored > 0);
  }

  function showFillSummary(result) {
    const existing = document.getElementById('mock-ext-fill-summary');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'mock-ext-fill-summary';
    const issueCount = result.validationIssues ? result.validationIssues.length : 0;
    toast.textContent = result.total === 0
      ? 'Auto Mock：未发现可填充字段'
      : `Auto Mock：已填充 ${result.filled} 项，跳过 ${result.skipped} 项${result.failed ? `，失败 ${result.failed} 项` : ''}${issueCount ? `，校验问题 ${issueCount} 项` : ''}`;
    toast.style.cssText = [
      'position:fixed', 'right:24px', 'bottom:24px', 'z-index:10000000',
      'padding:12px 16px', 'border-radius:6px', 'color:#fff', 'font-size:13px',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      `background:${result.filled ? '#67c23a' : '#e6a23c'}`,
      'box-shadow:0 8px 22px rgba(0,0,0,.18)', 'pointer-events:none'
    ].join(';');
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
    showValidationDiagnostics(result.validationIssues);
  }

  function shouldRetrySkippedField(inputEl) {
    const kind = getFieldKind(inputEl);
    return Boolean(
      inputEl.disabled ||
      inputEl.readOnly ||
      inputEl.closest('.is-disabled') ||
      kind === 'semantic-select' ||
      kind === 'cascader' ||
      kind === 'date-picker'
    );
  }

  // ==========================================
  // 5. 批量填充
  // ==========================================
  async function fillElementUiForms(options = {}) {
    const requestedRoot = options.root && isElementVisible(options.root) ? options.root : null;
    const activeDialogRoot = requestedRoot || getActiveDialogRoot();
    const session = options.session || createMockSession();
    const operation = options.operation || session.operation || createFillOperation(options.silent ? 'dynamic' : 'batch');
    session.operation = operation;
    if (session.dynamicFillInProgress) return { total: 0, filled: 0, skipped: 0, failed: 0 };

    const fields = collectFillableFields(activeDialogRoot || document)
      .filter(field => !session.handledFieldElements.has(field.inputEl));
    const result = { total: fields.length, filled: 0, skipped: 0, failed: 0 };
    session.dynamicFillInProgress = true;

    try {
      for (let i = 0; i < fields.length; i++) {
        if (i > 0 && i % 5 === 0) await waitForRender(0);
        try {
          const snapshot = captureFieldSnapshot(fields[i].inputEl);
          const outcome = await fillField(fields[i].inputEl, session);
          if (outcome.status === 'filled') result.filled++;
          else result.skipped++;
          recordOperationSnapshot(operation, snapshot, outcome);
          if (outcome.status === 'filled' || !shouldRetrySkippedField(fields[i].inputEl)) {
            session.handledFieldElements.add(fields[i].inputEl);
          }
        } catch (error) {
          console.warn('[AutoMock] 批量填充字段失败:', error);
          session.handledFieldElements.add(fields[i].inputEl);
          operation.failed++;
          result.failed++;
        }
      }
    } finally {
      session.dynamicFillInProgress = false;
    }
    if (!options.silent && CONFIG.VALIDATE_AFTER_FILL !== false) {
      result.validationIssues = validateFilledForm(activeDialogRoot || document);
    }
    if (!options.silent) {
      if (operation.snapshots.length) lastFillOperation = operation;
      showFillSummary(result);
      showUndoAction(lastFillOperation);
    } else if (operation === lastFillOperation && operation.snapshots.length) {
      showUndoAction(operation);
    }
    if (!activeDialogRoot && options.watchNextDialog !== false) {
      startDeferredDialogFill(session);
    }
    return result;
  }

  // ==========================================
  // 6. 全局原生快捷键挂载 (摆脱浏览器底层限制)
  // ==========================================
  document.addEventListener('keydown', (e) => {
    if (!e.isTrusted) return;
    if (e.altKey && e.key.toLowerCase() === CONFIG.SHORTCUT_SPOTLIGHT.toLowerCase()) {
      e.preventDefault();
      toggleSpotlight();
    } else if (e.altKey && e.key.toLowerCase() === CONFIG.SHORTCUT_FILL_ALL.toLowerCase()) {
      e.preventDefault();
      fillElementUiForms();
    } else if (e.altKey && e.key.toLowerCase() === CONFIG.SHORTCUT_AI_TRIGGER.toLowerCase()) {
      if (CONFIG.AI_MANUAL_TRIGGER_MODE !== false && CONFIG.AI_ENABLE_CLASSIFICATION !== false) {
        e.preventDefault();
        refreshSpotlightRecommendations();
      }
    }
  });

  // ==========================================
  // 7. 偏好设置可视化面板 (Settings UI)
  // ==========================================
  function openSettingsUI() {
    if (document.getElementById('mock-ext-settings')) return;
    const container = document.createElement('div');
    container.id = 'mock-ext-settings';
    container.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.5); z-index: 9999999;
      display: flex; justify-content: center; align-items: center;
    `;
    const panel = document.createElement('div');
    panel.style.cssText = `
      width: 480px; max-height: calc(100vh - 40px); overflow-y: auto; background: #fff; border-radius: 12px; padding: 24px; box-sizing: border-box;
      font-family: -apple-system, sans-serif; color: #333; box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    `;
    panel.innerHTML = `
      <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #2c3e50; font-weight: bold;">⚙️ 高级偏好设置</h2>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: #606266;">独立控制台唤醒快捷键 (Alt + ?)</label>
        <input id="setting-spotlight" maxlength="1" style="width: 100%; padding: 10px; border: 1px solid #dcdfe6; border-radius: 4px; box-sizing: border-box; font-size: 14px; outline: none; transition: border-color .2s;" onfocus="this.style.borderColor='#409eff'" onblur="this.style.borderColor='#dcdfe6'"/>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: #606266;">一键全量填充快捷键 (Alt + ?)</label>
        <input id="setting-fillall" maxlength="1" style="width: 100%; padding: 10px; border: 1px solid #dcdfe6; border-radius: 4px; box-sizing: border-box; font-size: 14px; outline: none; transition: border-color .2s;" onfocus="this.style.borderColor='#409eff'" onblur="this.style.borderColor='#dcdfe6'"/>
      </div>

      <div style="margin-bottom: 15px;">
        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: #606266;">AI 推荐类目快捷键 (Alt + ?)</label>
        <input id="setting-ai-trigger" maxlength="1" style="width: 100%; padding: 10px; border: 1px solid #dcdfe6; border-radius: 4px; box-sizing: border-box; font-size: 14px; outline: none; transition: border-color .2s;" onfocus="this.style.borderColor='#409eff'" onblur="this.style.borderColor='#dcdfe6'"/>
      </div>

      <div style="margin-bottom: 15px;">
        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: #606266;">一键填充拦截黑名单 (关键词用逗号分隔)</label>
        <textarea id="setting-ignore" style="width: 100%; height: 60px; padding: 10px; border: 1px solid #dcdfe6; border-radius: 4px; resize: none; box-sizing: border-box; font-size: 14px; outline: none; transition: border-color .2s; font-family: monospace;" onfocus="this.style.borderColor='#409eff'" onblur="this.style.borderColor='#dcdfe6'"></textarea>
      </div>

      <div style="margin-bottom: 15px;">
        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: #606266;">🔧 自定义扩展数据字典 (JSON 数组)</label>
        <textarea id="setting-dicts" style="width: 100%; height: 80px; padding: 10px; border: 1px solid #dcdfe6; border-radius: 4px; resize: none; box-sizing: border-box; font-size: 13px; outline: none; transition: border-color .2s; font-family: monospace;" placeholder='[\n  { "label": "测试账号", "regex": "账号|account", "values": ["test01", "test02"] }\n]' onfocus="this.style.borderColor='#409eff'" onblur="this.style.borderColor='#dcdfe6'"></textarea>
      </div>

      <div style="margin-bottom: 24px; padding: 14px; border: 1px solid #d9ecff; border-radius: 6px; background: #f5faff;">
        <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #409eff;">站点适配规则</label>
        <div id="setting-site-rule-status" style="font-size:12px; color:#909399; margin-bottom:8px;"></div>
        <textarea id="setting-site-rules" style="width:100%; height:120px; padding:10px; border:1px solid #dcdfe6; border-radius:4px; resize:vertical; box-sizing:border-box; font-size:12px; line-height:1.5; font-family:monospace;" placeholder='[\n  {\n    "name": "示例系统",\n    "hosts": ["*.example.com"],\n    "fieldAliases": { "联系人": "姓名" },\n    "ignoreKeywords": ["内部编号"],\n    "optionSkipKeywords": ["全部"],\n    "inputSelectors": [".custom-input input"],\n    "dialogSelectors": [".custom-dialog"]\n  }\n]'></textarea>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:8px;">
          <button type="button" id="setting-import-site-rules" style="padding:7px 12px; border:1px solid #c6e2ff; border-radius:4px; background:#ecf5ff; color:#409eff; cursor:pointer; font-size:12px;">导入 JSON</button>
          <button type="button" id="setting-export-site-rules" style="padding:7px 12px; border:1px solid #c6e2ff; border-radius:4px; background:#ecf5ff; color:#409eff; cursor:pointer; font-size:12px;">导出 JSON</button>
        </div>
      </div>

      <div style="margin-bottom: 24px; padding: 14px; border: 1px solid #d9ecff; border-radius: 6px; background: #f5faff;">
        <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #409eff;">测试数据场景</label>
        <div style="display:flex; align-items:center; margin-bottom:10px;">
          <span style="width:100px; font-size:13px; color:#606266;">业务类型:</span>
          <select id="setting-data-profile" style="flex:1; padding:8px; border:1px solid #dcdfe6; border-radius:4px; box-sizing:border-box; font-size:13px; background:#fff;">
            <option value="general">通用后台数据</option>
            <option value="employee">员工档案数据</option>
            <option value="enterprise">企业入驻数据</option>
            <option value="order">订单业务数据</option>
          </select>
        </div>
        <div style="display:flex; align-items:center; margin-bottom:10px;">
          <span style="width:100px; font-size:13px; color:#606266;">固定随机种子:</span>
          <input id="setting-random-seed" type="text" placeholder="留空则每次随机" style="flex:1; padding:8px; border:1px solid #dcdfe6; border-radius:4px; box-sizing:border-box; font-size:13px;"/>
        </div>
        <div style="display:flex; align-items:center;">
          <span style="width:100px; font-size:13px; color:#606266;">数值策略:</span>
          <select id="setting-number-strategy" style="flex:1; padding:8px; border:1px solid #dcdfe6; border-radius:4px; box-sizing:border-box; font-size:13px; background:#fff;">
            <option value="normal">正常随机值</option>
            <option value="boundary">最小/最大值交替</option>
          </select>
        </div>
        <div style="display:flex; align-items:center; margin-top:10px;">
          <span style="width:100px; font-size:13px; color:#606266;">填充模式:</span>
          <select id="setting-validation-mode" style="flex:1; padding:8px; border:1px solid #dcdfe6; border-radius:4px; box-sizing:border-box; font-size:13px; background:#fff;">
            <option value="normal">正常数据</option>
            <option value="boundary">边界数据</option>
            <option value="invalid">异常数据（校验用）</option>
          </select>
        </div>
        <label style="display:flex; align-items:center; gap:8px; margin:10px 0 0 100px; font-size:12px; color:#606266;">
          <input type="checkbox" id="setting-validate-after-fill"/>
          填充后检查必填、格式、范围和组件错误态
        </label>
        <div style="margin-top:14px; padding-top:12px; border-top:1px solid #d9ecff;">
          <div style="font-size:13px; font-weight:600; color:#409eff; margin-bottom:10px;">动态流程</div>
          <div style="display:flex; align-items:center; margin-bottom:8px;">
            <span style="width:100px; font-size:13px; color:#606266;">下拉重试次数:</span>
            <input id="setting-option-retries" type="number" min="0" max="10" style="flex:1; padding:8px; border:1px solid #dcdfe6; border-radius:4px; box-sizing:border-box; font-size:13px;"/>
          </div>
          <div style="display:flex; align-items:center; margin-bottom:8px;">
            <span style="width:100px; font-size:13px; color:#606266;">重试间隔(ms):</span>
            <input id="setting-option-delay" type="number" min="50" max="2000" step="50" style="flex:1; padding:8px; border:1px solid #dcdfe6; border-radius:4px; box-sizing:border-box; font-size:13px;"/>
          </div>
          <div style="display:flex; align-items:center; margin-bottom:8px;">
            <span style="width:100px; font-size:13px; color:#606266;">动态窗口(ms):</span>
            <input id="setting-dynamic-window" type="number" min="1000" max="60000" step="1000" style="flex:1; padding:8px; border:1px solid #dcdfe6; border-radius:4px; box-sizing:border-box; font-size:13px;"/>
          </div>
          <div style="display:flex; align-items:center;">
            <span style="width:100px; font-size:13px; color:#606266;">后续弹窗层数:</span>
            <input id="setting-dialog-steps" type="number" min="1" max="10" style="flex:1; padding:8px; border:1px solid #dcdfe6; border-radius:4px; box-sizing:border-box; font-size:13px;"/>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 24px;">
        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: #606266;">🤖 大模型智能交互 (兼容 OpenAI 格式)</label>
        <div class="help-text" style="font-size:12px;color:#909399;margin-bottom:6px;">只要是兼容 OpenAI 格式的 API 都能接入。Key 留空表示保持现有值，勾选清除后关闭 AI。</div>
        <label style="display:flex; align-items:center; gap:8px; font-size:13px; color:#606266; margin-bottom:10px;">
          <input type="checkbox" id="setting-ai-manual-mode"/>
          保留 AI 推荐快捷键（选中字段后，按快捷键刷新当前字段推荐类目）
        </label>
        <label style="display:flex; align-items:center; gap:8px; font-size:13px; color:#606266; margin-bottom:10px;">
          <input type="checkbox" id="setting-ai-enable-classification"/>
          启用 AI 类目推荐；关闭后仅使用本地兜底推荐，不请求 AI，不消耗 Token
        </label>
        <label style="display:flex; align-items:center; gap:8px; font-size:13px; color:#606266; margin-bottom:10px;">
          <input type="checkbox" id="setting-ai-enable-preload"/>
          启用 AI 预加载分类；关闭后仅在打开弹窗时按需请求 AI
        </label>
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="width: 100px; font-size: 13px; color: #606266;">API URL:</span>
          <input type="text" id="setting-deepseek-url" placeholder="https://api.deepseek.com/v1/chat/completions" style="flex:1; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; box-sizing: border-box; font-size: 13px; outline: none;" onfocus="this.style.borderColor='#409eff'" onblur="this.style.borderColor='#dcdfe6'"/>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="width: 100px; font-size: 13px; color: #606266;">Model:</span>
          <input type="text" id="setting-deepseek-model" placeholder="deepseek-v4-flash" style="flex:1; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; box-sizing: border-box; font-size: 13px; outline: none;" onfocus="this.style.borderColor='#409eff'" onblur="this.style.borderColor='#dcdfe6'"/>
        </div>
        <div style="display: flex; align-items: center;">
          <span style="width: 100px; font-size: 13px; color: #606266;">API Key:</span>
          <input type="password" id="setting-deepseek-key" placeholder="sk-..." autocomplete="new-password" style="flex:1; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; box-sizing: border-box; font-size: 13px; outline: none;" onfocus="this.style.borderColor='#409eff'" onblur="this.style.borderColor='#dcdfe6'"/>
        </div>
        <label style="display:flex; align-items:center; gap:8px; margin:8px 0 0 100px; font-size:12px; color:#909399;">
          <input type="checkbox" id="setting-clear-deepseek-key"/>
          清除已保存的 API Key
        </label>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 12px;">
        <button id="setting-cancel" style="padding: 10px 20px; background: #f4f4f5; color: #909399; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all .2s;" onmouseover="this.style.background='#e9e9eb'" onmouseout="this.style.background='#f4f4f5'">取消</button>
        <button id="setting-save" style="padding: 10px 20px; background: #409eff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all .2s;" onmouseover="this.style.background='#66b1ff'" onmouseout="this.style.background='#409eff'">保存并应用</button>
      </div>
    `;
    container.appendChild(panel);
    document.body.appendChild(container);

    const settings = {
      shortcutSpotlight: panel.querySelector('#setting-spotlight'),
      shortcutFillAll: panel.querySelector('#setting-fillall'),
      shortcutAiTrigger: panel.querySelector('#setting-ai-trigger'),
      ignoreKeywords: panel.querySelector('#setting-ignore'),
      customDicts: panel.querySelector('#setting-dicts'),
      siteRules: panel.querySelector('#setting-site-rules'),
      siteRuleStatus: panel.querySelector('#setting-site-rule-status'),
      importSiteRules: panel.querySelector('#setting-import-site-rules'),
      exportSiteRules: panel.querySelector('#setting-export-site-rules'),
      dataProfile: panel.querySelector('#setting-data-profile'),
      randomSeed: panel.querySelector('#setting-random-seed'),
      numberStrategy: panel.querySelector('#setting-number-strategy'),
      validationMode: panel.querySelector('#setting-validation-mode'),
      validateAfterFill: panel.querySelector('#setting-validate-after-fill'),
      optionRetries: panel.querySelector('#setting-option-retries'),
      optionDelay: panel.querySelector('#setting-option-delay'),
      dynamicWindow: panel.querySelector('#setting-dynamic-window'),
      dialogSteps: panel.querySelector('#setting-dialog-steps'),
      aiManualMode: panel.querySelector('#setting-ai-manual-mode'),
      aiClassification: panel.querySelector('#setting-ai-enable-classification'),
      aiPreload: panel.querySelector('#setting-ai-enable-preload'),
      apiUrl: panel.querySelector('#setting-deepseek-url'),
      apiModel: panel.querySelector('#setting-deepseek-model'),
      apiKey: panel.querySelector('#setting-deepseek-key'),
      clearApiKey: panel.querySelector('#setting-clear-deepseek-key'),
      cancel: panel.querySelector('#setting-cancel'),
      save: panel.querySelector('#setting-save')
    };

    settings.shortcutSpotlight.value = CONFIG.SHORTCUT_SPOTLIGHT || 'x';
    settings.shortcutFillAll.value = CONFIG.SHORTCUT_FILL_ALL || 'z';
    settings.shortcutAiTrigger.value = CONFIG.SHORTCUT_AI_TRIGGER || 's';
    settings.ignoreKeywords.value = (Array.isArray(CONFIG.IGNORE_KEYWORDS) ? CONFIG.IGNORE_KEYWORDS : DEFAULT_CONFIG.IGNORE_KEYWORDS).join(', ');
    settings.customDicts.value = Array.isArray(CONFIG.CUSTOM_DICTS) && CONFIG.CUSTOM_DICTS.length > 0
      ? JSON.stringify(CONFIG.CUSTOM_DICTS, null, 2)
      : '';
    settings.siteRules.value = JSON.stringify(normalizeSiteRules(CONFIG.SITE_RULES), null, 2);
    const activeSiteRule = getActiveSiteRule();
    settings.siteRuleStatus.textContent = activeSiteRule
      ? `当前域名 ${window.location.hostname} 已匹配规则：${activeSiteRule.name}`
      : `当前域名 ${window.location.hostname} 未匹配站点规则`;
    settings.dataProfile.value = DATA_PROFILES[CONFIG.DATA_PROFILE] ? CONFIG.DATA_PROFILE : 'general';
    settings.randomSeed.value = CONFIG.RANDOM_SEED || '';
    settings.numberStrategy.value = CONFIG.NUMBER_FILL_STRATEGY === 'boundary' ? 'boundary' : 'normal';
    settings.validationMode.value = getValidationFillMode();
    settings.validateAfterFill.checked = CONFIG.VALIDATE_AFTER_FILL !== false;
    settings.optionRetries.value = getBoundedConfigNumber(CONFIG.REMOTE_OPTION_RETRY_COUNT, 4, 0, 10);
    settings.optionDelay.value = getBoundedConfigNumber(CONFIG.REMOTE_OPTION_RETRY_DELAY_MS, 250, 50, 2000);
    settings.dynamicWindow.value = getBoundedConfigNumber(CONFIG.DYNAMIC_FILL_WINDOW_MS, 8000, 1000, 60000);
    settings.dialogSteps.value = getBoundedConfigNumber(CONFIG.DYNAMIC_FILL_MAX_DIALOG_STEPS, 3, 1, 10);
    settings.aiManualMode.checked = CONFIG.AI_MANUAL_TRIGGER_MODE !== false;
    settings.aiClassification.checked = CONFIG.AI_ENABLE_CLASSIFICATION !== false;
    settings.aiPreload.checked = CONFIG.AI_ENABLE_PRELOAD === true;
    settings.apiUrl.value = CONFIG.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    settings.apiModel.value = CONFIG.DEEPSEEK_API_MODEL || 'deepseek-v4-flash';
    settings.apiKey.value = '';
    settings.apiKey.placeholder = CONFIG.DEEPSEEK_API_KEY ? '已配置，留空保持不变' : 'sk-...';
    settings.clearApiKey.disabled = !CONFIG.DEEPSEEK_API_KEY;

    settings.importSiteRules.onclick = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';
      input.onchange = () => {
        const file = input.files && input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const rules = parseSiteRulesText(reader.result);
            settings.siteRules.value = JSON.stringify(rules, null, 2);
          } catch (error) {
            alert(`站点规则导入失败：${error.message}`);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    };
    settings.exportSiteRules.onclick = () => {
      try {
        const rules = parseSiteRulesText(settings.siteRules.value);
        const blob = new Blob([JSON.stringify(rules, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'auto-mock-site-rules.json';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 0);
      } catch (error) {
        alert(`站点规则导出失败：${error.message}`);
      }
    };
    settings.cancel.onclick = () => container.remove();
    settings.save.onclick = () => {
      CONFIG.SHORTCUT_SPOTLIGHT = settings.shortcutSpotlight.value.toLowerCase() || 'x';
      CONFIG.SHORTCUT_FILL_ALL = settings.shortcutFillAll.value.toLowerCase() || 'z';
      CONFIG.SHORTCUT_AI_TRIGGER = settings.shortcutAiTrigger.value.toLowerCase() || 's';
      const ignores = settings.ignoreKeywords.value.split(',').map(s => s.trim()).filter(Boolean);
      CONFIG.IGNORE_KEYWORDS = ignores.length ? ignores : DEFAULT_CONFIG.IGNORE_KEYWORDS;
      CONFIG.AI_MANUAL_TRIGGER_MODE = settings.aiManualMode.checked;
      CONFIG.AI_ENABLE_CLASSIFICATION = settings.aiClassification.checked;
      CONFIG.AI_ENABLE_PRELOAD = settings.aiPreload.checked;
      
      const dictText = settings.customDicts.value.trim();
      let parsedDicts = [];
      if (dictText) {
        try {
          parsedDicts = JSON.parse(dictText);
          if (!Array.isArray(parsedDicts)) throw new Error("Not an array");
        } catch (e) {
          alert("自定义字典 JSON 格式错误，请检查！\n" + e.message);
          return;
        }
      }
      const siteRuleText = settings.siteRules.value.trim() || '[]';
      let parsedSiteRules;
      try {
        parsedSiteRules = parseSiteRulesText(siteRuleText);
      } catch (error) {
        alert(`站点规则 JSON 格式错误，请检查！\n${error.message}`);
        return;
      }
      CONFIG.CUSTOM_DICTS = parsedDicts;
      CONFIG.SITE_RULES = parsedSiteRules;
      CONFIG.DATA_PROFILE = DATA_PROFILES[settings.dataProfile.value] ? settings.dataProfile.value : 'general';
      CONFIG.RANDOM_SEED = settings.randomSeed.value.trim();
      CONFIG.NUMBER_FILL_STRATEGY = settings.numberStrategy.value === 'boundary' ? 'boundary' : 'normal';
      CONFIG.FILL_VALIDATION_MODE = ['normal', 'boundary', 'invalid'].includes(settings.validationMode.value)
        ? settings.validationMode.value
        : 'normal';
      CONFIG.VALIDATE_AFTER_FILL = settings.validateAfterFill.checked;
      CONFIG.REMOTE_OPTION_RETRY_COUNT = getBoundedConfigNumber(settings.optionRetries.value, 4, 0, 10);
      CONFIG.REMOTE_OPTION_RETRY_DELAY_MS = getBoundedConfigNumber(settings.optionDelay.value, 250, 50, 2000);
      CONFIG.DYNAMIC_FILL_WINDOW_MS = getBoundedConfigNumber(settings.dynamicWindow.value, 8000, 1000, 60000);
      CONFIG.DYNAMIC_FILL_MAX_DIALOG_STEPS = getBoundedConfigNumber(settings.dialogSteps.value, 3, 1, 10);
      CONFIG.DEEPSEEK_API_URL = settings.apiUrl.value.trim() || 'https://api.deepseek.com/v1/chat/completions';
      CONFIG.DEEPSEEK_API_MODEL = settings.apiModel.value.trim() || 'deepseek-v4-flash';
      const nextApiKey = settings.apiKey.value.trim();
      if (settings.clearApiKey.checked) {
        CONFIG.DEEPSEEK_API_KEY = '';
      } else if (nextApiKey) {
        CONFIG.DEEPSEEK_API_KEY = nextApiKey;
      }

      if (typeof GM_setValue !== 'undefined') {
        GM_setValue('auto_mock_config', CONFIG);
      }
      container.remove();
      alert('✅ 高级偏好设置已保存！');
    };
  }

  if (typeof GM_registerMenuCommand !== 'undefined') {
    GM_registerMenuCommand('⚙️ 高级偏好设置', openSettingsUI);
    GM_registerMenuCommand('↶ 撤销最近一次填充', undoLastFillOperation);
  }

})();
