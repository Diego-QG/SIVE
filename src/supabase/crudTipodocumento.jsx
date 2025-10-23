import { supabase } from "../index";

const tabla = "tipodocumento";

export async function mostrarTipoDocumentoXNombre(p) {
    const { data } = await supabase
        .from(tabla)
        .select()
        .eq("nombre", p.nombre)
        .maybeSingle();
    return data;
}
