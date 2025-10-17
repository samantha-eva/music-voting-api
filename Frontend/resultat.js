  // Variables globales
        let sessions = [];
        let musicsBySession = {};
        let votesByTrack = {};
        let totalVotes = 0;
        let totalMusics = 0;
        let totalParticipants = new Set();

        // Récupérer le token d'authentification depuis localStorage
        const getToken = () => {
            if (typeof localStorage !== 'undefined') {
                return localStorage.getItem('token') || '';
            }
            return '';
        };

        // Afficher un toast de notification
        function showToast(message, type = 'success') {
            const toastContainer = document.createElement('div');
            toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
            toastContainer.style.zIndex = '1050';
            
            const toast = document.createElement('div');
            toast.className = `toast show align-items-center text-white bg-${type} border-0`;
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', 'assertive');
            toast.setAttribute('aria-atomic', 'true');
            toast.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fermer"></button>
                </div>
            `;
            
            toastContainer.appendChild(toast);
            document.body.appendChild(toastContainer);
            
            // Supprimer le toast après 3 secondes
            setTimeout(() => {
                toastContainer.remove();
            }, 3000);
        }

        // Charger les sessions depuis l'API
        async function loadSessions() {
            try {
                const authToken = getToken();
                if (!authToken) {
                    showToast('Veuillez vous connecter pour accéder aux résultats', 'warning');
                    return [];
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

                return await response.json();
            } catch (error) {
                console.error('Erreur lors du chargement des sessions:', error);
                showToast('Erreur lors du chargement des sessions: ' + error.message, 'warning');
                return [];
            }
        }

        // Charger les musiques pour une session spécifique
        async function loadMusicsForSession(sessionId) {
            try {
                const authToken = getToken();
                if (!authToken) {
                    showToast('Veuillez vous connecter pour charger les musiques', 'warning');
                    return [];
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

                return await response.json();
            } catch (error) {
                console.error('Erreur lors du chargement des musiques:', error);
                showToast('Erreur lors du chargement des musiques: ' + error.message, 'warning');
                return [];
            }
        }

        // Charger les votes pour une session spécifique
        async function loadVotesForSession(sessionId) {
            try {
                const authToken = getToken();
                if (!authToken) {
                    showToast('Veuillez vous connecter pour charger les votes', 'warning');
                    return [];
                }

                const response = await fetch(`http://localhost:3000/api/votes/session/${sessionId}`, {
                    headers: { 
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    // Si l'endpoint n'existe pas, on retourne un tableau vide
                    if (response.status === 404) {
                        return [];
                    }
                    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error('Erreur lors du chargement des votes:', error);
                // On ne montre pas d'erreur pour cet endpoint optionnel
                return [];
            }
        }

        // Mettre à jour les statistiques globales
        function updateGlobalStats() {
            // Calculer le total de musiques
            totalMusics = Object.values(musicsBySession).reduce((total, musics) => total + musics.length, 0);
            
            // Calculer le total de votes
            totalVotes = Object.values(votesByTrack).reduce((total, votes) => total + votes, 0);
            
            // Mettre à jour l'affichage
            document.getElementById('totalMusics').textContent = totalMusics;
            document.getElementById('totalVotes').textContent = totalVotes;
            document.getElementById('activeSessions').textContent = sessions.length;
            document.getElementById('totalParticipants').textContent = totalParticipants.size;
        }

        // Afficher les résultats
        function renderResults() {
            const resultsContainer = document.getElementById('resultsContainer');
            resultsContainer.innerHTML = '';

            if (sessions.length === 0) {
                resultsContainer.innerHTML = `
                    <div class="alert alert-info text-center">
                        <i class="bi bi-info-circle me-2"></i>
                        Aucune session trouvée.
                    </div>
                `;
                return;
            }

            // Afficher chaque session
            sessions.forEach(session => {
                const musics = musicsBySession[session.id] || [];
                
                // Trier les musiques par nombre de votes décroissant
                const sortedMusics = [...musics].sort((a, b) => {
                    const votesA = votesByTrack[a.id] || 0;
                    const votesB = votesByTrack[b.id] || 0;
                    return votesB - votesA;
                });

                // Calculer les statistiques de la session
                const sessionVotes = sortedMusics.reduce((total, music) => total + (votesByTrack[music.id] || 0), 0);
                const sessionParticipants = new Set();
                sortedMusics.forEach(music => {
                    // Ici, nous n'avons pas directement les participants par musique
                    // Nous utiliserions les données de votes si disponibles
                });

                // Créer le conteneur de la session
                const sessionContainer = document.createElement('div');
                sessionContainer.className = 'results-container';
                sessionContainer.id = `session-${session.id}`;
                sessionContainer.innerHTML = `
                    <div class="session-header">
                        <h3 class="session-title">Session ${session.id} - ${session.subject}</h3>
                        <div class="session-stats">
                            <div class="stat-item">
                                <i class="bi bi-music-note-list stat-icon"></i>
                                <span>${musics.length} musiques</span>
                            </div>
                            <div class="stat-item">
                                <i class="bi bi-people stat-icon"></i>
                                <span>0 participants</span>
                            </div>
                            <div class="stat-item">
                                <i class="bi bi-hand-thumbs-up stat-icon"></i>
                                <span>${sessionVotes} votes</span>
                            </div>
                        </div>
                    </div>
                    <div class="ranking-list">
                        ${sortedMusics.length > 0 ? sortedMusics.map((music, index) => {
                            const votes = votesByTrack[music.id] || 0;
                            let medal = '';
                            let positionClass = '';
                            
                            if (index === 0) {
                                medal = '<i class="bi bi-award-fill medal medal-gold"></i>';
                                positionClass = 'medal-gold';
                            } else if (index === 1) {
                                medal = '<i class="bi bi-award-fill medal medal-silver"></i>';
                                positionClass = 'medal-silver';
                            } else if (index === 2) {
                                medal = '<i class="bi bi-award-fill medal medal-bronze"></i>';
                                positionClass = 'medal-bronze';
                            } else {
                                medal = `<div class="ranking-position">${index + 1}</div>`;
                            }
                            
                            return `
                                <div class="ranking-item">
                                    ${medal}
                                    ${index > 2 ? '' : `<div class="ranking-position">${index + 1}</div>`}
                                    <div class="music-info">
                                        <div class="music-title">${music.title}</div>
                                        <div class="music-artist">${music.artist}</div>
                                    </div>
                                    <div class="vote-count">
                                        <i class="bi bi-hand-thumbs-up-fill"></i>
                                        <span class="vote-badge">${votes} vote${votes > 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            `;
                        }).join('') : '<div class="alert alert-info">Aucune musique pour cette session.</div>'}
                    </div>
                `;
                
                resultsContainer.appendChild(sessionContainer);
            });

            // Mettre à jour les statistiques globales
            updateGlobalStats();

            // Mettre à jour le filtre
            updateSessionFilter();
        }

        // Mettre à jour le filtre de session
        function updateSessionFilter() {
            const sessionFilter = document.getElementById('sessionFilter');
            sessionFilter.innerHTML = '<option value="all">Toutes les sessions</option>';
            
            sessions.forEach(session => {
                const option = document.createElement('option');
                option.value = session.id;
                option.textContent = `Session ${session.id} - ${session.subject}`;
                sessionFilter.appendChild(option);
            });
        }

        // Filtrer les résultats par session
        function filterResults() {
            const selectedSession = document.getElementById('sessionFilter').value;
            const allSessions = document.querySelectorAll('.results-container');
            
            if (selectedSession === 'all') {
                // Afficher toutes les sessions
                allSessions.forEach(session => {
                    session.style.display = 'block';
                });
            } else {
                // Masquer toutes les sessions sauf celle sélectionnée
                allSessions.forEach(session => {
                    if (session.id === `session-${selectedSession}`) {
                        session.style.display = 'block';
                    } else {
                        session.style.display = 'none';
                    }
                });
            }
        }

        // Charger toutes les données
        async function loadAllData() {
            // Afficher l'overlay de chargement
            document.getElementById('loadingOverlay').style.display = 'flex';
            
            try {
                // Réinitialiser les données
                sessions = [];
                musicsBySession = {};
                votesByTrack = {};
                totalVotes = 0;
                totalMusics = 0;
                totalParticipants.clear();
                
                // Charger les sessions
                sessions = await loadSessions();
                
                // Pour chaque session, charger les musiques et les votes
                for (const session of sessions) {
                    const musics = await loadMusicsForSession(session.id);
                    musicsBySession[session.id] = musics;
                    
                    // Charger les votes pour cette session
                    const votes = await loadVotesForSession(session.id);
                    
                    // Compter les votes par musique
                    votes.forEach(vote => {
                        if (!votesByTrack[vote.trackId]) {
                            votesByTrack[vote.trackId] = 0;
                        }
                        votesByTrack[vote.trackId]++;
                        
                        // Ajouter le participant au set
                        if (vote.userId) {
                            totalParticipants.add(vote.userId);
                        }
                    });
                }
                
                // Afficher les résultats
                renderResults();
            } catch (error) {
                console.error('Erreur lors du chargement des données:', error);
                showToast('Erreur lors du chargement des données: ' + error.message, 'warning');
            } finally {
                // Masquer l'overlay de chargement
                document.getElementById('loadingOverlay').style.display = 'none';
            }
        }

        // Rafraîchir les résultats
        function refreshResults() {
            loadAllData();
        }

        // Initialisation
        document.addEventListener('DOMContentLoaded', function() {
            // Charger les données au démarrage
            loadAllData();
        });