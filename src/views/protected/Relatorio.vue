<script setup>
import { computed, onMounted, ref } from "vue";
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
const movimentacoesRelatorio = ref([]);

const periodoMesTexto = computed(() => {
  const agora = new Date();
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(agora);
});

const taxaEntregaMes = computed(() => {
  if (!resumo.value.movimentacoesMes) return 0;
  return Math.round((resumo.value.entregasMes / resumo.value.movimentacoesMes) * 100);
});

const taxaDevolucaoMes = computed(() => {
  if (!resumo.value.movimentacoesMes) return 0;
  return Math.round((resumo.value.devolucoesMes / resumo.value.movimentacoesMes) * 100);
});

function normalizarTexto(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function chaveDataLocal(valor) {
  if (!valor) return "";
  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "";

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

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
  const agora = new Date();
  const inicioHoje = new Date(agora);
  inicioHoje.setHours(0, 0, 0, 0);
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

  const [equipamentosRes, estoqueRes, movMesRes] = await Promise.all([
    supabase.from("equipamento").select("id", { count: "exact", head: true }),
    supabase.from("estoque").select("quantidade"),
    supabase
      .from("movimentacao")
      .select("id, data, tipo_movimentacao")
      .gte("data", inicioMes.toISOString()),
  ]);

  if (equipamentosRes.error) throw equipamentosRes.error;
  if (estoqueRes.error) throw estoqueRes.error;
  if (movMesRes.error) throw movMesRes.error;

  const totalItensEstoque = (estoqueRes.data || []).reduce(
    (acc, item) => acc + Number(item?.quantidade ?? 0),
    0,
  );

  const movimentacoesMes = movMesRes.data || [];
  const hojeChave = chaveDataLocal(inicioHoje);

  resumo.value.totalEquipamentos = equipamentosRes.count || 0;
  resumo.value.totalItensEstoque = totalItensEstoque;
  resumo.value.movimentacoesMes = movimentacoesMes.length;
  resumo.value.movimentacoesHoje = movimentacoesMes.filter(
    (item) => chaveDataLocal(item.data) === hojeChave,
  ).length;
  resumo.value.entregasMes = movimentacoesMes.filter(
    (item) => normalizarTexto(item.tipo_movimentacao) === "entrega",
  ).length;
  resumo.value.devolucoesMes = movimentacoesMes.filter(
    (item) => normalizarTexto(item.tipo_movimentacao) === "devolucao",
  ).length;
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

async function carregarMovimentacoesRelatorio() {
  const { data: movimentacoesData, error: movimentacoesError } = await supabase
    .from("movimentacao")
    .select("id, data, id_usuario, tipo_receptor, id_receptor, tipo_movimentacao")
    .order("data", { ascending: false })
    .limit(12);

  if (movimentacoesError) throw movimentacoesError;

  const listaMovimentacoes = movimentacoesData || [];
  if (!listaMovimentacoes.length) {
    movimentacoesRelatorio.value = [];
    return;
  }

  const idsMovimentacao = listaMovimentacoes.map((item) => item.id);
  const idsUsuarios = [
    ...new Set(listaMovimentacoes.map((item) => item.id_usuario).filter(Boolean)),
  ];

  const { data: itensMovimentacaoData } = await supabase
    .from("item_movimentacao")
    .select("id_movimentacao, quantidade")
    .in("id_movimentacao", idsMovimentacao);

  let usuariosData = [];

  if (idsUsuarios.length) {
    const { data: usuariosRpcData, error: usuariosRpcError } = await supabase.rpc(
      "listar_usuarios_com_email",
    );

    if (!usuariosRpcError && Array.isArray(usuariosRpcData)) {
      const idsSet = new Set(idsUsuarios.map((id) => String(id)));
      usuariosData = usuariosRpcData
        .filter((usuario) => idsSet.has(String(usuario.id)))
        .map((usuario) => ({
          id: usuario.id,
          nome_completo: usuario.nome_completo || usuario.nome || "Usuário",
        }));
    } else {
      const { data: usuariosFallbackData } = await supabase
        .from("usuario")
        .select("id, nome_completo")
        .in("id", idsUsuarios);
      usuariosData = usuariosFallbackData || [];
    }
  }

  const idsPorTipo = listaMovimentacoes.reduce(
    (acc, mov) => {
      const tipo = normalizarTexto(mov.tipo_receptor);
      if (tipo === "aluno") acc.aluno.add(mov.id_receptor);
      if (tipo === "funcionario") acc.funcionario.add(mov.id_receptor);
      if (tipo === "visitante") acc.visitante.add(mov.id_receptor);
      return acc;
    },
    { aluno: new Set(), funcionario: new Set(), visitante: new Set() },
  );

  const [alunosRes, funcionariosRes, visitantesRes] = await Promise.all([
    idsPorTipo.aluno.size
      ? supabase
          .from("aluno")
          .select("id, nome_completo, nome")
          .in("id", [...idsPorTipo.aluno])
      : Promise.resolve({ data: [] }),
    idsPorTipo.funcionario.size
      ? supabase
          .from("funcionario")
          .select("id, nome_completo, nome")
          .in("id", [...idsPorTipo.funcionario])
      : Promise.resolve({ data: [] }),
    idsPorTipo.visitante.size
      ? supabase
          .from("visitante")
          .select("id, nome_completo, nome")
          .in("id", [...idsPorTipo.visitante])
      : Promise.resolve({ data: [] }),
  ]);

  const mapaUsuarios = new Map((usuariosData || []).map((item) => [String(item.id), item]));
  const mapaReceptores = new Map();

  (alunosRes.data || []).forEach((item) => {
    mapaReceptores.set(`aluno-${item.id}`, item.nome_completo || item.nome || "Receptor");
  });
  (funcionariosRes.data || []).forEach((item) => {
    mapaReceptores.set(
      `funcionario-${item.id}`,
      item.nome_completo || item.nome || "Receptor",
    );
  });
  (visitantesRes.data || []).forEach((item) => {
    mapaReceptores.set(`visitante-${item.id}`, item.nome_completo || item.nome || "Receptor");
  });

  const totalPorMovimentacao = (itensMovimentacaoData || []).reduce((acc, item) => {
    const chave = String(item.id_movimentacao);
    acc[chave] = (acc[chave] || 0) + Number(item.quantidade || 0);
    return acc;
  }, {});

  movimentacoesRelatorio.value = listaMovimentacoes.map((mov) => {
    const usuario = mapaUsuarios.get(String(mov.id_usuario));
    const nomeReceptor =
      mapaReceptores.get(`${normalizarTexto(mov.tipo_receptor)}-${mov.id_receptor}`) ||
      "Receptor";

    return {
      id: mov.id,
      data: mov.data,
      tipo: mov.tipo_movimentacao,
      usuario: usuario?.nome_completo || "Usuário",
      receptor: nomeReceptor,
      totalItens: totalPorMovimentacao[String(mov.id)] || 0,
    };
  });
}

async function carregarRelatorio() {
  carregando.value = true;
  erroRelatorio.value = "";

  try {
    await Promise.all([
      carregarResumo(),
      carregarEquipamentosRelatorio(),
      carregarMovimentacoesRelatorio(),
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
  margin-left: 0.4rem;
  margin-right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  height: 96%;
}

.hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  border-radius: 24px;
  padding: 1.1rem 1.2rem;
  background-color: var(--highlights);
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
  margin: 0.2rem 0 0.3rem;
  font-family: var(--font-secondary);
  font-size: clamp(1.15rem, 2.6vw, 1.6rem);
  line-height: 1.25;
}

.hero-subtitle {
  margin: 0;
  font-size: 0.95rem;
  opacity: 0.93;
}

.hero-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.btn {
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-family: var(--font-primary);
  border-radius: 999px;
  padding: 0.58rem 1rem;
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
}

.feedback--erro {
  color: #b42318;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding-right: 0.2rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;
}

.metric-card {
  border-radius: 18px;
  border: 1px solid #ebeef6;
  background: linear-gradient(145deg, #ffffff 0%, #f8faff 100%);
  padding: 0.65rem;
  box-shadow: 0 8px 18px rgba(31, 47, 80, 0.08);
}

.metric-label {
  margin: 0;
  color: #6a738d;
  font-size: 0.74rem;
}

.metric-value {
  margin: 0.25rem 0 0;
  color: #1f2d4a;
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1;
}

.panel {
  border-radius: 20px;
  border: 1px solid #e8ecf5;
  background: #ffffff;
  box-shadow: 0 10px 22px rgba(30, 44, 73, 0.08);
  padding: 1rem;
  height: 50vh;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 0.6rem;
  margin-bottom: 0.8rem;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.02rem;
  color: #1e2d4a;
}

.panel-header p {
  margin: 0;
  font-size: 0.8rem;
  color: #67728f;
}

.panel--distribution {
  background: linear-gradient(150deg, #ffffff 0%, #f6f9ff 100%);
}

.distribution-row {
  display: grid;
  grid-template-columns: 160px 1fr 50px;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 0.55rem;
}

.distribution-info {
  display: flex;
  flex-direction: column;
  color: #42506f;
  font-size: 0.78rem;
}

.distribution-info strong {
  color: #1e2d4a;
  font-size: 1rem;
}

.bar-track {
  width: 100%;
  height: 9px;
  border-radius: 999px;
  background: #e8edf7;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: inherit;
}

.bar-fill--entrega {
  background: #4caf50;
}

.bar-fill--devolucao {
  background: #2196f3;
}

.bar-percent {
  font-size: 0.8rem;
  color: #516182;
  text-align: right;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 0.8rem;
}

.table-wrap {
  max-height: 45vh;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 14px;
  border: 1px solid #edf1f7;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.84rem;
  overflow-y: auto;
  overflow-x: hidden;
}

.table th,
.table td {
  text-align: left;
  border-bottom: 1px solid #edf1f7;
  padding: 0.55rem 0.35rem;
  color: #2c3a56;
}

.table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #fff;
  font-size: 0.74rem;
  color: #6b7895;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.chip {
  display: inline-flex;
  padding: 0.18rem 0.52rem;
  border-radius: 999px;
  font-size: 0.72rem;
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

.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.timeline-item {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 0.65rem;
  border: 1px solid #eef2fa;
  border-radius: 14px;
  padding: 0.62rem;
  background: #fcfdff;
}

.timeline-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #e9f3ff;
  color: #1e5a91;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.18rem 0.5rem;
  height: fit-content;
  text-transform: uppercase;
}

.timeline-badge--entrega {
  background: #e8f7eb;
  color: #1f6f41;
}

.timeline-main {
  margin: 0;
  font-size: 0.84rem;
  color: #253451;
}

.timeline-meta {
  margin: 0.2rem 0 0;
  font-size: 0.76rem;
  color: #64718c;
}

.empty {
  margin: 0;
  font-size: 0.85rem;
  color: #66738e;
}

.print-only {
  display: none;
}

@media (max-width: 1100px) {
  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .grid-2 {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-actions {
    width: 100%;
  }

  .distribution-row {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }

  .timeline-item {
    grid-template-columns: 1fr;
  }
}

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
  }

  .panel {
    height: auto;
  }

  .table-wrap {
    max-height: none;
    overflow: visible;
  }

  .table {
    overflow: visible;
  }

  .content {
    overflow: visible;
  }

  .panel,
  .metric-card {
    box-shadow: none;
    break-inside: avoid;
  }
}
</style>
