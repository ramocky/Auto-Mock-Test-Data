<!-- Claude Code | d:\Auto\Mock\Test\Data | 2026-11-12 -->

**Human:**

<ide_selection>The user selected the lines 12 to 13 from d:\omni-store-retail-h5\src\views\profile\index.vue:
，其下若还有审批人行，
         由审批人行收尾，驳回块不做底部圆角

This may or may not be related to the current task.</ide_selection>

给客户资料提交页面提交按钮增加防抖节流事件？都行，主要目的是为了避免重复提交

---

**Claude:**

我先查看客户资料提交页面的提交相关代码。

---

**Claude:**

[Tool: Bash — ls "d:/omni-store-retail-h5/src/views/profile/"]

---

**Claude:**

[Tool: Grep — 提交|submit|handleSubmit|onSubmit]

---

**Human:**

[Result: 99:            <!-- 回填的历史银行名没有联行号，提交会被拦下，提前给出可操作提示 -->
214:      <button class="submit-btn" :disabled="submitting" @click="submit"> {{ submitting ? '提交中…' : (activeTab === 2 ? '重新提交审核' : '提交审核') }} </button>
267:import { getProfileInfo, submitProfile } from '@/api/profile'
360:/* 契约：附件字段是 JSON 数组字符串，元素形状取自提交接口的请求示例
392:      submitting: false,
424:           契约要求必填上送，同时用于提交前校验所选银行真实存在 */
452:         前端不自拼对象键；fileSize 存字节数供提交用，fileSizeText 才是页面文案。
453:         name 是附件位名称，只用于页面文案与校验提示，不随提交上传。 */...]

---

**Human:**

[Result: index.vue]

---

**Claude:**

[Tool: Read — d:/omni-store-retail-h5/src/views/profile/index.vue]

---

**Human:**

[Result: 1120	        if (!target) return;
1121	        var top = target.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
1122	        box.scrollTo({ top: Math.max(0, top - 80), behavior: 'smooth' });
1123	      });
1124	    },
1125	
1126	    /* ---------- 提交 ----------
1127	       载荷字段按契约 POST /dhb/profile/submit 的请求示例，一个不多一个不少
1128	       （bankClearingCode 自 2026-10-23 起已是必填字段，联行号随载荷上送）。
1129	       附件在选中时已上传完毕，这里只做序列化，不再传文件。
1130	       四元组由拦截器写入请求头，不必在此再拼。 */
1131	    su...]

---

**Claude:**

[Tool: Read — d:/omni-store-retail-h5/src/views/profile/index.vue]

---

**Claude:**

[Tool: Bash — cat d:/omni-store-retail-h5/package.json; echo ---; ls d:/omni-store-retail-h5/s]

---

**Human:**

[Result: 196	            <div class="upmeta">
197	              <b v-if="f.uploading" class="uploading">↑ 上传中…</b>
198	              <b v-else>✓ 上传成功</b>
199	              <span>{{ f.fileName }} · {{ f.fileSizeText }}</span>
200	            </div>
201	          </div>
202	          <!-- 未传满才留上传入口。max 全为 1，所以 files 非空时这里已不渲染，
203	               文案直接用 hint；将来某位放开多张时再补 addHint 分支 -->
204	          <div v-if="a.files.length < a.max" class="upbox" @click="triggerUpload(i)">
205	            <span class="plus">...]

---

**Claude:**

[Tool: Grep — debounce|throttle|防抖|节流]

---

**Human:**

