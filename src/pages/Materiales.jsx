import { useQuery } from "@tanstack/react-query";
import {
  MaterialesTemplate,
  Spinner1,
  useEmpresaStore,
  useMaterialesStore,
} from "../index";

export function Materiales() {
  const { dataempresa } = useEmpresaStore();
  const { mostrarmateriales, buscarmateriales, buscador } = useMaterialesStore();

  const { isLoading, error } = useQuery({
    queryKey: ["mostrar materiales", dataempresa?.id],
    queryFn: () => mostrarmateriales({ _id_empresa: dataempresa?.id }),
    enabled: !!dataempresa,
    refetchOnWindowFocus: false,
  });

  useQuery({
    queryKey: ["buscar materiales", dataempresa?.id, buscador],
    queryFn: () =>
      buscarmateriales({ buscador, _id_empresa: dataempresa?.id }),
    enabled: !!dataempresa,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <Spinner1 />;
  }

  if (error) {
    return <span>error...</span>;
  }

  return <MaterialesTemplate />;
}