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
              "--chip-accent": item.accent,
            }}
          >
            <span className="dot" />
            <span className="chip-label">{item.description}</span>
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
  background: ${({ theme }) => theme.posPanelBg};
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 18px 28px rgba(7, 14, 24, 0.3);

  @media (min-width: ${v.bpbart}) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 22px 30px;
    gap: 28px;
  }
`;

const SearchWrapper = styled.div`
  width: 100%;
  height: 46px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 999px;
  padding: 0 18px;
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.12);
  background-color: ${({ theme }) => theme.posInputBg};

  .icono {
    font-size: 1rem;
    color: rgba(${({ theme }) => theme.textRgba}, 0.55);
  }

  input {
    flex: 1;
    font-size: 0.95rem;
    border: 0;
    outline: none;
    background: transparent;
    color: ${({ theme }) => theme.text};

    &::placeholder {
      color: rgba(${({ theme }) => theme.textRgba}, 0.5);
    }
  }
`;

const LegendWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 24px;
  margin-left: auto;
  font-size: 0.78rem;
  color: rgba(${({ theme }) => theme.textRgba}, 0.7);
`;

const LegendChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: inherit;
  font-weight: 600;

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--chip-accent);
  }

  .chip-label {
    line-height: 1;
    white-space: nowrap;
  }
`;