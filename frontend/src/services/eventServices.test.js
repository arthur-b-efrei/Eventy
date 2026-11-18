import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createEvent } from './eventServices.js'

vi.mock('../api/client.js', () => ({
  requete: vi.fn(),
}))

import { requete } from '../api/client.js'

describe('createEvent', () => {
  beforeEach(() => {
    localStorage.setItem('eventy_token', 'tok-test')
    requete.mockReset()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('appelle POST /events via requete (base déjà préfixée /api)', async () => {
    const event = { titre: 'Soirée', _id: 'e1' }
    requete.mockResolvedValue(event)

    const resultat = await createEvent({ titre: 'Soirée' })

    expect(requete).toHaveBeenCalledWith('/events', {
      method: 'POST',
      headers: { Authorization: 'Bearer tok-test' },
      body: JSON.stringify({ titre: 'Soirée' }),
    })
    expect(resultat).toEqual(event)
  })

  it('mappe donnees.errors vers err.errors pour le formulaire', async () => {
    const erreur = Object.assign(new Error('Adresse introuvable'), {
      status: 400,
      donnees: { errors: { localisation: 'Adresse introuvable.' } },
    })
    requete.mockRejectedValue(erreur)

    await expect(createEvent({ titre: 'x' })).rejects.toMatchObject({
      errors: { localisation: 'Adresse introuvable.' },
    })
  })

  it('remplace le message sur 401', async () => {
    const erreur = Object.assign(new Error('Non connecté'), {
      status: 401,
      donnees: {},
    })
    requete.mockRejectedValue(erreur)

    await expect(createEvent({ titre: 'x' })).rejects.toMatchObject({
      message: 'Vous devez être connecté pour créer un événement.',
      errors: {},
    })
  })
})
