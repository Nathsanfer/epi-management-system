<template>
  <section class="page">
    <div class="toolbar">
      <button class="btn" type="button" @click="abrirModalCadastroMovimentacao">
        Registrar Nova Movimentação
      </button>
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
          :class="{ 'filter-btn--active': filtroTipo === filtro.value }"
          @click="filtroTipo = filtro.value"
        >
          {{ filtro.label }}
        </button>
      </div>
    </div>

    <div class="container-scroll">
      <ul class="list">
        <li class="element" v-for="mov in movimentacoesFiltradas" :key="mov.id">
          <div class="movement-header">
            <p class="movement-id">Movimentacao #{{ mov.id }}</p>
            <div class="movement-meta">
              <span
                class="status-chip"
                :class="{ 'status-chip--success': normalizarTexto(mov.tipo_movimentacao) === 'entrega' }"
              >
                {{ mov.tipo_movimentacao }}
              </span>
              <span class="date-chip">{{ formatarDataBR(mov.data) }}</span>
            </div>
          </div>

          <div class="moviment-participants">
            <div class="person-card">
              <p class="person-label">Registrado por</p>
              <div class="person-content">
                <div class="image-participant">
                  <img
                    :src="mov.usuario_imagem || fallbackImage"
                    alt="Foto do operador"
                    @error="aplicarFallbackImagem"
                  />
                </div>
                <div class="info-participant">
                  <p class="name">{{ mov.usuario_nome }}</p>
                  <p class="badge-tipo">{{ mov.usuario_funcao }}</p>
                </div>
              </div>
            </div>

            <div class="movement-icon" aria-hidden="true">
              <img src="../../assets/arrow-right.png" alt="" />
            </div>

            <div class="person-card">
              <p class="person-label">Recebido por</p>
              <div class="person-content">
                <div class="image-participant">
                  <img
                    :src="mov.receptor_imagem || fallbackImage"
                    alt="Foto do funcionario"
                    @error="aplicarFallbackImagem"
                  />
                </div>
                <div class="info-participant">
                  <p class="name">{{ mov.receptor_nome }}</p>
                  <p class="phone">{{ mov.receptor_telefone || '-' }}</p>
                  <p class="badge-tipo" :class="classeTipoReceptor(mov.tipo_receptor)">
                    {{ mov.tipo_receptor }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="items-wrapper">
            <div class="items-header">
              <p class="items-title">Itens movimentados</p>
              <span class="items-count">{{ mov.itens.length }} itens</span>
            </div>

            <div class="moviment-items">
              <div
                class="item"
                v-for="(item, idx) in mov.itens"
                :key="`${mov.id}-${item.equipamento_nome}-${idx}`"
              >
                <p class="name-equipment">{{ item.equipamento_nome }}</p>
                <p class="classification">{{ item.equipamento_classificacao }}</p>
                <p class="quantity">Qtd: {{ item.quantidade }}</p>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <CadastroMovimentacaoModal
      :open="modalCadastroMovimentacao"
      :receptores="receptores"
      :equipamentos="equipamentosDisponiveis"
      :carregando-receptores="carregandoReceptores"
      :carregando-equipamentos="carregandoEquipamentos"
      @close="fecharModalCadastroMovimentacao"
      @created="carregarMovimentacoes"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useSupabase } from '../../composables/useSupabase';
import CadastroMovimentacaoModal from '../../components/CadastroMovimentacaoModal.vue';

const { supabase, session } = useSupabase();

const fallbackImage = 'https://placehold.co/120x120?text=Foto';
const movimentacoes = ref([]);
const movimentacoesBase = ref([]);
const itensMovimentacaoBase = ref([]);
const usuariosMovimentacao = ref([]);
const perfilUsuarioLogado = ref({
  nome: '',
  funcao: 'Operador',
  imagem: '',
});
const pesquisa = ref('');
const filtroTipo = ref('todas');
const modalCadastroMovimentacao = ref(false);
const receptores = ref([]);
const carregandoReceptores = ref(false);
const equipamentosDisponiveis = ref([]);
const carregandoEquipamentos = ref(false);
const filtros = computed(() => [
  { value: 'todas', label: 'Todas' },
  { value: 'entrega', label: 'Entregas' },
  { value: 'devolucao', label: 'Devoluções' },
]);

