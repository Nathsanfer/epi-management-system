import { createRouter, createWebHistory } from 'vue-router'
import { useSupabase } from '../composables/useSupabase'

// Import views publicas
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Contato from '../views/Contato.vue'
import NotFound from '../views/NotFound.vue'

// Import views protegidas
import Dashboard from '../views/protected/Dashboard.vue'
import Panorama from '../views/protected/Panorama.vue'
import Cadastro from '../views/protected/Cadastro.vue'
import Estoque from '../views/protected/Estoque.vue'    
import Relatorio from '../views/protected/Relatorio.vue'
import Movimentacao from '../views/protected/Movimentacao.vue'
import Configuracoes from '../views/protected/Configuracoes.vue'

const routes = [
    // Rotas publicas
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/contato', component: Contato },

    // Rotas privadas (protegidas)
    { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/panorama', component: Panorama, meta: { requiresAuth: true } },
    { path: '/cadastro', component: Cadastro, meta: { requiresAuth: true } },
    { path: '/estoque', component: Estoque, meta: { requiresAuth: true } },
    { path: '/relatorio', component: Relatorio, meta: { requiresAuth: true } },
    { path: '/movimentacao', component: Movimentacao, meta: { requiresAuth: true } },
    { path: '/configuracoes', component: Configuracoes, meta: { requiresAuth: true } },

    // Rota fallback (404)
    { path: '/:pathMatch(.*)*', component: NotFound }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const { session } = useSupabase()
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

    if (requiresAuth && !session.value) {
        next('/login')
    } else {
        next()
    }
})

export default router