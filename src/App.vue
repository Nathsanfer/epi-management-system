<script setup>
import Header from './components/Header.vue'
</script>

<template>
  <Header />

  <main class="content">
    <section class="hero">
      <div class="conteiner-title">
        <h1 class="title1">Conheça essa nova plataforma</h1>
        <h1 class="title2">Gestão e Controle de EPIs </h1>
      </div>

      <div class="conteiner-info">
        <div class="tags">
          <ul class="list-tags">
            <li class="item-tag">Gestão de Prazos de Validade</li>
            <li class="item-tag">Segurança e Controle de Acesso</li>
            <li class="item-tag">Rastreabilidade Completa</li>
            <li class="item-tag">Controle de Estoque em Tempo Real</li>
            <li class="item-tag">Geração de Relatórios</li>
            <li class="item-tag">Interface Responsiva e Intuitiva</li>
          </ul>
        </div>

        <div class="divisor"></div>

        <div class="container-text">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis</p>
        </div>  
      </div>

      <div class="container-image">
        <img class="hero-image" src="./assets/hero.png" alt="Trabalhadores com EPIs" />

        <div class="stats">
          <div class="stat-item">
            <span class="stat-number">640+</span>
            <span class="stat-label">Associados na empresa</span>
          </div>
          <div class="stat-divisor"></div>
          <div class="stat-item">
            <span class="stat-number">640+</span>
            <span class="stat-label">Associados na empresa</span>
          </div>
          <div class="stat-divisor"></div>
          <div class="stat-item">
            <span class="stat-number">640+</span>
            <span class="stat-label">Associados na empresa</span>
          </div>
        </div>
      </div>
    </section>

  </main>

</template>

<style scoped>
.content {
  font-family: var(--font-primary);
}

.conteiner-title {
  padding: 2.5rem 4rem 1.5rem 4rem;
  margin: 0 5rem;
}

.title1 {
  font-size: 2rem;
  color: var(--color-gray);
  font-weight: 500;
  margin: 0;
  font-family: var(--font-secondary);
}

.title2 {
  font-size: 2rem;
  color: var(--highlights);
  font-weight: 500;
  margin: 0;
  font-family: var(--font-secondary);
}

.conteiner-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 5rem;
  padding: 0 4rem 1.5rem 4rem;
}

.tags {
  width: 70%;
}

.list-tags {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem 0rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.item-tag {
  font-size: 0.85rem;
  color: var(--color-gray);
  background-color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  list-style: none;
  width: fit-content;
}

.divisor {
  width: 2px;
  height: 70px;
  background-color: var(--highlights);
  flex-shrink: 0;
  margin: 0 5rem 0 0rem;
}

.container-text p {
  font-size: 0.85rem;
  color: #555;
  max-width: 220px;
  line-height: 1.7;
  margin: 0;
}

/* ===== IMAGEM + STATS ===== */
.container-image {
  display: flex;
  align-items: flex-end;
  padding: 0 4rem;
  gap: 3rem;
  margin-top: 9rem;
  background-color: #4a4a4a;
  height: 140px;
  overflow: visible;
}

.hero-image {
  width: 480px;
  height: 280px;
  object-fit: cover;
  margin: 0 5rem;
  margin-bottom: 1rem;
  display: block;
  border-radius: 8px 8px 0 0;
}

.stats {
  display: flex;
  flex-direction: row;
  background-color: var(--highlights);
  border-radius: 16px;
  padding: 0.8rem 2rem;
  min-width: 600px;
  margin-bottom: 2.5rem;
  height: 120px;
  justify-content: space-around;
  box-sizing: border-box;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-divisor {
  width: 1px;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.4);
  margin: 0.3rem 0;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: white;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.85rem;
  color: white;
}
</style>
