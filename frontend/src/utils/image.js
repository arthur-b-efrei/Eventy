// Recadre une photo en carré (au centre) et la réduit à 256 × 256, directement dans le navigateur.
// Résultat : une image JPEG d'environ 20 à 40 Ko, en "data URL" prête à être envoyée à l'API.
export function preparerPhoto(fichier, taille = 256) {
  return new Promise((resolve, reject) => {
    if (!fichier.type.startsWith('image/')) {
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
      const cote = Math.min(img.width, img.height)
      const canvas = document.createElement('canvas')
      canvas.width = taille
      canvas.height = taille
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, (img.width - cote) / 2, (img.height - cote) / 2, cote, cote, 0, 0, taille, taille)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Impossible de lire cette image. Essaie avec une photo JPEG ou PNG."))
    }

    img.src = url
  })
}
