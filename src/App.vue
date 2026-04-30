<script setup>
</script>

<template>
  <nav class="navbar navbar-expand-md px-4 py-3">
    <div class="container-fluid">
      <a class="navbar-brand fw-bold fs-4" href="#">UniHelp</a>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#unihelpMenu">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse justify-content-end" id="unihelpMenu">
        <ul class="navbar-nav align-items-center text-center">
          <li class="nav-item"><a class="nav-link" href="#steps">Ablauf</a></li>
          <li class="nav-item"><a class="nav-link" href="#for-students">Für Studenten</a></li>
          <li class="nav-item"><a class="nav-link" href="#for-tutors">Tutor werden</a></li>
          <li class="nav-item ms-md-3 mt-3 mt-md-0"><button class="nav-login">Anmelden</button></li>
          <li class="nav-item ms-md-2 mt-2 mt-md-0 mb-2 mb-md-0"><button class="nav-cta">Registrieren</button></li>
        </ul>
      </div>
    </div>
  </nav>

  <section class="hero">
    <div class="hero-content">
      <h1>Nachhilfe von Studenten, <br>für Studenten.</h1>
      <p class="hero-subheading">UniHelp verbindet Kommilitonen, die Unterstützung brauchen, mit denen, die ihr Wissen
        weitergeben wollen und das an deiner Hochschule.</p>

      <div class="search-bar">
        <input type="text" placeholder="Modul suchen, z.B. Webtechnologien" />
        <button class="search-button">Suchen</button>
      </div>

      <div class="hero-actions">
        <a href="#" class="button-primary">Jetzt kostenlos starten</a>
        <a href="#steps" class="button-transparent">Mehr erfahren</a>
      </div>
    </div>

    <div class="hero-right">
      <div class="hero-info-card">
        <h3>Warum UniHelp?</h3>
        <p>Alle Tutoren sind Studenten deiner Hochschule. Sie kennen die Prüfungen, die Professoren und den Stoff aus
          eigener Erfahrung.</p>
      </div>

      <div class="hero-stats">
        <div class="hero-stat">
          <div class="hero-stat-number">12.000+</div>
          <div class="hero-stat-content">aktive Tutoren</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-number">400+</div>
          <div class="hero-stat-content">Module</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-number">236.000+</div>
          <div class="hero-stat-content">Stunden gebucht</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-number">4,8 ★</div>
          <div class="hero-stat-content">Ø Bewertung</div>
        </div>
      </div>
    </div>
  </section>

  <section id="steps" class="section">
    <p class="section-label">Ablauf</p>
    <h2 class="section-title">In 4 Schritten zur Nachhilfe</h2>
    <p class="section-subtitle">Unkompliziert, schnell und direkt und das von der Suche bis zur gebuchten Stunde.</p>

    <div class="steps">
      <div class="step">
        <div class="step-number">01</div>
        <h3>Registrieren</h3>
        <p>Erstelle kostenlos ein Konto mit deiner Hochschul-E-Mail.</p>
      </div>
      <div class="step">
        <div class="step-number">02</div>
        <h3>Angebot finden</h3>
        <p>Durchsuche Angebote nach Hochschule, Studiengang, Modul und Preis.</p>
      </div>
      <div class="step">
        <div class="step-number">03</div>
        <h3>Termin buchen</h3>
        <p>Wähle Datum und Uhrzeit direkt auf der Plattform und schreibe dem Tutor optional eine Nachricht.</p>
      </div>
      <div class="step">
        <div class="step-number">04</div>
        <h3>Lernen & zahlen</h3>
        <p>Nach der Stunde zahlst du bequem per PayPal oder BitCoin.</p>
      </div>
    </div>
  </section>

  <section id="for-students" class="img-text">
    <img src="./assets/for-students.jpg" alt="Studenten lernen und lachen" />
    <div class="img-text-content">
      <p class="section-label">Für Studenten</p>
      <h2>Finde die passende Nachhilfe für dein Modul</h2>
      <p>Du kämpfst dich durch Datenbanken 1 oder Software Engineering und das Lehrangebot allein reicht nicht? Auf
        UniHelp findest du Kommilitonen, die genau das Fach kennen, in dem du Unterstützung brauchst.</p>
      <ul class="checklist">
        <li>Nach Studiengang, Modul, Preis und Sprache filtern</li>
        <li>Bewertungen anderer Studenten lesen</li>
        <li>Termin und Nachricht direkt an den Tutor</li>
        <li>Sicher und einfach bezahlen</li>
      </ul>
      <a href="#" class="button-register-transparent">Jetzt Nachhilfe finden</a>
    </div>
  </section>

  <section id="for-tutors" class="img-text reverse alt-background">
    <img src="./assets/for-tutors.jpg" alt="Student erklärt anderem Studenten etwas im Code" />
    <div class="img-text-content">
      <p class="section-label">Tutor werden</p>
      <h2>Gib dein Wissen weiter und verdiene dabei Geld</h2>
      <p>Du bist fit in deinem Fach und möchtest anderen Studenten helfen? Als Tutor auf UniHelp erstellst du eigene
        Angebote, legst deinen Preis fest und bestimmst selbst, wann du verfügbar bist.</p>
      <ul class="checklist">
        <li>Eigenes Angebot in wenigen Minuten erstellen</li>
        <li>Zeiten und Preis selbst festlegen</li>
        <li>Nebeneinkommen durch Hilfe verdienen</li>
        <li>Bewertungen sammeln und Profil aufbauen</li>
      </ul>
      <a href="#" class="button-register-transparent">Als Tutor starten</a>
    </div>
  </section>

  <section class="famous-tutors">
    <p class="section-label">Bekannte Tutoren</p>
    <h2 class="section-title">Diese Tutoren unterstützen Studenten</h2>

    <div class="tutors-grid">
      <div class="tutor-card">
        <img src="./assets/natascha-l-tutor.jpg" alt="Natascha" />
        <div class="tutor-card-body">
          <p class="subject">Datenbank- und Informationssysteme 1</p>
          <h4>Natascha L.</h4>
          <p class="rating">★★★★★ (62 Bew.)</p>
          <p class="price-tag">ab 15 €/Std.</p>
        </div>
      </div>

      <div class="tutor-card">
        <img src="./assets/markus-f-tutor.jpg" alt="Markus" />
        <div class="tutor-card-body">
          <p class="subject">Mathematik für Wirtschaftsinformatik 1 & 2</p>
          <h4>Markus F.</h4>
          <p class="rating">★★★★★ (50 Bew.)</p>
          <p class="price-tag">ab 12 €/Std.</p>
        </div>
      </div>

      <div class="tutor-card">
        <img src="./assets/lena-k-tutor.jpg" alt="Lena" />
        <div class="tutor-card-body">
          <p class="subject">BWL & Statistik</p>
          <h4>Lena K.</h4>
          <p class="rating">★★★★☆ (29 Bew.)</p>
          <p class="price-tag">ab 10 €/Std.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="cta-section">
    <h2>Bereit loszulegen?</h2>
    <p>Registriere dich kostenlos und finde noch heute die passende Nachhilfe oder werde selbst Tutor.</p>
    <br>
    <a href="#" class="button-register-white">Kostenlos registrieren</a>
  </section>

  <footer>
    <div class="footer-logo">UniHelp 2026</div>
    <div>
      <a href="#">Impressum</a>
      <a href="#">Datenschutz</a>
      <a href="#">Kontakt</a>
    </div>
  </footer>
</template>

<style scoped>
</style>
