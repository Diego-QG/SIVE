import { useQuery } from "@tanstack/react-query";
import {
    TipoContenidosTemplate,
    Spinner1,
    useTipoContenidosStore,
    useEmpresaStore,
} from "../index";
import { useFamiliaContenidosStore } from "../store/FamiliaContenidosStore";

export function TipoContenidos() {
    const empresaId = useEmpresaStore((state) => state.dataempresa?.id);
    const mostrartipocontenidos = useTipoContenidosStore((state) => state.mostrartipocontenidos);
    const { mostrarfamiliacontenidos } = useFamiliaContenidosStore();
    const buscartipocontenidos = useTipoContenidosStore((state) => state.buscartipocontenidos);
    const buscador = useTipoContenidosStore((state) => state.buscador);
    const trimmedBuscador = buscador?.trim?.() ?? "";

    const shouldSearch = trimmedBuscador.length > 0;

    const {
        isLoading: isLoadingTipoContenidos,
        error,
    } = useQuery({
        queryKey: ["mostrar tipocontenidos", empresaId],
        queryFn: () => mostrartipocontenidos({ _id_empresa: empresaId }),
        enabled: !!empresaId && !shouldSearch,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
        placeholderData: (previousData) => previousData,
    });

    const {
        isLoading: isLoadingBuscarTipoContenidos,
        error: errorBuscarTipoContenidos,
    } = useQuery({
        queryKey: ["buscar tipocontenidos", empresaId, trimmedBuscador],
        queryFn: () =>
            buscartipocontenidos({
                buscador: trimmedBuscador,
                _id_empresa: empresaId,
            }),
        enabled: !!empresaId && shouldSearch,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
        placeholderData: (previousData) => previousData,
    });

    const {
        isLoading: isLoadingFamiliaContenidos,
        error: errorFamiliaContenidos,
    } = useQuery({
        queryKey: ["mostrar familiacontenidos"],
        queryFn: () => mostrarfamiliacontenidos(),
        refetchOnWindowFocus: false,
    });

    if (isLoadingTipoContenidos || isLoadingBuscarTipoContenidos || isLoadingFamiliaContenidos) {
        return(<Spinner1 />)
    }

    const queryError = error ?? errorBuscarTipoContenidos ?? errorFamiliaContenidos;
    if (queryError) {
        return <span>Error al cargar los tipocontenidos {queryError.message}</span>;
    }

    return <TipoContenidosTemplate />;
}