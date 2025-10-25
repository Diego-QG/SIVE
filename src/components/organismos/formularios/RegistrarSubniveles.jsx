import { useEffect, useState } from "react";
import styled from "styled-components";
import {
  Btn1,
  ConvertirCapitalize,
  InputText2,
  ListaDesplegable,
  useEmpresaStore,
  useSubnivelesStore,
  v,
} from "../../../index";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

export function RegistrarSubniveles({ onClose, dataSelect, accion, setIsExploding }) {
  const {
    insertarsubnivel,
    editarsubnivel,
    niveles,
    tiposSubniveles,
  } = useSubnivelesStore();
  const { dataempresa } = useEmpresaStore();

  const [openNiveles, setOpenNiveles] = useState(false);
  const [openTipos, setOpenTipos] = useState(false);
  const [nivelSelect, setNivelSelect] = useState(null);
  const [tipoSelect, setTipoSelect] = useState(null);
  const [errorNivel, setErrorNivel] = useState(false);
  const [errorTipo, setErrorTipo] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: {
      nombre: dataSelect?.nombre ?? "",
      codigo: dataSelect?.codigo ?? "",
      estado: dataSelect?.estado ?? "activo",
    },
  });

  useEffect(() => {
    if (accion === "Editar" && dataSelect) {
      const nivel = niveles?.find((item) => item.id === dataSelect.id_nivel) ?? null;
      const tipo =
        tiposSubniveles?.find((item) => item.id === dataSelect.id_tipo_subnivel) ?? null;
      setNivelSelect(nivel);
      setTipoSelect(tipo);
    }
  }, [accion, dataSelect, niveles, tiposSubniveles]);

  useEffect(() => {
    reset({
      nombre: dataSelect?.nombre ?? "",
      codigo: dataSelect?.codigo ?? "",
      estado: dataSelect?.estado ?? "activo",
    });
  }, [accion, dataSelect, reset]);

  const { isPending, mutate } = useMutation({
    mutationFn: async (formData) => {
      if (!nivelSelect) {
        setErrorNivel(true);
        return;
      }
      if (!tipoSelect) {
        setErrorTipo(true);
        return;
      }

      const payload = {
        id_empresa: dataempresa?.id,
        id_nivel: nivelSelect.id,
        id_tipo_subnivel: tipoSelect.id,
        nombre: ConvertirCapitalize(formData.nombre),
        codigo: formData.codigo?.toUpperCase?.() ?? "",
        estado: formData.estado ?? "activo",
      };

      if (accion === "Editar" && dataSelect?.id) {
        await editarsubnivel({ ...payload, id: dataSelect.id });
      } else {
        await insertarsubnivel(payload);
      }
    },
    mutationKey: ["registrar subniveles", accion, dataSelect?.id],
    onSuccess: () => {
      if (typeof setIsExploding === "function") {
        setIsExploding(true);
      }
      onClose?.();
    },
  });

  const handlesubmit = (formData) => {
    setErrorNivel(!nivelSelect);
    setErrorTipo(!tipoSelect);
    if (!nivelSelect || !tipoSelect) {
      return;
    }
    mutate(formData);
  };

  const closeAndReset = () => {
    onClose?.();
  };

  return (
    <Container>
      <div className="sub-contenedor">
        <div className="headers">
          <section>
            <h1>{accion === "Editar" ? "Editar subnivel" : "Registrar subnivel"}</h1>
          </section>

          <section>
            <span onClick={closeAndReset}>x</span>
          </section>
        </div>

        <form className="formulario" onSubmit={handleSubmit(handlesubmit)}>
          <section className="form-subcontainer">
            <article className="inputGroup">
              <label>Nivel</label>
              <div className="selectContainer">
                <InputText2>
                  <input
                    className="form__field"
                    type="text"
                    readOnly
                    value={nivelSelect?.nombre ?? ""}
                    placeholder="Selecciona un nivel"
                    onClick={() => setOpenNiveles((prev) => !prev)}
                  />
                </InputText2>
                <ListaDesplegable
                  data={niveles}
                  setState={() => setOpenNiveles(false)}
                  funcion={(item) => {
                    setNivelSelect(item);
                    setErrorNivel(false);
                  }}
                  scroll="auto"
                  top="70px"
                  state={openNiveles}
                />
              </div>
              {errorNivel && <p className="errorText">Selecciona un nivel</p>}
            </article>

            <article className="inputGroup">
              <label>Tipo de subnivel</label>
              <div className="selectContainer">
                <InputText2>
                  <input
                    className="form__field"
                    type="text"
                    readOnly
                    value={tipoSelect?.nombre ?? ""}
                    placeholder="Selecciona un tipo"
                    onClick={() => setOpenTipos((prev) => !prev)}
                  />
                </InputText2>
                <ListaDesplegable
                  data={tiposSubniveles}
                  setState={() => setOpenTipos(false)}
                  funcion={(item) => {
                    setTipoSelect(item);
                    setErrorTipo(false);
                  }}
                  scroll="auto"
                  top="70px"
                  state={openTipos}
                />
              </div>
              {errorTipo && <p className="errorText">Selecciona un tipo de subnivel</p>}
            </article>

            <article className="inputGroup">
              <label>Nombre</label>
              <InputText2>
                <input
                  className="form__field"
                  type="text"
                  placeholder="Nombre del subnivel"
                  {...register("nombre", { required: true })}
                />
              </InputText2>
              {errors.nombre?.type === "required" && (
                <p className="errorText">Campo requerido</p>
              )}
            </article>

            <article className="inputGroup">
              <label>Código</label>
              <InputText2>
                <input
                  className="form__field"
                  type="text"
                  placeholder="Código"
                  {...register("codigo", { required: true })}
                />
              </InputText2>
              {errors.codigo?.type === "required" && (
                <p className="errorText">Campo requerido</p>
              )}
            </article>

            <article className="inputGroup">
              <label>Estado</label>
              <InputText2>
                <input
                  className="form__field"
                  type="text"
                  placeholder="Estado"
                  {...register("estado", { required: true })}
                />
              </InputText2>
              {errors.estado?.type === "required" && (
                <p className="errorText">Campo requerido</p>
              )}
            </article>

            <Btn1
              icono={<v.iconoguardar />}
              titulo={isPending ? "Guardando..." : "Guardar"}
              bgcolor="#F9D70B"
              disabled={isPending}
            />
          </section>
        </form>
      </div>
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
    width: 50%;
    display: flex;
    flex-direction: column;
    background-color: ${({ theme }) => theme.bgtotal};
    color: ${({ theme }) => theme.text};
    padding: 30px;
    border-radius: 20px;
    max-width: 650px;
    @media (max-width: 768px) {
      width: 90%;
    }
  }

  .headers {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    section span {
      cursor: pointer;
      font-size: 20px;
    }
  }

  .formulario {
    width: 100%;
  }

  .form-subcontainer {
    display: grid;
    gap: 16px;
  }

  .inputGroup {
    display: flex;
    flex-direction: column;
    gap: 6px;
    position: relative;
  }

  .selectContainer {
    position: relative;
  }

  .errorText {
    font-size: 12px;
    color: #f76e8e;
  }
`;