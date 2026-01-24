import { useEffect, useRef, useState } from "react";
import "./AiAssistant.scss";

const SYSTEM_PROMPT = `
Jesteś asystentem AI firmy budowlanej SolidBud.
Odpowiadasz po polsku, jasno i spokojnie. Pomagasz:
- wyjaśnić zakres usług (budowa domów, remonty, generalne wykonawstwo),
- opisać, jak wygląda współpraca i kolejne etapy inwestycji,
- podpowiedzieć, o co zapytać przy pierwszym kontakcie z firmą.
Nie podajesz konkretnych wycen ani terminów, zachęcasz do kontaktu telefonicznego lub przez formularz.
`;

function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Cześć, tu asystent SolidBud. Napisz, jaka inwestycja Cię interesuje – dom, remont, hala, modernizacja?"
    }
  ]);

  const assistantRef = useRef(null);

  useEffect(() => {
    const assistantEl = assistantRef.current;
    if (!assistantEl) return;

    const footerEl = document.querySelector("footer");
    if (!footerEl) return;

    const GAP = 20;
    let rafId = 0;

    const updatePosition = () => {
      assistantEl.style.transform = "translateY(0px)";

      const assistantRect = assistantEl.getBoundingClientRect();
      const footerRect = footerEl.getBoundingClientRect();

      const overlap = assistantRect.bottom + GAP - footerRect.top;

      if (overlap > 0) {
        assistantEl.style.transform = `translateY(-${overlap}px)`;
      }
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePosition);
    };

    scheduleUpdate();

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    const ro = new ResizeObserver(scheduleUpdate);
    ro.observe(document.documentElement);
    ro.observe(footerEl);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      ro.disconnect();
      assistantEl.style.transform = "translateY(0px)";
    };
  }, []);

  const handleToggle = () => setOpen((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setThinking(true);

    try {
      const replyText =
        "To jest przykładowa odpowiedź asystenta AI. " +
        "W pliku";

      const botMessage = { from: "bot", text: replyText };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Nie udało się połączyć z backendem AI."
        }
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="assistant" ref={assistantRef}>
      <button className="assistant__button" onClick={handleToggle}>
        {open ? "×" : "AI"}
      </button>

      {open && (
        <div className="assistant__panel">
          <header className="assistant__header">
            <h3 className="assistant__title">Asystent SolidBud</h3>
            <p className="assistant__subtitle">
              Zapytaj o usługi, etapy budowy lub współpracę.
            </p>
          </header>

          <div className="assistant__messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={
                  "assistant__message assistant__message--" + msg.from
                }
              >
                <div className="assistant__bubble">{msg.text}</div>
              </div>
            ))}

            {thinking && (
              <div className="assistant__message assistant__message--bot">
                <div className="assistant__bubble assistant__bubble--thinking">
                  Myślę nad odpowiedzią...
                </div>
              </div>
            )}
          </div>

          <form className="assistant__form" onSubmit={handleSubmit}>
            <input
              className="assistant__input"
              type="text"
              placeholder="Napisz, w czym możemy pomóc..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              className="assistant__send"
              type="submit"
              disabled={thinking}
            >
              Wyślij
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AiAssistant;
