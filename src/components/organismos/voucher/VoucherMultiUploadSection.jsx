import styled from "styled-components";
import { VoucherUploadButton } from "./VoucherUploadButton";
import { VoucherGallery } from "./VoucherGallery";

export function VoucherMultiUploadSection({
  vouchers = [],
  onFilesSelected,
  onDrop,
  onDragOver,
  onVoucherClick,
  onRemoveVoucher,
  title = "Subir voucher de venta",
  description = "Arrastra, suelta o haz clic para elegir archivos",
  emptyMessage = "Aún no se han cargado vouchers",
}) {
  const helperText = vouchers.length
    ? `${vouchers.length} archivo${vouchers.length > 1 ? "s" : ""} seleccionado${
        vouchers.length > 1 ? "s" : ""
      }`
    : "Puedes adjuntar múltiples vouchers (varias imágenes).";

  return (
    <SectionWrapper>
      <section>
        <div className="voucher-section__info">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>

        <div className="voucher-section__cta">
          <small>{helperText}</small>
          <VoucherUploadButton
            label="Seleccionar"
            onFilesSelected={onFilesSelected}
            multiple
          />
        </div>
      </section>

      <VoucherGallery
        vouchers={vouchers}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onVoucherClick={onVoucherClick}
        onRemoveVoucher={onRemoveVoucher}
        emptyMessage={emptyMessage}
      />
    </SectionWrapper>
  );
}

const SectionWrapper = styled.div`
  border-radius: 24px;
  padding: 18px;
  background: rgba(${({ theme }) => theme.textRgba}, 0.04);
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;

  section {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(220px, 260px);
    align-items: center;
    gap: 24px;

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }

  .voucher-section__info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  h3 {
    margin: 0 0 4px;
  }

  p {
    margin: 0;
    color: rgba(${({ theme }) => theme.textRgba}, 0.7);
  }

  .voucher-section__cta {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    width: 100%;
    text-align: left;
    justify-content: center;
  }

  small {
    color: rgba(${({ theme }) => theme.textRgba}, 0.6);
  }
`;