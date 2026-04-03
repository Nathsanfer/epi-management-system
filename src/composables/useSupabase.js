import { createClient } from "@supabase/supabase-js";

import { ref } from "vue";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

//  estado global reativo

const session = ref(null);

const loadingSession = ref(true);

// pega sessão inicial

supabase.auth.getSession().then(({ data }) => {
  session.value = data.session;

  loadingSession.value = false;
});

// escuta mudanças

supabase.auth.onAuthStateChange((_event, newSession) => {
  session.value = newSession;
});

export function useSupabase() {
  return {
    supabase,
    session,
    loadingSession,
  };
}
