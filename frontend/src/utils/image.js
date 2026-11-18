function chargerImage(fichier) {
  return new Promise((resolve, reject) => {
    if (!fichier?.type?.startsWith('image/')) {
      reject(new Error('Choisis un fichier image (JPEG, PNG, WebP…).'))
      return
    }
    if (fichier.size > 15 * 1024 * 1024) {
      reject(new Error('Cette image est trop lourde (15 Mo maximum).'))
      return
    }

    const url = URL.createObjectURL(fichier)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Impossible de lire cette image. Essaie avec une photo JPEG ou PNG."))
    }
    img.src = url
  })
}

// Recadre une photo en carré (au centre) et la réduit à 256 × 256, directement dans le navigateur.
// Résultat : une image JPEG d'environ 20 à 40 Ko, en "data URL" prête à être envoyée à l'API.
export async function preparerPhoto(fichier, taille = 256) {
  const img = await chargerImage(fichier)
  const cote = Math.min(img.width, img.height)
  const canvas = document.createElement('canvas')
  canvas.width = taille
  canvas.height = taille
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, (img.width - cote) / 2, (img.height - cote) / 2, cote, cote, 0, 0, taille, taille)
  return canvas.toDataURL('image/jpeg', 0.85)
}

// Bannière d'événement : recadrage 16:9 au centre, largeur max 960 px (~40–90 Ko).
export async function preparerImageEvenement(fichier, largeurMax = 960) {
  const img = await chargerImage(fichier)
  const ratio = 16 / 9
  let srcW = img.width
  let srcH = img.width / ratio
  let srcX = 0
  let srcY = (img.height - srcH) / 2

  if (srcH > img.height) {
    srcH = img.height
    srcW = img.height * ratio
    srcX = (img.width - srcW) / 2
    srcY = 0
  }

  const largeur = Math.min(largeurMax, Math.round(srcW))
  const hauteur = Math.round(largeur / ratio)
  const canvas = document.createElement('canvas')
  canvas.width = largeur
  canvas.height = hauteur
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, largeur, hauteur)
  return canvas.toDataURL('image/jpeg', 0.82)
}
