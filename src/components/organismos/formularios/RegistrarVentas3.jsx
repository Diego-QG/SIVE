import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { toast } from "sonner";
import { v } from "../../../styles/variables";
import { RegistroVentaStepper } from "../../moleculas/RegistroVentaStepper";
import {
  ClosingOverlay,
  ModalContainer,
  ModalFooter,
  ModalHeader,
  Overlay,
  OutlineButton,
  PrimaryButton,
  Spinner,
  ListaDesplegable,
  useEditorialesStore,
  useRegistrarVentasStore,
  useVentasStore,
} from "../../../index";

export function RegistrarVentas3({
  state,
  isOpen,
  onClose,
  onPrevious,
  onFinish,
  ventaDraftId,
  onPersistDocente,
}) {
  const [isClosing, setIsClosing] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPlacement, setDropdownPlacement] = useState({
    nivel: "bottom",
    subnivel: "bottom",
    contenido: "bottom",
    items: "bottom",
  });
  const nivelTriggerRef = useRef(null);
  const subnivelTriggerRef = useRef(null);
  const contenidoTriggerRef = useRef(null);
  const itemsTriggerRef = useRef(null);
  const { refrescarVentas } = useVentasStore();
  const { editorialesitemselect } = useEditorialesStore();
  const editorialId = editorialesitemselect?.id ?? null;
  const IconCerrar = v.iconocerrar;
  const IconAgregar = v.iconoagregar;
  const IconFlechaIzquierda = v.iconoflechaizquierda;
  const IconCheck = v.iconocheck;

  const triggerRefs = useMemo(
    () => ({
      nivel: nivelTriggerRef,
      subnivel: subnivelTriggerRef,
      contenido: contenidoTriggerRef,
      items: itemsTriggerRef,
    }),
    []
  );

  const {
    niveles,
    subniveles,
    contenidos,
    materiales,
    resumenVenta,
    selectedNivel,
    selectedSubnivel,
    selectedContenido,
    selectedItems,
    isLoadingNiveles,
    isLoadingSubniveles,
    isLoadingContenidos,
    isLoadingMateriales,
    isLoadingResumen,
    isSavingItems,
    isConfirming,
    limpiarSeleccion,
    cargarNiveles,
    cargarSubniveles,
    cargarContenidos,
    cargarMateriales,
    seleccionarNivel,
    seleccionarSubnivel,
    seleccionarContenido,
    toggleItem,
    cargarResumenVenta,
    agregarItemsAVenta,
    eliminarItemDeVenta,
    confirmarVenta,
  } = useRegistrarVentasStore();

  const isBusy = isClosing || isConfirming;

  const totalBruto = useMemo(
    () =>
      resumenVenta.reduce(
        (sum, item) =>
          sum +
            (item?.subtotal ??
              (item?.precioUnitario ?? item?.precio ?? 0) * (item?.cantidad ?? 1)),
        0
      ),
    [resumenVenta]
  );

  const totalDescuento = useMemo(
    () => resumenVenta.reduce((sum, item) => sum + (item?.descuento ?? 0), 0),
    [resumenVenta]
  );

  const totalNeto = useMemo(
    () => Math.max(totalBruto - totalDescuento, 0),
    [totalBruto, totalDescuento]
  );

  useEffect(() => {
    if (!state) {
      return;
    }

    setIsClosing(false);
    cargarNiveles();
    if (ventaDraftId) {
      cargarResumenVenta(ventaDraftId);
    }
  }, [cargarNiveles, cargarResumenVenta, state, ventaDraftId]);

  useEffect(() => {
    if (state || isOpen) return;
    limpiarSeleccion();
    setOpenDropdown(null);
  }, [isOpen, limpiarSeleccion, state]);

  const nivelLabel = useMemo(() => {
    if (selectedNivel?.nombre) return selectedNivel.nombre;
    if (isLoadingNiveles) return "Cargando niveles...";
    return "Niveles disponibles";
  }, [isLoadingNiveles, selectedNivel]);

  const subnivelLabel = useMemo(() => {
    if (selectedSubnivel?.nombre) return selectedSubnivel.nombre;
    if (isLoadingSubniveles) return "Cargando subniveles...";
    return "Subniveles disponibles";
  }, [isLoadingSubniveles, selectedSubnivel]);

  const contenidoLabel = useMemo(() => {
    if (selectedContenido?.nombre) return selectedContenido.nombre;
    if (isLoadingContenidos) return "Cargando contenidos...";
    return "Cursos o paquetes";
  }, [isLoadingContenidos, selectedContenido]);

  const itemsLabel = useMemo(() => {
    if (isLoadingMateriales) return "Buscando materiales...";
    if (selectedItems.length === 1) {
      const material = materiales.find((item) => item.id === selectedItems[0]);
      return material?.label ?? "1 material";
    }
    if (selectedItems.length > 1) return `${selectedItems.length} materiales`;
    return "Items disponibles";
  }, [isLoadingMateriales, materiales, selectedItems]);

  if (!isOpen) {
    return null;
  }

  const handleRequestClose = async () => {
    if (isClosing) {
      return;
    }

    setIsClosing(true);

    try {
      await onClose?.();
    } catch (error) {
      console.error(error);
      setIsClosing(false);
    }
  };

  const determinePlacement = (name) => {
    const ref = triggerRefs[name];
    if (!ref?.current) return "bottom";

    const rect = ref.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedHeight = name === "items" ? 360 : 280;

    if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
      return "top";
    }

    return "bottom";
  };

  const toggleDropdown = async (name) => {
    if (name === "subnivel" && !selectedNivel) {
      toast.warning("No puedes seleccionar subnivel sin antes nivel.");
      return;
    }

    if (name === "contenido") {
      if (!editorialId) {
        toast.warning("Selecciona una editorial en el paso 1.");
        return;
      }
      if (!selectedNivel) {
        toast.warning("Selecciona un nivel antes de continuar.");
        return;
      }
      if (!selectedSubnivel) {
        toast.warning("No puedes seleccionar contenido sin un subnivel.");
        return;
      }
      if (!contenidos.length) {
        await cargarContenidos({
          idNivel: selectedNivel?.id,
          idSubnivel: selectedSubnivel?.id,
          editorialId,
        });
      }
    }

    if (name === "items") {
      if (!editorialId) {
        toast.warning("Selecciona primero una editorial en el paso 1.");
        return;
      }
      if (!selectedNivel || !selectedSubnivel || !selectedContenido) {
        toast.warning("Selecciona nivel, subnivel y curso/paquete antes de ver items.");
        return;
      }

      await cargarMateriales({ editorialId });
    }

    setDropdownPlacement((prev) => ({
      ...prev,
      [name]: determinePlacement(name),
    }));

    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const handleSelectNivel = async (nivel) => {
    seleccionarNivel(nivel);
    await cargarSubniveles(nivel?.id);
    setOpenDropdown(null);
  };

  const handleSelectSubnivel = async (subnivel) => {
    seleccionarSubnivel(subnivel);
    if (selectedNivel?.id && subnivel?.id && editorialId) {
      await cargarContenidos({
        idNivel: selectedNivel.id,
        idSubnivel: subnivel.id,
        editorialId,
      });
    }
    setOpenDropdown(null);
  };

  const handleSelectContenido = async (contenido) => {
    seleccionarContenido(contenido);
    await cargarMateriales({ editorialId });
    setOpenDropdown(null);
    setOpenDropdown("items");
  };

  const handleAgregarItems = async () => {
    if (!ventaDraftId) {
      toast.error("Primero crea un borrador de venta en los pasos anteriores.");
      return;
    }

    if (!selectedItems.length) {
      toast.warning("Selecciona al menos un material para agregar.");
      return;
    }

    const agregado = await agregarItemsAVenta({ idVenta: ventaDraftId });
    if (agregado) {
      toast.success("Materiales agregados correctamente.");
      setOpenDropdown(null);
    } else {
      toast.error("No se pudieron agregar los materiales.");
    }
  };

  const handleEliminarItem = async (itemId) => {
    if (!itemId) return;
    const eliminado = await eliminarItemDeVenta({ idVenta: ventaDraftId, idItem: itemId });
    if (eliminado) {
      toast.success("Item eliminado del resumen.");
    }
  };

  const handleFinish = async () => {
    if (!ventaDraftId) {
      toast.error("No se encontró el borrador de la venta.");
      return;
    }

    if (resumenVenta.length === 0) {
      toast.warning("Agrega al menos un item antes de registrar la venta.");
      return;
    }

    const canPersistDocente = await onPersistDocente?.();
    if (canPersistDocente === false) {
      return;
    }

    const confirmado = await confirmarVenta({ idVenta: ventaDraftId });
    if (confirmado) {
      await refrescarVentas();
      onFinish?.();
      return;
    }

    toast.error("No se pudo registrar la venta. Intenta nuevamente.");
  };

  return (
    <Overlay $visible={state}>
      <Modal aria-busy={isBusy} $visible={state}>
        <Header>
          <div>
            <p>Registrar nueva venta</p>
            <h2>Datos de venta</h2>
          </div>
            <button type="button" onClick={handleRequestClose} aria-label="Cerrar" disabled={isBusy}>
              <IconCerrar />
            </button>
        </Header>

        <RegistroVentaStepper currentStep={3} />

        <Body>
          <SelectorsPanel>
            <SelectorsCard>
              <SelectorGrid>
            <SelectorColumn>
              <span>Seleccionar nivel</span>
              <SelectorButton
                type="button"
                ref={triggerRefs.nivel}
                onClick={() => toggleDropdown("nivel")}
                $disabled={isBusy}
              >
                {nivelLabel}
              </SelectorButton>
              <ListaDesplegable
                data={niveles}
                state={openDropdown === "nivel"}
                setState={() => setOpenDropdown(null)}
                funcion={handleSelectNivel}
                onClear={() => seleccionarNivel(null)}
                placement={dropdownPlacement.nivel}
              />
            </SelectorColumn>
            <SelectorColumn>
              <span>Seleccionar subnivel</span>
              <SelectorButton
                type="button"
                ref={triggerRefs.subnivel}
                onClick={() => toggleDropdown("subnivel")}
                $disabled={isBusy}
              >
                {subnivelLabel}
              </SelectorButton>
              <ListaDesplegable
                data={subniveles}
                state={openDropdown === "subnivel"}
                setState={() => setOpenDropdown(null)}
                funcion={handleSelectSubnivel}
                onClear={() => seleccionarSubnivel(null)}
                placement={dropdownPlacement.subnivel}
              />
            </SelectorColumn>
            <SelectorColumn>
              <span>Seleccionar curso o paquete</span>
              <SelectorButton
                type="button"
                ref={triggerRefs.contenido}
                onClick={() => toggleDropdown("contenido")}
                $disabled={isBusy}
              >
                {contenidoLabel}
              </SelectorButton>
              <ListaDesplegable
                data={contenidos}
                state={openDropdown === "contenido"}
                setState={() => setOpenDropdown(null)}
                funcion={handleSelectContenido}
                onClear={() => seleccionarContenido(null)}
                emptyLabel={selectedSubnivel ? "Sin cursos ni paquetes" : "Selecciona un subnivel"}
                placement={dropdownPlacement.contenido}
              />
            </SelectorColumn>
            <SelectorColumn>
              <span>Seleccionar items</span>
              <SelectorButton
                type="button"
                ref={triggerRefs.items}
                onClick={() => toggleDropdown("items")}
                $disabled={isBusy}
              >
                {itemsLabel}
              </SelectorButton>
              {openDropdown === "items" && (
                <ItemsDropdown
                  ref={itemsTriggerRef}
                  $placement={dropdownPlacement.items}
                >
                  {isLoadingMateriales ? (
                    <div className="empty">
                      <Spinner />
                      <small>Cargando items...</small>
                    </div>
                  ) : materiales.length === 0 ? (
                    <EmptyState>Sin materiales para los filtros seleccionados.</EmptyState>
                  ) : (
                    <ul>
                      {materiales.map((material) => {
                        const isChecked = selectedItems.includes(material.id);
                        return (
                          <li key={material.id}>
                            <label>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleItem(material.id)}
                              />
                              <div className="info">
                                <span className="label">{material.label}</span>
                                <small>S/{material.precio.toFixed(2)}</small>
                              </div>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <button
                    type="button"
                    className="add-btn"
                    onClick={handleAgregarItems}
                    disabled={isSavingItems || isBusy}
                  >
                    {isSavingItems ? <Spinner /> : <IconAgregar />}
                    <span>Agregar</span>
                  </button>
                </ItemsDropdown>
              )}
            </SelectorColumn>
              </SelectorGrid>
            </SelectorsCard>
          </SelectorsPanel>

          <ResumenWrapper>
            <ResumenCard>
            <header>
              <div>
                <h4>Resumen de venta</h4>
                <p>Los montos se actualizan al agregar o quitar items.</p>
              </div>
              <GhostButton type="button" disabled>
                Aplicar cupón
              </GhostButton>
            </header>
            <ResumenHeaderRow>
              <span>Detalle</span>
              <span className="center">Cantidad</span>
              <span className="center">Precio unitario</span>
              <span className="end">Subtotal</span>
              <span className="actions" aria-hidden />
            </ResumenHeaderRow>
            <ul>
              {isLoadingResumen ? (
                <li className="empty">
                  <Spinner />
                </li>
              ) : resumenVenta.length === 0 ? (
                <li className="empty">
                  <span>No hay materiales agregados todavía.</span>
                </li>
              ) : (
                resumenVenta.map((item) => (
                  <li key={item.id}>
                    <div className="item-title">
                      <strong>{item.nombre}</strong>
                      <div className="item-meta">
                        {item.nivel && <small>{item.nivel}</small>}
                        {item.subnivel && <small>{item.subnivel}</small>}
                        {item.curso && <small>{item.curso}</small>}
                      </div>
                    </div>
                    <div className="center">x{item.cantidad ?? 1}</div>
                    <div className="center">S/{(item.precioUnitario ?? item.precio).toFixed(2)}</div>
                    <div className="end">S/{(item.subtotal ?? item.precio).toFixed(2)}</div>
                    <RemoveButton
                      type="button"
                      onClick={() => handleEliminarItem(item.id)}
                      disabled={isBusy}
                    >
                      <IconCerrar aria-hidden />
                    </RemoveButton>
                  </li>
                ))
              )}
            </ul>
            <Totals>
              <div>
                <span>Total bruto</span>
                <b>S/{totalBruto.toFixed(2)}</b>
              </div>
              <div>
                <span>Total descuento</span>
                <b>S/{totalDescuento.toFixed(2)}</b>
              </div>
              <div className="neto">
                <span>Total neto</span>
                <strong>S/{totalNeto.toFixed(2)}</strong>
              </div>
            </Totals>
            </ResumenCard>
          </ResumenWrapper>
        </Body>

        <Footer>
            <OutlineButton type="button" onClick={onPrevious} disabled={isBusy}>
              <IconFlechaIzquierda /> Atrás
            </OutlineButton>
            <SuccessButton type="button" onClick={handleFinish} disabled={isBusy}>
              Registrar venta <IconCheck />
            </SuccessButton>
          </Footer>
        {(isClosing || isConfirming) && (
          <ClosingOverlay>
            <Spinner />
            <strong>{isConfirming ? "Registrando venta..." : "Guardando cambios..."}</strong>
            <small>Por favor espera un momento.</small>
          </ClosingOverlay>
        )}
      </Modal>
    </Overlay>
  );
}

// Modal más ancho en desktop para dar aire al selector y al resumen.
const Modal = styled(ModalContainer)`
  width: min(1100px, 88vw);
  max-width: 1100px;
  height: min(860px, 90vh);
  max-height: min(860px, 90vh);
`;

const Header = styled(ModalHeader)``;

const Body = styled.div`
  display: grid;
  grid-template-columns: minmax(260px, 0.36fr) minmax(460px, 0.64fr);
  gap: clamp(16px, 2vw, 26px);
  align-items: start;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 6px;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(${({ theme }) => theme.textRgba}, 0.2);
    border-radius: 999px;
  }
`;

const SelectorsPanel = styled.section`
  display: flex;
  justify-content: flex-start;
  width: 100%;
`;

const SelectorsCard = styled.div`
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
  background: rgba(${({ theme }) => theme.textRgba}, 0.02);
  border-radius: 18px;
  padding: clamp(12px, 1.5vw, 18px);
  width: 100%;
  max-width: 340px;
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.08);

  @media (max-width: 1080px) {
    max-width: none;
  }
`;

const SelectorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px 14px;
  justify-content: start;
`;

const SelectorColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 600;
  position: relative;

  @media (min-width: 960px) {
    max-width: 250px;
  }
`;

const ResumenWrapper = styled.div`
  min-width: 0;
`;

const SelectorButton = styled.button`
  border-radius: 16px;
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.2);
  padding: 12px 18px;
  background: rgba(${({ theme }) => theme.textRgba}, 0.02);
  color: ${({ theme }) => theme.text};
  text-align: left;
  cursor: pointer;
  position: relative;
  width: 100%;
  max-width: 100%;

  &[disabled],
  &[data-disabled="true"] {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ResumenCard = styled.section`
  border-radius: 24px;
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
  background: rgba(${({ theme }) => theme.textRgba}, 0.03);
  padding: clamp(16px, 1.8vw, 22px);
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;

  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;

    p {
      margin: 4px 0 0;
      color: rgba(${({ theme }) => theme.textRgba}, 0.65);
      max-width: 100%;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 340px;
    overflow-y: auto;
    padding-right: 4px;
    min-width: 0;

    li {
      display: grid;
      grid-template-columns: 1.6fr 0.5fr 0.7fr 0.7fr auto;
      gap: 10px;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px dashed rgba(${({ theme }) => theme.textRgba}, 0.15);

      @media (max-width: 720px) {
        grid-template-columns: 1fr 0.6fr;
        grid-template-rows: auto auto;
        row-gap: 8px;
      }

      .item-title {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
      }

      .item-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;

        small {
          background: rgba(${({ theme }) => theme.textRgba}, 0.06);
          padding: 4px 8px;
          border-radius: 10px;
          font-weight: 600;
        }
      }

      .center {
        text-align: center;
        font-weight: 700;
      }

      .end {
        text-align: right;
        font-weight: 700;
      }

      strong {
        font-size: 1rem;
      }

      span {
        color: rgba(${({ theme }) => theme.textRgba}, 0.65);
      }

      @media (max-width: 720px) {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto auto auto;
        .item-title {
          grid-column: 1 / -1;
        }

        .end {
          text-align: right;
        }
      }
    }

    .empty {
      justify-content: center;
      border-bottom: none;
      padding: 20px;
      color: rgba(${({ theme }) => theme.textRgba}, 0.6);
      display: grid;
      place-items: center;
    }
  }

  footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    small {
      color: rgba(${({ theme }) => theme.textRgba}, 0.65);
    }

    strong {
      font-size: 1.2rem;
      line-height: 1.3;
    }
  }
`;

const ResumenHeaderRow = styled.div`
  display: grid;
  grid-template-columns: 1.6fr 0.5fr 0.7fr 0.7fr auto;
  gap: 10px;
  padding: 0 6px;
  font-weight: 700;
  color: rgba(${({ theme }) => theme.textRgba}, 0.55);
  align-items: center;

  .center {
    text-align: center;
  }

  .end {
    text-align: right;
  }

  @media (max-width: 720px) {
    display: none;
  }
`;

const Totals = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  align-items: start;

  div {
    background: rgba(${({ theme }) => theme.textRgba}, 0.04);
    border: 1px dashed rgba(${({ theme }) => theme.textRgba}, 0.12);
    border-radius: 14px;
    padding: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }

  span {
    color: rgba(${({ theme }) => theme.textRgba}, 0.6);
    font-weight: 600;
  }

  b,
  strong {
    font-weight: 800;
  }

  .neto {
    background: rgba(23, 224, 192, 0.12);
    border-color: rgba(23, 224, 192, 0.35);
  }
`;

const Footer = styled(ModalFooter)`
  @media (max-width: 520px) {
    flex-direction: column;
  }
`;

const SuccessButton = styled(PrimaryButton)`
  background: linear-gradient(120deg, #17e0c0, #53b257);
  color: #031c17;
`;

const GhostButton = styled.button`
  border: none;
  border-radius: 14px;
  padding: 0 22px;
  background: rgba(23, 224, 192, 0.15);
  color: #0c554a;
  font-weight: 700;
  cursor: pointer;
  height: 26px;
  min-height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ItemsDropdown = styled.div`
  position: absolute;
  z-index: 3;
  ${({ $placement }) =>
    $placement === "top"
      ? "bottom: calc(100% + 10px);"
      : "top: calc(100% + 10px);"};
  background: ${({ theme }) => theme.body};
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.12);
  border-radius: 14px;
  padding: 12px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.26);
  min-width: min(360px, 92vw);
  max-width: min(480px, 96vw);
  max-height: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 220px;
    overflow-y: auto;
  }

  li label {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 12px;
    border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.1);
    background: rgba(${({ theme }) => theme.textRgba}, 0.02);
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .label {
    font-weight: 600;
  }

  .add-btn {
    border: none;
    background: rgba(23, 224, 192, 0.15);
    color: #06463b;
    border-radius: 12px;
    padding: 10px 16px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-weight: 700;
  }

  .add-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const RemoveButton = styled.button`
  border: none;
  background: rgba(${({ theme }) => theme.textRgba}, 0.08);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 16px;
  color: rgba(${({ theme }) => theme.textRgba}, 0.65);
`;