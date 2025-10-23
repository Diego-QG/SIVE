import styled from "styled-components";
 import {HerramientasTemplate, Spinner1, useModulosStore} from "../index"
import { useQuery } from "@tanstack/react-query";

export function Herramientas() {

    const {mostrarModulos} = useModulosStore();
    const {isLoading, error} = useQuery({queryKey: ["mostrar modulos"], queryFn: mostrarModulos})
    if(isLoading){
        return(<Spinner1/>)
    }
    if(error){
        return(<span>Error al cargar los módulos</span>)
    }

    return(
        <HerramientasTemplate/>
    );
}
