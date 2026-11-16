import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Crée un token JWT qui contient l'id et le rôle du user (valable 7 jours)
function creerToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

// POST /api/auth/register : inscription
export async function register(req, res) {
  try {
    const { name, email, password, date_naissance } = req.body;

    if (!name || !email || !password || !date_naissance) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Le mot de passe doit faire au moins 6 caractères" });
    }

    const dejaInscrit = await User.findOne({ email: email.toLowerCase() });
    if (dejaInscrit) {
      return res.status(409).json({ message: "Cet email est déjà utilisé" });
    }

    // On crypte le mot de passe avant de l'enregistrer
    const motDePasseCrypte = await bcrypt.hash(password, 10);

    // Le rôle n'est pas pris dans le formulaire : tout le monde commence en "user"
    const user = await User.create({
      name,
      email,
      password: motDePasseCrypte,
      date_naissance,
    });

    res.status(201).json({ token: creerToken(user), user });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}

// POST /api/auth/login : connexion avec email + mot de passe
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe obligatoires" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Même message si l'email ou le mot de passe est faux :
    // on ne dit pas à un inconnu quels emails existent
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    res.json({ token: creerToken(user), user });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
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
