<script setup>
// Importação dos componentes e das funções do Vue
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import { computed, ref } from "vue";

/* 
  Ref -> cria valores reativos que mudam e atualizam a interface quando necessário.
  Computed -> cria valores derivados de outros valores reativos.
*/

// --- SCRIPTS DA SEÇÃO DE SERVIÇOS ---

const services = ref([
  {
    id: 1,
    title: "Gestão de Prazos",
    description:
      "Acompanhe vencimentos e receba alertas para reposição no momento certo, evitando atrasos e riscos no uso dos EPIs.",
  },
  {
    id: 2,
    title: "Rastreabilidade",
    description:
      "Identifique com precisão quais funcionários, alunos e visitantes receberam cada EPI e mantenha todo o histórico organizado.",
  },
  {
    id: 3,
    title: "Geração de Relatórios",
    description:
      "Transforme dados de distribuição e estoque em relatórios gerenciais para apoiar decisões estratégicas da instituição.",
  },
  {
    id: 4,
    title: "Controle de Acesso",
    description:
      "Garanta que apenas usuários autorizados acessem áreas e atividades, com controle confiável da entrega de EPIs.",
  },
  {
    id: 5,
    title: "Estoque em Tempo Real",
    description:
      "Monitore quantidades disponíveis em tempo real para evitar falta ou excesso de EPIs e melhorar o planejamento.",
  },
]);

// --- SCRIPTS DA SEÇÃO DE DEPOIMENTOS ---

// Array com dados dos depoimentos
const assessements = ref([
  {
    id: 1,
    title: "Controle e Gestão Incrível",
    text: "Esta plataforma transformou completamente a forma como gerenciamos nossos EPIs. A facilidade de uso e os recursos avançados são incríveis!",
    author: "Nathalia Santos Ferreira",
    localization: "Valinhos/SP",
  },
  {
    id: 2,
    title: "Melhoria na Produtividade",
    text: "A implementação desta solução resultou em uma melhoria significativa na produtividade da equipe de segurança.",
    author: "Carlos Silva",
    localization: "São Paulo/SP",
  },
  {
    id: 3,
    title: "Excelente Suporte ao Cliente",
    text: "O suporte ao cliente é excepcional. Sempre prontos para ajudar e resolver qualquer dúvida ou problema.",
    author: "Ana Paula Costa",
    localization: "Rio de Janeiro/RJ",
  },
  {
    id: 4,
    title: "Interface Intuitiva",
    text: "A interface é muito intuitiva, facilitando a navegação e o acesso às informações importantes sobre os EPIs.",
    author: "Roberto Mendes",
    localization: "Belo Horizonte/MG",
  },
  {
    id: 5,
    title: "Rastreabilidade Completa",
    text: "A rastreabilidade completa dos EPIs é um recurso essencial que nos permite monitorar o uso e a manutenção de cada item.",
    author: "Mariana Oliveira",
    localization: "Curitiba/PR",
  },
  {
    id: 6,
    title: "Controle de Estoque em Tempo Real",
    text: "O controle de estoque em tempo real nos ajudou a evitar faltas e excessos de EPIs, otimizando nossos recursos.",
    author: "Luciana Souza",
    localization: "Porto Alegre/RS",
  },
]);

// Controla qual cena do carrossel está sendo exibida
const currentScene = ref(0);
const cardsPerScene = 2;

// Quebra os depoimentos em cenas para o carrossel
const scenes = computed(() => {
  const groupedAssessements = [];

  for (
    let index = 0;
    index < assessements.value.length;
    index += cardsPerScene
  ) {
    groupedAssessements.push(
      assessements.value.slice(index, index + cardsPerScene),
    );
  }

  return groupedAssessements;
});

// Conta quantas cenas tem ao total
const totalScenes = computed(() => scenes.value.length);

// Se estiver na última cena ele volta para a primeira
const nextScene = () => {
  currentScene.value = (currentScene.value + 1) % totalScenes.value;
};

