import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import { ThemeProvider } from "@/faraday/runtime";
import { App } from "@/app/App";

const root = document.getElementById("app");
if (!root) throw new Error("#app root element missing from index.html");

// ThemeProvider + `.style-faraday` mirror LessonHost, so both the labs chrome and
// the previewed blocks render with the real theme + component style layer.
createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <div className="style-faraday min-h-screen bg-background text-foreground">
        <App />
      </div>
    </ThemeProvider>
  </StrictMode>,
);
