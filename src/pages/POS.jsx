import { useQuery } from "@tanstack/react-query";
import { POSTemplate, Spinner1, useEditorialesStore, useUsuariosStore, useVentasStore } from "../index";

export function POS() {
    const { datausuarios } = useUsuariosStore();
    const { mostrarventasporusuario } = useVentasStore();
    const { mostrareditorialesporusuario } = useEditorialesStore();

    const {
        isLoading: isLoadingVentas,
        error: errorVentas,
    } = useQuery({
        queryKey: ["mostrar ventas", datausuarios?.id],
        queryFn: () => mostrarventasporusuario({ _id_usuario: datausuarios?.id }),
        enabled: !!datausuarios?.id,
        refetchOnWindowFocus: false,
    });

    const {
        isLoading: isLoadingEditoriales,
        error: errorEditoriales,
    } = useQuery({
        queryKey: ["mostrar editoriales usuario", datausuarios?.id],
        queryFn: () => mostrareditorialesporusuario({ _id_usuario: datausuarios?.id }),
        enabled: !!datausuarios?.id,
        refetchOnWindowFocus: false,
    });

    if (
        isLoadingVentas ||
        isLoadingEditoriales ||
        !datausuarios?.id
    ) {
        return <Spinner1 />;
    }

    if (errorVentas || errorEditoriales) {
        return <span>error...</span>;
    }

    return <POSTemplate datausuarios={datausuarios} />;
}