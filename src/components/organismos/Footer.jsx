import styled from "styled-components";
import { GiPadlock } from "react-icons/gi";
export function Footer() {
  return (
    <Container>
      <section className="lock">
        <GiPadlock />
        <span>
          Estás en un espacio seguro de R&H. Si necesitas confirmar la
          autenticidad de este portal, comunícate con nuestro equipo al 311-9898
          o escríbenos mediante nuestros canales digitales.
        </span>
      </section>
      <section className="derechos">
        <span>R&H Compañía Proveedora de Bienes y Servicios</span>
        <div className="separador"></div>
        <span>Construyendo soluciones contigo cada día</span>
        <div className="separador"></div>
        <span>© 2024 R&H S. A. C.</span>
      </section>
    </Container>
  );
}
const Container = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 12.2px;
  color: #91a4b7;
  gap: 5px;
  margin: 10px;
  .lock {
    border-bottom: 1px solid rgba(145, 164, 183, 0.3);
    gap: 5px;
    display: flex;
    align-items: center;
  }
  .derechos {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    flex-wrap: wrap;
    width: 100%;
    gap: 24px;
    .separador {
      width: 1px;
      background-color: rgba(145, 164, 183, 0.3);
      min-height: 16px;
      align-self: stretch;
    }
    span {
      margin-top: 5px;
    }
  }
`;