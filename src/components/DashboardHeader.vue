<script setup>
import { computed, ref, watch } from "vue";
import { useSupabase } from "../composables/useSupabase";

// Supabase
const { supabase, session, loadingSession } = useSupabase();

// Estados
const nomeCompleto = ref("");
const funcao = ref("");

// Buscar dados do usuário
const carregarDadosUsuario = async () => {
    const userId = session.value?.user?.id;

    console.log("USER ID:", userId);
    console.log(userId)

    if (!userId) return;

    const { data, error } = await supabase
        .from("usuario") // ✅ nome correto
        .select("nome_completo, funcao")
        .eq("id", userId) // ✅ correto
        .maybeSingle();

    console.log("DATA:", data);

    if (error) {
        console.error("Erro ao buscar usuário:", error);
        return;
    }

    nomeCompleto.value = data?.nome_completo ?? "Usuário";
    funcao.value = data?.funcao ?? "";
};

// Mensagem dinâmica
const mensagemPorFuncao = computed(() => {
    const cargo = funcao.value?.toLowerCase() || "";

    if (cargo.includes("administrador")) {
        return "Novos registros e relatórios te aguardam.";
    }

    if (cargo.includes("operador")) {
        return "Fique de olho no estoque e registre as saídas e entregas!";
    }

    return "Bem-vindo ao sistema de gestão de EPI.";
});

watch(
    () => loadingSession.value,
    (loading) => {
        console.log("LOADING:", loading);

        if (!loading && session.value?.user) {
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
</style>