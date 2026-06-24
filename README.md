# UniHelp Frontend

Vue-3-Frontend für UniHelp – eine Plattform, auf der Studierende einer Hochschule Nachhilfeangebote für ihre Lehrveranstaltungen anbieten, suchen und buchen können.

## Technologien

- Vue 3 (`^3.5.32`)
- Vite (`^8.0.8`)
- Vue Router (`^5.0.6`)
- Pinia (`^3.0.4`) 
- Auth0 (`@auth0/auth0-vue ^2.7.0`)
- Bootstrap für das Layout
- Node.js `^20.19.0` oder `>=22.12.0`

## Funktionen

- Anmeldung und Registrierung über Auth0
- Nachhilfeangebote suchen, filtern (Format, Freitext) und ansehen
- Angebote erstellen, bearbeiten und löschen (als Tutor)
- Termine buchen, bezahlen und bewerten
- Buchungen verwalten (als Student und als Tutor)
- Private Nachrichten zwischen Nutzern inkl. Ungelesen-Anzeige
- Profil verwalten und Konto löschen
- Angebote und Nutzer melden
- Moderations-Terminal für Moderatoren und Admins (Sperren, Löschen, Rollen, Bewertungen)
- Responsives Design mit mobiler Navigation

## Voraussetzungen

- Node.js `^20.19.0` oder `>=22.12.0`
- npm
- Ein laufendes [UniHelp-Backend](https://github.com/htwg-in-schneider/backend-unihelp)

## Installation

```sh
npm install
```

## Konfiguration

Lege eine Datei `.env` im Projektverzeichnis an und setze die folgenden Variablen:

```env
VITE_API_BASE_URL=https://backend-unihelp.onrender.com
VITE_AUTH0_DOMAIN=deine-domain.eu.auth0.com
VITE_AUTH0_CLIENT_ID=dein-client-id
VITE_AUTH0_AUDIENCE=https://unihelp.api
```

`VITE_API_BASE_URL` zeigt auf das Backend (lokal z. B. `http://localhost:8081`). Die `VITE_AUTH0_*`-Werte stammen aus der Auth0-Anwendung.

## Entwicklung starten

```sh
npm run dev
```

Die Anwendung läuft anschließend unter `http://localhost:5173`.

## Build und Vorschau

```sh
npm run build
npm run preview
```

Der Build erzeugt das Verzeichnis `dist/` und kopiert die `index.html` zusätzlich als `404.html` (für das SPA-Routing auf GitHub Pages).

## Projektstruktur

```text
src/
├── assets/         # Statische Dateien und globale Styles
├── components/     # Wiederverwendbare Komponenten (Navbar, Footer, OfferCard, ...)
├── composables/    # Composables (useFormats, useToast)
├── router/         # Routen-Definition inkl. authGuard
├── stores/         # Pinia-Stores
├── views/          # Seiten-Komponenten (eine pro Route)
├── App.vue         # Wurzel-Layout
└── main.js         # Einstiegspunkt, Auth0- und Router-Konfiguration
```

## Wichtige Routen

| Pfad | Beschreibung 
|------|--------------
| `/` | Startseite 
| `/offers` | Angebotssuche mit Filtern 
| `/offer/:id` | Angebotsdetails 
| `/offer/new` | Angebot erstellen 
| `/offer/edit/:id` | Angebot bearbeiten 
| `/dashboard` | Übersicht (Termine, eigene Angebote) 
| `/bookings` | Buchungen verwalten 
| `/payment/:id` | Nachhilfestunde bezahlen 
| `/rate/:id` | Angebot bewerten 
| `/messages` | Postfach 
| `/chat/:id` | Chatverlauf 
| `/profile` | Eigenes Profil verwalten 
| `/user/:id` | Fremdes Profil 
| `/moderation` | Moderations-Terminal 
| `/imprint`, `/privacy` | Impressum, Datenschutz 

## Backend-Anbindung

Das Frontend kommuniziert per REST mit dem Backend unter `VITE_API_BASE_URL`. Geschützte Endpunkte werden mit einem Auth0-JWT im `Authorization`-Header (`Bearer <token>`) aufgerufen. Der Token wird über `getAccessTokenSilently()` aus `@auth0/auth0-vue` bezogen.

## Links

- Live-Frontend: <https://htwg-in-schneider.github.io/frontend-unihelp/>
- Backend-Repository: <https://github.com/htwg-in-schneider/backend-unihelp>
