<script setup>
import { computed, ref, onMounted } from "vue";
import { createClient } from "@supabase/supabase-js";
import CadastroEquipamentoModal from "../../components/CadastroEquipamentoModal.vue";
import EditarEquipamentoModal from "../../components/EditarEquipamentoModal.vue";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const equipamentos = ref([]);
const menuAbertoId = ref(null);
const pesquisa = ref("");
const filtroAtivo = ref("todos");

const filtros = [
  { label: "Todos", value: "todos" },
  { label: "Descartáveis", value: "Descartável" },
  { label: "Reutilizáveis", value: "Reutilizável" },
];

const modalEdit = ref(false);
const equipamentoEditando = ref(null);

const modalRegister = ref(false);

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

function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function obterQuantidadeAtual(item) {
  return Number(item?.estoque?.[0]?.quantidade ?? 0);
}

function diasAteValidade(validade) {
  if (!validade) return Number.POSITIVE_INFINITY;

  const dataValidade = new Date(`${validade}T00:00:00`);
  if (Number.isNaN(dataValidade.getTime())) return Number.POSITIVE_INFINITY;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const diffMs = dataValidade.getTime() - hoje.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
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

onMounted(carregarEquipamentos);

function openRegisterModal() {
  modalRegister.value = true;
}

function closeRegisterModal() {
  modalRegister.value = false;
}

function toggleMenuOpcoes(id) {
  menuAbertoId.value = menuAbertoId.value === id ? null : id;
}

function fecharMenuOpcoes() {
  menuAbertoId.value = null;
}

function normalizarClassificacao(valor) {
  if (!valor) return "";

  const texto = String(valor).trim().toLowerCase();
  if (!texto) return "";

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function abrirModalEdicao(item) {
  equipamentoEditando.value = item;
  modalEdit.value = true;
  fecharMenuOpcoes();
}

function fecharModalEdicao() {
  modalEdit.value = false;
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
      <ul class="list">
        <li
          class="element"
          :class="obterClasseStatusEquipamento(item)"
          v-for="item in equipamentosFiltrados"
          :key="item.id"
        >
          <div class="element-main">
            <img class="img" :src="item.imagem" alt="imagem do equipamento" />
            <div class="info_name">
              <p class="label">Nome do Equipamento:</p>
              <p class="info">{{ item.nome }}</p>
            </div>
            <div class="divider"></div>
            <div class="info_description_inline">
              <p class="label">Descrição:</p>
              <p class="info">{{ item.descricao }}</p>
            </div>
            <div class="divider"></div>
            <div class="info_quantity">
              <p class="label">Quantidade:</p>
              <p class="info">
                {{ item.estoque?.length ? item.estoque[0].quantidade : 0 }}
              </p>
            </div>
            <div class="divider"></div>
            <div class="info_size">
              <p class="label">Tamanho:</p>
              <p class="info">{{ item.tamanho }}</p>
            </div>
            <div class="divider"></div>
            <div class="info_classification">
              <p class="label">Classificação:</p>
              <p class="info">{{ normalizarClassificacao(item.classificacao) }}</p>
            </div>
            <div class="divider"></div>
            <div class="info_validity">
              <p class="label">Validade:</p>
              <p class="info">{{ item.validade_certificado }}</p>
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

    <CadastroEquipamentoModal
      :open="modalRegister"
      @close="closeRegisterModal"
      @created="carregarEquipamentos"
    />

    <EditarEquipamentoModal
      :open="modalEdit"
      :equipamento="equipamentoEditando"
      @close="fecharModalEdicao"
      @updated="carregarEquipamentos"
    />
  </main>
</template>

<style scoped>
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

.toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 98%;
  margin-left: 0.5rem;
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

.container-scroll {
  margin-top: 1rem;
  width: 98%;
  margin-left: 0.5rem;
  max-height: 510px;
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
  padding: 1rem;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-radius: 20px;
  width: 96%;
  position: relative;
  overflow: visible;
  border: 1px solid #e0e0e0;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.04),
    0 2px 6px rgba(0, 0, 0, 0.04);
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
  display: flex;
  align-items: center;
}

.img {
  width: 65px;
  height: 65px;
}

.info_name {
  margin-left: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 280px;
}

.info_description_inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 300px;
}

.info_description_inline .info {
  text-align: center;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.label {
  font-size: 0.75rem;
  color: #666;
  margin: 0;
}

.info {
  font-size: 0.9rem;
  color: #333;
  font-weight: 100;
  margin: 0;
}

.divider {
  flex: 0 0 1px;
  width: 1px;
  min-width: 1px;
  align-self: stretch;
  background-color: #c7c7c7;
  margin: 0 1.5rem;
  opacity: 1;
}

.info_quantity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 70px;
}

.info_size {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 70px;
}

.info_classification {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 110px;
}

.info_validity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 80px;
}

.more-options-btn {
  border: none;
  background: transparent;
  color: #555;
  font-size: 1.4rem;
  line-height: 1;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
  margin-left: 2rem;
}

.more-options-btn:hover {
  color: #222;
}

.more-options-wrapper {
  margin-left: 2rem;
  position: relative;
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