const abrirModalCadastroMovimentacao = () => {
  modalCadastroMovimentacao.value = true;
};

const fecharModalCadastroMovimentacao = () => {
  modalCadastroMovimentacao.value = false;
};

const normalizarTexto = (valor = '') =>
  String(valor)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const formatarDataBR = (valorData) => {
  if (!valorData) return '-';
  const data = new Date(valorData);
  if (Number.isNaN(data.getTime())) return '-';
  return new Intl.DateTimeFormat('pt-BR').format(data);
};

const aplicarFallbackImagem = (event) => {
  event.target.src = fallbackImage;
};

const classeTipoReceptor = (tipo) => {
  const tipoNormalizado = normalizarTexto(tipo);

  if (tipoNormalizado === 'aluno') return 'badge-aluno';
  if (tipoNormalizado === 'visitante') return 'badge-visitante';
  return 'badge-funcionario';
};

const carregarReceptores = async () => {
  carregandoReceptores.value = true;

  const [alunosRes, funcionariosRes, visitantesRes] = await Promise.all([
    supabase.from('aluno').select('*'),
    supabase.from('funcionario').select('*'),
    supabase.from('visitante').select('*'),
  ]);

  if (alunosRes.error) {
    console.error('Erro ao carregar alunos:', alunosRes.error);
  }
  if (funcionariosRes.error) {
    console.error('Erro ao carregar funcionários:', funcionariosRes.error);
  }
  if (visitantesRes.error) {
    console.error('Erro ao carregar visitantes:', visitantesRes.error);
  }

  const mapearLista = (lista = [], tipo) =>
    (lista || []).map((item) => ({
      key: `${normalizarTexto(tipo)}-${item.id}`,
      id_receptor: item.id,
      nome_completo: item.nome_completo || item.nome || 'Sem nome',
      telefone: item.telefone || '',
      imagem: item.imagem || '',
      tipo,
    }));

  receptores.value = [
    ...mapearLista(alunosRes.data, 'Aluno'),
    ...mapearLista(funcionariosRes.data, 'Funcionário'),
    ...mapearLista(visitantesRes.data, 'Visitante'),
  ];

  reconstruirMovimentacoesExibidas();
  carregandoReceptores.value = false;
};

const carregarEquipamentosModal = async () => {
  carregandoEquipamentos.value = true;

  const { data, error } = await supabase
    .from('equipamento')
    .select('id, nome, classificacao, imagem')
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao carregar equipamentos:', error);
    equipamentosDisponiveis.value = [];
    carregandoEquipamentos.value = false;
    return;
  }

  equipamentosDisponiveis.value = data || [];
  reconstruirMovimentacoesExibidas();
  carregandoEquipamentos.value = false;
};

const agruparMovimentacoes = (registros = []) => {
  const agrupadas = new Map();

  registros.forEach((registro) => {
    if (!agrupadas.has(registro.id)) {
      agrupadas.set(registro.id, {
        id: registro.id,
        data: registro.data,
        tipo_movimentacao: registro.tipo_movimentacao,
        tipo_receptor: registro.tipo_receptor,
        id_receptor: registro.id_receptor,
        usuario_nome: registro.usuario_nome,
        usuario_funcao: registro.usuario_funcao,
        usuario_imagem: registro.usuario_imagem,
        receptor_nome: registro.receptor_nome,
        receptor_telefone: registro.receptor_telefone,
        receptor_imagem: registro.receptor_imagem,
        itens: [],
      });
    }

    agrupadas.get(registro.id).itens.push({
      equipamento_nome: registro.equipamento_nome,
      equipamento_classificacao: registro.equipamento_classificacao,
      quantidade: registro.quantidade,
    });
  });

  return Array.from(agrupadas.values());
};

