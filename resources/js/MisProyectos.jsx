import React from "react";
import { createRoot } from "react-dom/client";
import CreateReactScript from "./Utils/CreateReactScript";
import MisProyectos from "./Components/Tailwind/BananaLab/MisProyectos";

const container = CreateReactScript("MisProyectos");

const root = createRoot(container);

root.render(<MisProyectos />);
