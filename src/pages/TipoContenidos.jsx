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

    const { isLoading, error } = useQuery({
        queryKey: ["mostrar tipocontenidos", empresaId, trimmedBuscador],
        queryFn: async () => {
            const payload = { id_empresa: empresaId };
            if (trimmedBuscador) {
                return buscartipocontenidos({ descripcion: trimmedBuscador });
            }

            return mostrartipocontenidos();
        },
        enabled: !!empresaId,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
        placeholderData: (previousData) => previousData,
    });

    useQuery({
        queryKey: ["mostrar familiacontenidos"],
        queryFn: () => mostrarfamiliacontenidos(),
        refetchOnWindowFocus: false,
    })

    useQuery({
        queryKey: ["mostrar tipocontenidos"],
        queryFn: () => mostrartipocontenidos(),
        refetchOnWindowFocus: false,
    })


    if (isLoading) {
        return(<Spinner1 />)
    }

    if (error) {
        return <span>Error al cargar los tipocontenidos</span>;
    }

    return <TipoContenidosTemplate />;
}
