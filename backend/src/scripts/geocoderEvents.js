// Géocode les events déjà en base qui n'ont pas encore de coordonnées (créés avant la recherche à proximité).
// À lancer une seule fois : npm run geocoder:events
// Les adresses introuvables sont listées à la fin : à corriger à la main dans MongoDB, puis relancer.
import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Event from "../models/Event.js";
import { geocoderAdresse } from "../services/geocodage.js";

const PAUSE_MS = 100; // l'API accepte 50 requêtes par seconde : on reste très en dessous

await connectDB();

const aTraiter = await Event.find({ position: { $exists: false } }).select("titre localisation");
console.log(`${aTraiter.length} event(s) sans coordonnées`);

let ok = 0;
const introuvables = [];

for (const event of aTraiter) {
  try {
    const lieu = await geocoderAdresse(event.localisation);
    if (lieu) {
      // updateOne : on ne touche qu'à "position", sans revalider le reste de l'event
      await Event.updateOne(
        { _id: event._id },
        { $set: { position: { type: "Point", coordinates: lieu.coordinates } } }
      );
      ok++;
      console.log(`  OK  « ${event.titre} » : ${event.localisation} -> ${lieu.label}`);
    } else {
      introuvables.push(event);
    }
  } catch (error) {
    console.error(`  ERREUR « ${event.titre} » : ${error.message}`);
    introuvables.push(event);
  }
  await new Promise((r) => setTimeout(r, PAUSE_MS));
}

console.log(`\n${ok} event(s) géocodé(s), ${introuvables.length} introuvable(s)`);
for (const event of introuvables) {
  console.log(`  - ${event._id} « ${event.titre} » : "${event.localisation}"`);
}

await mongoose.disconnect();
