import styled from "styled-components";
import { v } from "../../../styles/variables";

export function ModalVouchers({ open, onClose, vouchers = [] }) {
    if (!open) return null;

    return (
        <Overlay onClick={onClose}>
            <Container onClick={(e) => e.stopPropagation()}>
                <Header>
                    <h3>Vouchers de Venta</h3>
                    <button onClick={onClose}>&times;</button>
                </Header>
                <Content>
                    {vouchers.length === 0 ? (
                        <p>No hay vouchers registrados para esta venta.</p>
                    ) : (
                        <Grid>
                            {vouchers.map((url, idx) => (
                                <ImageCard key={idx} href={url} target="_blank" rel="noopener noreferrer">
                                    <img src={url} alt={`Voucher ${idx + 1}`} />
                                </ImageCard>
                            ))}
                        </Grid>
                    )}
                </Content>
            </Container>
        </Overlay>
    );
}

const Overlay = styled.div`
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.6);
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Container = styled.div`
    background: ${({theme}) => theme.bgtotal};
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
`;

const Header = styled.div`
    padding: 15px 20px;
    border-bottom: 1px solid rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    h3 { margin: 0; color: ${({theme}) => theme.text}; }
    button { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: ${({theme}) => theme.text}; }
`;

const Content = styled.div`
    padding: 20px;
    overflow-y: auto;
    flex: 1;
    p { color: ${({theme}) => theme.text}; text-align: center; }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
`;

const ImageCard = styled.a`
    display: block;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #ddd;
    height: 150px;
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.2s;
    }
    &:hover img {
        transform: scale(1.05);
    }
`;
