import styled from "styled-components";
import {
    Btn1,
    Buscador,
    RegistrarSubniveles,
    TablaSubniveles,
    Title,
    useSubnivelesStore,
} from "../../index";
import { v } from "../../styles/variables";
import { useState } from "react";
import ConfettiExplosion from "react-confetti-explosion";

export function SubnivelesTemplate() {
    const [openRegistro, setOpenRegistro] = useState(false);
    const { datasubniveles, setBuscador } = useSubnivelesStore();
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
                <RegistrarSubniveles setIsExploding={setIsExploding}
                    onClose={() => setOpenRegistro(!openRegistro)}
                    dataSelect={dataSelect}
                    accion={accion}
                />
            )}
            <section className="area1">
                <Title>Subniveles</Title>
                <Btn1
                    funcion={nuevoRegistro}
                    bgcolor={v.colorPrincipal}
                    titulo="Nuevo Subnivel"
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
                <TablaSubniveles setdataSelect={setDataSelect} setAccion={setAccion} SetopenRegistro={setOpenRegistro} data={datasubniveles} />
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
