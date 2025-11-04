import { useQuery } from "@tanstack/react-query";
import {
    SubnivelesTemplate,
    Spinner1,
    useSubnivelesStore,
    useTiposubnivelesStore,
} from "../index";
import { useNivelesStore } from "../store/NivelesStore";

export function Subniveles() {
    const mostrarsubniveles = useSubnivelesStore((state) => state.mostrarsubniveles);
    const { mostrarniveles } = useNivelesStore();
    const { mostrartiposubniveles } = useTiposubnivelesStore();
    const buscarsubniveles = useSubnivelesStore((state) => state.buscarsubniveles);
    const buscador = useSubnivelesStore((state) => state.buscador);
    const trimmedBuscador = buscador?.trim?.() ?? "";

    const shouldSearch = trimmedBuscador.length > 0;

    const {
        isLoading: isLoadingSubniveles,
        error: errorSubniveles,
    } = useQuery({
        queryKey: ["mostrar subniveles"],
        queryFn: () => mostrarsubniveles(),
        enabled: !shouldSearch,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
        placeholderData: (previousData) => previousData,
    });

    const {
        isLoading: isLoadingBuscarSubniveles,
        error: errorBuscarSubniveles,
    } = useQuery({
        queryKey: ["buscar subniveles", trimmedBuscador],
        queryFn: () => buscarsubniveles({ buscador: trimmedBuscador }),
        enabled: shouldSearch,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
        placeholderData: (previousData) => previousData,
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


    if (isLoadingSubniveles || isLoadingBuscarSubniveles || isLoadingNiveles || isLoadingTiposSubniveles) {
        return(<Spinner1 />)
    }

    const queryError = errorSubniveles ?? errorBuscarSubniveles ?? errorNiveles ?? errorTiposSubniveles;
    if (queryError) {
        return <span>Error al cargar las subniveles {queryError.message}</span>;
    }

    return <SubnivelesTemplate />;
}