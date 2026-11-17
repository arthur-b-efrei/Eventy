import mongoose from "mongoose";
import Event from "../models/Event.js";
import Reservation from "../models/Reservation.js";

// Inscrit le user connecté à un événement (bouton "S'inscrire" de la homepage)
// Route : POST /api/events/:id/inscription (le user vient de "protect" : req.user.id)
export async function inscrire(req, res) {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    // 1. L'id dans l'adresse doit avoir le format d'un id MongoDB
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    // 2. L'événement doit exister
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Événement introuvable" });
    }

    // 3. Le user ne doit pas être déjà inscrit
    const dejaInscrit = await Reservation.findOne({ id_user: userId, id_event: eventId });
    if (dejaInscrit) {
      return res.status(409).json({ message: "Tu es déjà inscrit à cet événement" });
    }

    // 4. On prend une place : +1 sur nb_user, SEULEMENT s'il reste de la place.
    // La condition et le +1 se font en une seule opération, pour que deux personnes
    // qui cliquent en même temps ne puissent pas prendre la dernière place toutes les deux.
    const eventMaj = await Event.findOneAndUpdate(
      { _id: eventId, $expr: { $lt: ["$nb_user", "$nb_max_user"] } },
      { $inc: { nb_user: 1 } },
      { new: true } // renvoie l'événement APRÈS la modification
    );
    if (!eventMaj) {
      return res.status(409).json({ message: "Cet événement est complet" });
    }

    // 5. On enregistre la réservation
    await Reservation.create({ id_user: userId, id_event: eventId });

    // On renvoie l'événement à jour, pour que le front affiche le bon nombre de places
    res.status(201).json(eventMaj);
  } catch (error) {
    console.error("inscrire :", error.message);
    res.status(500).json({ message: "Impossible de s'inscrire, réessaie." });
  }
}
