import { create } from "zustand";
import { supabase } from "../index";

export const useAuthStore = create((set) => ({
    loginGoogle: async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
        });
        
    },
    cerrarSesion: async () => {
        await supabase.auth.signOut();
    },
    loginUsuario: async (p) => {
        console.log("Intentando iniciar sesión con:", p);
        const { data, error } = await supabase.auth.signInWithPassword({
            email: p.email,
            password: p.password,
        });
        console.log("Respuesta de Supabase auth:", { data, error });
        if (error) {
            console.error("Error al iniciar sesión", error);
            if (error.status === 400) {
                throw new Error("Correo o contraseña incorrectos");
            } else {
                throw new Error("Error al iniciar sesión: " + error.message);
            }
        }
        return data.user;
    },
}));