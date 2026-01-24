import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import "./Projects.scss";

import parkowa1 from "../../assets/projects/zakatek-1.webp";
import parkowa2 from "../../assets/projects/zakatek-1.webp";
import parkowa3 from "../../assets/projects/zakatek-1.webp";
import parkowa4 from "../../assets/projects/zakatek-1.webp";
import parkowa5 from "../../assets/projects/zakatek-1.webp";
import parkowa6 from "../../assets/projects/zakatek-1.webp";
import parkowa7 from "../../assets/projects/zakatek-1.webp";
import parkowa8 from "../../assets/projects/zakatek-1.webp";
import parkowa9 from "../../assets/projects/zakatek-1.webp";

import nadmorska1 from "../../assets/projects/zakatek-1.webp";
import nadmorska2 from "../../assets/projects/zakatek-1.webp";
import nadmorska3 from "../../assets/projects/zakatek-1.webp";

import zakatek1 from "../../assets/projects/zakatek-1.webp";
import zakatek2 from "../../assets/projects/zakatek-2.webp";
import zakatek3 from "../../assets/projects/zakatek-3.webp";

import lesna1 from "../../assets/projects/zakatek-1.webp";
import lesna2 from "../../assets/projects/zakatek-1.webp";
import lesna3 from "../../assets/projects/zakatek-1.webp";

import centrum1 from "../../assets/projects/zakatek-1.webp";
import centrum2 from "../../assets/projects/zakatek-1.webp";
import centrum3 from "../../assets/projects/zakatek-1.webp";

