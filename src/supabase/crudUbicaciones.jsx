import { supabase } from "../index";

const geo_nivel1 = "geo_nivel1";
const geo_nivel2 = "geo_nivel2";
const geo_nivel3 = "geo_nivel3";
const paisesTable = "paises";

const orderByNombre = (query) => query.order("nombre", { ascending: true });

export async function mostrarPaises(p = {}) {
  let query = supabase.from(paisesTable).select();

  if (p?.id) {
    query = query.eq("id", p.id);
  }

  if (p?.nombre) {
    query = query.ilike("nombre", `%${p.nombre}%`);
  }

  const { data } = await orderByNombre(query);
  return data;
}

export async function mostrarGeo1(p = {}) {
  let query = supabase.from(geo_nivel1).select();

  if (p?.id_pais) {
    query = query.eq("id_pais", p.id_pais);
  }

  const { data } = await orderByNombre(query);
  return data;
}

export async function mostrarGeo2(p = {}) {
  let query = supabase.from(geo_nivel2).select();

  if (p?.id_nivel1) {
    query = query.eq("id_nivel1", p.id_nivel1);
  }

  const { data } = await orderByNombre(query);
  return data;
}

export async function mostrarGeo3(p = {}) {
  let query = supabase.from(geo_nivel3).select();

  if (p?.id_nivel2) {
    query = query.eq("id_nivel2", p.id_nivel2);
  }

  const { data } = await orderByNombre(query);
  return data;
}