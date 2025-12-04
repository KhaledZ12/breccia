import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { checkSupabaseConnection } from "@/integrations/supabase/client";
import "./index.css";
import "@/styles/fonts.css";

checkSupabaseConnection();
createRoot(document.getElementById("root")!).render(<App />);
