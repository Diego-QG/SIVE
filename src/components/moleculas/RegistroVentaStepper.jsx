import styled from "styled-components";

const steps = [
  { id: 1, label: "Docente" },
  { id: 2, label: "Materiales" },
  { id: 3, label: "Comprobantes" },
];

export function RegistroVentaStepper({ currentStep = 1 }) {
  return (
    <Stepper>
      {steps.map((step, index) => {
        const status =
          currentStep === step.id
            ? "active"
            : currentStep > step.id
            ? "completed"
            : "pending";

        return (
          <StepItem key={step.id} className={status}>
            <div className="bullet">{step.id}</div>
            <div className="labels">
              <span className="title">Paso {step.id}</span>
              <strong>{step.label}</strong>
            </div>
            {index < steps.length - 1 && <div className="connector" aria-hidden />}
          </StepItem>
        );
      })}
    </Stepper>
  );
}

const Stepper = styled.div`
  display: flex;
  gap: 12px;
  align-items: stretch;
  width: 100%;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const StepItem = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 18px;
  background: rgba(${({ theme }) => theme.textRgba}, 0.03);
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);

  .bullet {
    width: 36px;
    height: 36px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    font-weight: 700;
    background: rgba(${({ theme }) => theme.textRgba}, 0.15);
    color: ${({ theme }) => theme.text};
  }

  .labels {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .title {
      font-size: 0.75rem;
      color: rgba(${({ theme }) => theme.textRgba}, 0.65);
    }

    strong {
      font-size: 0.95rem;
      font-weight: 600;
      color: ${({ theme }) => theme.text};
    }
  }

  .connector {
    position: absolute;
    right: -6px;
    top: 50%;
    width: 12px;
    height: 2px;
    background: rgba(${({ theme }) => theme.textRgba}, 0.2);
    transform: translateY(-50%);
  }

  &.active {
    border-color: rgba(255, 215, 0, 0.45);
    background: linear-gradient(
      145deg,
      rgba(255, 230, 128, 0.25),
      rgba(255, 255, 255, 0.08)
    );

    .bullet {
      background: #ffe082;
      color: #271900;
    }
  }

  &.completed {
    border-color: rgba(23, 224, 192, 0.45);
    background: linear-gradient(
      145deg,
      rgba(23, 224, 192, 0.25),
      rgba(255, 255, 255, 0.06)
    );

    .bullet {
      background: #17e0c0;
      color: #021515;
    }

    .connector {
      background: rgba(23, 224, 192, 0.65);
    }
  }
`;