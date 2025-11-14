import styled from "styled-components";
import { v } from "../../styles/variables";
import { POS_STATUS_SUMMARY } from "../../utils/posEstadosConfig";

export function BuscadorPOS({ setBuscador }) {
  function buscar(e) {
    setBuscador(e.target.value);
  }

  return (
    <Container>
      <SearchWrapper>
        <v.iconobuscar className="icono" />
        <input
          onChange={buscar}
          type="search"
          placeholder="Buscar por docente, editorial o resumen"
        />
      </SearchWrapper>
      <LegendWrapper>
        {POS_STATUS_SUMMARY.map((item) => (
          <LegendChip
            key={item.id}
            style={{
              "--chip-bg": item.background,
              "--chip-accent": item.accent,
            }}
          >
            <span className="dot" />
            <span className="chip-label">{item.label}:</span>
            <span className="chip-desc">{item.description}</span>
          </LegendChip>
        ))}
      </LegendWrapper>
    </Container>
  );
}

const Container = styled.section`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: linear-gradient(
      135deg,
      rgba(${({ theme }) => theme.textRgba}, 0.04),
      rgba(${({ theme }) => theme.textRgba}, 0.01)
    ),
    ${({ theme }) => theme.bg3};
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
  border-radius: 24px;
  padding: 18px;

  @media (min-width: ${v.bpbart}) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 20px 28px;
    gap: 24px;
  }
`;

const SearchWrapper = styled.div`
  width: 100%;
  height: 46px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 999px;
  padding: 0 16px;
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.14);
  background-color: rgba(${({ theme }) => theme.bodyRgba}, 0.45);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);

  .icono {
    font-size: 1rem;
    color: rgba(${({ theme }) => theme.textRgba}, 0.6);
  }

  input {
    flex: 1;
    font-size: 0.95rem;
    border: 0;
    outline: none;
    background: transparent;
    color: ${({ theme }) => theme.text};

    &::placeholder {
      color: rgba(${({ theme }) => theme.textRgba}, 0.6);
    }
  }
`;

const LegendWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
  width: 100%;
`;

const LegendChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--chip-bg);
  color: ${({ theme }) => theme.text};
  font-size: 0.82rem;
  font-weight: 500;
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--chip-accent);
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.06);
  }

  .chip-label {
    opacity: 0.75;
  }

  .chip-desc {
    font-weight: 600;
  }
`;