const PROJECTS = [
  {
    id: "multi-1",
    name: "Budynek wielorodzinny – Parkowa 12",
    location: "Kraków, Polska",
    type: "Budynki wielorodzinne",
    summary:
      "Nowoczesny budynek wielorodzinny z lokalami usługowymi w parterze, zaprojektowany w standardzie podwyższonym.",
    description:
      "Projekt zrealizowany w technologii żelbetowej z dbałością o detal i energooszczędność. Czysta geometria elewacji oraz wysokiej jakości wykończenia klatek schodowych nadają inwestycji charakteru premium. Budynek wyposażony w nowoczesne systemy wentylacyjne i instalacje inteligentnego zarządzania mediami.",
    photographyBy: "Zespół VAL&ART",
    year: 2021,
    floors: 5,
    usableArea: { value: 1850, unit: "m²" },
    structure: "Żelbet + silikat",
    plotArea: { value: 1200, unit: "m²" },
    volume: { value: 6400, unit: "m³" },
    client: "Parkowa Development",
    status: "Zrealizowany",
    images: [
      { src: parkowa1, alt: "Elewacja frontowa – Parkowa 12" },
      { src: parkowa2, alt: "Klatka schodowa – Parkowa 12" },
      { src: parkowa3, alt: "Dziedziniec – Parkowa 12" },
      { src: parkowa4, alt: "Dziedziniec – Parkowa 12" },
      { src: parkowa5, alt: "Dziedziniec – Parkowa 12" },
      { src: parkowa6, alt: "Dziedziniec – Parkowa 12" },
      { src: parkowa7, alt: "Dziedziniec – Parkowa 12" },
      { src: parkowa8, alt: "Dziedziniec – Parkowa 12" },
      { src: parkowa9, alt: "Dziedziniec – Parkowa 12" }
    ]
  },
  {
    id: "multi-2",
    name: "Apartamentowiec – Nadmorska 8",
    location: "Gdańsk, Polska",
    type: "Budynki wielorodzinne",
    summary:
      "Luksusowy apartamentowiec z widokiem na morze, z tarasami i dużymi przeszkleniami od strony linii brzegowej.",
    description:
      "Luksusowy obiekt z dużymi przeszkleniami i panoramicznymi tarasami zapewniającymi widok na linię brzegową. Zastosowano konstrukcję żelbetową, wysoką termoizolację oraz fasadę odporną na działanie soli morskiej. Apartamentowiec zaprojektowany z myślą o segmencie premium.",
    photographyBy: "Holger Obenaus",
    year: 2023,
    floors: 7,
    usableArea: { value: 3420, unit: "m²" },
    structure: "Żelbet monolityczny",
    plotArea: { value: 1900, unit: "m²" },
    volume: { value: 11200, unit: "m³" },
    client: "Nadmorska Estate",
    status: "Zrealizowany",
    images: [
      { src: nadmorska1, alt: "Elewacja frontowa – Nadmorska 8" },
      { src: nadmorska2, alt: "Taras widokowy – Nadmorska 8" },
      { src: nadmorska3, alt: "Hol wejściowy – Nadmorska 8" }
    ]
  },
  {
    id: "single-1",
    name: "Dom jednorodzinny – Zielony Zakątek",
    location: "Rzeszów, Polska",
    type: "Domy jednorodzinne",
    summary:
      "Dom wolnostojący z dużymi przeszkleniami od strony ogrodu, dopasowany do potrzeb nowoczesnej rodziny.",
    description:
      "Projekt indywidualny skupiony na harmonii z otoczeniem. Szerokie przeszklenia doświetlają wnętrza, a układ funkcjonalny wspiera komfort życia rodziny. Zastosowanie nowoczesnych instalacji oraz ekologicznych materiałów pozwoliło uzyskać ponadprzeciętną energooszczędność.",
    photographyBy: "Newport 653",
    year: 2022,
    floors: 2,
    usableArea: { value: 210, unit: "m²" },
    structure: "Murowana + strop żelbetowy",
    plotArea: { value: 860, unit: "m²" },
    volume: { value: 740, unit: "m³" },
    client: "Inwestor prywatny",
    status: "Zrealizowany",
    images: [
      { src: zakatek1, alt: "Widok od ogrodu – Zielony Zakątek" },
      { src: zakatek2, alt: "Salon z antresolą – Zielony Zakątek" },
      { src: zakatek3, alt: "Detal elewacji – Zielony Zakątek" }
    ]
  },
  {
    id: "single-2",
    name: "Dom bliźniaczy – Leśna 4",
    location: "Tarnów, Polska",
    type: "Domy jednorodzinne",
    summary:
      "Bliźniak w spokojnej, zielonej okolicy, zaprojektowany dla dwóch rodzin ceniących komfort i prywatność.",
    description:
      "Zespół dwóch budynków w zabudowie bliźniaczej charakteryzuje elegancki minimalizm elewacji oraz ergonomiczny podział przestrzeni. Realizacja obejmowała kompleksowe wykonawstwo wraz z zagospodarowaniem terenu. Projekt skierowany do rodzin poszukujących komfortu i prywatności.",
    photographyBy: "Zespół SolidBud",
    year: 2020,
    floors: 2,
    usableArea: { value: 310, unit: "m²" },
    structure: "Murowana",
    plotArea: { value: 1100, unit: "m²" },
    volume: { value: 1180, unit: "m³" },
    client: "Leśna Investments",
    status: "Zrealizowany",
    images: [
      { src: lesna1, alt: "Elewacja – Leśna 4" },
      { src: lesna2, alt: "Salon – Leśna 4" },
      { src: lesna3, alt: "Taras – Leśna 4" }
    ]
  },
  {
    id: "service-1",
    name: "Budynek usługowo–mieszkalny – Centrum 7",
    location: "Lublin, Polska",
    type: "Usługowe / komercyjne",
    summary:
      "Funkcjonalny obiekt w ścisłym centrum miasta, łączący lokale usługowe z częścią mieszkalną.",
    description:
      "Inwestycja łącząca funkcje komercyjne i mieszkalne, zlokalizowana w ścisłym centrum miasta. Dolne kondygnacje przeznaczono na lokale usługowe, natomiast wyższe piętra umożliwiają elastyczną aranżację przestrzeni mieszkalnej. Projekt wyróżnia się nowoczesną fasadą oraz dużymi witrynami.",
    photographyBy: "SolidBud",
    year: 2019,
    floors: 6,
    usableArea: { value: 2850, unit: "m²" },
    structure: "Żelbet + fasada przeszklona",
    plotArea: { value: 1450, unit: "m²" },
    volume: { value: 9300, unit: "m³" },
    client: "Centrum Group",
    status: "Zrealizowany",
    images: [
      { src: centrum1, alt: "Elewacja frontowa – Centrum 7" },
      { src: centrum2, alt: "Lokale usługowe – Centrum 7" },
      { src: centrum3, alt: "Wejście główne – Centrum 7" }
    ]
  }
];

