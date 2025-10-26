import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import {
  InputText,
  Btn1,
  Icono,
  ConvertirCapitalize,
  useSubnivelesStore,
  ContainerSelector,
  Selector,
  ListaDesplegable,
} from "../../../index";
import { useForm } from "react-hook-form";
import { CirclePicker } from "react-color";
import { useMutation } from "@tanstack/react-query";
import { useNivelesStore } from "../../../store/NivelesStore";

export function RegistrarSubniveles({
  onClose,
  dataSelect,
  accion,
  setIsExploding,
}) {
  const { insertarsubnivel, editarsubnivel } = useSubnivelesStore();
  const {dataniveles, nivelesitemselect} = useNivelesStore();
  const {stateNivelesListo, setStateNivelesListo} = useState(false);
  const ref = useRef(null);
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const { isPending, mutate: doInsertar } = useMutation({
    mutationFn: insertar,
    mutationKey: "insertar subniveles",
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
        _pais: data.pais,
        _logo: dataSelect.logo ?? "-",
      };
      await editarsubnivel(p);
    } else {
      const p = {
        _nombre: data.descripcion,
        // _color: currentColor,
        _logo: "-",
        _pais: data.pais,
      };
      await insertarsubnivel(p);
    }
  }
  useEffect(() => {
    if (accion === "Editar") {
      // setColor(dataSelect.color);
      setFileurl(dataSelect.logo);
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
                {accion == "Editar"
                  ? "Editar subnivel"
                  : "Registrar nueva subnivel"}
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
                <Selector funcion={() => setStateNivelesListo(!stateNivelesListo)} texto2={nivelesitemselect?.nombre} color="#fc6027" />
                <ListaDesplegable data={dataniveles} top="4rem" setState={() => setStateNivelesListo(!stateNivelesListo)} />
                {/* <article>
                  <InputText icono={<v.iconoflechaderecha />}>
                    <input
                      className="form__field"
                      defaultValue={dataSelect.nombre}
                      type="text"
                      placeholder="nivel"
                      {...register("nivel", {
                        required: true,
                      })}
                    />
                    <label className="form__label">nivel</label>
                    {errors.nivel?.type === "required" && (
                      <p>Campo requerido</p>
                    )}
                  </InputText>
                </article> */}
              </ContainerSelector>
              
              <article>
                <InputText icono={<v.iconoflechaderecha />}>
                  <input
                    className="form__field"
                    defaultValue={dataSelect?.pais || ""}
                    type="text"
                    placeholder="país"
                    {...register("pais", { required: true })}
                  />
                  <label className="form__label">tipo subnivel</label>
                  {errors.pais?.type === "required" && <p>Campo requerido</p>}
                </InputText>
              </article>
              <article>
                <InputText icono={<v.iconoflechaderecha />}>
                  <input
                    className="form__field"
                    defaultValue={dataSelect?.ordinal || ""}
                    type="number"
                    step="1"
                    placeholder="ordinal"
                    {...register("ordinal", { required: false })}
                  />
                  <label className="form__label">ordinal</label>
                  {errors.ordinal?.type === "required" && <p>Campo requerido</p>}
                </InputText>
              </article>
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
