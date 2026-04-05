import { createClient } from "@supabase/supabase-js";
import { ref } from "vue";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação das credenciais
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não estão configuradas");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Estado global reativo
const session = ref(null);
const loadingSession = ref(true);

// Pega sessão inicial
supabase.auth.getSession().then(({ data }) => {
  session.value = data.session;
  loadingSession.value = false;
});

// Escuta mudanças de autenticação
supabase.auth.onAuthStateChange((_event, newSession) => {
  session.value = newSession;
});

export function useSupabase() {
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      session.value = null;
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return {
    supabase,
    session,
    loadingSession,
    logout,
  };
}
