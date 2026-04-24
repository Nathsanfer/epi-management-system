<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { createClient } from "@supabase/supabase-js";
import CadastroEquipamentoModal from "../../components/CadastroEquipamentoModal.vue";
import EditarEquipamentoModal from "../../components/EditarEquipamentoModal.vue";

// Instância do Supabase para acesso ao banco de dados
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

// ===== ESTADO REATIVO =====
const equipamentos = ref([]);
const menuAbertoId = ref(null);
const pesquisa = ref("");
const filtroAtivo = ref("todos");
// Lista de filtros disponíveis por classificação

const filtros = [
  { label: "Todos", value: "todos" },
  { label: "Descartáveis", value: "Descartável" },
  { label: "Reutilizáveis", value: "Reutilizável" },
];
// Controle de modais

const modalEdit = ref(false);
const equipamentoEditando = ref(null);

const modalRegister = ref(false);
let estoqueRealtimeChannel = null;

// ===== CARREGAMENTO DE DADOS =====
// Busca todos os equipamentos com seus níveis de estoque do Supabase
const carregarEquipamentos = async () => {
  const { data, error } = await supabase
    .from("equipamento")
    .select("*, estoque(quantidade)");

  if (error) {
    console.error("Erro ao carregar equipamentos:", error);
    return;
  }

  equipamentos.value = data;
};

// ===== FUNÇÕES AUXILIARES =====
// Normaliza texto removendo acentos para comparações de busca case-insensitive
function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
// Extrai quantidade de estoque de forma segura, retornando 0 se não existir
}

function obterQuantidadeAtual(item) {
  return Number(item?.estoque?.[0]?.quantidade ?? 0);
// Calcula dias restantes até a validade do certificado
}

function diasAteValidade(validade) {
  if (!validade) return Number.POSITIVE_INFINITY;

  const dataValidade = new Date(`${validade}T00:00:00`);
  if (Number.isNaN(dataValidade.getTime())) return Number.POSITIVE_INFINITY;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const diffMs = dataValidade.getTime() - hoje.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
// Retorna classe CSS de status: "crítico" (vencido ou abaixo do mínimo), "alerta" ou "ok"
}

function obterClasseStatusEquipamento(item) {
  const quantidadeAtual = obterQuantidadeAtual(item);
  const quantidadeMinima = Number(item?.quantidade_minima ?? 0);
  const diasValidade = diasAteValidade(item?.validade_certificado);

  const foraValidade = diasValidade < 0;
  const abaixoMinimo = quantidadeAtual < quantidadeMinima;

  if (foraValidade || abaixoMinimo) {
    return "element--critico";
  }

  const validadeProxima = diasValidade <= 30;
  const noMinimo = quantidadeAtual === quantidadeMinima;

  if (validadeProxima || noMinimo) {
    return "element--alerta";
  }

  return "element--ok";
// Retorna texto descritivo do status (Crítico, Atenção ou Estável)
}

function obterStatusEquipamento(item) {
  const quantidadeAtual = obterQuantidadeAtual(item);
  const quantidadeMinima = Number(item?.quantidade_minima ?? 0);
  const diasValidade = diasAteValidade(item?.validade_certificado);

  if (diasValidade < 0 || quantidadeAtual < quantidadeMinima) {
    return "Crítico";
  }

  if (diasValidade <= 30 || quantidadeAtual === quantidadeMinima) {
    return "Atenção";
  }

  return "Estável";
// ===== COMPUTED FILTERS =====
// Filtra equipamentos por classificação e termo de busca
}

const equipamentosFiltrados = computed(() => {
  const termo = normalizarTexto(pesquisa.value);

  return equipamentos.value.filter((item) => {
    const classificacaoItem = normalizarClassificacao(item.classificacao);
    const bateFiltro =
      filtroAtivo.value === "todos" || classificacaoItem === filtroAtivo.value;

    const textoBusca = normalizarTexto(
      [
        item.nome,
        item.descricao,
        item.tamanho,
        classificacaoItem,
        item.validade_certificado,
        item.certificado_aprovacao,
      ]
        .filter(Boolean)
        .join(" "),
    );

    const bateBusca = !termo || textoBusca.includes(termo);

    return bateFiltro && bateBusca;
  });
});

// ===== LIFECYCLE HOOKS =====
// Carrega equipamentos na montagem do componente
onMounted(carregarEquipamentos);
// Configura realtime subscription para atualizar estoque quando movimentações são registradas

onMounted(() => {
  estoqueRealtimeChannel = supabase
    .channel("estoque-atualizacoes")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "item_movimentacao" },
      () => {
        carregarEquipamentos();
      },
    )
    .subscribe();
// Limpa subscription realtime ao desmontar
});

onBeforeUnmount(() => {
  if (estoqueRealtimeChannel) {
    supabase.removeChannel(estoqueRealtimeChannel);
    estoqueRealtimeChannel = null;
  }
});

// ===== AÇÕES DE MODAL E MENU =====
// Abre modal de cadastro de novo equipamento
function openRegisterModal() {
  modalRegister.value = true;
// Fecha modal de cadastro
}

