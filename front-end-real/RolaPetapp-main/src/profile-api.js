// profile-api.js

const APIPerfil = "http://localhost:8082/users/profile/my-profile";

export async function fetchUserProfile() {
  // Ajusta la clave del token a la que realmente uses
  // tú usaste authToken en el POST del perfil
  const token = localStorage.getItem("authToken");
  console.log(token)

  if (!token) {
    console.error("No hay token en localStorage");
    throw new Error("No hay token de autenticación");
  }

  try {
    const response = await fetch(APIPerfil, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': "application/json"
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("Respuesta HTTP no OK:", response.status, text);
      throw new Error(
        `Error HTTP ${response.status} al obtener el perfil`
      );
    }

    const data = await response.json();
    console.log("Perfil recibido:", data);
    return data;
  } catch (err) {
    console.error("Error en fetchUserProfile:", err);
    throw err;
  }
}
