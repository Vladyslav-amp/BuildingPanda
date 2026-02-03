import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./Header.scss";
import logo from '@/assets/logo.svg';

function scrollToHashWithOffset(hash, headerEl) {
  if (!hash || hash[0] !== "#") return;

  if (hash === "#top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const el = document.querySelector(hash);
  if (!el) return;

  const offset = headerEl ? Math.ceil(headerEl.getBoundingClientRect().height || 0) : 0;
  const r = el.getBoundingClientRect();
  const y = window.scrollY + r.top - offset;

  window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
}

function useBackgroundScrollBlock(isOpen, allowScrollRef) {
  useEffect(() => {
    if (!isOpen) return;

    const isInsideAllowed = (target) => {
      const box = allowScrollRef?.current;
      if (!box) return false;
      return box === target || box.contains(target);
    };

    const prevent = (e) => {
      if (isInsideAllowed(e.target)) return;
      e.preventDefault();
    };

    const onKeyDown = (e) => {
      const keys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
      if (!keys.includes(e.key)) return;

      const active = document.activeElement;
      if (active && isInsideAllowed(active)) return;
      e.preventDefault();
    };

    document.addEventListener("wheel", prevent, { passive: false });
    document.addEventListener("touchmove", prevent, { passive: false });
    document.addEventListener("keydown", onKeyDown, { passive: false });

    return () => {
      document.removeEventListener("wheel", prevent);
      document.removeEventListener("touchmove", prevent);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, allowScrollRef]);
}

function Icon({ name }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (name) {
    case "phone":
      return (
        <svg className="header__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            {...p}
            d="M22 16.6v3a2 2 0 0 1-2.2 2A19.6 19.6 0 0 1 11.3 19a19.1 19.1 0 0 1-5.9-5.9A19.6 19.6 0 0 1 2.4 4.6 2 2 0 0 1 4.4 2h3a2 2 0 0 1 2 1.7c.1.8.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8.4 9.4a16 16 0 0 0 6.2 6.2l1.1-1.1a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6A2 2 0 0 1 22 16.6Z"
          />
        </svg>
      );
    case "mail":
      return (
        <svg className="header__icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="2" y="6" width="20" height="12" rx="2" {...p} />
          <path {...p} d="M22 8 12 14 2 8" />
        </svg>
      );
    case "globe":
      return (
        <svg className="header__icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" {...p} />
          <path {...p} d="M3 12h18" />
          <path {...p} d="M12 3a14 14 0 0 1 0 18" />
          <path {...p} d="M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "chevron":
      return (
        <svg className="header__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M6 9l6 6 6-6" />
        </svg>
      );
    case "close":
      return (
        <svg className="header__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M6 6l12 12" />
          <path {...p} d="M18 6l-12 12" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Header() {
  const headerRef = useRef(null);

  const [open, setOpen] = useState(false);

  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState("PL");
  const langRef = useRef(null);

  const sheetBodyRef = useRef(null);
  useBackgroundScrollBlock(open, sheetBodyRef);

  const nav = useMemo(
    () => [
      { label: "Usługi", href: "#services" },
      { label: "Realizacje", href: "#realizations" },
      { label: "Jak pracujemy", href: "#process" },
      { label: "Kalkulator", href: "#calculator" },
      { label: "FAQ", href: "#faq" },
      { label: "O nas", href: "#about-us" },

    ],
    []
  );

  const desktopNav = useMemo(() => [...nav, { label: "Kontakt", href: "#contact" }], [nav]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setLangOpen(false);
      }
    };

    const onOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };

    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onOutside);
    };
  }, []);

  function onNavClick(e, href) {
    e.preventDefault();
    setOpen(false);
    setLangOpen(false);

    requestAnimationFrame(() => {
      scrollToHashWithOffset(href, headerRef.current);
      history.replaceState(null, "", href);
    });
  }

  function chooseLang(l) {
    setLang(l);
    setLangOpen(false);
  }

  const mobileSheet = (
    <div className={`mnav ${open ? "mnav--open" : ""}`} aria-hidden={!open}>
      <button
        type="button"
        className="mnav__backdrop"
        aria-label="Zamknij menu"
        onClick={() => setOpen(false)}
        tabIndex={open ? 0 : -1}
      />

      <div className="mnav__panel" role="dialog" aria-label="Menu mobilne">
        <div className="mnav__top">
          <a className="mnav__brand" href="#top" onClick={(e) => onNavClick(e, "#top")}>
            <img
              src={logo}
              alt="Nazwa firmy"
              className="header__logoImage"
            />
            <span className="mnav__name">Building Panda</span>
          </a>

          <button type="button" className="mnav__close" onClick={() => setOpen(false)} aria-label="Zamknij">
            <Icon name="close" />
          </button>
        </div>

        <div className="mnav__body" ref={sheetBodyRef}>
          <nav className="mnav__nav" aria-label="Nawigacja">
            {nav.map((x) => (
              <a key={x.href} className="mnav__navLink" href={x.href} onClick={(e) => onNavClick(e, x.href)}>
                {x.label}
              </a>
            ))}
          </nav>

          <a className="mnav__cta" href="#contact" onClick={(e) => onNavClick(e, "#contact")}>
            Umów spotkanie
          </a>

          <div className="mnav__contact" aria-label="Kontakt">
            <a className="mnav__contactItem" href="tel:+48576530094" onClick={() => setOpen(false)}>
              <span className="mnav__contactIcon" aria-hidden="true">
                <Icon name="phone" />
              </span>
              <span className="mnav__contactText">+48 576 530 094</span>
            </a>

            <a className="mnav__contactItem" href="tel:+48798889787" onClick={() => setOpen(false)}>
              <span className="mnav__contactIcon" aria-hidden="true">
                <Icon name="phone" />
              </span>
              <span className="mnav__contactText">+48 798 889 787</span>
            </a>

            <a className="mnav__contactItem" href="mailto:buildingpanda.pl@gmail.com" onClick={() => setOpen(false)}>
              <span className="mnav__contactIcon" aria-hidden="true">
                <Icon name="mail" />
              </span>
              <span className="mnav__contactText">buildingpanda.pl@gmail.com</span>
            </a>
          </div>

          <div className="mnav__langWrap" aria-label="Wybór języka">
            {/* <div className="mnav__langLabel">
              <Icon name="globe" />
              <span>Język</span>
            </div>

            <div className="mnav__langRow">
              {["PL", "RU", "EN"].map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`mnav__langBtn ${lang === l ? "mnav__langBtn--on" : ""}`}
                  onClick={() => chooseLang(l)}
                >
                  {l}
                </button>
              ))}
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header ref={headerRef} className="header" id="top">
        <div className="header__top">
          <div className="header__inner header__inner--top">
            <div className="header__left">
              <a className="header__company" href="#top" onClick={(e) => onNavClick(e, "#top")}>
                Building Panda
              </a>
            </div>

            <div className="header__center">
              <a
                className="header__logo"
                href="#top"
                onClick={(e) => onNavClick(e, "#top")}
                aria-label="Strona główna"
              >
                <img
                  src={logo}
                  alt="Nazwa firmy"
                  className="header__logoImage"
                />
              </a>
            </div>


            <div className="header__right">
              <div className="header__contact">
                <a className="header__contactItem" href="tel:+48576530094">
                  <Icon name="phone" />
                  <span>+48 576 530 094</span>
                </a>
                <a className="header__contactItem" href="tel:+48798889787">
                  <Icon name="phone" />
                  <span>+48 798 889 787</span>
                </a>
                <a className="header__contactItem header__contactItem--mail" href="mailto:buildingpanda.pl@gmail.com">
                  <Icon name="mail" />
                  <span>buildingpanda.pl@gmail.com</span>
                </a>
              </div>

              {/* <div className="header__lang" ref={langRef} aria-label="Zmiana języka">
                <button
                  type="button"
                  className={`header__langToggle ${langOpen ? "header__langToggle--open" : ""}`}
                  onClick={() => setLangOpen((s) => !s)}
                  aria-expanded={langOpen}
                >
                  <Icon name="globe" />
                  <span className="header__langValue">{lang}</span>
                  <Icon name="chevron" />
                </button>

                <div className={`header__langMenu ${langOpen ? "header__langMenu--open" : ""}`}>
                  {["PL", "RU", "EN"].map((l) => (
                    <button
                      key={l}
                      type="button"
                      className={`header__langItem ${lang === l ? "header__langItem--on" : ""}`}
                      onClick={() => chooseLang(l)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div> */}

              <button
                type="button"
                className="header__burger"
                onClick={() => setOpen(true)}
                aria-label="Otwórz menu"
                aria-expanded={open}
              >
                <span aria-hidden="true" />
                <span aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="header__bottom">
          <div className="header__inner header__inner--bottom">
            <nav className="header__nav" aria-label="Nawigacja główna">
              {desktopNav.map((x) => (
                <a key={x.href} className="header__navLink" href={x.href} onClick={(e) => onNavClick(e, x.href)}>
                  {x.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {typeof document !== "undefined" ? createPortal(mobileSheet, document.body) : null}
    </>
  );
}
