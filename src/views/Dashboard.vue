<script setup>
import { useSupabase } from "../composables/useSupabase";
import { useRouter } from "vue-router";

const { session, logout } = useSupabase();
const router = useRouter();

const handleLogout = async () => {
  await logout();
  router.push("/login");
};
</script>

<template>
    <div class="container">
        <div class="header">
            <h1>Dashboard</h1>
            <button @click="handleLogout" class="logout-btn">
                Sair
            </button>
        </div>
        <div v-if="session" class="user-info">
            <p><strong>Email:</strong> {{ session.user?.email }}</p>
        </div>
        <div class="content">
            <!-- Seu conteúdo do dashboard aqui -->
        </div>
    </div>
</template>

<style scoped>
.container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.logout-btn {
    padding: 0.5rem 1rem;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 1rem;
}

.logout-btn:hover {
    background-color: #da190b;
}

.user-info {
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 0.25rem;
    margin-bottom: 2rem;
}

.content {
    background-color: white;
    padding: 1rem;
    border-radius: 0.25rem;
}
</style>