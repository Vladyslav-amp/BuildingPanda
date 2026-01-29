import React, { useMemo, useRef, useState } from "react";
import "./Calculator.scss";

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

function formatPLN(v) {
  const x = Math.round(v);
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " zł";
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
    case "home":
      return (
        <svg className="calculator__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M4 11.2 12 4l8 7.2V20a1.2 1.2 0 0 1-1.2 1.2H5.2A1.2 1.2 0 0 1 4 20v-8.8Z" />
          <path {...p} d="M9.2 21.2v-6.5h5.6v6.5" />
        </svg>
      );
    case "spark":
      return (
        <svg className="calculator__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M12 2.8 14.7 6.2l4.2-.1-1.6 3.9 2.8 3.1-4.1.7-2.1 3.6-2.1-3.6-4.1-.7 2.8-3.1-1.6-3.9 4.2.1L12 2.8Z" />
          <path {...p} d="M9.4 12.2l1.6 1.6 3.6-3.9" />
        </svg>
      );
    case "pin":
      return (
        <svg className="calculator__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            {...p}
            d="M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Z"
          />
          <path {...p} d="M12 10.5a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" />
        </svg>
      );
    case "shield":
    default:
      return (
        <svg className="calculator__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path {...p} d="M12 3.2 19 6.6V12c0 5.2-3.3 9-7 10.8C8.3 21 5 17.2 5 12V6.6l7-3.4Z" />
          <path {...p} d="M9.2 12.3l1.9 1.9 3.8-4.3" />
        </svg>
      );
  }
}

function SegButton({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      className={`calculator__segBtn ${active ? "calculator__segBtn--on" : ""}`}
      aria-pressed={active}
      onClick={onClick}
    >
      <span className="calculator__segIcon" aria-hidden="true">
        <Icon name={icon} />
      </span>
      <span className="calculator__segText">{label}</span>
    </button>
  );
}

const VOIVODESHIPS = [
  "Dolnośląskie",
  "Kujawsko-pomorskie",
  "Lubelskie",
  "Lubuskie",
  "Łódzkie",
  "Małopolskie",
  "Mazowieckie",
  "Opolskie",
  "Podkarpackie",
  "Podlaskie",
  "Pomorskie",
  "Śląskie",
  "Świętokrzyskie",
  "Warmińsko-mazurskie",
  "Wielkopolskie",
  "Zachodniopomorskie",
];

const CITIES_BY_VOIVODESHIP = {
  "Dolnośląskie": ["Wrocław", "Wałbrzych", "Legnica", "Jelenia Góra", "Lubin", "Głogów", "Inne (Dolnośląskie)"],
  "Kujawsko-pomorskie": ["Bydgoszcz", "Toruń", "Włocławek", "Grudziądz", "Inowrocław", "Inne (Kujawsko-pomorskie)"],
  Lubelskie: ["Lublin", "Zamość", "Chełm", "Biała Podlaska", "Puławy", "Inne (Lubelskie)"],
  Lubuskie: ["Zielona Góra", "Gorzów Wielkopolski", "Nowa Sól", "Żary", "Inne (Lubuskie)"],
  "Łódzkie": ["Łódź", "Piotrków Trybunalski", "Pabianice", "Tomaszów Mazowiecki", "Zgierz", "Inne (Łódzkie)"],
  "Małopolskie": ["Kraków", "Tarnów", "Nowy Sącz", "Oświęcim", "Chrzanów", "Inne (Małopolskie)"],
  Mazowieckie: ["Warszawa", "Radom", "Płock", "Siedlce", "Pruszków", "Legionowo", "Inne (Mazowieckie)"],
  Opolskie: ["Opole", "Kędzierzyn-Koźle", "Nysa", "Brzeg", "Inne (Opolskie)"],
  Podkarpackie: ["Rzeszów", "Przemyśl", "Stalowa Wola", "Mielec", "Krosno", "Inne (Podkarpackie)"],
  Podlaskie: ["Białystok", "Łomża", "Suwałki", "Inne (Podlaskie)"],
  Pomorskie: ["Gdańsk", "Gdynia", "Sopot", "Słupsk", "Tczew", "Wejherowo", "Inne (Pomorskie)"],
  "Śląskie": ["Katowice", "Gliwice", "Zabrze", "Bytom", "Chorzów", "Tychy", "Rybnik", "Częstochowa", "Bielsko-Biała", "Inne (Śląskie)"],
  "Świętokrzyskie": ["Kielce", "Ostrowiec Świętokrzyski", "Starachowice", "Sandomierz", "Inne (Świętokrzyskie)"],
  "Warmińsko-mazurskie": ["Olsztyn", "Elbląg", "Ełk", "Iława", "Inne (Warmińsko-mazurskie)"],
  Wielkopolskie: ["Poznań", "Kalisz", "Konin", "Piła", "Leszno", "Gniezno", "Inne (Wielkopolskie)"],
  Zachodniopomorskie: ["Szczecin", "Koszalin", "Świnoujście", "Stargard", "Kołobrzeg", "Inne (Zachodniopomorskie)"],
};

