<script setup>
import { computed, onMounted, ref } from "vue";
import { useSupabase } from "../../composables/useSupabase";

const { supabase } = useSupabase();

const carregando = ref(true);
const erroPainel = ref("");

const resumo = ref({
    totalEquipamentos: 0,
    totalItensEstoque: 0,
    totalReceptores: 0,
    movimentacoesHoje: 0,
    movimentacoesMes: 0,
    entregasMes: 0,
    devolucoesMes: 0,
});

const alertas = ref([]);
const ultimasMovimentacoes = ref([]);

const periodoMesTexto = computed(() => {
    const agora = new Date();
    return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(agora);
});

const taxaEntregaMes = computed(() => {
    if (!resumo.value.movimentacoesMes) return 0;
    return Math.round((resumo.value.entregasMes / resumo.value.movimentacoesMes) * 100);
});

const taxaDevolucaoMes = computed(() => {
    if (!resumo.value.movimentacoesMes) return 0;
    return Math.round((resumo.value.devolucoesMes / resumo.value.movimentacoesMes) * 100);
});

const formatarDataHora = (valor) => {
    if (!valor) return "-";
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return "-";

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(data);
};

const formatarData = (valor) => {
    if (!valor) return "-";
    const data = new Date(`${valor}T00:00:00`);
    if (Number.isNaN(data.getTime())) return "-";

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(data);
};

const normalizarTexto = (valor = "") =>
    String(valor)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

