import React, { useMemo, useState } from "react";
import "./Realizations.scss";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";


const SERVICES_PL = [
  {
    id: "domy",
    tag: "Budownictwo",
    title: "Domy jednorodzinne",
    subtitle: "Realizacja od fundamentów po odbiór",
    imageUrl:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80",
    summary:
      "Budowa etapowa z harmonogramem, kontrolą jakości i jasnym raportowaniem postępu. Minimalizujemy ryzyka i poprawki na końcu.",
    moreLead:
      "Jak pracujemy: proces jest podzielony na etapy z odbiorami częściowymi. Masz kontrolę kosztu, terminu i jakości.",
    highlights: ["Harmonogram i raporty", "Kontrola jakości", "Nadzór i BHP"],
    meta: { time: "12–24 mies.", warranty: "Gwarancja", docs: "Dokumentacja" },
    steps: [
      { h: "1) Analiza", p: "Zakres, budżet, działka, ryzyka." },
      { h: "2) Projekt", p: "Adaptacja, uzgodnienia, formalności." },
      { h: "3) Budowa", p: "Stan surowy + odbiory częściowe." },
      { h: "4) Odbiór", p: "Instalacje, wykończenie, protokoły." },
    ],
  },
  {
    id: "wielorodzinne",
    tag: "Inwestycje",
    title: "Budynki wielorodzinne",
    subtitle: "Koordynacja, jakość i terminowość",
    imageUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
    summary:
      "Planowanie, logistyka i koordynacja ekip. Transparentna dokumentacja i odbiory etapowe.",
    moreLead:
      "Dla deweloperów: raportowanie, kontrola jakości oraz minimalizacja ryzyka opóźnień dzięki planowaniu i koordynacji.",
    highlights: ["Koordynacja ekip", "Odbiory częściowe", "Raportowanie postępu"],
    meta: { time: "Zależnie od skali", warranty: "Serwis", docs: "Teczka inwestycji" },
    steps: [
      { h: "1) Plan", p: "Harmonogram, BHP, logistyka." },
      { h: "2) Konstrukcja", p: "Realizacja + kontrola jakości." },
      { h: "3) Instalacje", p: "Branże + części wspólne." },
      { h: "4) Przekazanie", p: "Pomiary, protokoły, dokumenty." },
    ],
  },
  {
    id: "wnetrza",
    tag: "Wykończenia",
    title: "Wnętrza pod klucz",
    subtitle: "Standard premium bez niespodzianek",
    imageUrl:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
    summary:
      "Wykończenia na checklistach jakości: detale, standard i jasny zakres. Ustalony koszt, termin i odbiór.",
    moreLead:
      "Jak wygląda proces: od inwentaryzacji i kosztorysu po montaż, kontrolę jakości i przekazanie gotowego wnętrza.",
    highlights: ["Checklisty jakości", "Materiały i logistyka", "Odbiór końcowy"],
    meta: { time: "6–12 tyg.", warranty: "Gwarancja", docs: "Specyfikacje" },
    steps: [
      { h: "1) Kosztorys", p: "Pomiary, zakres, standard." },
      { h: "2) Przygotowanie", p: "GK, wyrównania, bazy." },
      { h: "3) Montaż", p: "Podłogi, płytki, oświetlenie." },
      { h: "4) Odbiór", p: "Poprawki, protokół." },
    ],
  },
  {
    id: "remonty",
    tag: "Modernizacja",
    title: "Remonty i przebudowy",
    subtitle: "Zmiana układu, wzmocnienia, odświeżenia",
    imageUrl:
      "https://images.unsplash.com/photo-1581579184683-0f0b8a9c3b2f?auto=format&fit=crop&w=1600&q=80",
    summary:
      "Prace etapowe z zabezpieczeniem stref i minimalizacją przestojów. Kontrola jakości i szybkie odbiory.",
    moreLead:
      "W obiektach użytkowanych dzielimy prace na strefy, zapewniamy zabezpieczenia i stałą komunikację z inwestorem.",
    highlights: ["Prace etapowe", "Zabezpieczenia", "Szybkie odbiory"],
    meta: { time: "2–10 tyg.", warranty: "Gwarancja", docs: "Protokoły" },
    steps: [
      { h: "1) Audyt", p: "Diagnoza, warianty, koszt." },
      { h: "2) Demontaże", p: "Zabezpieczenie i przygot." },
      { h: "3) Roboty", p: "Budowlane + instalacje." },
      { h: "4) Odbiór", p: "Checklisty i protokół." },
    ],
  },
  {
    id: "elewacje",
    tag: "Energia",
    title: "Elewacje i termomodernizacja",
    subtitle: "Efektywność + estetyka budynku",
    imageUrl:
      "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=1600&q=80",
    summary:
      "Dobór systemu pod warunki, nacisk na detale i trwałość: obróbki, dylatacje, poprawne połączenia.",
    moreLead:
      "Skupiamy się na trwałości: przygotowanie podłoża, prawidłowe detale przy oknach i kontrola szczelności.",
    highlights: ["Diagnostyka podłoża", "Detale i obróbki", "Kontrola szczelności"],
    meta: { time: "2–6 tyg.", warranty: "Gwarancja", docs: "Karta materiałów" },
    steps: [
      { h: "1) Ocena", p: "Podłoże i dobór tech." },
      { h: "2) Przygot.", p: "Naprawy i zabezp." },
      { h: "3) Montaż", p: "Ocieplenie + tynk." },
      { h: "4) Odbiór", p: "Kontrola detali." },
    ],
  },
  {
    id: "teren",
    tag: "Otoczenie",
    title: "Zagospodarowanie terenu",
    subtitle: "Podjazdy, tarasy, odwodnienia, ogrodzenia",
    imageUrl:
      "https://images.unsplash.com/photo-1598257008403-3d9c00f9e9b7?auto=format&fit=crop&w=1600&q=80",
    summary:
      "Spadki, odwodnienia, podbudowy i nawierzchnie. Etap, który często decyduje o komforcie i trwałości.",
    moreLead:
      "Robimy komplet „na zewnątrz”: prawidłowe spadki, odwodnienia i solidne podbudowy, żeby po zimie nie było niespodzianek.",
    highlights: ["Spadki i odwodnienia", "Podbudowy", "Trwałe nawierzchnie"],
    meta: { time: "1–4 tyg.", warranty: "Serwis", docs: "Dokumentacja" },
    steps: [
      { h: "1) Układ", p: "Plan spadków." },
      { h: "2) Ziemne", p: "Stabilizacja." },
      { h: "3) Wyk.", p: "Nawierzchnie." },
      { h: "4) Odbiór", p: "Kontrola." },
    ],
  },
];

