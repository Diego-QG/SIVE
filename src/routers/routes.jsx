import { Routes, Route } from "react-router-dom";
import {
  Editoriales,
  Herramientas,
  Home,
  Login,
  ProtectedRoute,
  Spinner1,
  useEmpresaStore,
  UserAuth,
  useUsuariosStore,
} from "../index";
import { useQuery } from "@tanstack/react-query";

export function MyRoutes() {
  const { user } = UserAuth();
  const { datausuarios, mostrarusuarios } = useUsuariosStore();
  const { mostrarempresa, dataempresa } = useEmpresaStore();
  const { isLoading, error } = useQuery({
    queryKey: ["mostrar usuarios"],
    queryFn: mostrarusuarios,
    refetchOnWindowFocus: false,
  });
  const { data: dtempresa } = useQuery({
    queryKey: ["mostrar empresa", datausuarios?.id],
    queryFn: () => mostrarempresa({ _id_usuario: datausuarios?.id }),
    enabled: !!datausuarios,
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
      </Route>

      <Route path="/login" element={<Login />}></Route>
    </Routes>
  );
}
