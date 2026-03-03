import { useState, useEffect, useRef, useMemo } from "react";
import { motion, useMotionValue } from "framer-motion";
import "./Projects.scss";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import PROJECTS_RAW from "../../data/project.json";
import { buildProjectImages } from "../../lib/buildProjectImages";

function formatNumber(value) {
  if (typeof value !== "number") return value;
  return value.toLocaleString("pl-PL");
}

function SpecList({ project, variant = "projects" }) {
  if (!project) return null;

  const rows = [
    ["Rok realizacji", project.year],
    ["Kondygnacje", project.floors],
    ["Pow. użytkowa", `${formatNumber(project.usableArea?.value)} ${project.usableArea?.unit || ""}`.trim()],
    ["Pow. działki", `${formatNumber(project.plotArea?.value)} ${project.plotArea?.unit || ""}`.trim()],
    ["Kubatura", `${formatNumber(project.volume?.value)} ${project.volume?.unit || ""}`.trim()],
    ["Konstrukcja", project.structure],
    ["Inwestor", project.client],
    ["Status", project.status],
  ].filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "");

  return (
    <ul className={`${variant}__spec-list`}>
      {rows.map(([label, value]) => (
        <li key={label} className={`${variant}__spec-row`}>
          <span className={`${variant}__spec-label`}>{label}</span>
          <span className={`${variant}__spec-value`}>{value}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Projects() {
  const PROJECTS = useMemo(() => {
    return (PROJECTS_RAW || []).map((p) => ({
      ...p,
      images: buildProjectImages(p, [400, 1200]),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PROJECTS_RAW]);

  const COMPACT_BP = 1100;

  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [isMobile, setIsMobile] = useState(false);
  const [isCompactDesktop, setIsCompactDesktop] = useState(false);

  const [isSpecOpen, setIsSpecOpen] = useState(false);

  // Lightbox
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const lightboxThumbsSwiperRef = useRef(null);

  const heroThumbsSwiperRef = useRef(null);

  const [lbSrc, setLbSrc] = useState(null);
  const [lbIsFading, setLbIsFading] = useState(false);
  const [lbPanelWidth, setLbPanelWidth] = useState(null);

  const touchStartXRef = useRef(null);
  const mobileSwiperRef = useRef(null);
  const activeMobileItemRef = useRef(null);
  const scrollBeforeOpenRef = useRef(0);

  const sidebarRef = useRef(null);

  const imageX = useMotionValue(0);
  const imageY = useMotionValue(0);

  useEffect(() => {
    const onResize = () => {
      if (typeof window === "undefined") return;
      const w = window.innerWidth;

      const mobile = w <= 768;
      setIsMobile(mobile);
      setIsCompactDesktop(!mobile && w < COMPACT_BP);
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  let activeProject = null;

  if (isMobile) {
    activeProject =
      PROJECTS.find((project) => project.id === activeProjectId) || null;
  } else {
    const idToUse = activeProjectId || PROJECTS[0]?.id;
    activeProject =
      PROJECTS.find((project) => project.id === idToUse) || PROJECTS[0] || null;
  }

  const effectiveActiveId = activeProjectId || PROJECTS[0]?.id;

  const currentImage =
    activeProject && activeProject.images?.[activeImageIndex]
      ? activeProject.images[activeImageIndex]
      : null;

  useEffect(() => {
    setActiveImageIndex(0);
    imageX.set(0);
    imageY.set(0);

    setIsSpecOpen(false);
  }, [activeProjectId, isMobile, isCompactDesktop, imageX, imageY]);

  useEffect(() => {
    const s = mobileSwiperRef.current;
    if (!s) return;

    const locked = !!activeProjectId;
    s.allowTouchMove = !locked;

    if (locked) {
      try {
        s.slideTo(s.activeIndex, 0);
      } catch {
        "";
      }
    }
  }, [activeProjectId]);

  const scrollActiveCardIntoView = () => {
    const el = activeMobileItemRef.current;
    if (!el) return;

    const HEADER_OFFSET = 80;
    const rect = el.getBoundingClientRect();
    const top = window.pageYOffset + rect.top - HEADER_OFFSET;

    window.scrollTo({ top, behavior: "smooth" });
  };

  useEffect(() => {
    if (!isMobile) return;
    if (!activeProjectId) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollActiveCardIntoView();
        setTimeout(scrollActiveCardIntoView, 150);
      });
    });
  }, [activeProjectId, isMobile]);

  const handleSelectProject = (id) => {
    if (isMobile && activeProjectId === id) {
      setActiveProjectId(null);

      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollBeforeOpenRef.current,
          behavior: "auto",
        });
      });

      return;
    }

    if (isMobile) {
      scrollBeforeOpenRef.current = window.pageYOffset;
    }

    setActiveProjectId(id);

    if (!isMobile && !isCompactDesktop && sidebarRef.current) {
      const item = sidebarRef.current.querySelector(`[data-project-id="${id}"]`);
      item?.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
      if (diff > 0) handlePrevImage();
      else handleNextImage();
    }

    touchStartXRef.current = null;
  };

  const handleHeroMouseMove = (e) => {
    if (isMobile || isCompactDesktop) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 14;

    imageX.set(x);
    imageY.set(y);
  };

  const handleHeroMouseLeave = () => {
    imageX.set(0);
    imageY.set(0);
  };

  const closeLightbox = () => setIsLightboxOpen(false);

  useEffect(() => {
    if (!isLightboxOpen || !currentImage) return;

    setLbSrc(currentImage.mainUrl);
    setLbIsFading(false);
  }, [isLightboxOpen, currentImage?.mainUrl]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLightboxOpen, activeProject, activeImageIndex]);

  useEffect(() => {
    if (!isLightboxOpen || !activeProject?.images?.length) return;

    const n = activeProject.images.length;
    const prev = (activeImageIndex - 1 + n) % n;
    const next = (activeImageIndex + 1) % n;

    [prev, next].forEach((i) => {
      const src = activeProject.images[i]?.mainUrl;
      if (!src) return;
      const im = new Image();
      im.src = src;
    });
  }, [isLightboxOpen, activeProject, activeImageIndex]);

  const computePanelWidth = (naturalWidth) => {
    if (typeof window === "undefined") return null;
    const cap = Math.floor(window.innerWidth * 0.96);
    const desired = Math.floor(naturalWidth + 200);
    return Math.min(desired, cap);
  };

  useEffect(() => {
    if (!isLightboxOpen || !currentImage) return;

    const nextSrc = currentImage.mainUrl;
    if (!nextSrc) return;

    let cancelled = false;
    const img = new Image();
    img.src = nextSrc;

    img.onload = () => {
      if (cancelled) return;

      const w = computePanelWidth(img.naturalWidth || 0);
      if (w) setLbPanelWidth(w);
      if (lbSrc === nextSrc) return;
      setLbIsFading(true);
      requestAnimationFrame(() => {
        if (cancelled) return;
        setLbSrc(nextSrc);
        requestAnimationFrame(() => setLbIsFading(false));
      });
    };

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLightboxOpen, currentImage?.mainUrl]);

  useEffect(() => {
    if (isMobile) return;
    if (isCompactDesktop) return;
    const s = heroThumbsSwiperRef.current;
    if (!s) return;

    try {
      const total = activeProject?.images?.length || 0;
      if (!total) return;

      const target = Math.max(0, Math.min(activeImageIndex - 2, total - 1));
      s.slideTo(target, 250);
    } catch {
      "";
    }
  }, [activeImageIndex, isMobile, isCompactDesktop, activeProject?.id]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const s = lightboxThumbsSwiperRef.current;
    if (!s) return;

    try {
      s.slideTo(activeImageIndex);
    } catch {
      "";
    }
  }, [activeImageIndex, isLightboxOpen]);

  return (
    <section id="realizations" className="section section--light projects-accordion">
      <div className="section__inner projects-accordion__inner">
        <header className="projects-accordion__header">
          <p className="projects-accordion__kicker">Projekty</p>
          <h2 className="projects-accordion__heading">Realizacje wykonawcze</h2>
          <p className="projects-accordion__intro">
            Wybrane inwestycje wielorodzinne, usługowe i jednorodzinne
            zrealizowane w standardzie generalnego wykonawcy. Wybierz projekt,
            aby zobaczyć szczegóły i galerię zdjęć.
          </p>
        </header>

        {/* MOBILE */}
        {isMobile && (
          <div className="projects-accordion__slider" style={{ "--projects-progress": "#00E5FF" }}>
            <Swiper
              onSwiper={(s) => (mobileSwiperRef.current = s)}
              nested
              touchStartPreventDefault={false}
              modules={[Pagination]}
              slidesPerView={1}
              spaceBetween={12}
              pagination={{ type: "progressbar" }}
            >
              {PROJECTS.map((project) => {
                const cover = project.images?.[0];
                const isActive = project.id === activeProjectId;

                return (
                  <SwiperSlide key={project.id}>
                    {isActive && activeProject ? (
                      <div
                        ref={isActive ? activeMobileItemRef : null}
                        className="projects-accordion__item projects-accordion__item--expanded-mobile"
                      >
                        <div
                          className="projects-accordion__card-mobile-header"
                          onClick={() => handleSelectProject(project.id)}
                        >
                          <span className="projects-accordion__card-type">{project.type}</span>
                          <span className="projects-accordion__card-name">{project.name}</span>
                          <span className="projects-accordion__card-location">{project.location}</span>
                        </div>

                        <div className="projects-accordion__mobile-detail">
                          <div className="projects-accordion__mobile-text">
                            <p className="projects-accordion__description">{project.summary}</p>
                            <p className="projects-accordion__description projects-accordion__description--secondary">
                              {project.description}
                            </p>

                            <button
                              type="button"
                              className="projects-accordion__spec-toggle"
                              aria-expanded={isSpecOpen}
                              onClick={() => setIsSpecOpen((v) => !v)}
                            >
                              Specyfikacja {isSpecOpen ? "—" : "+"}
                            </button>

                            <div className={"projects-accordion__spec" + (isSpecOpen ? " is-open" : "")}>
                              <SpecList project={project} variant="projects-accordion" />
                            </div>
                          </div>

                          <div className="projects-accordion__gallery">
                            <div
                              className="projects-accordion__image-wrapper"
                              onTouchStart={handleTouchStart}
                              onTouchEnd={handleTouchEnd}
                            >
                              {currentImage && (
                                <img
                                  src={currentImage.mainUrl}
                                  alt={currentImage.alt}
                                  className="projects-accordion__image"
                                  loading="lazy"
                                  decoding="async"
                                  width={currentImage.width}
                                  height={currentImage.height}
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
                                    (index === activeImageIndex ? " projects-accordion__thumb--active" : "")
                                  }
                                  onClick={() => handleThumbClick(index)}
                                >
                                  <img
                                    src={image.thumbUrl}
                                    alt={image.alt}
                                    className="projects-accordion__thumb-image"
                                    loading="lazy"
                                    decoding="async"
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="projects-accordion__item">
                        <button
                          type="button"
                          className="projects-accordion__card"
                          onClick={() => handleSelectProject(project.id)}
                        >
                          <div className="projects-accordion__card-image-wrap">
                            {cover?.thumbUrl && (
                              <img
                                src={cover.thumbUrl}
                                alt={cover.alt}
                                className="projects-accordion__card-image"
                                loading="lazy"
                                decoding="async"
                              />
                            )}
                          </div>
                          <div className="projects-accordion__card-body">
                            <span className="projects-accordion__card-type">{project.type}</span>
                            <span className="projects-accordion__card-name">{project.name}</span>
                            <span className="projects-accordion__card-location">{project.location}</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        )}

        {/* COMPACT DESKTOP / TABLET */}
        {!isMobile && isCompactDesktop && activeProject && (
          <motion.div
            className="projects-compact"
            initial={{ opacity: 0, y: 12, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.38, ease: "easeOut" }}
          >
            <div className="projects-compact__top">
              <div className="projects-hero__eyebrow">
                Realizacja {activeProject.year} · {activeProject.type}
              </div>

              <h3 className="projects-hero__title">{activeProject.name}</h3>
              <p className="projects-hero__location">{activeProject.location}</p>

              <div className="projects-compact__copy">
                <p className="projects-hero__description">{activeProject.summary}</p>
                <p className="projects-hero__description projects-hero__description--secondary">
                  {activeProject.description}
                </p>
              </div>

              <button
                type="button"
                className="projects-compact__spec-toggle"
                aria-expanded={isSpecOpen}
                onClick={() => setIsSpecOpen((v) => !v)}
              >
                Specyfikacja {isSpecOpen ? "—" : "+"}
              </button>

              <div className={"projects-compact__spec" + (isSpecOpen ? " is-open" : "")}>
                <SpecList project={activeProject} variant="projects-compact" />
              </div>
            </div>

            <div className="projects-compact__carousel">
              <Swiper
                modules={[Pagination]}
                slidesPerView={1}
                spaceBetween={12}
                pagination={{ type: "fraction" }}
                onSlideChange={(s) => setActiveImageIndex(s.activeIndex)}
              >
                {activeProject.images.map((img, idx) => (
                  <SwiperSlide key={`${activeProject.id}-c-${idx}`}>
                    <div className="projects-compact__slide">
                      <img
                        src={img.mainUrl}
                        alt={img.alt}
                        loading={idx === 0 ? "eager" : "lazy"}
                        decoding="async"
                        width={img.width}
                        height={img.height}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </motion.div>
        )}

        {/* WIDE DESKTOP */}
        {!isMobile && !isCompactDesktop && activeProject && (
          <div className="projects-desktop">
            <aside className="projects-sidebar" ref={sidebarRef}>
              <div className="projects-sidebar__title">Wybierz realizację</div>

              <div className="projects-sidebar__list">
                {PROJECTS.map((project) => {
                  const cover = project.images?.[0];
                  const isActive = project.id === effectiveActiveId;

                  return (
                    <button
                      key={project.id}
                      type="button"
                      data-project-id={project.id}
                      className={"projects-sidebar__item" + (isActive ? " projects-sidebar__item--active" : "")}
                      onClick={() => handleSelectProject(project.id)}
                    >
                      <div className="projects-sidebar__thumb">
                        {cover?.thumbUrl && (
                          <img src={cover.thumbUrl} alt={cover.alt} loading="lazy" decoding="async" />
                        )}
                      </div>

                      <div className="projects-sidebar__meta">
                        <div className="projects-sidebar__type">{project.type}</div>
                        <div className="projects-sidebar__name">{project.name}</div>
                        <div className="projects-sidebar__location">{project.location}</div>
                        <div className="projects-sidebar__facts">
                          {project.year} · {project.floors} kond.
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <motion.div
              className="projects-hero"
              initial={{ opacity: 0, y: 12, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
            >
              <div className="projects-hero__text">
                <div className="projects-hero__eyebrow">
                  Realizacja {activeProject.year} · {activeProject.type}
                </div>

                <h3 className="projects-hero__title">{activeProject.name}</h3>
                <p className="projects-hero__location">{activeProject.location}</p>

                <div className="projects-hero__editorial">
                  <div className="projects-hero__copy">
                    <p className="projects-hero__description">{activeProject.summary}</p>
                    <p className="projects-hero__description projects-hero__description--secondary">
                      {activeProject.description}
                    </p>
                  </div>

                  <div className="projects-hero__specAccordion">
                    <button
                      type="button"
                      className="projects-hero__spec-toggle"
                      aria-expanded={isSpecOpen}
                      onClick={() => setIsSpecOpen((v) => !v)}
                    >
                      Specyfikacja {isSpecOpen ? "—" : "+"}
                    </button>

                    <div className={"projects-hero__spec" + (isSpecOpen ? " is-open" : "")}>
                      <SpecList project={activeProject} variant="projects-hero" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="projects-hero__gallery">
                <div
                  className="projects-hero__image-wrapper"
                  onMouseMove={handleHeroMouseMove}
                  onMouseLeave={handleHeroMouseLeave}
                  onClick={() => setIsLightboxOpen(true)}
                  role="button"
                  tabIndex={0}
                >
                  <button
                    type="button"
                    className="projects-hero__arrow projects-hero__arrow--left"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    aria-label="Poprzednie zdjęcie"
                  >
                    ‹
                  </button>

                  {currentImage && (
                    <motion.img
                      src={currentImage.mainUrl}
                      alt={currentImage.alt}
                      className="projects-hero__image"
                      decoding="async"
                      fetchpriority="high"
                      width={currentImage.width}
                      height={currentImage.height}
                      style={{ x: imageX, y: imageY, scale: 1.06 }}
                      transition={{ type: "spring", stiffness: 70, damping: 22 }}
                    />
                  )}

                  <button
                    type="button"
                    className="projects-hero__arrow projects-hero__arrow--right"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    aria-label="Następne zdjęcie"
                  >
                    ›
                  </button>

                  <div className="projects-hero__counter">
                    {activeImageIndex + 1} / {activeProject.images.length}
                  </div>
                </div>

                <div className="projects-hero__thumbs-carousel">
                  <Swiper
                    onSwiper={(s) => (heroThumbsSwiperRef.current = s)}
                    modules={[FreeMode]}
                    freeMode
                    slidesPerView="auto"
                    spaceBetween={10}
                    watchSlidesProgress
                  >
                    {activeProject.images.map((image, index) => (
                      <SwiperSlide key={`${activeProject.id}-thumbslide-${index}`} style={{ width: "92px" }}>
                        <button
                          type="button"
                          className={
                            "projects-hero__thumb" + (index === activeImageIndex ? " projects-hero__thumb--active" : "")
                          }
                          onClick={() => handleThumbClick(index)}
                          aria-label={`Wybierz zdjęcie ${index + 1}`}
                        >
                          <img
                            src={image.thumbUrl}
                            alt={image.alt}
                            className="projects-hero__thumb-image"
                            loading="lazy"
                            decoding="async"
                          />
                        </button>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {!isMobile && activeProject && currentImage && isLightboxOpen && (
        <div className="projects-lightbox" role="dialog" aria-modal="true" onClick={closeLightbox}>
          <div
            className="projects-lightbox__panel"
            style={lbPanelWidth ? { width: lbPanelWidth } : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="projects-lightbox__stage" style={{ "--lb-bg": `url("${lbSrc || currentImage.mainUrl}")` }}>
              <button
                type="button"
                className="projects-lightbox__close"
                onClick={closeLightbox}
                aria-label="Zamknij"
              >
                ✕
              </button>

              <button
                type="button"
                className="projects-lightbox__nav projects-lightbox__nav--left"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                aria-label="Poprzednie zdjęcie"
              >
                ‹
              </button>

              <div className="projects-lightbox__image-wrap">
                <img
                  src={lbSrc || currentImage.mainUrl}
                  alt={currentImage.alt}
                  className={"projects-lightbox__image" + (lbIsFading ? " is-fading" : "")}
                  decoding="async"
                />
              </div>

              <button
                type="button"
                className="projects-lightbox__nav projects-lightbox__nav--right"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                aria-label="Następne zdjęcie"
              >
                ›
              </button>

              <div className="projects-lightbox__counter">
                {activeImageIndex + 1} / {activeProject.images.length}
              </div>
            </div>

            <div className="projects-lightbox__thumbs">
              <Swiper
                onSwiper={(s) => (lightboxThumbsSwiperRef.current = s)}
                modules={[FreeMode]}
                freeMode
                slidesPerView="auto"
                spaceBetween={10}
                watchSlidesProgress
                onAfterInit={(s) => {
                  try {
                    s.slideTo(activeImageIndex, 0);
                  } catch {
                    "";
                  }
                }}
              >
                {activeProject.images.map((img, idx) => (
                  <SwiperSlide key={`${activeProject.id}-lb-thumb-${idx}`} style={{ width: "92px" }}>
                    <button
                      type="button"
                      className={
                        "projects-lightbox__thumb" + (idx === activeImageIndex ? " projects-lightbox__thumb--active" : "")
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex(idx);
                      }}
                      aria-label={`Wybierz zdjęcie ${idx + 1}`}
                    >
                      <img src={img.thumbUrl} alt={img.alt} decoding="async" loading="lazy" />
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}