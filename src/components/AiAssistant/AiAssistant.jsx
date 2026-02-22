import { useEffect, useMemo, useRef, useState } from "react";
import "./AiAssistant.scss";
import botAvatar from "../../assets/ai-panda.png";

/* -------------------- Content -------------------- */
const COMPANY = {
  name: "Building Panda",
  intro:
    "Cześć 👋\nJestem wirtualnym asystentem Building Panda. W czym mogę pomóc?",
  contacts: {
    phone: "+48 576 530 094",
    email: "buildingpanda.pl@gmail.com",
    website: "https://buildingpanda.pl",
  },

  services: [
    {
      id: "domy",
      name: "Budowa domu pod klucz",
      keywords: ["dom", "budowa domu", "dom pod klucz", "stan surowy", "deweloperski"],
      description:
        "Kompleksowa budowa domu: organizacja prac, konstrukcja, dach, instalacje oraz (opcjonalnie) wykończenie. Pracujemy etapowo, z kontrolą jakości i raportowaniem.",
      includes: [
        "analiza potrzeb i zakresu",
        "harmonogram i organizacja materiałów",
        "konstrukcja + dach",
        "instalacje (elektryka/hydraulika)",
        "wykończenie (opcjonalnie)",
      ],
    },
    {
      id: "remont",
      name: "Remont mieszkania / domu",
      keywords: ["remont", "wykończenie", "mieszkanie", "łazienka", "kuchnia", "generalny remont", "gładzie"],
      description:
        "Remonty i wykończenia odświeżające lub generalne: demontaże, prace przygotowawcze, ściany/podłogi, zabudowy GK, łazienki i kuchnie, montaż wyposażenia.",
      includes: [
        "inwentaryzacja i zakres",
        "prace przygotowawcze / demontaże",
        "wykończenia (ściany, podłogi, zabudowy)",
        "łazienki/kuchnie (opcjonalnie)",
        "odbiór i checklisty jakości",
      ],
    },
    {
      id: "gen",
      name: "Generalne wykonawstwo / koordynacja",
      keywords: ["generalne wykonawstwo", "gen wykonawca", "koordynacja", "nadzór", "ekipy"],
      description:
        "Koordynacja inwestycji: plan etapów, dobór ekip, kontrola jakości, komunikacja oraz raportowanie postępu.",
      includes: ["harmonogram", "koordynacja ekip", "kontrola jakości", "raporty postępu"],
    },
    {
      id: "fasada",
      name: "Elewacje i docieplenia",
      keywords: ["elewacja", "docieplenie", "ocieplenie", "styropian", "wełna", "tynk"],
      description:
        "Docieplenia i elewacje: przygotowanie podłoża, system ociepleń, warstwa zbrojąca, tynk/okładziny i detale.",
      includes: ["przygotowanie podłoża", "system dociepleń", "tynk/wykończenie", "detale i obróbki"],
    },
    {
      id: "instalacje",
      name: "Instalacje: elektryka i hydraulika",
      keywords: ["instalacje", "elektryka", "hydraulika", "woda", "kanalizacja", "rozdzielnia"],
      description:
        "Instalacje elektryczne oraz wod-kan: rozprowadzenia, punkty, zabezpieczenia, biały montaż — zgodnie z projektem.",
      includes: ["rozprowadzenia", "punkty i osprzęt", "zabezpieczenia", "testy i odbiór"],
    },
  ],

  policy: {
    pricing:
      "Dokładną wycenę przygotowujemy po ustaleniu zakresu prac i materiałów. Po krótkim opisie podpowiem, jakie informacje są potrzebne do kosztorysu.",
    timing:
      "Termin realizacji zależy od zakresu i złożoności. Harmonogram ustalamy indywidualnie po doprecyzowaniu potrzeb.",
  },
};

const UI = {
  proactiveDelayMs: 2000,
  proactiveText: "W czym mogę pomóc?",
  typingMinMs: 350,
  typingMaxMs: 900,
};

