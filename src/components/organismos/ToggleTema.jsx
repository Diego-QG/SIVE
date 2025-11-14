import React, { useEffect, useState, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { useThemeStore, THEME_STORAGE_KEY } from "../../store/ThemeStore";

const prefersDarkQuery = "(prefers-color-scheme: dark)";

// Tamaño compacto en px (preciso, sin depender de 'em')
const SWITCH_W = 64;
const SWITCH_H = 34;
const PAD = 4;
const KNOB = SWITCH_H - PAD * 2;              // 26
const TRAVEL = SWITCH_W - PAD * 2 - KNOB;     // 30

export function ToggleTema() {
  const { theme, toggleTheme, setTheme } = useThemeStore(); // theme: "dark" | "light"
  const [spinning, setSpinning] = useState(false);

  // Cambia automáticamente al modo del sistema cuando no hay preferencia guardada
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(prefersDarkQuery);
    const syncWithSystem = (event) => {
      const saved = window.localStorage?.getItem(THEME_STORAGE_KEY);
      if (saved === null) {
        setTheme(event.matches ? "dark" : "light");
      }
    };

    syncWithSystem(mediaQuery);

    // escucha cambios futuros
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", syncWithSystem);
    } else {
      mediaQuery.addListener(syncWithSystem);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", syncWithSystem);
      } else {
        mediaQuery.removeListener(syncWithSystem);
      }
    };
  }, [setTheme]);

  const isDark = theme === "dark";

  const handleClick = useCallback(() => {
    // el próximo estado será el opuesto
    const willBeDark = theme === "light";
    toggleTheme();
    if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, willBeDark ? "dark" : "light");
    }

    // giro del ícono en cada clic
    setSpinning(true);
    setTimeout(() => setSpinning(false), 450);
  }, [theme, toggleTheme]);

  return (
    <Wrap onClick={handleClick} aria-pressed={isDark} title="Cambiar tema">
      <Track $dark={isDark} />
      <Knob $dark={isDark}>
        <Icon className={`fa-solid ${isDark ? "fa-moon" : "fa-sun"}`} $spin={spinning} $dark={isDark} />
      </Knob>
      <Shadow />
    </Wrap>
  );
}

/* ===== Estilos ===== */
const Wrap = styled.button`
  position: relative;
  width: ${SWITCH_W}px;
  height: ${SWITCH_H}px;
  border: 0; padding: 0; margin: 0;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  outline: none;
`;

const Track = styled.span`
  position: absolute; inset: 0;
  border-radius: 999px;
  background: radial-gradient(120% 120% at 10% 10%, #fff 0%, #ececec 60%, #dbdbdb 100%);
  border: 1px solid rgba(0,0,0,.08);
  box-shadow: inset 0 8px 18px rgba(0,0,0,.15), inset 0 -6px 10px rgba(0,0,0,.08);

  ${(p) => p.$dark && `
    background: radial-gradient(140% 140% at 15% 15%, #e6e6e6 0%, #bebebe 65%, #a9a9a9 100%);
    border-color: rgba(0,0,0,.22);
    box-shadow: inset 0 10px 22px rgba(0,0,0,.35), inset 0 -8px 10px rgba(0,0,0,.25);
  `}
`;

const Knob = styled.span`
  position: absolute;
  top: ${PAD}px; left: ${PAD}px;
  width: ${KNOB}px; height: ${KNOB}px;
  border-radius: 50%;
  display: grid; place-items: center;
  background: ${({ $dark }) => ($dark ? "#2b2b2b" : "#fff")};
  transform: translateX(${({ $dark }) => ($dark ? `${TRAVEL}px` : "0px")});
  transition: transform .25s ease, background-color .25s ease, box-shadow .25s ease;
  box-shadow: 0 6px 16px rgba(0,0,0, ${({ $dark }) => ($dark ? 0.32 : 0.18)});
`;

const spin = keyframes`to { transform: rotate(360deg); }`;

const Icon = styled.i`
  font-size: 16px;
  color: ${({ $dark }) => ($dark ? "#fff" : "#ffde59")};
  transition: color .2s ease, transform .45s ease;
  ${({ $spin }) => $spin && css`animation: ${spin} .45s;`}
`;

const Shadow = styled.span`
  position: absolute; inset: 0;
  border-radius: 999px;
  filter: blur(6px);
  box-shadow: 0 8px 18px rgba(0,0,0,.18);
  pointer-events: none;
`;