// Se estiver na primeira cena ele volta para a última
const previousScene = () => {
  currentScene.value =
    (currentScene.value - 1 + totalScenes.value) % totalScenes.value;
};

// Define a navegação através das barras de navegação do carrossel
const goToScene = (sceneIndex) => {
  currentScene.value = sceneIndex;
};

// --- SCRIPTS DA SEÇÃO DE PERGUNTAS FREQUENTES ---

// Array de perguntas frequentes
const faqs = ref([
  {
    id: 1,
    question: "Como posso me cadastrar na plataforma?",
    answer:
      'Para se cadastrar, acesse a página de login e clique em "Nao tenho uma conta". Preencha o formulário com suas informações e siga as instruções para criar sua conta.',
  },
  {
    id: 2,
    question: "Quais são os recursos disponíveis para gestão de EPIs?",
    answer:
      "Nossa plataforma oferece recursos como controle de prazos de validade, segurança e controle de acesso, rastreabilidade completa, controle de estoque em tempo real, geração de relatórios e uma interface responsiva e intuitiva.",
  },
  {
    id: 3,
    question: "A plataforma é compatível com dispositivos móveis?",
    answer:
      "Sim, nossa plataforma é responsiva e pode ser acessada em dispositivos móveis, como smartphones e tablets, proporcionando uma experiência de uso consistente em diferentes telas.",
  },
  {
    id: 4,
    question: "Como posso solicitar uma demonstração da plataforma?",
    answer:
      'Para solicitar uma demonstração, acesse a seção "Contato" do nosso site e preencha o formulário de contato com suas informações e interesse em uma demonstração. Nossa equipe entrará em contato para agendar uma apresentação personalizada.',
  },
  {
    id: 5,
    question: "Quais são as opções de suporte disponíveis?",
    answer:
      "Oferecemos suporte por meio de chat ao vivo, e-mail e telefone. Nossa equipe de suporte está disponível para ajudar com qualquer dúvida ou problema que você possa ter.",
  },
]);

// Controla qual pergunta está aberta no accordion (inicia com a segunda aberta)
const expandedFaqId = ref(2);

// Alterna a expansão da pergunta selecionada
const toggleFaq = (id) => {
  expandedFaqId.value = expandedFaqId.value === id ? null : id;
};

// Verifica se a pergunta está expandida
const isFaqExpanded = (id) => expandedFaqId.value === id;
</script>

