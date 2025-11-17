import styled, { css } from "styled-components";

export function VoucherGallery({
  vouchers = [],
  onDrop,
  onDragOver,
  onVoucherClick,
  onRemoveVoucher,
  emptyMessage = "Aún no se han cargado vouchers",
}) {
  const isEmpty = vouchers.length === 0;

  return (
    <VoucherPreview
      $isEmpty={isEmpty}
      onDrop={onDrop}
      onDragOver={onDragOver}
      aria-live="polite"
    >
      {isEmpty ? (
        <p className="empty">{emptyMessage}</p>
      ) : (
        vouchers.map((voucher, index) => (
          <div
            key={voucher.id}
            className="voucher-card"
            onClick={() => onVoucherClick?.(voucher)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                onVoucherClick?.(voucher);
              }
            }}
          >
            <button
              type="button"
              className="voucher-card__remove"
              onClick={(event) => {
                event.stopPropagation();
                onRemoveVoucher?.(voucher.id);
              }}
              aria-label={`Eliminar voucher ${index + 1}`}
            >
              ×
            </button>
            <img src={voucher.preview} alt={`Voucher ${index + 1}`} />
            <span>Voucher {index + 1}</span>
          </div>
        ))
      )}
    </VoucherPreview>
  );
}

const VoucherPreview = styled.div`
  flex: none;
  height: auto;
  min-height: 250px;
  max-height: 250px;
  box-sizing: border-box;
  border-radius: 20px;
  border: 1px dashed rgba(${({ theme }) => theme.textRgba}, 0.2);
  background: rgba(${({ theme }) => theme.textRgba}, 0.02);
  padding: 12px;

  ${({ $isEmpty }) =>
    $isEmpty
      ? css`
          display: grid;
          place-items: center;
          overflow: hidden;

          .empty {
            margin: 0;
            color: rgba(${({ theme }) => theme.textRgba}, 0.6);
            text-align: center;
          }
        `
      : css`
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          justify-content: center;
          align-content: flex-start;
          overflow-y: auto;

          &::-webkit-scrollbar {
            width: 8px;
          }

          &::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 999px;
          }

          &::-webkit-scrollbar-thumb {
            background: rgba(${({ theme }) => theme.textRgba}, 0.15);
            border-radius: 999px;
          }
        `}

  .voucher-card {
    position: relative;
    border-radius: 16px;
    background: rgba(${({ theme }) => theme.textRgba}, 0.04);
    border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: center;
    flex: 0 0 214px;

    img {
      width: 100%;
      height: 170px;
      object-fit: contain;
      border-radius: 12px;
      background: rgba(4, 18, 29, 0.3);
      padding: 4px;
    }

    span {
      font-size: 0.85rem;
      font-weight: 600;
    }

    &__remove {
      position: absolute;
      top: 8px;
      right: 8px;
      border: none;
      background: rgba(0, 0, 0, 0.45);
      color: #fff;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      cursor: pointer;
      line-height: 1;
      font-size: 1rem;
    }
  }
`;