[Result: d:\omni-store-retail-h5\src\views\profile\index.vue:500:      /* 上次同步审批状态的时间戳，用于页面重新激活时的节流 */
d:\omni-store-retail-h5\src\views\profile\index.vue:548:       pageshow / focus 紧跟着触发也能被节流拦住 */
d:\omni-store-retail-h5\src\views\profile\index.vue:622:         节流到 30s，避免一次回来打三四个接口 */
d:\omni-store-retail-h5\src\views\profile\index.vue:921:    /* 输入防抖：连续打字只发最后一次，避免每键一次请求。]

---

**Human:**

[Result: {
  "name": "omni-store-retail-h5",
  "version": "1.0.0",
  "private": true,
  "description": "客户资料完善 H5 表单页",
  "scripts": {
    "dev": "vite",
    "serve": "vite",
    "build": "vite build",
    "build:uat": "vite build --mode uat",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^0.21.4",
    "vant": "2.13.9",
    "vue": "2.7.16",
    "vue-router": "3.0.2"
  },
  "devDependencies": {
    "@vitejs/plugin-vue2": "^2.3.3",
    "terser": "^5.20.0",
    "v...]

---

**Claude:**

[Tool: Bash — ls d:/omni-store-retail-h5/src/utils; echo ---; head -60 d:/omni-store-retail-h5]

---

**Claude:**

[Tool: Read — d:/omni-store-retail-h5/src/views/profile/index.vue]

---

**Human:**

[Result: 540	
541	  /* 输入后即时清除该字段的错误态，避免用户改对了还飘红 */
542	  created() {
543	    var self = this
544	    RULES.forEach(function (r) {
545	      self.$watch('form.' + r.k, function () { self.clearError(r.k) })
546	    })
547	    /* 首次查询由 loadProfile 打时间戳，后面 mounted 里的
548	       pageshow / focus 紧跟着触发也能被节流拦住 */
549	    this.loadProfile()
550	  },
551	
552	  /* 页面被重新激活时同步一次审批状态。
553	     场景：用户跳去别的页面/应用处理完审批再切回来，
554	     不重新查一次就会一直停在旧状态（比如仍是「审核中」）。
555	     visibilitychange 覆盖切标签页/切前后台，pageshow 覆盖 bfcache 恢复，...]

---

**Claude:**

[Tool: Read — d:/omni-store-retail-h5/src/views/profile/index.vue]

---

**Human:**

[Result: debugConsole.js
entryParams.js
noZoom.js
request.js
---
==> d:/omni-store-retail-h5/src/utils/debugConsole.js <==
import Vue from 'vue'
import { isDebugHostAllowed } from '@/config/debug'

/**
 * 调试日志。
 *
 * web-view 里看不到 console，所以提供一个隐藏入口：在页面「主体信息」标题上
 * 连点 5 次打开浮层，直接看入口参数和每个接口的请求 / 响应。
 *
 * 三个刻意的设计：
 * - 日志始终写进内存环（上限 MAX_LOGS 条），打开浮层时能回溯页面加载以来的记录，
 *   而不是只看到打开之后发生的请求。
 * - 控制台输出只在开发构建或浮层打开时进行，生产环境不开浮层就是静默的。
 * - 域名不在 src/config/debug.js 的白名单时，开关与记录全部关闭：
 *   不产生日志对象、不写入任何鉴权参数，...]

---

**Human:**

[Result: 915	      if (this.locked) return;
916	      this.bankShow = true;
917	      this.bankKeyword = this.form.bankFullName || '';
918	      this.bankOptions = [];
919	    },
920	
921	    /* 输入防抖：连续打字只发最后一次，避免每键一次请求。
922	       同时清掉已选中的联行号——关键词变了，之前选中的银行已不成立。 */
923	    onBankKeywordInput() {
924	      var self = this;
925	      if (this.bankTimer) clearTimeout(this.bankTimer);
926	      if (this.bankKeyword.trim() !== (this.form.bankFullName || '').trim()) {
927	        this.form.bankClearingCode = ...]

---

**Claude:**

[Tool: Grep — submitProfile|submit\(\)|@click=\"submit\"]

---

**Human:**

[Result: d:\omni-store-retail-h5\src\api\profile.js:21:export function submitProfile(data) {
d:\omni-store-retail-h5\src\api\profile.js:29:export default { getProfileInfo, submitProfile }
d:\omni-store-retail-h5\src\views\profile\index.vue:214:      <button class="submit-btn" :disabled="submitting" @click="submit"> {{ submitting ? '提交中…' : (activeTab === 2 ? '重新提交审核' : '提交审核') }} </button>
d:\omni-store-retail-h5\src\views\profile\index.vue:267:import { getProfileInfo, submitProfile } from '@/api/profile...]

---

**Claude:**

[Tool: Read — d:/omni-store-retail-h5/src/views/profile/index.vue]

---

**Human:**

[Result: 485	      /* 提交要 {regionCode, fullPath, label}，从 selected 拼出来后存这里 */
486	      bankCityArea: null,
487	      addressArea: null,
488	
489	      /* 开户银行远程检索 */
490	      bankShow: false,
491	      bankKeyword: '',
492	      bankOptions: [],
493	      bankLoading: false,
494	      bankTimer: null,
495	
496	      toastShow: false,
497	      toastMsg: '',
498	      toastTimer: null,
499	
500	      /* 上次同步审批状态的时间戳，用于页面重新激活时的节流 */
501	      lastApprovalSync: 0,
502	
503	      /* 调试浮层连点计数与最后一次点击时间、事件类型，...]

---

**Claude:**

[Tool: Grep — &lt;form|&lt;/form&gt;|@submit]

---

**Human:**

[Result: No matches found]

---

**Claude:**

[Tool: Read — d:/omni-store-retail-h5/src/views/profile/index.vue]

---

**Human:**

[Result: 380	      uid: k + 1,
381	      status: 'success',
382	      fileKey: f.fileKey || ''
383	    }
384	  }))
385	}
386	
387	export default {
388	  name: 'PROFILEINDEX',
389	
390	  data() {
391	    return {
392	      submitting: false,
393	
394	      subjectTypes: ['公司', '个体工商户', '自然人'],
395	      vatTypes: ['是', '否'],
396	
397	      /* 只读客户信息，由 GET /dhb/profile/info 回填 */]

---

**Claude:**

[Tool: Read — d:/omni-store-retail-h5/src/views/profile/index.vue]

---

**Human:**

[Result: 264	<script>
265	import { RULES } from '@/config/rules'
266	import { uploadFile } from '@/api/upload'
267	import { getProfileInfo, submitProfile } from '@/api/profile'
268	import { listRegionTree, listRegionByParentCode, searchBankNames } from '@/api/region'
269	import { ImagePreview } from 'vant'
270	import { hasEntryParams, getEntryParams } from '@/utils/entryParams'
271	import { toggleDebugPanel } from '@/utils/debugConsole'
272	
273	/* 主体类型：接口用 1/2/3，界面用文案 */
274	const SUBJECT_TYPE_LABELS = ...]

---

**Claude:**

现有代码里 `submit()` 只有一个 `submitting` 的进行中拦截，请求一结束（尤其是快速失败）后连点/双击仍可能再发一单。我按「前沿节流 + 在途拦截」补上，首次点击立即生效，后续点击在窗口内静默忽略。防抖会把提交整体延后，不适合表单提交。

---

**Claude:**

[Tool: Edit — d:/omni-store-retail-h5/src/views/profile/index.vue]

---

**Claude:**

[Tool: Edit — d:/omni-store-retail-h5/src/views/profile/index.vue]

---

**Human:**

[Result: The file d:/omni-store-retail-h5/src/views/profile/index.vue has been updated successfully.]

---

**Human:**

[Result: The file d:/omni-store-retail-h5/src/views/profile/index.vue has been updated successfully.]

---

**Claude:**

[Tool: Edit — d:/omni-store-retail-h5/src/views/profile/index.vue]

---

**Human:**

[Result: The file d:/omni-store-retail-h5/src/views/profile/index.vue has been updated successfully.]

---

**Claude:**

[Tool: Read — d:/omni-store-retail-h5/src/views/profile/index.vue]

---

**Human:**

[Result: 1188	    submit() {
1189	      var self = this;
1190	      /* 在途拦截：请求未返回时按钮虽置灰，点击事件仍绑定着，这里兜底 */
1191	      if (this.submitting) return;
1192	      /* 前沿节流：上一单刚结束的窗口期内，连点/双击静默忽略。
1193	         首次点击不受影响，立即进入校验与提交。 */
1194	      var now = Date.now();
1195	      if (now - this.lastSubmitAt < SUBMIT_THROTTLE_MS) return;
1196	
1197	      var res = this.validate();
1198	      if (res.count) {
1199	        this.showToast('还有 ' + res.count + ' 项未填写或格式不正确');
1200	        this.scrollToError();
1201	       ...]

---

**Claude:**

[Tool: PowerShell — Syntax-check the component script block]

---

**Human:**

[Result: syntax OK]

---

**Claude:**

已完成，改动集中在 [src/views/profile/index.vue](src/views/profile/index.vue)。

**方案：前沿节流（throttle），不是防抖**

- 防抖会把首次点击也延后（等静默期结束才提交），按钮手感变差；节流保留首击立即执行，只拦窗口内的后续点击，更适合提交按钮。

具体改动：

1. [src/views/profile/index.vue:299](src/views/profile/index.vue#L299) 新增常量 `SUBMIT_THROTTLE_MS = 800`，并注释了取值理由。
2. [src/views/profile/index.vue:395](src/views/profile/index.vue#L395) data 增加 `lastSubmitAt`。
3. [src/views/profile/index.vue:1188](src/views/profile/index.vue#L1188) `submit()` 现在有两层拦截：
   - `submitting`：请求在途时直接返回（原有逻辑，按钮虽置灰但点击事件仍绑定，保留作兜底）；
   - 800ms 时间窗：上一单刚结束（包括快速失败）后的连点/双击静默忽略。
   - 时间戳只在**通过校验、真正发请求时**写入，所以校验失败后用户改完可以立刻重试，不会被窗口误伤。

验证：提取 `<script>` 块做了 `node --check`，语法通过；按项目现状未跑构建和真机。另外这 800ms 内点击是静默忽略（不回 toast），如果你希望连点时给个轻提示，我可以补一句。

---

**Human:**

800ms 是多久？

---

**Claude:**

800ms = **0.8 秒**，不到一秒。

直观对比：

- 正常双击的两次点击间隔约 200–300ms，800ms 足够把连点/误触全部吃掉；
- 一次眨眼约 300–400ms，800ms 大概是「眨两下」的时间；
- 用户点击后到察觉按钮没反应，通常 500ms 以上才开始疑惑——所以窗口内静默忽略基本无感。

如果觉得偏长/偏短可以调：防手抖建议不低于 500ms；想让快速失败后重试更顺畅，可以降到 500–600ms。要改的话告诉我数值即可。

---
