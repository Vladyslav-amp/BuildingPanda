import { useEffect, useMemo, useRef, useState } from "react";
import "./AiAssistant.scss";

import botAvatar from "../../assets/ai-panda.png";

const COMPANY = {
  name: "Building Panda",
  intro:
    "Dzień dobry. Jestem asystentem firmy budowlanej. Mogę opisać usługi, etapy współpracy, realizacje oraz pomóc w kontakcie.",
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
      nextQuestions: ["Jaki metraż domu planujesz?", "Jaka lokalizacja inwestycji?", "Czy masz projekt?"],
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
      nextQuestions: ["Jaki metraż i miasto?", "Jaki stan lokalu (po deweloperze / do remontu)?", "Jaki zakres prac?"],
    },
    {
      id: "gen",
      name: "Generalne wykonawstwo / koordynacja",
      keywords: ["generalne wykonawstwo", "gen wykonawca", "koordynacja", "nadzór", "ekipy"],
      description:
        "Koordynacja inwestycji: plan etapów, dobór ekip, kontrola jakości i zgodności z ustaleniami, komunikacja oraz raportowanie postępu.",
      includes: ["harmonogram", "koordynacja ekip", "kontrola jakości", "raporty postępu"],
      nextQuestions: ["Jaki typ obiektu i zakres inwestycji?", "Czy jest projekt / specyfikacja?", "Jaki termin startu?"],
    },
    {
      id: "fasada",
      name: "Elewacje i docieplenia",
      keywords: ["elewacja", "docieplenie", "ocieplenie", "styropian", "wełna", "tynk"],
      description:
        "Docieplenia i elewacje: przygotowanie podłoża, system ociepleń, warstwa zbrojąca, tynk/okładziny i detale. Stawiamy na trwałość i estetykę.",
      includes: ["przygotowanie podłoża", "system dociepleń", "tynk/wykończenie", "detale i obróbki"],
      nextQuestions: ["Jaka powierzchnia elewacji?", "Jaka lokalizacja?", "Jakie ocieplenie (styropian/wełna)?"],
    },
    {
      id: "instalacje",
      name: "Instalacje: elektryka i hydraulika",
      keywords: ["instalacje", "elektryka", "hydraulika", "woda", "kanalizacja", "rozdzielnia"],
      description:
        "Wykonujemy i modernizujemy instalacje elektryczne oraz wod-kan: rozprowadzenia, punkty, zabezpieczenia, biały montaż — zgodnie z projektem i dobrymi praktykami.",
      includes: ["rozprowadzenia", "punkty i osprzęt", "zabezpieczenia", "testy i odbiór"],
      nextQuestions: ["Nowa instalacja czy modernizacja?", "Metraż i lokalizacja?", "Czy masz projekt/plan punktów?"],
    },
  ],

  serviceStages: [
    { stage: "Konstrukcja / budowa", ids: ["domy"] },
    { stage: "Wykończenia / remonty", ids: ["remont"] },
    { stage: "Organizacja inwestycji", ids: ["gen"] },
    { stage: "Energooszczędność / elewacje", ids: ["fasada"] },
    { stage: "Instalacje", ids: ["instalacje"] },
  ],

  policy: {
    pricing:
      "Dokładną wycenę przygotowujemy po ustaleniu zakresu prac i materiałów. Po krótkim opisie mogę podpowiedzieć, jakie informacje są potrzebne do kosztorysu.",
    timing:
      "Termin realizacji zależy od zakresu i złożoności prac. Harmonogram ustalamy indywidualnie po doprecyzowaniu potrzeb.",
  },
};

const UI = {
  proactiveDelayMs: 2500,
  proactiveText: "W czym mogę pomóc?",
  typingMinMs: 450,
  typingMaxMs: 950,
};

