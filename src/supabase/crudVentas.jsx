import Swal from "sweetalert2";
import { supabase } from "../index";

export async function insertarBorrador(p) {
  const { error, data } = await supabase.rpc("fn_insertarborrador", p);
  if (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.message,
    });
    return null;
  }

  return data ?? null;
}

export async function mostrarVentasPorUsuario(p) {
    const { data, error } = await supabase.rpc("fn_mostrarventasxusuario", {
        _id_usuario: p?._id_usuario ?? null,
    });

    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
        return [];
    }

    return data ?? [];
}

export async function eliminarBorrador(p) {
  const { error } = await supabase.rpc("fn_eliminarborrador", p);
  if (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.message,
    });
    return false;
  }

  return true;
}

export async function insertarEditorialEnVenta(p) {
  const { error } = await supabase.rpc("fn_insertareditorialenventa", p);
  if (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.message,
    });
    return false;
  }

  return true;
}
