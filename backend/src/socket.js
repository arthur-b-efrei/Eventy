import { Server } from "socket.io";
import mongoose from "mongoose";
import Message from "./models/Message.js";
import User from "./models/User.js";
import { userDuToken } from "./middleware/auth.js";
import {
  TEXTE_MAX,
  eventAccessible,
  formaterMessage,
  salonEvent,
  salonUser,
} from "./services/discussion.js";

// Anti-spam : 5 messages maximum toutes les 5 secondes, par connexion
const LIMITE_MESSAGES = 5;
const FENETRE_MS = 5000;

let io = null;

// Branche Socket.IO sur le serveur HTTP d'Express (même port que l'API)
export function demarrerSocket(serveurHttp) {
  io = new Server(serveurHttp, {
    // Comme l'API (app.use(cors())) : on s'identifie avec le token, pas avec des cookies
    cors: { origin: "*" },
  });

  // 1. À la connexion, le front envoie son token : io(url, { auth: { token } })
  io.use(async (socket, next) => {
    try {
      const resultat = await userDuToken(socket.handshake.auth?.token);
      if (resultat.erreur) {
        // Le front reconnaît ce code et déconnecte le user, comme pour un 401
        const erreur = new Error(resultat.erreur);
        erreur.data = { code: "NON_AUTORISE" };
        return next(erreur);
      }
      socket.data.userId = resultat.id;
      // Le prénom sert à afficher "Léa écrit…" chez les autres
      const user = await User.findById(resultat.id).select("name").lean();
      socket.data.name = user?.name || "";
      next();
    } catch (error) {
      console.error("socket auth :", error.message);
      next(new Error("Erreur serveur"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    socket.join(salonUser(userId));
    const envois = []; // heures des derniers messages envoyés (anti-spam)

    // 2. Entrer dans la discussion d'un event : ("rejoindre", eventId, reponse)
    socket.on("rejoindre", async (eventId, reponse = () => {}) => {
      try {
        if (!(await eventAccessible(userId, eventId))) {
          return reponse({ erreur: "Tu dois être inscrit à cet événement pour accéder à sa discussion." });
        }
        socket.join(salonEvent(eventId));
        reponse({ ok: true });
      } catch (error) {
        console.error("socket rejoindre :", error.message);
        reponse({ erreur: "Impossible de rejoindre la discussion." });
      }
    });

    socket.on("quitter", (eventId) => {
      socket.leave(salonEvent(eventId));
    });

    // 3. Envoyer un message : ("message", { eventId, texte }, reponse)
    socket.on("message", async (donnees, reponse = () => {}) => {
      try {
        const eventId = donnees?.eventId;
        const texte = typeof donnees?.texte === "string" ? donnees.texte.trim() : "";

        if (!texte) return reponse({ erreur: "Le message est vide." });
        if (texte.length > TEXTE_MAX) {
          return reponse({ erreur: `Le message est trop long (${TEXTE_MAX} caractères max).` });
        }

        const maintenant = Date.now();
        while (envois.length && maintenant - envois[0] > FENETRE_MS) envois.shift();
        if (envois.length >= LIMITE_MESSAGES) {
          return reponse({ erreur: "Doucement ! Attends quelques secondes avant de renvoyer un message." });
        }

        // On revérifie à chaque message : le user a pu se désinscrire entre-temps
        if (!(await eventAccessible(userId, eventId))) {
          socket.leave(salonEvent(eventId));
          return reponse({ erreur: "Tu n'as plus accès à cette discussion." });
        }

        envois.push(maintenant);
        const message = await Message.create({ id_event: eventId, id_user: userId, texte });
        await message.populate("id_user", "name avatar");
        const pret = formaterMessage(message);

        // Tout le salon le reçoit, l'auteur compris (ses autres onglets aussi)
        io.to(salonEvent(eventId)).emit("message", pret);
        reponse({ ok: true, message: pret });
      } catch (error) {
        console.error("socket message :", error.message);
        reponse({ erreur: "Le message n'est pas parti, réessaie." });
      }
    });

    // 4. "X écrit…" : prévient les autres du salon (pas d'enregistrement en base)
    socket.on("ecrit", (eventId) => {
      if (typeof eventId !== "string" || !mongoose.Types.ObjectId.isValid(eventId)) return;
      const salon = salonEvent(eventId);
      if (socket.rooms.has(salon)) {
        socket.to(salon).emit("ecrit", { eventId, userId, name: socket.data.name });
      }
    });
  });

  return io;
}

// Sort un user de la discussion d'un event (il s'est désinscrit)
export function retirerDeLaDiscussion(userId, eventId) {
  if (!io) return;
  io.in(salonUser(userId)).socketsLeave(salonEvent(eventId));
  io.to(salonUser(userId)).emit("discussion-fermee", { eventId: String(eventId), raison: "desinscrit" });
}

// Ferme la discussion d'un event pour tout le monde (event supprimé)
export function fermerLaDiscussion(eventId) {
  if (!io) return;
  io.to(salonEvent(eventId)).emit("discussion-fermee", { eventId: String(eventId), raison: "supprime" });
  io.in(salonEvent(eventId)).socketsLeave(salonEvent(eventId));
}

// Coupe toutes les connexions d'un user (compte supprimé)
export function deconnecterUser(userId) {
  if (!io) return;
  io.in(salonUser(userId)).disconnectSockets(true);
}
