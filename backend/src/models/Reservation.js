import mongoose from "mongoose";

// Une réservation : "tel user participe à tel event".
// Pour avoir la liste des events d'un user :
//   Reservation.find({ id_user: userId }).populate("id_event")
const reservationSchema = new mongoose.Schema(
  {
    id_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    id_event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
  },
  {
    // createdAt = date à laquelle le user s'est inscrit
    timestamps: true,
  }
);

// Un user ne peut pas réserver deux fois le même event
reservationSchema.index({ id_user: 1, id_event: 1 }, { unique: true });

export default mongoose.model("Reservation", reservationSchema);
