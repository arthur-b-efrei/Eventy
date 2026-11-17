import mongoose from "mongoose";
import Event from "../models/Event.js";
import Reservation from "../models/Reservation.js";

export const TEXTE_MAX = 500;

// Nom du "salon" Socket.IO d'un événement : tous ceux qui y sont reçoivent ses messages
export const salonEvent = (eventId) => `event:${eventId}`;

// Salon personnel d'un user (toutes ses connexions : plusieurs onglets, téléphone…)
export const salonUser = (userId) => `user:${userId}`;

// Le user peut-il lire et écrire dans la discussion de cet event ?
// Oui s'il l'a créé ou s'il y est inscrit. Renvoie l'event, ou null si non
// (on ne distingue pas "n'existe pas" et "pas le droit", comme pour les inscrits).
export async function eventAccessible(userId, eventId) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) return null;

  const event = await Event.findById(eventId).select("titre date_event localisation id_creator").lean();
  if (!event) return null;
  if (event.id_creator.toString() === userId) return event;

  const inscrit = await Reservation.exists({ id_user: userId, id_event: eventId });
  return inscrit ? event : null;
}

// Ce que le front reçoit pour un message (le user est déjà "populé")
export function formaterMessage(message) {
  const user = message.id_user && typeof message.id_user === "object" ? message.id_user : null;
  return {
    _id: message._id,
    id_event: message.id_event,
    texte: message.texte,
    createdAt: message.createdAt,
    // null si le compte a été supprimé entre-temps
    user: user ? { _id: user._id, name: user.name, avatar: user.avatar } : null,
  };
}
