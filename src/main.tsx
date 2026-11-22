import { createRoot } from "react-dom/client";
import "../docs/design/design-system/styles.css";
import "./app.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(<App />);
