// Variables globales
let sessions = [];
let currentPage = 1;
const itemsPerPage = 3;
let userVotes = {}; // Stockage en mémoire au lieu de localStorage
let musicsBySession = {}; // Cache pour les musiques par session
let userInfo = null;

// Récupérer le token d'authentification depuis localStorage
const getToken = () => {
    // Pour la compatibilité avec votre application existante
    // Si vous voulez utiliser le stockage en mémoire uniquement, modifiez cette fonction
    if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('token') || '';
    }
    return '';
};

// Définir le token (à appeler lors de la connexion)
const setToken = (newToken) => {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('token', newToken);
    }
};

// Récupérer les informations de l'utilisateur depuis l'API
async function fetchUserInfo() {
    try {
        const authToken = getToken();
        if (!authToken) {
            console.error('Token non trouvé');
            return null;
        }

        const response = await fetch("http://localhost:3000/api/auth/me", {
            headers: { 
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Erreur lors de la récupération des informations utilisateur:', error);
        return null;
    }
}

// Charger les sessions depuis l'API
async function loadSessions() {
    try {
        const authToken = getToken();
        console.log('token user current:', authToken);
        if (!authToken) {
            showToast('Veuillez vous connecter pour accéder aux sessions', 'warning');
            return;
        }

        const response = await fetch("http://localhost:3000/api/sessions", {
            headers: { 
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        sessions = await response.json();
        
        // Masquer le spinner et afficher le tableau
        document.getElementById('loadingSpinner').classList.add('d-none');
        document.querySelector('.table').classList.remove('d-none');
        
        // Mettre à jour l'affichage
        renderTable();
        setupPagination();
        
    } catch (error) {
        console.error('Erreur lors du chargement des sessions:', error);
        showToast('Erreur lors du chargement des sessions: ' + error.message, 'warning');
    }
}

// Charger les musiques pour une session spécifique
async function loadMusicsForSession(sessionId) {
    // Si les musiques sont déjà chargées, on les affiche directement
    if (musicsBySession[sessionId]) {
        displayMusics(sessionId, musicsBySession[sessionId]);
        return;
    }

    try {
        const authToken = getToken();
        if (!authToken) {
            showToast('Veuillez vous connecter pour charger les musiques', 'warning');
            return;
        }

        // Afficher le spinner de chargement
        const musicListContainer = document.getElementById(`music-list-${sessionId}`);
        if (musicListContainer) {
            musicListContainer.innerHTML = `
                <div class="music-loading">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <span>Chargement des musiques...</span>
                </div>
            `;
        }

        const response = await fetch(`http://localhost:3000/api/tracks/session/${sessionId}`, {
            headers: { 
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const musics = await response.json();
        
        // Stocker les musiques pour cette session
        musicsBySession[sessionId] = musics;
        
        // Afficher les musiques
        displayMusics(sessionId, musics);

    } catch (error) {
        console.error('Erreur lors du chargement des musiques:', error);
        // Afficher un message d'erreur dans le conteneur de la session
        const musicListContainer = document.getElementById(`music-list-${sessionId}`);
        if (musicListContainer) {
            musicListContainer.innerHTML = `
                <div class="alert alert-warning">
                    Impossible de charger les musiques: ${error.message}
                </div>
            `;
        }
    }
}

// Afficher les musiques pour une session
function displayMusics(sessionId, musics) {
    const container = document.getElementById(`music-list-${sessionId}`);
    if (!container) return;

    if (!musics || musics.length === 0) {
        container.innerHTML = '<div class="alert alert-info">Aucune musique pour cette session.</div>';
    } else {
        container.innerHTML = musics.map(music => `
            <div class="music-item">
                <div class="music-info">
                    <div class="music-title">${music.title}</div>
                    <div class="music-artist">${music.artist}</div>
                </div>
                <div>
                    <span class="vote-badge">${music.votes || 0} votes</span>
                    <button class="btn btn-sm btn-primary vote-btn ms-2" 
                            aria-label="Voter pour ${music.title} de ${music.artist}">
                        <i class="bi bi-hand-thumbs-up me-1" aria-hidden="true"></i> Voter
                    </button>
                </div>
            </div>
        `).join('');
    }
}

async function addMusicToSession(sessionId, title, artist) {
    try {
        const authToken = getToken();
        if (!authToken) {
            showToast('Veuillez vous connecter pour ajouter une musique', 'warning');
            return false;
        }

        const payload = { title, artist, sessionId };

        const response = await fetch("http://localhost:3000/api/tracks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const newMusic = await response.json();
        
        // Ajouter la nouvelle musique au cache
        if (musicsBySession[sessionId]) {
            musicsBySession[sessionId].push(newMusic);
            // Rafraîchir l'affichage
            displayMusics(sessionId, musicsBySession[sessionId]);
        } else {
            // Si le cache n'existe pas encore, on le crée
            musicsBySession[sessionId] = [newMusic];
            // Rafraîchir l'affichage
            displayMusics(sessionId, musicsBySession[sessionId]);
        }
        
        // Mettre à jour le compteur de morceaux dans le tableau
        renderTable();
        
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la musique:', error);
        showToast('Erreur lors de l\'ajout de la musique: ' + error.message, 'warning');
        return false;
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    // Charger les informations de l'utilisateur
    userInfo = await fetchUserInfo();
    if (userInfo) {
        document.getElementById('username').textContent = userInfo.firstname;
    }

    // Charger les sessions depuis l'API
    loadSessions();
    setupEventListeners();
});

// Remplir la liste déroulante des sessions
function populateSessionSelect(selectedSessionId = null, lockSession = false) {
    const sessionSelect = document.getElementById('sessionSelect');
    
    // Réinitialiser le select
    sessionSelect.innerHTML = '';
    
    // Ajouter l'option par défaut uniquement si aucune session n'est verrouillée
    if (!lockSession) {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.disabled = true;
        defaultOption.selected = selectedSessionId === null;
        defaultOption.textContent = 'Choisir une session';
        sessionSelect.appendChild(defaultOption);
    }
    
    // Ajouter les sessions
    sessions.forEach(session => {
        const option = document.createElement('option');
        option.value = session.id;
        option.textContent = `${session.id} - ${session.subject}`;
        
        // Pré-sélectionner si c'est la session demandée
        if (selectedSessionId && session.id === selectedSessionId) {
            option.selected = true;
        }
        
        // Désactiver les autres options si la session est verrouillée
        if (lockSession && session.id !== selectedSessionId) {
            option.disabled = true;
        }
        
        sessionSelect.appendChild(option);
    });
    
    // Désactiver complètement le select si une session est verrouillée
    sessionSelect.disabled = lockSession;
}

// Rendu du tableau
function renderTable() {
    const tbody = document.getElementById('sessionTableBody');
    tbody.innerHTML = '';
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedSessions = sessions.slice(start, end);
    
    paginatedSessions.forEach(session => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="badge bg-primary">${session.id}</span></td>
            <td><strong>${session.subject}</strong></td>
            <td>${session.teacher}</td>
            <td><span class="badge bg-light text-dark">${session.promotion}</span></td>
            <td><span class="badge bg-light text-dark">${session.classroom}</span></td>
            <td><span class="badge bg-success">${musicsBySession[session.id] ? musicsBySession[session.id].length : 0}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" data-bs-toggle="collapse" data-bs-target="#collapse${session.id}" aria-expanded="false" aria-controls="collapse${session.id}">
                    <i class="bi bi-eye me-1" aria-hidden="true"></i> Voir
                </button>
            </td>
        `;
        tbody.appendChild(row);
        
        // Ligne de collapse
        const collapseRow = document.createElement('tr');
        collapseRow.className = 'collapse-row';
        collapseRow.innerHTML = `
            <td colspan="7" class="p-0">
                <div class="collapse" id="collapse${session.id}">
                    <div class="collapse-content">
                        <div class="section-header">
                            <h5 class="section-title">Liste des musiques</h5>
                            <button class="btn btn-sm btn-success" onclick="openSubmitMusicModal(${session.id})" aria-label="Ajouter une musique à la session ${session.subject}">
                                <i class="bi bi-plus-circle me-1" aria-hidden="true"></i> Ajouter
                            </button>
                        </div>
                        <div id="music-list-${session.id}" class="music-list">
                            <div class="music-loading">
                                <div class="spinner-border" role="status">
                                    <span class="visually-hidden">Chargement...</span>
                                </div>
                                <span>Cliquez sur "Voir" pour charger les musiques</span>
                            </div>
                        </div>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(collapseRow);
        
        // Ajouter un écouteur d'événement pour charger les musiques lorsque le collapse est ouvert
        const collapseElement = document.getElementById(`collapse${session.id}`);
        collapseElement.addEventListener('shown.bs.collapse', function () {
            loadMusicsForSession(session.id);
        });
    });
}

// Configuration de la pagination
function setupPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    const totalPages = Math.ceil(sessions.length / itemsPerPage);
    
    // Bouton précédent
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;" aria-label="Page précédente">Précédent</a>`;
    pagination.appendChild(prevLi);
    
    // Numéros de page
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i}); return false;" aria-label="Page ${i}">${i}</a>`;
        pagination.appendChild(li);
    }
    
    // Bouton suivant
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;" aria-label="Page suivante">Suivant</a>`;
    pagination.appendChild(nextLi);
}

// Changement de page
function changePage(page) {
    const totalPages = Math.ceil(sessions.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTable();
        setupPagination();
    }
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Gestion du bouton de soumission
    document.getElementById('submitMusicBtn').addEventListener('click', async function() {
        const title = document.getElementById('musicTitle').value;
        const artist = document.getElementById('musicArtist').value;
        const sessionId = parseInt(document.getElementById('sessionSelect').value);
        
        if (!title || !artist || !sessionId) {
            showToast('Veuillez remplir tous les champs', 'warning');
            return;
        }
        
        // Désactiver le bouton pendant le traitement
        const submitBtn = document.getElementById('submitMusicBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> En cours...';
        
        // Appeler l'API pour ajouter la musique
        const success = await addMusicToSession(sessionId, title, artist);
        
        // Réactiver le bouton
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Soumettre';
        
        if (success) {
            // Fermer la modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('submitMusicModal'));
            modal.hide();
            
            // Réinitialiser le formulaire
            document.getElementById('submitMusicForm').reset();
            
            // Afficher un message de succès
            showToast('Musique ajoutée avec succès!', 'success');
        }
    });

    // Gérer l'ouverture de la modal depuis le bouton principal
    const mainSubmitBtn = document.querySelector('[data-bs-target="#submitMusicModal"]');
    if (mainSubmitBtn) {
        mainSubmitBtn.addEventListener('click', function() {
            // Réinitialiser le formulaire et la liste des sessions
            document.getElementById('submitMusicForm').reset();
            populateSessionSelect(null, false);
        });
    }

    // Gérer la fermeture de la modal
    document.getElementById('submitMusicModal').addEventListener('hidden.bs.modal', function() {
        // Réinitialiser le formulaire
        document.getElementById('submitMusicForm').reset();
        // Réactiver le select au cas où il serait désactivé
        document.getElementById('sessionSelect').disabled = false;
    });
}

// Ouvrir la modal pour soumettre une musique
function openSubmitMusicModal(sessionId = null) {
    const modal = new bootstrap.Modal(document.getElementById('submitMusicModal'));
    
    // Réinitialiser le formulaire
    document.getElementById('submitMusicForm').reset();
    
    // Si un sessionId est fourni, pré-sélectionner et verrouiller cette session
    if (sessionId) {
        populateSessionSelect(sessionId, true);
    } else {
        populateSessionSelect(null, false);
    }
    
    modal.show();
}

// Afficher un toast de notification
function showToast(message, type = 'success') {
    const toastContainer = document.querySelector('.toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} show align-items-center`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Fermer"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Supprimer le toast après 3 secondes
    setTimeout(() => {
        toast.remove();
    }, 3000);
}