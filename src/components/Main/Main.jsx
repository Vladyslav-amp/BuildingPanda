import { useCallback } from "react";
import "./Main.scss";

export default function Main() {
  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  return (
    <section id="main" className="main">
      <div className="main-container">
        <div className="main-body">
          <h1 className="main-body__logo">Building Panda</h1>
          <span className="main-body__accent" aria-hidden="true" />
          <p className="main-body__slogan">
            Nowoczesne budowanie bez kompromisów.
            Projekty mieszkaniowe i komercyjne pod klucz.
          </p>

          <div className="main-body__buttons">
            <button
              type="button"
              className="main-body__button main-body__button--primary"
              onClick={() => scrollToSection("contact")}
            >
              Umów się
            </button>

            <button
              type="button"
              className="main-body__button main-body__button--ghost"
              onClick={() => scrollToSection("realizations")}
            >
              Nasze projekty
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}