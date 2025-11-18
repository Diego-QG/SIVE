import Swal from "sweetalert2";
import { supabase } from "../index";

const geo_nivel1 = "geo_nivel1";
const geo_nivel2 = "geo_nivel2";
const geo_nivel3 = "geo_nivel3";

export async function mostrarGeo1(p) {
    const { data } = await supabase
        .from(geo_nivel1)
        .select()
        .order("nombre", { ascending: false });
    return data;
}

export async function mostrarGeo2(p) {
    const { data } = await supabase
        .from(geo_nivel2)
        .select()
        .order("nombre", { ascending: false });
    return data;
}

export async function mostrarGeo3(p) {
    const { data } = await supabase
        .from(geo_nivel3)
        .select()
        .order("nombre", { ascending: false });
    return data;
}
