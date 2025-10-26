import { useQuery } from "@tanstack/react-query";
import {
    TipoContenidosTemplate,
    Spinner1,
    useTipoContenidosStore,
} from "../index";
import { useNivelesStore } from "../store/NivelesStore";

export function TipoContenidos() {
    const mostrartipocontenidos = useTipoContenidosStore((state) => state.mostrartipocontenidos);
    const { mostrarniveles } = useNivelesStore();
    const buscartipocontenidos = useTipoContenidosStore((state) => state.buscartipocontenidos);
    const buscador = useTipoContenidosStore((state) => state.buscador);
    const trimmedBuscador = buscador?.trim?.() ?? "";

    const { isLoading, error } = useQuery({
        queryKey: ["mostrar tipocontenidos", trimmedBuscador],
        queryFn: async () => {
            if (trimmedBuscador) {
                return buscartipocontenidos({ descripcion: trimmedBuscador });
            }

            return mostrartipocontenidos();
        },
        refetchOnWindowFocus: false,
        staleTime: 60_000,
        placeholderData: (previousData) => previousData,
    });

    useQuery({
        queryKey: ["mostrar niveles"],
        queryFn: () => mostrarniveles(),
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
