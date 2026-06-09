# Chrome 扩展模块

> 根目录 ← [Auto Mock Test Data](../CLAUDE.md)

## 简介

Chrome Manifest V3 扩展版，含可视化配置面板（Options），支持 `chrome.storage.sync` 云同步。

## 入口

- **`manifest.json`** — MV3 配置清单：声明权限、资源、内容脚本
- **`content.js`** — 内容注入脚本（注入 `inject.js` + 读取用户配置）
- **`inject.js`** — 核心 Mock 引擎（数据工厂、智能路由、组件钩子、悬浮面板）

## 文件清单

| 文件 | 角色 |
|------|------|
| `manifest.json` | 扩展配置（权限、脚本注入、图标） |
| `content.js` | 内容脚本桥接层（配置中转） |
| `inject.js` | 核心引擎（~500行，含全部逻辑） |
| `background.js` | Service Worker（快捷键监听） |
| `popup.html` / `popup.js` | 弹出面板（一键填充/唤出控制台） |
| `options.html` / `options.js` | 偏好设置页（黑名单管理 + 快捷键绑定） |
| `download.js` | logo 下载脚本（Node.js 工具） |
| `logo.png` | 扩展图标 |

## 外部依赖

- **Chrome Extension APIs**: `scripting`, `storage`, `activeTab`, `commands`
- **Vue.js 运行时桥接**: 通过 `__vue__` / `$emit` 实现（非编译依赖）

## 数据流

```
用户按键 → background.js → content.js → postMessage → inject.js → fillElementUiForms()
用户配置变更 → options.js → chrome.storage.sync → content.js → postMessage → inject.js 热更新
```

## 关键函数

- `fillElementUiForms()` — 全量填充入口，遍历所有 `el-input` / `el-textarea`
- `createSpotlightUI()` — 悬浮面板生成
- `executeSpotlightCommand(cmd)` — 面板单条填充
- `resolveMockType(label)` — 字段名 → Mock 数据类型路由

## 未解决问题

- 一些非常规布局的 label 提取依赖 DOM 回溯，存在性能风险（已限制扫描深度）
