import { describe, expect, it, vi } from 'vitest'
import { IMAGE_RESULT_NODE_KIND } from '../src/invariant.ts'
import { ToolResultImagesNodeView } from '../src/client/ToolResultImagesNodeView.tsx'
import { toolResultImagesDefinition } from '../src/client/tool-result-images.ts'
import { apply, inject } from '../src/client/index.tsx'

describe('image-result Client plugin registration', () => {
  it('registers one replayable Definition and its keyed Chat renderer', () => {
    const registerDefinition = vi.fn(() => () => undefined)
    const registerRenderer = vi.fn(() => () => undefined)
    const injectSlot = vi.fn((_name: string, mount: () => unknown) => mount())
    const ctx = {
      uiConversation: { events: { register: registerDefinition } },
      slots: { inject: injectSlot, register: registerRenderer },
    }

    apply(ctx as never)

    expect(inject).toEqual(['uiConversation', 'slots'])
    expect(registerDefinition).toHaveBeenCalledWith(toolResultImagesDefinition)
    expect(injectSlot).toHaveBeenCalledWith('conversation.chat.node', expect.any(Function))
    expect(registerRenderer).toHaveBeenCalledWith({
      name: 'conversation.chat.node',
      key: IMAGE_RESULT_NODE_KIND,
    }, ToolResultImagesNodeView)
  })
})
