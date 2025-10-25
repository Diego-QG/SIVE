import { useQuery } from "@tanstack/react-query";
import {
  Spinner1,
  SubnivelesTemplate,
  useEmpresaStore,
  useSubnivelesStore,
} from "../index";

export function Subniveles() {
  const empresaId = useEmpresaStore((state) => state.dataempresa?.id);
  const mostrarsubniveles = useSubnivelesStore((state) => state.mostrarsubniveles);
  const buscarsubniveles = useSubnivelesStore((state) => state.buscarsubniveles);
  const mostrarniveles = useSubnivelesStore((state) => state.mostrarniveles);
  const mostrartiposubniveles = useSubnivelesStore(
    (state) => state.mostrartiposubniveles
  );
  const buscador = useSubnivelesStore((state) => state.buscador);
  const trimmedBuscador = buscador?.trim?.() ?? "";

  const {
    isLoading: loadingSubniveles,
    error: errorSubniveles,
  } = useQuery({
    queryKey: ["subniveles", empresaId, trimmedBuscador],
    queryFn: () => {
      const payload = { id_empresa: empresaId };
      if (!trimmedBuscador) {
        return mostrarsubniveles(payload);
      }
      return buscarsubniveles({ ...payload, descripcion: trimmedBuscador });
    },
    enabled: !!empresaId,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });

  const { isLoading: loadingNiveles, error: errorNiveles } = useQuery({
    queryKey: ["niveles", empresaId],
    queryFn: () => mostrarniveles({ id_empresa: empresaId }),
    enabled: !!empresaId,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });

  const { isLoading: loadingTipos, error: errorTipos } = useQuery({
    queryKey: ["tipos subniveles"],
    queryFn: mostrartiposubniveles,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });

  if (loadingSubniveles || loadingNiveles || loadingTipos) {
    return <Spinner1 />;
  }

  if (errorSubniveles) {
    return <span>Error al cargar los subniveles</span>;
  }

  if (errorNiveles) {
    return <span>Error al cargar los niveles</span>;
  }

  if (errorTipos) {
    return <span>Error al cargar los tipos de subnivel</span>;
  }

  return <SubnivelesTemplate />;
}