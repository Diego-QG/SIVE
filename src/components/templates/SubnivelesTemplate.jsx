import styled from "styled-components";
import {
  Btn1,
  Buscador,
  RegistrarSubniveles,
  TablaSubniveles,
  Title,
  useSubnivelesStore,
  v,
} from "../../index";
import { useState } from "react";
import ConfettiExplosion from "react-confetti-explosion";

export function SubnivelesTemplate() {
  const [openRegistro, setOpenRegistro] = useState(false);
  const { datasubniveles, setBuscador } = useSubnivelesStore();
  const [accion, setAccion] = useState("");
  const [dataSelect, setDataSelect] = useState(null);
  const [isExploding, setIsExploding] = useState(false);

  function nuevoRegistro() {
    setOpenRegistro(true);
    setAccion("Nuevo");
    setDataSelect(null);
    setIsExploding(false);
  }

  return (
    <Container>
      {openRegistro && (
        <RegistrarSubniveles
          setIsExploding={setIsExploding}
          onClose={() => setOpenRegistro(false)}
          dataSelect={dataSelect}
          accion={accion}
        />
      )}
      <section className="area1">
        <Title>Subniveles</Title>
        <Btn1
          funcion={nuevoRegistro}
          bgcolor={v.colorPrincipal}
          titulo="Nuevo subnivel"
          icono={<v.iconoagregar />}
        />
      </section>
      <section className="area2">
        <Buscador setBuscador={setBuscador} />
      </section>
      <section className="main">
        {isExploding && <ConfettiExplosion />}
        <TablaSubniveles
          setdataSelect={setDataSelect}
          setAccion={setAccion}
          SetopenRegistro={setOpenRegistro}
          data={datasubniveles}
        />
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
    display: flex;
    justify-content: end;
    align-items: center;
    gap: 20px;
  }
  .area2 {
    grid-area: area2;
    display: flex;
    justify-content: end;
    align-items: center;
  }
  .main {
    grid-area: main;
  }
`;