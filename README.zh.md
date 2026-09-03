# dsh-ui-tool-result-images

[English](README.md) | 中文

这是面向 DeepSeek Harness Web `0.1.2-alpha.5` 的纯插件修复。完成回合的执行过程在 Compact 对话模式中折叠后，成功工具返回的栅格图片仍会保持可见。

## 行为

浏览器插件从持久化 Session 事件派生一个可重放的图片结果节点。它按首次出现顺序收集成功、append-origin `tool/result` 事件中的图片附件引用，按附件身份去重，并仅在 `turn/end` 后发布节点。节点锚定在最终回答之后，因此 Compact 模式仍可折叠详细工具执行过程，同时把图片画廊保留为回合的一等输出。

渲染复用现有 `conversation.message.images` 实现。插件不会复制图片字节、生成 URL、检查 DOM、修改模型历史或替换工具卡片。

## 兼容性

测试基线为 DeepSeek Harness `0.1.2-alpha.5`、Cordis `4.0.2` 和 React 18。Web profile 必须包含标准 Conversation、Chat、renderer 和 attachment UI 插件。

## 开发

```sh
pnpm install
pnpm run check
```

本包是独立 DSH bundle；`cordis.patch.yml` 插入 Host 锚点，并通过其 `dsh.client` 声明加载浏览器插件。

## 已知限制

- 仅提升成功、append-origin 工具结果中的持久化栅格 `image` block。
- 原工具结果卡片保持不变，继续用于查看执行过程和审计。
- 插件针对 DSH `0.1.2-alpha.5` 当前的 Compact 对话语义；未来核心版本若原生提升图片工具结果，本插件可能不再需要。
