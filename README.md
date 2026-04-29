# 森林秘境

一个基于 `Vue 3 + Vite + Vitest` 的单页文字选择冒险游戏。  
当前版本已经重做为一条完整的短篇故事线：你必须在黎明前进入禁林，找到被迷雾引走的姐姐，并决定是强行带她离开，还是修复村庄欠下多年的旧约。

## 1. 当前版本包含什么

- 开场页 + `6` 个连续场景
- `记忆值` 数值系统，初始值为 `10`
- `开始 BGM / 胜利 BGM / 失败 BGM`
- `10` 张全屏插画资源
- `3` 个结局：失败、普通胜利、隐藏胜利
- JSON 化剧情配置
- 自动化流程测试

## 2. 故事背景

十年前，村庄为了熬过寒冬，砍伤了森林深处的心树。  
从那以后，秘境开始用迷雾吞噬人的记忆，向村庄讨还代价。

今夜，姐姐带着赎罪的红布条独自进入森林。  
你必须在天亮前找到她，否则姐姐和村庄都会被这场旧债继续拖下去。

## 3. 玩法说明

### 3.1 基础规则

- 玩家从开场页点击“进入秘境”后正式开始
- 初始记忆值：`10/10`
- 每个场景固定提供 `2` 个选择
- 冲动、强硬路线更容易失去记忆值
- 稳妥、理解、救助路线更容易获得线索或信任
- 记忆值 `<= 0` 时立即进入失败结局
- 到达最终场景后，根据状态与选择进入不同结局

### 3.2 你会看到的状态

- `记忆值`：当前还能保住多少自我与目标
- `当前阶段`：你所在的剧情节点
- `真相线索`：你一路上拼回来的关键事实
- `静音 / 开声`：控制 BGM

### 3.3 结局类型

- `失败结局`：你没能撑住迷雾与代价
- `普通胜利`：你救回了姐姐，但森林的旧债没有真正结束
- `隐藏胜利`：你救回姐姐，也让心树重新接受新的约定

### 3.4 隐藏结局条件

必须同时满足：

1. 在石碑前献出记忆，获得森林初步信任
2. 在迷雾岔路和镜湖累计至少 `2` 条真相线索
3. 在断桥祭坛救下白鹿
4. 拿到心种
5. 最终选择“归还心种，承认旧约，请心树停下索债”
6. 中途没有因记忆值归零而失败

## 4. 运行环境

建议使用：

- `Node.js 20+` 或 `22+`
- `npm 10+`

这个项目的依赖安装是本地隔离的，不会写到全局环境：

- 依赖安装在当前项目的 `node_modules/`
- npm 缓存写入当前项目的 `.npm-cache/`

相关配置见 [`.npmrc`](/D:/Project_Folder/Forest_Secret_Adventure_game/.npmrc)。

## 5. 安装与启动

### 5.1 安装依赖

```powershell
npm.cmd install
```

如果你不是在 PowerShell 中，也可以用：

```bash
npm install
```

### 5.2 启动开发服务器

```powershell
npm.cmd run dev
```

Vite 默认会输出实际访问地址。通常是：

```text
http://127.0.0.1:5173/
```

如果端口被占用，Vite 会自动换端口，以终端输出为准。

### 5.3 运行测试

```powershell
npm.cmd run test
```

### 5.4 生产构建

```powershell
npm.cmd run build
```

构建产物输出到 `dist/`。

### 5.5 预览构建结果

```powershell
npm.cmd run preview
```

## 6. 项目结构

```text
Forest_Secret_Adventure_game/
├─ src/
│  ├─ assets/
│  │  ├─ audio/               BGM 文件
│  │  └─ images/              场景与结局插画
│  ├─ components/             页面组件
│  ├─ composables/            游戏逻辑与音频控制
│  ├─ data/                   剧情文本与图片映射
│  ├─ types/                  类型定义
│  ├─ App.vue
│  ├─ main.ts
│  └─ styles.css
├─ .npm-cache/                本地 npm 缓存
├─ node_modules/              本地依赖
├─ dist/                      构建输出
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
└─ vitest.config.ts
```

## 7. 关键文件说明

- [`src/data/story-content.json`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/data/story-content.json)  
  全部剧情文案、选项文案、过场文案、结局文案和 UI 文案都在这里。只改文案时，优先改这个文件。

- [`src/data/story.ts`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/data/story.ts)  
  把 JSON 文案和图片资源组合成前端可直接消费的内容对象。

- [`src/composables/useGameEngine.ts`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/composables/useGameEngine.ts)  
  游戏核心状态机。包括记忆值变化、场景跳转、线索累计、隐藏结局判定、重开与退出重置。

- [`src/composables/useBgmController.ts`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/composables/useBgmController.ts)  
  控制 `开始 / 胜利 / 失败` 三段 BGM 的播放、淡入淡出和静音持久化。

- [`src/components/GameShell.vue`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/components/GameShell.vue)  
  主界面容器，负责在开场页、场景页和结局弹层之间切换。

- [`src/composables/useGameEngine.test.ts`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/composables/useGameEngine.test.ts)  
  剧情流程测试。

- [`src/composables/useBgmController.test.ts`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/composables/useBgmController.test.ts)  
  BGM 控制测试。

## 8. 音频资源如何替换

