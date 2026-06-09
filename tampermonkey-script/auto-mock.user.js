// ==UserScript==
// @name         Auto Mock Test Data
// @namespace    http://tampermonkey.net/
// @version      1.2.0
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
  console.log("Auto Mock UserScript loaded.");

  // ==========================================
  // [用户配置区] 扩展动态配置参数
  // ==========================================
  const DEFAULT_CONFIG = {
    SHORTCUT_SPOTLIGHT: 'x',
    SHORTCUT_FILL_ALL: 'z',
    SHORTCUT_AI_TRIGGER: 'a',
    AI_MANUAL_TRIGGER_MODE: true,
    IGNORE_KEYWORDS: ['id', '创建', '更新', '主键', '忽略', '只读', '序号', 'id_', '_id', 'created', 'updated'],
    CUSTOM_DICTS: [],
    DEEPSEEK_API_URL: 'https://api.deepseek.com/v1/chat/completions',
    DEEPSEEK_API_MODEL: 'deepseek-v4-flash',
    DEEPSEEK_API_KEY: ''
  };

  let CONFIG = (typeof GM_getValue !== 'undefined') ? GM_getValue('auto_mock_config', DEFAULT_CONFIG) : DEFAULT_CONFIG;
  CONFIG = { ...DEFAULT_CONFIG, ...(CONFIG || {}) };

  // ==========================================
  // 1. 高阶内置 Mock 数据工厂 (Mock Engine)
  // ==========================================
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
      const region = ['110101','310101','440101','350203','440304'];
      const date = `19${Math.floor(Math.random() * 30 + 70)}${String(Math.floor(Math.random() * 11 + 1)).padStart(2, '0')}${String(Math.floor(Math.random() * 27 + 1)).padStart(2, '0')}`;
      const suffix = Math.floor(Math.random() * 9000 + 1000).toString();
      return region[Math.floor(Math.random() * region.length)] + date + suffix;
    },
    bankCard: () => {
      const len = Math.random() > 0.5 ? 14 : 17;
      let card = '62';
      for(let i=0; i<len; i++) card += Math.floor(Math.random() * 10);
      return card;
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
      const chars = "0123456789ABCDEFGHJKLMNPQRTUWXY";
      let code = "91" + ['11','31','44','35','33'][Math.floor(Math.random() * 5)] + "0100M" + (Math.random().toString(36).substring(2, 11).toUpperCase());
      while(code.length < 18) code += chars.charAt(Math.floor(Math.random() * chars.length));
      return code.substring(0, 18);
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
    age: () => Math.floor(Math.random() * 43) + 18,
    amount: () => (Math.random() * 9999).toFixed(2),
    color: () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
  };

  const predictMockType = (label) => {
    label = (label || '').toLowerCase();
    if (CONFIG.CUSTOM_DICTS && CONFIG.CUSTOM_DICTS.length > 0) {
      for (let i = 0; i < CONFIG.CUSTOM_DICTS.length; i++) {
        let dict = CONFIG.CUSTOM_DICTS[i];
        if (dict.regex) {
          try {
            if (new RegExp(dict.regex, 'i').test(label)) {
              return { cmd: '__custom_' + i, name: dict.label || '自定义值' };
            }
          } catch (e) {
            console.error("Auto Mock Regex Error:", e);
          }
        }
      }
    }
    if (/姓名|名字|人名|称呼|人|name|user/.test(label)) return {cmd: 'name', name: '人名'};
    if (/英文名|english/.test(label)) return {cmd: 'englishName', name: '英文名'};
    if (/手机|电话|联系方式|联系号码|phone|mobile|tel/.test(label)) return {cmd: 'phone', name: '手机号'};
    if (/邮箱|邮件|email|e-mail|mail/.test(label)) return {cmd: 'email', name: '邮箱'};
    if (/身份证|证件号|idcard|id_card/.test(label)) return {cmd: 'idcard', name: '身份证'};
    if (/年龄|age/.test(label)) return {cmd: 'age', name: '年龄'};
    if (/信用代码|企业代码|credit/.test(label)) return {cmd: 'creditCode', name: '信用代码'};
    if (/公司|企业|单位|company/.test(label)) return {cmd: 'company', name: '企业名称'};
    if (/车牌|license_plate/.test(label)) return {cmd: 'licensePlate', name: '车牌号'};
    if (/邮编|zipcode|postal/.test(label)) return {cmd: 'zipCode', name: '邮政编码'};
    if (/ip地址|ipv4|ip_/.test(label)) return {cmd: 'ipv4', name: 'IP地址'};
    if (/mac|物理地址/.test(label)) return {cmd: 'mac', name: 'MAC地址'};
    if (/密码|password|pwd/.test(label)) return {cmd: 'password', name: '强密码'};
    if (/颜色|color/.test(label)) return {cmd: 'color', name: '颜色值'};
    if (/卡号|银行卡|账号|account|card/.test(label)) return {cmd: 'bankCard', name: '银行卡'};
    if (/头衔|职务|岗位|职位|职称|title|position|job/.test(label)) return {cmd: 'title', name: '职务头衔'};
    if (/地址|地点|区域|省|市|区|address|location|region/.test(label)) return {cmd: 'address', name: '详细地址'};
    if (/网址|链接|主页|url|website|link/.test(label)) return {cmd: 'url', name: '随机链接'};
    if (/日期|时间|date|time/.test(label)) return {cmd: 'date', name: '日期'};
    if (/文本|描述|备注|详情|内容|text|desc|content|remark/.test(label)) return {cmd: 'text', name: '文本段落'};
    if (/金额|钱|元|amount|money/.test(label)) return {cmd: 'amount', name: '金额'};
    if (/数字|数量|金额|库存|总数|价格|num|count|price/.test(label)) return {cmd: 'number', name: '数字'};
    return null;
  };

  const resolveMockType = (label) => {
    const prediction = predictMockType(label);
    if (prediction && prediction.cmd) {
      if (prediction.cmd.startsWith('__custom_')) {
        const idx = parseInt(prediction.cmd.replace('__custom_', ''), 10);
        const dict = CONFIG.CUSTOM_DICTS[idx];
        if (dict && dict.values && dict.values.length > 0) return dict.values[Math.floor(Math.random() * dict.values.length)];
      } else if (MockFactory[prediction.cmd]) {
        return MockFactory[prediction.cmd]();
      }
    }
    return MockFactory.randomString();
  };

  // ==========================================
  // 3. 业务组件自定义挂载钩子 (Custom Component Hooks)
  // ==========================================
  const CustomHooks = {
    ElSelect: (vueInstance) => {
      if (vueInstance.options && vueInstance.options.length > 0) {
        const validOptions = vueInstance.options.filter(opt => !opt.disabled);
        if (validOptions.length > 0) {
          const randomOpt = validOptions[Math.floor(Math.random() * validOptions.length)];
          vueInstance.$emit('input', randomOpt.value);
          vueInstance.$emit('change', randomOpt.value);
          return true;
        }
      }
      return false;
    },
    ElDatePicker: (vueInstance) => {
      const now = new Date();
      vueInstance.$emit('input', now);
      vueInstance.$emit('change', now);
      return true;
    },
    ElTimePicker: (vueInstance) => {
      const now = new Date();
      vueInstance.$emit('input', now);
      vueInstance.$emit('change', now);
      return true;
    },
    ElSwitch: (vueInstance) => {
      vueInstance.$emit('input', true);
      vueInstance.$emit('change', true);
      return true;
    },
    ElRadioGroup: (vueInstance) => {
      if (vueInstance.$children) {
        const children = vueInstance.$children.filter(c => c.$options.name === 'ElRadio' && !c.disabled);
        if (children.length > 0) {
          const randomOpt = children[Math.floor(Math.random() * children.length)];
          vueInstance.$emit('input', randomOpt.label);
          vueInstance.$emit('change', randomOpt.label);
          return true;
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

  function isAiManualMode() {
    return Boolean(CONFIG.DEEPSEEK_API_KEY) && CONFIG.AI_MANUAL_TRIGGER_MODE !== false;
  }

  function getAiShortcutText() {
    return `Alt+${(CONFIG.SHORTCUT_AI_TRIGGER || 'a').toUpperCase()}`;
  }

  function isAiSuggestionComponent(componentName) {
    return componentName === 'ElSelect' || componentName === 'ElRadioGroup';
  }

  function isLocalOnlyHookComponent(componentName) {
    return componentName === 'ElDatePicker' || componentName === 'ElTimePicker' || componentName === 'ElSwitch';
  }

  function createHookFillAction(vueInstance, componentName, labelText) {
    if (!CustomHooks[componentName]) return null;
    return () => CustomHooks[componentName](vueInstance, labelText);
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
          apply: () => {
            vueInstance.$emit('input', opt.value);
            vueInstance.$emit('change', opt.value);
            return true;
          }
        }))
        .filter(opt => opt.label);
    }

    if (componentName === 'ElRadioGroup' && Array.isArray(vueInstance.$children)) {
      return vueInstance.$children
        .filter(child => child && child.$options && child.$options.name === 'ElRadio' && !child.disabled)
        .map(child => ({
          label: String(child.label == null ? '' : child.label).trim(),
          value: child.label,
          apply: () => {
            vueInstance.$emit('input', child.label);
            vueInstance.$emit('change', child.label);
            return true;
          }
        }))
        .filter(opt => opt.label);
    }

    return [];
  }

  function buildAiPromptText(labelText, vueInstance, componentName) {
    if (!isAiSuggestionComponent(componentName)) return labelText;

    const options = getCandidateOptions(vueInstance, componentName);
    if (options.length === 0) return labelText;

    const optionLabels = options.slice(0, 20).map(opt => opt.label);
    return `${labelText}\n候选项：${optionLabels.join('、')}\n请只返回候选项中的一个原文，不要解释。`;
  }

  function matchAiSuggestionToOption(aiText, vueInstance, componentName) {
    const options = getCandidateOptions(vueInstance, componentName);
    if (options.length === 0) return null;

    const aiNormalized = normalizeCandidateText(aiText);
    if (!aiNormalized) return null;

    let bestOption = null;
    let bestScore = -1;

    options.forEach(option => {
      const labelNormalized = normalizeCandidateText(option.label);
      const valueNormalized = normalizeCandidateText(option.value);
      let score = -1;

      if (aiNormalized === labelNormalized || (valueNormalized && aiNormalized === valueNormalized)) {
        score = 100;
      } else if (labelNormalized.includes(aiNormalized) || aiNormalized.includes(labelNormalized)) {
        score = 80;
      } else if (valueNormalized && (valueNormalized.includes(aiNormalized) || aiNormalized.includes(valueNormalized))) {
        score = 75;
      } else {
        const uniqueChars = Array.from(new Set(aiNormalized.split('')));
        score = uniqueChars.reduce((total, char) => total + (labelNormalized.includes(char) ? 1 : 0), 0);
      }

      if (score > bestScore) {
        bestScore = score;
        bestOption = option;
      }
    });

    return bestScore >= 2 ? bestOption : null;
  }

  // === DeepSeek 通信核心 ===
  const deepseekCache = new Map();

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

  function askDeepSeek(label, promptText) {
    return new Promise((resolve) => {
      if (!CONFIG.DEEPSEEK_API_KEY) return resolve(null);
      if (typeof GM_xmlhttpRequest === 'undefined') {
        console.error("[AutoMock AI] 当前环境不支持 GM_xmlhttpRequest，无法发起跨域大模型请求。");
        return resolve({ error: "由于环境限制 (非原生油猴)，无法发起跨域请求。" });
      }
      const promptKey = promptText || label;
      if (deepseekCache.has(promptKey)) return resolve(deepseekCache.get(promptKey));
      
      const requestUrl = CONFIG.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
      const requestBody = {
        model: CONFIG.DEEPSEEK_API_MODEL || "deepseek-v4-flash",
        messages: [
          { role: "system", content: "你是一个测试数据生成器。只需输出测试数据本身，绝对不要输出任何解释、思维过程、前言或后记！不要Markdown标记！纯文本结果尽量短于15个字符。" },
          { role: "user", content: `字段名：${promptKey}` }
        ],
        temperature: 0.1,
        max_tokens: 200
      };
      if (isOfficialDeepSeekApi(requestUrl)) {
        requestBody.thinking = { type: "disabled" };
      }

      console.log(`[AutoMock AI] 发起请求: 字段名="${label}"`);
      GM_xmlhttpRequest({
        method: 'POST',
        url: requestUrl,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.DEEPSEEK_API_KEY}`
        },
        data: JSON.stringify(requestBody),
        onload: function(res) {
          console.log(`[AutoMock AI] 收到响应: HTTP ${res.status}`, res.responseText);
          if (res.status !== 200) {
            console.error("[AutoMock AI] API Error:", res.status, res.responseText);
            let errMsg = `HTTP ${res.status}`;
            if (res.responseText) {
              try {
                let errData = JSON.parse(res.responseText);
                if (errData.error && errData.error.message) errMsg += ": " + errData.error.message;
              } catch(e) {}
            }
            return resolve({ error: errMsg });
          }
          if (!res.responseText) {
             console.error("DeepSeek Empty Response");
             return resolve({ error: "服务器返回了空内容" });
          }
          try {
            console.log("[AutoMock AI] 准备解析 JSON:", res.responseText);
            const data = JSON.parse(res.responseText);
            console.log("[AutoMock AI] JSON 解析成功:", data);
            const extracted = extractDeepSeekResult(data);
            if (extracted.value) {
              console.log("[AutoMock AI] 提取结果:", extracted.value);
              deepseekCache.set(promptKey, extracted.value);
              resolve(extracted.value);
            } else {
              console.error("[AutoMock AI] 可填结果为空:", extracted.error, data);
              resolve({ error: extracted.error });
            }
          } catch(e) { 
            console.error("[AutoMock AI] 解析响应失败:", e, res.responseText);
            resolve({ error: "解析JSON异常: " + String(e) });
          }
        },
        onerror: function(err) { 
          console.error("[AutoMock AI] 网络请求失败:", err);
          resolve({ error: "网络请求失败，可能是跨域或服务无法访问" });
        }
      });
    });
  }

  // ==========================================
  // 3. 无感填入气泡 (Smart Bubble)
  // ==========================================
  let activeBubble = null;
  let spotlightTargetElement = null;
  let currentBubbleSessionId = 0;

  function getVueInstance(input) {
    let vueInstance = null;
    const advancedWrapper = input.closest('.el-select, .el-date-editor, .el-cascader, .el-radio-group, .el-switch');
    if (advancedWrapper && advancedWrapper.__vue__) {
      vueInstance = advancedWrapper.__vue__;
    } else {
      const inputWrapper = input.closest('.el-input, .el-textarea');
      if (inputWrapper && inputWrapper.__vue__) {
        vueInstance = inputWrapper.__vue__;
      } else {
        vueInstance = input.__vue__;
      }
    }
    return vueInstance;
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
    return labelText.trim();
  }


  
  function hideSmartBubble() {
    if (activeBubble) {
      if (activeBubble._posInterval) clearInterval(activeBubble._posInterval);
      activeBubble.remove();
      activeBubble = null;
    }
  }

  function setBubbleTheme(bubble, theme) {
    const themes = {
      default: { background: 'rgba(64, 158, 255, 0.95)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' },
      success: { background: '#e1f3d8', color: '#67c23a', borderColor: '#c2e7b0' },
      warning: { background: '#fdf6ec', color: '#e6a23c', borderColor: '#faecd8' },
      error: { background: '#fef0f0', color: '#f56c6c', borderColor: '#fbc4c4' }
    };
    const current = themes[theme] || themes.default;
    bubble.style.background = current.background;
    bubble.style.color = current.color;
    bubble.style.borderColor = current.borderColor;
    bubble.style.textShadow = 'none';
    bubble.onmouseout = () => {
      bubble.style.background = current.background;
      bubble.style.color = current.color;
      bubble.style.borderColor = current.borderColor;
      bubble.style.transform = 'scale(1)';
    };
  }

  function triggerFocusedFieldAi() {
    if (!CONFIG.DEEPSEEK_API_KEY) return;
    const target = spotlightTargetElement || document.activeElement;
    if (!target || (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA')) return;
    showSmartBubble(target, { forceAi: true });
  }

  async function showSmartBubble(inputEl, options = {}) {
    hideSmartBubble();
    const { forceAi = false } = options;
    const vueInstance = getVueInstance(inputEl);
    
    const isNativeDisabled = inputEl.disabled || inputEl.hasAttribute('disabled') || inputEl.closest('.is-disabled');
    const isVueDisabled = vueInstance && (vueInstance.disabled || vueInstance.inputDisabled || vueInstance.selectDisabled);
    if (isNativeDisabled || isVueDisabled) return;

    const componentName = vueInstance && vueInstance.$options ? vueInstance.$options.name : '';
    if (inputEl.readOnly || inputEl.hasAttribute('readonly')) {
      if (!CustomHooks[componentName]) return;
    }

    const labelText = getLabelForInput(inputEl, vueInstance);
    
    let vModelExpr = '';
    if (vueInstance && vueInstance.$vnode && vueInstance.$vnode.data && vueInstance.$vnode.data.model) {
      vModelExpr = vueInstance.$vnode.data.model.expression || '';
    }
    const ignoreList = CONFIG.IGNORE_KEYWORDS || ['id', '创建', '更新', '主键', '忽略', '只读', '序号', 'id_', '_id', 'created', 'updated'];
    const isIgnored = ignoreList.some(keyword => {
      const kw = keyword.toLowerCase();
      return labelText.toLowerCase().includes(kw) || (vModelExpr && vModelExpr.toLowerCase().includes(kw));
    });
    if (isIgnored) return;

    let bubbleAction = null;
    let displayText = null;
    let shouldRunAi = false;
    const hookAction = createHookFillAction(vueInstance, componentName, labelText);
    const supportsAiSuggestion = isAiSuggestionComponent(componentName);
    const localHookName = LocalHookDisplayNames[componentName] || '推荐值';

    if (CONFIG.DEEPSEEK_API_KEY && !isLocalOnlyHookComponent(componentName)) {
      if (forceAi || !isAiManualMode()) {
        displayText = supportsAiSuggestion ? '✨ AI 匹配候选项中...' : '✨ AI 思考中...';
        shouldRunAi = true;
      } else {
        displayText = supportsAiSuggestion ? `✨ ${getAiShortcutText()} AI匹配候选项` : `✨ ${getAiShortcutText()} AI填充当前字段`;
      }
    } else if (hookAction) {
      displayText = `✨ 填入${localHookName}`;
      bubbleAction = hookAction;
    } else {
      const prediction = predictMockType(labelText);
      if (!prediction) return;
      displayText = `✨ 填入${prediction.name}`;
      bubbleAction = () => {
        executeSpotlightCommand(prediction.cmd);
        return true;
      };
    }

    const sessionId = ++currentBubbleSessionId;

    const bubble = document.createElement('div');
    bubble.id = 'mock-ext-smart-bubble';
    bubble.innerText = displayText;
    bubble.style.cssText = `
      position: fixed !important;
      background: rgba(64, 158, 255, 0.95) !important;
      color: #fff !important;
      padding: 5px 12px !important;
      border-radius: 14px !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      cursor: pointer !important;
      z-index: 2147483647 !important;
      box-shadow: 0 4px 12px rgba(64,158,255,0.4) !important;
      font-family: sans-serif !important;
      transition: all 0.2s !important;
      user-select: none !important;
      backdrop-filter: blur(4px) !important;
      pointer-events: auto !important;
      line-height: 1.5 !important;
      white-space: nowrap !important;
      border: 1px solid rgba(255,255,255,0.2) !important;
    `;
    
    bubble.onmouseover = () => { bubble.style.background = '#66b1ff'; bubble.style.transform = 'scale(1.05)'; };
    setBubbleTheme(bubble, 'default');
    if (CONFIG.DEEPSEEK_API_KEY && isAiManualMode() && !shouldRunAi) {
      bubble.title = `按 ${getAiShortcutText()} 后才会发起 AI 请求`;
    }
    bubble.onmousedown = (e) => {
      e.preventDefault();
      if (bubble.dataset.loading === 'true') return;
      if (bubble.innerText.startsWith('❌') && !bubbleAction) return hideSmartBubble();
      if (!bubbleAction) return;

      const result = bubbleAction();
      if (result === false) {
        bubble.innerText = '❌ 当前字段未成功填入';
        bubble.title = '未找到可用选项或组件拒绝写入';
        setBubbleTheme(bubble, 'error');
        setTimeout(hideSmartBubble, 2500);
        return;
      }

      spotlightTargetElement = inputEl;
      bubble.innerText = '✅ 已填入';
      setBubbleTheme(bubble, 'success');
      setTimeout(hideSmartBubble, 800);
    };

    document.body.appendChild(bubble);
    activeBubble = bubble;

    const updatePosition = () => {
      if (!activeBubble || !document.body.contains(inputEl)) return hideSmartBubble();
      const rect = inputEl.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return hideSmartBubble();
      const bHeight = activeBubble.offsetHeight || 28;
      const bWidth = activeBubble.offsetWidth || 100;
      activeBubble.style.top = (rect.top - bHeight - 4) + 'px';
      activeBubble.style.left = (rect.right - bWidth) + 'px';
    };
    updatePosition();
    activeBubble._posInterval = setInterval(updatePosition, 100);

    if (shouldRunAi) {
      bubble.dataset.loading = 'true';
      const aiPromptText = buildAiPromptText(labelText, vueInstance, componentName);
      const aiVal = await askDeepSeek(labelText, aiPromptText);
      if (sessionId !== currentBubbleSessionId) return; // 焦点已移走
      bubble.dataset.loading = 'false';
      if (typeof aiVal === 'string' && aiVal.trim()) {
        if (supportsAiSuggestion) {
          const matchedOption = matchAiSuggestionToOption(aiVal, vueInstance, componentName);
          if (matchedOption) {
            bubbleAction = matchedOption.apply;
            bubble.innerText = `✨ 建议选择：${matchedOption.label}`;
            bubble.title = `AI建议：${aiVal}`;
            setBubbleTheme(bubble, 'success');
          } else if (hookAction) {
            bubbleAction = hookAction;
            bubble.innerText = `❌ AI未命中候选项，点击改用${localHookName}`;
            bubble.title = `AI建议：${aiVal}`;
            setBubbleTheme(bubble, 'warning');
          } else {
            bubbleAction = null;
            bubble.innerText = `❌ AI未命中候选项：${aiVal.substring(0,40)}`;
            bubble.title = aiVal;
            setBubbleTheme(bubble, 'error');
            setTimeout(hideSmartBubble, 4000);
            return;
          }
        } else {
          bubbleAction = () => {
            fillElement(inputEl, aiVal);
            return true;
          };
          bubble.innerText = `✨ 填入：${aiVal}`;
          bubble.title = aiVal;
          setBubbleTheme(bubble, 'success');
        }
      } else {
        const fallbackPrediction = !hookAction ? predictMockType(labelText) : null;
        if (hookAction) {
          bubbleAction = hookAction;
          bubble.innerText = aiVal && aiVal.error
            ? `❌ AI失败，点击改用${localHookName}`
            : `✨ 点击改用${localHookName}`;
          bubble.title = aiVal.error;
          setBubbleTheme(bubble, 'warning');
        } else if (fallbackPrediction) {
          bubbleAction = () => {
            executeSpotlightCommand(fallbackPrediction.cmd);
            return true;
          };
          bubble.innerText = aiVal && aiVal.error
            ? `❌ AI失败，点击改填${fallbackPrediction.name}`
            : `✨ 填入${fallbackPrediction.name}`;
          bubble.title = aiVal && aiVal.error ? aiVal.error : '';
          setBubbleTheme(bubble, 'warning');
        } else if (aiVal && aiVal.error) {
          bubble.innerText = `❌ AI错误: ${aiVal.error.substring(0,80)}`;
          bubble.title = aiVal.error;
          setBubbleTheme(bubble, 'error');
          setTimeout(hideSmartBubble, 4000);
          return;
        } else {
          hideSmartBubble();
          return;
        }
      }
      updatePosition();
    }
  }

  // 持续跟踪全局最后一个处于聚焦状态的输入框
  document.addEventListener('focusin', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
      spotlightTargetElement = e.target;
      setTimeout(() => showSmartBubble(e.target), 10);
    }
  }, true);

  document.addEventListener('mousedown', (e) => {
    if (activeBubble && e.target !== activeBubble && e.target !== spotlightTargetElement) {
      hideSmartBubble();
    }
  });

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
    title.innerText = '⚡ 选择要填入的数据格式';
    title.style.cssText = 'font-size: 16px; color: #333; margin-bottom: 20px; font-weight: bold; user-select: none; text-align: center;';
    panel.appendChild(title);

    let mockGroups = [
      {
        title: '👤 个人信息',
        items: [
          { label: '人名', cmd: 'name' },
          { label: '英文名', cmd: 'englishName' },
          { label: '身份证', cmd: 'idcard' },
          { label: '年龄', cmd: 'age' },
          { label: '手机号', cmd: 'phone' },
          { label: '邮箱', cmd: 'email' }
        ]
      },
      {
        title: '🏢 企业与资产',
        items: [
          { label: '企业名称', cmd: 'company' },
          { label: '信用代码', cmd: 'creditCode' },
          { label: '职务头衔', cmd: 'title' },
          { label: '车牌号', cmd: 'licensePlate' },
          { label: '银行卡', cmd: 'bankCard' },
          { label: '金额数值', cmd: 'amount' }
        ]
      },
      {
        title: '🌐 网络与位置',
        items: [
          { label: '详细地址', cmd: 'address' },
          { label: '邮政编码', cmd: 'zipCode' },
          { label: 'IP地址', cmd: 'ipv4' },
          { label: 'MAC地址', cmd: 'mac' },
          { label: '随机链接', cmd: 'url' },
          { label: '强密码', cmd: 'password' }
        ]
      },
      {
        title: '📝 日期与文本',
        items: [
          { label: '日期', cmd: 'date' },
          { label: '时间', cmd: 'time' },
          { label: '随机数字', cmd: 'number' },
          { label: '颜色值', cmd: 'color' },
          { label: '长文本段落', cmd: 'text' }
        ]
      }
    ];

    // --- 智能化匹配逻辑 ---
    if (spotlightTargetElement) {
      const vueInstance = getVueInstance(spotlightTargetElement);
      const labelText = getLabelForInput(spotlightTargetElement, vueInstance);
      const prediction = predictMockType(labelText);
      if (prediction) {
        mockGroups.unshift({
          title: '✨ 智能推荐 (基于当前焦点)',
          isRecommended: true,
          items: [
            { label: prediction.name, cmd: prediction.cmd }
          ]
        });
      }
    }

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
    
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
      spotlightTargetElement = document.activeElement;
    }
    
    // 强制每次重建DOM以实现智能推荐
    createSpotlightUI();
    container = document.getElementById('mock-ext-spotlight');
    container.style.display = 'flex';
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
    if (!spotlightTargetElement || (spotlightTargetElement.tagName !== 'INPUT' && spotlightTargetElement.tagName !== 'TEXTAREA')) {
      alert("Auto Mock: 请先将光标点击聚焦到需要插入的输入框内，再唤出控制台！");
      return;
    }

    const inputEl = spotlightTargetElement;
    let mockValue = '';
    
    if (cmd.startsWith('__custom_')) {
      const idx = parseInt(cmd.replace('__custom_', ''), 10);
      const dict = CONFIG.CUSTOM_DICTS[idx];
      if (dict && dict.values && dict.values.length > 0) {
        mockValue = dict.values[Math.floor(Math.random() * dict.values.length)];
      } else {
        mockValue = MockFactory.randomString();
      }
    } else if (MockFactory[cmd]) {
      mockValue = MockFactory[cmd]();
    } else {
      mockValue = resolveMockType(cmd);
    }

    fillElement(inputEl, mockValue);
  }

  function fillElement(inputEl, mockValue) {
    // 寻找 Vue 实例进行绑定更新
    let vueInstance = null;
    const advancedWrapper = inputEl.closest('.el-select, .el-date-editor, .el-cascader, .el-radio-group, .el-switch');
    if (advancedWrapper && advancedWrapper.__vue__) {
      vueInstance = advancedWrapper.__vue__;
    } else {
      const inputWrapper = inputEl.closest('.el-input, .el-textarea');
      if (inputWrapper && inputWrapper.__vue__) {
        vueInstance = inputWrapper.__vue__;
      } else {
        vueInstance = inputEl.__vue__;
      }
    }

    if (vueInstance) {
      vueInstance.$emit('input', mockValue);
      vueInstance.$emit('change', mockValue);
    } else {
      // 原生回退
      inputEl.value = mockValue;
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      inputEl.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  // ==========================================
  // 5. 消息监听网关
  // ==========================================
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (event.data && event.data.type === "AUTO_MOCK_FILL") {
      fillElementUiForms();
    } else if (event.data && event.data.type === "TOGGLE_SPOTLIGHT") {
      toggleSpotlight();
    } else if (event.data && event.data.type === "INIT_MOCK_CONFIG") {
      if (event.data.config) {
        if (event.data.config.ignoreKeywords) CONFIG.IGNORE_KEYWORDS = event.data.config.ignoreKeywords;
        if (event.data.config.shortcutSpotlight) CONFIG.SHORTCUT_SPOTLIGHT = event.data.config.shortcutSpotlight;
        if (event.data.config.shortcutFill) CONFIG.SHORTCUT_FILL_ALL = event.data.config.shortcutFill;
        if (event.data.config.shortcutAiTrigger) CONFIG.SHORTCUT_AI_TRIGGER = event.data.config.shortcutAiTrigger;
        if (typeof event.data.config.aiManualTriggerMode === 'boolean') CONFIG.AI_MANUAL_TRIGGER_MODE = event.data.config.aiManualTriggerMode;
        if (typeof event.data.config.deepseekApiUrl === 'string') CONFIG.DEEPSEEK_API_URL = event.data.config.deepseekApiUrl;
        if (typeof event.data.config.deepseekApiModel === 'string') CONFIG.DEEPSEEK_API_MODEL = event.data.config.deepseekApiModel;
        if (typeof event.data.config.deepseekApiKey === 'string') CONFIG.DEEPSEEK_API_KEY = event.data.config.deepseekApiKey;
        console.log("Auto Mock Configuration updated from extension options.");
      }
    }
  }, false);

  async function fillElementUiForms() {
    console.log("Starting Auto Mock Fill...");
    const inputs = Array.from(document.querySelectorAll('.el-input__inner, .el-textarea__inner'));
    let fillCount = 0;
    let skipCount = 0;

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      if (i > 0 && i % 5 === 0) await new Promise(resolve => setTimeout(resolve, 0));

      const vueInstance = getVueInstance(input);
      const componentName = vueInstance && vueInstance.$options ? vueInstance.$options.name : '';

      const isNativeDisabled = input.disabled || input.hasAttribute('disabled') || input.closest('.is-disabled');
      const isVueDisabled = vueInstance && (vueInstance.disabled || vueInstance.inputDisabled || vueInstance.selectDisabled);
      if (isNativeDisabled || isVueDisabled) continue;

      if (input.readOnly || input.hasAttribute('readonly')) {
        if (!CustomHooks[componentName]) continue;
      }

      const labelText = getLabelForInput(input, vueInstance);

      let vModelExpr = '';
      if (vueInstance && vueInstance.$vnode && vueInstance.$vnode.data && vueInstance.$vnode.data.model) {
        vModelExpr = vueInstance.$vnode.data.model.expression || '';
      }
      
      const isIgnored = CONFIG.IGNORE_KEYWORDS.some(keyword => {
        const kw = keyword.toLowerCase();
        return labelText.toLowerCase().includes(kw) || (vModelExpr && vModelExpr.toLowerCase().includes(kw));
      });
      if (isIgnored) {
        console.log(`Auto Mock: 跳过字段 "${labelText}" (触发黑名单)`);
        skipCount++;
        continue;
      }
      
      if (vueInstance) {
        if (CustomHooks[componentName]) {
          const success = CustomHooks[componentName](vueInstance, labelText);
          if (success) fillCount++;
        } else {
          const mockValue = resolveMockType(labelText);
          vueInstance.$emit('input', mockValue);
          vueInstance.$emit('change', mockValue);
          fillCount++;
        }
      } else {
        if (!input.readOnly && !input.disabled) {
          input.value = resolveMockType(labelText);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          fillCount++;
        }
      }
    }
    console.log(`Auto Mock Fill completed. Filled: ${fillCount}, Skipped: ${skipCount}`);
  }

  // ==========================================
  // 6. 全局原生快捷键挂载 (摆脱浏览器底层限制)
  // ==========================================
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key.toLowerCase() === CONFIG.SHORTCUT_SPOTLIGHT.toLowerCase()) {
      e.preventDefault();
      toggleSpotlight();
    } else if (e.altKey && e.key.toLowerCase() === CONFIG.SHORTCUT_FILL_ALL.toLowerCase()) {
      e.preventDefault();
      fillElementUiForms();
    } else if (e.altKey && e.key.toLowerCase() === CONFIG.SHORTCUT_AI_TRIGGER.toLowerCase()) {
      e.preventDefault();
      triggerFocusedFieldAi();
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
      width: 480px; background: #fff; border-radius: 12px; padding: 24px; box-sizing: border-box;
      font-family: -apple-system, sans-serif; color: #333; box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    `;
    panel.innerHTML = `
      <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #2c3e50; font-weight: bold;">⚙️ 高级偏好设置</h2>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: #606266;">独立控制台唤醒快捷键 (Alt + ?)</label>
        <input id="setting-spotlight" value="${CONFIG.SHORTCUT_SPOTLIGHT}" maxlength="1" style="width: 100%; padding: 10px; border: 1px solid #dcdfe6; border-radius: 4px; box-sizing: border-box; font-size: 14px; outline: none; transition: border-color .2s;" onfocus="this.style.borderColor='#409eff'" onblur="this.style.borderColor='#dcdfe6'"/>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: #606266;">一键全量填充快捷键 (Alt + ?)</label>
        <input id="setting-fillall" value="${CONFIG.SHORTCUT_FILL_ALL}" maxlength="1" style="width: 100%; padding: 10px; border: 1px solid #dcdfe6; border-radius: 4px; box-sizing: border-box; font-size: 14px; outline: none; transition: border-color .2s;" onfocus="this.style.borderColor='#409eff'" onblur="this.style.borderColor='#dcdfe6'"/>
      </div>

      <div style="margin-bottom: 15px;">
        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: #606266;">AI 单字段触发快捷键 (Alt + ?)</label>
        <input id="setting-ai-trigger" value="${CONFIG.SHORTCUT_AI_TRIGGER}" maxlength="1" style="width: 100%; padding: 10px; border: 1px solid #dcdfe6; border-radius: 4px; box-sizing: border-box; font-size: 14px; outline: none; transition: border-color .2s;" onfocus="this.style.borderColor='#409eff'" onblur="this.style.borderColor='#dcdfe6'"/>
      </div>

      <div style="margin-bottom: 15px;">
        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: #606266;">一键填充拦截黑名单 (关键词用逗号分隔)</label>
        <textarea id="setting-ignore" style="width: 100%; height: 60px; padding: 10px; border: 1px solid #dcdfe6; border-radius: 4px; resize: none; box-sizing: border-box; font-size: 14px; outline: none; transition: border-color .2s; font-family: monospace;" onfocus="this.style.borderColor='#409eff'" onblur="this.style.borderColor='#dcdfe6'">${CONFIG.IGNORE_KEYWORDS.join(', ')}</textarea>
      </div>

      <div style="margin-bottom: 15px;">
        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: #606266;">🔧 自定义扩展数据字典 (JSON 数组)</label>
        <textarea id="setting-dicts" style="width: 100%; height: 80px; padding: 10px; border: 1px solid #dcdfe6; border-radius: 4px; resize: none; box-sizing: border-box; font-size: 13px; outline: none; transition: border-color .2s; font-family: monospace;" placeholder='[\n  { "label": "测试账号", "regex": "账号|account", "values": ["test01", "test02"] }\n]' onfocus="this.style.borderColor='#409eff'" onblur="this.style.borderColor='#dcdfe6'">${CONFIG.CUSTOM_DICTS && CONFIG.CUSTOM_DICTS.length > 0 ? JSON.stringify(CONFIG.CUSTOM_DICTS, null, 2) : ''}</textarea>
      </div>

      <div style="margin-bottom: 24px;">
        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: #606266;">🤖 大模型智能交互 (兼容 OpenAI 格式)</label>
        <div class="help-text" style="font-size:12px;color:#909399;margin-bottom:6px;">只要是兼容 OpenAI 格式的 API 都能接入。默认填入 DeepSeek 配置。清空 Key 即可关闭此功能。</div>
        <label style="display:flex; align-items:center; gap:8px; font-size:13px; color:#606266; margin-bottom:10px;">
          <input type="checkbox" id="setting-ai-manual-mode" ${CONFIG.AI_MANUAL_TRIGGER_MODE !== false ? 'checked' : ''}/>
          开启 AI 手动触发模式（选中字段后，按快捷键才开始思考）
        </label>
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="width: 100px; font-size: 13px; color: #606266;">API URL:</span>
          <input type="text" id="setting-deepseek-url" value="${CONFIG.DEEPSEEK_API_URL || ''}" placeholder="https://api.deepseek.com/v1/chat/completions" style="flex:1; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; box-sizing: border-box; font-size: 13px; outline: none;" onfocus="this.style.borderColor='#409eff'" onblur="this.style.borderColor='#dcdfe6'"/>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="width: 100px; font-size: 13px; color: #606266;">Model:</span>
          <input type="text" id="setting-deepseek-model" value="${CONFIG.DEEPSEEK_API_MODEL || ''}" placeholder="deepseek-v4-flash" style="flex:1; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; box-sizing: border-box; font-size: 13px; outline: none;" onfocus="this.style.borderColor='#409eff'" onblur="this.style.borderColor='#dcdfe6'"/>
        </div>
        <div style="display: flex; align-items: center;">
          <span style="width: 100px; font-size: 13px; color: #606266;">API Key:</span>
          <input type="password" id="setting-deepseek-key" value="${CONFIG.DEEPSEEK_API_KEY || ''}" placeholder="sk-..." style="flex:1; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; box-sizing: border-box; font-size: 13px; outline: none;" onfocus="this.style.borderColor='#409eff'" onblur="this.style.borderColor='#dcdfe6'"/>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 12px;">
        <button id="setting-cancel" style="padding: 10px 20px; background: #f4f4f5; color: #909399; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all .2s;" onmouseover="this.style.background='#e9e9eb'" onmouseout="this.style.background='#f4f4f5'">取消</button>
        <button id="setting-save" style="padding: 10px 20px; background: #409eff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all .2s;" onmouseover="this.style.background='#66b1ff'" onmouseout="this.style.background='#409eff'">保存并应用</button>
      </div>
    `;
    container.appendChild(panel);
    document.body.appendChild(container);

    document.getElementById('setting-cancel').onclick = () => container.remove();
    document.getElementById('setting-save').onclick = () => {
      CONFIG.SHORTCUT_SPOTLIGHT = document.getElementById('setting-spotlight').value.toLowerCase() || 'x';
      CONFIG.SHORTCUT_FILL_ALL = document.getElementById('setting-fillall').value.toLowerCase() || 'z';
      CONFIG.SHORTCUT_AI_TRIGGER = document.getElementById('setting-ai-trigger').value.toLowerCase() || 'a';
      const ignores = document.getElementById('setting-ignore').value.split(',').map(s => s.trim()).filter(Boolean);
      CONFIG.IGNORE_KEYWORDS = ignores.length ? ignores : DEFAULT_CONFIG.IGNORE_KEYWORDS;
      CONFIG.AI_MANUAL_TRIGGER_MODE = document.getElementById('setting-ai-manual-mode').checked;
      
      const dictText = document.getElementById('setting-dicts').value.trim();
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
      CONFIG.CUSTOM_DICTS = parsedDicts;
      CONFIG.DEEPSEEK_API_URL = document.getElementById('setting-deepseek-url').value.trim() || 'https://api.deepseek.com/v1/chat/completions';
      CONFIG.DEEPSEEK_API_MODEL = document.getElementById('setting-deepseek-model').value.trim() || 'deepseek-v4-flash';
      CONFIG.DEEPSEEK_API_KEY = document.getElementById('setting-deepseek-key').value.trim();

      if (typeof GM_setValue !== 'undefined') {
        GM_setValue('auto_mock_config', CONFIG);
      }
      container.remove();
      alert('✅ 高级偏好设置已保存！');
    };
  }

  if (typeof GM_registerMenuCommand !== 'undefined') {
    GM_registerMenuCommand('⚙️ 高级偏好设置', openSettingsUI);
  }

})();
