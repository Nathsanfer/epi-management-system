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

    <div
      class="container_modal"
      v-if="modalCadastroMovimentacao"
      @click="fecharModalCadastroMovimentacao"
    >
      <div class="modal_content" @click.stop>
        <div class="modal_inputs">
          <h2 class="modal_title">Cadastro de Nova Movimentação</h2>
          <p class="modal_step_text">Etapa {{ etapaCadastroMovimentacao }} de 2</p>

          <template v-if="etapaCadastroMovimentacao === 1">
            <div class="container_input2">
              <div class="container_input1">
                <label for="tipo-movimentacao" class="label">Tipo de movimentação</label>
                <select id="tipo-movimentacao" class="select" v-model="novoTipoMovimentacao">
                  <option value="Entrega">Entrega</option>
                  <option value="Devolução">Devolução</option>
                </select>
              </div>
            </div>

            <div class="container_input2">
              <div class="container_input1">
                <label for="tipo-receptor" class="label">Tipo de receptor</label>
                <select
                  id="tipo-receptor"
                  class="select"
                  v-model="novoTipoReceptor"
                  @change="limparSelecaoReceptor"
                >
                  <option value="Aluno">Aluno</option>
                  <option value="Funcionário">Funcionário</option>
                  <option value="Visitante">Visitante</option>
                </select>
              </div>

              <div class="container_input1">
                <label class="label">Receptor selecionado</label>
                <input
                  type="text"
                  class="input"
                  :value="receptorSelecionadoNome"
                  disabled
                />
              </div>
            </div>

            <div class="receptor_list_wrapper">
              <p class="label">Selecione o receptor</p>

              <input
                type="search"
                class="input"
                placeholder="Buscar receptor por nome ou telefone"
                v-model="pesquisaReceptor"
              />

              <p v-if="carregandoReceptores" class="list_hint">Carregando receptores...</p>
              <p v-else-if="!receptoresFiltrados.length" class="list_hint">
                Nenhum receptor encontrado para este tipo.
              </p>

              <div v-else class="receptor_list">
                <button
                  v-for="receptor in receptoresFiltrados"
                  :key="receptor.key"
                  type="button"
                  class="receptor_card"
                  :class="{ 'receptor_card--selected': receptorSelecionadoKey === receptor.key }"
                  @click="selecionarReceptor(receptor)"
                >
                  <img
                    class="receptor_avatar"
                    :src="receptor.imagem || fallbackImage"
                    :alt="`Foto de ${receptor.nome_completo}`"
                    @error="aplicarFallbackImagem"
                  />
                  <div class="receptor_info">
                    <p class="receptor_name">{{ receptor.nome_completo }}</p>
                    <div class="receptor_meta_row">
                      <span class="receptor_type_badge" :class="classeTipoReceptorCard(receptor.tipo)">
                        {{ receptor.tipo }}
                      </span>
                      <p class="receptor_meta">{{ receptor.telefone || '-' }}</p>
                    </div>
                  </div>
                  <span class="receptor_select_state">
                    {{ receptorSelecionadoKey === receptor.key ? 'Selecionado' : 'Selecionar' }}
                  </span>
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="equipamento_list_wrapper">
              <p class="label">Selecione os equipamentos</p>

              <input
                type="search"
                class="input"
                placeholder="Buscar equipamento por nome ou classificação"
                v-model="pesquisaEquipamento"
              />

              <p v-if="carregandoEquipamentos" class="list_hint">Carregando equipamentos...</p>
              <p v-else-if="!equipamentosFiltradosModal.length" class="list_hint">
                Nenhum equipamento encontrado.
              </p>

              <div v-else class="equipamento_list">
                <div
                  v-for="equipamento in equipamentosFiltradosModal"
                  :key="equipamento.id"
                  class="equipamento_card"
                  :class="{ 'equipamento_card--selected': equipamentoEstaSelecionado(equipamento.id) }"
                >
                  <button
                    type="button"
                    class="equipamento_card_main"
                    @click="alternarSelecaoEquipamento(equipamento)"
                  >
                    <img
                      class="equipamento_avatar"
                      :src="equipamento.imagem || fallbackImage"
                      :alt="`Imagem de ${equipamento.nome}`"
                      @error="aplicarFallbackImagem"
                    />
                    <div class="equipamento_info">
                      <p class="equipamento_name">{{ equipamento.nome }}</p>
                      <p class="equipamento_meta">{{ equipamento.classificacao || 'Sem classificação' }}</p>
                    </div>
                    <span class="receptor_select_state">
                      {{ equipamentoEstaSelecionado(equipamento.id) ? 'Selecionado' : 'Selecionar' }}
                    </span>
                  </button>

                  <div
                    v-if="equipamentoEstaSelecionado(equipamento.id)"
                    class="equipamento_quantity"
                  >
                    <label class="label">Quantidade</label>
                    <input
                      type="number"
                      min="1"
                      class="input"
                      :value="obterQuantidadeSelecionada(equipamento.id)"
                      @input="atualizarQuantidadeEquipamento(equipamento.id, $event.target.value)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>

          <p v-if="erroCadastroMovimentacao" class="cadastro_feedback cadastro_feedback--erro">
            {{ erroCadastroMovimentacao }}
          </p>
          <p v-if="sucessoCadastroMovimentacao" class="cadastro_feedback cadastro_feedback--sucesso">
            {{ sucessoCadastroMovimentacao }}
          </p>
        </div>

        <div class="modal_actions">
          <button
            class="modal_btn modal_btn--secondary"
            type="button"
            @click="fecharModalCadastroMovimentacao"
          >
            Cancelar
          </button>

          <button
            v-if="etapaCadastroMovimentacao === 2"
            class="modal_btn modal_btn--secondary"
            type="button"
            @click="voltarEtapaCadastro"
          >
            Voltar
          </button>

          <button
            v-if="etapaCadastroMovimentacao === 1"
            class="modal_btn"
            type="button"
            @click="avancarEtapaCadastro"
          >
            Próxima etapa
          </button>

          <button
            v-else
            class="modal_btn"
            type="button"
            :disabled="salvandoCadastroMovimentacao"
            @click="cadastrarNovaMovimentacao"
          >
            {{ salvandoCadastroMovimentacao ? 'Cadastrando...' : 'Cadastrar movimentação' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useSupabase } from '../../composables/useSupabase';

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
const etapaCadastroMovimentacao = ref(1);
const novoTipoMovimentacao = ref('Entrega');
const novoTipoReceptor = ref('Funcionário');
const novoReceptorNome = ref('');
const novoReceptorTelefone = ref('');
const receptorSelecionadoId = ref(null);
const receptorSelecionadoKey = ref(null);
const pesquisaReceptor = ref('');
const receptores = ref([]);
const carregandoReceptores = ref(false);
const pesquisaEquipamento = ref('');
const equipamentosDisponiveis = ref([]);
const carregandoEquipamentos = ref(false);
const novosItensMovimentacao = ref([]);
const salvandoCadastroMovimentacao = ref(false);
const erroCadastroMovimentacao = ref('');
const sucessoCadastroMovimentacao = ref('');
const filtros = computed(() => [
  { value: 'todas', label: 'Todas' },
  { value: 'entrega', label: 'Entregas' },
  { value: 'devolucao', label: 'Devoluções' },
]);

const receptoresFiltrados = computed(() => {
  const tipoSelecionado = normalizarTexto(novoTipoReceptor.value);
  const termoBusca = normalizarTexto(pesquisaReceptor.value);

  return receptores.value.filter((item) => {
    const mesmoTipo = normalizarTexto(item.tipo) === tipoSelecionado;
    const textoBusca = normalizarTexto(`${item.nome_completo} ${item.telefone || ''}`);
    const bateBusca = !termoBusca || textoBusca.includes(termoBusca);

    return mesmoTipo && bateBusca;
  });
});

const receptorSelecionadoNome = computed(() => {
  if (!receptorSelecionadoKey.value) return 'Nenhum receptor selecionado';

  const receptorSelecionado = receptores.value.find(
    (item) => item.key === receptorSelecionadoKey.value,
  );

  return receptorSelecionado?.nome_completo || 'Nenhum receptor selecionado';
});

const equipamentosFiltradosModal = computed(() => {
  const termoBusca = normalizarTexto(pesquisaEquipamento.value);

  return equipamentosDisponiveis.value.filter((item) => {
    const textoBusca = normalizarTexto(`${item.nome || ''} ${item.classificacao || ''}`);
    return !termoBusca || textoBusca.includes(termoBusca);
  });
});

const resetarFormularioMovimentacao = () => {
  etapaCadastroMovimentacao.value = 1;
  novoTipoMovimentacao.value = 'Entrega';
  novoTipoReceptor.value = 'Funcionário';
  novoReceptorNome.value = '';
  novoReceptorTelefone.value = '';
  receptorSelecionadoId.value = null;
  receptorSelecionadoKey.value = null;
  pesquisaReceptor.value = '';
  pesquisaEquipamento.value = '';
  novosItensMovimentacao.value = [];
};

const abrirModalCadastroMovimentacao = () => {
  modalCadastroMovimentacao.value = true;
  erroCadastroMovimentacao.value = '';
  sucessoCadastroMovimentacao.value = '';
};

const fecharModalCadastroMovimentacao = () => {
  modalCadastroMovimentacao.value = false;
  erroCadastroMovimentacao.value = '';
  sucessoCadastroMovimentacao.value = '';
  salvandoCadastroMovimentacao.value = false;
  resetarFormularioMovimentacao();
};

const avancarEtapaCadastro = () => {
  erroCadastroMovimentacao.value = '';

  if (!novoReceptorNome.value.trim()) {
    erroCadastroMovimentacao.value = 'Informe o nome do receptor.';
    return;
  }

  etapaCadastroMovimentacao.value = 2;
};

const voltarEtapaCadastro = () => {
  erroCadastroMovimentacao.value = '';
  etapaCadastroMovimentacao.value = 1;
};

const equipamentoEstaSelecionado = (equipamentoId) =>
  novosItensMovimentacao.value.some((item) => item.equipamento_id === equipamentoId);

const obterQuantidadeSelecionada = (equipamentoId) => {
  const item = novosItensMovimentacao.value.find(
    (registro) => registro.equipamento_id === equipamentoId,
  );
  return item?.quantidade ?? 1;
};

const alternarSelecaoEquipamento = (equipamento) => {
  const index = novosItensMovimentacao.value.findIndex(
    (item) => item.equipamento_id === equipamento.id,
  );

  if (index >= 0) {
    novosItensMovimentacao.value.splice(index, 1);
    return;
  }

  novosItensMovimentacao.value.push({
    equipamento_id: equipamento.id,
    equipamento_nome: equipamento.nome,
    equipamento_classificacao: equipamento.classificacao || 'Sem classificação',
    quantidade: 1,
  });
};

const atualizarQuantidadeEquipamento = (equipamentoId, quantidade) => {
  const item = novosItensMovimentacao.value.find(
    (registro) => registro.equipamento_id === equipamentoId,
  );

  if (!item) return;

  const quantidadeNumerica = Number(quantidade);
  item.quantidade = Number.isFinite(quantidadeNumerica) && quantidadeNumerica > 0 ? quantidadeNumerica : 1;
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

const normalizarTipoReceptor = (valor) => {
  const tipo = normalizarTexto(valor);

  if (tipo === 'funcionario') return 'Funcionário';
  if (tipo === 'visitante') return 'Visitante';
  return 'Aluno';
};

const classeTipoReceptorCard = (tipo) => {
  const tipoNormalizado = normalizarTexto(tipo);

  if (tipoNormalizado === 'aluno') return 'receptor_type_badge--aluno';
  if (tipoNormalizado === 'visitante') return 'receptor_type_badge--visitante';
  return 'receptor_type_badge--funcionario';
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

const limparSelecaoReceptor = () => {
  receptorSelecionadoId.value = null;
  receptorSelecionadoKey.value = null;
  novoReceptorNome.value = '';
  novoReceptorTelefone.value = '';
  pesquisaReceptor.value = '';
};

const selecionarReceptor = (receptor) => {
  receptorSelecionadoId.value = receptor.id_receptor;
  receptorSelecionadoKey.value = receptor.key;
  novoTipoReceptor.value = normalizarTipoReceptor(receptor.tipo);
  novoReceptorNome.value = receptor.nome_completo;
  novoReceptorTelefone.value = receptor.telefone || '';
  erroCadastroMovimentacao.value = '';
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

const inserirMovimentacaoNoSupabase = async (itensValidados) => {
  const usuarioId = session.value?.user?.id;
  const receptorId = receptorSelecionadoId.value;

  if (!usuarioId) {
    throw new Error('Sessão inválida: id do usuário não encontrado.');
  }

  if (receptorId === null || receptorId === undefined || receptorId === '') {
    throw new Error('Receptor inválido: id do receptor não encontrado.');
  }

  const payloadMovimentacao = {
    data: new Date().toISOString(),
    id_usuario: usuarioId,
    tipo_receptor: novoTipoReceptor.value,
    id_receptor: receptorId,
    tipo_movimentacao: novoTipoMovimentacao.value,
  };

  const { data: movimentacaoCriada, error: erroMovimentacao } = await supabase
    .from('movimentacao')
    .insert([payloadMovimentacao])
    .select('id')
    .single();

  if (erroMovimentacao || !movimentacaoCriada?.id) {
    throw new Error(
      erroMovimentacao?.message || 'Não foi possível inserir a movimentação na tabela movimentacao.',
    );
  }

  const itensPayload = itensValidados.map((item) => ({
    id_movimentacao: movimentacaoCriada.id,
    id_equipamento: item.equipamento_id,
    quantidade: item.quantidade,
  }));

  const { error: erroItens } = await supabase.from('item_movimentacao').insert(itensPayload);

  if (erroItens) {
    await supabase.from('movimentacao').delete().eq('id', movimentacaoCriada.id);
    throw new Error(erroItens.message || 'Não foi possível inserir os itens na tabela item_movimentacao.');
  }
};

const cadastrarNovaMovimentacao = async () => {
  erroCadastroMovimentacao.value = '';
  sucessoCadastroMovimentacao.value = '';

  if (!session.value?.user) {
    erroCadastroMovimentacao.value = 'Sessão inválida. Faça login novamente.';
    return;
  }

  if (!receptorSelecionadoId.value || !novoReceptorNome.value.trim()) {
    erroCadastroMovimentacao.value = 'Selecione um receptor na listagem.';
    return;
  }

  const itensValidados = novosItensMovimentacao.value
    .map((item) => ({
      equipamento_id: item.equipamento_id,
      equipamento_nome: item.equipamento_nome?.trim(),
      equipamento_classificacao: item.equipamento_classificacao,
      quantidade: Number(item.quantidade),
    }))
    .filter((item) => item.equipamento_nome && item.equipamento_id);

  if (!itensValidados.length) {
    erroCadastroMovimentacao.value = 'Informe ao menos um equipamento.';
    return;
  }

  if (itensValidados.some((item) => !Number.isFinite(item.quantidade) || item.quantidade <= 0)) {
    erroCadastroMovimentacao.value = 'Todas as quantidades devem ser maiores que zero.';
    return;
  }

  salvandoCadastroMovimentacao.value = true;

  try {
    await inserirMovimentacaoNoSupabase(itensValidados);
    await carregarMovimentacoes();
    sucessoCadastroMovimentacao.value = 'Movimentação cadastrada com sucesso.';
  } catch (error) {
    erroCadastroMovimentacao.value = error?.message || 'Erro ao cadastrar movimentação.';
    salvandoCadastroMovimentacao.value = false;
    return;
  }

  salvandoCadastroMovimentacao.value = false;

  setTimeout(() => {
    fecharModalCadastroMovimentacao();
  }, 800);
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

.container_modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  padding: 1rem;
}

.modal_content {
  width: min(920px, 96vw);
  border-radius: 20px;
  background: #fff;
  border: 1px solid #ececec;
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.22);
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1rem;
}

.modal_inputs {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.modal_title {
  margin: 0 0 0.4rem;
  font-size: 1.2rem;
  color: #1f1f1f;
}

.modal_step_text {
  margin: -0.2rem 0 0.2rem;
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 600;
}

.receptor_list_wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.equipamento_list_wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.list_hint {
  margin: 0;
  font-size: 0.82rem;
  color: #6b7280;
}

.receptor_list {
  max-height: 180px;
  overflow-y: auto;
  display: grid;
  gap: 0.5rem;
  padding-right: 0.2rem;
}

.equipamento_list {
  max-height: 220px;
  overflow-y: auto;
  display: grid;
  gap: 0.55rem;
  padding-right: 0.2rem;
}

.receptor_card {
  border: 1px solid #dde3ec;
  border-radius: 14px;
  background: linear-gradient(145deg, #ffffff 0%, #fbfcff 100%);
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.receptor_card:hover {
  border-color: #f0c39e;
  background: #fff8f2;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(246, 130, 31, 0.14);
}

.receptor_card--selected {
  border-color: #f6821f;
  background: linear-gradient(145deg, #fff7ef 0%, #ffeedf 100%);
  box-shadow: 0 0 0 2px rgba(246, 130, 31, 0.16);
}

.receptor_avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.receptor_info {
  min-width: 0;
  flex: 1;
}

.receptor_meta_row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.2rem;
}

.receptor_name,
.receptor_meta {
  margin: 0;
}

.receptor_name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #172033;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.receptor_meta {
  font-size: 0.78rem;
  color: #5f6a7f;
}

.receptor_type_badge {
  display: inline-flex;
  align-items: center;
  padding: 0.16rem 0.45rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.2px;
  text-transform: uppercase;
  white-space: nowrap;
}

.receptor_type_badge--aluno {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #0d47a1;
}

.receptor_type_badge--visitante {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  color: #4a148c;
}

.receptor_type_badge--funcionario {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  color: #e65100;
}

.receptor_select_state {
  font-size: 0.72rem;
  font-weight: 700;
  color: #b45b10;
  background: #fff3e8;
  border: 1px solid #f7cbab;
  border-radius: 999px;
  padding: 0.2rem 0.5rem;
  white-space: nowrap;
}

.equipamento_card {
  border: 1px solid #dde3ec;
  border-radius: 14px;
  background: linear-gradient(145deg, #ffffff 0%, #fbfcff 100%);
  padding: 0.55rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.equipamento_card--selected {
  border-color: #f6821f;
  background: linear-gradient(145deg, #fff7ef 0%, #ffeedf 100%);
  box-shadow: 0 0 0 2px rgba(246, 130, 31, 0.14);
}

.equipamento_card_main {
  background: transparent;
  border: none;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  text-align: left;
  padding: 0;
  cursor: pointer;
}

.equipamento_avatar {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid #f0f0f0;
}

.equipamento_info {
  min-width: 0;
  flex: 1;
}

.equipamento_name,
.equipamento_meta {
  margin: 0;
}

.equipamento_name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #172033;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.equipamento_meta {
  margin-top: 0.2rem;
  font-size: 0.78rem;
  color: #5f6a7f;
}

.equipamento_quantity {
  display: grid;
  grid-template-columns: 90px 120px;
  gap: 0.45rem;
  align-items: center;
}

.container_input1 {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.container_input2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

.container_input2:last-of-type {
  grid-template-columns: 2fr 1fr 1fr;
}

.container_input2--item {
  grid-template-columns: 2fr 1fr 1fr auto;
  align-items: end;
}

.label {
  margin: 0;
  font-size: 0.75rem;
  color: #666;
  font-weight: 600;
}

.input,
.select {
  height: 40px;
  border: 1px solid #d6d6d6;
  border-radius: 12px;
  padding: 0 0.8rem;
  font-size: 0.92rem;
  background: #fff;
}

.input:focus,
.select:focus {
  outline: none;
  border-color: #f6821f;
  box-shadow: 0 0 0 2px rgba(246, 130, 31, 0.15);
}

.modal_actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  align-items: center;
}

.modal_btn {
  height: 42px;
  border: none;
  border-radius: 30px;
  padding: 0 1rem;
  font-size: 0.95rem;
  color: #fff;
  background-color: #f6821f;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal_btn:hover {
  background-color: #ea7717;
}

.modal_btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.modal_btn--small {
  height: 40px;
  border-radius: 12px;
  padding: 0 0.8rem;
}

.modal_btn--secondary {
  background: #efefef;
  color: #444;
}

.modal_btn--secondary:hover {
  background: #e5e5e5;
}

.cadastro_feedback {
  margin: 0.15rem 0 0;
  font-size: 0.78rem;
}

.cadastro_feedback--erro {
  color: #b42318;
}

.cadastro_feedback--sucesso {
  color: #047857;
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

  .container_input2,
  .container_input2:last-of-type,
  .container_input2--item {
    grid-template-columns: 1fr;
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
