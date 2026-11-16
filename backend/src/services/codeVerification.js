import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import CodeVerification from "../models/CodeVerification.js";
import { envoyerEmail } from "./email.js";
import { emailCode } from "./templates.js";

export const DUREE_CODE_MINUTES = 10; // durée de validité d'un code
export const DELAI_RENVOI_SECONDES = 60; // temps minimum entre deux envois
export const TENTATIVES_MAX = 5; // mauvais essais autorisés par code

// Crée un nouveau code, remplace l'ancien et l'envoie par email
export async function envoyerCode(user) {
  // crypto.randomInt est un vrai tirage aléatoire sécurisé (Math.random ne l'est pas)
  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

  await CodeVerification.deleteMany({ id_user: user._id });
  await CodeVerification.create({
    id_user: user._id,
    code_hash: await bcrypt.hash(code, 10),
    expire_le: new Date(Date.now() + DUREE_CODE_MINUTES * 60 * 1000),
  });

  await envoyerEmail({ to: user.email, ...emailCode(user.name, code, DUREE_CODE_MINUTES) });
}

// Vrai si le dernier code date de plus d'une minute (anti-spam)
export async function peutRenvoyer(user) {
  const dernier = await CodeVerification.findOne({ id_user: user._id });
  if (!dernier) return true;
  return Date.now() - dernier.createdAt.getTime() >= DELAI_RENVOI_SECONDES * 1000;
}

// Vérifie le code saisi. Renvoie "ok", "expire", "trop_tentatives" ou "invalide".
export async function verifierCode(user, code) {
  // On compte l'essai tout de suite (même s'il est bon) pour bloquer les essais en rafale
  const enregistrement = await CodeVerification.findOneAndUpdate(
    { id_user: user._id },
    { $inc: { tentatives: 1 } },
    { returnDocument: "after" }
  );

  if (!enregistrement || enregistrement.expire_le < new Date()) return "expire";
  if (enregistrement.tentatives > TENTATIVES_MAX) return "trop_tentatives";

  const bon = await bcrypt.compare(String(code), enregistrement.code_hash);
  if (!bon) return "invalide";

  await CodeVerification.deleteMany({ id_user: user._id });
  return "ok";
}
