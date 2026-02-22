import Header from "./components/Header/Header.jsx";
import Projects from "./components/Projects/Projects.jsx";
import Capabilities from "./components/Capabilities/Capabilities.jsx";
import Realizations from "./components/Realizations/Realizations.jsx";
import AboutUs from "./components/AboutUs/AboutUs.jsx";
import ContactUs from "./components/ContactUs/ContactUs.jsx";
import Footer from "./components/Footer/Footer.jsx";
// import AiAssistant from "./components/AiAssistant/AiAssistant.jsx";
import Main from "./components/Main/Main.jsx";
import TrustBar from "./components/TrustBar/TrustBar.jsx";
import HowWeWork from "./components/HowWeWork/HowWeWork.jsx";
import FAQ from "./components/FAQ/FAQ.jsx";
import Calculator from "./components/Calculator/Calculator.jsx";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <div className="app">
      <Header />
      <main>
        <Main />
        <TrustBar />
        <Realizations />
        <Capabilities />
        <Projects />
        <HowWeWork />
        <Calculator />
        <FAQ />
        <AboutUs />
        <ContactUs />
      </main>
      <Footer />
      {/* <AiAssistant /> */}
    </div>
  );
}

export default App;
