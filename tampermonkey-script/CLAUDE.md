# Tampermonkey 脚本模块

> 根目录 ← [Auto Mock Test Data](../CLAUDE.md)

## 简介

油猴脚本单文件版，代码开头 `CONFIG` 对象可直接修改配置。

## 入口

- **`auto-mock.user.js`** — 单文件完整实现（与扩展版 `inject.js` 逻辑一致）

## 文件清单

| 文件 | 角色 |
|------|------|
| `auto-mock.user.js` | 单文件完整脚本（数据工厂 + 路由 + 组件钩子 + 悬浮面板） |

## 外部依赖

- **Tampermonkey API**: `GM_getValue`, `GM_setValue`, `GM_registerMenuCommand`
- **Vue.js 运行时桥接**: 通过 `__vue__` / `$emit` 实现

## 与扩展版的差异

- 无需 `content.js` 桥接层，脚本直接运行在页面上下文
- 配置持久化使用 `GM_getValue/GM_setValue` 而非 `chrome.storage.sync`
- 无 Options 配置页面，修改 `CONFIG` 对象需编辑脚本头部
- 无 `popup` 弹出面板

## 数据流

```
用户按键 → document keydown 监听 → fillElementUiForms() / toggleSpotlight()
配置变更 → 编辑脚本头部 CONFIG → 重新安装/刷新
```
