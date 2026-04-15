import { createClient } from "@supabase/supabase-js";
import { ref } from "vue";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Erro: Variáveis de ambiente não configuradas");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Estado global
const session = ref(null);
const loadingSession = ref(true);

// Carrega sessão inicial
const carregarSessao = async () => {
  const { data } = await supabase.auth.getSession();
  session.value = data.session;
  loadingSession.value = false;
};

// Executa ao iniciar
carregarSessao();

// Escuta mudanças de autenticação
supabase.auth.onAuthStateChange((_event, newSession) => {
  session.value = newSession;
  loadingSession.value = false;
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