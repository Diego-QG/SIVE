import styled from "styled-components";
import {
    Btn1,
    Buscador,
    RegistrarTipoContenidos,
    TablaTipoContenidos,
    Title,
    useTipoContenidosStore,
} from "../../index";
import { v } from "../../styles/variables";
import { useState } from "react";
import ConfettiExplosion from "react-confetti-explosion";

export function TipoContenidosTemplate() {
    const [openRegistro, setOpenRegistro] = useState(false);
    const { datatipocontenido, setBuscador } = useTipoContenidosStore();
    const [accion, setAccion] = useState("");
    const [dataSelect, setDataSelect] = useState([]);
    const [isExploding, setIsExploding] = useState(false);

    function nuevoRegistro() {
        setOpenRegistro(!openRegistro);
        setAccion("Nuevo");
        setDataSelect([]);
        setIsExploding(false);
    }

    return (
        <Container>
            {openRegistro && (
                <RegistrarTipoContenidos setIsExploding={setIsExploding}
                    onClose={() => setOpenRegistro(!openRegistro)}
                    dataSelect={dataSelect}
                    accion={accion}
                />
            )}
            <section className="area1">
                <Title>Tipo Contenidos</Title>
                <Btn1
                    funcion={nuevoRegistro}
                    bgcolor={v.colorPrincipal}
                    titulo="Nuevo Tipo Contenido"
                    icono={<v.iconoagregar />}
                />
            </section>
            <section className="area2">
                <Buscador setBuscador={setBuscador} />
            </section>
            <section className="main">
                {
                    isExploding && <ConfettiExplosion />
                }
                <TablaTipoContenidos setdataSelect={setDataSelect} setAccion={setAccion} SetopenRegistro={setOpenRegistro} data={datatipocontenido} />
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
    justify-content: end;
    align-items: center;
    gap: 20px;
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
