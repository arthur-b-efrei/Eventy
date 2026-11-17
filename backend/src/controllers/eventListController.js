import Event from "../models/Event.js";

// Renvoie la liste de tous les événements (pour la homepage)
export async function listEvents(req, res) {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}
