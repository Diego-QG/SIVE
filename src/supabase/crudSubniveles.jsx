import Swal from "sweetalert2";
import { supabase } from "../index";

const tabla = "subniveles";
const tablaNiveles = "niveles";
const tablaTipos = "tiposubniveles";

function handleError(error) {
  if (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.message,
    });
  }
}

export async function insertarSubnivel(payload) {
  const { error } = await supabase.from(tabla).insert(payload);
  handleError(error);
}

export async function mostrarSubniveles(payload) {
  const query = supabase
    .from(tabla)
    .select()
    .eq("id_empresa", payload.id_empresa)
    .order("id", { ascending: false });

  const { data, error } = await query;
  handleError(error);
  return data;
}

export async function buscarSubniveles(payload) {
  const query = supabase
    .from(tabla)
    .select()
    .eq("id_empresa", payload.id_empresa)
    .ilike("nombre", `%${payload.descripcion}%`)
    .order("id", { ascending: false });

  const { data, error } = await query;
  handleError(error);
  return data;
}

export async function eliminarSubnivel(payload) {
  const { error } = await supabase.from(tabla).delete().eq("id", payload.id);
  handleError(error);
}

export async function editarSubnivel(payload) {
  const { id, ...rest } = payload;
  const { error } = await supabase.from(tabla).update(rest).eq("id", id);
  handleError(error);
}

export async function mostrarNiveles(payload) {
  const query = supabase
    .from(tablaNiveles)
    .select()
    .order("nombre", { ascending: true });

  const { data, error } = await query;
  handleError(error);
  return data;
}

export async function mostrarTiposSubniveles() {
  const { data, error } = await supabase
    .from(tablaTipos)
    .select()
    .order("nombre", { ascending: true });
  handleError(error);
  return data;
}