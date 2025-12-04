import styled from "styled-components";
import { SupervisionTable } from "../../index";
import { v } from "../../styles/variables";
import { useNavigate } from "react-router-dom";
import { Title } from "../../index";
import { FaArrowLeft } from "react-icons/fa";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  padding: 20px;
  background-color: ${({ theme }) => theme.bgtotal};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  ${Title} {
      color: ${({ theme }) => theme.text};
      font-size: 28px;
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
  border: 1px solid transparent;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    border-color: ${({ theme }) => `rgba(${theme.textRgba}, 0.1)`};
  }

  i {
    font-size: 1.2rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Helper = styled.p`
  margin: 0;
  color: ${({ theme }) => `rgba(${theme.textRgba}, 0.65)`};
  max-width: 900px;
  line-height: 1.5;
`;

export function SupervisionTemplate({ dataVentas, currentUserId, onReview, onShowVouchers }) {
  const navigate = useNavigate();

  return (
    <Container>
      <Header>
        <div>
          <Title>Supervisión</Title>
          <Helper>
            Toma una venta pendiente, revisa sus comprobantes y aprueba o rechaza con evidencia.
            Solo se muestran ventas en espera de supervisión.
          </Helper>
        </div>
        <HeaderActions>
          <BackButton onClick={() => navigate('/herramientas')}>
             <FaArrowLeft />
             Volver a herramientas
          </BackButton>
        </HeaderActions>
      </Header>
      <SupervisionTable
        data={dataVentas}
        currentUserId={currentUserId}
        onReview={onReview}
        onShowVouchers={onShowVouchers}
      />
    </Container>
  );
}