const reconstruirMovimentacoesExibidas = () => {
  const mapaUsuarios = new Map(
    usuariosMovimentacao.value.map((usuario) => [String(usuario.id), usuario]),
  );

  const mapaReceptores = new Map(
    receptores.value.map((receptor) => [
      `${normalizarTexto(receptor.tipo)}-${String(receptor.id_receptor)}`,
      receptor,
    ]),
  );

  const mapaEquipamentos = new Map(
    equipamentosDisponiveis.value.map((equipamento) => [String(equipamento.id), equipamento]),
  );

  const itensPorMovimentacao = new Map();

  itensMovimentacaoBase.value.forEach((item) => {
    const chave = String(item.id_movimentacao);

    if (!itensPorMovimentacao.has(chave)) {
      itensPorMovimentacao.set(chave, []);
    }

    itensPorMovimentacao.get(chave).push(item);
  });

  movimentacoes.value = movimentacoesBase.value.map((movimentacao) => {
    const usuario = mapaUsuarios.get(String(movimentacao.id_usuario));
    const receptor = mapaReceptores.get(
      `${normalizarTexto(movimentacao.tipo_receptor)}-${String(movimentacao.id_receptor)}`,
    );

    const itens = (itensPorMovimentacao.get(String(movimentacao.id)) || []).map((item) => {
      const equipamento = mapaEquipamentos.get(String(item.id_equipamento));

      return {
        equipamento_nome: equipamento?.nome || equipamento?.descricao || 'Equipamento',
        equipamento_classificacao: equipamento?.classificacao || 'Sem classificação',
        quantidade: item.quantidade,
      };
    });

    return {
      id: movimentacao.id,
      data: movimentacao.data,
      tipo_movimentacao: movimentacao.tipo_movimentacao,
      tipo_receptor: movimentacao.tipo_receptor,
      id_receptor: movimentacao.id_receptor,
      usuario_nome: usuario?.nome_completo || usuario?.nome || 'Usuário não identificado',
      usuario_funcao: usuario?.funcao || 'Operador',
      usuario_imagem: usuario?.imagem || '',
      receptor_nome: receptor?.nome_completo || movimentacao.receptor_nome || '',
      receptor_telefone: receptor?.telefone || movimentacao.receptor_telefone || '',
      receptor_imagem: receptor?.imagem || movimentacao.receptor_imagem || '',
      itens,
    };
  });
};

const carregarMovimentacoes = async () => {
  const [{ data: movimentacoesData, error: erroMovimentacoes }, { data: itensData, error: erroItens }] =
    await Promise.all([
      supabase
        .from('movimentacao')
        .select('id, data, id_usuario, tipo_receptor, id_receptor, tipo_movimentacao')
        .order('data', { ascending: false }),
      supabase.from('item_movimentacao').select('id_movimentacao, id_equipamento, quantidade'),
    ]);

  if (erroMovimentacoes) {
    console.error('Erro ao buscar movimentacoes:', erroMovimentacoes);
    movimentacoes.value = [];
    movimentacoesBase.value = [];
    itensMovimentacaoBase.value = [];
    return;
  }

  if (erroItens) {
    console.error('Erro ao buscar itens da movimentacao:', erroItens);
  }

  movimentacoesBase.value = movimentacoesData || [];
  itensMovimentacaoBase.value = itensData || [];
  reconstruirMovimentacoesExibidas();
};

