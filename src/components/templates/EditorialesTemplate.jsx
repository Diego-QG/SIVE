import styled from "styled-components";
import {
    Btn1,
    Buscador,
    RegistrarEditoriales,
    TablaEditoriales,
    Title,
    useEditorialesStore,
} from "../../index";
import { v } from "../../styles/variables";
import { useState } from "react";
import ConfettiExplosion from "react-confetti-explosion";
import { useNavigate } from "react-router-dom";

export function EditorialesTemplate() {
    const [openRegistro, setOpenRegistro] = useState(false);
    const { dataeditoriales, setBuscador } = useEditorialesStore();
    const [accion, setAccion] = useState("");
    const [dataSelect, setDataSelect] = useState([]);
    const [isExploding, setIsExploding] = useState(false);
    const navigate = useNavigate();

    const handleBack = () => {
        navigate("/herramientas");
    };

    function nuevoRegistro() {
        setOpenRegistro(!openRegistro);
        setAccion("Nuevo");
        setDataSelect([]);
        setIsExploding(false);
    }

    return (
        <Container>
            {openRegistro && (
                <RegistrarEditoriales setIsExploding={setIsExploding}
                    onClose={() => setOpenRegistro(!openRegistro)}
                    dataSelect={dataSelect}
                    accion={accion}
                />
            )}
            <section className="area1">
                <button type="button" className="back-button" onClick={handleBack}>
                    <v.iconoflechaizquierda />
                </button>
                <Title>Editoriales</Title>
                <Btn1
                    funcion={nuevoRegistro}
                    bgcolor={v.colorPrincipal}
                    titulo="Nueva Editorial"
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
                <TablaEditoriales setdataSelect={setDataSelect} setAccion={setAccion} SetopenRegistro={setOpenRegistro} data={dataeditoriales} />
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
      margin-left: auto;
      text-align: right;
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
