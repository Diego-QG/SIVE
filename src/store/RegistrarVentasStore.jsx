import { create } from "zustand";
import {
  confirmarVenta as confirmarVentaSupabase,
  insertarItemsEnVenta,
  mostrarNiveles,
  obtenerContenidosPorNivel,
  obtenerMaterialesParaVenta,
  obtenerSubnivelesPorNivel,
  obtenerVentaItemsDetalle,
  eliminarVentaItem,
  obtenerVentaBorradorPorId,
} from "../index";

const normalizeNombre = (value, fallback = "") => `${value ?? fallback}`.trim();

const buildContenidoOption = (contenido) => ({
  id: contenido?.id ?? null,
  nombre: normalizeNombre(
    contenido?.cursos?.nombre || contenido?.nombre,
    "Contenido"
  ),
  tipo: contenido?.espaquete ? "paquete" : "curso",
  raw: contenido,
});

const buildPackOption = (pack) => ({
  id: pack?.id ?? null,
  nombre: normalizeNombre(pack?.nombre, "Paquete"),
  tipo: "pack",
  raw: pack,
});

const buildMaterialOption = (material) => {
  const tipoContenido = normalizeNombre(material?.tipocontenidos?.nombre, "Material");
  const anio = material?.anio ? `${material.anio}` : null;
  const mes = normalizeNombre(material?.meses?.nombre, "");
  const parts = [tipoContenido];

  if (anio) parts.push(anio);
  if (mes) parts.push(mes);

  return {
    id: material?.id ?? null,
    nombre: material?.nombre ?? tipoContenido,
    label: parts.join(", "),
    precio: Number(material?.precio ?? 0) || 0,
    id_contenidobase: material?.id_contenidobase ?? null,
    id_pack: material?.id_pack ?? null,
    anio: material?.anio ?? null,
  };
};

const buildResumenItem = (item) => {
  const cantidad = Number(item?.cantidad ?? item?.cantidad_total ?? 1) || 1;
  const precioUnitario =
    Number(item?.precio_unitario ?? item?.precio ?? item?.subtotal ?? 0) || 0;
  const subtotal = Number(item?.subtotal ?? cantidad * precioUnitario) || 0;

  return {
    id: item?.id ?? null,
    nombre:
      item?.material?.nombre ||
      item?.material?.tipocontenidos?.nombre ||
      "Material",
    nivel: normalizeNombre(item?.nivel ?? item?.material?.niveles?.nombre, ""),
    subnivel: normalizeNombre(
      item?.subnivel ?? item?.material?.subniveles?.nombre,
      ""
    ),
    curso: normalizeNombre(item?.curso ?? item?.material?.tipocontenidos?.nombre, ""),
    cantidad,
    precioUnitario,
    precio: subtotal,
    subtotal,
    descuento: Number(item?.descuento ?? 0) || 0,
  };
};

