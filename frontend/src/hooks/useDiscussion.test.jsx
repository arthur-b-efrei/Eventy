import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const handlers = new Map()
const socketFake = {
  connected: true,
  on(event, cb) {
    handlers.set(event, cb)
  },
  emit: vi.fn(),
  disconnect: vi.fn(),
  timeout() {
    return this
  },
}

vi.mock('../context/AuthContext.js', () => ({
  useAuth: () => ({ token: 'tok', user: { _id: 'u1', name: 'Léa' } }),
}))

vi.mock('../api/discussion.js', () => ({
  chargerMessages: vi.fn(),
  connecterSocket: vi.fn(() => socketFake),
}))

import { chargerMessages, connecterSocket } from '../api/discussion.js'
import useDiscussion from './useDiscussion.js'

function message(id, eventId, createdAt) {
  return {
    _id: id,
    id_event: eventId,
    texte: id,
    createdAt,
    user: { _id: 'u2', name: 'Sam' },
  }
}

describe('useDiscussion', () => {
  beforeEach(() => {
    handlers.clear()
    socketFake.emit.mockReset()
    socketFake.disconnect.mockReset()
    chargerMessages.mockReset()
    connecterSocket.mockClear()
  })

  it('remplace les messages au changement d’événement (pas de mélange)', async () => {
    chargerMessages
      .mockResolvedValueOnce({
        event: { _id: 'e1', titre: 'A' },
        messages: [message('m1', 'e1', '2026-01-01T10:00:00.000Z')],
        encoreAvant: false,
      })
      .mockResolvedValueOnce({
        event: { _id: 'e2', titre: 'B' },
        messages: [message('m2', 'e2', '2026-01-02T10:00:00.000Z')],
        encoreAvant: true,
      })

    const { result, rerender } = renderHook(({ eventId }) => useDiscussion(eventId), {
      initialProps: { eventId: 'e1' },
    })

    await waitFor(() => expect(result.current.etat).toBe('pret'))
    expect(result.current.messages.map((m) => m._id)).toEqual(['m1'])

    // Simule la connexion socket pour le 1er event
    act(() => handlers.get('connect')?.())

    rerender({ eventId: 'e2' })

    await waitFor(() => {
      expect(result.current.event?._id).toBe('e2')
      expect(result.current.messages.map((m) => m._id)).toEqual(['m2'])
    })
    expect(result.current.encoreAvant).toBe(true)
    expect(socketFake.disconnect).toHaveBeenCalled()
  })

  it('ne réactive pas encoreAvant après une reconnexion', async () => {
    chargerMessages
      .mockResolvedValueOnce({
        event: { _id: 'e1', titre: 'A' },
        messages: [message('m-recent', 'e1', '2026-01-02T10:00:00.000Z')],
        encoreAvant: true,
      })
      .mockResolvedValueOnce({
        event: { _id: 'e1', titre: 'A' },
        messages: [message('m-old', 'e1', '2026-01-01T10:00:00.000Z')],
        encoreAvant: false,
      })
      .mockResolvedValueOnce({
        event: { _id: 'e1', titre: 'A' },
        messages: [message('m-recent', 'e1', '2026-01-02T10:00:00.000Z')],
        encoreAvant: true, // page récente : le serveur dit encore true
      })

    const { result } = renderHook(() => useDiscussion('e1'))

    await waitFor(() => expect(result.current.etat).toBe('pret'))
    act(() => handlers.get('connect')?.())

    await act(async () => {
      await result.current.chargerPlusAnciens()
    })
    expect(result.current.encoreAvant).toBe(false)
    expect(result.current.messages.map((m) => m._id)).toEqual(['m-old', 'm-recent'])

    // Reconnexion socket → recharge le bout récent sans écraser encoreAvant
    await act(async () => {
      handlers.get('connect')?.()
      await Promise.resolve()
    })

    await waitFor(() => expect(chargerMessages).toHaveBeenCalledTimes(3))
    expect(result.current.encoreAvant).toBe(false)
  })
})