const BIG_CITIES = new Set([
  "Warszawa", "Kraków", "Wrocław", "Poznań", "Gdańsk", "Gdynia", "Sopot",
  "Łódź", "Katowice", "Szczecin", "Lublin", "Białystok", "Rzeszów", "Bydgoszcz",
  "Toruń", "Częstochowa", "Gliwice", "Zabrze", "Bielsko-Biała", "Olsztyn",
]);

export default function Calculator() {
  const sectionRef = useRef(null);
  const [step, setStep] = useState(0);

  const steps = useMemo(
    () => [
      { title: "Obiekt i zakres", sub: "Typ obiektu, rodzaj prac, lokalizacja" },
      { title: "Parametry", sub: "Metraż, układ, logistyka" },
      { title: "Standard i dodatki", sub: "Opcje oraz budżet" },
    ],
    []
  );

  const [data, setData] = useState({
    objectType: "Mieszkanie",
    workType: "Remont",

    voivodeship: "Mazowieckie",
    city: "Warszawa",

    area: "",
    rooms: "",
    bathrooms: "",

    apartmentFloor: "",
    hasElevator: true,

    floors: 1,

    condition: "Do remontu",
    complexity: "Standard",
    ceiling: "2.6 m",

    urgency: "Standard",
    materials: "Wykonawca",
    standard: "Premium",

    budgetCapOn: false,
    budgetCap: 120000,

    options: {
      project: true,
      supervision: true,

      demolition: false,
      electrical: false,
      plumbing: false,
      floorHeating: false,

      kitchen: false,
      premiumBathrooms: false,

      airConditioning: false,
      builtInFurniture: false,
      premiumLighting: false,
      smartHome: false,
      doorsWindows: false,
    },
  });

  const progress = clamp((step + 1) / steps.length, 0, 1);

  function setField(name, value) {
    setData((s) => ({ ...s, [name]: value }));
  }

  function setOption(name, value) {
    setData((s) => ({ ...s, options: { ...s.options, [name]: value } }));
  }

  function canNext() {
    if (step === 0) return true;
    if (step === 1) {
      if (!data.area || Number(data.area) < 10) return false;
      if (!data.rooms || Number(data.rooms) < 1) return false;
      if (!data.bathrooms || Number(data.bathrooms) < 1) return false;
      if (data.objectType !== "Mieszkanie" && (!data.floors || Number(data.floors) < 1)) return false;
      return true;
    }
    return true;
  }

  function next() {
    if (!canNext()) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
    scrollToTopOfSection(sectionRef.current);
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
    scrollToTopOfSection(sectionRef.current);
  }

  const cityOptions = useMemo(() => {
    const list = CITIES_BY_VOIVODESHIP[data.voivodeship] || ["Inne"];
    if (list.includes(data.city)) return list;
    return [data.city, ...list];
  }, [data.voivodeship, data.city]);

  const result = useMemo(() => {
    const area = Number(data.area) || 0;

    const isPristine =
      area === 0 ||
      Number(data.rooms) === 0 ||
      Number(data.bathrooms) === 0;

    if (isPristine) {
      return {
        isPristine: true,
        totalLow: 0,
        totalHigh: 0,
        breakdown: [],
        timeWeeks: { low: 0, high: 0 },
        optionsTotal: 0,
        budgetFit: null,
        topFactors: [],
      };
    }

    const basePerM2 = (() => {
      if (data.workType === "Budowa") {
        if (data.objectType === "Dom") return 4200;
        if (data.objectType === "Lokal") return 3800;
        return 0;
      }
      if (data.workType === "Wykończenie pod klucz") return 1650;
      return 1450;
    })();

    const objectMultiplier = (() => {
      if (data.objectType === "Mieszkanie") return 1.0;
      if (data.objectType === "Dom") return 1.08;
      return 1.05;
    })();

    const standardMultiplier = (() => {
      if (data.standard === "Basic") return 0.88;
      if (data.standard === "Luxury") return 1.32;
      return 1.12;
    })();

    const cityMultiplier = (() => {
      if (data.city === "Warszawa") return 1.10;
      if (BIG_CITIES.has(data.city)) return 1.06;
      return 1.0;
    })();

    const urgencyMultiplier = data.urgency === "Szybko" ? 1.10 : 1.0;

    const conditionMultiplier = (() => {
      if (data.workType === "Budowa") return 1.0;
      if (data.condition === "Deweloperski") return 0.96;
      if (data.condition === "Po remoncie") return 0.88;
      return 1.05;
    })();

    const complexityMultiplier = (() => {
      if (data.complexity === "Niska") return 0.95;
      if (data.complexity === "Wysoka") return 1.10;
      return 1.0;
    })();

    const ceilingMultiplier = (() => {
      if (data.ceiling === "2.4 m") return 0.98;
      if (data.ceiling === "3.0 m+") return 1.07;
      return 1.0;
    })();

    const floorsFactor =
      data.objectType === "Mieszkanie"
        ? 1.0
        : 1.0 + Math.max(0, (Number(data.floors) || 1) - 1) * 0.045;

    const bathFactor = 1.0 + Math.max(0, (Number(data.bathrooms) || 1) - 1) * 0.06;
    const roomsFactor = 1.0 + Math.max(0, (Number(data.rooms) || 2) - 2) * 0.02;

    const apartmentLogisticsMultiplier = (() => {
      if (data.objectType !== "Mieszkanie") return 1.0;
      const floor = Number(data.apartmentFloor) || 0;
      if (data.hasElevator) return 1.0 + Math.max(0, floor - 4) * 0.008;
      return 1.0 + Math.max(0, floor - 1) * 0.018;
    })();

    const materialsMultiplier = (() => {
      if (data.materials === "Klient") return 0.95;
      if (data.materials === "Mix") return 0.985;
      return 1.0;
    })();

    const adders = [];

    if (data.options.project) adders.push({ label: "Projekt / konsultacje", value: 2800 });
    if (data.options.supervision) adders.push({ label: "Koordynacja i nadzór", value: area * 35 });

    if (data.options.demolition) adders.push({ label: "Wyburzenia i przygotowanie", value: area * 55 });
    if (data.options.electrical) adders.push({ label: "Elektryka (modernizacja)", value: area * 95 });
    if (data.options.plumbing) adders.push({ label: "Wod.-kan. (modernizacja)", value: area * 85 });
    if (data.options.floorHeating) adders.push({ label: "Ogrzewanie podłogowe", value: area * 140 });

    if (data.options.kitchen) adders.push({ label: "Kuchnia (montaż + dopasowania)", value: 6500 });
    if (data.options.premiumBathrooms)
      adders.push({ label: "Łazienka premium (pakiet)", value: 4200 * (Number(data.bathrooms) || 1) });

    if (data.options.airConditioning) adders.push({ label: "Klimatyzacja (pakiet)", value: 5200 });
    if (data.options.builtInFurniture) adders.push({ label: "Zabudowy stolarskie (pakiet)", value: 7800 });
    if (data.options.premiumLighting) adders.push({ label: "Oświetlenie premium (pakiet)", value: 3200 });
    if (data.options.smartHome) adders.push({ label: "Smart home (pakiet)", value: 3800 });
    if (data.options.doorsWindows) adders.push({ label: "Drzwi/okna (pakiet)", value: 4200 });

    const base = area * basePerM2;

    const multiplier =
      objectMultiplier *
      standardMultiplier *
      cityMultiplier *
      urgencyMultiplier *
      conditionMultiplier *
      complexityMultiplier *
      ceilingMultiplier *
      floorsFactor *
      bathFactor *
      roomsFactor *
      apartmentLogisticsMultiplier *
      materialsMultiplier;

    const subtotal = base * multiplier;
    const optionsTotal = adders.reduce((s, a) => s + a.value, 0);

    const rangeFactor = (() => {
      if (data.workType === "Remont") return { low: 0.88, high: 1.18 };
      if (data.workType === "Budowa") return { low: 0.90, high: 1.15 };
      return { low: 0.92, high: 1.12 };
    })();

    let totalLow = (subtotal + optionsTotal) * rangeFactor.low;
    let totalHigh = (subtotal + optionsTotal) * rangeFactor.high;

    let budgetFit = null;
    if (data.budgetCapOn) {
      const cap = Number(data.budgetCap) || 0;
      if (cap > 0) {
        if (totalLow <= cap && totalHigh <= cap) budgetFit = "ok";
        else if (totalLow <= cap && totalHigh > cap) budgetFit = "tight";
        else budgetFit = "over";
      }
    }

    const timeWeeks = (() => {
      if (data.workType === "Budowa") {
        const baseW = Math.max(10, Math.round(area / 12));
        return { low: Math.max(10, baseW - 2), high: baseW + 4 };
      }
      const baseW = Math.max(3, Math.round(area / 18));
      const plusBath = Math.max(0, (Number(data.bathrooms) || 1) - 1);
      const plusRooms = Math.max(0, (Number(data.rooms) || 2) - 2);
      const extra =
        plusBath * 1 +
        plusRooms * 0.4 +
        (data.options.demolition ? 0.8 : 0) +
        (data.options.floorHeating ? 0.6 : 0) +
        (data.complexity === "Wysoka" ? 0.8 : 0);

      const low = Math.max(2, Math.round((baseW + extra) * 0.9));
      const high = Math.round((baseW + extra) * (data.urgency === "Szybko" ? 1.0 : 1.15));
      return { low, high };
    })();

    const breakdown = [
      { label: "Bazowa stawka (m²)", value: base },
      { label: "Złożoność / logistyka / standard", value: subtotal - base },
      ...adders,
    ];

    const topFactors = [
      { label: "Standard", value: Math.abs(standardMultiplier - 1) },
      { label: "Miasto", value: Math.abs(cityMultiplier - 1) },
      { label: "Opcje", value: optionsTotal / Math.max(1, subtotal) },
      { label: "Złożoność", value: Math.abs(complexityMultiplier - 1) },
    ]
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map((x) => x.label);

    return {
      isPristine: false,
      totalLow,
      totalHigh,
      breakdown,
      timeWeeks,
      optionsTotal,
      budgetFit,
      topFactors,
    };
  }, [data]);

  return (
    <section className="calculator" id="calculator" ref={sectionRef} aria-label="Kalkulator wyceny">
      <div className="calculator__inner">
        <header className="calculator__header">
          <p className="calculator__kicker">Kalkulator</p>
          <h2 className="calculator__heading">Szacunkowa wycena projektu</h2>
          <p className="calculator__lead">
            Wybierz parametry — zobacz orientacyjny zakres kosztów i czynniki wpływu. Kalkulator jest poglądowy; finalną
            wycenę przygotowujemy po rozmowie i doprecyzowaniu zakresu.
          </p>
        </header>

        <div className="calculator__grid">
          <div className="calculator__panel">
            <div className="calculator__panelTop">
              <div className="calculator__stepMeta">
                <p className="calculator__stepTitle">{steps[step].title}</p>
                <p className="calculator__stepSub">{steps[step].sub}</p>
              </div>

              <div className="calculator__progress" aria-hidden="true">
                <div className="calculator__progressTrack">
                  <div className="calculator__progressFill" style={{ transform: `scaleX(${progress})` }} />
                </div>
                <div className="calculator__progressDots">
                  {steps.map((_, i) => (
                    <span key={i} className={`calculator__dot ${i <= step ? "calculator__dot--on" : ""}`} />
                  ))}
                </div>
              </div>
            </div>

            <div className="calculator__body">
              {step === 0 && (
                <div className="calculator__fields">
                  <div className="calculator__choice">
                    <p className="calculator__label">Typ obiektu</p>
                    <div className="calculator__seg calculator__seg--three">
                      <SegButton active={data.objectType === "Mieszkanie"} onClick={() => setField("objectType", "Mieszkanie")} icon="home" label="Mieszkanie" />
                      <SegButton active={data.objectType === "Dom"} onClick={() => setField("objectType", "Dom")} icon="home" label="Dom" />
                      <SegButton active={data.objectType === "Lokal"} onClick={() => setField("objectType", "Lokal")} icon="home" label="Lokal" />
                    </div>
                  </div>

                  <div className="calculator__choice">
                    <p className="calculator__label">Rodzaj prac</p>
                    <div className="calculator__seg calculator__seg--three">
                      <SegButton active={data.workType === "Remont"} onClick={() => setField("workType", "Remont")} icon="spark" label="Remont" />
                      <SegButton active={data.workType === "Wykończenie pod klucz"} onClick={() => setField("workType", "Wykończenie pod klucz")} icon="spark" label="Pod klucz" />
                      <SegButton active={data.workType === "Budowa"} onClick={() => setField("workType", "Budowa")} icon="spark" label="Budowa" />
                    </div>
                  </div>

                  <div className="calculator__choice">
                    <p className="calculator__label">Lokalizacja (Polska)</p>
                    <div className="calculator__locGrid">
                      <div className="calculator__field">
                        <label className="calculator__label calculator__label--small" htmlFor="voivodeship">
                          Województwo
                        </label>
                        <select
                          id="voivodeship"
                          className="calculator__select"
                          value={data.voivodeship}
                          onChange={(e) => {
                            const v = e.target.value;
                            setData((s) => ({
                              ...s,
                              voivodeship: v,
                              city: (CITIES_BY_VOIVODESHIP[v] && CITIES_BY_VOIVODESHIP[v][0]) || "Inne",
                            }));
                          }}
                        >
                          {VOIVODESHIPS.map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="calculator__field">
                        <label className="calculator__label calculator__label--small" htmlFor="city">
                          Miasto
                        </label>
                        <select
                          id="city"
                          className="calculator__select"
                          value={data.city}
                          onChange={(e) => setField("city", e.target.value)}
                        >
                          {cityOptions.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="calculator__note">
                    Wskazówka: „Pod klucz” zwykle ma najbardziej przewidywalny koszt w przeliczeniu na m².
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="calculator__fields">
                  <div className="calculator__paramsGrid">
                    <div className="calculator__field">
                      <label className="calculator__label" htmlFor="area">Metraż (m²)</label>
                      <input
                        id="area"
                        className="calculator__input"
                        type="number"
                        min={0}
                        max={4000}
                        value={data.area}
                        placeholder="0"
                        onChange={(e) => {
                          const v = e.target.value;
                          setField("area", v === "" ? "" : Number(v));
                        }}

                      />
                      <p className="calculator__hint">Minimalnie 10 m².</p>
                    </div>

                    <div className="calculator__field">
                      <label className="calculator__label" htmlFor="urgency">Tempo realizacji</label>
                      <select
                        id="urgency"
                        className="calculator__select"
                        value={data.urgency}
                        onChange={(e) => setField("urgency", e.target.value)}
                      >
                        <option>Standard</option>
                        <option>Szybko</option>
                      </select>
                      <p className="calculator__hint">Tryb „Szybko” = większe zasoby.</p>
                    </div>

                    {data.objectType === "Mieszkanie" ? (
                      <div className="calculator__field">
                        <label className="calculator__label" htmlFor="aptFloor">Piętro</label>
                        <input
                          id="aptFloor"
                          className="calculator__input"
                          type="number"
                          min={0}
                          max={120}
                          value={data.apartmentFloor}
                          placeholder="0"
                          onChange={(e) => setField("apartmentFloor", Number(e.target.value))}
                        />
                        <label className="calculator__toggle">
                          <input
                            type="checkbox"
                            checked={data.hasElevator}
                            onChange={(e) => setField("hasElevator", e.target.checked)}
                          />
                          <span className="calculator__toggleText">Jest winda</span>
                        </label>
                      </div>
                    ) : (
                      <div className="calculator__field">
                        <label className="calculator__label" htmlFor="floors">Kondygnacje (dom)</label>
                        <input
                          id="floors"
                          className="calculator__input"
                          type="number"
                          min={1}
                          max={10}
                          value={data.floors}
                          onChange={(e) => setField("floors", Number(e.target.value))}
                        />
                        <p className="calculator__hint">Wpływa na logistykę i czas.</p>
                      </div>
                    )}

                    <div className="calculator__field">
                      <label className="calculator__label" htmlFor="rooms">Liczba pokoi</label>
                      <input
                        id="rooms"
                        className="calculator__input"
                        type="number"
                        min={0}
                        max={50}
                        value={data.rooms}
                        placeholder="0"
                        onChange={(e) => {
                          const v = e.target.value;
                          setField("rooms", v === "" ? "" : Number(v));
                        }}

                      />
                      <p className="calculator__hint">&nbsp;</p>
                    </div>

                    <div className="calculator__field">
                      <label className="calculator__label" htmlFor="baths">Łazienki</label>
                      <input
                        id="baths"
                        className="calculator__input"
                        type="number"
                        min={0}
                        max={20}
                        value={data.bathrooms}
                        placeholder="0"
                        onChange={(e) => {
                          const v = e.target.value;
                          setField("bathrooms", v === "" ? "" : Number(v));
                        }}

                      />
                      <p className="calculator__hint">&nbsp;</p>
                    </div>

                    <div className="calculator__field">
                      <label className="calculator__label" htmlFor="condition">Stan wyjściowy</label>
                      <select
                        id="condition"
                        className="calculator__select"
                        value={data.condition}
                        placeholder="0"
                        onChange={(e) => setField("condition", e.target.value)}
                        disabled={data.workType === "Budowa"}
                      >
                        <option>Deweloperski</option>
                        <option>Do remontu</option>
                        <option>Po remoncie</option>
                      </select>
                      <p className="calculator__hint">Dla budowy parametr nie wpływa.</p>
                    </div>

                    <div className="calculator__field">
                      <label className="calculator__label" htmlFor="complexity">Złożoność</label>
                      <select
                        id="complexity"
                        className="calculator__select"
                        value={data.complexity}
                        onChange={(e) => setField("complexity", e.target.value)}
                      >
                        <option>Niska</option>
                        <option>Standard</option>
                        <option>Wysoka</option>
                      </select>
                      <p className="calculator__hint">Dużo detali = wyższy koszt.</p>
                    </div>

                    <div className="calculator__field">
                      <label className="calculator__label" htmlFor="ceiling">Wysokość sufitów</label>
                      <select
                        id="ceiling"
                        className="calculator__select"
                        value={data.ceiling}
                        onChange={(e) => setField("ceiling", e.target.value)}
                      >
                        <option>2.4 m</option>
                        <option>2.6 m</option>
                        <option>3.0 m+</option>
                      </select>
                      <p className="calculator__hint">&nbsp;</p>
                    </div>

                    <div className="calculator__field">
                      <label className="calculator__label" htmlFor="materials">Materiały</label>
                      <select
                        id="materials"
                        className="calculator__select"
                        value={data.materials}
                        onChange={(e) => setField("materials", e.target.value)}
                      >
                        <option>Wykonawca</option>
                        <option>Mix</option>
                        <option>Klient</option>
                      </select>
                      <p className="calculator__hint">Najbezpieczniej: wykonawca lub mix.</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="calculator__fields">
                  <div className="calculator__row2">
                    <div className="calculator__field">
                      <label className="calculator__label" htmlFor="standard">Standard</label>
                      <select
                        id="standard"
                        className="calculator__select"
                        value={data.standard}
                        onChange={(e) => setField("standard", e.target.value)}
                      >
                        <option>Basic</option>
                        <option>Premium</option>
                        <option>Luxury</option>
                      </select>
                      <p className="calculator__hint">Premium = lepsze materiały + detal.</p>
                      <br />
                    </div>

                    <div className="calculator__field">
                      <label className="calculator__label">Zabezpieczenie jakości</label>
                      <div className="calculator__checks">
                        <label className="calculator__check">
                          <input type="checkbox" checked={data.options.project} onChange={(e) => setOption("project", e.target.checked)} />
                          <span>Projekt / konsultacje</span>
                        </label>
                        <label className="calculator__check">
                          <input type="checkbox" checked={data.options.supervision} onChange={(e) => setOption("supervision", e.target.checked)} />
                          <span>Koordynacja i nadzór</span>
                        </label>
                      </div>
                      <p className="calculator__hint">&nbsp;</p>
                    </div>
                  </div>

                  <div className="calculator__field">
                    <label className="calculator__label">Dodatkowe opcje</label>
                    <div className="calculator__checks calculator__checks--two">
                      <label className="calculator__check"><input type="checkbox" checked={data.options.demolition} onChange={(e) => setOption("demolition", e.target.checked)} /><span>Wyburzenia</span></label>
                      <label className="calculator__check"><input type="checkbox" checked={data.options.electrical} onChange={(e) => setOption("electrical", e.target.checked)} /><span>Elektryka</span></label>
                      <label className="calculator__check"><input type="checkbox" checked={data.options.plumbing} onChange={(e) => setOption("plumbing", e.target.checked)} /><span>Wod.-kan.</span></label>
                      <label className="calculator__check"><input type="checkbox" checked={data.options.floorHeating} onChange={(e) => setOption("floorHeating", e.target.checked)} /><span>Podłogówka</span></label>
                      <label className="calculator__check"><input type="checkbox" checked={data.options.kitchen} onChange={(e) => setOption("kitchen", e.target.checked)} /><span>Kuchnia</span></label>
                      <label className="calculator__check"><input type="checkbox" checked={data.options.premiumBathrooms} onChange={(e) => setOption("premiumBathrooms", e.target.checked)} /><span>Łazienka premium</span></label>
                      <label className="calculator__check"><input type="checkbox" checked={data.options.airConditioning} onChange={(e) => setOption("airConditioning", e.target.checked)} /><span>Klimatyzacja</span></label>
                      <label className="calculator__check"><input type="checkbox" checked={data.options.builtInFurniture} onChange={(e) => setOption("builtInFurniture", e.target.checked)} /><span>Zabudowy</span></label>
                      <label className="calculator__check"><input type="checkbox" checked={data.options.premiumLighting} onChange={(e) => setOption("premiumLighting", e.target.checked)} /><span>Oświetlenie premium</span></label>
                      <label className="calculator__check"><input type="checkbox" checked={data.options.smartHome} onChange={(e) => setOption("smartHome", e.target.checked)} /><span>Smart home</span></label>
                      <label className="calculator__check"><input type="checkbox" checked={data.options.doorsWindows} onChange={(e) => setOption("doorsWindows", e.target.checked)} /><span>Drzwi/okna</span></label>
                    </div>
                    <p className="calculator__hint">&nbsp;</p>
                  </div>

                  <div className="calculator__budget">
                    <div className="calculator__budgetTop">
                      <label className="calculator__toggle">
                        <input type="checkbox" checked={data.budgetCapOn} onChange={(e) => setField("budgetCapOn", e.target.checked)} />
                        <span className="calculator__toggleText">Mam budżet (pokaż dopasowanie)</span>
                      </label>

                      <div
                        className={`calculator__budgetBadge ${data.budgetCapOn ? `calculator__budgetBadge--${result.budgetFit || "none"}` : ""
                          }`}
                      >
                        {data.budgetCapOn ? (
                          <>
                            {result.budgetFit === "ok" && "Mieści się w budżecie"}
                            {result.budgetFit === "tight" && "Na granicy budżetu"}
                            {result.budgetFit === "over" && "Powyżej budżetu"}
                            {!result.budgetFit && "Budżet"}
                          </>
                        ) : (
                          "Budżet"
                        )}
                      </div>
                    </div>

                    <div className={`calculator__budgetControls ${!data.budgetCapOn ? "calculator__budgetControls--disabled" : ""}`}>
                      <div className="calculator__budgetRow">
                        <span className="calculator__budgetLabel">Budżet</span>
                        <span className="calculator__budgetValue">{formatPLN(data.budgetCap)}</span>
                      </div>

                      <input
                        className="calculator__range"
                        type="range"
                        min={20000}
                        max={800000}
                        step={1000}
                        value={data.budgetCap}
                        onChange={(e) => setField("budgetCap", Number(e.target.value))}
                        disabled={!data.budgetCapOn}
                      />

                      <p className="calculator__hint">To orientacyjne dopasowanie. Finalny budżet ustalamy po rozmowie.</p>
                    </div>
                  </div>

                  <div className="calculator__note">
                    Uwaga: To wycena orientacyjna. Dokładny koszt zależy od technologii, stanu i materiałów.
                  </div>
                </div>
              )}

              <div className="calculator__actions">
                <button
                  type="button"
                  className={`calculator__btn calculator__btn--ghost ${step === 0 ? "calculator__btn--disabled" : ""}`}
                  onClick={back}
                  disabled={step === 0}
                >
                  Wstecz
                </button>

                {step < steps.length - 1 ? (
                  <button
                    type="button"
                    className={`calculator__btn calculator__btn--primary ${!canNext() ? "calculator__btn--disabled" : ""}`}
                    onClick={next}
                    disabled={!canNext()}
                  >
                    Dalej
                  </button>
                ) : (
                  <button
                    type="button"
                    className="calculator__btn calculator__btn--primary"
                    onClick={() => {
                      setStep(0);
                      scrollToTopOfSection(sectionRef.current);
                    }}
                  >
                    Zakończ
                  </button>
                )}

              </div>
            </div>
          </div>

          <aside className="calculator__summary" aria-label="Podsumowanie wyceny">
            <div className="calculator__summaryCard">
              <div className="calculator__summaryTop">
                <p className="calculator__summaryKicker">Szacunek</p>
                <p className="calculator__summaryTitle">Zakres kosztów</p>

                <p className="calculator__summaryRange">
                  {result.isPristine ? "0 zł" : `${formatPLN(result.totalLow)} – ${formatPLN(result.totalHigh)}`}
                </p>

                <p className="calculator__summaryMeta">
                  Lokalizacja: <span className="calculator__strong">{data.city}, {data.voivodeship}</span>
                  <span className="calculator__sep">•</span>
                  Czas: <span className="calculator__strong">{result.isPristine ? "—" : `${result.timeWeeks.low}–${result.timeWeeks.high} tyg.`}</span>
                </p>

                {!result.isPristine && (
                  <div className="calculator__chips">
                    {result.topFactors.map((t) => (
                      <span key={t} className="calculator__chip">{t}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="calculator__breakdown">
                <p className="calculator__breakdownTitle">Co wpływa na cenę</p>

                {result.isPristine ? (
                  <div className="calculator__empty">
                    Uzupełnij parametry (metraż, pokoje, łazienki), aby zobaczyć wycenę.
                  </div>
                ) : (
                  <>
                    <div className="calculator__rows">
                      {result.breakdown.map((b, i) => (
                        <div className="calculator__row" key={i}>
                          <span className="calculator__rowLabel">{b.label}</span>
                          <span className="calculator__rowValue">{formatPLN(b.value)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="calculator__divider" />

                    <div className="calculator__mini">
                      <div className="calculator__miniItem">
                        <span className="calculator__miniLabel">Metraż</span>
                        <span className="calculator__miniValue">{data.area} m²</span>
                      </div>
                      <div className="calculator__miniItem">
                        <span className="calculator__miniLabel">Obiekt</span>
                        <span className="calculator__miniValue">{data.objectType}</span>
                      </div>
                      <div className="calculator__miniItem">
                        <span className="calculator__miniLabel">Zakres</span>
                        <span className="calculator__miniValue">{data.workType}</span>
                      </div>
                      <div className="calculator__miniItem">
                        <span className="calculator__miniLabel">Standard</span>
                        <span className="calculator__miniValue">{data.standard}</span>
                      </div>
                    </div>

                    <div className="calculator__cta">
                      <a className="calculator__ctaBtn" href="#contact">
                        Wyślij parametry do wyceny
                      </a>
                      <p className="calculator__ctaNote">
                        Skontaktujemy się i przygotujemy kosztorys po krótkiej rozmowie.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="calculator__disclaimer">
              <p className="calculator__disclaimerTitle">Ważne</p>
              <p className="calculator__disclaimerText">
                Kalkulator pokazuje orientacyjny przedział. Finalna wycena zależy m.in. od instalacji, technologii,
                detali wykończenia, logistyki oraz materiałów.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
