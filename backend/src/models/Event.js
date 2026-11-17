
import mongoose from "mongoose";

// Un événement créé par un utilisateur
const eventSchema = new mongoose.Schema(
  {
    // Titre obligatoire
    titre: {
      type: String,
      required: [true, "Le titre est obligatoire."],
      trim: true,
    },

    // Description obligatoire
    describe: {
      type: String,
      required: [true, "La description est obligatoire."],
      trim: true,
    },

    // Nombre de personnes déjà inscrites
    nb_user: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Nombre maximum de participants
    nb_max_user: {
      type: Number,
      required: [true, "Le nombre de participants est obligatoire."],
      min: [1, "Il faut au moins un participant."],
    },

    // Utilisateur qui a créé l'événement
    id_creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Localisation obligatoire
    localisation: {
      type: String,
      required: [true, "La localisation est obligatoire."],
      trim: true,
    },

    // Date obligatoire
    date_event: {
      type: Date,
      required: [true, "La date est obligatoire."],
    },

    // Genre obligatoire
    genre: {
      type: String,
      required: [true, "Le genre est obligatoire."],
      enum: {
        values: [
          "Autre",
          "Musique",
          "Karaoké",
          "Sport",
          "Cinéma",
          "Conférence",
          "Jeux",
          "Gastronomie",
        ],
        message: "Le genre sélectionné est invalide.",
      },
    },

    // URL de l'image obligatoire
    image: {
      type: String,
      required: [true, "L'image est obligatoire."],
      trim: true,
      validate: {
        validator: function (value) {
          try {
            const url = new URL(value);
            return ["http:", "https:"].includes(url.protocol);
          } catch {
            return false;
          }
        },
        message: "L'URL de l'image est invalide.",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Event", eventSchema);
