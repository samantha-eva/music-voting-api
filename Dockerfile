# Dockerfile Node.js + Prisma + Puppeteer
FROM node:20-slim

# Définir le répertoire de travail
WORKDIR /app

# Installer les paquets système nécessaires pour Puppeteer et Node
RUN apt-get update && apt-get install -y \
    python3 g++ make curl unzip \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libx11-xcb1 \
    libxcomposite1 libxdamage1 libxrandr2 libgbm1 libasound2 libpangocairo-1.0-0 \
    libxshmfence1 libxrender1 libxext6 libxfixes3 fonts-liberation \
    libxkbcommon0 \
    && rm -rf /var/lib/apt/lists/*

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer toutes les dépendances Node
RUN npm install

# Copier le reste du code
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Exposer le port de l'API
EXPOSE 3000

# Lancer l'application
CMD ["node", "src/app.js"]
