import React, { useEffect, useState, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { useThemeStore } from "../../store/ThemeStore";

const LS_KEY = "darkmode";

// Tamaño compacto en px (preciso, sin depender de 'em')
const SWITCH_W = 64;
const SWITCH_H = 34;
const PAD = 4;
const KNOB = SWITCH_H - PAD * 2;              // 26
const TRAVEL = SWITCH_W - PAD * 2 - KNOB;     // 30

export function ToggleTema() {
  const { theme, setTheme } = useThemeStore();     // theme: "dark" | "light"
  const [spinning, setSpinning] = useState(false);

  // Sincroniza con localStorage al montar (por defecto oscuro)
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved === null) {
      localStorage.setItem(LS_KEY, "true"); // default: dark
      return;
    }
    // Si lo guardado no coincide con el store, togglear 1 vez
    if (saved === "true" && theme !== "dark") setTheme();
    if (saved === "false" && theme !== "light") setTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDark = theme === "dark";

  const handleClick = useCallback(() => {
    // el próximo estado será el opuesto
    const willBeDark = theme === "light";
    setTheme();                                            // toggle en store
    localStorage.setItem(LS_KEY, willBeDark ? "true" : "false"); // persiste

    // giro del ícono en cada clic
    setSpinning(true);
    setTimeout(() => setSpinning(false), 450);
  }, [theme, setTheme]);

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