const diasAteValidade = (validade) => {
    if (!validade) return Number.POSITIVE_INFINITY;

    const dataValidade = new Date(`${validade}T00:00:00`);
    if (Number.isNaN(dataValidade.getTime())) return Number.POSITIVE_INFINITY;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const diffMs = dataValidade.getTime() - hoje.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const descreverRisco = (equipamento, quantidadeAtual) => {
    const quantidadeMinima = Number(equipamento?.quantidade_minima ?? 0);
    const diasValidade = diasAteValidade(equipamento?.validade_certificado);

    if (diasValidade < 0) {
        return {
            texto: "Certificado vencido",
            gravidade: 3,
            classe: "alert-tag--critico",
        };
    }

    if (quantidadeAtual < quantidadeMinima) {
        return {
            texto: "Abaixo do estoque mínimo",
            gravidade: 3,
            classe: "alert-tag--critico",
        };
    }

    if (diasValidade <= 30) {
        return {
            texto: "Certificado próximo do vencimento",
            gravidade: 2,
            classe: "alert-tag--aviso",
        };
    }

    return {
        texto: "No limite mínimo",
        gravidade: 1,
        classe: "alert-tag--atencao",
    };
};

const carregarResumo = async () => {
    const agora = new Date();
    const inicioHoje = new Date(agora);
    inicioHoje.setHours(0, 0, 0, 0);

    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

    const [
        equipamentosRes,
        estoqueRes,
        movHojeRes,
        movMesRes,
        alunosCountRes,
        funcionariosCountRes,
        visitantesCountRes,
    ] = await Promise.all([
        supabase.from("equipamento").select("id", { count: "exact", head: true }),
        supabase.from("estoque").select("quantidade"),
        supabase
            .from("movimentacao")
            .select("id", { count: "exact", head: true })
            .gte("data", inicioHoje.toISOString()),
        supabase
            .from("movimentacao")
            .select("tipo_movimentacao")
            .gte("data", inicioMes.toISOString()),
        supabase.from("aluno").select("id", { count: "exact", head: true }),
        supabase.from("funcionario").select("id", { count: "exact", head: true }),
        supabase.from("visitante").select("id", { count: "exact", head: true }),
    ]);

    if (equipamentosRes.error) throw equipamentosRes.error;
    if (estoqueRes.error) throw estoqueRes.error;
    if (movHojeRes.error) throw movHojeRes.error;
    if (movMesRes.error) throw movMesRes.error;
    if (alunosCountRes.error) throw alunosCountRes.error;
    if (funcionariosCountRes.error) throw funcionariosCountRes.error;
    if (visitantesCountRes.error) throw visitantesCountRes.error;

    const totalItensEstoque = (estoqueRes.data || []).reduce(
        (acc, item) => acc + Number(item?.quantidade ?? 0),
        0,
    );

    const movimentacoesMes = movMesRes.data || [];
    const entregasMes = movimentacoesMes.filter(
        (item) => normalizarTexto(item.tipo_movimentacao) === "entrega",
    ).length;
    const devolucoesMes = movimentacoesMes.filter(
        (item) => normalizarTexto(item.tipo_movimentacao) === "devolucao",
    ).length;

    resumo.value = {
        totalEquipamentos: equipamentosRes.count || 0,
        totalItensEstoque,
        totalReceptores:
            (alunosCountRes.count || 0) +
            (funcionariosCountRes.count || 0) +
            (visitantesCountRes.count || 0),
        movimentacoesHoje: movHojeRes.count || 0,
        movimentacoesMes: movimentacoesMes.length,
        entregasMes,
        devolucoesMes,
    };
};

const carregarAlertas = async () => {
    const { data, error } = await supabase
        .from("equipamento")
        .select("id, nome, classificacao, quantidade_minima, validade_certificado, estoque(quantidade)");

    if (error) throw error;

    const itensComAlerta = (data || [])
        .map((item) => {
            const quantidadeAtual = Number(item?.estoque?.[0]?.quantidade ?? 0);
            const quantidadeMinima = Number(item?.quantidade_minima ?? 0);
            const diasValidade = diasAteValidade(item?.validade_certificado);
            const alertaEstoque = quantidadeAtual <= quantidadeMinima;
            const alertaValidade = diasValidade <= 30;
            const precisaAlerta = alertaEstoque || alertaValidade;

            if (!precisaAlerta) return null;

            const risco = descreverRisco(item, quantidadeAtual);
            const detalhes = [];

            if (alertaEstoque) {
                detalhes.push(`Estoque: ${quantidadeAtual} (mínimo ${quantidadeMinima})`);
            }

            if (alertaValidade) {
                if (diasValidade < 0) {
                    detalhes.push(
                        `Validade: vencido em ${formatarData(item.validade_certificado)}`,
                    );
                } else {
                    detalhes.push(
                        `Validade: ${formatarData(item.validade_certificado)} (vence em ${diasValidade} dia(s))`,
                    );
                }
            }

            return {
                id: item.id,
                nome: item.nome || "Equipamento",
                classificacao: item.classificacao || "Sem classificação",
                quantidadeAtual,
                quantidadeMinima,
                risco,
                detalhes,
            };
        })
        .filter(Boolean)
        .sort((a, b) => b.risco.gravidade - a.risco.gravidade)
        .slice(0, 6);

    alertas.value = itensComAlerta;
};

const carregarUltimasMovimentacoes = async () => {
    const { data: movimentacoesData, error: movimentacoesError } = await supabase
        .from("movimentacao")
        .select("id, data, id_usuario, tipo_receptor, id_receptor, tipo_movimentacao")
        .order("data", { ascending: false })
        .limit(8);

    if (movimentacoesError) throw movimentacoesError;

    const listaMovimentacoes = movimentacoesData || [];

    if (!listaMovimentacoes.length) {
        ultimasMovimentacoes.value = [];
        return;
    }

    const idsMovimentacao = listaMovimentacoes.map((item) => item.id);
    const idsUsuarios = [...new Set(listaMovimentacoes.map((item) => item.id_usuario).filter(Boolean))];

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
            if (usuariosRpcError) {
                console.error(
                    "Erro ao carregar usuários da timeline via RPC:",
                    usuariosRpcError,
                );
            }

            const { data: usuariosFallbackData, error: usuariosFallbackError } = await supabase
                .from("usuario")
                .select("id, nome_completo")
                .in("id", idsUsuarios);

            if (usuariosFallbackError) {
                console.error(
                    "Erro ao carregar usuários da timeline via fallback:",
                    usuariosFallbackError,
                );
            } else {
                usuariosData = usuariosFallbackData || [];
            }
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
        {
            aluno: new Set(),
            funcionario: new Set(),
            visitante: new Set(),
        },
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
        mapaReceptores.set(`funcionario-${item.id}`, item.nome_completo || item.nome || "Receptor");
    });
    (visitantesRes.data || []).forEach((item) => {
        mapaReceptores.set(`visitante-${item.id}`, item.nome_completo || item.nome || "Receptor");
    });

    const totalPorMovimentacao = (itensMovimentacaoData || []).reduce((acc, item) => {
        const chave = String(item.id_movimentacao);
        acc[chave] = (acc[chave] || 0) + Number(item.quantidade || 0);
        return acc;
    }, {});

    ultimasMovimentacoes.value = listaMovimentacoes.map((mov) => {
        const usuario = mapaUsuarios.get(String(mov.id_usuario));
        const nomeReceptor =
            mapaReceptores.get(`${normalizarTexto(mov.tipo_receptor)}-${mov.id_receptor}`) || "Receptor";

        return {
            id: mov.id,
            data: mov.data,
            tipo: mov.tipo_movimentacao,
            usuario: usuario?.nome_completo || "Usuário",
            receptor: nomeReceptor,
            totalItens: totalPorMovimentacao[String(mov.id)] || 0,
        };
    });
};

const carregarDashboard = async () => {
    carregando.value = true;
    erroPainel.value = "";

    try {
        await Promise.all([
            carregarResumo(),
            carregarAlertas(),
            carregarUltimasMovimentacoes(),
        ]);
    } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        erroPainel.value = "Não foi possível carregar os dados da dashboard.";
    } finally {
        carregando.value = false;
    }
};

