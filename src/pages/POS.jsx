import { useQuery } from "@tanstack/react-query";
import { POSTemplate, Spinner1, useUsuariosStore, useVentasStore } from "../index";

export function POS() {
    const { datausuarios } = useUsuariosStore();
    const { mostrarVentas } = useVentasStore();

    const { isLoading, error } = useQuery({
        queryKey: ["mostrar ventas", datausuarios?.id],
        queryFn: () => mostrarVentas({ _id_asesor: datausuarios?.id }),
        enabled: !!datausuarios?.id,
        refetchOnWindowFocus: false,
    });

    if (isLoading || !datausuarios?.id) {
        return <Spinner1 />;
    }

    if (error) {
        return <span>error...</span>;
    }

    return <POSTemplate />;
}