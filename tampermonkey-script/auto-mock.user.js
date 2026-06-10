// ==UserScript==
// @name         Auto Mock Test Data
// @namespace    http://tampermonkey.net/
// @version      1.2.8
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
    AI_ENABLE_PRELOAD: true,
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
  const deepseekCache = new Map();
  const deepseekPendingRequests = new Map();

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
          { role: "system", content: systemPrompt || getAiRecommendationSystemPrompt() },
          { role: "user", content: `字段名：${promptKey}` }
        ],
        temperature: 0.1,
        max_tokens: 200
      };
      if (isOfficialDeepSeekApi(requestUrl)) {
        requestBody.thinking = { type: "disabled" };
      }

      GM_xmlhttpRequest({
        method: 'POST',
        url: requestUrl,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.DEEPSEEK_API_KEY}`
        },
        data: JSON.stringify(requestBody),
        onload: function(res) {
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
            const data = JSON.parse(res.responseText);
            const extracted = extractDeepSeekResult(data);
            if (extracted.value) {
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

  const FIELD_CONTAINER_SELECTORS = '.el-input, .el-textarea, .el-select, .el-date-editor, .el-cascader, .el-radio-group, .el-switch, .el-form-item';
  const FIELD_INPUT_SELECTORS = [
    '.el-select input.el-input__inner',
    '.el-date-editor input.el-input__inner',
    '.el-cascader .el-input__inner',
    '.el-textarea__inner',
    '.el-input__inner',
    '.el-radio__original',
    '.el-switch__input',
    'textarea',
    'input:not([type="hidden"])'
  ];

  function isFormFieldInputElement(target) {
    return Boolean(target) && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
  }

  function normalizeElement(target) {
    if (!target) return null;
    if (target.nodeType === 1) return target;
    return target.parentElement || null;
  }

  function findFieldFromContainer(container) {
    const element = normalizeElement(container);
    if (!element) return null;
    if (isFormFieldInputElement(element) && element.type !== 'hidden') return element;
    if (typeof element.querySelector !== 'function') return null;

    for (let i = 0; i < FIELD_INPUT_SELECTORS.length; i++) {
      const field = element.querySelector(FIELD_INPUT_SELECTORS[i]);
      if (isFormFieldInputElement(field) && field.type !== 'hidden') {
        return field;
      }
    }
    return null;
  }

  function resolveMockFieldElement(target) {
    const element = normalizeElement(target);
    if (!element) return null;
    if (isFormFieldInputElement(element) && element.type !== 'hidden') return element;

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

    const ignoreList = CONFIG.IGNORE_KEYWORDS || DEFAULT_CONFIG.IGNORE_KEYWORDS;
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
    rememberLatestInteraction(e.target);
    const fieldElement = resolveMockFieldElement(e.target);
    if (!fieldElement) return;
    const context = getFieldContext(fieldElement);
    if (!context) return;
    scheduleAiRecommendationPreload(context, { triggerType: 'hover' });
  }, true);

  ['pointerdown', 'mousedown', 'click', 'focusin'].forEach((eventName) => {
    document.addEventListener(eventName, (e) => {
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
        if (event.data.config.SHORTCUT_AI_TRIGGER) CONFIG.SHORTCUT_AI_TRIGGER = event.data.config.SHORTCUT_AI_TRIGGER;
        if (typeof event.data.config.aiManualTriggerMode === 'boolean') CONFIG.AI_MANUAL_TRIGGER_MODE = event.data.config.aiManualTriggerMode;
        if (typeof event.data.config.AI_MANUAL_TRIGGER_MODE === 'boolean') CONFIG.AI_MANUAL_TRIGGER_MODE = event.data.config.AI_MANUAL_TRIGGER_MODE;
        if (typeof event.data.config.aiEnableClassification === 'boolean') CONFIG.AI_ENABLE_CLASSIFICATION = event.data.config.aiEnableClassification;
        if (typeof event.data.config.AI_ENABLE_CLASSIFICATION === 'boolean') CONFIG.AI_ENABLE_CLASSIFICATION = event.data.config.AI_ENABLE_CLASSIFICATION;
        if (typeof event.data.config.aiEnablePreload === 'boolean') CONFIG.AI_ENABLE_PRELOAD = event.data.config.aiEnablePreload;
        if (typeof event.data.config.AI_ENABLE_PRELOAD === 'boolean') CONFIG.AI_ENABLE_PRELOAD = event.data.config.AI_ENABLE_PRELOAD;
        if (typeof event.data.config.deepseekApiUrl === 'string') CONFIG.DEEPSEEK_API_URL = event.data.config.deepseekApiUrl;
        if (typeof event.data.config.DEEPSEEK_API_URL === 'string') CONFIG.DEEPSEEK_API_URL = event.data.config.DEEPSEEK_API_URL;
        if (typeof event.data.config.deepseekApiModel === 'string') CONFIG.DEEPSEEK_API_MODEL = event.data.config.deepseekApiModel;
        if (typeof event.data.config.DEEPSEEK_API_MODEL === 'string') CONFIG.DEEPSEEK_API_MODEL = event.data.config.DEEPSEEK_API_MODEL;
        if (typeof event.data.config.deepseekApiKey === 'string') CONFIG.DEEPSEEK_API_KEY = event.data.config.deepseekApiKey;
        if (typeof event.data.config.DEEPSEEK_API_KEY === 'string') CONFIG.DEEPSEEK_API_KEY = event.data.config.DEEPSEEK_API_KEY;
      }
    }
  }, false);

  async function fillElementUiForms() {
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
        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: #606266;">AI 推荐类目快捷键 (Alt + ?)</label>
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
          保留 AI 推荐快捷键（选中字段后，按快捷键刷新当前字段推荐类目）
        </label>
        <label style="display:flex; align-items:center; gap:8px; font-size:13px; color:#606266; margin-bottom:10px;">
          <input type="checkbox" id="setting-ai-enable-classification" ${CONFIG.AI_ENABLE_CLASSIFICATION !== false ? 'checked' : ''}/>
          启用 AI 类目推荐；关闭后仅使用本地兜底推荐，不请求 AI，不消耗 Token
        </label>
        <label style="display:flex; align-items:center; gap:8px; font-size:13px; color:#606266; margin-bottom:10px;">
          <input type="checkbox" id="setting-ai-enable-preload" ${CONFIG.AI_ENABLE_PRELOAD !== false ? 'checked' : ''}/>
          启用 AI 预加载分类；关闭后仅在打开弹窗时按需请求 AI
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
      CONFIG.SHORTCUT_AI_TRIGGER = document.getElementById('setting-ai-trigger').value.toLowerCase() || 's';
      const ignores = document.getElementById('setting-ignore').value.split(',').map(s => s.trim()).filter(Boolean);
      CONFIG.IGNORE_KEYWORDS = ignores.length ? ignores : DEFAULT_CONFIG.IGNORE_KEYWORDS;
      CONFIG.AI_MANUAL_TRIGGER_MODE = document.getElementById('setting-ai-manual-mode').checked;
      CONFIG.AI_ENABLE_CLASSIFICATION = document.getElementById('setting-ai-enable-classification').checked;
      CONFIG.AI_ENABLE_PRELOAD = document.getElementById('setting-ai-enable-preload').checked;
      
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
