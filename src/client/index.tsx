/** Browser plugin that promotes image-bearing Tool results after Turn closure. */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-chat/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import { IMAGE_RESULT_NODE_KIND } from '../invariant.ts'
import { ToolResultImagesNodeView } from './ToolResultImagesNodeView.tsx'
import { toolResultImagesDefinition } from './tool-result-images.ts'

/** Client services required by the projection and keyed renderer. */
export const inject = ['uiConversation', 'slots'] as const

/** Register the replayable projection and its Chat renderer. */
export function apply(ctx: Context): void {
  ctx.uiConversation.events.register(toolResultImagesDefinition)
  ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
    name: 'conversation.chat.node',
    key: IMAGE_RESULT_NODE_KIND,
  }, ToolResultImagesNodeView))
}

export { ToolResultImagesNodeView } from './ToolResultImagesNodeView.tsx'
export { toolResultImagesDefinition } from './tool-result-images.ts'
export type { ToolResultImagesData } from './tool-result-images.ts'
