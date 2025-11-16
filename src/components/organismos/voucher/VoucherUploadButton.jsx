import { useRef } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";

export function VoucherUploadButton({
  label = "Seleccionar",
  onFilesSelected,
  multiple = true,
}) {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (event) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length && typeof onFilesSelected === "function") {
      onFilesSelected(files);
    }

    event.target.value = "";
  };

  return (
    <UploadButton type="button" onClick={handleButtonClick}>
      <div className="icon">
        <v.iconoimagenvacia />
      </div>
      <span>{label}</span>
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        ref={fileInputRef}
        onChange={handleChange}
      />
    </UploadButton>
  );
}

const UploadButton = styled.button`
  border-radius: 18px;
  border: 1.5px dashed rgba(247, 199, 68, 0.95);
  background: rgba(247, 199, 68, 0.2);
  padding: 14px 20px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  width: 100%;
  justify-content: center;
  min-height: 58px;

  input {
    display: none;
  }

  .icon {
    font-size: 22px;
    color: #f7c744;
    display: flex;
  }
`;