onMounted(() => {
    carregarDashboard();
});
</script>

<template>
    <section class="dashboard-page">
        <div class="hero">
            <div class="hero-content">
                <p class="eyebrow">Painel de controle</p>
                <h1>Visão geral do sistema de gestão de EPI</h1>
                <p class="hero-subtitle">
                    Acompanhe estoque, movimentações e alertas críticos em um só lugar.
                </p>
            </div>
            <button class="refresh-btn" type="button" @click="carregarDashboard">
                Atualizar dados
            </button>
        </div>

        <p v-if="erroPainel" class="feedback feedback--erro">{{ erroPainel }}</p>
        <p v-if="carregando" class="feedback">Carregando indicadores...</p>

        <div v-else class="dashboard-grid">
            <article class="metric-card">
                <p class="metric-label">Equipamentos cadastrados</p>
                <p class="metric-value">{{ resumo.totalEquipamentos }}</p>
            </article>

            <article class="metric-card">
                <p class="metric-label">Itens em estoque</p>
                <p class="metric-value">{{ resumo.totalItensEstoque }}</p>
            </article>

            <article class="metric-card">
                <p class="metric-label">Receptores ativos</p>
                <p class="metric-value">{{ resumo.totalReceptores }}</p>
            </article>

            <article class="metric-card">
                <p class="metric-label">Movimentações hoje</p>
                <p class="metric-value">{{ resumo.movimentacoesHoje }}</p>
            </article>
        </div>

        <div v-if="!carregando" class="content-grid">
            <article class="panel panel--activity">
                <div class="panel-header">
                    <h2>Atividade de {{ periodoMesTexto }}</h2>
                    <p>{{ resumo.movimentacoesMes }} movimentações no mês</p>
                </div>

                <div class="distribution">
                    <div class="distribution-row">
                        <div class="distribution-info">
                            <span>Entregas</span>
                            <strong>{{ resumo.entregasMes }}</strong>
                        </div>
                        <div class="bar-track">
                            <div class="bar-fill bar-fill--entrega" :style="{ width: `${taxaEntregaMes}%` }"></div>
                        </div>
                        <span class="bar-percent">{{ taxaEntregaMes }}%</span>
                    </div>

                    <div class="distribution-row">
                        <div class="distribution-info">
                            <span>Devoluções</span>
                            <strong>{{ resumo.devolucoesMes }}</strong>
                        </div>
                        <div class="bar-track">
                            <div class="bar-fill bar-fill--devolucao" :style="{ width: `${taxaDevolucaoMes}%` }"></div>
                        </div>
                        <span class="bar-percent">{{ taxaDevolucaoMes }}%</span>
                    </div>
                </div>

                <ul class="timeline" v-if="ultimasMovimentacoes.length">
                    <li v-for="mov in ultimasMovimentacoes" :key="mov.id" class="timeline-item">
                        <div class="timeline-badge" :class="{ 'timeline-badge--entrega': normalizarTexto(mov.tipo) === 'entrega' }">
                            {{ mov.tipo }}
                        </div>
                        <div class="timeline-content">
                            <p class="timeline-main">
                                <strong>{{ mov.usuario }}</strong> registrou para <strong>{{ mov.receptor }}</strong>
                            </p>
                            <p class="timeline-meta">
                                {{ formatarDataHora(mov.data) }} • {{ mov.totalItens }} item(ns)
                            </p>
                        </div>
                    </li>
                </ul>
                <p v-else class="empty">Sem movimentações recentes.</p>
            </article>

            <article class="panel panel--alerts">
                <div class="panel-header">
                    <h2>Alertas importantes</h2>
                    <p>{{ alertas.length }} item(ns) com atenção</p>
                </div>

                <ul v-if="alertas.length" class="alerts-list">
                    <li v-for="item in alertas" :key="item.id" class="alert-item">
                        <div>
                            <p class="alert-name">{{ item.nome }}</p>
                            <p class="alert-meta">{{ item.classificacao }}</p>
                            <p v-for="(detalhe, idx) in item.detalhes" :key="`${item.id}-${idx}`" class="alert-detail">
                                {{ detalhe }}
                            </p>
                        </div>
                        <span class="alert-tag" :class="item.risco.classe">{{ item.risco.texto }}</span>
                    </li>
                </ul>
                <p v-else class="empty">Nenhum alerta crítico no momento.</p>
            </article>
        </div>
    </section>
</template>