<template>
  <Header />

  <main class="content">
    <!-- SEÇÃO DE APRESENTAÇÃO - BANNER -->
    <section class="hero">
      <div class="container-title">
        <h1 class="title1">Conheça essa nova plataforma</h1>
        <h1 class="title2">Gestão e Controle de EPIs</h1>
      </div>

      <div class="container-info">
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
          <p>
            O EPI Manager centraliza e digitaliza o processo, substituindo
            registros manuais por um controle unico e confiavel.
          </p>
        </div>
      </div>

      <div class="container-image">
        <img
          class="hero-image"
          src="../assets/hero.png"
          alt="Trabalhadores com EPIs"
        />

        <div class="stats">
          <div class="stat-item">
            <span class="stat-number">20+</span>
            <span class="stat-label">Equiapamentos Cadastrados</span>
          </div>
          <div class="stat-divisor"></div>
          <div class="stat-item">
            <span class="stat-number">35+</span>
            <span class="stat-label">Solicitantes Registrados</span>
          </div>
          <div class="stat-divisor"></div>
          <div class="stat-item">
            <span class="stat-number">20+</span>
            <span class="stat-label">Movimentações Salvas</span>
          </div>
        </div>
      </div>
    </section>

    <!-- SEÇÃO DE SERVIÇOS -->
    <section class="services">
      <div class="section-cards">
        <div class="info-service">
          <h1 class="title1">Nossos Servicos</h1>
          <h1 class="title2">O Que Oferecemos</h1>
          <p>
            Solucoes para digitalizar o controle de EPIs, melhorar a
            rastreabilidade e tornar a gestao mais segura e eficiente.
          </p>
        </div>

        <article
          v-for="service in services"
          :key="service.id"
          class="card-service"
        >
          <div class="service-heading">
            <span class="service-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle
                  cx="12"
                  cy="7"
                  r="4"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
            </span>
            <h3>{{ service.title }}</h3>
          </div>
          <p>{{ service.description }}</p>
          <span class="service-bottom-line" aria-hidden="true"></span>
        </article>
      </div>
    </section>

    <!-- SEÇÃO DE DEPOIMENTOS -->
    <section class="testimonials">
      <div class="container-decoration" aria-hidden="true"></div>

      <div class="container-content">
        <h1 class="title3">Experiências Compartilhadas</h1>
        <h1 class="title2">Nossos Clientes</h1>

        <div class="carousel-wrapper">
          <!-- Botão esquerdo para passar carrossel -->
          <button
            class="carousel-button"
            @click="previousScene"
            aria-label="Cena anterior"
          >
            &#10094;
          </button>

          <div class="carousel-viewport">
            <div
              class="carousel-track"
              :style="{ '--translate': `-${currentScene * 100}%` }"
            >
              <div
                v-for="(scene, sceneIndex) in scenes"
                :key="sceneIndex"
                class="carousel-slide"
              >
                <article
                  v-for="assessment in scene"
                  :key="assessment.id"
                  class="card"
                >
                  <div class="assessment">
                    <img
                      v-for="star in 5"
                      :key="star"
                      class="image-star"
                      src="../assets/estrela.png"
                      alt="Estrela de avaliação"
                    />
                    <p class="text-assessment">5.0</p>
                  </div>
                  <h4 class="title-card">{{ assessment.title }}</h4>
                  <p class="text-card">{{ assessment.text }}</p>
                  <div class="container-author">
                    <img
                      class="image-author"
                      src="../assets/author.png"
                      alt="Autor do depoimento"
                    />
                    <div class="container-text-author">
                      <p class="text-author">{{ assessment.author }}</p>
                      <p class="text-localization">
                        {{ assessment.localization }}
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <!-- Botão direito para passar carrossel -->
          <button
            class="carousel-button"
            @click="nextScene"
            aria-label="Próxima cena"
          >
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

      <div class="container-decoration" aria-hidden="true"></div>
    </section>

    <!-- SEÇÃO DE PERGUNTAS FREQUENTES -->
    <section class="questions">
      <div class="container-title-questions">
        <h1 class="title1">Perguntas?</h1>
        <h1 class="title2">Olhe aqui.</h1>
      </div>
      <div class="container-information">
        <div class="container-questions">
          <div v-for="item in faqs" :key="item.id" class="accordion-question">
            <button
              class="accordion-header"
              :class="{ 'is-open': isFaqExpanded(item.id) }"
              :aria-expanded="isFaqExpanded(item.id)"
              @click="toggleFaq(item.id)"
            >
              <span class="accordion-title">{{ item.question }}</span>
              <span
                class="accordion-icon"
                :class="{ 'is-open': isFaqExpanded(item.id) }"
                aria-hidden="true"
              ></span>
            </button>

            <transition name="accordion">
              <div v-if="isFaqExpanded(item.id)" class="accordion-content">
                <p class="accordion-answer">{{ item.answer }}</p>
              </div>
            </transition>
          </div>
        </div>
        <div class="container-information-image">
          <div class="more-questions">
            <div class="more-questions-top">
              <div class="more-questions-icon" aria-hidden="true">
                <span>...</span>
              </div>
              <h3 class="more-questions-title">
                Voce tem perguntas diferentes?
              </h3>
            </div>

            <p class="more-questions-text">
              Nossa equipe respondera a todas as suas perguntas. Garantimos uma
              resposta rapida.
            </p>

            <RouterLink class="more-questions-button" to="/contato">
              Entre em Contato
            </RouterLink>
          </div>
          <img
            class="image-information"
            src="../assets/question-img.png"
            alt="Pessoa com dúvida"
          />
        </div>
      </div>
    </section>
  </main>

  <Footer />
