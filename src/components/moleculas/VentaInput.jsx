import styled, { css } from "styled-components";

const variants = {
  solid: css`
    border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.2);
    background: rgba(${({ theme }) => theme.textRgba}, 0.06);
  `,
  dashed: css`
    border: 1px dashed rgba(${({ theme }) => theme.textRgba}, 0.2);
    background: rgba(${({ theme }) => theme.textRgba}, 0.04);
  `,
};

export function VentaInput({
  label,
  placeholder,
  helperText,
  value,
  onChange,
  type = "text",
  variant = "dashed",
  color,
  width,
  height,
  disabled = false,
  ...rest
}) {
  return (
    <Wrapper style={{ width }}>
      {label ? <label>{label}</label> : null}
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        $variant={variant}
        $color={color}
        style={{ height }}
        disabled={disabled}
        {...rest}
      />
      {helperText ? <HelperText>{helperText}</HelperText> : null}
    </Wrapper>
  );
}

const Wrapper = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
  flex: 1 1 0;
  min-width: 0;

  label {
    color: ${({ theme }) => theme.text};
  }
`;

const Input = styled.input`
  border-radius: 14px;
  padding: 12px 16px;
  color: ${({ theme }) => theme.text};
  font-weight: 500;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  ${({ $variant }) => variants[$variant] ?? variants.dashed};
  ${({ $color }) =>
    $color
      ? css`
          border-color: ${$color};
        `
      : null};

  &::placeholder {
    color: rgba(${({ theme }) => theme.textRgba}, 0.55);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const HelperText = styled.small`
  font-size: 0.78rem;
  color: rgba(${({ theme }) => theme.textRgba}, 0.65);
  font-weight: 500;
`;