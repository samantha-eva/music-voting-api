const welcome = document.getElementById("welcome");
const tableBody = document.querySelector("#sessions-table tbody");

let jwtToken = localStorage.getItem("token");
const params = new URLSearchParams(window.location.search);
const magicToken = params.get("token");

// Décode JWT côté front
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

// Vérifie si le JWT est expiré
function isTokenExpired(token) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  return payload.exp * 1000 < Date.now();
}

// Charger les sessions
async function loadSessions(token) {
  try {
    const res = await fetch("http://localhost:3000/api/sessions", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const sessions = await res.json();
    tableBody.innerHTML = "";

    sessions.forEach(session => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${session.id}</td>
        <td>${session.subject}</td>
        <td>${session.teacher}</td>
        <td>${session.promotion}</td>
        <td>${session.classroom}</td>
        <td>
          <button onclick="showSongForm(${session.id})">Soumettre chanson</button>
          <button onclick="loadSongs(${session.id})">Voir chansons</button>
          <div id="songs-${session.id}" class="song-list"></div>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    welcome.textContent = "❌ Impossible de charger les sessions.";
    welcome.style.color = "red";
  }
}

// Afficher le formulaire pour soumettre une chanson
function showSongForm(sessionId) {
  const container = document.getElementById(`songs-${sessionId}`);
  container.innerHTML = `
    <input type="text" id="song-title-${sessionId}" placeholder="Titre de la chanson"><br>
    <input type="text" id="song-artist-${sessionId}" placeholder="Nom de l'artiste"><br>
    <button onclick="submitSong(${sessionId})">Envoyer</button>
  `;
}

// Soumettre la chanson
function submitSong(sessionId) {
  if (isTokenExpired(jwtToken)) {
    alert("Votre session a expiré. Veuillez vous reconnecter via le lien magique.");
    return;
  }

  const title = document.getElementById(`song-title-${sessionId}`).value.trim();
  const artist = document.getElementById(`song-artist-${sessionId}`).value.trim();
  if (!title || !artist) return alert("Veuillez remplir le titre et l'artiste.");

  const payload = { title, artist, sessionId };

  fetch("http://localhost:3000/api/tracks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`
    },
    body: JSON.stringify(payload)
  })
  .then(res => {
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    return res.json();
  })
  .then(() => {
    document.getElementById(`song-title-${sessionId}`).value = "";
    document.getElementById(`song-artist-${sessionId}`).value = "";
    loadSongs(sessionId);
  })
  .catch(err => {
    console.error("Erreur lors de l'envoi de la chanson:", err);
    alert("Erreur lors de l'envoi de la chanson.");
  });
}

// Charger les chansons
function loadSongs(sessionId) {
  fetch(`http://localhost:3000/api/tracks/session/${sessionId}`, {
    headers: { Authorization: `Bearer ${jwtToken}` }
  })
  .then(res => res.json())
  .then(songs => {
    const container = document.getElementById(`songs-${sessionId}`);
    if (!songs || songs.length === 0) {
      container.innerHTML = "<em>Aucune chanson pour cette session.</em>";
    } else {
      container.innerHTML = "<ul>" + songs.map(s => `<li>${s.title} - ${s.artist}</li>`).join("") + "</ul>";
    }
  })
  .catch(err => {
    console.error(err);
    document.getElementById(`songs-${sessionId}`).innerHTML = "<em>Impossible de charger les chansons.</em>";
  });
}

// Gestion du JWT / token magique
function init() {
  if (jwtToken && !isTokenExpired(jwtToken)) {
    welcome.textContent = "✅ Déjà connecté";
    welcome.style.color = "green";
    loadSessions(jwtToken);
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
  } else {
    welcome.textContent = "❌ Aucun token fourni. Connectez-vous depuis le lien magique.";
    welcome.style.color = "red";
  }
}

init();