/* -------------------- Utils -------------------- */
function norm(s = "") {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
function randomTypingDelay(text) {
  return clamp(text.length * 10, UI.typingMinMs, UI.typingMaxMs);
}
function validateEmail(s) {
  const t = String(s || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}
function validatePhone(s) {
  const t = String(s || "").trim();
  return /^[+()\-\s0-9]{7,20}$/.test(t);
}
function isAskingForServicesList(q) {
  const t = norm(q);
  return (
    t.includes("jakie usługi") ||
    t.includes("jakie uslugi") ||
    t.includes("oferta") ||
    t.includes("zakres") ||
    t.includes("co robicie") ||
    t.includes("co oferujecie")
  );
}
function isContactIntent(q) {
  const t = norm(q);
  return (
    t.includes("kontakt") ||
    t.includes("wycena") ||
    t.includes("formularz") ||
    t.includes("zapytanie") ||
    t.includes("telefon") ||
    t.includes("mail") ||
    t.includes("email")
  );
}
function scoreService(query, service) {
  const q = norm(query);
  let score = 0;
  if (q.includes(norm(service.name))) score += 10;
  for (const k of service.keywords || []) {
    const kk = norm(k);
    if (kk && q.includes(kk)) score += 6;
  }
  const words = q.split(" ").filter((w) => w.length >= 4);
  for (const w of words) {
    if (norm(service.name).includes(w)) score += 2;
  }
  return score;
}
function bestService(query) {
  const scored = COMPANY.services
    .map((s) => ({ s, score: scoreService(query, s) }))
    .sort((a, b) => b.score - a.score);
  return scored[0]?.score >= 6 ? scored[0].s : null;
}
function renderServiceCard(service) {
  const lines = [`**${service.name}**`, service.description];
  if (service.includes?.length) {
    lines.push("", "W zakresie najczęściej:");
    service.includes.forEach((x) => lines.push(`• ${x}`));
  }
  return lines.join("\n");
}
function renderServicesList() {
  const lines = ["Poniżej zakres usług:", ""];
  COMPANY.services.forEach((s) => lines.push(`• ${s.name}`));
  lines.push("", "Możesz napisać np.: „Czy robicie elewacje?” albo „Opisz remont mieszkania”.");
  return lines.join("\n");
}

/* markdown-lite dla **bold** */
function MessageText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        const isBold = p.startsWith("**") && p.endsWith("**");
        const clean = isBold ? p.slice(2, -2) : p;
        return isBold ? <strong key={i}>{clean}</strong> : <span key={i}>{clean}</span>;
      })}
    </>
  );
}

/* -------------------- Lead flow -------------------- */
const LEAD_STEPS = [
  { key: "fullName", label: "Imię i nazwisko", placeholder: "Np. Jan Kowalski", required: true },
  { key: "phone", label: "Telefon", placeholder: "Np. +48 123 456 789", required: true },
  { key: "email", label: "Email (opcjonalnie)", placeholder: "Np. jan@domena.pl", required: false },
  { key: "city", label: "Miasto / lokalizacja", placeholder: "Np. Kraków", required: true },
  { key: "topic", label: "Czego dotyczy zapytanie?", placeholder: "Np. remont mieszkania, elewacja…", required: true },
  { key: "details", label: "Krótki opis", placeholder: "Metraż, stan, zakres prac…", required: true },
  { key: "consentContact", label: "Zgoda na kontakt", placeholder: "Wybierz: TAK / NIE", required: true, type: "consent" },
  { key: "consentPersonalData", label: "Zgoda RODO", placeholder: "Wybierz: TAK / NIE", required: true, type: "consent" },
];

