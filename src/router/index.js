import { createRouter, createWebHistory } from 'vue-router'

// Importação dos Views
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Cadastro from '../views/Cadastro.vue'
import Contato from '../views/Contato.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/cadastro', component: Cadastro },
    { path: '/contato', component: Contato },
    { path: '/:pathMatch(.*)*', component: NotFound }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router