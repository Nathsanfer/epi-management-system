<script setup>
// Importação dos recursos do Vue e do Supabase
import { computed, ref, watch } from "vue";
import { useSupabase } from "../composables/useSupabase";

// Obtendo a instância do Supabase e a sessão atual do usuário
const { supabase, session } = useSupabase();

// Variáveis reativas para armazenar o nome completo do usuário e sua função
const nomeCompleto = ref("Usuário");
const funcao = ref("");

// Função para carregar os dados do usuário a partir do Supabase
const carregarDadosUsuario = async () => {
  // Obtendo o ID do usuário a partir da sessão de autenticação
  const userId = session.value?.user?.id;

  if (!userId) {
    console.log("Usuário não autenticado");
    return;
  }

  const { data, error } = await supabase
    .from("usuario")
    .select("nome_completo, funcao")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Erro ao buscar usuário:", error.message);
    nomeCompleto.value = "Usuário";
    funcao.value = "";
    return;
  }

  // Atualizando as variáveis reativas com os dados do usuário
  nomeCompleto.value = data?.nome_completo || "Usuário";
  funcao.value = data?.funcao || "";
};

// Computed para gerar uma mensagem personalizada com base na função do usuário
const mensagemPorFuncao = computed(() => {
  const cargo = funcao.value.toLowerCase();

  if (cargo === "administrador") {
    return "Novos registros e relatórios te aguardam.";
  }

  if (cargo === "operador") {
    return "Fique de olho no estoque e registre as saídas e entregas!";
  }

  return "Bem-vindo ao sistema de gestão de EPI.";
});

// Watch para monitorar mudanças na sessão do usuário e carregar os dados do usuário quando a sessão for atualizada
watch(
  session,
  (novaSessao) => {
    if (novaSessao?.user) {
      carregarDadosUsuario();
    }
  },
  { immediate: true }
);
</script>

<template>
    <section class="dashboard-header">
        <img class="icon" src="../assets/estrelas_icon.png" alt="Ícone de estrelas" />
        <div class="header-content">
            <h1 class="welcome">Olá, {{ nomeCompleto }}</h1>
            <p class="text">{{ mensagemPorFuncao }}</p>
        </div>
    </section>
</template>

<style scoped>
.dashboard-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background-color: #f9f9f9;
}

.icon {
    width: 50px;
    height: 60px;
}

.header-content {
    padding: 0 1rem;
}

.welcome {
    margin: 0;
    color: var(--color-gray);
    font-family: var(--font-secondary);
}

.text {
    margin: 0.1rem 0 0;
    color: #6d6d6d;
    font-size: 1rem;
    font-family: var(--font-primary);
}

@media (max-width: 900px) {
  .icon {
    width: 40px;
    height: 50px;
  }

  .welcome {
    font-size: 1.5rem;
  }

  .text {
    font-size: 0.8rem;
  }
}

@media (max-width: 520px) {
  .dashboard-header {
    margin-top: 0.5rem;
    gap: 0.4  rem;
  }
  
  .icon {
    width: 30px;
    height: 40px;
  }

  .welcome {
    font-size: 1.1rem;
  }

  .text {
    font-size: 0.7rem;
  }
}

</style>