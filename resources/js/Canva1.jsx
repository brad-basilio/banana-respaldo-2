import React from "react";
import { createRoot } from "react-dom/client";
import CreateReactScript from "./Utils/CreateReactScript";
import Canva1 from "./Components/Tailwind/BananaLab/Canva1";

const container = CreateReactScript("Canva1");

const root = createRoot(container);

root.render(<Canva1 />);
