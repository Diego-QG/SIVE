import styled from "styled-components";
import {
    Buscador,
    TablaPOS,
    Title,
    useVentasStore,
} from "../../index";
import { v } from "../../styles/variables";
import { useMemo } from "react";

export function POSTemplate() {
    const { dataventas, buscador, setBuscador } = useVentasStore();

    const filteredVentas = useMemo(() => {
        if (!buscador) {
            return dataventas;
        }

        const searchValue = buscador.toLowerCase();
        return (dataventas ?? []).filter((venta) => {
            const fieldsToSearch = [
                venta?.fecha_str,
                venta?.editorial,
                venta?.nombre_docente,
                venta?.material_resumen,
            ];

            return fieldsToSearch.some((field) =>
                `${field ?? ""}`.toLowerCase().includes(searchValue)
            );
        });
    }, [buscador, dataventas]);

    return (
        <Container>
            <section className="area1">
                <Title>Ventas</Title>
            </section>
            <section className="area2">
                <Buscador setBuscador={setBuscador} />
            </section>
            <section className="main">
                <TablaPOS data={filteredVentas} />
            </section>
        </Container>
    );
}
const Container = styled.div`
  height: calc(100vh - 30px);
  padding: 15px;
  display: grid;
  grid-template:
    "area1" 60px
    "area2" 60px
    "main" auto;
  .area1 {
    grid-area: area1;
    /* background-color: rgba(103, 93, 241, 0.14); */
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 20px;
    .back-button {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 16px;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: 2px solid ${v.colorPrincipal};
      background-color: transparent;
      color: ${v.colorPrincipal};
      font-size: 20px;
      cursor: pointer;
      transition: background-color 0.2s ease, color 0.2s ease;
    }
    .back-button:hover {
      background-color: ${v.colorPrincipal};
      color: #000;
    }
    ${Title} {
      margin: 0 auto;
      text-align: center;
      flex: 1;
    }
  }
  .area2 {
    grid-area: area2;
    /* background-color: rgba(7, 221, 237, 0.14); */
    display: flex;
    justify-content: end;
    align-items: center;
  }
  .main {
    grid-area: main;
    /* background-color: rgba(237, 7, 221, 0.14); */
  }
`;