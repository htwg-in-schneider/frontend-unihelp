<script setup>
import { tutors } from '../data.js';
import TutorCard from '../components/TutorCard.vue';
</script>

<template>
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
        <router-link to="/angebote" class="button-hero-yellow">Jetzt kostenlos starten</router-link>
        <a href="#steps" class="button-hero-yellow">Anmelden</a>
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
    <img src="../assets/for-students.jpg" alt="Studenten lernen und lachen" />
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
      <router-link to="/angebote" class="button-register-transparent">Jetzt Nachhilfe finden</router-link>
    </div>
  </section>

  <section id="for-tutors" class="img-text reverse alt-background">
    <img src="../assets/for-tutors.jpg" alt="Student erklärt anderem Studenten etwas im Code" />
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
      <router-link to="/angebote" class="button-register-transparent">Als Tutor starten</router-link>
    </div>
  </section>

  <section class="famous-tutors">
    <p class="section-label">Bekannte Tutoren</p>
    <h2 class="section-title">Diese Tutoren unterstützen Studenten</h2>

    <div class="tutors-grid">
      <TutorCard 
        v-for="tutor in tutors" 
        :key="tutor.id" 
        :tutor="tutor" 
      />
    </div>
  </section>

  <section class="cta-section">
    <h2>Bereit loszulegen?</h2>
    <p>Registriere dich kostenlos und finde noch heute die passende Nachhilfe oder werde selbst Tutor.</p>
    <br>
    <a href="#" class="button-register-white">Kostenlos registrieren</a>
  </section>
</template>
