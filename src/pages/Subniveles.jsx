import { useQuery } from "@tanstack/react-query";
import {
    SubnivelesTemplate,
    Spinner1,
    useSubnivelesStore,
    useTiposubnivelesStore,
} from "../index";
import { useNivelesStore } from "../store/NivelesStore";

export function Subniveles() {
    const { mostrarsubniveles, buscarsubniveles, buscador } = useSubnivelesStore();
    const { mostrarniveles } = useNivelesStore();
    const { mostrartiposubniveles } = useTiposubnivelesStore();

    const { isLoading, error } = useQuery({
        queryKey: ["mostrar subniveles"],
        queryFn: () => mostrarsubniveles(),
        refetchOnWindowFocus: false,
    });

    useQuery({
        queryKey: ["buscar subniveles", buscador],
        queryFn: () => buscarsubniveles({ buscador }),
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

    const {
        isLoading: isLoadingTiposSubniveles,
        error: errorTiposSubniveles,
    } = useQuery({
        queryKey: ["mostrar tipos de subniveles"],
        queryFn: () => mostrartiposubniveles(),
        refetchOnWindowFocus: false,
    });

    if (isLoading || isLoadingNiveles || isLoadingTiposSubniveles) {
        return <Spinner1 />;
    }

    if (error || errorNiveles || errorTiposSubniveles) {
        return <span>error...</span>;
    }

    return <SubnivelesTemplate />;
}