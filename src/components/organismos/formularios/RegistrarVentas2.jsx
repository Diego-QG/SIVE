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
import { InputText } from "./InputText";

export function RegistrarVentas2({
  state,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  ventaDraftId,
  onVentaTieneDatosChange,
}) {
  const [isClosing, setIsClosing] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPlacement, setDropdownPlacement] = useState({
    nivel: "bottom",
    subnivel: "bottom",
    contenido: "bottom",
    year: "bottom",
    items: "bottom",
  });
  const [selectedYear, setSelectedYear] = useState(2025);
  const [searchTerm, setSearchTerm] = useState("");
  const [stateEditorialesLista, setStateEditorialesLista] = useState(false);
  const [isSavingEditorial, setIsSavingEditorial] = useState(false);

  const nivelTriggerRef = useRef(null);
  const subnivelTriggerRef = useRef(null);
  const contenidoTriggerRef = useRef(null);
  const yearTriggerRef = useRef(null);
  const itemsTriggerRef = useRef(null);
  const { dataeditoriales, editorialesitemselect, selecteditorial } = useEditorialesStore();
  const editorialId = editorialesitemselect?.id ?? null;
  const IconCerrar = v.iconocerrar;
  const IconAgregar = v.iconoagregar;
  const IconFlechaIzquierda = v.iconoflechaizquierda;
  const IconNext = v.icononext;
  const IconLupa = v.iconobuscar;

  const triggerRefs = useMemo(
    () => ({
      nivel: nivelTriggerRef,
      subnivel: subnivelTriggerRef,
      contenido: contenidoTriggerRef,
      year: yearTriggerRef,
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
  } = useRegistrarVentasStore();
  const { insertareditorialenventa } = useVentasStore();

  const isBusy = isClosing || isSavingItems;

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

  const hasEditoriales = (dataeditoriales ?? []).length > 0;
  const hasSelectedEditorial = Boolean(editorialesitemselect?.nombre?.trim());
  const selectorText = isSavingEditorial
    ? "Guardando..."
    : hasSelectedEditorial
    ? editorialesitemselect?.nombre
    : hasEditoriales
    ? "Editoriales disponibles"
    : "Sin editoriales disponibles";

  const years = useMemo(
    () => [
      { id: 2024, nombre: "2024" },
      { id: 2025, nombre: "2025" },
    ],
    []
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
    setSearchTerm("");
    setSelectedYear(2025);
    setStateEditorialesLista(false);
  }, [isOpen, limpiarSeleccion, state]);

  const clearEditorialSelection = () => {
    selecteditorial(null);
    onVentaTieneDatosChange?.("editorial", false);
  };

  const handleEditorialSelection = async (editorial) => {
    if (!editorial?.id || !ventaDraftId) {
      clearEditorialSelection();
      return;
    }

    setIsSavingEditorial(true);
    const saved = await insertareditorialenventa({
      _id_venta: ventaDraftId,
      _id_editorial: editorial.id,
    });
    setIsSavingEditorial(false);

    if (saved) {
      selecteditorial(editorial);
      onVentaTieneDatosChange?.("editorial", true);
      await cargarContenidos({
        idNivel: selectedNivel?.id,
        idSubnivel: selectedSubnivel?.id,
        editorialId: editorial.id,
      });
      await cargarMateriales({ editorialId: editorial.id });
    }
  };

  const toggleEditoriales = () => {
    if (!hasEditoriales || isBusy) return;
    setStateEditorialesLista((prev) => !prev);
  };

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

  const filteredMateriales = useMemo(() => {
    return materiales.filter((m) => {
      const mYear = m.anio ? Number(m.anio) : null;
      const matchesYear = mYear ? mYear === selectedYear : true;
      const matchesSearch = searchTerm
        ? m.label.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchesYear && matchesSearch;
    });
  }, [materiales, selectedYear, searchTerm]);

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
        toast.warning("Selecciona una editorial primero.");
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
        toast.warning("Selecciona una editorial para ver los items.");
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

  const handleSelectYear = (yearOption) => {
    setSelectedYear(yearOption.id);
    setOpenDropdown(null);
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
      setSearchTerm("");
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

  const handleNavigateNext = () => {
    if (!hasSelectedEditorial) {
      toast.warning("Selecciona una editorial antes de continuar.");
      return;
    }
    if (resumenVenta.length === 0) {
      toast.warning("Agrega al menos un item antes de continuar.");
      return;
    }
    onNext?.();
  };

  return (
    <Overlay $visible={state}>
      <Modal aria-busy={isBusy} $visible={state}>
        <Header>
          <div>
            <p>Registrar nueva venta</p>
            <h2>Selección de Materiales</h2>
          </div>
            <button type="button" onClick={handleRequestClose} aria-label="Cerrar" disabled={isBusy}>
              <IconCerrar />
            </button>
        </Header>

        <RegistroVentaStepper currentStep={2} />

        <Body>
          <EditorialCard>
            <EditorialHeader>
              <div>
                <span className="eyebrow">Editorial</span>
                <h3>Selecciona la editorial</h3>
                <HelperText>Elige la editorial para habilitar los filtros y materiales.</HelperText>
              </div>
              <EditorialSelectorWrapper>
                <SelectorButton
                  type="button"
                  onClick={toggleEditoriales}
                  $disabled={isBusy || !hasEditoriales}
                >
                  {selectorText}
                </SelectorButton>
                <ListaDesplegable
                  data={dataeditoriales}
                  state={stateEditorialesLista}
                  setState={() => setStateEditorialesLista((prev) => !prev)}
                  funcion={handleEditorialSelection}
                  onClear={hasSelectedEditorial ? clearEditorialSelection : undefined}
                  clearLabel="Limpiar selección"
                  placement="bottom"
                />
              </EditorialSelectorWrapper>
            </EditorialHeader>
          </EditorialCard>

          <PanelsGrid>
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
                  <span>Seleccionar año</span>
                  <SelectorButton
                    type="button"
                    ref={triggerRefs.year}
                    onClick={() => toggleDropdown("year")}
                    $disabled={isBusy}
                  >
                    {selectedYear}
                  </SelectorButton>
                  <ListaDesplegable
                    data={years}
                    state={openDropdown === "year"}
                    setState={() => setOpenDropdown(null)}
                    funcion={handleSelectYear}
                    placement={dropdownPlacement.year}
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
                      <SearchContainer>
                        <InputText icono={<IconLupa/>}>
                          <input
                            type="text"
                            className="form__field"
                            placeholder="Buscar item..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <label className="form__label">Buscar item</label>
                        </InputText>
                      </SearchContainer>

                      {isLoadingMateriales ? (
                        <div className="empty">
                          <Spinner />
                          <small>Cargando items...</small>
                        </div>
                      ) : filteredMateriales.length === 0 ? (
                        <div className="empty">
                          <strong>No hay items disponibles.</strong>
                          <small>Ajusta los filtros o busca otro término.</small>
                        </div>
                      ) : (
                        <ul>
                          {filteredMateriales.map((item) => (
                            <li key={item.id}>
                              <label>
                                <input
                                  type="checkbox"
                                  checked={selectedItems.includes(item.id)}
                                  onChange={() => toggleItem(item.id)}
                                />
                                <div className="info">
                                  <span className="label">{item.label}</span>
                                  <small>{item.descripcion ?? "Sin descripción"}</small>
                                </div>
                              </label>
                            </li>
                          ))}
                        </ul>
                      )}

                      <button className="add-btn" onClick={handleAgregarItems} disabled={isBusy}>
                        <IconAgregar /> Agregar items seleccionados
                      </button>
                    </ItemsDropdown>
                  )}
                </SelectorColumn>
              </SelectorGrid>
            </SelectorsCard>

            <ResumenWrapper>
              <ResumenCard>
                <header>
                  <div>
                    <h3>Resumen de venta</h3>
                    <p>Los montos se actualizan al agregar o quitar items.</p>
                  </div>
                  <div className="badges">
                    <span className="badge">Total items: {resumenVenta.length}</span>
                  </div>
                </header>
                <ResumenHeaderRow>
                  <span>Detalle</span>
                  <span className="center">Cantidad</span>
                  <span className="center">P. unitario</span>
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
                    <span>Descuento</span>
                    <b>S/{totalDescuento.toFixed(2)}</b>
                  </div>
                  <div className="neto">
                    <span>Total neto</span>
                    <strong>S/{totalNeto.toFixed(2)}</strong>
                  </div>
                </Totals>
              </ResumenCard>
            </ResumenWrapper>
          </PanelsGrid>
        </Body>

        <Footer>
            <OutlineButton type="button" onClick={onPrevious} disabled={isBusy}>
              <IconFlechaIzquierda /> Atrás
            </OutlineButton>
            <PrimaryButton type="button" onClick={handleNavigateNext} disabled={isBusy}>
              Siguiente <IconNext />
            </PrimaryButton>
          </Footer>
        {(isClosing || isSavingItems) && (
          <ClosingOverlay>
            <Spinner />
            <strong>Guardando cambios...</strong>
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
`;

const Header = styled(ModalHeader)``;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(14px, 2vw, 20px);
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 6px;

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

const PanelsGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(340px, 0.45fr) minmax(420px, 0.55fr);
  gap: clamp(16px, 2vw, 24px);
  align-items: stretch;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
`;

const EditorialCard = styled.div`
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
  background: ${({ theme }) => theme.posPanelBg};
  border-radius: 18px;
  padding: clamp(14px, 1.5vw, 18px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);

  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 700;
    font-size: 0.75rem;
    color: rgba(${({ theme }) => theme.textRgba}, 0.65);
  }

  h3 {
    margin: 4px 0 0;
  }

  @media (max-width: 720px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const EditorialHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;

  h3 {
    font-size: 1.05rem;
  }
`;

const HelperText = styled.p`
  margin: 6px 0 0;
  color: rgba(${({ theme }) => theme.textRgba}, 0.7);
  font-weight: 500;
`;

const EditorialSelectorWrapper = styled.div`
  position: relative;
  min-width: min(260px, 100%);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SelectorsCard = styled.div`
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
  background: ${({ theme }) => theme.posPanelBg};
  border-radius: 18px;
  padding: clamp(12px, 1.5vw, 18px);
  width: 100%;
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 14px;
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
  height: 100%;
`;

const SelectorButton = styled.button`
  border-radius: 16px;
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.2);
  padding: 12px 18px;
  background: ${({ theme }) => theme.posInputBg};
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
  background: ${({ theme }) => theme.posPanelBg};
  padding: clamp(16px, 1.8vw, 22px);
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  height: 100%;

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
    background: ${({ theme }) => theme.posInputBg};
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

const SearchContainer = styled.div`
  padding: 0 4px 4px;
  .form__group {
    padding-top: 10px;
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
