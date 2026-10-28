import { BrowserRouter } from "react-router-dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import { OrgProvider } from "./context/OrgContext";
import { AuthProvider } from "./context/AuthContext";
import { LeadProvider } from "./context/LeadContext";
import { runMigration } from "./utils/migrate";
import "./index.css";
import { preferredTheme } from "./utils/theme";
import { ThemeProvider } from "./context/ThemeContext";

document.documentElement.classList.toggle("dark", preferredTheme() === "dark");

// Seed the demo organisation and attach any legacy leads before first render.
runMigration();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
      <OrgProvider>
        <AuthProvider>
          <LeadProvider>
            <App />
          </LeadProvider>
        </AuthProvider>
      </OrgProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);