</template>

<style scoped>
/* Estilização da seção banner */

.content {
  font-family: var(--font-primary);
}

.container-title {
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

.container-info {
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
  line-height: 1.8;
  font-family: var(--font-secondary);
}

.stat-label {
  font-size: 0.85rem;
  color: white;
}

@media (max-width: 1366px) {
  .container-title {
    padding: 2.5rem 2rem 1.5rem 2rem;
    margin: 0 2rem;
  }

  .container-info {
    padding: 0 2rem 1.5rem 2rem;
    margin: 0 2rem;
    gap: 0.5rem;
  }

  .container-text p {
    margin: 0 -1.7rem;
  }

  .container-image {
    padding: 0;
  }

  .hero-image {
    margin: 0 4rem;
  }

  .stats {
    min-width: 500px;
    gap: 1rem;
  }

  .stat-number {
    font-size: 1.8rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }
}

@media (max-width: 1200px) {
  .item-tag {
    font-size: 0.6rem;
    padding: 0.2rem 0.3rem;
  }

  .divisor {
    margin: 0 0.6rem;
    width: 1px;
  }

  .container-text p {
    font-size: 0.7rem;
    margin: 0;
  }

  .container-image {
    gap: 5rem;
    display: flex;
    justify-content: center;
  }

  .hero-image {
    margin: 0;
  }

  .stats {
    display: flex;
    flex-direction: column;
    height: auto;
    padding: 0.8rem 1rem;
    min-width: 180px;
    margin-bottom: 1.5rem;
    align-items: start;
  }

  .stat-item {
    align-items: start;
    gap: 0.2rem;
  }

  .stat-divisor {
    width: 100%;
    height: 1px;
    margin: -0.4rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }
}

@media (max-width: 768px) {
  .container-title {
    padding: 2.5rem 1rem 1.5rem 1rem;
    margin: 0 1rem;
  }

  .container-info {
    padding: 0 1rem 1.5rem 1rem;
    margin: 0 1rem;
    gap: 0.3rem;
  }

  .container-image {
    height: 100px;
    margin-top: 5rem;
    gap: 3rem;
  }

  .hero-image {
    width: 300px;
    height: 180px;
  }

  .stats {
    gap: 1.3rem;
    padding: 0.2rem 0.6rem;
    margin-bottom: 1rem;
    min-width: 150px;
  }

  .stat-number {
    font-size: 1.1rem;
    line-height: 1.3;
  }

  .stat-label {
    font-size: 0.6rem;
  }

  .stat-divisor {
    display: none;
  }
}

@media (max-width: 535px) {
  .container-title {
    margin-top: -1rem;
  }
  
  .title1 {
    font-size: 1.5rem;
  }

  .title2 {
    font-size: 1.5rem;
  }

  .list-tags {
    grid-template-columns: repeat(2, 1fr);
  }

  .item-tag {
    font-size: 0.5rem;
    padding: 0.2rem 0.3rem;
  }

  .container-text p {
    font-size: 0.6rem;
    margin: 0;
  }

  .divisor {
    margin: 0 0.3rem;
  }

  .container-image {
    height: 80px;
    margin-top: 4rem;
    gap: 0.5rem;
  }

  .hero-image {
    width: 230px;
    height: 130px;
  }

  .stats {
    min-width: 120px;
    padding: 0.2rem 0.4rem;
    gap: 0.4rem;
    margin-bottom: 0.5rem;
  }

  .stat-number {
    font-size: 0.8rem;
    line-height: 1.2;
  }

  .stat-label {
    font-size: 0.5rem;
  }
}

/* Estilização da seção de serviços */

.services {
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  padding: 5rem 0 4rem 0;
}

.section-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  width: min(100%, 1200px);
  padding: 0 2.5rem;
}

.info-service {
  padding: 0.1rem 0rem;
}

.info-service p {
  max-width: 320px;
  margin-top: 1rem;
  font-size: 1.1rem;
  color: #4b4b4b;
  font-family: var(--font-primary);
  line-height: 1.35;
}