/* -------------------- Utils -------------------- */
function norm(s = "") {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function randomTypingDelay(text) {
  // “AI-like”: zależne od długości
  const base = clamp(text.length * 12, UI.typingMinMs, UI.typingMaxMs);
  return base;
}

function isAskingForServicesList(q) {
  const t = norm(q);
  return (
    t.includes("jakie usługi") ||
    t.includes("jakie uslugi") ||
    t.includes("co robicie") ||
    t.includes("co oferujecie") ||
    t.includes("oferta") ||
    t.includes("zakres")
  );
}

function isAskingIfYouHaveService(q) {
  const t = norm(q);
  return (
    t.startsWith("czy macie") ||
    t.includes("czy macie ") ||
    t.includes("czy wykonujecie") ||
    t.includes("czy robicie") ||
    t.includes("czy zajmujecie się") ||
    t.includes("czy zajmujecie sie")
  );
}

function isAskingToDescribeService(q) {
  const t = norm(q);
  return (
    t.startsWith("opisz") ||
    t.includes("na czym polega") ||
    t.includes("co obejmuje") ||
    t.includes("szczegóły") ||
    t.includes("szczegoly")
  );
}

function isContactIntent(q) {
  const t = norm(q);
  return (
    t.includes("kontakt") ||
    t.includes("zadzwoń") ||
    t.includes("zadzwon") ||
    t.includes("telefon") ||
    t.includes("email") ||
    t.includes("mail") ||
    t.includes("formularz") ||
    t.includes("wycena") ||
    t.includes("zapytanie") ||
    t.includes("oferta dla mnie")
  );
}

function scoreService(query, service) {
  const q = norm(query);
  let score = 0;

  if (q.includes(norm(service.name))) score += 10;

  for (const k of service.keywords || []) {
    const kk = norm(k);
    if (!kk) continue;
    if (q.includes(kk)) score += 6;
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

function renderServicesByStages() {
  const lines = ["Poniżej nasza oferta — w logicznych obszarach:"];

  COMPANY.serviceStages.forEach((g) => {
    lines.push("", `**${g.stage}**`);
    g.ids.forEach((id) => {
      const s = COMPANY.services.find((x) => x.id === id);
      if (s) lines.push(`• ${s.name}`);
    });
  });

  lines.push(
    "",
    "Możesz napisać np.: „Czy robicie elewacje?”, „Opisz remont łazienki”, „Jakie usługi macie?”"
  );

  return lines.join("\n");
}

function renderServiceCard(service) {
  const lines = [`**${service.name}**`, service.description];

  if (service.includes?.length) {
    lines.push("", "W zakresie najczęściej:");
    service.includes.forEach((x) => lines.push(`• ${x}`));
  }

  return lines.join("\n");
}

function validateEmail(s) {
  const t = String(s || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

function validatePhone(s) {
  const t = String(s || "").trim();
  // prosta walidacja: cyfry + + spacje
  return /^[+()\-\s0-9]{7,20}$/.test(t);
}

/* “markdown-lite” dla **bold** */
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

/* -------------------- Lead capture (kontakt) -------------------- */
const LEAD_STEPS = [
  { key: "name", label: "Imię i nazwisko", placeholder: "Np. Jan Kowalski", required: true },
  { key: "phone", label: "Telefon", placeholder: "Np. +48 123 456 789", required: true },
  { key: "email", label: "Email (opcjonalnie)", placeholder: "Np. jan@domena.pl", required: false },
  { key: "city", label: "Miasto / lokalizacja", placeholder: "Np. Kraków", required: true },
  { key: "topic", label: "Czego dotyczy zapytanie?", placeholder: "Np. remont mieszkania, elewacja…", required: true },
  { key: "details", label: "Krótki opis", placeholder: "Metraż, stan, zakres prac…", required: true },
  {
    key: "consentContact",
    label: "Zgoda na kontakt",
    placeholder: "Wpisz: TAK lub NIE",
    required: true,
    type: "consent",
  },
  {
    key: "consentPersonalData",
    label: "Zgoda RODO (przetwarzanie danych osobowych)",
    placeholder: "Wpisz: TAK lub NIE",
    required: true,
    type: "consent",
  },
];

function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [proactiveVisible, setProactiveVisible] = useState(false);

  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const [messages, setMessages] = useState([{ from: "bot", text: COMPANY.intro }]);

  // pamięć kontekstu
  const [context, setContext] = useState({
    lastServiceId: null,
    lastIntent: null, // "services" | "service_detail" | "contact" ...
  });

  // lead mode
  const [leadMode, setLeadMode] = useState(false);
  const [leadStep, setLeadStep] = useState(0);
  const [leadData, setLeadData] = useState({});

  const listRef = useRef(null);
  const inputRef = useRef(null);

  const suggestions = useMemo(
    () => [
      "Jakie usługi macie?",
      "Czy robicie elewacje?",
      "Opisz remont mieszkania",
      "Jak wygląda współpraca?",
      "Chcę kontakt / wycenę",
    ],
    []
  );

  useEffect(() => {
    const t = window.setTimeout(() => setProactiveVisible(true), UI.proactiveDelayMs);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, thinking]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 200);
    return () => window.clearTimeout(t);
  }, [open]);

  const pushUser = (text) => setMessages((p) => [...p, { from: "user", text }]);

  const pushBot = async (text) => {
    setThinking(true);
    const delay = randomTypingDelay(text);
    await new Promise((r) => window.setTimeout(r, delay));
    setMessages((p) => [...p, { from: "bot", text }]);
    setThinking(false);
  };

  const openChat = () => {
    setProactiveVisible(false);
    setOpen(true);
  };

  const toggleChat = () => {
    setProactiveVisible(false);
    setOpen((p) => !p);
  };

  const startLeadFlow = async (prefill = {}) => {
    setLeadMode(true);
    setLeadStep(0);
    setLeadData(prefill);

    await pushBot(
      "Jasne — przygotuję zgłoszenie do kontaktu. Zadamy kilka krótkich pytań, a na końcu wyślę je bezpiecznie do biura."
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
      fullName: data.fullName,
      phone: data.phone,
      email: data.email || "",
      city: data.city,
      topic: data.topic,
      details: data.details,

      source: "chat_assistant",
      lastServiceId: data.lastServiceId || "",

      consentContact: data.consentContact === true,
      consentPersonalData: data.consentPersonalData === true,

      website: "",
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      transcript: data.transcript || [],
    };

    const res = await fetch("/api/chat-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const j = await res.json().catch(() => null);
    if (!res.ok || !j?.ok) throw new Error("Chat lead submit failed");
  };

  const parseYesNo = (value) => {
    const v = String(value || "").trim().toLowerCase();
    if (["tak", "t", "yes", "y"].includes(v)) return true;
    if (["nie", "n", "no"].includes(v)) return false;
    return null;
  };

  const handleLeadInput = async (text) => {
    const step = LEAD_STEPS[leadStep];
    const value = text.trim();

    // komendy w lead mode
    if (norm(value) === "anuluj" || norm(value) === "cancel") {
      await cancelLeadFlow();
      return;
    }

    // walidacje per pole
    if (step.key === "phone" && !validatePhone(value)) {
      await pushBot("Telefon wygląda niepoprawnie. Podaj proszę numer w formacie np. **+48 600 000 000**.");
      return;
    }
    if (step.key === "email" && value && !validateEmail(value)) {
      await pushBot("Email wygląda niepoprawnie. Podaj proszę poprawny adres lub wpisz „pomiń”.");
      return;
    }
    if (step.key === "email" && norm(value) === "pomiń") {
      // pomijamy
      const nextStep = leadStep + 1;
      setLeadStep(nextStep);
      await pushBot(`OK — pomijam email.\n\n${nextStep + 1}/${LEAD_STEPS.length}: Podaj **${LEAD_STEPS[nextStep].label}**.`);
      return;
    }

    if (step.type === "consent") {
      const yn = parseYesNo(text);

      if (yn === null) {
        await pushBot('Proszę wpisz dokładnie: **TAK** albo **NIE**.');
        return;
      }

      // jeśli NIE -> kończymy i nie wysyłamy
      if (yn === false) {
        const label =
          step.key === "consentContact" ? "zgody na kontakt" : "zgody RODO";
        await pushBot(
          `Rozumiem. Bez ${label} nie mogę wysłać zgłoszenia.\n\nJeśli zmienisz zdanie, napisz „kontakt”.`
        );
        setLeadMode(false);
        setLeadStep(0);
        setLeadData({});
        return;
      }

      // TAK -> zapisujemy i idziemy dalej
      const nextData = { ...leadData, [step.key]: true };
      setLeadData(nextData);

      const nextStep = leadStep + 1;

      // jeśli to była ostatnia zgoda, kończymy i wysyłamy
      if (nextStep >= LEAD_STEPS.length) {
        await pushBot("Dziękuję. Wysyłam zgłoszenie do biura…");

        await submitLead(nextData);

        await pushBot("✅ Gotowe. Dziękuję! Wkrótce się odezwiemy.");
        setLeadMode(false);
        setLeadStep(0);
        setLeadData({});
        return;
      }

      // kolejny krok
      setLeadStep(nextStep);
      await pushBot(
        `${nextStep + 1}/${LEAD_STEPS.length}: Podaj **${LEAD_STEPS[nextStep].label}**.\n` +
        `Wskazówka: ${LEAD_STEPS[nextStep].placeholder}\n\n(aby przerwać wpisz „anuluj”)`
      );
      return;
    }

    // zapis
    const nextData = { ...leadData, [step.key]: value };
    setLeadData(nextData);

    const nextStep = leadStep + 1;

    // koniec
    if (nextStep >= LEAD_STEPS.length) {
      // podsumowanie
      const summary =
        `Świetnie — mam komplet danych:\n` +
        `• Imię: ${nextData.name}\n` +
        `• Telefon: ${nextData.phone}\n` +
        `• Email: ${nextData.email || "-"}\n` +
        `• Lokalizacja: ${nextData.city}\n` +
        `• Temat: ${nextData.topic}\n` +
        `• Opis: ${nextData.details}\n\n` +
        `Wysyłam zgłoszenie do biura.`;

      await pushBot(summary);

      try {
        await submitLead({
          ...nextData,
          // meta
          source: "chat_assistant",
          lastServiceId: context.lastServiceId,
          userAgent: navigator.userAgent,
          pageUrl: window.location.href,
          createdAt: new Date().toISOString(),
        });

        await pushBot("✅ Gotowe. Dziękuję! Zespół odezwie się, gdy tylko zweryfikuje zgłoszenie.");
        setLeadMode(false);
        setLeadStep(0);
        setLeadData({});
      } catch (e) {
        await pushBot(
          "❌ Nie udało się wysłać zgłoszenia. Spróbuj ponownie za chwilę albo skontaktuj się bezpośrednio:\n" +
          `• Telefon: ${COMPANY.contacts.phone}\n` +
          `• Email: ${COMPANY.contacts.email}`
        );
      }
      return;
    }

    // idziemy dalej
    setLeadStep(nextStep);
    await pushBot(
      `${nextStep + 1}/${LEAD_STEPS.length}: Podaj **${LEAD_STEPS[nextStep].label}**.\n` +
      `Wskazówka: ${LEAD_STEPS[nextStep].placeholder}\n\n(aby przerwać wpisz „anuluj”)`
    );
  };

  const respondSmart = async (userText) => {
    const t = norm(userText);

    // kontakt/wycena -> lead flow
    if (isContactIntent(userText)) {
      setContext((c) => ({ ...c, lastIntent: "contact" }));

      // jeżeli ostatnio rozpoznaliśmy usługę, prefill “topic”
      const lastService = COMPANY.services.find((s) => s.id === context.lastServiceId);
      const prefill = lastService ? { topic: lastService.name } : {};
      await startLeadFlow(prefill);
      return;
    }

    // lista usług “po obszarach”
    if (isAskingForServicesList(userText)) {
      setContext((c) => ({ ...c, lastIntent: "services" }));
      await pushBot(renderServicesByStages());
      return;
    }

    // ceny/terminy (bez konkretów)
    if (t.includes("ile koszt") || t.includes("cena") || t.includes("wycena")) {
      setContext((c) => ({ ...c, lastIntent: "pricing" }));
      const lastService = COMPANY.services.find((s) => s.id === context.lastServiceId);
      await pushBot(
        `${COMPANY.policy.pricing}\n\n` +
        (lastService
          ? `Jeśli chodzi o **${lastService.name}**, najczęściej potrzebujemy: lokalizacji, metrażu i zakresu.\n`
          : "") +
        "Chcesz, żebym zebrał dane do kontaktu i przekazał je do biura? Napisz: **kontakt**."
      );
      return;
    }

    if (t.includes("termin") || t.includes("kiedy") || t.includes("ile trwa")) {
      setContext((c) => ({ ...c, lastIntent: "timing" }));
      await pushBot(
        `${COMPANY.policy.timing}\n\nJeśli chcesz, napisz jaki zakres i lokalizacja — podpowiem, co najbardziej wpływa na termin.`
      );
      return;
    }

    // “czy macie X?”
    if (isAskingIfYouHaveService(userText)) {
      const s = bestService(userText);
      if (s) {
        setContext({ lastServiceId: s.id, lastIntent: "service_detail" });
        await pushBot(`Tak — mamy to w ofercie.\n\n${renderServiceCard(s)}\n\nChcesz kontakt/wycenę? Napisz: **kontakt**.`);
      } else {
        setContext((c) => ({ ...c, lastIntent: "clarify" }));
        await pushBot(
          "Nie mam pewności, o jaką usługę chodzi. Doprecyzuj proszę jednym zdaniem (np. „remont łazienki”, „ocieplenie elewacji”, „instalacja elektryczna”)."
        );
      }
      return;
    }

    if (isAskingToDescribeService(userText)) {
      const s = bestService(userText) || COMPANY.services.find((x) => x.id === context.lastServiceId);
      if (s) {
        setContext({ lastServiceId: s.id, lastIntent: "service_detail" });
        await pushBot(`${renderServiceCard(s)}\n\nJeśli chcesz, mogę zadać 2–3 pytania i przygotować zgłoszenie. Napisz: **kontakt**.`);
      } else {
        await pushBot("Podaj nazwę usługi (np. „elewacja”, „remont”, „hydraulika”), a przygotuję konkretny opis.");
      }
      return;
    }

    if (t.includes("jak pracujecie") || t.includes("etapy") || t.includes("współpraca") || t.includes("wspolpraca")) {
      setContext((c) => ({ ...c, lastIntent: "process" }));
      await pushBot(
        "W skrócie działamy etapowo:\n" +
        "1) Ustalenie zakresu i oczekiwań\n" +
        "2) Doprecyzowanie rozwiązań i materiałów\n" +
        "3) Umowa i harmonogram\n" +
        "4) Realizacja z kontrolą jakości\n" +
        "5) Odbiór i zamknięcie prac\n\n" +
        "Jeśli napiszesz, czy chodzi o dom/remont/instalacje — dopasuję etapy do Twojego przypadku."
      );
      return;
    }

    if (t === "kontakt") {
      await pushBot(
        `Kontakt:\n• Telefon: ${COMPANY.contacts.phone}\n• Email: ${COMPANY.contacts.email}\n• Strona: ${COMPANY.contacts.website}\n\nJeśli chcesz, zbiorę dane i wyślę zgłoszenie do biura — napisz: **wycena**.`
      );
      return;
    }

    const s = bestService(userText);
    if (s) {
      setContext({ lastServiceId: s.id, lastIntent: "service_detail" });
      await pushBot(
        `Wygląda na to, że chodzi o:\n\n${renderServiceCard(s)}\n\n` +
        "Jeśli chcesz, podaj metraż i lokalizację — doradzę kolejne kroki. Albo napisz **kontakt**, a zbiorę dane do zgłoszenia."
      );
      return;
    }

    setContext((c) => ({ ...c, lastIntent: "clarify" }));
    await pushBot(
      "Doprecyzuj proszę, czego dotyczy temat:\n• budowa domu\n• remont/wykończenie\n• elewacja/docieplenie\n• instalacje\n• generalne wykonawstwo\n\nMożesz też napisać: **jakie usługi macie?**"
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || thinking) return;

    setInput("");
    setProactiveVisible(false);
    pushUser(text);

    if (leadMode) {
      await handleLeadInput(text);
    } else {
      await respondSmart(text);
    }
  };

  const onSuggestion = async (text) => {
    if (thinking) return;
    setProactiveVisible(false);
    if (!open) setOpen(true);
    pushUser(text);
    if (leadMode) await handleLeadInput(text);
    else await respondSmart(text);
  };

  return (
    <div className="assistant">
      {proactiveVisible && !open && (
        <button className="assistant__proactive" onClick={openChat} type="button">
          {UI.proactiveText}
          <span className="assistant__proactiveTail" aria-hidden="true" />
        </button>
      )}

      <button className={`assistant__fab ${open ? "is-open" : ""}`} onClick={toggleChat} aria-label={open ? "Zamknij" : "Otwórz"}>
        {open ? (
          <span className="assistant__fabIcon">×</span>
        ) : (
          <img className="assistant__fabImage" src={botAvatar} alt="AI" />
        )}
      </button>

      {open && (
        <div className="assistant__panel is-open" role="dialog" aria-modal="false">
          <header className="assistant__header">
            <div className="assistant__brand">
              <div className="assistant__avatar">
                <img src={botAvatar} alt="Asystent AI" />
              </div>
              <div className="assistant__brandText">
                <h3 className="assistant__title">Asystent {COMPANY.name}</h3>
                <p className="assistant__subtitle">
                  {leadMode
                    ? `Tryb kontaktu: ${leadStep + 1}/${LEAD_STEPS.length} — ${LEAD_STEPS[leadStep]?.label}`
                    : "Pytaj o usługi, opisy prac, etapy współpracy i kontakt."}
                </p>
              </div>

              {leadMode && (
                <button className="assistant__ghost" type="button" onClick={() => onSuggestion("anuluj")}>
                  Anuluj
                </button>
              )}
            </div>

            {!leadMode && (
              <div className="assistant__chips">
                {suggestions.map((s) => (
                  <button key={s} type="button" className="assistant__chip" onClick={() => onSuggestion(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
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

          <form className="assistant__form" onSubmit={onSubmit}>
            <input
              ref={inputRef}
              className="assistant__input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                leadMode
                  ? LEAD_STEPS[leadStep]?.placeholder || "Wpisz odpowiedź…"
                  : 'Np. "Czy robicie elewacje?" / "Opisz remont" / "Kontakt"'
              }
              type="text"
              disabled={thinking}
            />
            <button className="assistant__send" type="submit" disabled={thinking}>
              Wyślij
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AiAssistant;