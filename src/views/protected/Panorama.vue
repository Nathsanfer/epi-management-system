<script setup>
// Importação das dependências necessárias
import { ref, onMounted, computed } from "vue";
// Importação do cliente Supabase
import { createClient } from "@supabase/supabase-js";

// Configuração do cliente Supabase usando as variáveis de ambiente
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

// Definição das variáveis reativas para armazenar os dados de alunos, funcionários e visitantes
const alunos = ref([]);
const funcionarios = ref([]);
const visitantes = ref([]);

// Variáveis reativas para controle de pesquisa e filtro
const pesquisa = ref("");
const filtroAtivo = ref("todos");

// Computed para definir os filtros disponíveis
const filtros = computed(() => [
  { value: "todos", label: "Todos" },
  { value: "alunos", label: "Alunos" },
  { value: "visitantes", label: "Visitantes" },
  { value: "funcionarios", label: "Funcionários" },
]);

// Função para carregar os dados de alunos
const carregarAlunos = async () => {
  const { data, error } = await supabase.from("aluno").select("*");

  if (error) {
    console.error("Erro ao carregar alunos:", error);
    return;
  }

  alunos.value = data.map((item) => ({
    ...item,
    tipo: "aluno",
    uniqueId: `aluno-${item.id}`,
  }));
};

// Função para carregar os dados de funcionários
const carregarFuncionarios = async () => {
  const { data, error } = await supabase.from("funcionario").select("*");

  if (error) {
    console.error("Erro ao carregar funcionários:", error);
    return;
  }

  funcionarios.value = data.map((item) => ({
    ...item,
    tipo: "funcionario",
    uniqueId: `funcionario-${item.id}`,
  }));
};

// Função para carregar os dados de visitantes
const carregarVisitantes = async () => {
  const { data, error } = await supabase.from("visitante").select("*");

  if (error) {
    console.error("Erro ao carregar visitantes:", error);
    return;
  }

  visitantes.value = data.map((item) => ({
    ...item,
    tipo: "visitante",
    uniqueId: `visitante-${item.id}`,
  }));
};

// Carregamento dos dados ao montar o componente
onMounted(() => {
  carregarAlunos();
  carregarFuncionarios();
  carregarVisitantes();
});

// Computed para combinar os dados de alunos, funcionários e visitantes em uma única lista
const todos = computed(() => {
  const listas = [alunos.value, funcionarios.value, visitantes.value];
  // Determinação do comprimento máximo entre as listas para intercalar os itens
  const maxLen = Math.max(...listas.map((lista) => lista.length), 0);
  const resultado = [];

  // Intercala os itens das listas para criar uma lista combinada
  for (let i = 0; i < maxLen; i += 1) {
    for (const lista of listas) {
      if (lista[i]) resultado.push(lista[i]);
    }
  }

  return resultado;
});

