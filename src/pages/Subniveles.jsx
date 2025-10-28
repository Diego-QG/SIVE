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

    const { isLoading, error } = useQuery({
        queryKey: ["mostrar subniveles", trimmedBuscador],
        queryFn: async () => {
            if (trimmedBuscador) {
                return buscarsubniveles({ buscar: trimmedBuscador });
            }

            return mostrarsubniveles();
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
        queryKey: ["mostrar tipos de subniveles"],
        queryFn: () => mostrartiposubniveles(),
        refetchOnWindowFocus: false,
    })


    if (isLoading) {
        return(<Spinner1 />)
    }

    if (error) {
        return <span>Error al cargar las subniveles</span>;
    }

    return <SubnivelesTemplate />;
}
