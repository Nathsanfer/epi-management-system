<script>

</script>

<template>
    <header class="header">
        <h3 class="logo"><div class="logo1">EPI</div><div class="logo2">MANAGER</div></h3>
        <nav class="navigation">
            <ul class="list-nav">
                <li class="item-nav"><a class="link" href="#">Home</a></li>
                <li class="item-nav"><a class="link" href="#">Contato</a></li>
            </ul>
        </nav>
        <button class="button">Fazer Login</button>
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