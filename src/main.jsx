import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/main.scss";

const KEY = "va_scrollY_v1";

function navType() {
  const entry = performance.getEntriesByType("navigation")[0];
  return entry && entry.type ? entry.type : "navigate";
}

function getSavedY() {
  const v = sessionStorage.getItem(KEY);
  const y = v ? Number(v) : 0;
  return Number.isFinite(y) ? y : 0;
}

function saveY() {
  sessionStorage.setItem(KEY, String(window.scrollY || 0));
}

function restoreY(y) {
  window.scrollTo({ top: Math.max(0, y), left: 0, behavior: "auto" });
}

(function initScrollPolicy() {
  if (window.location.hash) return;

  const type = navType();

  if (type === "reload") {
    const y = getSavedY();
    requestAnimationFrame(() => restoreY(y));
    setTimeout(() => restoreY(y), 0);
    setTimeout(() => restoreY(y), 80);
  } else {
    sessionStorage.removeItem(KEY);
    requestAnimationFrame(() => restoreY(0));
  }

  window.addEventListener("scroll", saveY, { passive: true });

  window.addEventListener("beforeunload", saveY);
})();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
