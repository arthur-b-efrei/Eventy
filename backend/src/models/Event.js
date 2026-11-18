
import mongoose from "mongoose";

// Coordonnées d'un lieu au format GeoJSON, celui que MongoDB comprend pour les recherches "à proximité".
// Attention à l'ordre : [longitude, latitude] (le navigateur, lui, donne latitude puis longitude).
const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: ([lng, lat] = []) =>
          Number.isFinite(lng) && Number.isFinite(lat) && Math.abs(lng) <= 180 && Math.abs(lat) <= 90,
        message: "Coordonnées invalides.",
      },
    },
  },
  { _id: false }
);

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

    // Coordonnées de "localisation", calculées par le serveur à la création (services/geocodage.js).
    // Absent pour les anciens events non géocodés : voir "npm run geocoder:events".
    position: {
      type: pointSchema,
      default: undefined,
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
  required: false,
  default: "",
  trim: true,
  validate: {
    validator(value) {
      if (!value) return true;

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

// Index géographique : obligatoire pour chercher les events proches ($geoNear).
// Les events sans position sont simplement ignorés par la recherche.
eventSchema.index({ position: "2dsphere" });

export default mongoose.model("Event", eventSchema);