export default function ServicesCards() {
  const items = useMemo(() => SERVICES_PL, []);
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section className="svc" aria-label="Usługi budowlane" id="services">
      <div className="svc__container">
        <header className="svc__header">
          <p className="svc__eyebrow">Usługi</p>
          <h2 className="svc__title">Kompleksowe usługi budowlane klasy premium</h2>
          <p className="svc__lead">
            Realizujemy inwestycje od koncepcji po odbiór końcowy. Zapewniamy pełną koordynację prac, kontrolę kosztów oraz najwyższe standardy wykonania.
          </p>
        </header>
        {/* Desktop version */}
        <div className="svc__grid" role="list">
          {items.map((item) => (
            <ServiceFlipCard
              key={item.id}
              item={item}
              open={openId === item.id}
              onToggle={() => toggle(item.id)}
            />
          ))}
        </div>
        {/* Mobile version */}
        <div
          className="svc__slider"
          style={{ "--svc-progress": "#00E5FF" }}
        >
          <Swiper
            modules={[Pagination]}
            slidesPerView={1.1}
            spaceBetween={12}

          >
            {items.map((item) => (
              <SwiperSlide key={item.id}>
                <ServiceFlipCard
                  item={item}
                  open={openId === item.id}
                  onToggle={() => toggle(item.id)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

      </div>
    </section>
  );
}

function ServiceFlipCard({ item, open, onToggle }) {
  return (
    <article className="svc-card" role="listitem">
      <div className="svc-card__flip" data-open={open ? "true" : "false"}>
        <div className={`svc-card__flipInner ${open ? "svc-card__flipInner--flipped" : ""}`}>
          <div className="svc-card__face svc-card__face--front">
            <div className="svc-card__media">
              <img className="svc-card__img" src={item.imageUrl} alt={item.title} />
              <div className="svc-card__tag">{item.tag}</div>
            </div>

            <div className="svc-card__content">
              <div className="svc-card__head">
                <h3 className="svc-card__title">{item.title}</h3>
                <p className="svc-card__subtitle">{item.subtitle}</p>
              </div>

              <p className="svc-card__summary">{item.summary}</p>

              <ul className="svc-card__highlights" aria-label="Najważniejsze punkty">
                {item.highlights.map((h, i) => (
                  <li key={i} className="svc-card__highlight">
                    {h}
                  </li>
                ))}
              </ul>

              <div className="svc-card__meta" aria-label="Parametry usługi">
                <div className="svc-card__metaItem">
                  <span className="svc-card__metaLabel">Czas</span>
                  <span className="svc-card__metaValue">{item.meta.time}</span>
                </div>
                <div className="svc-card__metaItem">
                  <span className="svc-card__metaLabel">Wsparcie</span>
                  <span className="svc-card__metaValue">{item.meta.warranty}</span>
                </div>
                <div className="svc-card__metaItem">
                  <span className="svc-card__metaLabel">Dok.</span>
                  <span className="svc-card__metaValue">{item.meta.docs}</span>
                </div>
              </div>

              <div className="svc-card__actions">
                <button type="button" className="svc-card__toggle" onClick={onToggle}>
                  {open ? "Pokaż mniej" : "Pokaż więcej"}
                </button>
              </div>
            </div>
          </div>

          <div className="svc-card__face svc-card__face--back" aria-label={`Szczegóły: ${item.title}`}>
            <div className="svc-card__backTop">
              <div className="svc-card__backKicker">Szczegóły usługi</div>
              <div className="svc-card__backTitle">{item.title}</div>
              <p className="svc-card__backLead">{item.moreLead}</p>
            </div>

            <ol className="svc-card__steps">
              {item.steps.map((s, i) => (
                <li key={i} className="svc-card__step">
                  <div className="svc-card__stepTitle">{s.h}</div>
                  <div className="svc-card__stepText">{s.p}</div>
                </li>
              ))}
            </ol>

            <div className="svc-card__actions svc-card__actions--back">
              <button type="button" className="svc-card__toggle" onClick={onToggle}>
                {open ? "Pokaż mniej" : "Pokaż więcej"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
