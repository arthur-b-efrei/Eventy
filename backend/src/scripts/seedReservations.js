import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Event from "../models/Event.js";
import Reservation from "../models/Reservation.js";

// Données de démo pour tester "Mes réservations".
// Usage : npm run seed:reservations

await connectDB();

const password = await bcrypt.hash("password123", 10);

async function upsertUser({ name, email, date_naissance }) {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      password,
      date_naissance,
      email_verifie: true,
    });
  } else {
    user.name = name;
    user.password = password;
    user.email_verifie = true;
    await user.save();
  }
  return user;
}

const alice = await upsertUser({
  name: "Alice Martin",
  email: "alice@eventy.test",
  date_naissance: new Date("1998-04-12"),
});
const bob = await upsertUser({
  name: "Bob Dupont",
  email: "bob@eventy.test",
  date_naissance: new Date("1995-09-03"),
});
const claire = await upsertUser({
  name: "Claire Bernard",
  email: "claire@eventy.test",
  date_naissance: new Date("2000-01-22"),
});

await Reservation.deleteMany({
  id_user: { $in: [alice._id, bob._id, claire._id] },
});
await Event.deleteMany({
  id_creator: { $in: [alice._id, bob._id] },
});

const jazz = await Event.create({
  titre: "Soirée Jazz au Quai",
  describe: "Concert live avec trio acoustique et bar ouvert.",
  nb_max_user: 40,
  nb_user: 0,
  id_creator: alice._id,
  localisation: "Quai des Arts, Lyon",
  date_event: new Date("2026-12-05T20:00:00.000Z"),
});

const trail = await Event.create({
  titre: "Trail urbain 10 km",
  describe: "Course conviviale à travers le centre-ville.",
  nb_max_user: 80,
  nb_user: 0,
  id_creator: bob._id,
  localisation: "Parc de la Tête d’Or, Lyon",
  date_event: new Date("2026-11-28T09:00:00.000Z"),
});

const atelier = await Event.create({
  titre: "Atelier photo argentique",
  describe: "Initiation au développement en chambre noire.",
  nb_max_user: 12,
  nb_user: 0,
  id_creator: alice._id,
  localisation: "Studio Lumière, Villeurbanne",
  date_event: new Date("2026-12-12T14:30:00.000Z"),
});

const reservations = [
  { id_event: jazz._id, id_user: alice._id, describe: "J’apporte des amis !" },
  { id_event: jazz._id, id_user: bob._id, describe: "" },
  { id_event: jazz._id, id_user: claire._id, describe: "Arrivée vers 20h30" },
  { id_event: trail._id, id_user: alice._id, describe: "Première course, soyez indulgents" },
  { id_event: trail._id, id_user: claire._id, describe: "" },
  { id_event: atelier._id, id_user: alice._id, describe: "Je viens avec mon appareil" },
  { id_event: atelier._id, id_user: bob._id, describe: "" },
];

await Reservation.insertMany(reservations);

for (const event of [jazz, trail, atelier]) {
  const count = await Reservation.countDocuments({ id_event: event._id });
  event.nb_user = count;
  await event.save();
}

console.log("Seed réservations OK");
console.log("Comptes (mot de passe: password123) :");
console.log("- alice@eventy.test → créatrice + inscrite (voit les inscrits)");
console.log("- bob@eventy.test");
console.log("- claire@eventy.test");

await mongoose.disconnect();
