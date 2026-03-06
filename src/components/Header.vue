<script>

</script>

<template>
    <header class="header">
        <h3 class="logo"><div class="logo1">EPI</div><div class="logo2">MANAGER</div></h3>
        <nav class="navigation">
            <ul class="list-nav">
                <li class="item-nav"><router-link class="link" to="/">Home</router-link></li>
                <li class="item-nav"><router-link class="link" to="/contato">Contato</router-link></li>
            </ul>
        </nav>
        <router-link to="/login"><button class="button">Fazer Login</button></router-link>
    </header>
</template>

<style scoped>

.header {
    display: flex;
    font-family: var(--font-primary);
    justify-content: space-between;
    box-shadow: 0px 4px 10px rgba(132, 132, 132, 0.1);
}
.logo {
    margin: 2rem 4rem;
    display: flex;
    gap: 0.5rem;
    font-size: 1.4rem;
}
.logo1 {
    color: var(--highlights);
}
.logo2 {
    color: var(--color-gray);
}
.navigation {
    display: flex;
    align-items: center;
}
.list-nav {
    display: flex;
    gap: 15rem;
    list-style: none;
    margin: 0;
    padding: 0;
}
.item-nav {
    font-size: 1rem;
}
.link {
    text-decoration: none;
    color: var(--color-gray);
    font-weight: bold;
    font-family: var(--font-primary);
    padding-bottom: 4px;
    position: relative;
}

.link::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background-color: var(--highlights);
    border-radius: 2px;
    transition: width 0.3s ease;
}

.link.router-link-exact-active::after {
    width: 100%;
}
.button {
    background-color: var(--highlights);
    color: white;
    border: none;
    padding: 0.6rem 1rem;
    margin: 2rem 4rem;
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
    font-family: var(--font-primary);
}

</style>