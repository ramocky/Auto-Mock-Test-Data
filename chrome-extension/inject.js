(function() {
  console.log("Auto Mock Inject script loaded.");

  // ==========================================
  // [用户配置区] 扩展动态配置参数 (受 Options 控制)
  // ==========================================
  const CONFIG = {
    SHORTCUT_SPOTLIGHT: 'x',
    SHORTCUT_FILL_ALL: 'z',
    IGNORE_KEYWORDS: ['id', '创建', '更新', '主键', '忽略', '只读', '序号', 'id_', '_id', 'created', 'updated']
  };

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
    }
  };

  // ==========================================
  // 2. 字段名智能匹配路由 (Field Dictionary)
  // ==========================================
  const resolveMockType = (label) => {
    label = (label || '').toLowerCase();
    if (/姓名|名字|人名|称呼|人|name|user/.test(label)) return MockFactory.name();
    if (/手机|电话|联系方式|联系号码|phone|mobile|tel/.test(label)) return MockFactory.phone();
    if (/邮箱|邮件|email|e-mail|mail/.test(label)) return MockFactory.email();
    if (/身份证|证件号|idcard|id_card/.test(label)) return MockFactory.idcard();
    if (/卡号|银行卡|账号|account|card/.test(label)) return MockFactory.bankCard();
    if (/头衔|职务|岗位|职位|职称|title|position|job/.test(label)) return MockFactory.title();
    if (/地址|地点|区域|省|市|区|address|location|region/.test(label)) return MockFactory.address();
    if (/网址|链接|主页|url|website|link/.test(label)) return MockFactory.url();
    if (/日期|时间|date|time/.test(label)) return MockFactory.date(); // 日期时间合并匹配默认给date
    if (/文本|描述|备注|详情|内容|text|desc|content|remark/.test(label)) return MockFactory.text();
    if (/数字|数量|金额|库存|总数|价格|num|count|amount|price/.test(label)) return MockFactory.number();
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

  // ==========================================
  // 4. Spotlight 悬浮窗控制台 (In-page Command Console)
  // ==========================================
  let spotlightTargetElement = null; // 记忆焦点输入框
  
  // 持续跟踪全局最后一个处于聚焦状态的输入框（解决点击扩展图标时焦点丢失的问题）
  document.addEventListener('focusin', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
      spotlightTargetElement = e.target;
    }
  }, true);

  function createSpotlightUI() {
    if (document.getElementById('mock-ext-spotlight')) return;

    const container = document.createElement('div');
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
      width: 480px;
      background: rgba(255, 255, 255, 0.98);
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;
    
    const title = document.createElement('div');
    title.innerText = '⚡ 选择要填入的数据格式';
    title.style.cssText = 'font-size: 16px; color: #333; margin-bottom: 20px; font-weight: bold; user-select: none; text-align: center;';
    panel.appendChild(title);

    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;';

    const mockTypes = [
      { label: 'CN 人名', cmd: 'name' },
      { label: '手机号', cmd: 'phone' },
      { label: '邮箱', cmd: 'email' },
      { label: '身份证', cmd: 'idcard' },
      { label: '银行卡', cmd: 'bankCard' },
      { label: '职务头衔', cmd: 'title' },
      { label: '详细地址', cmd: 'address' },
      { label: '随机链接', cmd: 'url' },
      { label: '随机数字', cmd: 'number' },
      { label: '日期', cmd: 'date' },
      { label: '时间', cmd: 'time' },
      { label: '长文本段落', cmd: 'text' }
    ];

    mockTypes.forEach(item => {
      const btn = document.createElement('button');
      btn.innerText = item.label;
      btn.style.cssText = `
        padding: 12px 0;
        background: #f4f6f8;
        border: 1px solid #e4e7ed;
        border-radius: 6px;
        color: #606266;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        outline: none;
      `;
      btn.onmouseover = () => { btn.style.background = '#e6f1fc'; btn.style.color = '#409eff'; btn.style.borderColor = '#c6e2ff'; };
      btn.onmouseout = () => { btn.style.background = '#f4f6f8'; btn.style.color = '#606266'; btn.style.borderColor = '#e4e7ed'; };
      btn.onclick = () => {
        executeSpotlightCommand(item.cmd);
        closeSpotlight();
      };
      grid.appendChild(btn);
    });

    panel.appendChild(grid);
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
    createSpotlightUI();
    const container = document.getElementById('mock-ext-spotlight');
    
    if (container.style.display === 'none') {
      // 如果触发时直接通过快捷键，当前还有焦点，则更新记忆
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        spotlightTargetElement = document.activeElement;
      }
      
      container.style.display = 'flex';
    } else {
      closeSpotlight();
    }
  }

  function closeSpotlight() {
    const container = document.getElementById('mock-ext-spotlight');
    if (container) container.style.display = 'none';
    if (spotlightTargetElement && typeof spotlightTargetElement.focus === 'function') {
      spotlightTargetElement.focus();
    }
  }

  function executeSpotlightCommand(cmd) {
    if (!spotlightTargetElement || (spotlightTargetElement.tagName !== 'INPUT' && spotlightTargetElement.tagName !== 'TEXTAREA')) {
      alert("Auto Mock: 请先将光标点击聚焦到需要插入的输入框内，再唤出控制台！");
      return;
    }

    const inputEl = spotlightTargetElement;
    // 如果是内置方法，调用 MockFactory，否则通过路由
    let mockValue = '';
    if (MockFactory[cmd]) {
      mockValue = MockFactory[cmd]();
    } else {
      mockValue = resolveMockType(cmd);
    }

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
      const componentName = vueInstance && vueInstance.$options ? vueInstance.$options.name : '';

      const isNativeDisabled = input.disabled || input.hasAttribute('disabled') || input.closest('.is-disabled');
      const isVueDisabled = vueInstance && (vueInstance.disabled || vueInstance.inputDisabled || vueInstance.selectDisabled);
      
      if (isNativeDisabled || isVueDisabled) continue;

      if (input.readOnly || input.hasAttribute('readonly')) {
        if (!CustomHooks[componentName]) continue;
      }

      let labelText = '';
      const formItem = input.closest('.el-form-item');
      if (formItem) {
        const labelEl = formItem.querySelector('.el-form-item__label');
        if (labelEl) labelText = labelEl.innerText;
      }
      
      // 提取字段标签 (Vue 内存回溯，精准度最高，专治隐藏标题和复杂下拉框)
      if (!labelText && vueInstance) {
        let parent = vueInstance.$parent;
        while (parent) {
          if (parent.$options) {
            if (parent.$options.name === 'ElFormItem' && parent.label) {
              labelText = parent.label;
              break;
            }
            if (parent.$options.name === 'ElTableColumn' && parent.label) {
              labelText = parent.label;
              break;
            }
          }
          parent = parent.$parent;
        }
      }

      if (!labelText) labelText = input.placeholder || '';
      if (!labelText && input.name) labelText = input.name;
      
      // 检查是否命中黑名单
      const isIgnored = CONFIG.IGNORE_KEYWORDS.some(keyword => labelText.toLowerCase().includes(keyword.toLowerCase()));
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
    }
  });

})();