// Computed para filtrar os itens com base no tipo selecionado e no termo de pesquisa
const itensFiltrados = computed(() => {
  // Mapeamento dos valores de filtro para os tipos correspondentes
  const tipoMapa = {
    todos: null,
    alunos: "aluno",
    visitantes: "visitante",
    funcionarios: "funcionario",
  };

  const tipoSelecionado = tipoMapa[filtroAtivo.value];
  const termo = pesquisa.value.trim().toLowerCase();

  return todos.value.filter((item) => {
    const bateTipo = tipoSelecionado ? item.tipo === tipoSelecionado : true;

    // Criação de um texto concatenado com os campos relevantes para a busca
    const textoBusca = [
      item.nome_completo,
      item.cpf,
      item.telefone,
      item.matricula,
      item.email,
      item.cargo,
      item.setor,
      item.curso,
      item.turma,
      item.empresa,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    // Verificação se o termo de pesquisa bate com o texto concatenado
    const bateBusca = !termo || textoBusca.includes(termo);

    return bateTipo && bateBusca;
  });
});

// Função para obter o rótulo do tipo de item (aluno, visitante ou funcionário)
const tipoLabel = (item) => {
  if (item.tipo === "aluno") return "Aluno";
  if (item.tipo === "visitante") return "Visitante";
  return "Funcionário";
};

// Função para obter a classe CSS do badge com base no tipo de item
const getBadgeClass = (item) => {
  if (item.tipo === "aluno") return "badge-aluno";
  if (item.tipo === "visitante") return "badge-visitante";
  return "badge-funcionario";
};
</script>

<template>
  <section class="page">
    <!-- BARRA DE PESQUISA E FILTROS -->
    <div class="toolbar">
      <input
        type="search"
        placeholder="Pesquisar por nome, CPF ou registro"
        class="search-input"
        v-model="pesquisa"
      />
      <div class="filters">
        <button
          v-for="filtro in filtros"
          :key="filtro.value"
          type="button"
          class="filter-btn"
          :class="{ 'filter-btn--active': filtroAtivo === filtro.value }"
          @click="filtroAtivo = filtro.value"
        >
          {{ filtro.label }}
        </button>
      </div>
    </div>

    <div class="container-scroll">
      <!-- LISTA DE ITENS FILTRADOS -->
      <ul class="list">
        <li class="element" v-for="item in itensFiltrados" :key="item.uniqueId">
          <div class="container-left">
            <img
              class="avatar"
              :src="item.imagem"
              :alt="`Avatar de ${item.nome_completo}`"
            />
            <p class="badge-tipo" :class="getBadgeClass(item)">
              {{ tipoLabel(item) }}
            </p>
          </div>

          <div class="container-right">
            <div class="card-header">
              <p class="value name-value">{{ item.nome_completo }}</p>
            </div>

            <div class="card-content">
              <div class="data-block">
                <p class="label">CPF</p>
                <p class="value">{{ item.cpf }}</p>
              </div>

              <div class="data-block">
                <p class="label">Telefone</p>
                <p class="value">{{ item.telefone }}</p>
              </div>

              <div class="data-block">
                <p class="label">Matrícula</p>
                <p class="value">{{ item.matricula }}</p>
              </div>
            </div>

            <div class="card-extra" v-if="item.tipo === 'funcionario'">
              <div class="data-block">
                <p class="label">Cargo</p>
                <p class="value">{{ item.cargo }}</p>
              </div>
              <div class="data-block">
                <p class="label">Setor</p>
                <p class="value">{{ item.setor }}</p>
              </div>
            </div>

            <div class="card-extra" v-else-if="item.tipo === 'aluno'">
              <div class="data-block">
                <p class="label">E-mail</p>
                <p class="value">{{ item.email }}</p>
              </div>
              <div class="data-block">
                <p class="label">Curso</p>
                <p class="value">{{ item.curso }}</p>
              </div>
              <div class="data-block">
                <p class="label">Turma</p>
                <p class="value">{{ item.turma }}</p>
              </div>
            </div>

            <div class="card-extra" v-else-if="item.tipo === 'visitante'">
              <div class="data-block">
                <p class="label">E-mail</p>
                <p class="value">{{ item.email }}</p>
              </div>
              <div class="data-block">
                <p class="label">Empresa</p>
                <p class="value">{{ item.empresa }}</p>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.page {
  margin-left: 0.4rem;
  margin-right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  height: 96%;
}

/* Estilos para a barra de pesquisa e filtros */

.toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-input {
  flex: 1;
  min-width: 260px;
  height: 42px;
  border: 1px solid #d6d6d6;
  border-radius: 30px;
  padding: 0 0.9rem;
  font-size: 0.95rem;
  color: #333;
  background-color: #fff;
}

.search-input:focus {
  outline: none;
  border-color: #f6821f;
  box-shadow: 0 0 0 2px rgba(246, 130, 31, 0.15);
}

.filters {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  height: 42px;
  border: 1px solid #d7d7d7;
  border-radius: 30px;
  padding: 0 0.9rem;
  font-size: 0.9rem;
  color: #444;
  background-color: #f7f7f7;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background-color: #efefef;
}

.filter-btn--active {
  border-color: #f6821f;
  background-color: #fff3e8;
  color: #b45b10;
  font-weight: 600;
}

/* Estilos para a lista de itens filtrados */

.container-scroll {
  margin-top: 0.6rem;
  max-height: 74.5vh;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #f6821f #e4e4e4;
}

.container-scroll::-webkit-scrollbar {
  width: 10px;
}

.container-scroll::-webkit-scrollbar-track {
  background: #ececec;
  border-radius: 999px;
}

.container-scroll::-webkit-scrollbar-thumb {
  background: #f6821f;
  border-radius: 999px;
}

.container-scroll::-webkit-scrollbar-thumb:hover {
  background: #e27410;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: flex-start;
}

.element {
  width: 96%;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 0.85rem;
  display: flex;
  flex-direction: row;
  gap: 1.8rem;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.04),
    0 2px 6px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.element:hover {
  border-color: #d0d0d0;
  box-shadow:
    0 12px 36px rgba(0, 0, 0, 0.06),
    0 4px 10px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.container-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  flex-shrink: 0;
  min-width: 130px;
  width: 130px;
  padding: 0.3rem 0;
  border-right: 1px solid #f0f0f0;
  padding-right: 1.2rem;
}

.container-right {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1;
  min-width: 0;
}

.card-header {
  display: flex;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f5f5f5;
}

.avatar {
  width: 78px;
  height: 78px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
}

.name-value {
  font-size: 1.45rem;
  font-weight: 800;
  color: #0f0f0f;
  margin: 0;
  letter-spacing: -0.3px;
}

.badge-tipo {
  margin: 0;
  display: block;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.badge-aluno {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #0d47a1;
}

.badge-visitante {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  color: #4a148c;
}

.badge-funcionario {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  color: #e65100;
}

.card-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
  padding-bottom: 0.6rem;
  border-bottom: 2px solid #f5f5f5;
}

.data-block {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  background: linear-gradient(135deg, #fafbfc 0%, #f5f6f8 100%);
  padding: 0.45rem;
  border-radius: 10px;
  border: 1px solid #f0f1f3;
  transition: all 0.2s ease;
}

.data-block:hover {
  background: linear-gradient(135deg, #f5f6f8 0%, #eff0f3 100%);
  border-color: #e8eaed;
}

.label {
  margin: 0;
  font-size: 0.6rem;
  color: #999999;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1px;
}

.value {
  margin: 0;
  font-size: 0.75rem;
  color: #333333;
  font-weight: 600;
  word-break: break-word;
}

.card-extra {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.55rem;
  padding-top: 0.5rem;
}

@media (max-width: 720px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    margin-top: 1rem;
  }

  .search-input {
    padding: 0.6rem 0.9rem;
  }

  .filters {
    justify-content: center;
  }

  .element {
    gap: 1rem;
  }

  .container-left {
    min-width: 100px;
    width: 100px;
    padding-right: 0.8rem;
  }
}

@media (max-width: 490px) {
  .filter-btn {
    padding: 0.4rem 0.7rem;
    height: auto;
    font-size: 0.7rem;
    gap: 0.5rem;
  }

  .element {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .container-left {
    flex-direction: row;
    gap: 0.8rem;
    padding-right: 0;
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 1rem;
    width: 100%;
  }
}
</style>
