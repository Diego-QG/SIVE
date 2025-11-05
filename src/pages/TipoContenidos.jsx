import { useQuery } from "@tanstack/react-query";
import {
    TipoContenidosTemplate,
    Spinner1,
    useTipoContenidosStore,
    useEmpresaStore,
} from "../index";
import { useFamiliaContenidosStore } from "../store/FamiliaContenidosStore";

export function TipoContenidos() {
    const { dataempresa } = useEmpresaStore();
    const { mostrartipocontenidos, buscartipocontenidos, buscador } = useTipoContenidosStore();
    const { mostrarfamiliacontenidos } = useFamiliaContenidosStore();

    const { isLoading, error } = useQuery({
        queryKey: ["mostrar tipocontenidos", dataempresa?.id],
        queryFn: () => mostrartipocontenidos({ _id_empresa: dataempresa?.id }),
        enabled: !!dataempresa,
        refetchOnWindowFocus: false,
    });

    useQuery({
        queryKey: ["buscar tipocontenidos", dataempresa?.id, buscador],
        queryFn: () =>
            buscartipocontenidos({
                buscador,
                _id_empresa: dataempresa?.id,
            }),
        enabled: !!dataempresa,
        refetchOnWindowFocus: false,
    });

    const {
        isLoading: isLoadingFamiliaContenidos,
        error: errorFamiliaContenidos,
    } = useQuery({
        queryKey: ["mostrar familiacontenidos"],
        queryFn: () => mostrarfamiliacontenidos(),
        refetchOnWindowFocus: false,
    });

    if (isLoading || isLoadingFamiliaContenidos) {
        return <Spinner1 />;
    }

    if (error || errorFamiliaContenidos) {
        return <span>error...</span>;
    }

    return <TipoContenidosTemplate />;
}