document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const message = document.getElementById("message");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;

    try {
      const response = await fetch("http://localhost:3000/api/auth/request-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        message.textContent = "📩 Vérifiez votre boîte mail pour le lien magique !";
        message.style.color = "lightgreen";
      } else {
        message.textContent = data.error || "Erreur lors de la connexion.";
        message.style.color = "red";
      }
    } catch (err) {
      message.textContent = "❌ Impossible de contacter le serveur.";
      message.style.color = "red";
    }
  });
});
