// Variables globales
let sessions = [];
let currentPage = 1;
const itemsPerPage = 3;
let userVotes = {};
let musicsBySession = {};
let userInfo = null;
let votedSessions = new Set();
let currentVoteData = null;

// Récupérer le token d'authentification
const getToken = () => {
    if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('token') || '';
    }
    return '';
};

// Définir le token
const setToken = (newToken) => {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('token', newToken);
    }
};

// Récupérer les informations de l'utilisateur
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

// Charger les sessions
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
        
        document.getElementById('loadingSpinner').classList.add('d-none');
        document.querySelector('.table').classList.remove('d-none');
        
        renderTable();
        setupPagination();
        
    } catch (error) {
        console.error('Erreur lors du chargement des sessions:', error);
        showToast('Erreur lors du chargement des sessions: ' + error.message, 'warning');
    }
}

// Charger les musiques pour une session
async function loadMusicsForSession(sessionId) {
    if (musicsBySession[sessionId]) {
        displayMusics(sessionId, musicsBySession[sessionId]);
    }

    try {
        const authToken = getToken();
        if (!authToken) {
            showToast('Veuillez vous connecter pour charger les musiques', 'warning');
            return;
        }

        const musicListContainer = document.getElementById(`music-list-${sessionId}`);
        if (musicListContainer && !musicsBySession[sessionId]) {
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
        musicsBySession[sessionId] = musics;

        // Vérifier si l'utilisateur a déjà voté AUJOURD'HUI (à chaque ouverture)
        if (userInfo) {
            try {
                const votesResponse = await fetch(`http://localhost:3000/api/votes/user/${userInfo.id}/session/${sessionId}`, {
                    headers: { 
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (votesResponse.ok) {
                    const data = await votesResponse.json();
                    console.log('Vérification vote - hasVoted:', data.hasVoted);
                    
                    // Si l'utilisateur a voté aujourd'hui, désactiver TOUTES les sessions
                    if (data.hasVoted) {
                        sessions.forEach(s => votedSessions.add(s.id));
                    } else {
                        // Si pas de vote, réinitialiser votedSessions
                        votedSessions.clear();
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la vérification des votes:', error);
            }
        }
        
        displayMusics(sessionId, musics);

    } catch (error) {
        console.error('Erreur lors du chargement des musiques:', error);
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

// Afficher les musiques
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
                    <button class="btn btn-sm btn-primary vote-btn ms-2" 
                        data-track-id="${music.id}"
                        data-session-id="${sessionId}"
                        data-title="${music.title}"
                        data-artist="${music.artist}"
                        aria-label="Voter pour ${music.title} de ${music.artist}">
                        <i class="bi bi-hand-thumbs-up me-1" aria-hidden="true"></i> Voter
                    </button>
                </div>
            </div>
        `).join('');
        
        const voteButtons = container.querySelectorAll('.vote-btn');
        voteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const trackId = this.getAttribute('data-track-id');
                const sessionId = this.getAttribute('data-session-id');
                const title = this.getAttribute('data-title');
                const artist = this.getAttribute('data-artist');
                showConfirmVoteModal(trackId, sessionId, title, artist, this);
            });
        });
        
        if (votedSessions.has(sessionId)) {
            disableVotingButtons(sessionId);
        }
    }
}

// Ajouter une musique à une session
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
        
        if (musicsBySession[sessionId]) {
            musicsBySession[sessionId].push(newMusic);
            displayMusics(sessionId, musicsBySession[sessionId]);
        } else {
            musicsBySession[sessionId] = [newMusic];
            displayMusics(sessionId, musicsBySession[sessionId]);
        }
        
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
    userInfo = await fetchUserInfo();
    if (userInfo) {
        document.getElementById('username').textContent = userInfo.firstname;
    }

    loadSessions();
    setupEventListeners();
});

// Remplir le select des sessions
function populateSessionSelect(selectedSessionId = null, lockSession = false) {
    const sessionSelect = document.getElementById('sessionSelect');
    
    sessionSelect.innerHTML = '';
    
    if (!lockSession) {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.disabled = true;
        defaultOption.selected = selectedSessionId === null;
        defaultOption.textContent = 'Choisir une session';
        sessionSelect.appendChild(defaultOption);
    }
    
    sessions.forEach(session => {
        const option = document.createElement('option');
        option.value = session.id;
        option.textContent = `${session.id} - ${session.subject}`;
        
        if (selectedSessionId && session.id === selectedSessionId) {
            option.selected = true;
        }
        
        if (lockSession && session.id !== selectedSessionId) {
            option.disabled = true;
        }
        
        sessionSelect.appendChild(option);
    });
    
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
            <td><span class="badge bg-dark">${session.id}</span></td>
            <td><strong>${session.subject}</strong></td>
            <td>${session.teacher}</td>
            <td><span class="badge bg-light text-dark">${session.promotion}</span></td>
            <td><span class="badge bg-light text-dark">${session.classroom}</span></td>
            <td><span class="badge bg-dark">${musicsBySession[session.id] ? musicsBySession[session.id].length : 0}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" data-bs-toggle="collapse" data-bs-target="#collapse${session.id}" aria-expanded="false" aria-controls="collapse${session.id}">
                    <i class="bi bi-eye me-1" aria-hidden="true"></i> Voir
                </button>
            </td>
        `;
        tbody.appendChild(row);
        
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
        
        const collapseElement = document.getElementById(`collapse${session.id}`);
        collapseElement.addEventListener('shown.bs.collapse', function () {
            loadMusicsForSession(session.id);
        });
    });
}

// Configuration pagination
function setupPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    const totalPages = Math.ceil(sessions.length / itemsPerPage);
    
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;" aria-label="Page précédente">Précédent</a>`;
    pagination.appendChild(prevLi);
    
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i}); return false;" aria-label="Page ${i}">${i}</a>`;
        pagination.appendChild(li);
    }
    
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;" aria-label="Page suivante">Suivant</a>`;
    pagination.appendChild(nextLi);
}

// Changement page
function changePage(page) {
    const totalPages = Math.ceil(sessions.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTable();
        setupPagination();
    }
}

// Setup écouteurs d'événements
function setupEventListeners() {
    document.getElementById('submitMusicBtn').addEventListener('click', async function() {
        const title = document.getElementById('musicTitle').value;
        const artist = document.getElementById('musicArtist').value;
        const sessionId = parseInt(document.getElementById('sessionSelect').value);
        
        if (!title || !artist || !sessionId) {
            showToast('Veuillez remplir tous les champs', 'warning');
            return;
        }
        
        const submitBtn = document.getElementById('submitMusicBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> En cours...';
        
        const success = await addMusicToSession(sessionId, title, artist);
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Soumettre';
        
        if (success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('submitMusicModal'));
            modal.hide();
            document.getElementById('submitMusicForm').reset();
            showToast('Musique ajoutée avec succès!', 'success');
        }
    });

    const mainSubmitBtn = document.querySelector('[data-bs-target="#submitMusicModal"]');
    if (mainSubmitBtn) {
        mainSubmitBtn.addEventListener('click', function() {
            document.getElementById('submitMusicForm').reset();
            populateSessionSelect(null, false);
        });
    }

    document.getElementById('submitMusicModal').addEventListener('hidden.bs.modal', function() {
        document.getElementById('submitMusicForm').reset();
        document.getElementById('sessionSelect').disabled = false;
    });

    document.getElementById('confirmVoteBtn').addEventListener('click', function() {
        if (currentVoteData) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('confirmVoteModal'));
            modal.hide();
            
            voteForTrack(
                currentVoteData.trackId, 
                currentVoteData.sessionId, 
                currentVoteData.buttonElement
            );
            
            currentVoteData = null;
        }
    });
}

