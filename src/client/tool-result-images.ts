import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import type { ConversationNodeDefinition } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { IMAGE_RESULT_NODE_KIND } from '../invariant.ts'

/** Durable image references promoted from successful Tool results in one Turn. */
export interface ToolResultImagesData {
  readonly turn: number
  readonly images: readonly ImageAttachmentRef[]
}

declare module '@deepseek-ai/dsh-client-ui-chat/client' {
  interface ChatNodeDataMap {
    /** Successful image-bearing Tool results promoted after Turn closure. */
    'tool-result-images': ToolResultImagesData
  }
}

interface ToolResultImagesState {
  readonly turn: number
  readonly images: readonly ImageAttachmentRef[]
  readonly endSeq?: number
}

/** Conversation projection owned by the image-result plugin. */
export const toolResultImagesDefinition: ConversationNodeDefinition<ToolResultImagesState> = {
  kind: IMAGE_RESULT_NODE_KIND,
  target: 'chat',
  match: event => {
    if (event.type === 'turn/start') {
      return { id: String(event.data.turn), role: 'start' }
    }
    if (event.type === 'tool/result' && event.surfaceOp === 'append') {
      return { id: String(event.data.turn), role: 'update' }
    }
    if (event.type === 'turn/end') {
      return { id: String(event.data.turn), role: 'update' }
    }
    return null
  },
  start: (_context, match) => {
    if (match.event.type !== 'turn/start') {
      throw new Error('tool-result-images start requires turn/start')
    }
    return { turn: match.event.data.turn, images: [] }
  },
  update: (context, match) => {
    const event = match.event
    if (event.type === 'turn/end') {
      return { ...context.state, endSeq: event.seq }
    }
    if (event.type !== 'tool/result' || event.data.error !== undefined) return context.state
    const result = event.data.message.content[0]
    if (result.isError === true) return context.state
    const seen = new Set(context.state.images.map(image => String(image.attachmentId)))
    const images: ImageAttachmentRef[] = []
    for (const block of result.content) {
      if (block.type !== 'image') continue
      const attachmentId = String(block.attachment.attachmentId)
      if (seen.has(attachmentId)) continue
      seen.add(attachmentId)
      images.push(block.attachment)
    }
    if (images.length === 0) return context.state
    return { ...context.state, images: [...context.state.images, ...images] }
  },
  publication: match => match.event.type === 'turn/end' ? 'immediate' : 'none',
  buildViewNode: context => {
    const state = context.state
    if (state === undefined || state.endSeq === undefined || state.images.length === 0) return null
    const end = context.matches.findLast(match => match.event.type === 'turn/end')
    if (end === undefined) return null
    return {
      key: context.key,
      kind: IMAGE_RESULT_NODE_KIND,
      id: context.id,
      target: 'chat',
      anchorSeq: state.endSeq,
      location: end.location,
      visibility: 'visible',
      data: {
        turn: state.turn,
        images: state.images,
      } satisfies ToolResultImagesData,
    }
  },
}
