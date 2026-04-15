<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import DashboardHeader from './components/DashboardHeader.vue'

const route = useRoute()

const protectedRoutes = [
  '/dashboard',
  '/panorama',
  '/cadastro',
  '/estoque',
  '/relatorio',
  '/movimentacao',
  '/historico',
  '/configuracoes',
  '/logout'
]

const showProtectedLayout = computed(() => protectedRoutes.includes(route.path))
</script>

<template>
  <div class="app-page" :class="{ 'app-page--protected': showProtectedLayout }">
    <DashboardHeader v-if="showProtectedLayout" class="app-header" />

    <div class="app-shell" :class="{ 'app-shell--with-sidebar': showProtectedLayout, 'app-shell--protected': showProtectedLayout }">
      <Sidebar v-if="showProtectedLayout" />

      <main class="app-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-width: 0;
}

.app-page--protected {
  background-color: #f9f9f9;
}

.app-header {
  width: 100%;
}

.app-shell {
  display: flex;
  flex: 1;
  min-width: 0;
}

.app-shell--protected {
  background-color: #f9f9f9;
}

.app-content {
  flex: 1;
  min-width: 0;
}
</style>