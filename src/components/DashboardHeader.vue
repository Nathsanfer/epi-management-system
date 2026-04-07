<script setup>
// Importa as dependências necessárias
// Watch: observa mudanças reativas e executa ação
import { computed, ref, watch } from "vue";
import { useSupabase } from "../composables/useSupabase";

// Obtém a instância do Supabase e a sessão atual
const { supabase, session } = useSupabase();

// Variáveis reativas para armazenar o nome completo e função do usuário
const nomeCompleto = ref("");
const funcao = ref("");

// Função para carregar os dados do usuário a partir do banco de dados
const carregarDadosUsuario = async () => {
    // Obtém o ID do usuário autenticado a partir da sessão
    const userId = session.value?.user?.id;

    // Se não houver um usuário autenticado, não busca dados
    if (!userId) return;

    // Consulta a tabela "usuario" para obter o nome completo e função do usuário
    const { data, error } = await supabase
        .from("usuario")
        .select("nome_completo, funcao")
        .eq("id", userId)
        .maybeSingle();

    if (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        return;
    }

    // Atualiza as variáveis reativas com os dados obtidos, usando valores padrão se necessário
    nomeCompleto.value = data?.nome_completo ?? "Usuário";
    funcao.value = data?.funcao ?? "";
};

// Gera uma mensagem personalizada com base na função do usuário
const mensagemPorFuncao = computed(() => {
    const cargo = funcao.value.toLowerCase();

    if (cargo.includes("administrador")) {
        return "Novos registros e relatórios te aguardam.";
    }

    if (cargo.includes("operador")) {
        return "Fique de olho no estoque e registre as saídas e entregas!";
    }

    return "Bem-vindo ao sistema de gestão de EPI.";
});

// Observa mudanças na sessão e carrega os dados do usuário imediatamente 
watch(session, carregarDadosUsuario, { immediate: true });
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
</style>
