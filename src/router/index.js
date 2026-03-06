import { createRouter, createWebHistory } from 'vue-router'

// Importação dos Views
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Cadastro from '../views/Cadastro.vue'
import Contato from '../views/Contato.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/cadastro', component: Cadastro },
    { path: '/contato', component: Contato }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router