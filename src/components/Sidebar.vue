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

import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSupabase } from '../composables/useSupabase'

const { supabase, session, logout } = useSupabase()
const route = useRoute()
const router = useRouter()

const funcaoUsuario = ref("")
const hoverItem = ref(null)
const modalLogoutAberto = ref(false)
const menuMobileAberto = ref(false)
const isMobileViewport = ref(false)
const MOBILE_BREAKPOINT = 900

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
  borderRadius: isMobileViewport.value && menuMobileAberto.value ? '12px' : '50%'
})

function abrirModalLogout() {
  modalLogoutAberto.value = true
}

function fecharModalLogout() {
  modalLogoutAberto.value = false
}

async function confirmarLogout() {
  await logout()
  modalLogoutAberto.value = false
  menuMobileAberto.value = false
  router.push('/login')
}

function atualizarViewport() {
  isMobileViewport.value = window.innerWidth <= MOBILE_BREAKPOINT

  if (!isMobileViewport.value) {
    menuMobileAberto.value = false
  }
}

function toggleMenuMobile() {
  menuMobileAberto.value = !menuMobileAberto.value
}

function fecharMenuMobile() {
  menuMobileAberto.value = false
}

watch(
  () => route.path,
  () => {
    if (isMobileViewport.value) {
      menuMobileAberto.value = false
    }
  },
)

onMounted(() => {
  atualizarViewport()
  window.addEventListener('resize', atualizarViewport)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', atualizarViewport)
})

watch(session, carregarFuncaoUsuario, { immediate: true })
</script>

<template>
  <button
    v-if="isMobileViewport"
    type="button"
    class="mobile-toggle"
    aria-label="Abrir menu"
    :aria-expanded="menuMobileAberto"
    @click="toggleMenuMobile"
  >
    <span class="mobile-toggle__line"></span>
    <span class="mobile-toggle__line"></span>
    <span class="mobile-toggle__line"></span>
  </button>

  <div
    v-if="isMobileViewport && menuMobileAberto"
    class="mobile-backdrop"
    @click="fecharMenuMobile"
  ></div>

  <aside
    class="sidebar"
    :class="{
      'sidebar--mobile': isMobileViewport,
      'sidebar--mobile-open': isMobileViewport && menuMobileAberto,
    }"
  >
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
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </li>
    </ul>

    <ul class="nav-menu container-link-bottom">
      <li v-for="item in visibleBottomItems" :key="item.to" class="list">
        <button
          v-if="item.to === '/logout'"
          type="button"
          class="nav-link nav-link--button"
          :style="navItemStyle(item.to)"
          :title="item.label"
          @mouseenter="hoverItem = item.to"
          @mouseleave="hoverItem = null"
          @click="abrirModalLogout"
        >
          <span class="nav-icon">
            <img :src="isHighlighted(item.to) ? item.iconClear : item.icon" :alt="item.alt" />
          </span>
          <span class="nav-label">{{ item.label }}</span>
        </button>

        <router-link
          v-else
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
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </li>
    </ul>

    <div v-if="modalLogoutAberto" class="logout-modal-overlay" @click="fecharModalLogout">
      <div class="logout-modal" @click.stop>
        <h3 class="logout-modal-title">Deseja sair?</h3>
        <p class="logout-modal-text">Você será desconectada da sua conta.</p>
        <div class="logout-modal-actions">
          <button type="button" class="logout-btn logout-btn--ghost" @click="fecharModalLogout">
            Cancelar
          </button>
          <button type="button" class="logout-btn logout-btn--danger" @click="confirmarLogout">
            Sair
          </button>
        </div>
      </div>
    </div>
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

.nav-label {
  display: none;
}

.nav-link--button {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
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

.logout-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
}

.logout-modal {
  width: min(360px, 92vw);
  background: #fff;
  border-radius: 14px;
  border: 1px solid #ececec;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.2);
  padding: 1rem;
}

.logout-modal-title {
  margin: 0;
  font-size: 1rem;
  color: #262626;
}

.logout-modal-text {
  margin: 0.45rem 0 0;
  font-size: 0.88rem;
  color: #666;
}

.logout-modal-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.logout-btn {
  height: 36px;
  border-radius: 10px;
  border: none;
  padding: 0 0.9rem;
  font-size: 0.85rem;
  cursor: pointer;
}

.logout-btn--ghost {
  background: #efefef;
  color: #444;
}

.logout-btn--ghost:hover {
  background: #e5e5e5;
}

.logout-btn--danger {
  background: #d93025;
  color: #fff;
}

.logout-btn--danger:hover {
  background: #c0251b;
}

.mobile-toggle {
  display: none;
}

@media (max-width: 900px) {
  .mobile-toggle {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    position: fixed;
    top: 1.4rem;
    left: 1.2rem;
    width: 42px;
    height: 42px;
    border: none;
    border-radius: 12px;
    background: var(--highlights);
    padding: 0 10px;
    z-index: 1301;
    cursor: pointer;
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
  }

  .mobile-toggle__line {
    display: block;
    width: 100%;
    height: 2px;
    background: #fff;
    border-radius: 999px;
  }

  .mobile-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 1299;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: min(180px, 82vw);
    height: 100vh;
    margin: 0;
    border-radius: 0 20px 20px 0;
    padding: 4.2rem 0.8rem 1rem;
    justify-content: flex-start;
    gap: 1rem;
    transform: translateX(-105%);
    transition: transform 0.28s ease;
    box-shadow: 0 18px 36px rgba(0, 0, 0, 0.2);
    z-index: 1300;
  }

  .sidebar--mobile-open {
    transform: translateX(0);
  }

  .container-link-top,
  .container-link-bottom {
    align-items: stretch;
  }

  .container-link-top {
    margin-top: 1.3rem;
  }

  .container-link-bottom {
    margin-top: 2rem;
  }

  .list {
    justify-content: stretch;
  }

  .nav-link {
    width: 100%;
    height: 56px;
    justify-content: flex-start;
    border-radius: 14px;
    padding: 0 0.8rem;
    gap: 0.95rem;
  }

  .nav-link--button {
    width: 100%;
  }

  .nav-icon img {
    width: 22px;
    height: 22px;
  }

  .nav-label {
    display: block;
    font-size: 0.92rem;
    color: #2f2f2f;
    font-weight: 600;
  }

  .logout-modal-overlay {
    z-index: 1400;
  }
}
</style>