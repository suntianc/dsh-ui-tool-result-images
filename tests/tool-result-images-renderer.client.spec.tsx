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


it('updates and remounts gallery references without retaining the previous Turn', () => {
  const first = image()
  const second = { ...image(), attachmentId: 'image-2' as ImageAttachmentRef['attachmentId'], name: 'next.png' }
  const renderMessageImages = vi.fn(({ images }: Parameters<RenderMessageImages>[0]) => createElement('div', { 'data-testid': 'gallery' }, images.map(item => 'attachment' in item ? item.attachment.name : item.preview.name).join(',')))
  const props = (turn: number, attachment: ImageAttachmentRef) => ({
    node: { key: `tool-result-images:${turn}`, kind: IMAGE_RESULT_NODE_KIND, id: String(turn), target: 'chat', anchorSeq: 6, location: { kind: 'unresolved' }, visibility: 'visible', data: { turn, images: [attachment] } }, renderMessageImages,
  })
  const view = render(createElement(ToolResultImagesNodeView, props(1, first) as never))
  view.rerender(createElement(ToolResultImagesNodeView, props(2, second) as never))
  expect(screen.getByTestId('gallery').textContent).toBe('next.png')
  expect(document.querySelector('[data-tool-result-images="1"]')).toBeNull()
  view.unmount()
  expect(screen.queryByTestId('gallery')).toBeNull()
  render(createElement(ToolResultImagesNodeView, props(1, first) as never))
  expect(screen.getByTestId('gallery').textContent).toBe('generated.png')
})
