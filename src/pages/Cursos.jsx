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

    const shouldSearch = trimmedBuscador.length > 0;

    const {
        isLoading: isLoadingCursos,
        error,
    } = useQuery({
        queryKey: ["mostrar cursos"],
        queryFn: () => mostrarcursos(),
        enabled: !shouldSearch,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
        placeholderData: (previousData) => previousData,
    });

    const {
        isLoading: isLoadingBuscarCursos,
        error: errorBuscarCursos,
    } = useQuery({
        queryKey: ["buscar cursos", trimmedBuscador],
        queryFn: () => buscarcursos({ buscador: trimmedBuscador }),
        enabled: shouldSearch,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
        placeholderData: (previousData) => previousData,
    });

    const { isLoading: isLoadingNiveles } = useQuery({
        queryKey: ["mostrar niveles"],
        queryFn: () => mostrarniveles(),
        refetchOnWindowFocus: false,
    });

    if (isLoadingCursos || isLoadingBuscarCursos || isLoadingNiveles) {
        return(<Spinner1 />)
    }

    const queryError = error ?? errorBuscarCursos;
    if (queryError) {
        return <span>Error al cargar los cursos {queryError.message} </span>;
    }

    return <CursosTemplate />;
}