
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Récupère le token enregistré par AuthProvider
function getToken() {
  return localStorage.getItem("eventy_token");
}

// Envoie un nouvel événement au backend
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