<style scoped>
.dashboard-page {
    margin-left: 0.5rem;
    margin-right: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
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

.refresh-btn {
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

.refresh-btn:hover {
    background: rgba(255, 255, 255, 0.28);
}

.feedback {
    margin: 0;
    color: #4c5670;
    font-size: 0.92rem;
}

.feedback--erro {
    color: #b42318;
}

.dashboard-grid {
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

.content-grid {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 0.85rem;
}

.panel {
    border-radius: 20px;
    border: 1px solid #e8ecf5;
    background: #fff;
    box-shadow: 0 10px 22px rgba(30, 44, 73, 0.08);
    padding: 1rem;
    height: 340px;
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

.distribution {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-bottom: 0.9rem;
}

.distribution-row {
    display: grid;
    grid-template-columns: 140px 1fr 48px;
    gap: 0.55rem;
    align-items: center;
}

.distribution-info {
    display: flex;
    justify-content: space-between;
    gap: 0.45rem;
    color: #2c3a59;
    font-size: 0.84rem;
}

.bar-track {
    height: 10px;
    border-radius: 999px;
    background: #edf1f8;
    overflow: hidden;
}

.bar-fill {
    height: 100%;
    border-radius: 999px;
}

.bar-fill--entrega {
    background: linear-gradient(90deg, #f9a45b 0%, #f6821f 100%);
}

.bar-fill--devolucao {
    background: linear-gradient(90deg, #8ca5d8 0%, #5a77b3 100%);
}

.bar-percent {
    font-size: 0.76rem;
    color: #62708e;
}

.timeline {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    max-height: 255px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: #f6821f #e8edf6;
}

.timeline::-webkit-scrollbar {
    width: 8px;
}

.timeline::-webkit-scrollbar-track {
    background: #edf1f8;
    border-radius: 999px;
}

.timeline::-webkit-scrollbar-thumb {
    background: #f6821f;
    border-radius: 999px;
}

.timeline::-webkit-scrollbar-thumb:hover {
    background: #e27410;
}

.timeline-item {
    border: 1px solid #edf0f7;
    border-radius: 14px;
    padding: 0.65rem;
    display: flex;
    gap: 0.7rem;
    align-items: flex-start;
    background: #fbfcff;
}

.timeline-badge {
    border-radius: 999px;
    padding: 0.2rem 0.55rem;
    background: #e7eefb;
    color: #3a4f7d;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: capitalize;
    white-space: nowrap;
}

.timeline-badge--entrega {
    background: #fff0e2;
    color: #be5400;
}

.timeline-main {
    margin: 0;
    color: #24324f;
    font-size: 0.85rem;
}

.timeline-meta {
    margin: 0.2rem 0 0;
    color: #687592;
    font-size: 0.76rem;
}

.alerts-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    max-height: 310px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: #f6821f #e8edf6;
}

.alerts-list::-webkit-scrollbar {
    width: 8px;
}

.alerts-list::-webkit-scrollbar-track {
    background: #edf1f8;
    border-radius: 999px;
}

.alerts-list::-webkit-scrollbar-thumb {
    background: #f6821f;
    border-radius: 999px;
}

.alerts-list::-webkit-scrollbar-thumb:hover {
    background: #e27410;
}

.alert-item {
    border: 1px solid #eceff6;
    border-radius: 14px;
    padding: 0.65rem;
    display: flex;
    justify-content: space-between;
    gap: 0.8rem;
    align-items: flex-start;
}

.alert-name {
    margin: 0;
    color: #202e4a;
    font-weight: 700;
    font-size: 0.88rem;
}

.alert-meta {
    margin: 0.15rem 0 0;
    color: #67728f;
    font-size: 0.76rem;
}

.alert-detail {
    margin: 0.15rem 0 0;
    color: #4f5c79;
    font-size: 0.75rem;
}

.alert-tag {
    border-radius: 999px;
    padding: 0.28rem 0.6rem;
    font-size: 0.72rem;
    white-space: nowrap;
    font-weight: 700;
}

.alert-tag--critico {
    background: #fee4e2;
    color: #b42318;
}

.alert-tag--aviso {
    background: #fff4dd;
    color: #a15c00;
}

.alert-tag--atencao {
    background: #e9f0ff;
    color: #2f4f8f;
}

.empty {
    margin: 0;
    font-size: 0.84rem;
    color: #6f7b98;
}

@media (max-width: 1100px) {
    .dashboard-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .content-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 760px) {
    .hero {
        flex-direction: column;
        align-items: flex-start;
    }

    .refresh-btn {
        width: 100%;
    }

    .distribution-row {
        grid-template-columns: 1fr;
        gap: 0.32rem;
    }

    .bar-percent {
        justify-self: end;
    }
}

@media (max-width: 560px) {
    .dashboard-page {
        padding: 0.5rem 0.5rem 1rem;
    }

    .dashboard-grid {
        grid-template-columns: 1fr;
    }

    .hero {
        border-radius: 18px;
        padding: 0.9rem;
    }

    .panel {
        border-radius: 16px;
        padding: 0.8rem;
    }

    .panel-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .alert-item {
        flex-direction: column;
    }
}
</style>