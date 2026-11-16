import mongoose from "mongoose";

// Un event créé par un user (ex : soirée au bar).
const eventSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true, trim: true },
    describe: { type: String, default: "" },
    // Nombre de personnes déjà inscrites
    nb_user: { type: Number, default: 0, min: 0 },
    // Nombre de places au total
    nb_max_user: { type: Number, required: true, min: 1 },
    // Le user qui a créé l'event (lien vers la collection User)
    id_creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    localisation: { type: String, required: true, trim: true },
    date_event: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
