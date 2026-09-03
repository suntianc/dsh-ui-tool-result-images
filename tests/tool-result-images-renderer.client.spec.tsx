import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import type { RenderMessageImages } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { IMAGE_RESULT_NODE_KIND } from '../src/invariant.ts'
import { ToolResultImagesNodeView } from '../src/client/ToolResultImagesNodeView.tsx'

function image(): ImageAttachmentRef {
  return {
    attachmentId: 'image-1' as ImageAttachmentRef['attachmentId'],
    mediaType: 'image/png',
    bytes: 64,
    width: 8,
    height: 8,
    name: 'generated.png',
  }
}

describe('Tool result image renderer', () => {
  it('hands durable references to the existing start-aligned message gallery', () => {
    const attachment = image()
    const renderMessageImages = vi.fn(({ images, align }: Parameters<RenderMessageImages>[0]) => createElement(
      'div',
      { 'data-testid': 'existing-gallery', 'data-align': align },
      images.map(item => 'attachment' in item ? item.attachment.name : item.preview.name).join(','),
    ))

    render(createElement(ToolResultImagesNodeView, {
      node: {
        key: 'tool-result-images:1',
        kind: IMAGE_RESULT_NODE_KIND,
        id: '1',
        target: 'chat',
        anchorSeq: 6,
        location: { kind: 'unresolved' },
        visibility: 'visible',
        data: { turn: 1, images: [attachment] },
      },
      renderMessageImages,
    } as never))

    expect(renderMessageImages).toHaveBeenCalledWith({
      images: [{ attachment }],
      align: 'start',
    })
    expect(screen.getByTestId('existing-gallery').textContent).toBe('generated.png')
  })
})
