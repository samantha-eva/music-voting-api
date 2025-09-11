# 🎶 Music Voting API  

API monolithique permettant aux étudiants de voter pour des morceaux de musique en fonction de leur emploi du temps.  
Le projet utilise **Node.js**, **Express**, **Prisma**, et une base de données **PostgreSQL** (via Docker).  

---

## 🚀 Fonctionnalités
- Scraping automatique des sessions de cours depuis Hyperplanning.  
- Authentification par email (tokens).  
- Gestion des utilisateurs, sessions, morceaux et votes.  
- Tâche cron pour mettre à jour régulièrement les données.  
- Envoi d’emails de notification.  

---

## 📦 Prérequis
- **Git** installé  
- **Docker** & **Docker Compose** installés  
- (Optionnel) **Node.js ≥ 18** et **npm ≥ 9** si vous voulez lancer l’API hors Docker  

---

## 🛠️ Installation

1. **Cloner le projet via SSH :**  
```bash
git clone git@github.com:samantha-eva/music-voting-api.git
cd music-voting-api
```

---

## Configurer les variables d’environnement

```cp .env``

## docker compose up -d --build

```
docker compose up -d --build
```
---

## Appliquer les migrations Prisma (appliquer ton schema à la BDD)
```
docker compose exec api npx prisma migrate dev --name init

```

---
## Appliquer le  seed
```
docker compose exec api node prisma/seed.js

```

---
## Executer le script de  test de scrapping
```
docker exec -it name_container node testScraping.js

```

---
## Voir la base de données
```
docker compose exec db psql -U postgres -d name_database

```