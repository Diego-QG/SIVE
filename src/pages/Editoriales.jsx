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

    const { isLoading, error } = useQuery({
        queryKey: ["editoriales", empresaId, trimmedBuscador],
        queryFn: () => {
            const payload = { id_empresa: empresaId };

            if (!trimmedBuscador) {
                return mostrareditoriales(payload);
            }

            return buscareditoriales({ ...payload, descripcion: trimmedBuscador });
        },
        enabled: !!empresaId,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
        placeholderData: (previousData) => previousData,
    });

    if (isLoading) {
        return(<Spinner1 />)
    }

    if (error) {
        return <span>Error al cargar las editoriales</span>;
    }

    return <EditorialesTemplate />;
}
