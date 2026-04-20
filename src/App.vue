<script setup>
// Importação dos componentes e das funções do Vue
import { computed } from 'vue'
import { useRoute } from 'vue-router'
// Importação dos componentes
import Sidebar from './components/Sidebar.vue'
import DashboardHeader from './components/DashboardHeader.vue'

/*
    Essas configurações definem o layout principal da aplicação. 
    Se a rota atual for uma das rotas protegidas, o layout exibirá o DashboardHeader e a Sidebar.
    Senão exibirá apenas o conteúdo que tem na rota, sem o header e a sidebar.
*/

// Obtenção da rota atual
const route = useRoute()

// Definição das rotas protegidas
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

// Computed para verificar se a rota atual é protegida
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

@media (max-width: 900px) {
  .app-header {
    padding-left: 5rem;
    box-sizing: border-box;
  }
}
</style>