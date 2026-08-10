import React from "react";
import ReactDOM from "react-dom/client";
import Website from "./Website.jsx";
import { LangProvider } from "./content-and-translations.jsx";
import "./global-base-styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LangProvider>
      <Website />
    </LangProvider>
  </React.StrictMode>
);
