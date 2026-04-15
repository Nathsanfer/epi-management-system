<script setup>
// Importa os ícones para opção não selecionada
import IconHome from '../assets/icons_sidebar/home.png'
import IconPanorama from '../assets/icons_sidebar/portifolio.png'
import IconCadastro from '../assets/icons_sidebar/cadastro.png'
import IconEstoque from '../assets/icons_sidebar/estoque.png'
import IconRelatorio from '../assets/icons_sidebar/relatorio.png'
import IconMovimentacao from '../assets/icons_sidebar/movimentacao.png'
import IconHistorico from '../assets/icons_sidebar/historico.png'
import IconConfiguracao from '../assets/icons_sidebar/configuracao.png'
import IconLogout from '../assets/icons_sidebar/logout.png'
// Importa os ícones para opção selecionada (versão "clear")
import IconPanoramaClear from '../assets/icons_sidebar/portifolio_clear.png'
import IconHomeClear from '../assets/icons_sidebar/home_clear.png'
import IconCadastroClear from '../assets/icons_sidebar/cadastro_clear.png'
import IconEstoqueClear from '../assets/icons_sidebar/estoque_clear.png'
import IconRelatorioClear from '../assets/icons_sidebar/relatorio_clear.png'
import IconMovimentacaoClear from '../assets/icons_sidebar/movimentacao_clear.png'
import IconHistoricoClear from '../assets/icons_sidebar/historico_clear.png'
import IconConfiguracaoClear from '../assets/icons_sidebar/configuracao_clear.png'
import IconLogoutClear from '../assets/icons_sidebar/logout_clear.png'

import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSupabase } from '../composables/useSupabase'

const { supabase, session } = useSupabase()
const route = useRoute()

const funcaoUsuario = ref("")
const hoverItem = ref(null)

const carregarFuncaoUsuario = async () => {
  const userId = session.value?.user?.id
    if (!userId) return;

  const { data, error } = await supabase
    .from("usuario")
    .select("funcao")
    .eq("id", userId)
    .maybeSingle()

    if (error) {
    console.error("Erro ao buscar a função do usuário:", error)
    return
    }

  funcaoUsuario.value = (data?.funcao ?? "").toLowerCase().trim()
}

const topItems = [
    { label: "Home", to: "/dashboard", icon: IconHome, iconClear: IconHomeClear, alt: "Home", roles: ["administrador", "operador"] },
    { label: "Panorama", to: "/panorama", icon: IconPanorama, iconClear: IconPanoramaClear, alt: "Panorama", roles: ["administrador", "operador"] },
    { label: "Cadastro", to: "/cadastro", icon: IconCadastro, iconClear: IconCadastroClear, alt: "Cadastro", roles: ["administrador"] },
    { label: "Estoque", to: "/estoque", icon: IconEstoque, iconClear: IconEstoqueClear, alt: "Estoque", roles: ["administrador", "operador"] },
    { label: "Relatório", to: "/relatorio", icon: IconRelatorio, iconClear: IconRelatorioClear, alt: "Relatório", roles: ["administrador"] },
    { label: "Movimentação", to: "/movimentacao", icon: IconMovimentacao, iconClear: IconMovimentacaoClear, alt: "Movimentação", roles: ["operador"] },
    { label: "Histórico", to: "/historico", icon: IconHistorico, iconClear: IconHistoricoClear, alt: "Histórico", roles: ["administrador", "operador"] }
]

const bottomItems = [
    { label: "Configurações", to: "/configuracoes", icon: IconConfiguracao, iconClear: IconConfiguracaoClear, alt: "Configurações", roles: ["administrador", "operador"] },
    { label: "Sair", to: "/logout", icon: IconLogout, iconClear: IconLogoutClear, alt: "Sair", roles: ["administrador", "operador"] }
]

const filtrarPorFuncao = (itens) => {
  const cargo = funcaoUsuario.value
  return itens.filter((item) => item.roles.includes(cargo))
}

const visibleTopItems = computed(() => {
  return filtrarPorFuncao(topItems)
})

const visibleBottomItems = computed(() => {
  return filtrarPorFuncao(bottomItems)
})

const normalizePath = (path) => path.replace(/\/+$/, '') || '/'

const isActiveRoute = (path) => {
  const current = normalizePath(route.path)
  const target = normalizePath(path)
  return current === target || current.startsWith(`${target}/`)
}

const isHighlighted = (path) => hoverItem.value === path || isActiveRoute(path)

const navItemStyle = (path) => ({
  backgroundColor: isHighlighted(path) ? '#f6821f' : 'transparent',
  borderRadius: '50%'
})

watch(session, carregarFuncaoUsuario, { immediate: true })
</script>

<template>
  <aside class="sidebar">
    <ul class="nav-menu container-link-top">
      <li v-for="item in visibleTopItems" :key="item.to" class="list">
        <router-link
          :to="item.to"
          class="nav-link"
          :style="navItemStyle(item.to)"
          :title="item.label"
          @mouseenter="hoverItem = item.to"
          @mouseleave="hoverItem = null"
        >
          <span class="nav-icon">
            <img :src="isHighlighted(item.to) ? item.iconClear : item.icon" :alt="item.alt" />
          </span>
        </router-link>
      </li>
    </ul>

    <ul class="nav-menu container-link-bottom">
      <li v-for="item in visibleBottomItems" :key="item.to" class="list">
        <router-link
          :to="item.to"
          class="nav-link"
          :style="navItemStyle(item.to)"
          :title="item.label"
          @mouseenter="hoverItem = item.to"
          @mouseleave="hoverItem = null"
        >
          <span class="nav-icon">
            <img :src="isHighlighted(item.to) ? item.iconClear : item.icon" :alt="item.alt" />
          </span>
        </router-link>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.sidebar {
    background-color: #fff;
    width: 60px;
    margin: 0 1rem;
    height: 530px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 1.2rem 0;
    border-radius: 30px;
}

.nav-menu {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    width: 100%;
}

.container-link-top,
.container-link-bottom {
    align-items: center;
}

.list {
    width: 100%;
    display: flex;
    justify-content: center;
}

.nav-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    text-decoration: none;
    color: inherit;
    transition: background-color 0.2s ease;
}

.nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav-icon img {
    width: 24px;
    height: 24px;
    object-fit: contain;
}
</style>