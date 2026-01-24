import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Capabilities.scss";

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function formatValue(value, type) {
  const v = Math.round(value);

  switch (type) {
    case "years":
      return `${v}+`;
    case "percent":
      return `${v}%`;
    case "sqm":
      return `${v.toLocaleString("pl-PL")} m²`;
    case "projects":
      return `${v.toLocaleString("pl-PL")}+`;
    case "months":
      return `${v} mies.`;
    case "steps":
      return `${v}`;
    default:
      return `${v}`;
  }
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

function useInViewOnce(ref, options) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      });
    }, options);

    io.observe(el);
    return () => io.disconnect();
  }, [ref, options]);

  return inView;
}

function Counter({ to, type, start, duration = 900 }) {
  const reduced = usePrefersReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!start) return;

    if (reduced) {
      setVal(to);
      return;
    }

    let raf = 0;
    const t0 = performance.now();

    const tick = (now) => {
      const p = clamp((now - t0) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(to * eased);

      if (p < 1) raf = requestAnimationFrame(tick);
      else setVal(to);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, to, duration, reduced]);

  return <span className="privileges__value">{formatValue(val, type)}</span>;
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
    case "contract":
      return (
        <svg className="privileges__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M8 3h6l4 4v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path {...p} d="M14 3v4h4" />
          <path {...p} d="M8.5 12h7" />
          <path {...p} d="M8.5 16h5.5" />
        </svg>
      );
    case "shield":
      return (
        <svg className="privileges__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M12 3.2 19 6.6V12c0 5.2-3.3 9-7 10.8C8.3 21 5 17.2 5 12V6.6l7-3.4Z" />
          <path {...p} d="M9.2 12.3l1.9 1.9 3.8-4.3" />
        </svg>
      );
    case "clock":
      return (
        <svg className="privileges__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9Z" />
          <path {...p} d="M12 7v5l3.2 2" />
        </svg>
      );
    case "quality":
      return (
        <svg className="privileges__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M12 2.8 14.7 6.2l4.2-.1-1.6 3.9 2.8 3.1-4.1.7-2.1 3.6-2.1-3.6-4.1-.7 2.8-3.1-1.6-3.9 4.2.1L12 2.8Z" />
          <path {...p} d="M9.4 12.2l1.6 1.6 3.6-3.9" />
        </svg>
      );
    case "home":
      return (
        <svg className="privileges__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M4 11.2 12 4l8 7.2" />
          <path {...p} d="M6.5 10.8V20h11V10.8" />
          <path {...p} d="M10 20v-6h4v6" />
        </svg>
      );
    case "checklist":
    default:
      return (
        <svg className="privileges__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M7 4h12" />
          <path {...p} d="M7 9h12" />
          <path {...p} d="M7 14h12" />
          <path {...p} d="M7 19h12" />
          <path {...p} d="M3.8 4.2l.9.9 1.6-1.8" />
          <path {...p} d="M3.8 9.2l.9.9 1.6-1.8" />
          <path {...p} d="M3.8 14.2l.9.9 1.6-1.8" />
          <path {...p} d="M3.8 19.2l.9.9 1.6-1.8" />
        </svg>
      );
  }
}

export default function Privileges() {
  const rootRef = useRef(null);
  const inView = useInViewOnce(rootRef, { threshold: 0.2 });
  const reduced = usePrefersReducedMotion();

  const stats = useMemo(
    () => [
      {
        icon: "contract",
        label: "Umowa i kosztorys",
        value: 100,
        type: "percent",
        note: "Zakres, harmonogram i rozliczenie etapami — bez niespodzianek.",
      },
      {
        icon: "shield",
        label: "Gwarancja",
        value: 24,
        type: "months",
        note: "Gwarancja na prace i protokół odbioru z checklistą jakości.",
      },
      {
        icon: "clock",
        label: "Terminowość",
        value: 95,
        type: "percent",
        note: "Realizacja zgodnie z planem, stały kontakt i nadzór kierownika.",
      },
      {
        icon: "quality",
        label: "Kontrola jakości",
        value: 5,
        type: "steps",
        note: "Kontrole na kluczowych etapach: instalacje, gładzie, montaż, odbiór.",
      },
      {
        icon: "home",
        label: "Zrealizowane wnętrza",
        value: 180,
        type: "projects",
        note: "Mieszkania, domy i lokale — kompleksowe wykończenia i remonty.",
      },
      {
        icon: "checklist",
        label: "Transparentny proces",
        value: 7,
        type: "steps",
        note: "Od pomiarów i wyceny po sprzątanie i przekazanie kluczy.",
      },
    ],
    []
  );

  const show = reduced ? true : inView;

  return (
    <section className="privileges" ref={rootRef} aria-label="Dlaczego my">
      <div className="privileges__inner">
        <header className="privileges__header">
          <p className="privileges__kicker">Dlaczego my</p>
          <h2 className="privileges__heading">Standard, który widać w detalach</h2>
          <p className="privileges__lead">
            Remont to nie obietnice — tylko proces. Pracujemy w oparciu o jasną umowę, przewidywalny harmonogram i kontrolę jakości.
            Poniższe liczby pokazują, jak wygląda to w praktyce.
          </p>
        </header>

        <div className="privileges__grid">
          {stats.map((s, idx) => (
            <article
              className={`privileges__card ${show ? "privileges__card--in" : ""}`}
              key={s.label}
              style={{ transitionDelay: `${Math.min(idx * 70, 2000)}ms` }}
            >
              <div className="privileges__badge" aria-hidden="true">
                <Icon name={s.icon} />
              </div>

              <div className="privileges__body">
                <p className="privileges__label">{s.label}</p>

                <p className="privileges__number">
                  <Counter to={s.value} type={s.type} start={show} />
                </p>

                <p className="privileges__note">{s.note}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
