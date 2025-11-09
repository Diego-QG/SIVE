import { supabase } from "../index";

const tabla = "usuarios";

export async function mostrarUsuarios(p) {
    const { data, error } = await supabase
        .from(tabla)
        .select()
        .eq("id_auth", p.id_auth)
        .maybeSingle();

    return data;
}

export async function insertarAdmin(p) {
    await supabase.from(tabla).insert(p);
    if(error){
        throw new Error(error.message)
    }
}

export async function insertarUsuarios(p) {
    const {error, data} = await supabase.from(tabla).insert(p);
    if(error){
        throw new Error(error.message)
    }
    return data
}

export async function insertarCredencialesUser(p) {
    const {data, error} = await supabase.rpc("crearcredencialesuser", p)
    if(error){
        throw new Error(error.message)
    }
}

export async function obtenerIDAuthSupabase(){
    const {data:{session}} = await supabase.auth.getSession();
    if(session!=null){
        const {user} = session
        const idAuth = user.id
        return idAuth;
    }
}