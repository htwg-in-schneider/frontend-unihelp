<script setup>
import { ref, watchEffect } from 'vue';
import { tutors } from '../data.js';
import TutorCard from '../components/TutorCard.vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { useRouter } from 'vue-router';

const { loginWithRedirect, isAuthenticated } = useAuth0();
const router = useRouter();

const contact = ref({
  subject: '',
  body: ''
});

watchEffect(() => {
  if (isAuthenticated.value) {
    router.push('/dashboard');
  }
});

const handleLogin = () => {
  loginWithRedirect();
};

function sendMail() {
  const mailtoLink = `mailto:unihelp123@proton.me?subject=${encodeURIComponent(contact.value.subject)}&body=${encodeURIComponent(contact.value.body)}`;
  window.location.href = mailtoLink;
}
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
        <router-link to="/offers" class="button-hero-yellow">Jetzt kostenlos starten</router-link>
        <button type="button" @click="handleLogin" class="button-hero-yellow">Anmelden</button>
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
      <router-link to="/offers" class="button-register-transparent">Jetzt Nachhilfe finden</router-link>
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
      <router-link to="/offers" class="button-register-transparent">Als Tutor starten</router-link>
    </div>
  </section>

  <section class="famous-tutors">
    <p class="section-label">Bekannte Tutoren</p>
    <h2 class="section-title">Diese Tutoren unterstützen Studenten</h2>

    <div class="tutors-grid">
      <TutorCard v-for="tutor in tutors" :key="tutor.id" :tutor="tutor" />
    </div>
  </section>

  <section id="contact" class="contact-wrapper">
    <div class="container" style="max-width: 1000px;">
      <div class="row align-items-center">

        <div class="col-md-5 mb-4 mb-md-0 text-start pe-md-5">
          <p class="section-label mb-2">Kontakt</p>
          <h2 class="section-title fw-bold mb-3">Hast du Fragen?</h2>
          <p class="section-subtitle mb-4 text-muted" style="line-height: 1.6;">
            Egal ob es um die Registrierung, Probleme bei einer Buchung oder allgemeines Feedback geht – schreib uns
            einfach eine kurze Nachricht!
          </p>
          <div class="d-flex align-items-center gap-3">
            <div
              style="background-color: #e9ecef; width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
              ✉️
            </div>
            <span class="fw-bold text-dark">unihelp123@proton.me</span>
          </div>
        </div>

        <div class="col-md-7">
          <form @submit.prevent="sendMail" class="shadow-sm"
            style="background: white; padding: 35px; border-radius: 16px; border: 1px solid #e0dcd5;">
            <div style="margin-bottom: 20px; text-align: left;">
              <label style="font-weight: 600; margin-bottom: 8px; color: #424242; font-size: 14px;">Betreff</label>
              <input v-model="contact.subject" type="text" placeholder="z.B. Frage zur Registrierung" required
                style="padding: 12px 15px; border-radius: 8px; border: 1px solid #dcdcdc; width: 100%; outline: none; background-color: #fafafa;"
                onfocus="this.style.backgroundColor='#fff'; this.style.borderColor='#d4a218';"
                onblur="this.style.backgroundColor='#fafafa'; this.style.borderColor='#dcdcdc';" />
            </div>
            <div style="margin-bottom: 25px; text-align: left;">
              <label style="font-weight: 600; margin-bottom: 8px; color: #424242; font-size: 14px;">Deine
                Nachricht</label>
              <textarea v-model="contact.body" rows="4" placeholder="Wie können wir dir helfen?" required
                style="padding: 12px 15px; border-radius: 8px; border: 1px solid #dcdcdc; width: 100%; outline: none; resize: vertical; background-color: #fafafa;"
                onfocus="this.style.backgroundColor='#fff'; this.style.borderColor='#d4a218';"
                onblur="this.style.backgroundColor='#fafafa'; this.style.borderColor='#dcdcdc';"></textarea>
            </div>
            <button type="submit" class="button-hero-yellow"
              style="width: 100%; margin: 0; padding: 14px; border-radius: 8px;">Nachricht senden</button>
          </form>
        </div>

      </div>
    </div>
  </section>

  <section class="cta-section">
    <h2>Bereit loszulegen?</h2>
    <p>Registriere dich kostenlos und finde noch heute die passende Nachhilfe oder werde selbst Tutor.</p>
    <br>
    <button @click="handleLogin" class="button-register-white" style="border: none; cursor: pointer;">Kostenlos
      registrieren</button>
  </section>
</template>

<style scoped>
.contact-wrapper {
  padding: 80px 50px;
  background-color: #f7f3ed;
}

@media (max-width: 767px) {
  .contact-wrapper {
    padding: 40px 20px;
  }
}
</style>
