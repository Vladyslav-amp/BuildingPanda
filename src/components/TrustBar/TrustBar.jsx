import React, {useEffect, useState} from 'react';

import './TrustBar.scss';

import dekpol from '../../assets/partners/dekpol.webp';
import duna from '../../assets/partners/duna.webp';
import erbud from '../../assets/partners/erbud.webp';

const partners = [
  { name: 'Partner 01', logo: dekpol },
  { name: 'Partner 02', logo: duna },
  { name: 'Partner 03', logo: erbud },
];

const getOffset = (index, activeIndex, total) => {
  let offset = index - activeIndex;

  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;

  return offset;
};

const PartnersSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToPrev = () => {
    setActiveIndex((current) =>
      current === 0 ? partners.length - 1 : current - 1
    );
  };

  const goToNext = () => {
    setActiveIndex((current) =>
      current === partners.length - 1 ? 0 : current + 1
    );
  };

  useEffect(() => {
    const interval = setInterval(goToNext, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="partners">
      <div className="partners__container">
        <div className="partners__header">
          <span className="partners__eyebrow">Zaufali nam</span>

          <h2 className="partners__title">Nasi partnerzy biznesowi</h2>

          <p className="partners__text">
            Współpracujemy ze sprawdzonymi markami, które wspierają nas w
            realizacji inwestycji premium od koncepcji po perfekcyjne wykonanie.
          </p>
        </div>

        <div className="partners__carousel">
          {/* <button
            className="partners__arrow partners__arrow--prev"
            type="button"
            onClick={goToPrev}
            aria-label="Poprzedni partner"
          >
            ‹
          </button> */}

          <div className="partners__stage">
            {partners.map((partner, index) => {
              const offset = getOffset(index, activeIndex, partners.length);
              const absOffset = Math.abs(offset);
              const isVisible = absOffset <= 3;

              return (
                <button
                  className={`partners__card ${
                    offset === 0 ? 'partners__card--active' : ''
                  }`}
                  key={partner.name}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  style={{
                    '--offset': offset,
                    '--abs-offset': absOffset,
                    '--direction': offset < 0 ? -1 : 1,
                    '--z-index': 10 - absOffset,
                  }}
                  aria-label={partner.name}
                  aria-hidden={!isVisible}
                >
                  {/* <span className="partners__number">
                    {String(index + 1).padStart(2, '0')}
                  </span> */}

                  <img
                    className="partners__logo"
                    src={partner.logo}
                    alt={partner.name}
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>

          {/* <button
            className="partners__arrow partners__arrow--next"
            type="button"
            onClick={goToNext}
            aria-label="Następny partner"
          >
            ›
          </button> */}
        </div>

        <div className="partners__dots" aria-label="Lista partnerów">
          {partners.map((partner, index) => (
            <button
              className={`partners__dot ${
                index === activeIndex ? 'partners__dot--active' : ''
              }`}
              key={partner.name}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Pokaż ${partner.name}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};


export default PartnersSection;


