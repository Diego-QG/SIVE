import { supabase } from "../index";

const tabla = "roles";

export async function mostrarRolesXNombre(p) {
    const { data } = await supabase
        .from(tabla)
        .select()
        .eq("nombre", p.nombre)
        .maybeSingle();
    return data;
}
