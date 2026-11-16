import mongoose from "mongoose";

// L'historique de ce qui se passe dans l'appli.
// Une ligne = une action (ex : "inscription à l'event", "désinscription",
// "création de l'event"). Les participations, elles, sont dans Reservation.
const logSchema = new mongoose.Schema(
  {
    // Ce qui s'est passé
    describe: { type: String, required: true },
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
  },
  {
    // createdAt = date de l'action
    timestamps: true,
  }
);

export default mongoose.model("Log", logSchema);
