import mongoose from "mongoose";

// Une réservation : "tel user participe à tel event".
const logSchema = new mongoose.Schema(
  {
    // Petit message du participant (ex : "j'arrive vers 21h")
    describe: { type: String, default: "" },
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
  { timestamps: true }
);

// Un user ne peut pas s'inscrire deux fois au même event
logSchema.index({ id_event: 1, id_user: 1 }, { unique: true });

export default mongoose.model("Log", logSchema);
