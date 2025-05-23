# Marvel Rivals - Character Database

Een webapplicatie voor het bekijken van Marvel karakters en teams (of beheren voor admins).

**[Bekijk de live applicatie op:](https://marvel-rivals-production.up.railway.app)**

# Wat doet deze applicatie?

- Marvel karakters bekijken met info
- Teams en hun leden bekijken
- Karakters zoeken en sorteren
- Login voor gebruikers en admin
- Admin mogelijkheden met het bewerken van informatie

# Installatie

# Vereisten
- Node.js
- MongoDB database Atlas

# Setup

1. Clone deze repository in bash:

git clone je-repo-url
cd marvel-rivals-app


2. Installeer dependencies

npm install

3. Maak een `.env` bestand aan en paste dit:

MONGODB_URI=je_mongodb_connection_string
SESSION_SECRET=geheime_sleutel_voor_sessies
NODE_ENV=development
PORT=3000

4. Start de applicatie

npm run dev

Ga naar `http://localhost:3000` en je wordt doorgestuurd naar de login pagina.

# registratie

Je moet een eigen account aanmaken via het registratieformulier.

# admin login

Naam: admin 
Wachtwoord: admin123

# Gebruikersmogelijkheden

Gewone gebruikers kunnen:
- Alle karakters en teams bekijken
- Data zoeken en filteren
- Team details bekijken

Administrators kunnen:
- Alles wat gewone gebruikers kunnen
- Karakter informatie bewerken
