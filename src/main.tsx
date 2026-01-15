import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  console.error('Root element not found. Ensure "index.html" contains <div id="root"></div>.');
} else {
  createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
