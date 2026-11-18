import mongoose from "mongoose";
import Reservation from "../models/Reservation.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import { fermerLaDiscussion, retirerDeLaDiscussion } from "../socket.js";

function idValide(valeur) {
  return mongoose.Types.ObjectId.isValid(valeur);
}

// Formate une réservation pour le front (event inclus + estCreateur)
function formaterReservation(reservation, userId) {
  const event = reservation.id_event;
  if (!event || typeof event !== "object") return null;

  const createurId = event.id_creator?.toString?.() || String(event.id_creator);
  return {
    _id: reservation._id,
    createdAt: reservation.createdAt,
    estCreateur: createurId === userId,
    event: {
      _id: event._id,
      titre: event.titre,
      describe: event.describe || "",
      localisation: event.localisation,
      date_event: event.date_event,
      nb_user: event.nb_user,
      nb_max_user: event.nb_max_user,
      id_creator: event.id_creator,
    },
  };
}

// GET /api/reservations — événements auxquels le user connecté est inscrit
export async function listerMesReservations(req, res) {
  try {
    const reservations = await Reservation.find({ id_user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("id_event")
      .lean();

    const items = reservations
      .map((reservation) => formaterReservation(reservation, req.user.id))
      .filter(Boolean);

    res.json({ items });
  } catch (error) {
    console.error("listerMesReservations :", error.message);
    res.status(500).json({ message: "Impossible de charger tes réservations." });
  }
}

// DELETE /api/reservations/:id — annuler sa réservation
export async function annulerReservation(req, res) {
  try {
    const { id } = req.params;
    if (!idValide(id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const reservation = await Reservation.findById(id);
    if (!reservation || reservation.id_user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Réservation introuvable" });
    }

    const eventId = reservation.id_event;
    await reservation.deleteOne();

    // On met à jour le compteur de places prises (jamais sous 0)
    await Event.findByIdAndUpdate(eventId, { $inc: { nb_user: -1 } });
    const event = await Event.findById(eventId);
    if (event && event.nb_user < 0) {
      event.nb_user = 0;
      await event.save();
    }

    // Plus inscrit : il sort de la discussion (sauf s'il est le créateur, qui y garde accès)
    if (event && event.id_creator.toString() !== req.user.id) {
      retirerDeLaDiscussion(req.user.id, eventId);
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("annulerReservation :", error.message);
    res.status(500).json({ message: "Impossible d'annuler la réservation." });
  }
}

function formaterEvent(event) {
  return {
    _id: event._id,
    titre: event.titre,
    describe: event.describe || "",
    localisation: event.localisation,
    date_event: event.date_event,
    nb_user: event.nb_user,
    nb_max_user: event.nb_max_user,
    id_creator: event.id_creator,
  };
}

// PATCH /api/events/:id — le créateur modifie date, description et/ou places
export async function modifierEvenement(req, res) {
  try {
    const { id } = req.params;
    if (!idValide(id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const autorises = ["describe", "date_event", "nb_max_user"];
    const champs = Object.keys(req.body);
    if (champs.length === 0) {
      return res.status(400).json({ message: "Aucun champ à modifier" });
    }
    if (champs.some((champ) => !autorises.includes(champ))) {
      return res.status(400).json({
        message: "Seuls describe, date_event et nb_max_user peuvent être modifiés",
      });
    }

    const event = await Event.findById(id);
    if (!event || event.id_creator.toString() !== req.user.id) {
      return res.status(404).json({ message: "Événement introuvable" });
    }

    if (req.body.describe !== undefined) {
      if (typeof req.body.describe !== "string") {
        return res.status(400).json({ message: "describe doit être une chaîne" });
      }
      const describe = req.body.describe.trim();
      if (describe.length > 1000) {
        return res.status(400).json({ message: "La description est trop longue (1000 caractères max)" });
      }
      event.describe = describe;
    }

    if (req.body.date_event !== undefined) {
      const date = new Date(req.body.date_event);
      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({ message: "date_event invalide" });
      }
      event.date_event = date;
    }

    if (req.body.nb_max_user !== undefined) {
      const places = Number(req.body.nb_max_user);
      if (!Number.isInteger(places) || places < 1) {
        return res.status(400).json({ message: "nb_max_user doit être un entier positif" });
      }
      if (places < event.nb_user) {
        return res.status(400).json({
          message: `Impossible : ${event.nb_user} personne(s) déjà inscrite(s). Choisis au moins ${event.nb_user} places.`,
        });
      }
      event.nb_max_user = places;
    }

    await event.save();
    res.json(formaterEvent(event));
  } catch (error) {
    console.error("modifierEvenement :", error.message);
    res.status(500).json({ message: "Impossible de modifier l'événement." });
  }
}

// DELETE /api/events/:id — supprimer l'événement (créateur uniquement, sinon 404)
export async function supprimerEvenement(req, res) {
  try {
    const { id } = req.params;
    if (!idValide(id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const event = await Event.findById(id);
    if (!event || event.id_creator.toString() !== req.user.id) {
      return res.status(404).json({ message: "Événement introuvable" });
    }

    // On enlève aussi toutes les réservations liées
    await Reservation.deleteMany({ id_event: id });
    await Message.deleteMany({ id_event: id }); // et sa discussion
    await event.deleteOne();
    fermerLaDiscussion(id);

    res.json({ ok: true });
  } catch (error) {
    console.error("supprimerEvenement :", error.message);
    res.status(500).json({ message: "Impossible de supprimer l'événement." });
  }
}

// GET /api/events/:id/inscrits — liste des participants (créateur et inscrits, sinon 404).
// Les emails ne sont jamais renvoyés, même au créateur (vie privée des participants).
export async function listerInscrits(req, res) {
  try {
    const { id } = req.params;
    if (!idValide(id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const event = await Event.findById(id).lean();
    // Accès : le créateur et les inscrits. Les autres → 404 (on ne révèle pas l'existence de l'event)
    const estCreateur = Boolean(event) && event.id_creator.toString() === req.user.id;
    const estInscrit =
      Boolean(event) && !estCreateur && Boolean(await Reservation.exists({ id_user: req.user.id, id_event: id }));
    if (!estCreateur && !estInscrit) {
      return res.status(404).json({ message: "Événement introuvable" });
    }

    const reservations = await Reservation.find({ id_event: id })
      .sort({ createdAt: 1 })
      .lean();

    const userIds = reservations.map((r) => r.id_user);
    const users = await User.find({ _id: { $in: userIds } })
      .select("name avatar")
      .lean();
    const parId = new Map(users.map((u) => [u._id.toString(), u]));

    const items = reservations.map((reservation) => {
      const user = parId.get(reservation.id_user.toString());
      return {
        _id: reservation._id,
        createdAt: reservation.createdAt,
        // Pour afficher le badge "Organisateur" dans la liste
        estCreateur: reservation.id_user.toString() === event.id_creator.toString(),
        user: user
          ? {
              _id: user._id,
              name: user.name,
              avatar: user.avatar,
            }
          : null,
      };
    });

    res.json({
      event: {
        _id: event._id,
        titre: event.titre,
        nb_user: event.nb_user,
        nb_max_user: event.nb_max_user,
      },
      items,
    });
  } catch (error) {
    console.error("listerInscrits :", error.message);
    res.status(500).json({ message: "Impossible de charger les inscrits." });
  }
}
