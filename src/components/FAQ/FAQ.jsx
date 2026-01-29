import React, { useId, useMemo, useRef, useState, useLayoutEffect } from "react";
import "./FAQ.scss";

const HEADER_OFFSET = 80;
const ANIM_MS = 620;

const PlusIcon = ({ open }) => (
  <svg
    className={`faq__plus ${open ? "faq__plus--open" : ""}`}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      d="M12 5v14M5 12h14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

function smartNudgeIntoView(el) {
  if (!el) return;

  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || 0;

  if (r.top < HEADER_OFFSET) {
    const targetTop = window.scrollY + r.top - HEADER_OFFSET - 8;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: "auto" });
    return;
  }

  if (r.bottom > vh) {
    const deltaDown = r.bottom - vh + 12;
    const targetTop = window.scrollY + deltaDown;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: "auto" });
  }
}

export default function Faq() {
  const baseId = useId();

  const [openIndex, setOpenIndex] = useState(-1);

  const itemRefs = useRef([]);

  const userOpenedRef = useRef(false);

  const items = useMemo(
    () => [
      {
        q: "Ile trwa wycena i kiedy dostanę kosztorys?",
        a: "Wstępną wycenę przygotowujemy po rozmowie i podstawowych danych. Dokładny kosztorys powstaje po pomiarach i ustaleniu zakresu — najczęściej w ciągu 24–72 godzin.",
      },
      {
        q: "Czy podpisujemy umowę i jak wygląda rozliczenie?",
        a: "Tak. Pracujemy na umowie z jasnym zakresem, harmonogramem i warunkami gwarancji. Rozliczenie realizujemy etapami, zgodnie z postępem prac i protokołami.",
      },
      {
        q: "Czy pomagacie w doborze materiałów i zakupach?",
        a: "Tak. Doradzamy materiały w zależności od budżetu i standardu, organizujemy logistykę i dostawy. Możemy pracować na materiałach inwestora lub po naszej stronie — zgodnie z ustaleniami.",
      },
      {
        q: "Kto nadzoruje ekipę i jak wygląda komunikacja?",
        a: "Każdy projekt ma osobę prowadzącą (kierownika/nadzór). Ustalamy stały kanał kontaktu, raporty postępu oraz terminy odbiorów częściowych — aby wszystko było przewidywalne.",
      },
      {
        q: "Czy dajecie gwarancję na wykonane prace?",
        a: "Tak. Gwarancja jest określona w umowie. Po zakończeniu prac robimy odbiór z checklistą jakości i protokołem — to podstawa do serwisu gwarancyjnego.",
      },
      {
        q: "Czy realizujecie remonty „pod klucz” i większe inwestycje?",
        a: "Tak. Realizujemy zarówno remonty mieszkań, jak i budowy/wykończenia domów oraz większe obiekty. Zakres dopasowujemy do inwestycji: od prac wykończeniowych po kompleksowe realizacje.",
      },
      {
        q: "Od czego zacząć, jeśli nie mam jeszcze projektu?",
        a: "Najlepiej od krótkiej rozmowy. Zbieramy potrzeby, budżet, termin i standard. Następnie proponujemy optymalny zakres, pomiary i wycenę — krok po kroku.",
      },
    ],
    []
  );

  const toggle = (idx) => {
    userOpenedRef.current = true;
    setOpenIndex((curr) => (curr === idx ? -1 : idx));
  };

  useLayoutEffect(() => {
    if (openIndex < 0) return;
    if (!userOpenedRef.current) return;

    const el = itemRefs.current[openIndex];
    if (!el) return;

    let raf = 0;
    const t0 = performance.now();

    const tick = (now) => {
      smartNudgeIntoView(el);
      if (now - t0 < ANIM_MS) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [openIndex]);

  return (
    <section className="faq" aria-label="Najczęstsze pytania" id="faq">
      <div className="faq__inner">
        <header className="faq__header">
          <p className="faq__kicker">FAQ</p>
          <h2 className="faq__heading">Najczęstsze pytania</h2>
          <p className="faq__lead">
            Krótkie odpowiedzi na pytania, które najczęściej pojawiają się przed startem prac.
          </p>
        </header>

        <div className="faq__list">
          {items.map((it, idx) => {
            const isOpen = openIndex === idx;
            const panelId = `${baseId}-panel-${idx}`;
            const buttonId = `${baseId}-btn-${idx}`;

            return (
              <div
                className={`faq__item ${isOpen ? "faq__item--open" : ""}`}
                key={it.q}
                ref={(node) => {
                  itemRefs.current[idx] = node;
                }}
              >
                <button
                  type="button"
                  className="faq__button"
                  id={buttonId}
                  aria-controls={panelId}
                  aria-expanded={isOpen}
                  onClick={() => toggle(idx)}
                >
                  <span className="faq__question">{it.q}</span>
                  <span className="faq__icon" aria-hidden="true">
                    <PlusIcon open={isOpen} />
                  </span>
                </button>

                <div className="faq__panel" id={panelId} role="region" aria-labelledby={buttonId}>
                  <div className="faq__answer">{it.a}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
