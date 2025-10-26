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
    const buscarcursos = useTipoContenidosStore((state) => state.buscarcursos);
    const buscador = useCursosStore((state) => state.buscador);
    const trimmedBuscador = buscador?.trim?.() ?? "";

    const { isLoading, error } = useQuery({
        queryKey: ["mostrar cursos", trimmedBuscador],
        queryFn: async () => {
            if (trimmedBuscador) {
                return buscarcursos({ descripcion: trimmedBuscador });
            }

            return mostrarcursos();
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
        queryKey: ["mostrar cursos"],
        queryFn: () => mostrarcursos(),
        refetchOnWindowFocus: false,
    })


    if (isLoading) {
        return(<Spinner1 />)
    }

    if (error) {
        return <span>Error al cargar los cursos</span>;
    }

    return <CursosTemplate />;
}
