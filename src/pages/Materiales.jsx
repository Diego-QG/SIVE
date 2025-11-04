import { useQuery } from "@tanstack/react-query";
import {
    MaterialesTemplate,
    Spinner1,
    useMaterialesStore,
    useEmpresaStore,
} from "../index";
import { useNivelesStore } from "../store/NivelesStore";

export function Materiales() {
    const empresaId = useEmpresaStore((state) => state.dataempresa?.id);
    const mostrarmateriales = useMaterialesStore((state) => state.mostrarmateriales);
    const { mostrarniveles } = useNivelesStore();
    const buscarmateriales = useMaterialesStore((state) => state.buscarmateriales);
    const buscador = useMaterialesStore((state) => state.buscador);
    const trimmedBuscador = buscador?.trim?.() ?? "";

    const { isLoading, error } = useQuery({
        queryKey: ["mostrar materiales", empresaId, trimmedBuscador],
        queryFn: async () => {
            const payload = { _id_empresa: empresaId };
            if (trimmedBuscador) {
                return buscarmateriales({ buscador: trimmedBuscador, ...payload });
            }

            return mostrarmateriales(payload);
        },
        enabled: !!empresaId,
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
        queryKey: ["mostrar materiales", empresaId],
        queryFn: () => mostrarmateriales({ _id_empresa: empresaId }),
        enabled: !!empresaId,
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
