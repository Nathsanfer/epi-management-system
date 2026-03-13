<script setup>
// Importação do componente Header e das funções do Vue
import Header from '../components/Header.vue'
import { computed, ref } from 'vue'

/* 
  Ref -> cria valores reativos que mudam e atualizam a interface quando necessário.
  Computed -> cria valores derivados de outros valores reativos.
*/

// Array com dados dos depoimentos
const assessements = ref([
  {
    id: 1,
    title: 'Controle e Gestão Incrível',
    text: 'Esta plataforma transformou completamente a forma como gerenciamos nossos EPIs. A facilidade de uso e os recursos avançados são incríveis!',
    author: 'Nathalia Santos Ferreira',
    localization: 'Valinhos/SP'
  },
  {
    id: 2,
    title: 'Melhoria na Produtividade',
    text: 'A implementação desta solução resultou em uma melhoria significativa na produtividade da equipe de segurança.',
    author: 'Carlos Silva',
    localization: 'São Paulo/SP'
  },
  {
    id: 3,
    title: 'Excelente Suporte ao Cliente',
    text: 'O suporte ao cliente é excepcional. Sempre prontos para ajudar e resolver qualquer dúvida ou problema.',
    author: 'Ana Paula Costa',
    localization: 'Rio de Janeiro/RJ'
  },
  {
    id: 4,
    title: 'Interface Intuitiva',
    text: 'A interface é muito intuitiva, facilitando a navegação e o acesso às informações importantes sobre os EPIs.',
    author: 'Roberto Mendes',
    localization: 'Belo Horizonte/MG'
  },
  {
    id: 5,
    title: 'Rastreabilidade Completa',
    text: 'A rastreabilidade completa dos EPIs é um recurso essencial que nos permite monitorar o uso e a manutenção de cada item.',
    author: 'Mariana Oliveira',
    localization: 'Curitiba/PR'
  },
  {
    id: 6,
    title: 'Controle de Estoque em Tempo Real',
    text: 'O controle de estoque em tempo real nos ajudou a evitar faltas e excessos de EPIs, otimizando nossos recursos.',
    author: 'Luciana Souza',
    localization: 'Porto Alegre/RS'
  }
])

// Controlar a cena atual do carrossel / Controle o número de cards por cena
const currentScene = ref(0)
const cardsPerScene = 2

// Quebra os depoimentos em cenas para o carrossel
const scenes = computed(() => {
  const groupedAssessements = []

  for (let index = 0; index < assessements.value.length; index += cardsPerScene) {
    groupedAssessements.push(assessements.value.slice(index, index + cardsPerScene))
  }

  return groupedAssessements
})

// Conta quantas cenas tem ao total
const totalScenes = computed(() => scenes.value.length)

// Se estiver na última cena ele volta para a primeira
const nextScene = () => {
  currentScene.value = (currentScene.value + 1) % totalScenes.value
}

// Se estiver na primeira cena ele volta para a última
const previousScene = () => {
  currentScene.value = (currentScene.value - 1 + totalScenes.value) % totalScenes.value
}

// Define a navegação através das barras de navegação do carrossel
const goToScene = (sceneIndex) => {
  currentScene.value = sceneIndex
}

</script>

