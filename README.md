# 森林秘境探险

基于 `Vue 3 + Vite + Vitest` 的交互式文字选择冒险小游戏。玩家在迷雾森林中追寻失踪的姐姐，通过连续分支推进剧情、累积真相线索，并在不同结局间收束第一章故事。

当前版本包含：

- 首页、序章、15 个连续剧情场景
- 记忆值、线索、森林信任、白鹿与心种等状态判定
- 10 条分阶段 BGM
- 章节化 JSON 文案配置
- 全流程单元测试与构建验证

## 环境要求

- Node.js 20 及以上
- npm 10 及以上
- Windows PowerShell 下建议使用 `npm.cmd`

项目已经通过 [`.npmrc`](./.npmrc) 把 npm 缓存固定到仓库内的 `.npm-cache/`，不会把缓存写到全局默认目录。

## 快速开始

安装依赖：

```powershell
npm.cmd install
```

启动开发服务器：

```powershell
npm.cmd run dev
```

默认访问地址：

```text
http://127.0.0.1:4173/
```

运行测试：

```powershell
npm.cmd run test
```

构建生产版本：

```powershell
npm.cmd run build
```

本地预览构建产物：

```powershell
npm.cmd run preview
```

## 目录结构

```text
Forest_Secret_Adventure_game/
├─ src/
│  ├─ assets/
│  │  ├─ audio/          所有正式使用的 BGM
│  │  └─ images/         场景与结局插图
│  ├─ components/        页面与交互组件
│  ├─ composables/       游戏状态机与 BGM 控制器
│  ├─ data/              音频映射与剧情配置
│  ├─ types/             TypeScript 类型
│  ├─ App.vue
│  ├─ main.ts
│  └─ styles.css
├─ docs/
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
└─ vitest.config.ts
```

## 剧情与配置入口

主要内容都在这几个文件里：

- [`src/data/story-content.json`](./src/data/story-content.json)
  - 首页文案
  - 序章文案
  - 场景顺序
  - 每个场景的正文、提示、选项、效果
  - 结局文案
  - UI 文案
- [`src/data/story.ts`](./src/data/story.ts)
  - 把 JSON 数据整理成运行时可用结构
  - 场景图片与结局图片映射
- [`src/composables/useGameEngine.ts`](./src/composables/useGameEngine.ts)
  - 游戏主状态
  - 选项执行
  - 数值与结局判定
  - 页面切换与 BGM 触发
- [`src/composables/useBgmController.ts`](./src/composables/useBgmController.ts)
  - 音轨切换
  - 淡入淡出
  - 静音状态持久化

## 音频资源规范

所有正式使用的音频文件统一放在：

```text
src/assets/audio/
```

当前 BGM 映射如下：

| Cue | 用途 | 文件 |
| --- | --- | --- |
| `home` | 首页 | `domartistudios-magic-forest-473582.mp3` |
| `prologue` | 序章 / 开始前夜 | `syouki_takahashi-midnight-forest-184304.mp3` |
| `departure` | 出发与早期推进 | `deuslower-fantasy-medieval-mystery-ambient-292418.mp3` |
| `investigation` | 调查与辨认线索 | `ovrsoull-dark-ambient-cinematic-drone-investigative-pulse-minimalist-tension-454723.mp3` |
| `revelation` | 真相逐步显现 | `romansenykmusic-cinematic-fantasy-dark-160932.mp3` |
| `danger` | 高风险场景 | `wbmstudio-dramatic-tension-dark-cinematic-tension-467871.mp3` |
| `finale` | 终局区域 | `sigmaeffect-cinematic-dark-tension-atmosphere-464380.mp3` |
| `victory` | 普通胜利 | `paulyudin-hopeful-piano-emotional-158606.mp3` |
| `hidden` | 隐藏胜利 | `royaltyfreemusicstudio-hopeful-cinematic-journey-506057.mp3` |
| `fail` | 失败结局 | `megalix-dark-ambient-for-crime-and-tension-360762.mp3` |

音频映射定义在 [`src/data/audio.ts`](./src/data/audio.ts)。后续如果替换音频文件，保持文件放在 `src/assets/audio/` 并同步更新映射即可。

## 图片资源规范

所有正式使用的图片统一放在：

```text
src/assets/images/
```

场景与结局图片映射由 [`src/data/story.ts`](./src/data/story.ts) 管理。新增图片时，先放入目录，再把映射补齐。

## 测试与构建检查

这个项目至少要通过两类检查：

1. 逻辑测试

```powershell
npm.cmd run test
```

覆盖内容包括：

- 游戏主流程
- 隐藏结局条件
- 失败与普通胜利收敛
- BGM 控制器切换、循环与静音持久化
- 音频映射完整性

2. 构建检查

```powershell
npm.cmd run build
```

这一步会直接验证：

- 图片路径是否可解析
- 音频路径是否可解析
- Vite 是否能正确打包所有静态资源

如果音频文件移动后路径写错，通常会在构建阶段直接暴露，而不是拖到线上才发现。

## GitHub Pages 部署

项目使用 GitHub Actions 部署 Pages，工作流文件是：

- [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml)

关键点：

- `Settings -> Pages -> Source` 必须选择 `GitHub Actions`
- 不要把源码目录直接当静态站点发布
- Vite 会在构建阶段生成 `dist/`
- Pages 应该发布 `dist/` 产物，而不是仓库根目录的 `index.html`

如果线上空白页，同时页面源码里看到：

```html
<script type="module" src="/src/main.ts"></script>
```

说明你发布的是源码入口，而不是构建产物。正确的生产资源路径应该类似：

```text
/Forest_Secret_Adventure_game/assets/index-xxxx.js
```

## 常见问题

### 1. PowerShell 下 `npm` 命令行为不稳定

优先使用：

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run test
npm.cmd run build
```

### 2. 页面没有音乐

先检查三件事：

- 浏览器是否拦截了自动播放
- 是否点过触发播放的按钮
- [`src/data/audio.ts`](./src/data/audio.ts) 对应的文件是否仍存在于 `src/assets/audio/`

### 3. 构建时报音频路径错误

检查：

- `src/assets/audio/` 中目标文件是否存在
- 文件名是否和 [`src/data/audio.ts`](./src/data/audio.ts) 完全一致
- 是否误把音频重新放回了根目录 `music/`

### 4. 修改剧情后选项不生效

优先检查 [`src/data/story-content.json`](./src/data/story-content.json)：

- `choice.id` 是否唯一
- `effect.transitionKey` 是否存在于 `transitions`
- `nextSceneId`、`endingId`、`endingReason` 是否匹配当前类型定义

## 开发建议

- 先改 JSON 文案，再改状态机逻辑
- 改完剧情或音频映射后，至少跑一次测试和一次构建
- 不要在仓库里同时保留两套同用途音频目录
- 资源路径问题优先通过构建验证，不要等线上排查
