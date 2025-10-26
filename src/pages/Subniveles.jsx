import { useQuery } from "@tanstack/react-query";
import {
    SubnivelesTemplate,
    Spinner1,
    useSubnivelesStore,
} from "../index";

export function Subniveles() {
    const mostrarsubniveles = useSubnivelesStore((state) => state.mostrarsubniveles);
    const buscarsubniveles = useSubnivelesStore((state) => state.buscarsubniveles);
    const buscador = useSubnivelesStore((state) => state.buscador);
    const trimmedBuscador = buscador?.trim?.() ?? "";

    const { isLoading, error } = useQuery({
        queryKey: ["subniveles", trimmedBuscador],
        refetchOnWindowFocus: false,
        staleTime: 60_000,
        placeholderData: (previousData) => previousData,
    });

    if (isLoading) {
        return(<Spinner1 />)
    }

    if (error) {
        return <span>Error al cargar las subniveles</span>;
    }

    return <SubnivelesTemplate />;
}
