import React, { useMemo, useRef, useState, useEffect } from "react";
import "./ContactUs.scss";

const HEADER_OFFSET = 80;



function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function scrollToTopOfSection(el) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  const y = window.scrollY + r.top - HEADER_OFFSET;
  window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

function isPhone(v) {
  const s = String(v || "").trim();
  const digits = s.replace(/[^\d]/g, "");
  return digits.length >= 7;
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
    case "phone":
      return (
        <svg className="contact__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            {...p}
            d="M7 3h4l1 5-3 1c1 3 3 5 6 6l1-3 5 1v4c0 1-1 2-2 2C10 20 4 14 4 6c0-1 1-3 3-3Z"
          />
        </svg>
      );
    case "mail":
      return (
        <svg className="contact__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M4 6h16v12H4V6Z" />
          <path {...p} d="m4 7 8 6 8-6" />
        </svg>
      );
    case "pin":
      return (
        <svg className="contact__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            {...p}
            d="M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Z"
          />
          <path {...p} d="M12 10.5a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" />
        </svg>
      );
    case "clock":
    default:
      return (
        <svg className="contact__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9Z" />
          <path {...p} d="M12 7v5l3.2 2" />
        </svg>
      );
  }
}



export default function Contact() {
  const sectionRef = useRef(null);

  const steps = useMemo(
    () => [
      { title: "Dane kontaktowe", subtitle: "Imię, e-mail i telefon" },
      { title: "Szczegóły zlecenia", subtitle: "Zakres i termin" },
      { title: "Wiadomość", subtitle: "Opis + zgoda" },
    ],
    []
  );

  const [step, setStep] = useState(0);
  const [status, setStatus] = useState("idle");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    service: "Remont mieszkania",
    city: "",
    timeframe: "W ciągu 1–3 miesięcy",
    message: "",
    consentContact: false,
    consentPersonalData: false,
    website: "",
  });



  const [touched, setTouched] = useState({});
  const progress = clamp((step + 1) / steps.length, 0, 1);

  function setField(name, value) {
    setForm((s) => ({ ...s, [name]: value }));
  }

  function touch(fields) {
    setTouched((s) => {
      const next = { ...s };
      fields.forEach((f) => (next[f] = true));
      return next;
    });
  }

  const errors = useMemo(() => {
    const e = {};

    if (!String(form.fullName).trim()) e.fullName = "Podaj imię i nazwisko.";
    if (!isEmail(form.email)) e.email = "Podaj poprawny adres e-mail.";
    if (!isPhone(form.phone)) e.phone = "Podaj poprawny numer telefonu.";

    if (!String(form.city).trim()) e.city = "Podaj miasto / lokalizację.";
    if (!String(form.message).trim()) e.message = "Napisz krótką wiadomość.";
    if (!form.consent) e.consent = "Wymagana zgoda na kontakt.";
    if (!form.consentContact) e.consentContact = "Wymagana zgoda na kontakt.";
    if (!form.consentPersonalData) e.consentPersonalData = "Wymagana zgoda na przetwarzanie danych.";



    return e;
  }, [form]);

  function canGoNext() {
    if (step === 0) return !errors.fullName && !errors.email && !errors.phone;
    if (step === 1) return !errors.city;
    return true;
  }

  function onNext() {
    if (step === 0) touch(["fullName", "email", "phone"]);
    if (step === 1) touch(["city"]);
    if (!canGoNext()) return;

    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function onBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  const showStatus = (value) => {
    setStatus(value);

    if (value === "success" || value === "error") {
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    }
  };


  async function onSubmit(e) {
    e.preventDefault();

    touch([
      "fullName",
      "email",
      "phone",
      "city",
      "message",
      "consentContact",
      "consentPersonalData",
    ]);

    if (
      errors.fullName ||
      errors.email ||
      errors.phone ||
      errors.city ||
      errors.message ||
      errors.consentContact ||
      errors.consentPersonalData
    ) {
      setStatus("idle");
      return;
    }


    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("request_failed");
      const data = await res.json();
      if (!data.ok) throw new Error("api_failed");


      showStatus("success");
      setStep(0);
      setForm({
        fullName: "",
        email: "",
        phone: "",
        service: "Remont mieszkania",
        city: "",
        timeframe: "W ciągu 1–3 miesięcy",
        message: "",
        consentContact: false,
        consentPersonalData: false,
        website: "",
      });

      setTouched({});
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const id = requestAnimationFrame(() => {
      scrollToTopOfSection(sectionRef.current);
    });
    return () => cancelAnimationFrame(id);
  }, [step]);




  return (
    <section className="contact" id="contact" ref={sectionRef} aria-label="Kontakt">
      <div className="contact__inner">
        <header className="contact__header">
          <p className="contact__kicker">Kontakt</p>
          <h2 className="contact__heading">Porozmawiajmy o Twoim projekcie</h2>
          <p className="contact__lead">
            Zostaw dane — wrócimy z odpowiedzią i propozycją dalszych kroków. Premium to szybka, konkretna komunikacja.
          </p>
        </header>

        <div className="contact__grid">
          <aside className="contact__aside" aria-label="Dane kontaktowe">
            <div className="contact__infoCard">
              <div className="contact__infoRow">
                <div className="contact__infoBadge" aria-hidden="true">
                  <Icon name="phone" />
                </div>
                <div className="contact__infoBody">
                  <p className="contact__infoTitle">Telefon</p>
                  <p className="contact__infoText">+48 576 530 094</p>
                </div>
              </div>

              <div className="contact__divider" />

              <div className="contact__infoRow">
                <div className="contact__infoBadge" aria-hidden="true">
                  <Icon name="mail" />
                </div>
                <div className="contact__infoBody">
                  <p className="contact__infoTitle">E-mail</p>
                  <p className="contact__infoText">buildingpanda.pl@gmail.com</p>
                </div>
              </div>

              <div className="contact__divider" />

              <div className="contact__infoRow">
                <div className="contact__infoBadge" aria-hidden="true">
                  <Icon name="pin" />
                </div>
                <div className="contact__infoBody">
                  <p className="contact__infoTitle">Lokalizacja</p>
                  <p className="contact__infoText">Niedźwiednik 36E, 80-292 Gdańsk</p>
                </div>
              </div>

              <div className="contact__divider" />

              <div className="contact__infoRow">
                <div className="contact__infoBadge" aria-hidden="true">
                  <Icon name="clock" />
                </div>
                <div className="contact__infoBody">
                  <p className="contact__infoTitle">Godziny</p>
                  <p className="contact__infoText">Pon–Pt: 8:00–16:00</p>
                </div>
              </div>
            </div>

            <div className="contact__trustCard">
              <p className="contact__trustTitle">Co zyskujesz</p>
              <ul className="contact__trustList">
                <li className="contact__trustItem">
                  <span className="contact__trustDot" />
                  Jasny kosztorys i harmonogram
                </li>
                <li className="contact__trustItem">
                  <span className="contact__trustDot" />
                  Stały nadzór i raportowanie postępu
                </li>
                <li className="contact__trustItem">
                  <span className="contact__trustDot" />
                  Odbiór na checklistach + gwarancja
                </li>
              </ul>
              <p className="contact__trustNote">
                Odpowiadamy zwykle w ciągu <span className="contact__trustStrong">24 godzin</span>.
              </p>
            </div>
          </aside>

          <div className="contact__right" aria-label="Formularz kontaktowy">
            <div className="contact__formWrap">
              <div className="contact__formTop">
                <div className="contact__stepMeta">
                  <p className="contact__stepTitle">{steps[step].title}</p>
                  <p className="contact__stepSub">{steps[step].subtitle}</p>
                </div>

                <div className="contact__progress" aria-hidden="true">
                  <div className="contact__progressTrack">
                    <div
                      className="contact__progressFill"
                      style={{ transform: `scaleX(${progress})` }}
                    />
                  </div>
                  <div className="contact__progressLabels">
                    {steps.map((_, i) => (
                      <span
                        key={i}
                        className={`contact__progressDot ${i <= step ? "contact__progressDot--on" : ""
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <form className="contact__form" onSubmit={onSubmit} noValidate>
                {step === 0 && (
                  <div className="contact__fields">
                    <div className="contact__field">
                      <label className="contact__label" htmlFor="fullName">
                        Imię i nazwisko
                      </label>
                      <input
                        id="fullName"
                        className={`contact__input ${touched.fullName && errors.fullName ? "contact__input--error" : ""
                          }`}
                        value={form.fullName}
                        onChange={(e) => setField("fullName", e.target.value)}
                        onBlur={() => touch(["fullName"])}
                        placeholder="np. Jan Kowalski"
                        autoComplete="name"
                      />

                      {touched.fullName && errors.fullName && (
                        <p className="contact__error">{errors.fullName}</p>
                      )}
                    </div>

                    <div className="contact__row">
                      <div className="contact__field">
                        <label className="contact__label" htmlFor="email">
                          E-mail
                        </label>
                        <input
                          id="email"
                          className={`contact__input ${touched.email && errors.email ? "contact__input--error" : ""
                            }`}
                          value={form.email}
                          onChange={(e) => setField("email", e.target.value)}
                          onBlur={() => touch(["email"])}
                          placeholder="np. jan@firma.pl"
                          autoComplete="email"
                        />
                        {touched.email && errors.email && (
                          <p className="contact__error">{errors.email}</p>
                        )}
                      </div>

                      <div className="contact__field">
                        <label className="contact__label" htmlFor="phone">
                          Telefon
                        </label>
                        <input
                          id="phone"
                          className={`contact__input ${touched.phone && errors.phone ? "contact__input--error" : ""
                            }`}
                          value={form.phone}
                          onChange={(e) => setField("phone", e.target.value)}
                          onBlur={() => touch(["phone"])}
                          placeholder="np. +48 123 456 789"
                          autoComplete="tel"
                        />
                        {touched.phone && errors.phone && (
                          <p className="contact__error">{errors.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="contact__fields">
                    <div className="contact__row">
                      <div className="contact__field">
                        <label className="contact__label" htmlFor="service">
                          Rodzaj usługi
                        </label>
                        <select
                          id="service"
                          className="contact__select"
                          value={form.service}
                          onChange={(e) => setField("service", e.target.value)}
                        >
                          <option>Remont mieszkania</option>
                          <option>Wykończenie pod klucz</option>
                          <option>Remont domu</option>
                          <option>Budowa domu</option>
                          <option>Lokal usługowy</option>
                          <option>Inna usługa</option>
                        </select>
                      </div>

                      <div className="contact__field">
                        <label className="contact__label" htmlFor="timeframe">
                          Preferowany termin
                        </label>
                        <select
                          id="timeframe"
                          className="contact__select"
                          value={form.timeframe}
                          onChange={(e) => setField("timeframe", e.target.value)}
                        >
                          <option>Jak najszybciej</option>
                          <option>W ciągu 2–4 tygodni</option>
                          <option>W ciągu 1–3 miesięcy</option>
                          <option>Powyżej 3 miesięcy</option>
                        </select>
                      </div>
                    </div>

                    <div className="contact__field">
                      <label className="contact__label" htmlFor="city">
                        Miasto / lokalizacja
                      </label>
                      <input
                        id="city"
                        className={`contact__input ${touched.city && errors.city ? "contact__input--error" : ""
                          }`}
                        value={form.city}
                        onChange={(e) => setField("city", e.target.value)}
                        onBlur={() => touch(["city"])}
                        placeholder="np. Warszawa, Wilanów"
                        autoComplete="address-level2"
                      />
                      {touched.city && errors.city && (
                        <p className="contact__error">{errors.city}</p>
                      )}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="contact__fields">
                    <div className="contact__field">
                      <label className="contact__label" htmlFor="message">
                        Wiadomość
                      </label>
                      <textarea
                        id="message"
                        className={`contact__textarea ${touched.message && errors.message ? "contact__textarea--error" : ""
                          }`}
                        value={form.message}
                        onChange={(e) => setField("message", e.target.value)}
                        onBlur={() => touch(["message"])}
                        placeholder="Napisz krótko: metraż, stan (deweloperski / do remontu), zakres prac, oczekiwania..."
                        rows={6}
                      />
                      {touched.message && errors.message && (
                        <p className="contact__error">{errors.message}</p>
                      )}
                    </div>

                    <input
                      type="text"
                      value={form.website}
                      onChange={(e) => setField("website", e.target.value)}
                      autoComplete="off"
                      tabIndex={-1}
                      style={{ position: "absolute", left: "-9999px", height: 0, width: 0, opacity: 0 }}
                    />


                    <label className={`contact__consent ${touched.consentContact && errors.consentContact ? "contact__consent--error" : ""}`}>
                      <input
                        type="checkbox"
                        checked={form.consentContact}
                        onChange={(e) => setField("consentContact", e.target.checked)}
                        onBlur={() => touch(["consentContact"])}
                      />
                      <span className="contact__consentText">
                        Wyrażam zgodę na kontakt w sprawie oferty.
                      </span>
                    </label>
                    {touched.consentContact && errors.consentContact && <p className="contact__error">{errors.consentContact}</p>}

                    <label className={`contact__consent ${touched.consentPersonalData && errors.consentPersonalData ? "contact__consent--error" : ""}`}>
                      <input
                        type="checkbox"
                        checked={form.consentPersonalData}
                        onChange={(e) => setField("consentPersonalData", e.target.checked)}
                        onBlur={() => touch(["consentPersonalData"])}
                      />
                      <span className="contact__consentText">
                        Wyrażam zgodę na przetwarzanie danych osobowych zgodnie z{" "}
                        <a href="/privacy" target="_blank" rel="noreferrer">Polityką prywatności</a>.
                      </span>
                    </label>
                    {touched.consentPersonalData && errors.consentPersonalData && <p className="contact__error">{errors.consentPersonalData}</p>}

                  </div>
                )}

                <div className="contact__actions">
                  <button
                    type="button"
                    className={`contact__btn contact__btn--ghost ${step === 0 ? "contact__btn--disabled" : ""
                      }`}
                    onClick={onBack}
                    disabled={step === 0}
                  >
                    Wstecz
                  </button>

                  {step < steps.length - 1 ? (
                    <button
                      type="button"
                      className={`contact__btn contact__btn--primary ${!canGoNext() ? "contact__btn--disabled" : ""
                        }`}
                      onClick={onNext}
                      disabled={!canGoNext()}
                    >
                      Dalej
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className={`contact__btn contact__btn--primary ${status === "sending" ? "contact__btn--disabled" : ""
                        }`}
                      disabled={status === "sending"}
                    >
                      {status === "sending" ? "Wysyłanie..." : "Wyślij wiadomość"}
                    </button>
                  )}
                </div>

                {status === "success" && (
                  <div className="contact__status contact__status--success" role="status">
                    Dziękujemy. Otrzymaliśmy Twoją wiadomość — skontaktujemy się w ciągu 24 godzin.
                  </div>
                )}
                {status === "error" && (
                  <div className="contact__status contact__status--error" role="status">
                    Coś poszło nie tak. Spróbuj ponownie lub napisz bezpośrednio na e-mail.
                  </div>
                )}
              </form>
            </div>

            <div className="contact__trustCard contact__trustCard--below">
              <p className="contact__trustTitle">Co dalej?</p>
              <ul className="contact__trustList">
                <li className="contact__trustItem">
                  <span className="contact__trustDot" />
                  Analizujemy Twoje zgłoszenie i doprecyzowujemy zakres
                </li>
                <li className="contact__trustItem">
                  <span className="contact__trustDot" />
                  Kontaktujemy się telefonicznie lub mailowo (zwykle do 24h)
                </li>
                <li className="contact__trustItem">
                  <span className="contact__trustDot" />
                  Proponujemy kolejne kroki: pomiar, kosztorys, harmonogram
                </li>
              </ul>
              <p className="contact__trustNote">
                Bez zobowiązań. Konkretnie i transparentnie.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
