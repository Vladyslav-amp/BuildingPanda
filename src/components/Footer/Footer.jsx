import React from "react";
import "./Footer.scss";

function Icon({ name }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (name) {
    case "instagram":
      return (
        <svg className="footer__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M7 3.8h10A3.2 3.2 0 0 1 20.2 7v10A3.2 3.2 0 0 1 17 20.2H7A3.2 3.2 0 0 1 3.8 17V7A3.2 3.2 0 0 1 7 3.8Z" />
          <path {...p} d="M12 16.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z" />
          <path {...p} d="M17.3 6.7h.01" />
        </svg>
      );
    case "facebook":
      return (
        <svg className="footer__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M14 9h3V6h-3a4 4 0 0 0-4 4v3H7v3h3v5h3v-5h3l1-3h-4v-3a1 1 0 0 1 1-1Z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className="footer__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M6.4 9.2V20" />
          <path {...p} d="M6.4 6.6h.01" />
          <path {...p} d="M10.2 9.2V20" />
          <path {...p} d="M10.2 12.2c.7-2.1 2.5-3.3 4.6-3.3 2.5 0 4.2 1.6 4.2 5V20" />
        </svg>
      );
    case "youtube":
      return (
        <svg className="footer__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M21 8.4a2.6 2.6 0 0 0-1.8-1.8C17.6 6.2 12 6.2 12 6.2s-5.6 0-7.2.4A2.6 2.6 0 0 0 3 8.4C2.6 10 2.6 12 2.6 12s0 2 .4 3.6A2.6 2.6 0 0 0 4.8 17.4c1.6.4 7.2.4 7.2.4s5.6 0 7.2-.4A2.6 2.6 0 0 0 21 15.6c.4-1.6.4-3.6.4-3.6s0-2-.4-3.6Z" />
          <path {...p} d="M10.6 14.8V9.2l4.8 2.8-4.8 2.8Z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Footer() {
  const year = new Date().getFullYear();

  // ПІДСТАВ СВОЇ РЕАЛЬНІ ДАНІ:
  const company = {
    name: "VAL&ART Sp. z o.o.",
    tagline: "Budowa • Wykończenia • Remonty • Inwestycje mieszkaniowe",
    addressLine1: "ul. Przykładowa 12, 00-000 Gdańsk, Polska",
    email: "kontakt@twojadomena.pl",
    phone: "+48 000 000 000",
    phone2: "+48 000 000 001",
    hours: "Pon–Pt: 8:00–18:00 | Sob: 9:00–14:00",
    nip: "000-000-00-00",
    regon: "000000000",
    krs: "0000000000",
    shareCapital: "5 000 zł",
    // bank: "PL00 0000 0000 0000 0000 0000 0000",
    socials: {
      instagram: "#",
      facebook: "#",
      linkedin: "#",
      youtube: "#",
    },
  };

  return (
    <footer className="footer" aria-label="Stopka">
      <div className="footer__top">
        <div className="footer__logoRow">
          <div className="footer__mark" aria-hidden="true">
            <span className="footer__markInner" />
          </div>
          <div className="footer__brandText">
            <p className="footer__companyName">{company.name}</p>
            <p className="footer__tagline">{company.tagline}</p>
          </div>
        </div>
        <div className="footer__inner">
          {/* Navigation columns */}
          <nav className="footer__nav" aria-label="Nawigacja stopki">
            <div className="footer__col">
              <p className="footer__colTitle">Nawigacja</p>
              <a className="footer__link" href="#about">O nas</a>
              <a className="footer__link" href="#services">Usługi</a>
              <a className="footer__link" href="#realizations">Realizacje</a>
              <a className="footer__link" href="#process">Jak pracujemy</a>
              <a className="footer__link" href="#calculator">Kalkulator</a>
              <a className="footer__link" href="#faq">FAQ</a>
              <a className="footer__link" href="#contact">Kontakt</a>
            </div>

            <div className="footer__col">
              <p className="footer__colTitle">Oferta</p>
              <a className="footer__link" href="#services">Budowa domów</a>
              <a className="footer__link" href="#services">Budowa wielorodzinna</a>
              <a className="footer__link" href="#services">Wykończenia pod klucz</a>
              <a className="footer__link" href="#services">Remonty mieszkań</a>
              <a className="footer__link" href="#services">Lokale usługowe</a>
              <a className="footer__link" href="#services">Projekt i nadzór</a>
            </div>

            <div className="footer__col">
              <p className="footer__colTitle">Kontakt</p>
              <p className="footer__text">{company.addressLine1}</p>
              <a className="footer__link footer__link--strong" href={`tel:${company.phone.replace(/\s+/g, "")}`}>
                {company.phone}
              </a>
              <a className="footer__link" href={`tel:${company.phone2.replace(/\s+/g, "")}`}>
                {company.phone2}
              </a>
              <a className="footer__link" href={`mailto:${company.email}`}>
                {company.email}
              </a>
              <p className="footer__text footer__text--muted">{company.hours}</p>
            </div>

            <div className="footer__col">
              <p className="footer__colTitle">Dokumenty</p>
              <a className="footer__link" href="/polityka-prywatnosci">Polityka prywatności</a>
              <a className="footer__link" href="/rodo">RODO</a>
              <a className="footer__link" href="/regulamin">Regulamin</a>
              <a className="footer__link" href="/cookies">Cookies</a>
            </div>

            {/* NEW: Dane rejestrowe block INSIDE nav (as you asked) */}
            <div className="footer__col footer__col--wide">
              <p className="footer__colTitle">Dane rejestrowe</p>

              <div className="footer__registry">
                <div className="footer__regItem">
                  <span className="footer__regLabel">NIP</span>
                  <span className="footer__regValue">{company.nip}</span>
                </div>
                <div className="footer__regItem">
                  <span className="footer__regLabel">REGON</span>
                  <span className="footer__regValue">{company.regon}</span>
                </div>
                <div className="footer__regItem">
                  <span className="footer__regLabel">KRS</span>
                  <span className="footer__regValue">{company.krs}</span>
                </div>
                <div className="footer__regItem">
                  <span className="footer__regLabel">Kapitał zakładowy</span>
                  <span className="footer__regValue">{company.shareCapital}</span>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="footer__inner footer__inner--bottom">
          <p className="footer__copyright">
            © {year} {company.name}. Wszelkie prawa zastrzeżone.
          </p>

          <div className="footer__social" aria-label="Social media">
            <a className="footer__socialBtn" href={company.socials.instagram} aria-label="Instagram">
              <Icon name="instagram" />
            </a>
            <a className="footer__socialBtn" href={company.socials.facebook} aria-label="Facebook">
              <Icon name="facebook" />
            </a>
            <a className="footer__socialBtn" href={company.socials.linkedin} aria-label="LinkedIn">
              <Icon name="linkedin" />
            </a>
            <a className="footer__socialBtn" href={company.socials.youtube} aria-label="YouTube">
              <Icon name="youtube" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
