import styled from "styled-components";
import { SupervisionTable } from "../../index";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  padding: 20px;
  background-color: ${({ theme }) => theme.bgtotal};
`;

const TitleSection = styled.div`
  margin-bottom: 20px;
  h1 {
      color: ${({ theme }) => theme.text};
  }
`;

export function SupervisionTemplate({ dataVentas, currentUserId, onUnlock, onShowVouchers }) {
  return (
    <Container>
      <TitleSection>
        <h1>Supervisión de Ventas</h1>
      </TitleSection>
      <SupervisionTable
        data={dataVentas}
        currentUserId={currentUserId}
        onUnlock={onUnlock}
        onShowVouchers={onShowVouchers}
      />
    </Container>
  );
}
