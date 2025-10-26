import { Routes, Route } from "react-router-dom";
import {
  Cursos,
  Editoriales,
  Herramientas,
  Home,
  Login,
  ProtectedRoute,
  Spinner1,
  Subniveles,
  useEmpresaStore,
  UserAuth,
  useUsuariosStore,
  TipoContenidos,
} from "../index";
import { useQuery } from "@tanstack/react-query";

export function MyRoutes() {
  const { user } = UserAuth();
  const { datausuarios, mostrarusuarios } = useUsuariosStore();
  const { mostrarempresa, dataempresa } = useEmpresaStore();
  const usuarioId = Array.isArray(datausuarios)
    ? datausuarios?.[0]?.id
    : datausuarios?.id;
  const { isLoading, error } = useQuery({
    queryKey: ["mostrar usuarios"],
    queryFn: mostrarusuarios,
    refetchOnWindowFocus: false,
  });
  const { data: dtempresa } = useQuery({
    queryKey: ["mostrar empresa", usuarioId],
    queryFn: () => mostrarempresa({ _id_usuario: usuarioId }),
    enabled: !!usuarioId,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <Spinner1 />;
  }
  if (error) {
    return <div>Error al cargar los usuarios</div>;
  }

  return (
    <Routes>
      <Route element={<ProtectedRoute user={user} redirectTo="/login" />}>
        <Route path="/" element={<Home />}></Route>
        <Route path="/herramientas" element={<Herramientas />}></Route>
        <Route
          path="/herramientas/editoriales"
          element={<Editoriales />}
        ></Route>
        <Route
          path="/herramientas/subniveles"
          element={<Subniveles />}
        ></Route>
        <Route
          path="/herramientas/cursos"
          element={<Cursos />}
        ></Route>
        <Route
          path="/herramientas/tipocontenidos"
          element={<TipoContenidos />}
        ></Route>
      </Route>

      <Route path="/login" element={<Login />}></Route>
    </Routes>
  );
}
