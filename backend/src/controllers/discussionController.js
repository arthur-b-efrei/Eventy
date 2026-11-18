import mongoose from "mongoose";
import Message from "../models/Message.js";
import { eventAccessible, formaterMessage } from "../services/discussion.js";

const PAR_PAGE = 50;

// GET /api/events/:id/messages?avant=<id d'un message>
// Renvoie l'event et les 50 derniers messages (du plus ancien au plus récent).
// Avec "avant", renvoie les 50 messages précédents (bouton "messages plus anciens").
// Les nouveaux messages arrivent ensuite en direct par le WebSocket (voir socket.js).
export async function listerMessages(req, res) {
  try {
    const event = await eventAccessible(req.user.id, req.params.id);
    // Pas inscrit ou event inexistant → 404 (on ne révèle pas l'existence de l'event)
    if (!event) {
      return res.status(404).json({ message: "Discussion introuvable" });
    }

    const filtre = { id_event: event._id };
    const { avant } = req.query;
    if (avant !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(avant)) {
        return res.status(400).json({ message: "Paramètre avant invalide" });
      }
      filtre._id = { $lt: avant };
    }

    // On en prend un de plus pour savoir s'il en reste d'autres avant
    const messages = await Message.find(filtre)
      .sort({ _id: -1 })
      .limit(PAR_PAGE + 1)
      .populate("id_user", "name avatar")
      .lean();

    const encoreAvant = messages.length > PAR_PAGE;
    const page = messages.slice(0, PAR_PAGE).reverse().map(formaterMessage);

    res.json({
      event: {
        _id: event._id,
        titre: event.titre,
        date_event: event.date_event,
        localisation: event.localisation,
        id_creator: event.id_creator,
      },
      messages: page,
      encoreAvant,
    });
  } catch (error) {
    console.error("listerMessages :", error.message);
    res.status(500).json({ message: "Impossible de charger la discussion." });
  }
}
