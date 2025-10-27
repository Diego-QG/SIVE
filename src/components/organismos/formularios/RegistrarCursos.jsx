import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import {
  InputText,
  Btn1,
  Icono,
  ConvertirCapitalize,
  useCursosStore,
  ContainerSelector,
  Selector,
  ListaDesplegable,
  useNivelesStore,
} from "../../../index";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

export function RegistrarCursos({
  onClose,
  dataSelect,
  accion,
  setIsExploding,
}) {
  const { insertarcurso, editarcurso } = useCursosStore();
  const { dataniveles, nivelesitemselect, selectnivel } = useNivelesStore();
  const [stateNivelesLista, setStateNivelesLista] = useState(false);
  const ref = useRef(null);
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const { isPending, mutate: doInsertar } = useMutation({
    mutationFn: insertar,
    mutationKey: "insertar cursos",
    onError: (err) => console.log("El error", err.message),
    onSuccess: () => cerrarFormulario(),
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
    if (accion === "Editar") {
      const p = {
        _nombre: data.descripcion,
        _id: dataSelect.id,
        _id_nivel: nivelesitemselect?.id,
        _tipo: data.tipo,
      };
      await editarcurso(p);
    } else {
      const p = {
        _id_nivel: nivelesitemselect?.id,
        _nombre: data.nombre,
        _tipo: data.tipo,
      };
      {console.log(p, nivelesitemselect)}
      await insertarcurso(p);
    }
  }
  useEffect(() => {
    if (accion === "Editar") {
      // setColor(dataSelect.color);
      // setFileurl(dataSelect.logo);
    }
  }, []);
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
          <form className="formulario" onSubmit={handleSubmit(handlesub)}>
            <section className="form-subcontainer">
              <ContainerSelector>
                <label>Nivel</label>
                <Selector
                  state={stateNivelesLista}
                  funcion={() => setStateNivelesLista(!stateNivelesLista)}
                  texto2={nivelesitemselect && nivelesitemselect.nombre ? nivelesitemselect.nombre : "Seleccionar"}
                  color="#fc6027"
                />
                <ListaDesplegable
                  funcion={selectnivel}
                  state={stateNivelesLista}
                  data={dataniveles}
                  top="4rem"
                  setState={() => setStateNivelesLista(!stateNivelesLista)}
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
              <article>
                <InputText icono={<v.iconoflechaderecha />}>
                  <input
                    className="form__field"
                    defaultValue={dataSelect?.tipo || "1"}
                    type="number"
                    step="1"
                    min="1"
                    max="9"
                    placeholder="tipo"
                    {...register("tipo", { required: true })}
                  />
                  <label className="form__label">Tipo</label>
                  {errors.tipo?.type === "required" && (
                    <p>Campo requerido</p>
                  )}
                </InputText>
              </article>

              {/* <article className="colorContainer">
                <ContentTitle>
                  {<v.paletacolores />}
                  <span>Color</span>
                </ContentTitle>
                <div className="colorPickerContent">
                  <CirclePicker onChange={elegirColor} color={currentColor} />
                </div>
              </article> */}

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
