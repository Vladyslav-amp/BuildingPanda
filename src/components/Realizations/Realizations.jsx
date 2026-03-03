import React, {
  useMemo,
  useState,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import "./Realizations.scss";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import realizations1 from "../../assets/realizations/real1.webp";
import realizations2 from "../../assets/realizations/real2.webp";
import realizations3 from "../../assets/realizations/real3.webp";
import realizations4 from "../../assets/realizations/real4.webp";
import realizations5 from "../../assets/realizations/real5.webp";
import realizations6 from "../../assets/realizations/real6.webp";

const SERVICES_PL = [
  {
    id: "domy",
    tag: "Budownictwo",
    title: "Domy jednorodzinne",
    subtitle: "Realizacja od fundamentów po odbiór",
    imageUrl: realizations1,
    summary:
      "Budowa etapowa z harmonogramem, kontrolą jakości i jasnym raportowaniem postępu. Minimalizujemy ryzyka i poprawki na końcu.",
    moreLead:
      "Jak pracujemy: proces jest podzielony na etapy z odbiorami częściowymi. Masz kontrolę kosztu, terminu i jakości.",
    highlights: [
      "Kontrola jakości",
      "Nadzór i BHP",
      "Kosztorys i budżet",
      "Odbiory etapowe",
      "Harmonogram i raporty",
    ],
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
    imageUrl: realizations2,
    summary:
      "Planowanie, logistyka i koordynacja ekip. Transparentna dokumentacja i odbiory etapowe.",
    moreLead:
      "Dla deweloperów: raportowanie, kontrola jakości oraz minimalizacja ryzyka opóźnień dzięki planowaniu i koordynacji.",
    highlights: [
      "Koordynacja ekip",
      "Odbiory częściowe",
      "Logistyka dostaw",
      "Kontrola terminów",
      "Raportowanie postępu",
    ],
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
    imageUrl: realizations3,
    summary:
      "Wykończenia na checklistach jakości: detale, standard i jasny zakres. Ustalony koszt, termin i odbiór.",
    moreLead:
      "Jak wygląda proces: od inwentaryzacji i kosztorysu po montaż, kontrolę jakości i przekazanie gotowego wnętrza.",
    highlights: [
      "Checklisty jakości",
      "Materiały i logistyka",
      "Odbiór końcowy",
      "Ustalony zakres prac",
      "Stały nadzór wykonawczy",
    ],
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
    imageUrl: realizations4,
    summary:
      "Prace etapowe z zabezpieczeniem stref i minimalizacją przestojów. Kontrola jakości i szybkie odbiory.",
    moreLead:
      "W obiektach użytkowanych dzielimy prace na strefy, zapewniamy zabezpieczenia i stałą komunikację z inwestorem.",
    highlights: [
      "Prace etapowe",
      "Zabezpieczenia",
      "Szybkie odbiory",
      "Koordynacja branż",
      "Minimalizacja przestojów",
    ],
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
    imageUrl: realizations5,
    summary:
      "Dobór systemu pod warunki, nacisk na detale i trwałość: obróbki, dylatacje, poprawne połączenia.",
    moreLead:
      "Skupiamy się na trwałości: przygotowanie podłoża, prawidłowe detale przy oknach i kontrola szczelności.",
    highlights: [
      "Diagnostyka podłoża",
      "Detale i obróbki",
      "Kontrola szczelności",
      "Trwałe wykończenie",
      "Dobór systemu ociepleń",
    ],
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
    imageUrl: realizations6,
    summary:
      "Spadki, odwodnienia, podbudowy i nawierzchnie. Etap, który często decyduje o komforcie i trwałości.",
    moreLead:
      "Robimy komplet „na zewnątrz”: prawidłowe spadki, odwodnienia i solidne podbudowy, żeby po zimie nie było niespodzianek.",
    highlights: [
      "Podbudowy",
      "Trwałe nawierzchnie",
      "Spadki i odwodnienia",
      "Krawężniki i obrzeża",
      "Przygotowanie pod ogrodzenie",
    ],
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

  const scrollToContact = useCallback(() => {
    const el = document.querySelector("#contact");
    if (!el) return;

    const headerOffset = 80;
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }, []);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section className="svc" aria-label="Usługi budowlane" id="services">
      <div className="svc__container">
        <header className="svc__header">
          <p className="svc__eyebrow">Usługi</p>
          <h2 className="svc__title">Kompleksowe usługi budowlane klasy premium</h2>
          <p className="svc__lead">
            Realizujemy inwestycje od koncepcji po odbiór końcowy. Zapewniamy pełną
            koordynację prac, kontrolę kosztów oraz najwyższe standardy wykonania.
          </p>
        </header>

        {/* Desktop */}
        <div className="svc__grid" role="list">
          {items.map((item) => (
            <ServiceFlipCard
              key={item.id}
              item={item}
              open={openId === item.id}
              onToggle={() => toggle(item.id)}
              onOrder={scrollToContact}
            />
          ))}
        </div>

        {/* Mobile */}
        <div className="svc__slider" style={{ "--svc-progress": "#00E5FF" }}>
          <Swiper slidesPerView={1.1} spaceBetween={12}>
            {items.map((item) => (
              <SwiperSlide key={item.id}>
                <ServiceFlipCard
                  item={item}
                  open={openId === item.id}
                  onToggle={() => toggle(item.id)}
                  onOrder={scrollToContact}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}

function ServiceFlipCard({ item, open, onToggle, onOrder }) {
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const [cardHeight, setCardHeight] = useState(null);

  const measure = useCallback(() => {
    const frontEl = frontRef.current;
    const backEl = backRef.current;
    if (!frontEl || !backEl) return;

    const frontH = frontEl.scrollHeight;
    const backH = backEl.scrollHeight;

    const next = Math.max(frontH, backH) + 2;
    setCardHeight(next);
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, open, item]);

  useLayoutEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  return (
    <article
      className="svc-card"
      role="listitem"
      style={cardHeight ? { height: cardHeight } : undefined}
    >
      <div className="svc-card__flip" style={cardHeight ? { height: cardHeight } : undefined}>
        <div className={`svc-card__flipInner ${open ? "svc-card__flipInner--flipped" : ""}`}>
          {/* FRONT */}
          <div ref={frontRef} className="svc-card__face svc-card__face--front">
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

              <ul className="svc-card__checks" aria-label="Najważniejsze punkty">
                {item.highlights.map((h, i) => (
                  <li key={i} className="svc-card__check">
                    {h}
                  </li>
                ))}
              </ul>

              <div className="svc-card__actions svc-card__actions--row">
                <button
                  type="button"
                  className="svc-card__order svc-card__order--primary"
                  onClick={onOrder}
                >
                  Zamów usługę
                </button>

                <button type="button" className="svc-card__toggle" onClick={onToggle}>
                  {open ? "Zamknij" : "Szczegóły"}
                </button>
              </div>
            </div>
          </div>

          {/* BACK */}
          <div
            ref={backRef}
            className="svc-card__face svc-card__face--back"
            aria-label={`Szczegóły: ${item.title}`}
          >
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

            <div className="svc-card__actions svc-card__actions--row">
              <button
                type="button"
                className="svc-card__order svc-card__order--primary"
                onClick={onOrder}
              >
                Zamów usługę
              </button>

              <button type="button" className="svc-card__toggle" onClick={onToggle}>
                {open ? "Zamknij" : "Szczegóły"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}