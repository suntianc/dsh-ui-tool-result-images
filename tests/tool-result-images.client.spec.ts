import { describe, expect, it } from 'vitest'
import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import type { MessageId, ToolCallId } from '@deepseek-ai/dsh-llm/brand'
import type { ToolResultMessage } from '@deepseek-ai/dsh-llm/message'
import type { SessionEvent, SurfaceOp } from '@deepseek-ai/dsh-session/types'
import type {
  ConversationLocation,
  ConversationMatch,
  ConversationNodeContext,
  ConversationStartMatch,
  ConversationViewNode,
} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { IMAGE_RESULT_NODE_KIND } from '../src/invariant.ts'
import {
  toolResultImagesDefinition,
  type ToolResultImagesData,
} from '../src/client/tool-result-images.ts'

function event<T extends SessionEvent['type']>(
  seq: number,
  type: T,
  data: Extract<SessionEvent, { type: T }>['data'],
  surfaceOp?: SurfaceOp,
): Extract<SessionEvent, { type: T }> {
  return {
    seq,
    time: 1_700_000_000_000 + seq,
    type,
    data,
    ...(surfaceOp === undefined ? {} : { surfaceOp }),
  } as Extract<SessionEvent, { type: T }>
}

function messageId(value: string): MessageId {
  return value as MessageId
}

function toolCallId(value: string): ToolCallId {
  return value as ToolCallId
}

function image(attachmentId: string, name: string): ImageAttachmentRef {
  return {
    attachmentId: attachmentId as ImageAttachmentRef['attachmentId'],
    mediaType: 'image/png',
    bytes: 64,
    width: 8,
    height: 8,
    name,
  }
}

type DefinitionState = ReturnType<typeof toolResultImagesDefinition.start>

function project(events: readonly SessionEvent[]): ConversationViewNode | null {
  const turnStart = events.find(candidate => candidate.type === 'turn/start')
  if (turnStart?.type !== 'turn/start') throw new Error('fixture requires turn/start')
  const turnEnd = events.find(candidate => candidate.type === 'turn/end')
  const location = {
    kind: 'turn',
    turn: {
      turn: turnStart.data.turn,
      start: turnStart,
      end: turnEnd?.type === 'turn/end' ? turnEnd : undefined,
      status: turnEnd?.type === 'turn/end' ? 'closed' : 'open',
      steps: [],
      data: {
        get: () => undefined,
        source: () => ({ getSnapshot: () => undefined, subscribe: () => () => undefined }),
      },
    },
  } as ConversationLocation

  const matches: ConversationMatch[] = []
  let start: ConversationStartMatch | undefined
  let state: DefinitionState | undefined
  let id = ''
  for (const item of events) {
    const result = toolResultImagesDefinition.match(item)
    if (result === null) continue
    id = result.id
    const match = { event: item, role: result.role, location } as ConversationMatch
    matches.push(match)
    const context: ConversationNodeContext<DefinitionState> = {
      key: `${toolResultImagesDefinition.kind}:${id}`,
      kind: toolResultImagesDefinition.kind,
      id,
      matches: [...matches],
      start,
      state,
      current: new Map(),
    }
    if (result.role === 'start') {
      start = match as ConversationStartMatch
      state = toolResultImagesDefinition.start(
        { ...context, start },
        start,
        { previous: () => undefined },
      )
    } else if (state !== undefined) {
      state = toolResultImagesDefinition.update({ ...context, state, start }, match)
    }
  }

  if (state === undefined) return null
  const context: ConversationNodeContext<DefinitionState> = {
    key: `${toolResultImagesDefinition.kind}:${id}`,
    kind: toolResultImagesDefinition.kind,
    id,
    matches,
    start,
    state,
    current: new Map(),
  }
  return toolResultImagesDefinition.buildViewNode?.(context) ?? null
}

describe('Tool result image projection', () => {
  it('publishes a completed-Turn image node after a text-only final answer', () => {
    const attachment = image('image-1', 'generated.png')
    const callId = toolCallId('call-1')
    const beforeTurnEnd: readonly SessionEvent[] = [
      event(1, 'turn/start', { turn: 1 }),
      event(2, 'step/start', { turn: 1, step: 1 }),
      event(3, 'tool/result', {
        turn: 1,
        step: 1,
        message: {
          id: messageId('result-1'),
          role: 'user',
          source: { kind: 'tool', callId },
          content: [{
            type: 'tool-result',
            toolCallId: callId,
            content: [{ type: 'image', attachment }],
            isError: false,
          }],
        },
      }, 'append'),
      event(4, 'assistant/message', {
        ...{ stream: [] },
        turn: 1,
        step: 1,
        message: {
          id: messageId('assistant-1'),
          role: 'assistant',
          source: { kind: 'model', provider: 'test', model: 'test' },
          content: [{ type: 'text', text: 'Done.' }],
        },
      }, 'append'),
      event(5, 'step/end', { turn: 1, step: 1 }),
    ]

    expect(project(beforeTurnEnd)).toBeNull()

    const node = project([
      ...beforeTurnEnd,
      event(6, 'turn/end', { turn: 1, reason: { kind: 'completed' } }),
    ])

    expect(node).toMatchObject({
      kind: IMAGE_RESULT_NODE_KIND,
      target: 'chat',
      anchorSeq: 6,
      visibility: 'visible',
      data: {
        turn: 1,
        images: [attachment],
      } satisfies ToolResultImagesData,
    })
  })

  it('keeps first-seen order while ignoring duplicate, failed, and replacement images', () => {
    const first = image('image-1', 'first.png')
    const failed = image('image-failed', 'failed.png')
    const replacement = image('image-replacement', 'replacement.png')
    const toolMessage = (
      id: string,
      callIdValue: string,
      images: readonly ImageAttachmentRef[],
      isError = false,
    ): ToolResultMessage => {
      const callId = toolCallId(callIdValue)
      return {
        id: messageId(id),
        role: 'user',
        source: { kind: 'tool', callId },
        content: [{
          type: 'tool-result',
          toolCallId: callId,
          content: images.map(attachment => ({ type: 'image', attachment })),
          isError,
        }],
      }
    }
    const node = project([
      event(1, 'turn/start', { turn: 1 }),
      event(2, 'tool/result', {
        turn: 1,
        step: 1,
        message: toolMessage('result-1', 'call-1', [first, first]),
      }, 'append'),
      event(3, 'tool/result', {
        turn: 1,
        step: 1,
        message: toolMessage('result-2', 'call-2', [first]),
      }, 'append'),
      event(4, 'tool/result', {
        turn: 1,
        step: 1,
        message: toolMessage('result-3', 'call-3', [failed], true),
        error: { name: 'Error', code: 'FAILED' },
      }, 'append'),
      event(5, 'tool/result', {
        turn: 1,
        step: 1,
        message: toolMessage('result-4', 'call-4', [replacement]),
      }, { op: 'replace', start: 2, end: 2 } as SurfaceOp),
      event(6, 'turn/end', { turn: 1, reason: { kind: 'completed' } }),
    ])

    if (node === null) throw new Error('completed fixture did not publish an image node')
    expect((node.data as ToolResultImagesData).images).toEqual([first])
  })
})
