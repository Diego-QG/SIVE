import { useQuery } from "@tanstack/react-query";
import {
    EditorialesTemplate,
    Spinner1,
    useEditorialesStore,
    useEmpresaStore,
} from "../index";

export function Editoriales() {
    const empresaId = useEmpresaStore((state) => state.dataempresa?.id);
    const mostrareditoriales = useEditorialesStore((state) => state.mostrareditoriales);
    const buscareditoriales = useEditorialesStore((state) => state.buscareditoriales);
    const buscador = useEditorialesStore((state) => state.buscador);
    const trimmedBuscador = buscador?.trim?.() ?? "";

    const shouldSearch = trimmedBuscador.length > 0;

    const {
        isLoading: isLoadingEditoriales,
        error,
    } = useQuery({
        queryKey: ["editoriales", empresaId],
        queryFn: () => mostrareditoriales({ id_empresa: empresaId }),
        enabled: !!empresaId && !shouldSearch,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
        placeholderData: (previousData) => previousData,
    });

    const {
        isLoading: isLoadingBuscarEditoriales,
        error: errorBuscarEditoriales,
    } = useQuery({
        queryKey: ["buscar editoriales", empresaId, trimmedBuscador],
        queryFn: () =>
            buscareditoriales({
                id_empresa: empresaId,
                buscador: trimmedBuscador,
            }),
        enabled: !!empresaId && shouldSearch,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
        placeholderData: (previousData) => previousData,
    });

    if (isLoadingEditoriales || isLoadingBuscarEditoriales) {
        return(<Spinner1 />)
    }

    const queryError = error ?? errorBuscarEditoriales;
    if (queryError) {
        return <span>Error al cargar las editoriales {queryError.message}</span>;
    }

    return <EditorialesTemplate />;
}