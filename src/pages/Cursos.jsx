import { useQuery } from "@tanstack/react-query";
import { CursosTemplate, Spinner1, useCursosStore } from "../index";
import { useNivelesStore } from "../store/NivelesStore";

export function Cursos() {
    const { mostrarcursos, buscarcursos, buscador } = useCursosStore();
    const { mostrarniveles } = useNivelesStore();

    const { isLoading, error } = useQuery({
        queryKey: ["mostrar cursos"],
        queryFn: () => mostrarcursos(),
        refetchOnWindowFocus: false,
    });

    useQuery({
        queryKey: ["buscar cursos", buscador],
        queryFn: () => buscarcursos({ buscador }),
        refetchOnWindowFocus: false,
    });

    const {
        isLoading: isLoadingNiveles,
        error: errorNiveles,
    } = useQuery({
        queryKey: ["mostrar niveles"],
        queryFn: () => mostrarniveles(),
        refetchOnWindowFocus: false,
    });

    if (isLoading || isLoadingNiveles) {
        return <Spinner1 />;
    }

    if (error || errorNiveles) {
        return <span>error...</span>;
    }

    return <CursosTemplate />;
}