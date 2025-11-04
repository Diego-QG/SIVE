import { useQuery } from "@tanstack/react-query";
import {
  MaterialesTemplate,
  Spinner1,
  useEmpresaStore,
  useMaterialesStore,
} from "../index";

export function Materiales() {
  const empresaId = useEmpresaStore((state) => state.dataempresa?.id);
  const { mostrarmateriales, buscarmateriales, buscador } = useMaterialesStore();

  const trimmedBuscador = buscador?.trim?.() ?? "";
  const shouldSearch = trimmedBuscador.length > 0;

  const {
    isLoading: isLoadingMateriales,
    error: errorMateriales,
  } = useQuery({
    queryKey: ["mostrar materiales", empresaId],
    queryFn: () => mostrarmateriales({ _id_empresa: empresaId }),
    enabled: !!empresaId && !shouldSearch,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

  const {
    isLoading: isLoadingBuscarMateriales,
    error: errorBuscarMateriales,
  } = useQuery({
    queryKey: ["buscar materiales", empresaId, trimmedBuscador],
    queryFn: () =>
      buscarmateriales({ buscador: trimmedBuscador, _id_empresa: empresaId }),
    enabled: !!empresaId && shouldSearch,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

  const isLoading = isLoadingMateriales || isLoadingBuscarMateriales;
  const error = errorMateriales ?? errorBuscarMateriales;

  if (isLoading) {
    return <Spinner1 />;
  }

  if (error) {
    return <span>Error al cargar los materiales {error.message}</span>;
  }

  return <MaterialesTemplate />;
}