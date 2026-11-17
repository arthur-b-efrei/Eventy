const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// À adapter quand la personne qui fait la connexion aura décidé où stocker le JWT.
function getToken() {
  return localStorage.getItem("token");
}

// Envoie un nouvel événement à l'API. Retourne l'événement créé.
// En cas d'erreur HTTP, lance une Error avec .status et .errors (erreurs par champ).
export async function createEvent(eventData) {
  const token = getToken();

  const response = await fetch(`${API_URL}/api/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(eventData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      response.status === 401
        ? "Vous devez être connecté pour créer un événement."
        : data.message || "Une erreur est survenue."
    );
    error.status = response.status;
    error.errors = data.errors || {};
    throw error;
  }

  return data;
}