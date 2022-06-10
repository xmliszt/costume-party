import React from "react";
import ReactDOM from "react-dom";
import "antd/dist/antd.css";
import "./index.css";
import App from "./App";
import * as fontawesome from "@fortawesome/fontawesome";
import { faMoon, faSun } from "@fortawesome/fontawesome-free-solid";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";

fontawesome.library.add(faSun, faMoon);

const themes = {
  dark: `${process.env.PUBLIC_URL}/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/light-theme.css`,
};

ReactDOM.render(
  <React.StrictMode>
    <ThemeSwitcherProvider themeMap={themes} defaultTheme="light">
      <App />
    </ThemeSwitcherProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
