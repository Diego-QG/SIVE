import { useQuery } from "@tanstack/react-query";
import {
    MaterialesTemplate,
    Spinner1,
    useMaterialesStore,
} from "../index";
import { useNivelesStore } from "../store/NivelesStore";

export function Materiales() {
    const mostrarmateriales = useMaterialesStore((state) => state.mostrarmateriales);
    const { mostrarniveles } = useNivelesStore();
    const buscarmateriales = useMaterialesStore((state) => state.buscarmateriales);
    const buscador = useMaterialesStore((state) => state.buscador);
    const trimmedBuscador = buscador?.trim?.() ?? "";

    const { isLoading, error } = useQuery({
        queryKey: ["mostrar materiales", trimmedBuscador],
        queryFn: async () => {
            if (trimmedBuscador) {
                return buscarmateriales({ buscar: trimmedBuscador });
            }

            return mostrarmateriales();
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
        queryKey: ["mostrar materiales"],
        queryFn: () => mostrarmateriales(),
        refetchOnWindowFocus: false,
    })


    if (isLoading) {
        return(<Spinner1 />)
    }

    if (error) {
        return <span>Error al cargar los materiales {error.message} </span>;
    }

    return <MaterialesTemplate />;
}
