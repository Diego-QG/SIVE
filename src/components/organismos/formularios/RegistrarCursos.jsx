import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import {
  InputText,
  Btn1,
  useCursosStore,
  ContainerSelector,
  Selector,
  ListaDesplegable,
  useNivelesStore,
} from "../../../index";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function RegistrarCursos({
  onClose,
  dataSelect,
  accion,
  setIsExploding,
  state,
}) {
  if (!state) return;
  const { insertarcurso, editarcurso } = useCursosStore();
  const { dataniveles, nivelesitemselect, selectnivel } = useNivelesStore();
  const [stateNivelesLista, setStateNivelesLista] = useState(false);
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const queryClient = useQueryClient();
  const { isPending, mutate: doInsertar } = useMutation({
    mutationFn: insertar,
    mutationKey: ["insertar cursos"],
    onError: (err) => console.log("El error", err.message),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["mostrar cursos"] });
      cerrarFormulario();
    },
  });
  const handlesub = (data) => {
    console.log("[ED1-FORM] submit subniveles:", { data });
    doInsertar(data);
  };
  const cerrarFormulario = () => {
    onClose?.();
    if (typeof setIsExploding === "function") setIsExploding(true);
  };
  async function insertar(data) {
    const selectedNivelId = nivelesitemselect?.id ?? dataSelect?.id_nivel;

    if (!selectedNivelId) {
      throw new Error("Seleccionar");
    }

    if (accion === "Editar") {
      const p = {
        _nombre: data.nombre,
        _id: dataSelect.id,
        _id_nivel: selectedNivelId,
      };
      await editarcurso(p);
    } else {
      const p = {
        _id_nivel: selectedNivelId,
        _nombre: data.nombre,
      };
      await insertarcurso(p);
    }
  }
  useEffect(() => {
    if (!state) {
      return;
    }

    if (accion === "Editar") {
      const nivelId =
        dataSelect?.id_nivel ??
        null;

      const nivelNombre =
        dataSelect?.nombre_nivel ??
        "";

      const existingNivel =
        dataniveles?.find((item) =>
          nivelId != null ? item?.id === nivelId : false
        ) ??
        (nivelNombre
          ? {
              id: nivelId,
              nombre: nivelNombre,
              nombre_nivel: nivelNombre,
            }
          : null);

      if (existingNivel) {
        selectnivel(existingNivel);
        return;
      }

      if (!dataniveles || dataniveles.length === 0) {
        return;
      }
    }

    selectnivel(null);
  }, [accion, dataSelect, selectnivel, state]);
  if (!state) {
    return null;
  }
  return (
    <Container>
      {isPending ? (
        <span>...🔼</span>
      ) : (
        <div className="sub-contenedor">
          <div className="headers">
            <section>
              <h1>
                {accion == "Editar" ? "Editar curso" : "Registrar nuevo curso"}
              </h1>
            </section>

            <section>
              <span onClick={onClose}>x</span>
            </section>
          </div>
          <form className="formulario" onSubmit={handleSubmit(doInsertar)}>
            <section className="form-subcontainer">
              <ContainerSelector>
                <label>Nivel</label>
                <Selector
                  state={stateNivelesLista}
                  funcion={() => setStateNivelesLista((prev) => !prev)}
                  texto2={
                    nivelesitemselect?.nombre_nivel ??
                    nivelesitemselect?.nombre ??
                    "Seleccionar"
                  }
                  color="#fc6027"
                />
                <ListaDesplegable
                  funcion={selectnivel}
                  state={stateNivelesLista}
                  data={dataniveles}
                  top="4rem"
                  setState={() => setStateNivelesLista((prev) => !prev)}
                />
              </ContainerSelector>

              <article>
                <InputText icono={<v.iconoflechaderecha />}>
                  <input
                    className="form__field"
                    defaultValue={dataSelect?.nombre || ""}
                    type="text"
                    placeholder="nombre"
                    {...register("nombre", { required: true })}
                  />
                  <label className="form__label">nombre</label>
                  {errors.nombre?.type === "required" && <p>Campo requerido</p>}
                </InputText>
              </article>

              <Btn1
                icono={<v.iconoguardar />}
                titulo="Guardar"
                bgcolor="#F9D70B"
              />
            </section>
          </form>
        </div>
      )}
    </Container>
  );
}
const Container = styled.div`
  transition: 0.5s;
  top: 0;
  left: 0;
  position: fixed;
  background-color: rgba(10, 9, 9, 0.5);
  display: flex;
  width: 100%;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .sub-contenedor {
    position: relative;
    width: 500px;
    max-width: 85%;
    border-radius: 20px;
    background: ${({ theme }) => theme.bgtotal};
    box-shadow: -10px 15px 30px rgba(10, 9, 9, 0.4);
    padding: 13px 36px 20px 36px;
    z-index: 100;

    .headers {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h1 {
        font-size: 20px;
        font-weight: 500;
      }
      span {
        font-size: 20px;
        cursor: pointer;
      }
    }
    .formulario {
      .form-subcontainer {
        gap: 20px;
        display: flex;
        flex-direction: column;
        .colorContainer {
          .colorPickerContent {
            padding-top: 15px;
            min-height: 50px;
          }
        }
      }
    }
  }
`;

const ContentTitle = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 20px;

  svg {
    font-size: 25px;
  }
  input {
    border: none;
    outline: none;
    background: transparent;
    padding: 2px;
    width: 40px;
    font-size: 28px;
  }
`;
