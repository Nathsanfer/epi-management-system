<script setup>
import { onMounted, ref } from "vue";
import { useSupabase } from "../../composables/useSupabase";

const { supabase } = useSupabase();

const carregando = ref(true);
const erroRelatorio = ref("");

const resumo = ref({
  totalEquipamentos: 0,
  totalItensEstoque: 0,
  equipamentosCriticos: 0,
  movimentacoesHoje: 0,
  movimentacoesMes: 0,
  entregasMes: 0,
  devolucoesMes: 0,
});

const equipamentosRelatorio = ref([]);

function formatarDataHora(valor) {
  if (!valor) return "-";

  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [ano, mes, dia] = valor.split("-").map(Number);
    const dataLocal = new Date(ano, mes - 1, dia, 0, 0, 0);
    if (Number.isNaN(dataLocal.getTime())) return "-";

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dataLocal);
  }

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

function formatarData(valor) {
  if (!valor) return "-";
  const data = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(data.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(data);
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

function obterStatusEquipamento(item, quantidadeAtual) {
  const quantidadeMinima = Number(item?.quantidade_minima ?? 0);
  const diasValidade = diasAteValidade(item?.validade_certificado);

  if (diasValidade < 0 || quantidadeAtual < quantidadeMinima) {
    return { texto: "Crítico", classe: "chip chip--critico" };
  }

  if (diasValidade <= 30 || quantidadeAtual === quantidadeMinima) {
    return { texto: "Atenção", classe: "chip chip--alerta" };
  }

  return { texto: "Estável", classe: "chip chip--ok" };
}

async function carregarResumo() {
  const [equipamentosRes, estoqueRes] = await Promise.all([
    supabase.from("equipamento").select("id", { count: "exact", head: true }),
    supabase.from("estoque").select("quantidade"),
  ]);

  if (equipamentosRes.error) throw equipamentosRes.error;
  if (estoqueRes.error) throw estoqueRes.error;

  const totalItensEstoque = (estoqueRes.data || []).reduce(
    (acc, item) => acc + Number(item?.quantidade ?? 0),
    0,
  );

  resumo.value.totalEquipamentos = equipamentosRes.count || 0;
  resumo.value.totalItensEstoque = totalItensEstoque;
}

async function carregarEquipamentosRelatorio() {
  const { data, error } = await supabase
    .from("equipamento")
    .select(
      "id, nome, classificacao, validade_certificado, quantidade_minima, estoque(quantidade)",
    )
    .order("nome", { ascending: true });

  if (error) throw error;

  const lista = (data || []).map((item) => {
    const quantidadeAtual = Number(item?.estoque?.[0]?.quantidade ?? 0);
    return {
      ...item,
      quantidadeAtual,
      status: obterStatusEquipamento(item, quantidadeAtual),
    };
  });

  equipamentosRelatorio.value = lista;
  resumo.value.equipamentosCriticos = lista.filter(
    (item) => item.status.texto === "Crítico",
  ).length;
}

async function carregarRelatorio() {
  carregando.value = true;
  erroRelatorio.value = "";

  try {
    await Promise.all([
      carregarResumo(),
      carregarEquipamentosRelatorio(),
    ]);
  } catch (error) {
    console.error("Erro ao carregar relatório:", error);
    erroRelatorio.value = "Não foi possível carregar os dados do relatório.";
  } finally {
    carregando.value = false;
  }
}

function imprimirRelatorio() {
  window.print();
}

onMounted(() => {
  carregarRelatorio();
});
</script>

<template>
  <section class="report-page">
    <header class="hero no-print">
      <div class="hero-content">
        <p class="eyebrow">Relatório gerencial</p>
        <h1>Visão geral de movimentações e equipamentos</h1>
        <p class="hero-subtitle">
          Consolidação dos principais indicadores para acompanhamento da operação.
        </p>
      </div>

      <div class="hero-actions">
        <button class="btn btn--ghost" type="button" @click="carregarRelatorio">
          Atualizar dados
        </button>
        <button class="btn" type="button" @click="imprimirRelatorio">
          Imprimir relatório
        </button>
      </div>
    </header>

    <div class="print-only print-header">
      <h1>Relatório de Movimentações e Equipamentos</h1>
      <p>Emitido em {{ formatarDataHora(new Date()) }}</p>
    </div>

    <p v-if="erroRelatorio" class="feedback feedback--erro">{{ erroRelatorio }}</p>
    <p v-if="carregando" class="feedback">Carregando relatório...</p>

    <div v-else class="content">
      <section class="metrics-grid">
        <article class="metric-card">
          <p class="metric-label">Equipamentos cadastrados</p>
          <p class="metric-value">{{ resumo.totalEquipamentos }}</p>
        </article>
        <article class="metric-card">
          <p class="metric-label">Itens em estoque</p>
          <p class="metric-value">{{ resumo.totalItensEstoque }}</p>
        </article>
        <article class="metric-card">
          <p class="metric-label">Movimentações hoje</p>
          <p class="metric-value">{{ resumo.movimentacoesHoje }}</p>
        </article>
        <article class="metric-card">
          <p class="metric-label">Equipamentos críticos</p>
          <p class="metric-value">{{ resumo.equipamentosCriticos }}</p>
        </article>
      </section>

      <div class="grid-2">
        <section class="panel">
          <div class="panel-header">
            <h2>Equipamentos</h2>
            <p>{{ equipamentosRelatorio.length }} registro(s)</p>
          </div>

          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Equipamento</th>
                  <th>Classificação</th>
                  <th>Estoque</th>
                  <th>Mínimo</th>
                  <th>Validade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in equipamentosRelatorio" :key="item.id">
                  <td>{{ item.nome || "Equipamento" }}</td>
                  <td>{{ item.classificacao || "-" }}</td>
                  <td>{{ item.quantidadeAtual }}</td>
                  <td>{{ item.quantidade_minima ?? 0 }}</td>
                  <td>{{ formatarData(item.validade_certificado) }}</td>
                  <td>
                    <span :class="item.status.classe">{{ item.status.texto }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.report-page {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 100%;
  box-sizing: border-box;
}

.hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  border-radius: 24px;
  padding: 1.5rem;
  background-color: var(--highlights, #f6821f);
  box-shadow: 0 10px 34px rgba(216, 99, 11, 0.28);
  color: #fff;
}

.eyebrow {
  margin: 0;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.88;
}

.hero h1 {
  margin: 0.4rem 0;
  font-family: var(--font-secondary);
  font-size: clamp(1.2rem, 4vw, 1.75rem);
  line-height: 1.25;
}

.hero-subtitle {
  margin: 0;
  font-size: 0.95rem;
  opacity: 0.93;
  max-width: 600px;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn {
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-family: var(--font-primary);
  border-radius: 999px;
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: 0.2s ease;
  white-space: nowrap;
}

.btn:hover {
  background: rgba(255, 255, 255, 0.28);
}

.btn--ghost {
  background: transparent;
}

.feedback {
  margin: 0;
  color: #4c5670;
  font-size: 0.92rem;
  padding: 0.5rem;
}

.feedback--erro {
  color: #b42318;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.metric-card {
  border-radius: 18px;
  border: 1px solid #ebeef6;
  background: linear-gradient(145deg, #ffffff 0%, #f8faff 100%);
  padding: 1rem;
  box-shadow: 0 8px 18px rgba(31, 47, 80, 0.05);
}

.metric-label {
  margin: 0;
  color: #6a738d;
  font-size: 0.8rem;
  font-weight: 500;
}

.metric-value {
  margin: 0.4rem 0 0;
  color: #1f2d4a;
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1;
}

.panel {
  border-radius: 20px;
  border: 1px solid #e8ecf5;
  background: #ffffff;
  box-shadow: 0 10px 22px rgba(30, 44, 73, 0.05);
  padding: 1.25rem;
  box-sizing: border-box;
  max-height: 74.5vh;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #1e2d4a;
}

.panel-header p {
  margin: 0;
  font-size: 0.85rem;
  color: #67728f;
}

.table-wrap {
  max-height: 43.5vh;
  overflow-y: auto;
  overflow-x: auto; 
  border-radius: 14px;
  border: 1px solid #edf1f7;
  -webkit-overflow-scrolling: touch; 
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.table th,
.table td {
  text-align: left;
  border-bottom: 1px solid #edf1f7;
  padding: 0.75rem 0.8rem;
  color: #2c3a56;
}

.table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #f8fafc;
  font-size: 0.75rem;
  color: #6b7895;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

.td-main {
  font-weight: 600;
  min-width: 160px; /* Garante espaço para o nome do item */
}

.text-nowrap {
  white-space: nowrap;
}

.chip {
  display: inline-flex;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.chip--critico {
  color: #8f1d1d;
  background: #ffe8e8;
}

.chip--alerta {
  color: #9a5600;
  background: #fff2df;
}

.chip--ok {
  color: #1f6f41;
  background: #e5f7eb;
}

.print-only {
  display: none;
}

/* ==========================================================================
   MEDIA QUERIES (Ajustes de Telas)
   ========================================================================== */

@media (max-width: 1100px) {
  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .hero {
    flex-direction: column;
    align-items: stretch;
    padding: 1.25rem;
  }

  .hero-actions {
    justify-content: stretch;
    width: 100%;
  }

  .hero-actions .btn {
    flex: 1;
    text-align: center;
  }
  
  /* Força a tabela a manter uma estrutura legível gerando o scroll horizontal necessário */
  .table {
    min-width: 640px; 
  }
}

@media (max-width: 560px) {
  .metrics-grid {
    grid-template-columns: 1fr; /* Um cartão por linha em celulares pequenos */
  }

  .panel {
    padding: 1rem;
  }
}

@media (max-width: 380px) {
  .hero-actions {
    flex-direction: column;
  }
}

/* Ajustes de Impressão mantidos intactos */
@media print {
  :global(body) {
    background: #fff;
  }

  :global(.app-header),
  :global(.dashboard-header) {
    display: none !important;
  }

  .no-print {
    display: none;
  }

  .print-only {
    display: block;
  }

  .print-header {
    margin-bottom: 0.8rem;
  }

  .print-header h1 {
    margin: 0;
    font-size: 1.2rem;
    color: #1f2d4a;
  }

  .print-header p {
    margin: 0.2rem 0 0;
    color: #4b5c7e;
    font-size: 0.82rem;
  }

  .report-page {
    margin: 0;
    height: auto;
    gap: 0.55rem;
    padding: 0;
  }

  .panel {
    height: auto;
    box-shadow: none;
    padding: 0;
    border: none;
  }

  .table-wrap {
    max-height: none;
    overflow: hidden;
    border: none;
  }

  .table {
    overflow: hidden;
  }

  .table th {
    background: #fff;
    position: static;
  }

  .content {
    overflow: hidden;
  }

  .metric-card {
    box-shadow: none;
    break-inside: avoid;
  }
}
</style>