当前项目默认读取这三个文件：

- [`src/assets/audio/bgm-start.mp3`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/assets/audio/bgm-start.mp3)
- [`src/assets/audio/bgm-victory.mp3`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/assets/audio/bgm-victory.mp3)
- [`src/assets/audio/bgm-fail.mp3`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/assets/audio/bgm-fail.mp3)

替换方式很直接：

1. 保持文件名不变
2. 用你自己的音频覆盖同名文件
3. 重新运行 `npm.cmd run dev` 或 `npm.cmd run build`

当前播放规则：

- 点击“进入秘境”后开始播放 `bgm-start`
- 普通胜利与隐藏胜利切到 `bgm-victory`
- 失败结局切到 `bgm-fail`
- 静音状态会保存到 `localStorage`

## 9. 图片资源如何替换

当前项目使用这些全屏背景图：

- [`src/assets/images/intro-village-gate.png`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/assets/images/intro-village-gate.png)
- [`src/assets/images/scene1-stone-stele.png`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/assets/images/scene1-stone-stele.png)
- [`src/assets/images/scene2-fog-crossroads.png`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/assets/images/scene2-fog-crossroads.png)
- [`src/assets/images/scene3-mirror-lake.png`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/assets/images/scene3-mirror-lake.png)
- [`src/assets/images/scene4-dark-swamp.png`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/assets/images/scene4-dark-swamp.png)
- [`src/assets/images/scene5-broken-bridge-altar.png`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/assets/images/scene5-broken-bridge-altar.png)
- [`src/assets/images/scene6-heart-tree-clearing.png`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/assets/images/scene6-heart-tree-clearing.png)
- [`src/assets/images/ending-fail-lost-memory.png`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/assets/images/ending-fail-lost-memory.png)
- [`src/assets/images/ending-victory-rescue.png`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/assets/images/ending-victory-rescue.png)
- [`src/assets/images/ending-hidden-blessing.png`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/assets/images/ending-hidden-blessing.png)

如果你要换图：

1. 保持文件名不变，直接替换文件
2. 或者改 [`src/data/story.ts`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/data/story.ts) 中的 import 与映射

## 10. 如何修改剧情文案

直接编辑 [`src/data/story-content.json`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/data/story-content.json)。

最常改的几个区域：

- `intro`：开场页标题、导语、按钮
- `scenes.scene1` 到 `scenes.scene6`：场景正文与选项
- `transitions`：每次选择后的过场反馈
- `endings`：三个结局文案
- `ui`：按钮、状态栏、弹层文案

### 10.1 修改选项时要注意

- 只改 `label` 很安全
- `id` 不要随便改
- 如果改了 `id`，必须同步修改 [`src/composables/useGameEngine.ts`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/composables/useGameEngine.ts) 里的分支逻辑

### 10.2 文案占位符

当前文案支持这些占位符：

```text
{memory}
{maxMemory}
{clues}
```

例如：

```text
你的记忆值：{memory}/{maxMemory}
真相线索：{clues}
```

运行时会替换成实时状态。

## 11. 如何修改规则

如果是改玩法、数值或结局条件，主要改这个文件：

- [`src/composables/useGameEngine.ts`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/composables/useGameEngine.ts)

常见修改点：

- 初始记忆值：`MAX_MEMORY`
- 某个选项扣多少记忆值
- 哪些选择会增加 `truthClueCount`
- 隐藏结局条件
- 退出和重开的状态重置

改完规则后，建议立刻运行：

```powershell
npm.cmd run test
```

## 12. 自动化测试覆盖了什么

当前测试覆盖这些核心点：

- 开场前不播放 BGM
- 点击“进入秘境”后进入 `start` BGM
- 理解真相路线会累计线索
- 救白鹿后会拿到心种
- 失败路线会切到失败结局和失败 BGM
- 满足隐藏条件时会进入隐藏胜利
- 条件不足时会从修复旧约降级到普通胜利或失败
- `restart()` 会重置整局状态
- `exitGame()` 会回到干净的开场状态
- 静音会写入并恢复 `localStorage`

## 13. 常见问题

### Q1：为什么我在 PowerShell 里运行 `npm` 报执行策略错误？

直接用 `npm.cmd`：

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run test
npm.cmd run build
```

### Q2：为什么点开页面后没有立刻播放音乐？

这是浏览器自动播放限制。  
必须等玩家点击“进入秘境”之后，页面才能合法开始播放 BGM。

### Q3：我只想改文字，不想碰 TypeScript，改哪里？

直接改 [`src/data/story-content.json`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/data/story-content.json)。

### Q4：我换了图片和音频之后，还要做什么？

至少跑这两条命令确认没有资源引用问题：

```powershell
npm.cmd run test
npm.cmd run build
```

## 14. 推荐接手顺序

如果你第一次接这个项目，建议按这个顺序看：

1. 先跑起来，手动玩一遍
2. 看 [`src/data/story-content.json`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/data/story-content.json)
3. 看 [`src/composables/useGameEngine.ts`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/composables/useGameEngine.ts)
4. 看 [`src/composables/useBgmController.ts`](/D:/Project_Folder/Forest_Secret_Adventure_game/src/composables/useBgmController.ts)
5. 运行测试
6. 再开始改剧情或规则

推荐命令：

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run test
npm.cmd run build
```
