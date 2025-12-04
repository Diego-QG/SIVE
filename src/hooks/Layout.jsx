import styled from "styled-components";
import { useState } from "react";
import {
  MenuMovil,
  Sidebar,
  Spinner1,
  SwitchHamburguesa,
  useEmpresaStore,
  useUsuariosStore,
} from "../index";
import { Device } from "../styles/breakpoints";
import { useQuery } from "@tanstack/react-query";

export function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stateMenu, setStateMenu] = useState(false);

  const { datausuarios, mostrarusuarios } = useUsuariosStore();
  const { mostrarempresa } = useEmpresaStore();
  const { isLoading, error } = useQuery({
    queryKey: ["mostrar usuarios"],
    queryFn: mostrarusuarios,
    refetchOnWindowFocus: false,
  });
  useQuery({
    queryKey: ["mostrar empresa", datausuarios?.id],
    queryFn: () => mostrarempresa({ _id_usuario: datausuarios?.id }),
    enabled: !!datausuarios?.id,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <Spinner1 />;
  }
  if (error) {
    return <div>Error al cargar los usuarios</div>;
  }

  return (
    <Container className={sidebarOpen ? "active" : ""}>
      <section className="contentSidebar">
        <Sidebar
          state={sidebarOpen}
          setState={() => setSidebarOpen(!sidebarOpen)}
        />
      </section>

      <section className="contentMenuamburger">
        <SwitchHamburguesa
          state={stateMenu}
          setstate={() => setStateMenu(!stateMenu)}
        />
        {stateMenu ? <MenuMovil setState={() => setStateMenu(false)} /> : null}
      </section>

      <ContainerBody>{children}</ContainerBody>
    </Container>
  );
}

const Container = styled.main`
  display: grid;
  grid-template-columns: 1fr;
  transition: 0.1s ease-in-out;
  color: ${({ theme }) => theme.text};

  .contentSidebar {
    display: none;
    background-color: rgba(78, 45, 78, 0.5);
  }
  .contentMenuamburger {
    position: absolute;
    /* background-color: rgba(13, 241, 215, 0.5); */
  }

  @media ${Device.tablet} {
    grid-template-columns: 88px 1fr;
    &.active {
      grid-template-columns: 260px 1fr;
    }
    .contentSidebar {
      display: initial;
    }
    .contentMenuamburger {
      display: none;
    }
  }
`;
const ContainerBody = styled.section`
  /* background-color: rgba(231, 13, 136, 0.5); */
  grid-column: 1;
  width: 100%;
  @media ${Device.tablet} {
    grid-column: 2;
  }
`;
