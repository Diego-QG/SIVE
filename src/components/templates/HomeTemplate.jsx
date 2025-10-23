import styled from "styled-components";
import {ToggleTema, useAuthStore, UserAuth} from "../../index"

export function HomeTemplate() {

    const {cerrarSesion} = useAuthStore();
    const {user} = UserAuth();

    return (
        <Container>
            <span>Home Template</span>
            <button onClick={cerrarSesion}>Cerrar</button>
            <ToggleWrapper>
                <ToggleTema />
            </ToggleWrapper>
        </Container>
    )
}

const Container = styled.div`
    height: 100vh;
    width: 100%;
    position: relative;
`
const ToggleWrapper = styled.div`
  position: fixed;
  top: 15px;
  right: 20px;
  z-index: 10;
`;