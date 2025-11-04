import { useQuery } from "@tanstack/react-query";
import {
    MaterialesTemplate,
    Spinner1,
    useMaterialesStore,
    useEmpresaStore,
} from "../index";
import { useNivelesStore } from "../store/NivelesStore";

export function Materiales() {
    const empresaId = useEmpresaStore((state) => state.dataempresa?.id);
    const mostrarmateriales = useMaterialesStore((state) => state.mostrarmateriales);
    const buscarmateriales = useMaterialesStore((state) => state.buscarmateriales);
    const buscador = useMaterialesStore((state) => state.buscador);
    const { mostrarniveles } = useNivelesStore();

    const trimmedBuscador = buscador?.trim?.() ?? "";
    const shouldSearch = trimmedBuscador.length > 0;

    const {
        isLoading: isLoadingMateriales,
        error: errorMateriales,
    } = useQuery({
        queryKey: ["mostrar materiales", empresaId],
        queryFn: () => mostrarmateriales({ _id_empresa: empresaId }),
        enabled: !!empresaId && !shouldSearch,
        refetchOnWindowFocus: false,
        placeholderData: (previousData) => previousData,
    });

    const {
        isLoading: isLoadingBuscarMateriales,
        error: errorBuscarMateriales,
    } = useQuery({
        queryKey: ["buscar materiales", empresaId, trimmedBuscador],
        queryFn: () =>
            buscarmateriales({
                buscador: trimmedBuscador,
                _id_empresa: empresaId,
            }),
        enabled: !!empresaId && shouldSearch,
        refetchOnWindowFocus: false,
        placeholderData: (previousData) => previousData,
    });

    const { isLoading: isLoadingNiveles } = useQuery({
        queryKey: ["mostrar niveles", empresaId],
        queryFn: () => mostrarniveles(),
        enabled: !!empresaId,
        refetchOnWindowFocus: false,
    });

    const isLoading = isLoadingMateriales || isLoadingBuscarMateriales || isLoadingNiveles;
    const error = errorMateriales ?? errorBuscarMateriales;

    if (isLoading) {
        return <Spinner1 />;
    }

    if (error) {
        return <span>Error al cargar los materiales {error.message} </span>;
    }

    return <MaterialesTemplate />;
}