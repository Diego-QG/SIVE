import styled from "styled-components";
import {Reloj, ToggleTema, UserAuth} from "../../index"

export function HomeTemplate() {

    const {user} = UserAuth();

    return (
        <Container>
            <span>Home Template</span>
            <article className="contentfecha area3">
                <Reloj />
            </article>
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