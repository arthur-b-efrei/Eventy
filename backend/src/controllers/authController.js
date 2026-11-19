import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { creerToken } from "../utils/token.js";
import { erreurDateNaissance } from "../utils/age.js";
import {
  envoyerCode,
  peutRenvoyer,
  verifierCode,
  DELAI_RENVOI_SECONDES,
} from "../services/codeVerification.js";


// POST /api/auth/register : inscription
// Le compte est créé mais pas encore utilisable : un code est envoyé par email.
export async function register(req, res) {
  try {
    const { name, email, password, date_naissance } = req.body;

    if (!name || !email || !password || !date_naissance) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Le mot de passe doit faire au moins 8 caractères" });
    }
    // On vérifie l'âge côté serveur : le formulaire seul peut être contourné
    const erreurDate = erreurDateNaissance(date_naissance);
    if (erreurDate) {
      return res.status(400).json({ message: erreurDate });
    }

    const emailPropre = email.trim().toLowerCase();
    // On crypte le mot de passe avant de l'enregistrer
    const motDePasseCrypte = await bcrypt.hash(password, 10);
    let user = await User.findOne({ email: emailPropre });

    if (user && user.email_verifie) {
      return res.status(409).json({ message: "Cet email est déjà utilisé" });
    }

    if (user) {
      // Compte jamais vérifié : la personne recommence son inscription, on met ses infos à jour
      user.name = name;
      user.password = motDePasseCrypte;
      user.date_naissance = date_naissance;
      await user.save();
    } else {
      // Le rôle n'est pas pris dans le formulaire : tout le monde commence en "user"
      user = await User.create({
        name,
        email: emailPropre,
        password: motDePasseCrypte,
        date_naissance,
      });
    }

    if (await peutRenvoyer(user)) {
      await envoyerCode(user);
    }

    res.status(201).json({ message: "Code envoyé par email", email: user.email });
  } catch (error) {
    console.error("register :", error.message);
    res.status(500).json({ message: "Impossible de créer le compte pour le moment, réessaie." });
  }
}

// POST /api/auth/verify-email : { email, code } -> connecte le user si le code est bon
export async function verifyEmail(req, res) {
  try {
    const { email, code } = req.body;
    if (!email || !/^\d{6}$/.test(String(code))) {
      return res.status(400).json({ message: "Le code doit contenir 6 chiffres" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Code incorrect ou expiré" });
    }
    if (user.email_verifie) {
      return res.status(400).json({ message: "Cet email est déjà vérifié, connecte-toi." });
    }

    const resultat = await verifierCode(user, code);
    if (resultat === "expire") {
      return res.status(400).json({ message: "Ce code a expiré. Demande un nouveau code." });
    }
    if (resultat === "trop_tentatives") {
      return res.status(429).json({ message: "Trop d'essais. Demande un nouveau code." });
    }
    if (resultat === "invalide") {
      return res.status(400).json({ message: "Code incorrect" });
    }

    user.email_verifie = true;
    await user.save();

    res.json({ token: creerToken(user), user });
  } catch (error) {
    console.error("verifyEmail :", error.message);
    res.status(500).json({ message: "Erreur serveur, réessaie." });
  }
}

// POST /api/auth/resend-code : { email } -> renvoie un code
// Réponse toujours identique, pour ne pas révéler quels emails ont un compte.
export async function resendCode(req, res) {
  try {
    const { email } = req.body;
    const user = email ? await User.findOne({ email: email.trim().toLowerCase() }) : null;

    if (user && !user.email_verifie && (await peutRenvoyer(user))) {
      await envoyerCode(user);
    }

    res.json({
      message: "Si un compte en attente existe pour cet email, un nouveau code vient d'être envoyé.",
      delai: DELAI_RENVOI_SECONDES,
    });
  } catch (error) {
    console.error("resendCode :", error.message);
    res.status(500).json({ message: "Impossible d'envoyer le code pour le moment, réessaie." });
  }
}

// POST /api/auth/forgot-password : { email } -> envoie un code pour changer de mot de passe
// Réponse toujours identique, pour ne pas révéler quels emails ont un compte.
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = email ? await User.findOne({ email: email.trim().toLowerCase() }) : null;

    if (user && (await peutRenvoyer(user, "reinitialisation"))) {
      await envoyerCode(user, "reinitialisation");
    }

    res.json({
      message: "Si un compte existe pour cet email, un code vient d'être envoyé.",
      delai: DELAI_RENVOI_SECONDES,
    });
  } catch (error) {
    console.error("forgotPassword :", error.message);
    res.status(500).json({ message: "Impossible d'envoyer le code pour le moment, réessaie." });
  }
}

// POST /api/auth/reset-password : { email, code, password } -> nouveau mot de passe + connexion
export async function resetPassword(req, res) {
  try {
    const { email, code, password } = req.body;

    if (!email || !/^\d{6}$/.test(String(code))) {
      return res.status(400).json({ message: "Le code doit contenir 6 chiffres" });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Le mot de passe doit faire au moins 8 caractères" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Code incorrect ou expiré" });
    }

    const resultat = await verifierCode(user, code, "reinitialisation");
    if (resultat === "expire") {
      return res.status(400).json({ message: "Ce code a expiré. Demande un nouveau code." });
    }
    if (resultat === "trop_tentatives") {
      return res.status(429).json({ message: "Trop d'essais. Demande un nouveau code." });
    }
    if (resultat === "invalide") {
      return res.status(400).json({ message: "Code incorrect" });
    }

    user.password = await bcrypt.hash(password, 10);
    // Les tokens créés avant ce moment ne marchent plus : les autres appareils sont déconnectés.
    // (arrondi à la seconde, comme la date de création stockée dans un token)
    user.mdp_change_le = new Date(Math.floor(Date.now() / 1000) * 1000);
    // Le code a été reçu sur cette adresse : elle est donc vérifiée
    user.email_verifie = true;
    await user.save();

    res.json({ token: creerToken(user), user });
  } catch (error) {
    console.error("resetPassword :", error.message);
    res.status(500).json({ message: "Erreur serveur, réessaie." });
  }
}

// POST /api/auth/login : connexion avec email + mot de passe
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe obligatoires" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    // Même message si l'email ou le mot de passe est faux :
    // on ne dit pas à un inconnu quels emails existent
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    // Bon mot de passe mais email jamais vérifié : on renvoie un code et le front affiche la saisie
    if (!user.email_verifie) {
      if (await peutRenvoyer(user)) {
        await envoyerCode(user);
      }
      return res.status(403).json({
        message: "Vérifie d'abord ton adresse email",
        code: "EMAIL_NON_VERIFIE",
        email: user.email,
      });
    }

    res.json({ token: creerToken(user), user });
  } catch (error) {
    console.error("login :", error.message);
    res.status(500).json({ message: "Erreur serveur, réessaie." });
  }
}

// GET /api/auth/me : renvoie le user connecté (route protégée)
export async function me(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}
