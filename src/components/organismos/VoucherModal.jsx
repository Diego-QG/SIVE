import React, { useState } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
`;

const ModalContent = styled.div`
  background: white;
  padding: 10px;
  border-radius: ${v.borderRadius};
  max-width: 90vw;
  max-height: 90vh;
  position: relative;
  overflow: hidden;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  border: none;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  z-index: 10;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ImageContainer = styled.div`
    display: flex;
    overflow-x: auto;
    gap: 10px;
    padding: 20px;
    max-width: 100%;

    img {
        max-height: 80vh;
        max-width: 100%;
        object-fit: contain;
    }
`;

export function VoucherModal({ onClose, vouchers, titulo }) {
    if (!vouchers || vouchers.length === 0) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <CloseButton onClick={onClose}>&times;</CloseButton>
                <h3 style={{ textAlign: 'center', margin: '10px 0' }}>{titulo}</h3>
                <ImageContainer>
                    {vouchers.map((v, idx) => (
                        <img key={idx} src={v.archivo} alt={`Voucher ${idx + 1}`} />
                    ))}
                </ImageContainer>
            </ModalContent>
        </ModalOverlay>
    );
}
