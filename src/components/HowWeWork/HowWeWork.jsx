import React, { useEffect, useMemo, useRef, useState } from "react";
import "./HowWeWork.scss";

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(!!mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return reduced;
}

function Icon({ name }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (name) {
    case "call":
      return (
        <svg className="process__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M7 3h4l1 5-3 1c1 3 3 5 6 6l1-3 5 1v4c0 1-1 2-2 2C10 20 4 14 4 6c0-1 1-3 3-3Z" />
        </svg>
      );
    case "measure":
      return (
        <svg className="process__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M4 17l9-9 4 4-9 9H4v-4Z" />
          <path {...p} d="M14 6l2-2 4 4-2 2" />
          <path {...p} d="M6 19l4-4" />
        </svg>
      );
    case "doc":
      return (
        <svg className="process__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M8 3h6l4 4v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path {...p} d="M14 3v4h4" />
          <path {...p} d="M8.5 12h7" />
          <path {...p} d="M8.5 16h5.5" />
        </svg>
      );
    case "plan":
      return (
        <svg className="process__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M4 6h16v12H4V6Z" />
          <path {...p} d="M8 10h8" />
          <path {...p} d="M8 14h5" />
        </svg>
      );
    case "build":
      return (
        <svg className="process__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M3 20h18" />
          <path {...p} d="M7 20V10l5-4 5 4v10" />
          <path {...p} d="M10 20v-5h4v5" />
        </svg>
      );
    default:
      return (
        <svg className="process__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M20 6 9 17l-5-5" />
          <path {...p} d="M7 20h10" />
        </svg>
      );
  }
}

export default function Process() {
  const reduced = usePrefersReducedMotion();

  const rootRef = useRef(null);
  const listRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const [railHeight, setRailHeight] = useState(0);
  const [lineTop, setLineTop] = useState(0);
  const [lineHeight, setLineHeight] = useState(0);
  const [dotYs, setDotYs] = useState([]);

  const [progress, setProgress] = useState(0);

  const steps = useMemo(
    () => [
      {
        icon: "call",
        title: "Rozmowa i brief",
        desc: "Ustalamy zakres, budżet i standard. Dostajesz jasny plan dalszych kroków.",
        meta: "15–30 min",
      },
      {
        icon: "measure",
        title: "Wizyta / pomiary",
        desc: "Oględziny na miejscu, pomiary i założenia technologiczne. Minimalizujemy ryzyko niespodzianek.",
        meta: "1 dzień",
      },
      {
        icon: "doc",
        title: "Wycena i umowa",
        desc: "Transparentny kosztorys, zakres prac, harmonogram oraz warunki gwarancji. Rozliczenie etapami.",
        meta: "24–72 h",
      },
      {
        icon: "plan",
        title: "Harmonogram i logistyka",
        desc: "Plan ekip, dostawy, kolejność prac oraz raportowanie postępu. Jeden punkt kontaktu.",
        meta: "start projektu",
      },
      {
        icon: "build",
        title: "Realizacja + nadzór",
        desc: "Prace zgodnie z planem. Kontrola jakości na kluczowych etapach, stała komunikacja.",
        meta: "w trakcie",
      },
      {
        icon: "check",
        title: "Odbiór i gwarancja",
        desc: "Protokół odbioru, checklisty jakości, dokumentacja powykonawcza. Gwarancja zgodnie z umową.",
        meta: "final",
      },
    ],
    []
  );

  useEffect(() => {
    const measure = () => {
      const listEl = listRef.current;
      if (!listEl) return;

      const cards = Array.from(listEl.querySelectorAll(".process__step"));
      if (!cards.length) return;

      const listRect = listEl.getBoundingClientRect();
      const listTopInViewport = listRect.top;

      const ys = cards.map((el) => {
        const r = el.getBoundingClientRect();
        const centerY = (r.top - listTopInViewport) + r.height / 2;
        return Math.round(centerY);
      });

      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      setDotYs(ys);
      setRailHeight(listEl.scrollHeight);
      setLineTop(minY);
      setLineHeight(Math.max(1, maxY - minY));
    };

    measure();
    window.addEventListener("resize", measure);
    const t = window.setTimeout(measure, 80);

    return () => {
      window.removeEventListener("resize", measure);
      window.clearTimeout(t);
    };
  }, [steps.length]);

  useEffect(() => {
    if (reduced) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const listEl = listRef.current;
      if (!listEl) return;

      const listRect = listEl.getBoundingClientRect();
      const viewH = window.innerHeight || 0;
      const probeY = viewH * 0.45;

      if (dotYs.length) {
        const probeInList = probeY - listRect.top;
        let bestIdx = 0;
        let bestDist = Infinity;

        for (let i = 0; i < dotYs.length; i++) {
          const d = Math.abs(dotYs[i] - probeInList);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = i;
          }
        }
        setActiveIndex(bestIdx);

        const denom = Math.max(1, lineHeight);
        const raw = (probeInList - lineTop) / denom;
        setProgress(clamp(raw, 0, 1));
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [dotYs, lineTop, lineHeight, reduced]);

  return (
    <section className="process" ref={rootRef} aria-label="Jak pracujemy" id="process">
      <div className="process__inner">
        <header className="process__header">
          <p className="process__kicker">Jak pracujemy</p>
          <h2 className="process__heading">Proces, który idzie z Tobą krok po kroku</h2>
          <p className="process__lead">
            Remont lub budowa to przewidywalność: jasne etapy, kontrola jakości i stała komunikacja. Poniżej nasz standardowy proces.
          </p>
        </header>

        <div className="process__layout">
          <aside
            className="process__rail"
            aria-hidden="true"
            style={{ height: railHeight ? `${railHeight}px` : undefined }}
          >
            <div
              className="process__line"
              style={{
                top: lineTop ? `${lineTop}px` : undefined,
                height: lineHeight ? `${lineHeight}px` : undefined,
              }}
            >
              <div
                className="process__lineFill"
                style={{ transform: `scaleY(${progress})` }}
              />
            </div>

            <div className="process__dots">
              {dotYs.map((y, i) => (
                <span
                  key={i}
                  className={`process__dot ${i <= activeIndex ? "process__dot--on" : ""}`}
                  style={{ top: `${y}px` }}
                />
              ))}
            </div>
          </aside>

          <div className="process__steps" ref={listRef}>
            {steps.map((s, i) => (
              <article
                key={s.title}
                className={`process__step ${i === activeIndex ? "process__step--active" : ""}`}
              >
                <div className="process__badge" aria-hidden="true">
                  <Icon name={s.icon} />
                </div>

                <div className="process__content">
                  <div className="process__topRow">
                    <h3 className="process__title">{s.title}</h3>
                    <span className="process__meta">{s.meta}</span>
                  </div>
                  <p className="process__desc">{s.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
