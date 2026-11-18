import bcrypt from "bcryptjs";
import User from "../models/User.js";
import PhotoProfil from "../models/PhotoProfil.js";
import CodeVerification from "../models/CodeVerification.js";
import Event from "../models/Event.js";
import Reservation from "../models/Reservation.js";
import Message from "../models/Message.js";
import { deconnecterUser, fermerLaDiscussion } from "../socket.js";
import Log from "../models/Log.js";
import { erreurDateNaissance } from "../utils/age.js";
import { creerToken } from "../utils/token.js";

const NOM_MAX = 40;

// PATCH /api/users/me : { name?, date_naissance? } -> user mis à jour
// (l'email ne se change pas ici : il faudrait revérifier la nouvelle adresse)
export async function modifierInfos(req, res) {
  try {
    const { name, date_naissance } = req.body;
    const modifs = {};

    if (name !== undefined) {
      const nom = String(name).trim();
      if (!nom) return res.status(400).json({ message: "Le prénom ou pseudo ne peut pas être vide" });
      if (nom.length > NOM_MAX) {
        return res.status(400).json({ message: `${NOM_MAX} caractères maximum pour le prénom ou pseudo` });
      }
      modifs.name = nom;
    }

    if (date_naissance !== undefined) {
      const erreur = erreurDateNaissance(date_naissance);
      if (erreur) return res.status(400).json({ message: erreur });
      modifs.date_naissance = date_naissance;
    }

    if (Object.keys(modifs).length === 0) {
      return res.status(400).json({ message: "Rien à modifier" });
    }

    const user = await User.findByIdAndUpdate(req.user.id, modifs, {
      returnDocument: "after",
      runValidators: true,
    });
    res.json(user);
  } catch (error) {
    console.error("modifierInfos :", error.message);
    res.status(500).json({ message: "Impossible d'enregistrer, réessaie." });
  }
}

// PUT /api/users/me/password : { ancien, nouveau } -> { token, user }
// On renvoie un nouveau token : cet appareil reste connecté, les autres sont déconnectés.
export async function changerMotDePasse(req, res) {
  try {
    const { ancien, nouveau } = req.body;
    if (!ancien || !nouveau) {
      return res.status(400).json({ message: "Remplis l'ancien et le nouveau mot de passe" });
    }
    if (nouveau.length < 6) {
      return res.status(400).json({ message: "Le nouveau mot de passe doit faire au moins 6 caractères" });
    }

    const user = await User.findById(req.user.id);
    if (!(await bcrypt.compare(ancien, user.password))) {
      return res.status(400).json({ message: "Mot de passe actuel incorrect" });
    }
    if (await bcrypt.compare(nouveau, user.password)) {
      return res.status(400).json({ message: "Le nouveau mot de passe doit être différent de l'ancien" });
    }

    user.password = await bcrypt.hash(nouveau, 10);
    // Les tokens créés avant ce moment ne marchent plus (arrondi à la seconde, comme dans un token)
    user.mdp_change_le = new Date(Math.floor(Date.now() / 1000) * 1000);
    await user.save();

    res.json({ token: creerToken(user), user });
  } catch (error) {
    console.error("changerMotDePasse :", error.message);
    res.status(500).json({ message: "Impossible de changer le mot de passe, réessaie." });
  }
}

// DELETE /api/users/me : { password } -> supprime le compte et tout ce qui lui appartient
export async function supprimerCompte(req, res) {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);
    if (!password || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // Les events créés par ce user disparaissent, avec les réservations qui les concernent
    const sesEvents = await Event.find({ id_creator: user._id }).select("_id");
    const idsEvents = sesEvents.map((e) => e._id);

    // Ses propres réservations à d'autres events : on libère les places
    const sesReservations = await Reservation.find({ id_user: user._id, id_event: { $nin: idsEvents } });
    for (const r of sesReservations) {
      await Event.updateOne({ _id: r.id_event, nb_user: { $gt: 0 } }, { $inc: { nb_user: -1 } });
    }

    await Promise.all([
      Reservation.deleteMany({ $or: [{ id_user: user._id }, { id_event: { $in: idsEvents } }] }),
      Log.deleteMany({ $or: [{ id_user: user._id }, { id_event: { $in: idsEvents } }] }),
      // Ses messages, et les discussions de ses events
      Message.deleteMany({ $or: [{ id_user: user._id }, { id_event: { $in: idsEvents } }] }),
      Event.deleteMany({ _id: { $in: idsEvents } }),
      PhotoProfil.deleteOne({ id_user: user._id }),
      CodeVerification.deleteMany({ id_user: user._id }),
    ]);
    await User.deleteOne({ _id: user._id });
    idsEvents.forEach((id) => fermerLaDiscussion(id));
    deconnecterUser(user._id.toString());

    res.json({ message: "Compte supprimé" });
  } catch (error) {
    console.error("supprimerCompte :", error.message);
    res.status(500).json({ message: "Impossible de supprimer le compte, réessaie." });
  }
}
