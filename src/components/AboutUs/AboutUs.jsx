import React, { useEffect, useMemo, useRef, useState } from "react";
import "./AboutUs.scss";

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

function useRevealOnce(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const nodes = Array.from(root.querySelectorAll("[data-reveal]"));
    if (!nodes.length) return;

    if (reduce) {
      nodes.forEach((n) => n.classList.add("about__reveal--in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("about__reveal--in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [rootRef]);
}

const Icon = ({ name }) => {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (name) {
    case "shield":
      return (
        <svg className="about__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M12 3.2 19 6.6V12c0 5.2-3.3 9-7 10.8C8.3 21 5 17.2 5 12V6.6l7-3.4Z" />
          <path {...p} d="M9.2 12.3l1.9 1.9 3.8-4.3" />
        </svg>
      );
    case "plan":
      return (
        <svg className="about__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M4 6h16v12H4V6Z" />
          <path {...p} d="M8 10h8" />
          <path {...p} d="M8 14h5" />
        </svg>
      );
    case "quality":
    default:
      return (
        <svg className="about__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M12 2.8 14.7 6.2l4.2-.1-1.6 3.9 2.8 3.1-4.1.7-2.1 3.6-2.1-3.6-4.1-.7 2.8-3.1-1.6-3.9 4.2.1L12 2.8Z" />
          <path {...p} d="M9.4 12.2l1.6 1.6 3.6-3.9" />
        </svg>
      );
  }
};

export default function About() {
  const reduced = usePrefersReducedMotion();

  const rootRef = useRef(null);
  const mediaRef = useRef(null);
  const imgRef = useRef(null);

  const principlesRef = useRef(null);
  const [activePrinciple, setActivePrinciple] = useState(0);

  useRevealOnce(rootRef);

  const principles = useMemo(
    () => [
      {
        icon: "plan",
        title: "Przewidywalny plan i kosztorys",
        text:
          "Rozpoczynamy od briefu i pomiarów, a następnie przygotowujemy klarowny kosztorys oraz harmonogram. " +
          "Dzięki temu wiesz, co dokładnie wykonujemy, w jakiej kolejności i w jakim czasie.",
      },
      {
        icon: "quality",
        title: "Standard jakości, który da się zweryfikować",
        text:
          "Premium to detale: równe płaszczyzny, poprawna technologia, czyste łączenia i estetyka montażu. " +
          "Kontrolujemy kluczowe etapy i reagujemy w trakcie — nie dopiero na odbiorze.",
      },
      {
        icon: "shield",
        title: "Odpowiedzialność, odbiór i gwarancja",
        text:
          "Pracujemy w oparciu o umowę i dokumentację. Odbiór końcowy robimy na checklistach, " +
          "z protokołem oraz przejrzystymi warunkami gwarancji.",
      },
    ],
    []
  );

  useEffect(() => {
    if (reduced) return;
    const wrap = mediaRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;

    // disable on touch devices
    const hasFinePointer = window.matchMedia
      ? window.matchMedia("(hover: hover) and (pointer: fine)").matches
      : false;
    if (!hasFinePointer) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const animate = () => {
      raf = 0;
      // damped follow
      currentX += (targetX - currentX) * 0.10;
      currentY += (targetY - currentY) * 0.10;

      img.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(1.04)`;
      wrap.style.setProperty("--rx", `${-currentY * 0.12}deg`);
      wrap.style.setProperty("--ry", `${currentX * 0.12}deg`);
    };

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;

      const dx = (e.clientX - cx) / (r.width / 2);
      const dy = (e.clientY - cy) / (r.height / 2);

      // clamp and scale
      const clampedX = Math.max(-1, Math.min(1, dx));
      const clampedY = Math.max(-1, Math.min(1, dy));

      targetX = clampedX * 10;
      targetY = clampedY * 10;

      if (!raf) raf = requestAnimationFrame(animate);
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      if (!raf) raf = requestAnimationFrame(animate);
    };

    wrap.addEventListener("mousemove", onMove);
    wrap.addEventListener("mouseleave", onLeave);

    return () => {
      wrap.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  // Active principle highlight on scroll
  useEffect(() => {
    if (reduced) return;
    const root = principlesRef.current;
    if (!root) return;

    const cards = Array.from(root.querySelectorAll(".about__principle"));
    if (!cards.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const idx = Number(e.target.getAttribute("data-index"));
          if (Number.isFinite(idx)) setActivePrinciple(idx);
        });
      },
      { threshold: 0.6 }
    );

    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [reduced]);

  return (
    <section className="about" id="about" ref={rootRef} aria-label="O nas">
      <div className="about__inner">
        <div className="about__top">
          <header className="about__header" data-reveal>
            <p className="about__kicker">O nas</p>

            <h2 className="about__heading">
              Realizacje w standardzie premium — oparte na procesie, nie na obietnicach
            </h2>

            <div className="about__copy">
              <p className="about__lead">
                Jesteśmy firmą budowlaną i wykończeniową, która prowadzi projekty w sposób uporządkowany:
                od analizy potrzeb, przez kosztorys i harmonogram, aż po odbiór i gwarancję.
              </p>

              <p className="about__text">
                Obsługujemy remonty mieszkań, domów, lokali usługowych oraz realizacje inwestycyjne.
                Dla klientów oznacza to jedno: przewidywalność. Zamiast „jakoś to będzie” dostajesz
                spójną komunikację, kontrolę jakości i jasne zasady rozliczeń.
              </p>

              <p className="about__text">
                Nasz zespół tworzą doświadczeni wykonawcy i osoby nadzorujące. Pracujemy w oparciu o technologię,
                checklisty oraz standardy BHP. W każdym projekcie dbamy o szczegóły wykończenia i porządek na budowie,
                bo to realnie skraca czas realizacji i minimalizuje ryzyko poprawek.
              </p>

              <p className="about__text about__text--strong">
                Jeśli szukasz wykonawcy, który prowadzi inwestycję odpowiedzialnie — jesteś w dobrym miejscu.
              </p>
            </div>

            <div className="about__ctaRow">
              <a className="about__cta about__cta--primary" href="#contact">
                Umów konsultację
              </a>
              <a className="about__cta about__cta--ghost" href="#realizations">
                Zobacz realizacje
              </a>
            </div>

            <div className="about__bullets">
              <div className="about__bullet">
                <span className="about__bulletDot" />
                Umowa, kosztorys i harmonogram
              </div>
              <div className="about__bullet">
                <span className="about__bulletDot" />
                Stały nadzór i raportowanie postępu
              </div>
              <div className="about__bullet">
                <span className="about__bulletDot" />
                Odbiór na checklistach + gwarancja
              </div>
            </div>
          </header>

          <div className="about__media" data-reveal>
            <div className="about__mediaFrame" ref={mediaRef} aria-hidden="true">
              <img
                ref={imgRef}
                className="about__mediaImg"
                src="src/assets/main_bg.avif"
                alt=""
                loading="lazy"
              />
              <div className="about__mediaOverlay" />
              <div className="about__mediaBadge">
                <span className="about__mediaBadgeTitle">Standard pracy</span>
                <span className="about__mediaBadgeText">
                  Pomiar • Wycena • Harmonogram • Kontrola jakości
                </span>
              </div>
            </div>

            <div className="about__mediaFooter">
              <div className="about__pill">Mieszkania</div>
              <div className="about__pill">Domy</div>
              <div className="about__pill">Lokale</div>
              <div className="about__pill">Inwestycje</div>
            </div>

            <div className="about__stats" data-reveal>
              <div className="about__stat">
                <p className="about__statTop">Komunikacja</p>
                <p className="about__statBig">1</p>
                <p className="about__statBottom">punkt kontaktu</p>
              </div>
              <div className="about__stat">
                <p className="about__statTop">Proces</p>
                <p className="about__statBig">7</p>
                <p className="about__statBottom">etapów pracy</p>
              </div>
              <div className="about__stat">
                <p className="about__statTop">Jakość</p>
                <p className="about__statBig">5</p>
                <p className="about__statBottom">kontroli</p>
              </div>
              <div className="about__stat">
                <p className="about__statTop">Umowa</p>
                <p className="about__statBig">100%</p>
                <p className="about__statBottom">transparentności</p>
              </div>
            </div>
          </div>
        </div>

        <div className="about__principlesWrap" ref={principlesRef} data-reveal>
          <p className="about__sectionTitle">Jak budujemy jakość</p>

          <div className="about__principles">
            {principles.map((p, i) => (
              <article
                key={p.title}
                data-index={i}
                className={`about__principle ${
                  i === activePrinciple ? "about__principle--active" : ""
                }`}
              >
                <div className="about__badge" aria-hidden="true">
                  <Icon name={p.icon} />
                </div>

                <div className="about__principleBody">
                  <h3 className="about__principleTitle">{p.title}</h3>
                  <p className="about__principleText">{p.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
// 