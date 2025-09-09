# Dockerfile minimal pour Node.js + Prisma
FROM node:20-slim

# Définir le répertoire de travail
WORKDIR /app

# Installer les paquets système nécessaires pour certaines dépendances Node
RUN apt-get update && apt-get install -y python3 g++ make && rm -rf /var/lib/apt/lists/*

# Copier uniquement les fichiers nécessaires pour installer les dépendances
COPY package.json package-lock.json* ./

# Installer les dépendances
RUN npm install

# Copier tout le reste du code
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Exposer le port de l'API
EXPOSE 3000

# Lancer l'application
CMD ["node", "src/app.js"]
