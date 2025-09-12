const welcome = document.getElementById("welcome");
const tableBody = document.querySelector("#sessions-table tbody");

// 1️⃣ Vérifier si un JWT est déjà stocké
let jwtToken = localStorage.getItem("token");

// 2️⃣ Vérifier si on a un token magique dans l'URL (lien du mail)
const params = new URLSearchParams(window.location.search);
const magicToken = params.get("token");

async function loadSessions(token) {
  try {
    const resSessions = await fetch("http://localhost:3000/api/sessions", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const sessions = await resSessions.json();

    tableBody.innerHTML = ""; // vider le tableau
    sessions.forEach(session => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${session.id}</td>
        <td>${session.subject}</td>
        <td>${session.teacher}</td>
        <td>${session.promotion}</td>
        <td>${session.classroom}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    welcome.textContent = "❌ Impossible de charger les sessions.";
    welcome.style.color = "red";
  }
}

// 3️⃣ Si JWT déjà stocké → on l’utilise
if (jwtToken) {
  welcome.textContent = "✅ Déjà connecté";
  welcome.style.color = "green";
  loadSessions(jwtToken);

// 4️⃣ Sinon, on utilise le token magique pour générer le JWT
} else if (magicToken) {
  fetch(`http://localhost:3000/api/auth/login/${magicToken}`, { method: "POST" })
    .then(res => res.json())
    .then(data => {
      if (data.token && data.user) {
        jwtToken = data.token;
        localStorage.setItem("token", jwtToken);

        welcome.textContent = `✅ Connecté en tant que ${data.user.email}`;
        welcome.style.color = "green";

        loadSessions(jwtToken);
      } else {
        welcome.textContent = "❌ Token invalide ou expiré.";
        welcome.style.color = "red";
      }
    })
    .catch(() => {
      welcome.textContent = "❌ Erreur serveur.";
      welcome.style.color = "red";
    });

// 5️⃣ Sinon, pas de token → afficher message
} else {
  welcome.textContent = "❌ Aucun token fourni. Connectez-vous depuis le lien magique.";
  welcome.style.color = "red";
}
