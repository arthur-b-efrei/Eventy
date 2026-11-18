import mongoose from "mongoose";

// Un message dans la discussion d'un événement.
// Seuls le créateur de l'event et les inscrits peuvent lire et écrire (voir services/discussion.js).
const messageSchema = new mongoose.Schema(
  {
    id_event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    id_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    texte: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    // createdAt = heure d'envoi du message
    timestamps: true,
  }
);

// Pour charger vite les derniers messages d'un event (du plus récent au plus ancien)
messageSchema.index({ id_event: 1, _id: -1 });

export default mongoose.model("Message", messageSchema);
