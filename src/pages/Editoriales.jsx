import { useQuery } from "@tanstack/react-query";
import {
    EditorialesTemplate,
    Spinner1,
    useEditorialesStore,
    useEmpresaStore,
} from "../index";

export function Editoriales() {
    const { mostrareditoriales, buscareditoriales, buscador } = useEditorialesStore();
    const { dataempresa } = useEmpresaStore();
    const { isLoading, error } = useQuery({
        queryKey: ["mostrar editoriales", dataempresa?.id],
        queryFn: () => mostrareditoriales({ id_empresa: dataempresa?.id }),
        enabled: !!dataempresa,
        refetchOnWindowFocus: false,
    });

    const {} = useQuery({
        queryKey: ["buscar editoriales", buscador],
        queryFn: () => buscareditoriales({ id_empresa: dataempresa?.id, descripcion:buscador }),
        enabled: !!dataempresa,
        refetchOnWindowFocus: false,
    });

    if (isLoading) {
        return(<Spinner1 />)
    }

    if (error) {
        return <span>Error al cargar las editoriales</span>;
    }

    return <EditorialesTemplate />;
}