/* -------------------- Component -------------------- */
function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [proactiveVisible, setProactiveVisible] = useState(false);

  // view: "home" (screen 1) | "chat" (screen 2)
  const [view, setView] = useState("home");

  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState([{ from: "bot", text: COMPANY.intro }]);

  const [context, setContext] = useState({
    lastServiceId: null,
    lastIntent: null,
  });

  // lead mode
  const [leadMode, setLeadMode] = useState(false);
  const [leadStep, setLeadStep] = useState(0);
  const [leadData, setLeadData] = useState({});

  const listRef = useRef(null);
  const inputRef = useRef(null);

  const homeTopics = useMemo(
    () => [
      { icon: "🏗️", text: "Jakie usługi realizujecie?" },
      { icon: "🧱", text: "Budowa domu pod klucz" },
      { icon: "🛠️", text: "Remont mieszkania / domu" },
      { icon: "🧩", text: "Generalne wykonawstwo / koordynacja" },
    ],
    []
  );

  // chips (hash-like) na ekranie czatu, jak na screenie 2
  const chatChips = useMemo(
    () => ["#Usługi", "#Etapy współpracy", "#Realizacje", "#Kontakt / wycena", "#Elewacje", "#Instalacje"],
    []
  );

  const focusInput = () => {
    if (!open) return;
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // blokada scrolla strony (mobile app feel)
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  // proactive bubble
  useEffect(() => {
    const t = window.setTimeout(() => setProactiveVisible(true), UI.proactiveDelayMs);
    return () => window.clearTimeout(t);
  }, []);

  // scroll chat
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, thinking, view]);

  // keep focus
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open, messages.length, leadMode, leadStep, thinking, view]);

  const pushUser = (text) => setMessages((p) => [...p, { from: "user", text }]);

  const pushBot = async (text) => {
    setThinking(true);
    const delay = randomTypingDelay(text);
    await new Promise((r) => window.setTimeout(r, delay));
    setMessages((p) => [...p, { from: "bot", text }]);
    setThinking(false);
    focusInput();
  };

  const openChat = () => {
    setProactiveVisible(false);
    setOpen(true);
    setView("home");
  };

  const closeChat = () => {
    setOpen(false);
    setLeadMode(false);
    setLeadStep(0);
    setLeadData({});
    setView("home");
  };

  const startChatView = async () => {
    setView("chat");
    // lekkie “hello” jeśli user od razu wszedł bez tematu
    focusInput();
  };

  const startLeadFlow = async (prefill = {}) => {
    setView("chat");
    setLeadMode(true);
    setLeadStep(0);
    setLeadData(prefill);

    await pushBot(
      "Jasne — przygotuję zgłoszenie do kontaktu. Zadamy kilka pytań. Na końcu poproszę o 2 zgody (kontakt + RODO) i wyślę zgłoszenie do biura."
    );
    await pushBot(`1/${LEAD_STEPS.length}: Podaj **${LEAD_STEPS[0].label}**.`);
  };

  const cancelLeadFlow = async () => {
    setLeadMode(false);
    setLeadStep(0);
    setLeadData({});
    await pushBot("OK — przerwałem formularz. Jeśli chcesz wrócić, napisz „kontakt” lub „wycena”.");
  };

  const submitLead = async (data) => {
    const payload = {
      fullName: (data.fullName || "").trim(),
      phone: (data.phone || "").trim(),
      email: (data.email || "").trim(),
      city: (data.city || "").trim(),
      topic: (data.topic || "Zapytanie z czatu").trim(),
      details: (data.details || "").trim(),

      source: "chat_assistant",
      lastServiceId: data.lastServiceId || "",

      consentContact: data.consentContact === true,
      consentPersonalData: data.consentPersonalData === true,

      website: "",
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      transcript: Array.isArray(data.transcript) ? data.transcript : [],
    };

    // client-side sanity
    if (!payload.fullName) throw new Error("missing_fullName");
    if (!payload.phone) throw new Error("missing_phone");
    if (!payload.city) throw new Error("missing_city");
    if (!payload.topic || payload.topic.length < 3) throw new Error("missing_topic");
    if (!payload.details || payload.details.length < 5) throw new Error("missing_details");
    if (!payload.consentContact) throw new Error("missing_consentContact");
    if (!payload.consentPersonalData) throw new Error("missing_consentPersonalData");

    const res = await fetch("/api/chat-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text().catch(() => "");
    let j = null;
    try {
      j = JSON.parse(text);
    } catch {
      // ignore
    }

    if (!res.ok || !j?.ok) {
      console.error("CHAT submit error", res.status, text);
      throw new Error(`Chat lead submit failed: ${res.status}`);
    }
  };

  const handleLeadInput = async (text) => {
    const step = LEAD_STEPS[leadStep];
    const value = text.trim();

    if (norm(value) === "anuluj" || norm(value) === "cancel") {
      await cancelLeadFlow();
      return;
    }

    if (step.key === "phone" && !validatePhone(value)) {
      await pushBot("Telefon wygląda niepoprawnie. Podaj proszę numer w formacie np. **+48 600 000 000**.");
      return;
    }
    if (step.key === "email" && value && !validateEmail(value)) {
      await pushBot("Email wygląda niepoprawnie. Podaj poprawny adres lub wpisz „pomiń”.");
      return;
    }
    if (step.key === "email" && norm(value) === "pomiń") {
      const nextStep = leadStep + 1;
      setLeadStep(nextStep);
      await pushBot(`OK — pomijam email.\n\n${nextStep + 1}/${LEAD_STEPS.length}: Podaj **${LEAD_STEPS[nextStep].label}**.`);
      return;
    }

    // consent by typing (buttons handled separately)
    if (step.type === "consent") {
      const v = norm(value);
      const yn =
        v === "tak" || v === "t" || v === "yes" || v === "y"
          ? true
          : v === "nie" || v === "n" || v === "no"
          ? false
          : null;

      if (yn === null) {
        await pushBot("Wybierz proszę: **TAK** albo **NIE**.");
        return;
      }

      if (yn === false) {
        const label = step.key === "consentContact" ? "zgody na kontakt" : "zgody RODO";
        await pushBot(`Rozumiem. Bez ${label} nie mogę wysłać zgłoszenia.\n\nJeśli zmienisz zdanie, napisz „kontakt”.`);
        setLeadMode(false);
        setLeadStep(0);
        setLeadData({});
        return;
      }

      const nextData = { ...leadData, [step.key]: true };
      setLeadData(nextData);

      const nextStep = leadStep + 1;

      if (nextStep >= LEAD_STEPS.length) {
        await pushBot("Dziękuję. Wysyłam zgłoszenie do biura…");
        try {
          await submitLead({ ...nextData, lastServiceId: context.lastServiceId });
          await pushBot("✅ Gotowe. Dziękuję! Wkrótce się odezwiemy.");
        } catch (e) {
          await pushBot(
            "❌ Nie udało się wysłać zgłoszenia. Spróbuj ponownie za chwilę albo skontaktuj się bezpośrednio:\n" +
              `• Telefon: ${COMPANY.contacts.phone}\n` +
              `• Email: ${COMPANY.contacts.email}`
          );
        }
        setLeadMode(false);
        setLeadStep(0);
        setLeadData({});
        return;
      }

      setLeadStep(nextStep);
      await pushBot(
        `${nextStep + 1}/${LEAD_STEPS.length}: Podaj **${LEAD_STEPS[nextStep].label}**.\n` +
          `Wskazówka: ${LEAD_STEPS[nextStep].placeholder}\n\n(aby przerwać wpisz „anuluj”)`
      );
      return;
    }

    const nextData = { ...leadData, [step.key]: value };
    setLeadData(nextData);

    const nextStep = leadStep + 1;
    setLeadStep(nextStep);

    // if next is consent -> bot instruction (buttons will appear)
    if (LEAD_STEPS[nextStep]?.type === "consent") {
      await pushBot(`${nextStep + 1}/${LEAD_STEPS.length}: **${LEAD_STEPS[nextStep].label}**.\nKliknij TAK/NIE.`);
      return;
    }

    await pushBot(
      `${nextStep + 1}/${LEAD_STEPS.length}: Podaj **${LEAD_STEPS[nextStep].label}**.\n` +
        `Wskazówka: ${LEAD_STEPS[nextStep].placeholder}\n\n(aby przerwać wpisz „anuluj”)`
    );
  };

  const respondSmart = async (userText) => {
    const t = norm(userText);

    if (isContactIntent(userText)) {
      setContext((c) => ({ ...c, lastIntent: "contact" }));
      const lastService = COMPANY.services.find((s) => s.id === context.lastServiceId);
      const prefill = lastService ? { topic: lastService.name } : {};
      await startLeadFlow(prefill);
      return;
    }

    if (isAskingForServicesList(userText)) {
      setContext((c) => ({ ...c, lastIntent: "services" }));
      await pushBot(renderServicesList());
      return;
    }

    if (t.includes("ile koszt") || t.includes("cena") || t.includes("wycena")) {
      setContext((c) => ({ ...c, lastIntent: "pricing" }));
      await pushBot(`${COMPANY.policy.pricing}\n\nChcesz, żebym zebrał dane do kontaktu? Napisz: **kontakt**.`);
      return;
    }

    if (t.includes("termin") || t.includes("kiedy") || t.includes("ile trwa")) {
      setContext((c) => ({ ...c, lastIntent: "timing" }));
      await pushBot(`${COMPANY.policy.timing}\n\nJeśli chcesz, napisz jaki zakres i lokalizacja — podpowiem kolejne kroki.`);
      return;
    }

    // service match
    const s = bestService(userText);
    if (s) {
      setContext({ lastServiceId: s.id, lastIntent: "service_detail" });
      await pushBot(`${renderServiceCard(s)}\n\nJeśli chcesz kontakt/wycenę, napisz: **kontakt**.`);
      return;
    }

    await pushBot(
      "Doprecyzuj proszę temat:\n• budowa domu\n• remont/wykończenie\n• elewacja/docieplenie\n• instalacje\n• generalne wykonawstwo\n\nMożesz też napisać: **jakie usługi macie?**"
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const text = input.trim();

    // w leadMode nie blokujemy wpisywania gdy bot “pisze”
    if (!text || (!leadMode && thinking)) return;

    setInput("");
    setProactiveVisible(false);
    pushUser(text);

    if (leadMode) await handleLeadInput(text);
    else await respondSmart(text);
  };

  const sendQuickConsent = async (value) => {
    setInput("");
    pushUser(value);
    await handleLeadInput(value);
    focusInput();
  };

  const onTopicFromHome = async (text) => {
    // kliknięcie tematu na ekranie 1
    await startChatView();
    pushUser(text);
    await respondSmart(text);
  };

  const onChip = async (chip) => {
    if (!leadMode && thinking) return;
    const text =
      chip === "#Usługi"
        ? "Jakie usługi macie?"
        : chip === "#Etapy współpracy"
        ? "Jak wygląda współpraca i etapy?"
        : chip === "#Kontakt / wycena"
        ? "Kontakt / wycena"
        : chip === "#Elewacje"
        ? "Czy robicie elewacje?"
        : chip === "#Instalacje"
        ? "Czy robicie instalacje elektryczne i hydraulikę?"
        : "Realizacje";
    pushUser(text);
    if (leadMode) await handleLeadInput(text);
    else await respondSmart(text);
  };

  return (
    <div className="assistant">
      {/* proactive mini bubble */}
      {proactiveVisible && !open && (
        <button className="assistant__proactive" onClick={openChat} type="button">
          {UI.proactiveText}
          <span className="assistant__proactiveTail" aria-hidden="true" />
        </button>
      )}

      {/* FAB */}
      {!open && (
        <button className="assistant__fab" onClick={openChat} aria-label="Otwórz asystenta">
          <img className="assistant__fabImage" src={botAvatar} alt="AI" />
        </button>
      )}

      {/* Fullscreen modal */}
      {open && (
        <div className="assistant__modal" role="dialog" aria-modal="true">
          {/* Screen 1: HOME */}
          {view === "home" && (
            <div className="assistant__home">
              <div className="assistant__homeTop">
                <div className="assistant__homeBar">
                  <div className="assistant__homeLogo">
                    <img src={botAvatar} alt="AI" />
                  </div>
                  <button className="assistant__homeClose" type="button" onClick={closeChat} aria-label="Zamknij">
                    ×
                  </button>
                </div>

                <div className="assistant__homeHero">
                  <div className="assistant__homeHello">Cześć 👋</div>
                  <div className="assistant__homeTitle">Jestem Twoim asystentem AI</div>
                </div>
              </div>

              <div className="assistant__homeCard">
                <div className="assistant__homeCardTitle">Zadaj mi pytanie lub wybierz temat rozmowy</div>

                <div className="assistant__topicList">
                  {homeTopics.map((t) => (
                    <button
                      key={t.text}
                      type="button"
                      className="assistant__topic"
                      onClick={() => onTopicFromHome(t.text)}
                    >
                      <span className="assistant__topicIcon">{t.icon}</span>
                      <span className="assistant__topicText">{t.text}</span>
                    </button>
                  ))}
                </div>

                <button className="assistant__continue" type="button" onClick={startChatView}>
                  Kontynuuj rozmowę
                </button>
              </div>

              <div className="assistant__homeFooter">
                Kontynuując rozmowę z wirtualnym agentem zgadzasz się na{" "}
                <a className="assistant__link" href="#" onClick={(e) => e.preventDefault()}>
                  warunki korzystania
                </a>
              </div>
            </div>
          )}

          {/* Screen 2: CHAT */}
          {view === "chat" && (
            <div className="assistant__chat">
              <div className="assistant__chatTopSafe" />

              <header className="assistant__chatHeader">
                <button className="assistant__navBtn" type="button" onClick={() => setView("home")} aria-label="Wstecz">
                  ‹
                </button>

                <div className="assistant__chatBrand">
                  <img className="assistant__chatBrandIcon" src={botAvatar} alt="AI" />
                  <div className="assistant__chatBrandText">
                    <div className="assistant__chatName">{COMPANY.name}</div>
                    <div className="assistant__chatSub">
                      {leadMode
                        ? `Tryb kontaktu: ${leadStep + 1}/${LEAD_STEPS.length} — ${LEAD_STEPS[leadStep]?.label}`
                        : "Wirtualny asystent"}
                    </div>
                  </div>
                </div>

                <button className="assistant__navBtn" type="button" onClick={closeChat} aria-label="Zamknij">
                  ×
                </button>
              </header>

              <div className="assistant__messages" ref={listRef}>
                {messages.map((m, i) => (
                  <div key={i} className={`assistant__message assistant__message--${m.from}`}>
                    <div className="assistant__bubble">
                      {m.text.split("\n").map((line, idx) => (
                        <p key={idx} className="assistant__line">
                          <MessageText text={line} />
                        </p>
                      ))}
                    </div>
                  </div>
                ))}

                {thinking && (
                  <div className="assistant__message assistant__message--bot">
                    <div className="assistant__bubble assistant__bubble--thinking">
                      <span className="assistant__dots" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                      Asystent pisze…
                    </div>
                  </div>
                )}
              </div>

              {/* Chips / hashes row */}
              {!leadMode && (
                <div className="assistant__chipRow" aria-label="Szybkie tematy">
                  {chatChips.map((c) => (
                    <button key={c} type="button" className="assistant__chip" onClick={() => onChip(c)}>
                      {c}
                    </button>
                  ))}
                </div>
              )}

              <form className="assistant__form" onSubmit={onSubmit}>
                <input
                  ref={inputRef}
                  className="assistant__input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    leadMode
                      ? LEAD_STEPS[leadStep]?.placeholder || "Wpisz odpowiedź…"
                      : "Wpisz wiadomość"
                  }
                  type="text"
                  // iOS zoom fix: font-size >= 16px jest w CSS
                  disabled={!leadMode && thinking}
                  inputMode="text"
                />
                <button className="assistant__send" type="submit" disabled={!leadMode && thinking}>
                  ➤
                </button>
              </form>

              {/* Consent buttons (TAK/NIE) */}
              {leadMode && LEAD_STEPS[leadStep]?.type === "consent" && (
                <div className="assistant__quick">
                  <button type="button" className="assistant__quickBtn" onClick={() => sendQuickConsent("TAK")}>
                    TAK
                  </button>
                  <button
                    type="button"
                    className="assistant__quickBtn assistant__quickBtn--danger"
                    onClick={() => sendQuickConsent("NIE")}
                  >
                    NIE
                  </button>
                </div>
              )}

              <div className="assistant__terms">
                Kontynuując rozmowę z wirtualnym agentem zgadzasz się na{" "}
                <a className="assistant__link" href="#" onClick={(e) => e.preventDefault()}>
                  warunki korzystania
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AiAssistant;