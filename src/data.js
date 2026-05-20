import nataschaImg from './assets/natascha-l-tutor.jpg';
import markusImg from './assets/markus-f-tutor.jpg';
import lenaImg from './assets/lena-k-tutor.jpg';

export const offers = [
  {
    id: 1,
    university: "HTWG Konstanz",
    course: "Wirtschaftsinformatik",
    module: "Datenbank- und Informationssysteme 1",
    price: 15,
    description: "Ich helfe dir gerne bei SQL und Datenbankentwürfen. :)",
    availableTimes: "Sa, So 10:00 - 12:00",
    format: "Online & Präsenz",
    language: "Deutsch"
  },
  {
    id: 2,
    university: "HTWG Konstanz",
    course: "Wirtschaftsinformatik",
    module: "Mathematik für Wirtschaftsinformatik 1 & 2",
    price: 12,
    description: "Mathe ist gar nicht so schwer, wir werden alle Altklausuren durchrechnen.",
    availableTimes: "Mo, Mi 18:00 - 20:00",
    format: "Präsenz & Online",
    language: "Deutsch"
  },
  {
    id: 3,
    university: "HTWG Konstanz",
    course: "Wirtschaftsinformatik",
    module: "Statistik",
    price: 10,
    description: "Glaube nie einer Statistik, die du nicht selbst gefälscht hast. Ich zeige dir, wie du die Klausur bestehst.",
    availableTimes: "Fr 14:00 - 18:00",
    format: "Präsenz",
    language: "Deutsch"
  }
];

export const tutors = [
  {
    id: 1,
    name: "Natascha L.",
    subject: "Wirtschaftsinformatik",
    rating: "4.9 (12 Bewertungen)",
    price: "15",
    image: nataschaImg 
  },
  {
    id: 2,
    name: "Markus F.",
    subject: "Mathematik",
    rating: "4.8 (24 Bewertungen)",
    price: "12",
    image: markusImg 
  },
  {
    id: 3,
    name: "Lena K.",
    subject: "Statistik",
    rating: "4.7 (18 Bewertungen)",
    price: "10",
    image: lenaImg 
  }
];