<template>
  <Header />

  <main class="content">
    <!-- SEÇÃO DE APRESENTAÇÃO - BANNER -->
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
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis</p>
        </div>
      </div>

      <div class="container-image">
        <img class="hero-image" src="../assets/hero.png" alt="Trabalhadores com EPIs" />

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

    <!-- SEÇÃO DE DEPOIMENTOS -->
    <section class="testimonials">
      <!--O atributo aria-hidden indica que a decoração é puramente visual e não deve ser lida por leitores de tela-->
      <div class="container-decoration" aria-hidden="true"></div>

      <div class="container-content">
        <h1 class="title3">Experiências Compartilhadas</h1>
        <h1 class="title2">Nossos Clientes</h1>

        <div class="carousel-wrapper">
          <!-- Botão esquerdo para passar carrossel -->
          <button class="carousel-button" @click="previousScene" aria-label="Cena anterior">
            &#10094;
          </button>

          <div class="carousel-viewport">
            <div class="carousel-track" :style="{ '--translate': `-${currentScene * 100}%` }">
              <div v-for="(scene, sceneIndex) in scenes" :key="sceneIndex" class="carousel-slide">
                <article v-for="assessment in scene" :key="assessment.id" class="card">
                  <div class="assessment">
                    <img v-for="star in 5" :key="star" class="image-star" src="../assets/estrela.png" alt="Estrela de avaliação" />
                    <p class="text-assessment">5.0</p>
                  </div>
                  <h4 class="title-card">{{ assessment.title }}</h4>
                  <p class="text-card">{{ assessment.text }}</p>
                  <div class="container-author">
                    <img class="image-author" src="../assets/author.png" alt="Autor do depoimento" />
                    <div class="container-text-author">
                      <p class="text-author">{{ assessment.author }}</p>
                      <p class="text-localization">{{ assessment.localization }}</p>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <!-- Botão direito para passar carrossel -->
          <button class="carousel-button" @click="nextScene" aria-label="Próxima cena">
            &#10095;
          </button>
        </div>

        <div class="carousel-dots">
          <button
            v-for="(scene, sceneIndex) in scenes"
            :key="sceneIndex"
            class="carousel-dot"
            :class="{ 'is-active': sceneIndex === currentScene }"
            :aria-label="`Ir para a cena ${sceneIndex + 1}`"
            @click="goToScene(sceneIndex)"
          ></button>
        </div>


      </div>

      <!--O atributo aria-hidden indica que a decoração é puramente visual e não deve ser lida por leitores de tela-->
      <div class="container-decoration" aria-hidden="true"></div>
    </section>

  </main>

</template>

<style scoped>
/* Estilização da Hero */

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

/* Estilização da seção de depoimentos */

.testimonials {
  margin-top: 4rem;
  overflow-x: hidden;
}

.container-decoration {
  width: 100vw;
  height: 35px;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  background-image: url('../assets/wallpaper-geometrico.png');
  background-repeat: repeat-x;
  background-position: center;
  background-size: auto 100%;
}

.container-content {
  width: 100%;
  min-height: 30rem;
  background-color: var(--color-gray);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 2.5rem;
  box-sizing: border-box;
}

.title3 {
  font-size: 2rem;
  color: white;
  font-weight: 500;
  margin: 0;
  font-family: var(--font-secondary);
}

.card {
  width: min(100%, 32rem);
  min-height: 17rem;
  border-radius: 20px;
  background-color: #ffffff17;
  backdrop-filter: blur(2px);
  padding: 1rem 1.3rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.carousel-wrapper {
  width: min(100%, 72rem);
  margin-top: 3rem;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
}

.carousel-viewport {
  width: 100%;
  overflow: hidden;
}

.carousel-track {
  display: flex;
  transform: translateX(var(--translate, 0%));
  transition: transform 0.9s cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: transform;
}

.carousel-slide {
  min-width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  justify-items: center;
}

.carousel-slide .card:only-child {
  grid-column: 1 / -1;
  justify-self: center;
}

.carousel-button {
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid #ffffff4a;
  background: #ffffff14;
  color: #fff;
  border-radius: 999px;
  cursor: pointer;
}

.carousel-button:hover {
  background: #ffffff24;
}

.carousel-dots {
  margin-top: 1.5rem;
  display: flex;
  gap: 0.5rem;
}

.carousel-dot {
  width: 2.2rem;
  height: 3px;
  border: 0;
  background-color: #ffffff55;
  border-radius: 20px;
  cursor: pointer;
}

.carousel-dot.is-active {
  background-color: var(--highlights);
}

.assessment {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-direction: row;
}

.image-star {
  width: 20px;
  height: 20px;
}

.text-assessment {
  font-size: 1.1rem;
  color: white; 
}

.title-card {
  font-size: 1.15rem;
  color: white;
  font-weight: bold;
  margin: 0;
  padding-top: 0.5rem;
  font-family: var(--font-primary);
}

.text-card {
  font-size: 0.85rem;
  color: rgb(217, 217, 217);
  margin: 0;
  padding-top: 0.5rem;
}

.container-author {
  display: flex;
  margin-top: 1.1rem;
}

.image-author {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  margin-top: auto;
  margin-bottom: 1rem;
}

.container-text-author {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 0.8rem;
}

.text-author {
  font-size: 0.9rem;
  color: white;
  font-weight: 700;
  margin: 0;
}

.text-localization {
  font-size: 0.75rem;
  color: rgb(217, 217, 217);
}

@media (max-width: 900px) {
  .carousel-wrapper {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }

  .carousel-slide {
    grid-template-columns: 1fr;
  }

  .carousel-button {
    display: none;
  }
}

</style>
