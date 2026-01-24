import "./Main.scss";

export default function Main() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const headerEl = document.querySelector(".header");
    const headerHeight = headerEl ? headerEl.offsetHeight : 0;

    const elementTop = el.getBoundingClientRect().top + window.scrollY;
    const target = elementTop - headerHeight;

    window.scrollTo({
      top: target,
      behavior: "smooth",
    });
  };

  return (
    <section id="main" className="main">
      <div className="main-container">
        <div className="main-body">
          <h1 className="main-body__logo">Building Panda</h1>
          <h2 className="main-body__slogan">
            Nowoczesne budowanie — bez kompromisów.
          </h2>
          <div className="main-body__buttons">
            <button
              type="button"
              className="main-body__button"
              onClick={() => scrollToSection("contact")}
            >
              Umów się
            </button>
            <button
              type="button"
              className="main-body__button"
              onClick={() => scrollToSection("projects")}
            >
              Nasze projekty
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
