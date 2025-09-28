document.addEventListener('DOMContentLoaded', function() {
  
        const loginForm = document.getElementById('loginForm');
        const loginBtn = document.getElementById('loginBtn');
        const emailInput = document.getElementById('email');
        const message = document.getElementById('message');
        const messageIcon = message.querySelector('.message-icon');
        const messageText = message.querySelector('.message-text');
            
        // Fonction pour afficher les messages
        function showMessage(text, type) {
            messageText.textContent = text;
            message.className = 'message ' + type;
            
            // Définir l'icône en fonction du type
            if (type === 'success') {
                messageIcon.className = 'message-icon fas fa-check-circle';
            } else if (type === 'error') {
                messageIcon.className = 'message-icon fas fa-exclamation-circle';
            }
            
            // Afficher le message
            message.classList.add('show');
            
            // Masquer le message après 8 secondes
            setTimeout(() => {
                message.classList.remove('show');
            }, 8000);
        }
        
        // Validation de l'email
        function validateEmail(email) {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }
        
        // Soumission du formulaire
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Masquer tout message précédent
            message.classList.remove('show');
            
            const email = emailInput.value.trim();
            
            if (!email) {
                showMessage("Veuillez saisir votre adresse e-mail", "error");
                return;
            }
            
            if (!validateEmail(email)) {
                showMessage("Veuillez saisir une adresse e-mail valide", "error");
                return;
            }
            
            // Simuler l'envoi du formulaire
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<span class="loader"></span> Envoi en cours...';
            
            try {
                const response = await fetch("http://localhost:3000/api/auth/request-login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });
                
                // Rétablir le bouton
                loginBtn.disabled = false;
                loginBtn.textContent = 'Recevoir le lien de connexion';
                
                if (response.ok) {
                    // Succès
                    showMessage(`Un lien de connexion a été envoyé à ${email}. Vérifiez votre boîte de réception.`, "success");
                    
                    // Réinitialiser le formulaire
                    emailInput.value = '';
                } else {
                    // Erreur serveur
                    const errorData = await response.json();
                    const errorMessage = errorData.message || "Une erreur s'est produite lors de l'envoi du lien.";
                    showMessage(errorMessage, "error");
                }
            } catch (error) {
                // Erreur réseau ou autre
                loginBtn.disabled = false;
                loginBtn.textContent = 'Recevoir le lien de connexion';
                
                console.error("Erreur lors de la requête:", error);
                showMessage("Impossible de se connecter au serveur. Veuillez vérifier votre connexion Internet.", "error");
            }
        });  
        
      
  });