// Ouvrir modal musique
function openSubmitMusicModal(sessionId = null) {
    const modal = new bootstrap.Modal(document.getElementById('submitMusicModal'));
    
    document.getElementById('submitMusicForm').reset();
    
    if (sessionId) {
        populateSessionSelect(sessionId, true);
    } else {
        populateSessionSelect(null, false);
    }
    
    modal.show();
}

// Afficher modal confirmation vote
function showConfirmVoteModal(trackId, sessionId, title, artist, buttonElement) {
    if (votedSessions.has(sessionId)) {
        showToast('Vous avez déjà voté aujourd\'hui', 'warning');
        return;
    }

    currentVoteData = {
        trackId: trackId,
        sessionId: sessionId,
        buttonElement: buttonElement
    };

    document.getElementById('confirmMusicTitle').textContent = title;
    document.getElementById('confirmMusicArtist').textContent = artist;

    const modal = new bootstrap.Modal(document.getElementById('confirmVoteModal'));
    modal.show();
}

// Voter pour un morceau
async function voteForTrack(trackId, sessionId, buttonElement) {
    try {
        const authToken = getToken();
        if (!authToken) {
            showToast('Veuillez vous connecter pour voter', 'warning');
            return;
        }

        const response = await fetch("http://localhost:3000/api/votes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                userId: userInfo.id,
                trackId: trackId,
                sessionId: sessionId
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
        }

        votedSessions.add(sessionId);
        disableVotingButtons(sessionId);
        
        showToast('Vote enregistré avec succès!', 'success');
        
    } catch (error) {
        console.error('Erreur lors du vote:', error);
        showToast('Erreur lors du vote: ' + error.message, 'warning');
    }
}

// Désactiver boutons vote
function disableVotingButtons(sessionId) {
    const musicListContainer = document.getElementById(`music-list-${sessionId}`);
    if (musicListContainer) {
        const voteButtons = musicListContainer.querySelectorAll('.vote-btn');
        voteButtons.forEach(button => {
            button.disabled = true;
            button.innerHTML = '<i class="bi bi-check-circle me-1" aria-hidden="true"></i> Déjà voté';
            button.classList.remove('btn-primary');
            button.classList.add('btn-secondary');
        });
    }
}

// Afficher toast notification
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
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}