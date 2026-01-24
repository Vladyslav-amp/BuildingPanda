import React, { useEffect, useRef } from "react";
import "./TrustBar.scss";

const ITEMS = [
  {
    title: "Umowa i transparentny kosztorys",
    desc: "Jasny zakres, harmonogram, rozliczenie etapami.",
    icon: "doc",
    targetId: "executive-projects",
  },
  {
    title: "Gwarancja i odpowiedzialność",
    desc: "Gwarancja na wykonane prace oraz pełna dokumentacja.",
    icon: "shield",
    targetId: "executive-projects",
  },
  {
    title: "Terminowość pod kontrolą",
    desc: "Stały nadzór i realizacja zgodnie z harmonogramem.",
    icon: "clock",
    targetId: "executive-projects",
  },
  {
    title: "Własne brygady i kadra",
    desc: "Doświadczeni kierownicy i sprawdzone zespoły.",
    icon: "team",
    targetId: "executive-projects",
  },
  {
    title: "Standardy, BHP i jakość",
    desc: "Normy, bezpieczeństwo i kontrola jakości.",
    icon: "quality",
    targetId: "executive-projects",
  },
];

function Icon({ name }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (name) {
    case "doc":
      return (
        <svg viewBox="0 0 24 24" className="trustbar__icon" aria-hidden="true">
          <path {...p} d="M8 3h6l4 4v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path {...p} d="M14 3v4h4" />
          <path {...p} d="M8.5 12h7" />
          <path {...p} d="M8.5 16h5.5" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" className="trustbar__icon" aria-hidden="true">
          <path {...p} d="M12 3.2 19 6.6V12c0 5.2-3.3 9-7 10.8C8.3 21 5 17.2 5 12V6.6l7-3.4Z" />
          <path {...p} d="M9.2 12.3l1.9 1.9 3.8-4.3" />
        </svg>
      );
    case "clock":
      return (
        <svg viewBox="0 0 24 24" className="trustbar__icon" aria-hidden="true">
          <path {...p} d="M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9Z" />
          <path {...p} d="M12 7v5l3.2 2" />
        </svg>
      );
    case "team":
      return (
        <svg viewBox="0 0 24 24" className="trustbar__icon" aria-hidden="true">
          <path {...p} d="M16.2 10.2a3.2 3.2 0 1 0-3.2-3.2 3.2 3.2 0 0 0 3.2 3.2Z" />
          <path {...p} d="M7.8 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z" />
          <path {...p} d="M20 20.2c0-3.2-2.5-5.2-5.6-5.2s-5.6 2-5.6 5.2" />
          <path {...p} d="M10.8 20.2c0-2.6-2-4.2-4.6-4.2S1.6 17.6 1.6 20.2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="trustbar__icon" aria-hidden="true">
          <path {...p} d="M12 2.8 14.7 6.2l4.2-.1-1.6 3.9 2.8 3.1-4.1.7-2.1 3.6-2.1-3.6-4.1-.7 2.8-3.1-1.6-3.9 4.2.1L12 2.8Z" />
          <path {...p} d="M9.4 12.2l1.6 1.6 3.6-3.9" />
        </svg>
      );
  }
}

export default function TrustBar() {
  const rootRef = useRef(null);

  const goTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cards = Array.from(root.querySelectorAll(".trustbar__card"));
    if (!cards.length) return;

    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      cards.forEach((c) => c.classList.add("trustbar__card--in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("trustbar__card--in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  return (
    <section className="trustbar" ref={rootRef} aria-label="Dlaczego my">
      <div className="trustbar__inner">
        <header className="trustbar__header">
          <p className="trustbar__kicker">Dlaczego my</p>
          <h2 className="trustbar__heading">Standard premium bez kompromisów</h2>
          <p className="trustbar__lead">
            Kompleksowo realizujemy inwestycje: budowa, remonty, nadzór, dokumentacja.
            Pracujemy transparentnie, etapowo i w oparciu o kontrolę jakości na każdym kroku.
          </p>
        </header>

        <ul className="trustbar__list" role="list">
          {ITEMS.map((item, idx) => (
            <li className="trustbar__item" key={item.title}>
              <button
                type="button"
                className="trustbar__card"
                onClick={() => goTo(item.targetId)}
                aria-label={`Przejdź do sekcji: ${item.title}`}
                style={{ transitionDelay: `${Math.min(idx * 70, 280)}ms` }}
              >
                <span className="trustbar__badge" aria-hidden="true">
                  <Icon name={item.icon} />
                </span>
                <span className="trustbar__title">{item.title}</span>
                <span className="trustbar__desc">{item.desc}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