function closeRegisterModal() {
  modalRegister.value = false;
// Alterna visibilidade do menu de opções (editar/deletar)
}

function toggleMenuOpcoes(id) {
  menuAbertoId.value = menuAbertoId.value === id ? null : id;
// Fecha menu de opções
}

function fecharMenuOpcoes() {
  menuAbertoId.value = null;
// Normaliza classificação: converte para PascalCase
}

function normalizarClassificacao(valor) {
  if (!valor) return "";

  const texto = String(valor).trim().toLowerCase();
  if (!texto) return "";

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// ===== AÇÕES DE EDIÇÃO E EXCLUSÃO =====
// Abre modal de edição com equipamento selecionado
function abrirModalEdicao(item) {
  equipamentoEditando.value = item;
  modalEdit.value = true;
  fecharMenuOpcoes();
// Fecha modal de edição
}

function fecharModalEdicao() {
  modalEdit.value = false;
// Deleta equipamento e seu estoque após confirmação
}

async function deletarEquipamento(item) {
  fecharMenuOpcoes();

  const confirmado = window.confirm(
    `Tem certeza que deseja deletar o equipamento "${item.nome}"?`,
  );

  if (!confirmado) return;

  const { error: estoqueError } = await supabase
    .from("estoque")
    .delete()
    .eq("id_equipamento", item.id);

  if (estoqueError) {
    window.alert(`Erro ao deletar estoque: ${estoqueError.message}`);
    return;
  }

  const { error: equipamentoError } = await supabase
    .from("equipamento")
    .delete()
    .eq("id", item.id);

  if (equipamentoError) {
    window.alert(`Erro ao deletar equipamento: ${equipamentoError.message}`);
    return;
  }

  await carregarEquipamentos();
}
</script>

<template>
  <main class="page" @click="fecharMenuOpcoes">
    <!-- BARRA DE PESQUISA E FILTROS -->
    <div class="toolbar">
      <button class="btn" @click="openRegisterModal">
        Cadastrar Novo Equipamento
      </button>
      <input
        v-model="pesquisa"
        type="search"
        placeholder="Pesquisar equipamento"
        class="search-input"
      />
      <div class="filters">
        <button
          v-for="filtro in filtros"
          :key="filtro.value"
          class="filter-btn"
          :class="{ 'filter-btn--active': filtroAtivo === filtro.value }"
          type="button"
          @click="filtroAtivo = filtro.value"
        >
          {{ filtro.label }}
        </button>
      </div>
    </div>

    <div class="container-scroll">
      <!-- LISTA DE ITENS FILTRADOS --> 
      <ul class="list">
        <li
          class="element"
          :class="obterClasseStatusEquipamento(item)"
          v-for="item in equipamentosFiltrados"
          :key="item.id"
        >
          <div class="element-main">
            <div class="element-header">
              <img class="img" :src="item.imagem" alt="imagem do equipamento" />

              <div class="header-content">
                <div class="header-title-row">
                  <p class="equipamento_nome">
                    {{ item.nome || "Equipamento" }}
                  </p>
                  <span class="status-badge">{{
                    obterStatusEquipamento(item)
                  }}</span>
                </div>

                <p class="equipamento_descricao">
                  {{ item.descricao || "Sem descrição" }}
                </p>

                <p class="classificacao-badge">
                  {{
                    normalizarClassificacao(item.classificacao) ||
                    "Sem classificação"
                  }}
                </p>
              </div>
            </div>

            <div class="element-infos-grid">
              <div class="info-card">
                <p class="label">Quantidade em estoque</p>
                <p class="info info--strong">
                  {{ item.estoque?.length ? item.estoque[0].quantidade : 0 }}
                </p>
              </div>

              <div class="info-card">
                <p class="label">Quantidade mínima</p>
                <p class="info">{{ item.quantidade_minima ?? 0 }}</p>
              </div>

              <div class="info-card">
                <p class="label">Tamanho</p>
                <p class="info">{{ item.tamanho || "-" }}</p>
              </div>

              <div class="info-card">
                <p class="label">Validade</p>
                <p class="info">{{ item.validade_certificado || "-" }}</p>
              </div>
            </div>

            <div class="more-options-wrapper">
              <button
                class="more-options-btn"
                type="button"
                aria-label="Mostrar opções extras"
                @click.stop="toggleMenuOpcoes(item.id)"
              >
                &#8942;
              </button>
              <div
                v-if="menuAbertoId === item.id"
                class="options-menu"
                @click.stop
              >
                <button
                  class="options-menu-btn"
                  type="button"
                  @click="abrirModalEdicao(item)"
                >
                  Editar equipamento
                </button>
                <button
                  class="options-menu-btn options-menu-btn--delete"
                  type="button"
                  @click="deletarEquipamento(item)"
                >
                  Deletar equipamento
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- MODAL DE CADASTRO DE EQUIPAMENTO -->
    <CadastroEquipamentoModal
      :open="modalRegister"
      @close="closeRegisterModal"
      @created="carregarEquipamentos"
    />

    <!-- MODAL DE EDIÇÃO DE EQUIPAMENTO -->
    <EditarEquipamentoModal
      :open="modalEdit"
      :equipamento="equipamentoEditando"
      @close="fecharModalEdicao"
      @updated="carregarEquipamentos"
    />
  </main>
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

.btn {
  height: 42px;
  border: none;
  border-radius: 30px;
  padding: 0 1.2rem;
  font-size: 0.95rem;
  color: #fff;
  background-color: #f6821f;
  cursor: pointer;
  transition: all 0.2s ease;
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

.btn:focus-visible {
  outline: none;
  border-color: #f6a15e;
  box-shadow: 0 0 0 3px rgba(246, 130, 31, 0.18);
}

/* Estilos para a lista de itens filtrados */

.container-scroll {
  margin-top: 0.6rem;
  max-height: 74.5vh;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #f6821f #ececec8c;
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
  gap: 1rem;
}

.element {
  --status-color: #e53935;
  margin: 0;
  padding: 1rem 1.1rem;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
  border-radius: 22px;
  width: 96%;
  position: relative;
  overflow: visible;
  border: 1px solid #eceef4;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.04),
    0 2px 6px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.element:hover {
  border-color: #d0d0d0;
  box-shadow:
    0 12px 36px rgba(0, 0, 0, 0.06),
    0 4px 10px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.element::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 20px;
  background-color: var(--status-color);
  border-radius: 0 30px 30px 0;
}

.element--critico {
  --status-color: #e53935;
}

.element--alerta {
  --status-color: #fb8c00;
}

.element--ok {
  --status-color: #43a047;
}

.element-main {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding-right: 2rem;
}

.img {
  width: 86px;
  height: 86px;
  border-radius: 16px;
  object-fit: cover;
  border: 1px solid #eceef4;
  background: #fff;
}

.element-header {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.header-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.42rem;
}

.header-title-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.equipamento_nome {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1f2937;
}

.equipamento_descricao {
  margin: 0;
  font-size: 0.85rem;
  color: #5f6773;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  border: 1px solid color-mix(in srgb, var(--status-color) 40%, #ffffff);
  color: color-mix(in srgb, var(--status-color) 70%, #1f2937);
  background: color-mix(in srgb, var(--status-color) 14%, #ffffff);
}

.classificacao-badge {
  margin: 0;
  width: fit-content;
  padding: 0.22rem 0.6rem;
  border-radius: 999px;
  background: #eef3ff;
  color: #334155;
  font-size: 0.72rem;
  font-weight: 600;
}

.label {
  text-transform: uppercase;
  letter-spacing: 0.25px;
  font-weight: 600;
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.info {
  font-size: 0.9rem;
  color: #1f2937;
  font-weight: 600;
  margin: 0;
}

.info--strong {
  font-size: 1.2rem;
  font-weight: 800;
  color: color-mix(in srgb, var(--status-color) 70%, #1f2937);
}

.element-infos-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.55rem;
}

.info-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  background: linear-gradient(135deg, #fafbfc 0%, #f5f6f8 100%);
  padding: 0.55rem;
  border-radius: 12px;
  border: 1px solid #f0f1f3;
}

.more-options-btn {
  border: none;
  background: transparent;
  color: #555;
  font-size: 1.7rem;
  line-height: 1;
  padding: 0.1rem 0.42rem;
  cursor: pointer;
  border-radius: 8px;
  margin-right: 1rem;
}

.more-options-btn:hover {
  color: #222;
  background: #f4f5f7;
}

.more-options-wrapper {
  margin-left: 0;
  position: relative;
  position: absolute;
  top: 0.1rem;
  right: 0.2rem;
  z-index: 6;
}

.options-menu {
  position: absolute;
  top: 50%;
  right: calc(100% + 0.5rem);
  transform: translateY(-50%);
  min-width: 170px;
  background: #ffffff;
  border: 1px solid #d8d8d8;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.options-menu-btn {
  border: none;
  background: transparent;
  text-align: left;
  padding: 0.6rem 0.75rem;
  font-size: 0.84rem;
  color: #333;
  cursor: pointer;
}

.options-menu-btn:hover {
  background: #f4f4f4;
}

.options-menu-btn--delete {
  color: #b32d2d;
}

.options-menu-btn--delete:hover {
  background: #fff0f0;
}

/* Responsividade */

@media (max-width: 980px) {
  .element-infos-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .list {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .element {
    width: 95%;
  }

  .element-main {
    padding-right: 0;
  }

  .element::after {
    width: 14px;
  }

  .element-header {
    padding-right: 2rem;
    align-items: flex-start;
  }

  .img {
    width: 72px;
    height: 72px;
  }

  .element-infos-grid {
    grid-template-columns: 1fr;
  }
}

.modal_actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  align-items: center;
}

.modal_btn--secondary {
  background: #efefef;
  color: #444;
}

.modal_btn--secondary:hover {
  background: #e5e5e5;
}
</style>