export const useRegistrarVentasStore = create((set, get) => ({
  niveles: [],
  subniveles: [],
  contenidos: [],
  materiales: [],
  resumenVenta: [],
  totalResumen: 0,
  selectedNivel: null,
  selectedSubnivel: null,
  selectedContenido: null,
  selectedItems: [],
  isLoadingNiveles: false,
  isLoadingSubniveles: false,
  isLoadingContenidos: false,
  isLoadingMateriales: false,
  isLoadingResumen: false,
  isSavingItems: false,
  isConfirming: false,

  limpiarSeleccion: () =>
    set({
      selectedNivel: null,
      selectedSubnivel: null,
      selectedContenido: null,
      selectedItems: [],
      materiales: [],
      contenidos: [],
      subniveles: [],
    }),

  cargarNiveles: async () => {
    set({ isLoadingNiveles: true });
    const data = await mostrarNiveles();
    const niveles = (data ?? []).map((nivel) => ({
      ...nivel,
      nombre: normalizeNombre(nivel?.nombre, nivel?.nombre_nivel),
    }));
    set({ niveles, isLoadingNiveles: false });
    return niveles;
  },

  seleccionarNivel: (nivel) => {
    set({
      selectedNivel: nivel,
      selectedSubnivel: null,
      selectedContenido: null,
      selectedItems: [],
      contenidos: [],
      materiales: [],
    });
  },

  cargarSubniveles: async (idNivel) => {
    set({ isLoadingSubniveles: true });
    const data = await obtenerSubnivelesPorNivel({ idNivel });
    const subniveles = (data ?? []).map((subnivel) => ({
      ...subnivel,
      nombre: normalizeNombre(subnivel?.nombre, subnivel?.nombre_subnivel),
    }));
    set({ subniveles, isLoadingSubniveles: false });
    return subniveles;
  },

  seleccionarSubnivel: (subnivel) => {
    set({
      selectedSubnivel: subnivel,
      selectedContenido: null,
      selectedItems: [],
      contenidos: [],
      materiales: [],
    });
  },

  cargarContenidos: async ({ idNivel, idSubnivel, editorialId }) => {
    set({ isLoadingContenidos: true });
    const { contenidos, packs } = await obtenerContenidosPorNivel({
      idNivel,
      idSubnivel,
      editorialId,
    });

    const opcionesContenido = (contenidos ?? []).map(buildContenidoOption);
    const opcionesPack = (packs ?? []).map(buildPackOption);

    set({
      contenidos: [...opcionesPack, ...opcionesContenido],
      isLoadingContenidos: false,
    });
    return opcionesContenido;
  },

  seleccionarContenido: (contenido) => {
    set({ selectedContenido: contenido, selectedItems: [], materiales: [] });
  },

  cargarMateriales: async ({ editorialId }) => {
    const { selectedNivel, selectedSubnivel, selectedContenido } = get();
    if (!editorialId || !selectedNivel || !selectedSubnivel || !selectedContenido) {
      return [];
    }

    set({ isLoadingMateriales: true });
    const materialesData = await obtenerMaterialesParaVenta({
      editorialId,
      nivelId: selectedNivel?.id,
      subnivelId: selectedSubnivel?.id,
      contenidoSeleccionado: selectedContenido,
    });

    const materiales = (materialesData ?? []).map(buildMaterialOption);
    set({ materiales, isLoadingMateriales: false });
    return materiales;
  },

  toggleItem: (id) => {
    set((state) => {
      const current = new Set(state.selectedItems);
      if (current.has(id)) {
        current.delete(id);
      } else {
        current.add(id);
      }
      return { selectedItems: Array.from(current) };
    });
  },

  cargarResumenVenta: async (idVenta) => {
    if (!idVenta) return [];
    set({ isLoadingResumen: true });
    const data = await obtenerVentaItemsDetalle({ idVenta });
    const resumenVenta = (data ?? []).map(buildResumenItem);

    // Fetch sale totals from DB
    const ventadata = await obtenerVentaBorradorPorId({ _id_venta: idVenta });
    const totalResumen = Number(ventadata?.total_neto ?? 0);

    set({ resumenVenta, totalResumen, isLoadingResumen: false });
    return resumenVenta;
  },

  agregarItemsAVenta: async ({ idVenta }) => {
    const { selectedItems, materiales } = get();
    if (!idVenta || !selectedItems.length) return false;

    set({ isSavingItems: true });
    const materialesMap = new Map(materiales.map((item) => [item.id, item]));
    const payload = selectedItems
      .map((id) => materialesMap.get(id))
      .filter(Boolean)
      .map((material) => ({
        id_material_editorial: material.id,
        cantidad: 1,
        precio_unitario: material.precio,
      }));

    const inserted = await insertarItemsEnVenta({ idVenta, items: payload });
    if (inserted) {
      await get().cargarResumenVenta(idVenta);
      get().limpiarSeleccion();
    }

    set({ isSavingItems: false });
    return inserted;
  },

  eliminarItemDeVenta: async ({ idVenta, idItem }) => {
    if (!idItem) return false;
    set({ isLoadingResumen: true });
    const deleted = await eliminarVentaItem({ id: idItem });
    if (deleted && idVenta) {
      await get().cargarResumenVenta(idVenta);
    } else {
      set({ isLoadingResumen: false });
    }

    return deleted;
  },

  confirmarVenta: async ({ idVenta }) => {
    if (!idVenta) return false;
    set({ isConfirming: true });
    const confirmado = await confirmarVentaSupabase({ idVenta });
    set({ isConfirming: false });
    return confirmado;
  },
}));