import { Routes, Route } from "react-router-dom";
import {
  Cursos,
  Editoriales,
  Herramientas,
  Home,
  Login,
  ProtectedRoute,
  Subniveles,
  TipoContenidos,
  Materiales,
  POS,
  Layout,
  Supervision,
  PageNot,
} from "../index";

export function MyRoutes() {

  return (
    <Routes>

      <Route
        path="/login"
        element={
          <ProtectedRoute accessBy="non-authenticated">
            <Login />
          </ProtectedRoute>
        }
      ></Route>

      <Route
        path="/"
        element={
          <ProtectedRoute accessBy="authenticated">
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>} 
        />

        <Route
        path="/pos"
        element={
          <ProtectedRoute accessBy="authenticated">
            <Layout>
              <POS />
            </Layout>
          </ProtectedRoute>} 
        />

        <Route
        path="/herramientas"
        element={
          <ProtectedRoute accessBy="authenticated">
            <Layout>
              <Herramientas />
            </Layout>
          </ProtectedRoute>} 
        />

        <Route
        path="/herramientas/editoriales"
        element={
          <ProtectedRoute accessBy="authenticated">
            <Layout>
              <Editoriales />
            </Layout>
          </ProtectedRoute>} 
        />

        <Route
        path="/herramientas/subniveles"
        element={
          <ProtectedRoute accessBy="authenticated">
            <Layout>
              <Subniveles />
            </Layout>
          </ProtectedRoute>} 
        />

        <Route
        path="/herramientas/cursos"
        element={
          <ProtectedRoute accessBy="authenticated">
            <Layout>
              <Cursos />
            </Layout>
          </ProtectedRoute>} 
        />

        <Route
        path="/herramientas/tipocontenidos"
        element={
          <ProtectedRoute accessBy="authenticated">
            <Layout>
              <TipoContenidos />
            </Layout>
          </ProtectedRoute>} 
        />

        <Route
        path="/herramientas/materiales"
        element={
          <ProtectedRoute accessBy="authenticated">
            <Layout>
              <Materiales />
            </Layout>
          </ProtectedRoute>} 
        />

        <Route
        path="/herramientas/supervision"
        element={
          <ProtectedRoute accessBy="authenticated">
            <Layout>
              <Supervision />
            </Layout>
          </ProtectedRoute>} 
        />





        <Route
        path="*"
        element={
          <ProtectedRoute accessBy="authenticated">
            <Layout>
              <PageNot />
            </Layout>
          </ProtectedRoute>} 
        />
      
    </Routes>
  );
}