function formatNumber(value) {
  if (typeof value !== "number") return value;
  return value.toLocaleString("pl-PL");
}

export default function Projects() {
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [isMobile, setIsMobile] = useState(false);
  const [specCounters, setSpecCounters] = useState({
    year: 0,
    floors: 0,
    usableArea: 0,
    plotArea: 0,
    volume: 0
  });

  const touchStartXRef = useRef(null);
  const filmstripRef = useRef(null);

  const tiltY = useMotionValue(0);

  const imageX = useMotionValue(0);
  const imageY = useMotionValue(0);

  const imageScale = useTransform(tiltY, [-0.5, 0.5], [1.03, 1.06]);

  useEffect(() => {
    const checkIsMobile = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth <= 768);
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  let activeProject;
  if (isMobile) {
    activeProject =
      PROJECTS.find((project) => project.id === activeProjectId) || null;
  } else {
    const idToUse = activeProjectId || PROJECTS[0].id;
    activeProject =
      PROJECTS.find((project) => project.id === idToUse) || PROJECTS[0];
  }

  useEffect(() => {
    setActiveTab("description");
    setActiveImageIndex(0);
    tiltY.set(0);
  }, [activeProjectId, isMobile, tiltY]);

  useEffect(() => {
    if (!activeProject || isMobile) return;

    const targets = {
      year: activeProject.year,
      floors: activeProject.floors,
      usableArea: activeProject.usableArea?.value || 0,
      plotArea: activeProject.plotArea?.value || 0,
      volume: activeProject.volume?.value || 0
    };

    const animations = Object.entries(targets).map(([key, target]) =>
      animate(0, target, {
        duration: 0.8,
        ease: "easeOut",
        onUpdate: (value) => {
          setSpecCounters((prev) => ({
            ...prev,
            [key]: Math.round(value)
          }));
        }
      })
    );

    return () => {
      animations.forEach((control) => control.stop && control.stop());
    };
  }, [activeProject, isMobile]);

  const handleSelectProject = (id) => {
    if (isMobile && activeProjectId === id) {
      setActiveProjectId(null);
      return;
    }

    setActiveProjectId(id);

    if (!isMobile && filmstripRef.current) {
      const card = filmstripRef.current.querySelector(
        `[data-project-id="${id}"]`
      );
      if (card && typeof card.scrollIntoView === "function") {
        card.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest"
        });
      }
    }
  };

  const handlePrevImage = () => {
    if (!activeProject) return;
    setActiveImageIndex((prev) =>
      prev === 0 ? activeProject.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!activeProject) return;
    setActiveImageIndex((prev) =>
      prev === activeProject.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleThumbClick = (index) => {
    setActiveImageIndex(index);
  };

  const handleTouchStart = (e) => {
    if (!isMobile) return;
    touchStartXRef.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!isMobile || touchStartXRef.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const diff = endX - touchStartXRef.current;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handlePrevImage();
      } else {
        handleNextImage();
      }
    }

    touchStartXRef.current = null;
  };

  const handleHeroMouseMove = (e) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;

    imageX.set(x);
    imageY.set(y);
  };

  const handleHeroMouseLeave = () => {
    imageX.set(0);
    imageY.set(0);
  };


  const currentImage =
    activeProject && activeProject.images[activeImageIndex]
      ? activeProject.images[activeImageIndex]
      : null;

  return (
    <section
      id="executive-projects"
      className="section section--light projects-accordion"
    >
      <div className="section__inner projects-accordion__inner">
        <header className="projects-accordion__header">
          <p className="projects-accordion__kicker">Projekty</p>
          <h2 className="projects-accordion__heading">
            Realizacje wykonawcze
          </h2>
          <p className="projects-accordion__intro">
            Wybrane inwestycje wielorodzinne, usługowe i jednorodzinne
            zrealizowane w standardzie generalnego wykonawcy. Wybierz
            projekt, aby zobaczyć szczegóły i galerię zdjęć.
          </p>
        </header>

        {isMobile && (
          <div className="projects-accordion__cards">
            {PROJECTS.map((project) => {
              const cover = project.images[0];
              const isActive = project.id === activeProjectId;

              if (isActive && activeProject) {
                return (
                  <div
                    key={project.id}
                    className="projects-accordion__item projects-accordion__item--expanded-mobile"
                  >
                    <div
                      className="projects-accordion__card-mobile-header"
                      onClick={() => handleSelectProject(project.id)}
                    >
                      <span className="projects-accordion__card-type">
                        {project.type}
                      </span>
                      <span className="projects-accordion__card-name">
                        {project.name}
                      </span>
                      <span className="projects-accordion__card-location">
                        {project.location}
                      </span>
                    </div>

                    <div className="projects-accordion__mobile-detail">
                      <div className="projects-accordion__mobile-text">
                        <p className="projects-accordion__description">
                          {project.summary}
                        </p>
                        <p className="projects-accordion__description projects-accordion__description--secondary">
                          {project.description}
                        </p>
                        <p className="projects-accordion__photography">
                          <span className="projects-accordion__photography-label">
                            Photography by:
                          </span>{" "}
                          <span className="projects-accordion__photography-name">
                            {project.photographyBy}
                          </span>
                        </p>
                      </div>

                      <div className="projects-accordion__gallery">
                        <div
                          className="projects-accordion__image-wrapper"
                          onTouchStart={handleTouchStart}
                          onTouchEnd={handleTouchEnd}
                        >
                          {currentImage && (
                            <img
                              key={`${activeProject.id}-${activeImageIndex}`}
                              src={currentImage.src}
                              alt={currentImage.alt}
                              className="projects-accordion__image"
                              loading="lazy"
                            />
                          )}
                        </div>

                        <div className="projects-accordion__thumbs">
                          {project.images.map((image, index) => (
                            <button
                              key={`${project.id}-thumb-${index}`}
                              type="button"
                              className={
                                "projects-accordion__thumb" +
                                (index === activeImageIndex
                                  ? " projects-accordion__thumb--active"
                                  : "")
                              }
                              onClick={() => handleThumbClick(index)}
                            >
                              <img
                                src={image.src}
                                alt={image.alt}
                                className="projects-accordion__thumb-image"
                                loading="lazy"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={project.id} className="projects-accordion__item">
                  <button
                    type="button"
                    className="projects-accordion__card"
                    onClick={() => handleSelectProject(project.id)}
                  >
                    <div className="projects-accordion__card-image-wrap">
                      <img
                        src={cover.src}
                        alt={cover.alt}
                        className="projects-accordion__card-image"
                        loading="lazy"
                      />
                    </div>
                    <div className="projects-accordion__card-body">
                      <span className="projects-accordion__card-type">
                        {project.type}
                      </span>
                      <span className="projects-accordion__card-name">
                        {project.name}
                      </span>
                      <span className="projects-accordion__card-location">
                        {project.location}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {!isMobile && activeProject && (
          <>
            <motion.div
              className="projects-hero"
              initial={{ opacity: 0, y: 16, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <div className="projects-hero__text">
                <div className="projects-hero__eyebrow">
                  Realizacja {activeProject.year} · {activeProject.type}
                </div>

                <h3 className="projects-hero__title">
                  {activeProject.name}
                </h3>

                <p className="projects-hero__location">
                  {activeProject.location}
                </p>

                <div className="projects-hero__tabs">
                  <button
                    type="button"
                    className={
                      "projects-hero__tab" +
                      (activeTab === "description"
                        ? " projects-hero__tab--active"
                        : "")
                    }
                    onClick={() => setActiveTab("description")}
                  >
                    Opis
                  </button>
                  <button
                    type="button"
                    className={
                      "projects-hero__tab" +
                      (activeTab === "spec"
                        ? " projects-hero__tab--active"
                        : "")
                    }
                    onClick={() => setActiveTab("spec")}
                  >
                    Specyfikacja
                  </button>
                </div>

                <div className="projects-hero__tab-panel">
                  {activeTab === "description" && (
                    <div className="projects-hero__description-block">
                      <p className="projects-hero__description">
                        {activeProject.summary}
                      </p>
                      <p className="projects-hero__description projects-hero__description--secondary">
                        {activeProject.description}
                      </p>
                      <p className="projects-hero__photography">
                        <span className="projects-hero__photography-label">
                          Photography by:
                        </span>{" "}
                        <span className="projects-hero__photography-name">
                          {activeProject.photographyBy}
                        </span>
                      </p>
                    </div>
                  )}

                  {activeTab === "spec" && (
                    <div className="projects-hero__spec">
                      <ul className="projects-hero__spec-list">
                        <li className="projects-hero__spec-item">
                          <span className="projects-hero__spec-icon" />
                          <span className="projects-hero__spec-label">
                            Rok realizacji
                          </span>
                          <span className="projects-hero__spec-value">
                            {specCounters.year || activeProject.year}
                          </span>
                        </li>
                        <li className="projects-hero__spec-item">
                          <span className="projects-hero__spec-icon" />
                          <span className="projects-hero__spec-label">
                            Kondygnacje
                          </span>
                          <span className="projects-hero__spec-value">
                            {specCounters.floors || activeProject.floors}
                          </span>
                        </li>
                        <li className="projects-hero__spec-item">
                          <span className="projects-hero__spec-icon" />
                          <span className="projects-hero__spec-label">
                            Pow. użytkowa
                          </span>
                          <span className="projects-hero__spec-value">
                            {formatNumber(specCounters.usableArea) ||
                              formatNumber(
                                activeProject.usableArea?.value
                              )}{" "}
                            {activeProject.usableArea?.unit}
                          </span>
                        </li>
                        <li className="projects-hero__spec-item">
                          <span className="projects-hero__spec-icon" />
                          <span className="projects-hero__spec-label">
                            Pow. działki
                          </span>
                          <span className="projects-hero__spec-value">
                            {formatNumber(specCounters.plotArea) ||
                              formatNumber(
                                activeProject.plotArea?.value
                              )}{" "}
                            {activeProject.plotArea?.unit}
                          </span>
                        </li>
                        <li className="projects-hero__spec-item">
                          <span className="projects-hero__spec-icon" />
                          <span className="projects-hero__spec-label">
                            Kubatura
                          </span>
                          <span className="projects-hero__spec-value">
                            {formatNumber(specCounters.volume) ||
                              formatNumber(
                                activeProject.volume?.value
                              )}{" "}
                            {activeProject.volume?.unit}
                          </span>
                        </li>
                        <li className="projects-hero__spec-item">
                          <span className="projects-hero__spec-icon" />
                          <span className="projects-hero__spec-label">
                            Konstrukcja
                          </span>
                          <span className="projects-hero__spec-value">
                            {activeProject.structure}
                          </span>
                        </li>
                        <li className="projects-hero__spec-item">
                          <span className="projects-hero__spec-icon" />
                          <span className="projects-hero__spec-label">
                            Inwestor
                          </span>
                          <span className="projects-hero__spec-value">
                            {activeProject.client}
                          </span>
                        </li>
                        <li className="projects-hero__spec-item">
                          <span className="projects-hero__spec-icon" />
                          <span className="projects-hero__spec-label">
                            Status
                          </span>
                          <span className="projects-hero__spec-value">
                            {activeProject.status}
                          </span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <button type="button" className="projects-hero__cta">
                  Zobacz całą realizację
                </button>
              </div>

              <div className="projects-hero__gallery">
                <div
                  className="projects-hero__image-wrapper"
                  onMouseMove={handleHeroMouseMove}
                  onMouseLeave={handleHeroMouseLeave}
                >
                  <button
                    type="button"
                    className="projects-hero__arrow projects-hero__arrow--left"
                    onClick={handlePrevImage}
                  >
                    ‹
                  </button>

                  {currentImage && (
                    <motion.img
                      key={`${activeProject.id}-${activeImageIndex}`}
                      src={currentImage.src}
                      alt={currentImage.alt}
                      className="projects-hero__image"
                      style={{
                        x: imageX,
                        y: imageY,
                        scale: 1.08
                      }} loading="lazy"
                      transition={{
                        type: "spring",
                        stiffness: 70,
                        damping: 20
                      }}
                    />
                  )}

                  <button
                    type="button"
                    className="projects-hero__arrow projects-hero__arrow--right"
                    onClick={handleNextImage}
                  >
                    ›
                  </button>
                </div>

                <div className="projects-hero__thumbs">
                  {activeProject.images.map((image, index) => (
                    <button
                      key={`${activeProject.id}-thumb-${index}`}

                      type="button"
                      className={
                        "projects-hero__thumb" +
                        (index === activeImageIndex
                          ? " projects-hero__thumb--active"
                          : "")
                      }
                      onClick={() => handleThumbClick(index)}
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="projects-hero__thumb-image"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="projects-filmstrip-wrapper">
              <button
                type="button"
                className="projects-filmstrip__nav projects-filmstrip__nav--left"
                onClick={() => {
                  if (!activeProject) return;

                  const currentIndex = PROJECTS.findIndex(
                    (p) => p.id === activeProject.id
                  );
                  const prevIndex =
                    (currentIndex - 1 + PROJECTS.length) % PROJECTS.length;
                  const prevProject = PROJECTS[prevIndex];

                  handleSelectProject(prevProject.id);
                }}
              >
                ‹
              </button>


              <div
                className="projects-filmstrip"
                ref={filmstripRef}
              >
                {PROJECTS.map((project) => {
                  const cover = project.images[0];
                  const effectiveActiveId =
                    activeProjectId || PROJECTS[0].id;
                  const isActive = project.id === effectiveActiveId;

                  return (
                    <motion.button
                      key={project.id}
                      type="button"
                      data-project-id={project.id}
                      className={
                        "projects-filmstrip__card" +
                        (isActive
                          ? " projects-filmstrip__card--active"
                          : "")
                      }
                      onClick={() => handleSelectProject(project.id)}
                      whileHover={!isActive ? { y: -1 } : {}}
                      transition={{
                        type: "spring",
                        stiffness: 220,
                        damping: 18
                      }}
                    >
                      <div className="projects-filmstrip__image-wrap">
                        <img
                          src={cover.src}
                          alt={cover.alt}
                          className="projects-filmstrip__image"
                          loading="lazy"
                        />
                      </div>
                      <div className="projects-filmstrip__body">
                        <span className="projects-filmstrip__type">
                          {project.type}
                        </span>
                        <span className="projects-filmstrip__name">
                          {project.name}
                        </span>
                        <span className="projects-filmstrip__location">
                          {project.location}
                        </span>
                        <span className="projects-filmstrip__meta">
                          {project.year} · {project.floors} kond.
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <button
                type="button"
                className="projects-filmstrip__nav projects-filmstrip__nav--right"
                onClick={() => {
                  if (!activeProject) return;

                  const currentIndex = PROJECTS.findIndex(
                    (p) => p.id === activeProject.id
                  );
                  const nextIndex = (currentIndex + 1) % PROJECTS.length;
                  const nextProject = PROJECTS[nextIndex];

                  handleSelectProject(nextProject.id);
                }}
              >
                ›
              </button>

            </div>
          </>
        )}
      </div>
    </section>
  );
}
