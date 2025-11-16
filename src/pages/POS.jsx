import { useQuery } from "@tanstack/react-query";
import { POSTemplate, Spinner1, useEditorialesStore, useUsuariosStore, useVentasStore } from "../index";

export function POS() {
    const { datausuarios } = useUsuariosStore();
    const { mostrarVentas } = useVentasStore();
    const { mostrareditorialesporasesor } = useEditorialesStore();

    const {
        isLoading: isLoadingVentas,
        error: errorVentas,
    } = useQuery({
        queryKey: ["mostrar ventas", datausuarios?.id],
        queryFn: () => mostrarVentas({ _id_asesor: datausuarios?.id }),
        enabled: !!datausuarios?.id,
        refetchOnWindowFocus: false,
    });

    const {
        isLoading: isLoadingEditoriales,
        error: errorEditoriales,
    } = useQuery({
        queryKey: ["mostrar editoriales asesor", datausuarios?.id],
        queryFn: () => mostrareditorialesporasesor({ _id_asesor: datausuarios?.id }),
        enabled: !!datausuarios?.id,
        refetchOnWindowFocus: false,
    });

    if (isLoadingVentas || isLoadingEditoriales || !datausuarios?.id) {
        return <Spinner1 />;
    }

    if (errorVentas || errorEditoriales) {
        return <span>error...</span>;
    }

    return <POSTemplate />;
}