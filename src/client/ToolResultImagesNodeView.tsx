import { memo } from 'react'
import type { ChatNodeViewProps } from '@deepseek-ai/dsh-client-ui-chat/client'
import type {} from './tool-result-images.ts'

/** Render promoted Tool-result images through the standard Conversation gallery. */
export const ToolResultImagesNodeView = memo(function ToolResultImagesNodeView({
  node,
  renderMessageImages,
}: ChatNodeViewProps<'tool-result-images'>) {
  return (
    <div data-tool-result-images={node.data.turn}>
      {renderMessageImages({
        images: node.data.images.map(attachment => ({ attachment })),
        align: 'start',
      })}
    </div>
  )
})
