import { createRouter, createWebHistory } from 'vue-router'
import { useSupabase } from '../composables/useSupabase'

// Importação dos Views
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Cadastro from '../views/Cadastro.vue'
import Contato from '../views/Contato.vue'
import NotFound from '../views/NotFound.vue'
import Dashboard from '../views/Dashboard.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/cadastro', component: Cadastro },
    { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/contato', component: Contato },
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
    } else if (to.path === '/login' && session.value) {
        next('/dashboard')
    } else {
        next()
    }
})

export default router