const carregarUsuariosMovimentacao = async () => {
  const { data: dataComEmailAuth, error: erroComEmailAuth } = await supabase
    .rpc('listar_usuarios_com_email');

  if (!erroComEmailAuth && Array.isArray(dataComEmailAuth)) {
    usuariosMovimentacao.value = dataComEmailAuth.map((usuario) => ({
      id: usuario.id,
      nome_completo: usuario.nome_completo || usuario.nome || 'Usuário não identificado',
      funcao: usuario.funcao || 'Operador',
      imagem: usuario.imagem || '',
      email: usuario.email || '',
    }));
    reconstruirMovimentacoesExibidas();
    return;
  }

  if (erroComEmailAuth) {
    console.error('Erro ao carregar usuários para movimentação via RPC:', erroComEmailAuth);
  }

  const { data, error } = await supabase
    .from('usuario')
    .select('id, nome_completo, funcao, imagem');

  if (error) {
    console.error('Erro ao carregar usuários para movimentação:', error);
    usuariosMovimentacao.value = [];
    return;
  }

  usuariosMovimentacao.value = (data || []).map((usuario) => ({
    id: usuario.id,
    nome_completo: usuario.nome_completo || usuario.nome || 'Usuário não identificado',
    funcao: usuario.funcao || 'Operador',
    imagem: usuario.imagem || '',
  }));
  reconstruirMovimentacoesExibidas();
};

const enriquecerMovimentacoesComReceptores = () => {
  const mapaReceptores = new Map(
    receptores.value.map((receptor) => [
      `${normalizarTexto(receptor.tipo)}-${String(receptor.id_receptor)}`,
      receptor,
    ]),
  );

  movimentacoes.value = movimentacoes.value.map((movimentacao) => {
    if (movimentacao.receptor_nome && movimentacao.receptor_telefone && movimentacao.receptor_imagem) {
      return movimentacao;
    }

    const receptorEncontrado = mapaReceptores.get(
      `${normalizarTexto(movimentacao.tipo_receptor)}-${String(movimentacao.id_receptor ?? '')}`,
    );

    if (!receptorEncontrado) {
      return movimentacao;
    }

    return {
      ...movimentacao,
      receptor_nome: movimentacao.receptor_nome || receptorEncontrado.nome_completo,
      receptor_telefone: movimentacao.receptor_telefone || receptorEncontrado.telefone,
      receptor_imagem: movimentacao.receptor_imagem || receptorEncontrado.imagem,
    };
  });
};

const carregarPerfilUsuarioLogado = async () => {
  const user = session.value?.user;

  if (!user?.id) {
    perfilUsuarioLogado.value = {
      nome: 'Usuário logado',
      funcao: 'Operador',
      imagem: '',
    };
    return;
  }

  const { data, error } = await supabase
    .from('usuario')
    .select('nome_completo, funcao, imagem')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Erro ao carregar perfil do usuário:', error);
  }

  const nomeDaSessao =
    user.user_metadata?.nome_completo ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Usuário logado';

  perfilUsuarioLogado.value = {
    nome: data?.nome_completo || nomeDaSessao,
    funcao: data?.funcao || user.user_metadata?.funcao || 'Operador',
    imagem: data?.imagem || user.user_metadata?.imagem || '',
  };
};

const movimentacoesFiltradas = computed(() => {
  const termoPesquisa = normalizarTexto(pesquisa.value);
  const tipoSelecionado = normalizarTexto(filtroTipo.value);

  return movimentacoes.value.filter((mov) => {
    const nomeUsuario = normalizarTexto(mov.usuario_nome);
    const nomeReceptor = normalizarTexto(mov.receptor_nome);
    const tipoMovimentacao = normalizarTexto(mov.tipo_movimentacao);

    const correspondePesquisa =
      !termoPesquisa ||
      nomeUsuario.includes(termoPesquisa) ||
      nomeReceptor.includes(termoPesquisa);

    const correspondeTipo =
      tipoSelecionado === 'todas' || tipoMovimentacao === tipoSelecionado;

    return correspondePesquisa && correspondeTipo;
  });
});

onMounted(() => {
  carregarPerfilUsuarioLogado();
  carregarUsuariosMovimentacao();
  carregarReceptores();
  carregarEquipamentosModal();
  carregarMovimentacoes();
});
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 98%;
  margin-left: 0.5rem;
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

