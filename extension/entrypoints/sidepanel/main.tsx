import "./style.css";
import { createRoot } from "react-dom/client";
import { SidePanelApp } from "../../components/SidePanelApp";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<SidePanelApp />);
}
