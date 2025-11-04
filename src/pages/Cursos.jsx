import { useQuery } from "@tanstack/react-query";
import {
    CursosTemplate,
    Spinner1,
    useCursosStore,
} from "../index";
import { useNivelesStore } from "../store/NivelesStore";

export function Cursos() {
    const mostrarcursos = useCursosStore((state) => state.mostrarcursos);
    const { mostrarniveles } = useNivelesStore();
    const buscarcursos = useCursosStore((state) => state.buscarcursos);
    const buscador = useCursosStore((state) => state.buscador);
    const trimmedBuscador = buscador?.trim?.() ?? "";

    const { isLoading, error } = useQuery({
        queryKey: ["mostrar cursos", trimmedBuscador],
        queryFn: async () => {
            if (trimmedBuscador) {
                return buscarcursos({ buscador: trimmedBuscador });
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
        return <span>Error al cargar los cursos {error.message} </span>;
    }

    return <CursosTemplate />;
}
