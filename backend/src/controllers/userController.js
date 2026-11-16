import mongoose from "mongoose";
import User from "../models/User.js";
import PhotoProfil from "../models/PhotoProfil.js";

const TAILLE_MAX = 500 * 1024; // 500 Ko

// Vérifie que les octets sont vraiment une image (et pas un fichier renommé)
function typeReel(buffer) {
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.subarray(0, 4).toString("hex") === "89504e47") return "image/png";
  if (buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP") return "image/webp";
  return null;
}

// PUT /api/users/me/avatar : { image: "data:image/jpeg;base64,..." }
export async function envoyerPhoto(req, res) {
  try {
    const morceaux = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(req.body.image || "");
    if (!morceaux) {
      return res.status(400).json({ message: "Envoie une image JPEG, PNG ou WebP" });
    }

    const data = Buffer.from(morceaux[2], "base64");
    if (data.length > TAILLE_MAX) {
      return res.status(413).json({ message: "Image trop lourde (500 Ko maximum)" });
    }
    const type = typeReel(data);
    if (!type) {
      return res.status(400).json({ message: "Ce fichier n'est pas une image valide" });
    }

    await PhotoProfil.findOneAndUpdate(
      { id_user: req.user.id },
      { type, data },
      { upsert: true }
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { "avatar.photo_version": Date.now() },
      { returnDocument: "after" }
    );

    res.json(user);
  } catch (error) {
    console.error("envoyerPhoto :", error.message);
    res.status(500).json({ message: "Impossible d'enregistrer la photo, réessaie." });
  }
}

// DELETE /api/users/me/avatar : retour à l'avatar emoji
export async function supprimerPhoto(req, res) {
  try {
    await PhotoProfil.deleteOne({ id_user: req.user.id });
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { "avatar.photo_version": null },
      { returnDocument: "after" }
    );
    res.json(user);
  } catch (error) {
    console.error("supprimerPhoto :", error.message);
    res.status(500).json({ message: "Impossible de supprimer la photo, réessaie." });
  }
}

// GET /api/users/:id/avatar : renvoie l'image (publique, comme une photo de profil)
export async function lirePhoto(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).end();
    }
    const photo = await PhotoProfil.findOne({ id_user: req.params.id });
    if (!photo) {
      return res.status(404).end();
    }

    res.set({
      "Content-Type": photo.type,
      // L'adresse contient ?v=version : quand la photo change, l'adresse change.
      // Le navigateur peut donc garder l'image en cache pendant un an.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      // Le front (autre port / autre domaine) a le droit d'afficher l'image
      "Cross-Origin-Resource-Policy": "cross-origin",
    });
    res.send(photo.data);
  } catch (error) {
    console.error("lirePhoto :", error.message);
    res.status(500).end();
  }
}
