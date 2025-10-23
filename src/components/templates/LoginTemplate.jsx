import styled from "styled-components";
import { Btn1, Footer, InputText2, Linea, Title, useAuthStore } from "../../index";
import { v } from "../../styles/variables";
import { Device } from "../../styles/breakpoints";

export function LoginTemplate() {

  const {loginGoogle, cerrarSesion} = useAuthStore()

  return (
    <Container>
      <div className="card">
        <ContentLogo>
          <img src={v.logo} alt="Logo" />
          <span>R&H COMPAÑÍA PROVEEDORA DE BIENES Y SERVICIOS S. A. C.</span>
        </ContentLogo>
        <Title $paddingbottom="20px">Ingresar</Title>
        <form>
          <InputText2>
            <input className="form__field" placeholder="Usuario" type="text" />
          </InputText2>

          <InputText2>
            <input
              className="form__field"
              placeholder="Contraseña"
              type="password"
            />
          </InputText2>

          <Btn1
            titulo="INGRESAR"
            bgcolor="#1CB0F6"
            color="255,255,255"
            width="100%"
          />
        </form>

        <Linea>
          <span>O</span>
        </Linea>

        <Btn1 funcion={loginGoogle} titulo="Google" bgcolor="#fff" icono={<v.iconogoogle />} />
      </div>

      <Footer />
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  flex-direction: column;
  padding: 0 30px;
  color: ${({ theme }) => theme.text};
  .card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    width: 100%;
    margin: 20px;
    @media ${Device.tablet} {
      width: 400px;
    }
  }
`;

const ContentLogo = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px;
  span{
    font-weight: 700;
    margin-left: 30px;
    text-align: justify;
  }
  img{
    width: 10%;
  }
`;