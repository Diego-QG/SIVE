import styled from "styled-components";
import { SupervisionTable } from "../../index";
import { v } from "../../styles/variables";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  padding: 20px;
  background-color: ${({ theme }) => theme.bgtotal};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h1 {
      color: ${({ theme }) => theme.text};
      font-size: 24px;
      font-weight: 600;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: ${v.colorPrincipal}; // Using primary color
  color: #000;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }

  i {
    font-size: 1.2rem;
  }
`;

export function SupervisionTemplate({ dataVentas, currentUserId, onUnlock, onShowVouchers }) {
  const navigate = useNavigate();

  return (
    <Container>
      <Header>
        <h1>Supervisión de Ventas</h1>
        <BackButton onClick={() => navigate('/herramientas')}>
           <i className="fas fa-arrow-left"></i>
           Volver a Herramientas
        </BackButton>
      </Header>
      <SupervisionTable
        data={dataVentas}
        currentUserId={currentUserId}
        onUnlock={onUnlock}
        onShowVouchers={onShowVouchers}
      />
    </Container>
  );
}
