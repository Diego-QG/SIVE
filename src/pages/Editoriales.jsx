import { useQuery } from "@tanstack/react-query";
import {
    EditorialesTemplate,
    Spinner1,
    useEditorialesStore,
    useEmpresaStore,
} from "../index";

export function Editoriales() {
    const { dataempresa } = useEmpresaStore();
    const { mostrareditoriales, buscareditoriales, buscador } = useEditorialesStore();

    const { isLoading, error } = useQuery({
        queryKey: ["editoriales", dataempresa?.id],
        queryFn: () => mostrareditoriales({ id_empresa: dataempresa?.id }),
        enabled: !!dataempresa,
        refetchOnWindowFocus: false,
    });

    useQuery({
        queryKey: ["buscar editoriales", dataempresa?.id, buscador],
        queryFn: () =>
            buscareditoriales({
                id_empresa: dataempresa?.id,
                buscador,
            }),
        enabled: !!dataempresa,
        refetchOnWindowFocus: false,
    });

    if (isLoading) {
        return <Spinner1 />;
    }

    if (error) {
        return <span>error...</span>;
    }

    return <EditorialesTemplate />;
}