.btn:hover {
  background-color: #ea7717;
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

.container-scroll {
  margin-top: 1rem;
  width: 98%;
  margin-left: 0.5rem;
  max-height: 490px;
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
  background: linear-gradient(160deg, #ffffff 0%, #f9fbff 65%, #fff7ef 100%);
  border: 1px solid #eceef4;
  border-radius: 22px;
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.25rem;
  box-shadow:
    0 10px 24px rgba(20, 31, 56, 0.08),
    0 2px 6px rgba(20, 31, 56, 0.05);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.element:hover {
  border-color: #e2d8cd;
  box-shadow:
    0 16px 36px rgba(20, 31, 56, 0.15),
    0 4px 12px rgba(20, 31, 56, 0.06);
  transform: translateY(-2px);
}

.movement-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid #e9edf5;
}

.movement-id {
  margin: 0;
  font-weight: 700;
  font-size: 0.92rem;
  color: #192640;
  letter-spacing: 0.15px;
}

.movement-meta {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.status-chip,
.date-chip {
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.status-chip {
  background: linear-gradient(135deg, #fff0e3 0%, #ffd4ad 100%);
  color: #b34a00;
  border: 1px solid #ffc38f;
  box-shadow: 0 2px 6px rgba(246, 130, 31, 0.18);
}

.status-chip--success {
  background: linear-gradient(135deg, #ffe8d2 0%, #ffc993 100%);
  color: #9c3f00;
  border: 1px solid #ffb976;
}

.date-chip {
  background-color: #f3f5fa;
  color: #3f4960;
  border: 1px solid #e2e6ef;
}

.moviment-participants {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}

.person-card {
  flex: 1;
  border: 1px solid #e7ebf3;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
  padding: 0.7rem;
}

.person-label {
  margin: 0 0 0.55rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #57617c;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.person-content {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.image-participant img {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f1f4fa;
}

.info-participant {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
}

.name {
  margin: 0;
  font-size: 1rem;
  color: #23314f;
  font-weight: 700;
}

.phone {
  margin: 0.15rem 0 0;
  font-size: 0.85rem;
  color: #5d6883;
}

.badge-tipo {
  margin: 0.45rem 0 0;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  color: #e65100;
}

.badge-tipo--neutral {
  background: #eaf0ff;
  color: #2a4ba0;
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

.movement-icon {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: #f2f5fc;
  border: 1px solid #e2e8f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.movement-icon img {
  width: 22px;
  height: 22px;
  opacity: 0.85;
}

.items-wrapper {
  border: 1px solid #e7ebf3;
  border-radius: 16px;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.6);
}

.items-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.65rem;
}

.items-title {
  margin: 0;
  color: #1b2740;
  font-size: 0.95rem;
  font-weight: 700;
}

.items-count {
  font-size: 0.75rem;
  color: #5c6883;
  background: #f2f5fb;
  border: 1px solid #e3e8f4;
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
}

.moviment-items {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.item {
  background: #ffffff;
  border: 1px solid #e7ebf4;
  border-radius: 12px;
  padding: 0.65rem 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.name-equipment {
  margin: 0;
  font-size: 1rem;
  color: #25324c;
  width: 45%;
  text-align: left;
  font-weight: 700;
}

.classification {
  margin: 0;
  font-size: 0.95rem;
  color: #596583;
  width: 30%;
  text-align: center;
}

.quantity {
  margin: 0;
  font-size: 0.95rem;
  color: #3e4b67;
  width: 25%;
  text-align: right;
  font-weight: 700;
}

@media (max-width: 960px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .filters {
    overflow-x: auto;
    padding-bottom: 0.2rem;
  }

  .filter-btn {
    white-space: nowrap;
  }

  .moviment-participants {
    flex-direction: column;
    align-items: stretch;
  }

  .movement-icon {
    transform: rotate(90deg);
    align-self: center;
  }

  .item {
    flex-direction: column;
    align-items: flex-start;
  }

  .name-equipment,
  .classification,
  .quantity {
    width: 100%;
    text-align: left;
  }

}

@media (max-width: 520px) {
  .search-input {
    min-width: 0;
  }

  .element {
    width: 94%;
    padding: 0.95rem;
  }

  .movement-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .movement-meta {
    flex-wrap: wrap;
  }
}
</style>
