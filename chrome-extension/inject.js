(function() {
  console.log("Auto Mock Inject script loaded.");

  // ==========================================
  // [用户配置区] 扩展动态配置参数 (受 Options 控制)
  // ==========================================
  const CONFIG = {
    SHORTCUT_SPOTLIGHT: 'x',
    SHORTCUT_FILL_ALL: 'z',
    SHORTCUT_AI_TRIGGER: 's',
    AI_MANUAL_TRIGGER_MODE: true,
    // AI_ENABLED 由 content.js 根据是否配置 API Key 计算，页面侧不再持有密钥
    AI_ENABLED: false,
    AI_ENABLE_CLASSIFICATION: true,
    IGNORE_KEYWORDS: ['id', '创建', '更新', '主键', '忽略', '只读', '序号', 'id_', '_id', 'created', 'updated'],
    CUSTOM_DICTS: []
  };

  const AI_REQUEST_TIMEOUT_MS = 15000;
  const DEEPSEEK_CACHE_LIMIT = 100;

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
    accountName: () => 'test_' + Math.random().toString(36).slice(2, 10),
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

  // cmd 与中文类目名的映射，供 Spotlight 渲染与本地生成共用
  // 新增或删除类目时需同步 background.js 的 AI_CMD_CATALOG
  const MOCK_CMD_LABELS = {
    name: '人名',
    englishName: '英文名',
    age: '年龄',
    phone: '手机号',
    email: '邮箱',
    idcard: '身份证',
    bankCard: '银行卡',
    accountName: '账号名称',
    title: '职务头衔',
    address: '详细地址',
    url: '随机链接',
    number: '随机数字',
    amount: '金额数值',
    color: '颜色值',
    date: '日期',
    time: '时间',
    text: '长文本段落',
    creditCode: '信用代码',
    company: '企业名称',
    licensePlate: '车牌号',
    zipCode: '邮政编码',
    ipv4: 'IP地址',
    mac: 'MAC地址',
    password: '强密码'
  };

  const predictMockType = (label) => {
    label = (label || '').toLowerCase();
    if (CONFIG.CUSTOM_DICTS && CONFIG.CUSTOM_DICTS.length > 0) {
      for (let i = 0; i < CONFIG.CUSTOM_DICTS.length; i++) {
        let dict = CONFIG.CUSTOM_DICTS[i];
        if (dict && dict.regex) {
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
    // 先匹配更具体的规则，避免「联系人电话」被「人」抢先判成人名
    if (/英文名|英文姓名|english/.test(label)) return {cmd: 'englishName', name: '英文名'};
    if (/手机|电话|联系方式|联系号码|phone|mobile|(^|[^a-z])tel([^a-z]|$)/.test(label)) return {cmd: 'phone', name: '手机号'};
    if (/邮箱|邮件|e-mail|email|(^|[^a-z])mail([^a-z]|$)/.test(label)) return {cmd: 'email', name: '邮箱'};
    if (/身份证|证件号|idcard|id_card/.test(label)) return {cmd: 'idcard', name: '身份证'};
    if (/年龄|(^|[^a-z])age([^a-z]|$)/.test(label)) return {cmd: 'age', name: '年龄'};
    if (/信用代码|企业代码|credit/.test(label)) return {cmd: 'creditCode', name: '信用代码'};
    if (/公司|企业|单位|company/.test(label)) return {cmd: 'company', name: '企业名称'};
    if (/车牌|license_plate/.test(label)) return {cmd: 'licensePlate', name: '车牌号'};
    if (/邮编|zipcode|postal/.test(label)) return {cmd: 'zipCode', name: '邮政编码'};
    if (/ip地址|ipv4|ip_/.test(label)) return {cmd: 'ipv4', name: 'IP地址'};
    if (/(^|[^a-z])mac([^a-z]|$)|物理地址/.test(label)) return {cmd: 'mac', name: 'MAC地址'};
    if (/密码|password|pwd/.test(label)) return {cmd: 'password', name: '强密码'};
    if (/颜色|color/.test(label)) return {cmd: 'color', name: '颜色值'};
    if (/银行卡|银行账号|银行账户|卡号|bankcard|bank_card/.test(label)) return {cmd: 'bankCard', name: '银行卡'};
    if (/账号|账户|用户名|登录名|account|username|login/.test(label)) return {cmd: 'accountName', name: '账号名称'};
    if (/头衔|职务|岗位|职位|职称|title|position|(^|[^a-z])job([^a-z]|$)/.test(label)) return {cmd: 'title', name: '职务头衔'};
    if (/日期|date/.test(label)) return {cmd: 'date', name: '日期'};
    if (/时间|time/.test(label)) return {cmd: 'time', name: '时间'};
    if (/地址|住址|地点|省份|城市|区域|省|市|区|address|location|region/.test(label)) return {cmd: 'address', name: '详细地址'};
    if (/网址|链接|主页|url|website|link/.test(label)) return {cmd: 'url', name: '随机链接'};
    if (/文本|描述|备注|详情|内容|text|desc|content|remark/.test(label)) return {cmd: 'text', name: '文本段落'};
    if (/金额|钱|amount|money/.test(label)) return {cmd: 'amount', name: '金额'};
    if (/数字|数量|库存|总数|价格|(^|[^a-z])num([^a-z]|$)|count|price/.test(label)) return {cmd: 'number', name: '数字'};
    // 人名规则放在最后，避免单字「人」误伤联系人电话、人员编号等字段
    if (/姓名|名字|人名|称呼|联系人|负责人|收件人|持卡人|真实姓名|法人|客户名|(^|[^a-z])name([^a-z]|$)|(^|[^a-z])user([^a-z]|$)/.test(label)) return {cmd: 'name', name: '人名'};
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
  function formatDateValue(date, format) {
    const pad = (num) => String(num).padStart(2, '0');
    const tokens = {
      yyyy: date.getFullYear(),
      YYYY: date.getFullYear(),
      MM: pad(date.getMonth() + 1),
      dd: pad(date.getDate()),
      DD: pad(date.getDate()),
      HH: pad(date.getHours()),
      mm: pad(date.getMinutes()),
      ss: pad(date.getSeconds())
    };
    return String(format || 'yyyy-MM-dd HH:mm:ss').replace(/yyyy|YYYY|MM|dd|DD|HH|mm|ss/g, (token) => tokens[token]);
  }

  function pickCascaderLeafPath(options) {
    const list = (options || []).filter(opt => opt && !opt.disabled && opt.value !== undefined && opt.value !== null);
    if (list.length === 0) return null;

    // 随机顺序尝试，避免选中的父节点下全是禁用项导致整体填充失败
    const shuffled = list.slice().sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffled.length; i++) {
      const opt = shuffled[i];
      const children = Array.isArray(opt.children) ? opt.children : [];
      if (children.length === 0) return { values: [opt.value] };
      const childPath = pickCascaderLeafPath(children);
      if (childPath) return { values: [opt.value].concat(childPath.values) };
    }
    return null;
  }

  const CustomHooks = {
    ElSelect: (vueInstance) => {
      if (vueInstance.options && vueInstance.options.length > 0) {
        const validOptions = vueInstance.options.filter(opt => !opt.disabled && opt.value !== undefined && opt.value !== null);
        if (validOptions.length > 0) {
          const randomOpt = validOptions[Math.floor(Math.random() * validOptions.length)];
          vueInstance.$emit('input', randomOpt.value);
          vueInstance.$emit('change', randomOpt.value);
          return true;
        }
      }
      return false;
    },
    ElCascader: (vueInstance) => {
      // 懒加载级联在展开前拿不到叶子节点，避免填入无效的父级值
      if (vueInstance.lazyLoad) return false;
      const leafPath = pickCascaderLeafPath(vueInstance.options);
      if (!leafPath) return false;
      const values = leafPath.values;
      const finalValue = vueInstance.emitPath === false ? values[values.length - 1] : values;
      vueInstance.$emit('input', finalValue);
      vueInstance.$emit('change', finalValue);
      return true;
    },
    ElDatePicker: (vueInstance) => {
      const now = new Date();
      const valueFormat = vueInstance.valueFormat;
      const pickerType = String(vueInstance.type || '');
      if (pickerType.indexOf('range') > -1) {
        const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const rangeValue = valueFormat
          ? [formatDateValue(start, valueFormat), formatDateValue(now, valueFormat)]
          : [start, now];
        vueInstance.$emit('input', rangeValue);
        vueInstance.$emit('change', rangeValue);
      } else if (pickerType === 'dates' || pickerType === 'months' || pickerType === 'years') {
        // 多选日期类型的 v-model 期望数组
        const multiValue = valueFormat ? formatDateValue(now, valueFormat) : now;
        vueInstance.$emit('input', [multiValue]);
        vueInstance.$emit('change', [multiValue]);
      } else {
        const value = valueFormat ? formatDateValue(now, valueFormat) : now;
        vueInstance.$emit('input', value);
        vueInstance.$emit('change', value);
      }
      return true;
    },
    ElTimePicker: (vueInstance) => {
      const now = new Date();
      const valueFormat = vueInstance.valueFormat;
      const value = valueFormat ? formatDateValue(now, valueFormat) : now;
      if (vueInstance.isRange) {
        const start = new Date(now.getTime() - 60 * 60 * 1000);
        const rangeValue = valueFormat
          ? [formatDateValue(start, valueFormat), value]
          : [start, now];
        vueInstance.$emit('input', rangeValue);
        vueInstance.$emit('change', rangeValue);
      } else {
        vueInstance.$emit('input', value);
        vueInstance.$emit('change', value);
      }
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
    ElCascader: '推荐选项',
    ElRadioGroup: '推荐选项',
    ElDatePicker: '当前日期',
    ElTimePicker: '当前时间',
    ElSwitch: '开启状态'
  };

  function isAiAvailable() {
    return CONFIG.AI_ENABLED === true && CONFIG.AI_ENABLE_CLASSIFICATION !== false;
  }

  function isAiManualMode() {
    return CONFIG.AI_MANUAL_TRIGGER_MODE !== false;
  }

  function isAiSuggestionComponent(componentName) {
    return componentName === 'ElSelect' || componentName === 'ElRadioGroup';
  }

  function isLocalOnlyHookComponent(componentName) {
    return componentName === 'ElDatePicker' || componentName === 'ElTimePicker' || componentName === 'ElSwitch' || componentName === 'ElCascader';
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
        .filter(opt => opt && !opt.disabled && opt.value !== undefined && opt.value !== null)
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
  // 页面侧只发送字段名与候选项，API Key/URL/模型与提示词全部由扩展侧持有
  const deepseekCache = new Map();
  let deepseekReqIdCount = 0;

  function cacheDeepSeekResult(key, value) {
    if (deepseekCache.has(key)) deepseekCache.delete(key);
    deepseekCache.set(key, value);
    while (deepseekCache.size > DEEPSEEK_CACHE_LIMIT) {
      const oldestKey = deepseekCache.keys().next().value;
      deepseekCache.delete(oldestKey);
    }
  }

  function parseAiCommand(rawText) {
    const text = String(rawText == null ? '' : rawText).trim();
    if (!text) return '';
    const cleaned = text.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '').trim();
    const candidates = [];
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        candidates.push.apply(candidates, parsed);
      } else {
        candidates.push(parsed);
      }
    } catch (e) {
      // 非严格 JSON 时继续用正则提取
    }
    const cmdMatch = cleaned.match(/"cmd"\s*:\s*"([^"]+)"/);
    if (cmdMatch) candidates.push({ cmd: cmdMatch[1] });
    for (let i = 0; i < candidates.length; i++) {
      const item = candidates[i];
      const cmd = typeof item === 'string' ? item : (item && (item.cmd || item.command || item.type));
      if (cmd && (MockFactory[cmd] || String(cmd).indexOf('__custom_') === 0)) {
        return String(cmd);
      }
    }
    const bareMatch = cleaned.match(/^["'\s]*([a-zA-Z][a-zA-Z0-9_]*)["'\s]*$/);
    if (bareMatch && MockFactory[bareMatch[1]]) return bareMatch[1];
    return '';
  }

  function askDeepSeek(label, optionLabels) {
    const promptKey = label + '||' + (optionLabels || []).join('|');
    if (deepseekCache.has(promptKey)) return Promise.resolve(deepseekCache.get(promptKey));

    return new Promise((resolve) => {
      if (!isAiAvailable()) return resolve(null);

      const reqId = 'ds_' + (++deepseekReqIdCount);
      let settled = false;
      let timer = null;

      const finish = (value) => {
        if (settled) return;
        settled = true;
        window.removeEventListener('message', listener);
        if (timer) clearTimeout(timer);
        resolve(value);
      };

      const listener = (event) => {
        if (event.source !== window || !event.data) return;
        if (event.data.type !== 'DEEPSEEK_RESPONSE' || event.data.reqId !== reqId) return;
        const response = event.data.response;
        if (response && response.success && response.data) {
          cacheDeepSeekResult(promptKey, response.data);
          finish(response.data);
        } else {
          console.warn('[AutoMock AI] 请求失败:', response ? response.error : '无响应');
          finish(null);
        }
      };

      timer = setTimeout(() => {
        console.warn('[AutoMock AI] 请求超时，已回退本地规则');
        finish(null);
      }, AI_REQUEST_TIMEOUT_MS);

      window.addEventListener('message', listener);
      window.postMessage({
        type: 'DEEPSEEK_REQUEST',
        reqId: reqId,
        payload: { label: label, options: optionLabels || [] }
      }, '*');
    });
  }

  // ==========================================
  // 3. 字段上下文与直达填入
  // ==========================================
  let spotlightTargetElement = null;
  let currentAiRequestId = 0;

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


  function isIgnoredByKeywords(labelText, vModelExpr) {
    const ignoreList = CONFIG.IGNORE_KEYWORDS || [];
    const labelLower = String(labelText == null ? '' : labelText).toLowerCase();
    const modelExpr = String(vModelExpr == null ? '' : vModelExpr);

    return ignoreList.some(keyword => {
      const kw = String(keyword == null ? '' : keyword).trim();
      if (!kw) return false;
      const kwLower = kw.toLowerCase();
      if (labelLower.includes(kwLower)) return true;
      if (!modelExpr) return false;

      // 纯 id 关键字按词边界匹配，避免 idCard、isValid 等字段被误跳过
      if (kwLower === 'id') {
        return /(^|[^A-Za-z0-9])id([^A-Za-z0-9]|$)/.test(modelExpr)
          || /[a-z0-9]Id([A-Z0-9]|$)/.test(modelExpr)
          || /(^|[^A-Za-z0-9])ID([^A-Za-z0-9]|$)/.test(modelExpr)
          || /[a-z0-9]ID([A-Z0-9]|$)/.test(modelExpr);
      }

      return modelExpr.toLowerCase().includes(kwLower);
    });
  }

  function getFieldContext(inputEl) {
    if (!inputEl || (inputEl.tagName !== 'INPUT' && inputEl.tagName !== 'TEXTAREA')) return null;

    const vueInstance = getVueInstance(inputEl);
    const isNativeDisabled = inputEl.disabled || inputEl.hasAttribute('disabled') || inputEl.closest('.is-disabled');
    const isVueDisabled = vueInstance && (vueInstance.disabled || vueInstance.inputDisabled || vueInstance.selectDisabled);
    if (isNativeDisabled || isVueDisabled) return null;

    const componentName = vueInstance && vueInstance.$options ? vueInstance.$options.name : '';
    if ((inputEl.readOnly || inputEl.hasAttribute('readonly')) && !CustomHooks[componentName]) return null;

    const labelText = getLabelForInput(inputEl, vueInstance);
    let vModelExpr = '';
    if (vueInstance && vueInstance.$vnode && vueInstance.$vnode.data && vueInstance.$vnode.data.model) {
      vModelExpr = vueInstance.$vnode.data.model.expression || '';
    }

    if (isIgnoredByKeywords(labelText, vModelExpr)) return null;

    const hookAction = createHookFillAction(vueInstance, componentName, labelText);
    return {
      inputEl,
      vueInstance,
      componentName,
      labelText,
      hookAction,
      supportsAiSuggestion: isAiSuggestionComponent(componentName),
      localHookName: LocalHookDisplayNames[componentName] || '推荐值',
      fallbackPrediction: predictMockType(labelText)
    };
  }

  function buildMockValueFromCommand(cmd) {
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
    return mockValue;
  }

  function applyDirectCommandToInput(inputEl, cmd) {
    if (!inputEl || !cmd) return false;
    const mockValue = buildMockValueFromCommand(cmd);
    fillElement(inputEl, mockValue);
    return true;
  }

  function applyLocalFallback(context) {
    if (context.hookAction) {
      return context.hookAction();
    }
    if (context.fallbackPrediction) {
      return applyDirectCommandToInput(context.inputEl, context.fallbackPrediction.cmd);
    }
    return false;
  }

  function applyAiResultToField(context, aiVal) {
    const { inputEl, vueInstance, componentName, hookAction, supportsAiSuggestion, localHookName } = context;

    if (typeof aiVal === 'string' && aiVal.trim()) {
      if (supportsAiSuggestion) {
        const matchedOption = matchAiSuggestionToOption(aiVal, vueInstance, componentName);
        if (matchedOption) return matchedOption.apply();
        if (hookAction) {
          console.warn(`[AutoMock AI] 未命中候选项，已改用${localHookName}`);
          return hookAction();
        }
        return false;
      }

      const aiCmd = parseAiCommand(aiVal);
      if (aiCmd) return applyDirectCommandToInput(inputEl, aiCmd);
      console.warn('[AutoMock AI] 未解析出可用命令，已回退本地规则:', aiVal);
    }

    return applyLocalFallback(context);
  }

  function getAiOptionLabels(context) {
    if (!context.supportsAiSuggestion) return [];
    return getCandidateOptions(context.vueInstance, context.componentName)
      .map(opt => opt.label)
      .slice(0, 20);
  }

  async function fillFieldDirectly(inputEl, options = {}) {
    const { aiOnly = false } = options;
    const context = getFieldContext(inputEl);
    if (!context) return false;

    spotlightTargetElement = inputEl;
    if (isAiAvailable() && !isLocalOnlyHookComponent(context.componentName)) {
      const requestId = ++currentAiRequestId;
      const aiVal = await askDeepSeek(context.labelText, getAiOptionLabels(context));
      if (requestId !== currentAiRequestId) return false;
      if (aiVal) return applyAiResultToField(context, aiVal);
    }

    if (aiOnly) return false;
    return applyLocalFallback(context);
  }

  function triggerFocusedFieldAi() {
    const target = spotlightTargetElement || document.activeElement;
    if (!target || (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA')) return;

    const useLocalOnly = !isAiAvailable();
    fillFieldDirectly(target, { aiOnly: false }).then((filled) => {
      if (useLocalOnly && filled) showToast('未启用 AI，已按本地规则填充');
    }).catch(err => {
      console.error('[AutoMock AI] 快捷键直填失败:', err);
    });
  }

  // 持续跟踪全局最后一个处于聚焦状态的输入框
  document.addEventListener('focusin', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
      spotlightTargetElement = e.target;
      if (isAiAvailable() && !isAiManualMode()) {
        const target = e.target;
        setTimeout(() => {
          if (spotlightTargetElement !== target) return;
          fillFieldDirectly(target, { aiOnly: true }).catch(err => {
            console.error('[AutoMock AI] 自动直填失败:', err);
          });
        }, 10);
      }
    }
  }, true);

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
    
    // 自定义滚动条样式，重复打开时只保留一份
    if (!document.getElementById('mock-ext-spotlight-style')) {
      const style = document.createElement('style');
      style.id = 'mock-ext-spotlight-style';
      style.innerHTML = `
        #mock-ext-spotlight > div::-webkit-scrollbar { width: 6px; }
        #mock-ext-spotlight > div::-webkit-scrollbar-thumb { background: #dcdfe6; border-radius: 3px; }
        #mock-ext-spotlight > div::-webkit-scrollbar-thumb:hover { background: #c0c4cc; }
      `;
      document.head.appendChild(style);
    }
    
    const title = document.createElement('div');
    title.innerText = '⚡ 选择要填入的数据格式';
    title.style.cssText = 'font-size: 16px; color: #333; margin-bottom: 20px; font-weight: bold; user-select: none; text-align: center;';
    panel.appendChild(title);

    const toSpotlightItems = (cmds) => cmds.map(cmd => ({ label: MOCK_CMD_LABELS[cmd] || cmd, cmd: cmd }));
    let mockGroups = [
      {
        title: '👤 个人信息',
        items: toSpotlightItems(['name', 'englishName', 'idcard', 'age', 'phone', 'email', 'accountName'])
      },
      {
        title: '🏢 企业与资产',
        items: toSpotlightItems(['company', 'creditCode', 'title', 'licensePlate', 'bankCard', 'amount'])
      },
      {
        title: '🌐 网络与位置',
        items: toSpotlightItems(['address', 'zipCode', 'ipv4', 'mac', 'url', 'password'])
      },
      {
        title: '📝 日期与文本',
        items: toSpotlightItems(['date', 'time', 'number', 'color', 'text'])
      }
    ];

    // --- 智能化匹配逻辑 ---
    if (spotlightTargetElement && spotlightTargetElement.isConnected) {
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
  }

  function isTopFrame() {
    try {
      return window.top === window.self;
    } catch (e) {
      return false;
    }
  }

  function toggleSpotlight() {
    // 悬浮层只在顶层页面展示，避免 iframe 中重复出现遮罩
    if (!isTopFrame()) return;

    let container = document.getElementById('mock-ext-spotlight');
    if (container && container.style.display !== 'none') {
      closeSpotlight();
      return;
    }

    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
      spotlightTargetElement = document.activeElement;
    }

    // 每次打开重建 DOM，保证智能推荐跟随当前焦点
    createSpotlightUI();
    container = document.getElementById('mock-ext-spotlight');
    if (container) container.style.display = 'flex';
  }

  function closeSpotlight() {
    const container = document.getElementById('mock-ext-spotlight');
    if (container) container.style.display = 'none';
    if (spotlightTargetElement && spotlightTargetElement.isConnected && typeof spotlightTargetElement.focus === 'function') {
      spotlightTargetElement.focus();
    }
  }

  function executeSpotlightCommand(cmd) {
    if (!cmd) return;
    if (!spotlightTargetElement || (spotlightTargetElement.tagName !== 'INPUT' && spotlightTargetElement.tagName !== 'TEXTAREA')) {
      showToast('请先将光标聚焦到需要填入的输入框，再唤出控制台');
      return;
    }
    applyDirectCommandToInput(spotlightTargetElement, cmd);
  }

  function fillElement(inputEl, mockValue) {
    // 寻找 Vue 实例进行绑定更新
    const vueInstance = getVueInstance(inputEl);

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
  // 4. 批量填充辅助：提示、可见性、快照与撤销
  // ==========================================
  let toastTimer = null;
  let lastFillSnapshot = null;
  let batchFillRunning = false;
  const NON_TEXT_INPUT_TYPES = ['button', 'checkbox', 'color', 'file', 'hidden', 'image', 'radio', 'range', 'reset', 'submit'];

  function showToast(message, duration) {
    if (!document.body) return;
    let toast = document.getElementById('mock-ext-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'mock-ext-toast';
      toast.style.cssText = 'position:fixed;left:50%;bottom:32px;transform:translateX(-50%);max-width:70vw;padding:10px 16px;background:rgba(48,49,51,0.94);color:#fff;font-size:13px;line-height:1.4;border-radius:6px;z-index:1000000;box-shadow:0 6px 18px rgba(0,0,0,0.2);pointer-events:none;transition:opacity .2s;';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.style.opacity = '0';
    }, duration || 2000);
  }

  function isTextLikeInput(el) {
    if (!el) return false;
    if (el.tagName === 'TEXTAREA') return true;
    if (el.tagName !== 'INPUT') return false;
    const type = String(el.type || 'text').toLowerCase();
    return NON_TEXT_INPUT_TYPES.indexOf(type) === -1;
  }

  function isElementVisible(el) {
    if (!el || !el.isConnected || el.type === 'hidden') return false;
    const style = window.getComputedStyle(el);
    if (!style || style.display === 'none' || style.visibility === 'hidden') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0;
  }

  function collectBatchInputs() {
    const selector = '.el-input__inner, .el-textarea__inner, input, textarea';
    const seen = new Set();
    const result = [];
    document.querySelectorAll(selector).forEach(el => {
      if (seen.has(el)) return;
      seen.add(el);
      result.push(el);
    });
    return result;
  }

  function readFieldSnapshotValue(inputEl, vueInstance) {
    if (vueInstance && Object.prototype.hasOwnProperty.call(vueInstance, 'value')) {
      return vueInstance.value;
    }
    return inputEl.value;
  }

  function restoreSnapshotEntry(entry) {
    const { inputEl, vueInstance, value } = entry;
    if (vueInstance && (!vueInstance.$el || vueInstance.$el.isConnected !== false)) {
      vueInstance.$emit('input', value);
      vueInstance.$emit('change', value);
      return;
    }
    inputEl.value = value == null ? '' : value;
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function undoLastFill() {
    if (!lastFillSnapshot || lastFillSnapshot.length === 0) {
      showToast('没有可撤销的填充记录');
      return false;
    }
    lastFillSnapshot.forEach(restoreSnapshotEntry);
    lastFillSnapshot = null;
    showToast('已撤销上次填充');
    return true;
  }

  function waitForComponentOptions(context, action, retries, delay) {
    const maxRetries = typeof retries === 'number' ? retries : 4;
    const retryDelay = typeof delay === 'number' ? delay : 250;

    return new Promise((resolve) => {
      const attempt = (remaining) => {
        const rootEl = context.vueInstance && context.vueInstance.$el;
        if (!rootEl || rootEl.isConnected === false) return resolve(false);
        if (action()) return resolve(true);
        if (remaining <= 0) return resolve(false);
        setTimeout(() => attempt(remaining - 1), retryDelay);
      };
      attempt(maxRetries);
    });
  }

  // ==========================================
  // 5. 消息监听网关
  // ==========================================
  function normalizeShortcutValue(value, fallback) {
    const text = String(value == null ? '' : value).trim().toLowerCase();
    if (/^f([1-9]|1[0-2])$/.test(text)) return text;
    if (text.length === 1 && !/\s/.test(text)) return text;
    return fallback;
  }

  function normalizeIncomingCustomDicts(value) {
    if (!Array.isArray(value)) return null;
    return value
      .filter(dict => dict && typeof dict === 'object' && typeof dict.regex === 'string')
      .slice(0, 50)
      .map(dict => ({
        label: String(dict.label || '自定义值').slice(0, 50),
        regex: dict.regex.slice(0, 200),
        values: Array.isArray(dict.values) ? dict.values.slice(0, 100).map(item => String(item)) : []
      }));
  }

  function applyIncomingConfig(incomingConfig) {
    if (!incomingConfig || typeof incomingConfig !== 'object') return;

    const ignoreKeywords = incomingConfig.IGNORE_KEYWORDS !== undefined ? incomingConfig.IGNORE_KEYWORDS : incomingConfig.ignoreKeywords;
    if (Array.isArray(ignoreKeywords)) {
      CONFIG.IGNORE_KEYWORDS = ignoreKeywords.map(item => String(item)).filter(Boolean).slice(0, 100);
    }

    CONFIG.SHORTCUT_SPOTLIGHT = normalizeShortcutValue(incomingConfig.SHORTCUT_SPOTLIGHT || incomingConfig.shortcutSpotlight, CONFIG.SHORTCUT_SPOTLIGHT);
    CONFIG.SHORTCUT_FILL_ALL = normalizeShortcutValue(incomingConfig.SHORTCUT_FILL_ALL || incomingConfig.shortcutFill, CONFIG.SHORTCUT_FILL_ALL);
    CONFIG.SHORTCUT_AI_TRIGGER = normalizeShortcutValue(incomingConfig.SHORTCUT_AI_TRIGGER || incomingConfig.shortcutAiTrigger, CONFIG.SHORTCUT_AI_TRIGGER);

    if (typeof incomingConfig.AI_MANUAL_TRIGGER_MODE === 'boolean') {
      CONFIG.AI_MANUAL_TRIGGER_MODE = incomingConfig.AI_MANUAL_TRIGGER_MODE;
    } else if (typeof incomingConfig.aiManualTriggerMode === 'boolean') {
      CONFIG.AI_MANUAL_TRIGGER_MODE = incomingConfig.aiManualTriggerMode;
    }
    if (typeof incomingConfig.AI_ENABLED === 'boolean') {
      CONFIG.AI_ENABLED = incomingConfig.AI_ENABLED;
    } else if (typeof incomingConfig.aiEnabled === 'boolean') {
      CONFIG.AI_ENABLED = incomingConfig.aiEnabled;
    }
    if (typeof incomingConfig.AI_ENABLE_CLASSIFICATION === 'boolean') {
      CONFIG.AI_ENABLE_CLASSIFICATION = incomingConfig.AI_ENABLE_CLASSIFICATION;
    } else if (typeof incomingConfig.aiEnableClassification === 'boolean') {
      CONFIG.AI_ENABLE_CLASSIFICATION = incomingConfig.aiEnableClassification;
    }

    const customDicts = normalizeIncomingCustomDicts(
      incomingConfig.CUSTOM_DICTS !== undefined ? incomingConfig.CUSTOM_DICTS : incomingConfig.customDicts
    );
    if (customDicts) CONFIG.CUSTOM_DICTS = customDicts;

    console.log('Auto Mock Configuration updated from extension options.');
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window || !event.data) return;
    const messageType = event.data.type;
    if (messageType === "AUTO_MOCK_FILL") {
      fillElementUiForms().catch(err => console.error('[AutoMock] 批量填充失败:', err));
    } else if (messageType === "TOGGLE_SPOTLIGHT") {
      toggleSpotlight();
    } else if (messageType === "AUTO_MOCK_UNDO") {
      undoLastFill();
    } else if (messageType === "INIT_MOCK_CONFIG") {
      applyIncomingConfig(event.data.config);
    }
  }, false);

  async function fillElementUiForms() {
    if (batchFillRunning) return { filled: 0, skipped: 0 };
    batchFillRunning = true;
    const snapshot = [];
    const filledHookInstances = new Set();
    let fillCount = 0;
    let skipCount = 0;

    try {
      const inputs = collectBatchInputs();
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        if (i > 0 && i % 5 === 0) await new Promise(resolve => setTimeout(resolve, 0));

        // 非文本输入、隐藏元素不属于可填目标，不计入跳过统计
        if (!isTextLikeInput(input) || !isElementVisible(input)) continue;

        const context = getFieldContext(input);
        if (!context) {
          skipCount++;
          continue;
        }

        // 复合组件（日期范围、级联等）内部可能有多个 input，只处理一次
        if (context.hookAction && context.vueInstance) {
          if (filledHookInstances.has(context.vueInstance)) {
            skipCount++;
            continue;
          }
          filledHookInstances.add(context.vueInstance);
        }

        const entry = {
          inputEl: input,
          vueInstance: context.vueInstance,
          value: readFieldSnapshotValue(input, context.vueInstance)
        };

        let filled = false;
        if (context.hookAction) {
          filled = await waitForComponentOptions(context, context.hookAction);
        } else {
          const prediction = context.fallbackPrediction || predictMockType(context.labelText);
          const mockValue = prediction && prediction.cmd
            ? buildMockValueFromCommand(prediction.cmd)
            : MockFactory.randomString();
          fillElement(input, mockValue);
          filled = true;
        }

        if (filled) {
          snapshot.push(entry);
          fillCount++;
        } else {
          skipCount++;
        }
      }
    } finally {
      batchFillRunning = false;
    }

    lastFillSnapshot = snapshot.length > 0 ? snapshot : null;
    const summary = `Auto Mock 填充完成：成功 ${fillCount} 项，跳过 ${skipCount} 项`;
    console.log(summary);
    if (fillCount > 0) {
      showToast(`${summary}，可在扩展面板撤销`);
    }
    return { filled: fillCount, skipped: skipCount };
  }

  // ==========================================
  // 6. 全局原生快捷键挂载 (摆脱浏览器底层限制)
  // ==========================================
  document.addEventListener('keydown', (e) => {
    if (!e.isTrusted) return;

    if (e.key === 'Escape') {
      const spotlight = document.getElementById('mock-ext-spotlight');
      if (spotlight && spotlight.style.display === 'flex') {
        e.preventDefault();
        closeSpotlight();
      }
      return;
    }

    if (!e.altKey || e.ctrlKey || e.metaKey) return;
    const key = String(e.key || '').toLowerCase();

    if (key === String(CONFIG.SHORTCUT_SPOTLIGHT || 'x').toLowerCase()) {
      e.preventDefault();
      toggleSpotlight();
    } else if (key === String(CONFIG.SHORTCUT_FILL_ALL || 'z').toLowerCase()) {
      e.preventDefault();
      fillElementUiForms().catch(err => console.error('[AutoMock] 批量填充失败:', err));
    } else if (key === String(CONFIG.SHORTCUT_AI_TRIGGER || 's').toLowerCase()) {
      e.preventDefault();
      triggerFocusedFieldAi();
    }
  });

  // 通知 content.js 注入完成，可立即下发配置
  window.postMessage({ type: 'AUTO_MOCK_READY' }, '*');
})();