.card-service {
  position: relative;
  background-color: #fff;
  border-radius: 20px;
  min-height: 200px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 1.8rem 1.7rem 2.1rem;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 1.2rem;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.card-service:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px color-mix(in srgb, var(--highlights) 38%, transparent);
}

.service-heading {
  display: flex;
  align-items: center;
  gap: 0.95rem;
}

.service-icon {
  width: 42px;
  height: 32px;
  border: 3px solid var(--highlights);
  border-radius: 4px;
  color: var(--highlights);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.service-icon svg {
  width: 20px;
  height: 20px;
}

.card-service h3 {
  margin: 0;
  color: #363636;
  font-weight: 500;
  font-size: 1.3rem;
  line-height: 1.2;
  font-family: var(--font-primary);
}

.card-service p {
  margin: 0;
  color: #444;
  text-align: center;
  font-size: 1rem;
  line-height: 1.35;
  padding: 0 0.35rem;
}

.service-bottom-line {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 7px;
  background-color: var(--highlights);
}

@media (max-width: 1080px) {
  .section-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .info-service {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .info-service p {
    text-align: center;
    max-width: 600px;
    font-size: 1rem;
  }

  .card-service {
    min-height: 150px;
  }

  .service-heading h3 {
    font-size: 1.15rem;
  }

  .card-service p {
    font-size: 0.9rem;
  }
}

@media (max-width: 700px) {
  .section-cards {
    grid-template-columns: 1fr;
    gap: 1.2rem;
    padding: 0 1rem;
  }

  .card-service {
    min-height: 160px;
  }

  .service-heading h3 {
    font-size: 1rem;  
  }
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
  background-image: url("../assets/wallpaper-geometrico.png");
  background-repeat: repeat-x;
  background-position: center;
  background-size: auto 100%;
}

.container-content {
  width: 100%;
  min-height: 36rem;
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

/* Estilização da seção de perguntas frequentes */

.questions {
  background-color: #e7e7e7;
  margin: 0;
  padding: 4rem;
}

.container-title-questions {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 1rem;
}

.container-information {
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 3rem;
  gap: 2rem;
}

.container-questions {
  width: min(100%, 600px);
  display: flex;
  gap: 1.5rem;
  flex-direction: column;
}

.container-information-image {
  display: flex;
  gap: 3rem;
  flex-direction: column;
  width: min(100%, 420px);
}

.more-questions {
  background-color: var(--color-gray);
  width: 100%;
  min-height: 15rem;
  border-radius: 30px;
  padding: 1.5rem 1.8rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.3rem;
}

.more-questions-top {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.more-questions-icon {
  width: 54px;
  height: 40px;
  border-radius: 20px;
  background-color: var(--highlights);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.more-questions-icon::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 14px;
  border-width: 8px 6px 0 6px;
  border-style: solid;
  border-color: var(--highlights) transparent transparent transparent;
}

.more-questions-icon span {
  color: var(--color-gray);
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
  transform: translateY(-2px);
}

.more-questions-title {
  font-family: var(--font-secondary);
  color: #fff;
  font-weight: 500;
  margin: 0;
  max-width: 230px;
  font-size: 1.3rem;
  line-height: 1.15;
}

.more-questions-text {
  color: #ffffffd7;
  margin: 0;
  font-size: 1rem;
  line-height: 1.4;
  max-width: 330px;
}

.more-questions-button {
  align-self: center;
  border: 0;
  background-color: var(--highlights);
  color: #fff;
  font-weight: 700;
  text-decoration: none;
  font-size: 1rem;
  padding: 0.9rem 1.9rem;
  border-radius: 16px;
  transition: filter 0.2s ease;
}

.more-questions-button:hover {
  filter: brightness(0.95);
}

.image-information {
  width: 100%;
  max-width: 420px;
  height: auto;
  object-fit: cover;
  border-radius: 24px;
  display: block;
}

.accordion-header {
  background-color: #fff;
  border: none;
  width: 100%;
  padding: 1.2rem;
  border-radius: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition:
    background-color 0.25s ease,
    color 0.25s ease;
}

.accordion-header.is-open {
  background-color: var(--color-gray);
  border-radius: 30px 30px 0 0;
  border: 1px solid var(--color-gray);
}

.accordion-header.is-open .accordion-title,
.accordion-header.is-open .accordion-icon {
  color: #fff;
}

.accordion-title {
  font-size: 1.1rem;
  color: #000;
  font-weight: 500;
  margin: 0;
}

.accordion-icon {
  width: 10px;
  height: 10px;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  color: #000;
  transform: rotate(45deg);
  transition:
    transform 0.3s ease,
    color 0.25s ease;
}

.accordion-icon.is-open {
  transform: rotate(-135deg);
}

.accordion-content {
  background-color: var(--color-gray);
  border-radius: 0 0 30px 30px;
  padding: 1rem 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.accordion-answer {
  font-size: 1rem;
  color: #ffffff;
  margin: 0;
}

.accordion-enter-active,
.accordion-leave-active {
  transition:
    max-height 0.28s ease,
    opacity 0.22s ease,
    padding 0.28s ease;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  max-height: 280px;
  opacity: 1;
}

@media (max-width: 1100px) {
  .questions {
    padding: 3rem 2rem;
  }

  .container-information {
    flex-direction: column;
    align-items: center;
    padding: 2rem 0 0;
  }

  .container-questions {
    width: 100%;
    max-width: 760px;
  }

  .container-information-image {
    width: 100%;
    max-width: 760px;
    align-items: center;
  }

  .more-questions {
    max-width: 760px;
    min-height: auto;
  }

  .image-information {
    max-width: 520px;
  }
}

@media (max-width: 768px) {
  .questions {
    padding: 2.5rem 1rem;
  }

  .container-title-questions {
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    text-align: center;
  }

  .container-information {
    gap: 1.25rem;
  }

  .container-questions {
    gap: 1rem;
  }

  .accordion-header {
    padding: 1rem;
    border-radius: 22px;
  }

  .accordion-header.is-open {
    border-radius: 22px 22px 0 0;
  }

  .accordion-title {
    font-size: 0.98rem;
    line-height: 1.35;
    text-align: left;
    padding-right: 0.75rem;
  }

  .accordion-content {
    padding: 0.9rem 1rem;
    border-radius: 0 0 22px 22px;
  }

  .accordion-answer {
    font-size: 0.92rem;
    line-height: 1.55;
  }

  .more-questions {
    padding: 1.25rem;
    border-radius: 22px;
  }

  .more-questions-top {
    gap: 0.8rem;
    width: 100%;
  }

  .more-questions-title {
    font-size: 1.05rem;
    max-width: none;
  }

  .more-questions-text {
    font-size: 0.92rem;
    max-width: none;
  }

  .more-questions-button {
    text-align: center;
    padding: 0.85rem 1rem;
    font-size: 0.95rem;
  }

  .image-information {
    max-width: 100%;
    border-radius: 18px;
  }
}

@media (max-width: 520px) {
  .questions {
    padding: 2rem 0.8rem;
  }

  .title1,
  .title2 {
    font-size: 1.35rem;
  }

  .container-information {
    padding-top: 1.25rem;
  }

  .accordion-header {
    padding: 0.9rem;
  }

  .accordion-title {
    font-size: 0.92rem;
  }

  .accordion-answer {
    font-size: 0.88rem;
  }

  .more-questions {
    padding: 1rem;
  }

  .more-questions-icon {
    width: 46px;
    height: 34px;
    border-radius: 16px;
  }

  .more-questions-icon span {
    font-size: 1.5rem;
  }

  .more-questions-title {
    font-size: 0.98rem;
  }

  .more-questions-text {
    font-size: 0.85rem;
    line-height: 1.5;
  }

  .more-questions-button {
    font-size: 0.9rem;
  }

  .image-information {
    border-radius: 16px;
  }
}


</style>
