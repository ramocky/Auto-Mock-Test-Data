# ⚡ Auto Mock Test Data

一款为前端开发者和测试人员打造的**极速、轻量级**表单数据模拟神器。专为现代前端框架（特别是 **Element UI** / Vue 系列）深度定制，支持全量一键智能填充与点选填充。

提供 **Chrome 原生扩展** 与 **Tampermonkey 油猴脚本** 两个版本，多端统一的极致体验。

## ✨ 核心特性

- 🚀 **极速响应**：纯原生 JS 编写，零依赖，秒级唤出绝不卡顿。
- 🎯 **全局双快捷键**：
  - **`Alt + X`**：秒开可视化 Spotlight 悬浮面板，支持单条精细化点击填充。
  - **`Alt + Z`**：暴力美学，一键全量填充当前页面所有空闲输入框。
- 🛡️ **智能防误填 (Ignore List)**：内置黑名单（如 id、创建时间、忽略等），遇到只读或敏感字段自动绕道，支持完全自定义配置。
- 🧠 **Element UI 深度适配**：完美穿透 Vue 底层，支持原生 Select、DatePicker、TimePicker、Switch、RadioGroup 的随机自动选择。
- 📦 **23 大海量通用数据源**：支持随机生成：人名、英文名、手机号、邮箱、身份证、年龄、信用代码、企业名称、车牌号、邮政编码、IP地址、MAC地址、强密码、颜色值、银行卡、职务头衔、详细地址、URL、金额、数字、日期、时间、长文本段落。

## 📁 目录结构

本仓库包含两个独立版本，它们的核心体验和逻辑完全一致，您可以按需取用：

- [`/chrome-extension`](./chrome-extension/)：**Chrome 浏览器插件版**。带有优雅的可视化配置面板（Options），支持云同步（`chrome.storage.sync`）您的自定义拦截规则和快捷键。
- [`/tampermonkey-script`](./tampermonkey-script/)：**油猴脚本版**。单文件纯净版（`auto-mock.user.js`），支持一键安装到 GreasyFork。修改代码头部的 `CONFIG` 对象即可快速配置。

## 📦 安装与使用

### 方案 A：作为 Chrome 扩展安装 (推荐)
1. 下载或克隆本仓库代码。
2. 打开 Chrome 浏览器，访问 `chrome://extensions/`。
3. 开启右上角的 **“开发者模式”**。
4. 点击 **“加载已解压的扩展程序”**，选择本仓库中的 `chrome-extension` 文件夹。
5. （可选）右键插件图标 -> **选项**，即可图形化配置您的忽略黑名单和快捷键。

### 方案 B：作为油猴脚本安装
1. 确保您的浏览器已安装 [Tampermonkey](https://www.tampermonkey.net/) 插件。
2. 打开本库中的 `tampermonkey-script/auto-mock.user.js`。
3. 复制全部代码并在 Tampermonkey 中添加新脚本粘贴保存即可。

## ⚙️ 个性化配置

本工具最大的特色在于**彻底摆脱死板约束**：
- **插件版**：通过插件原生配置页，您可以随心所欲增删黑名单过滤词，甚至在网页里点击绑定任何您顺手的全局快捷键组合。
- **油猴版**：脚本顶部提供了最简洁的 `CONFIG` 对象，开箱即改。

## 📄 License
MIT License
