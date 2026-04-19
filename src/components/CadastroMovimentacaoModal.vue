<template>
  <div
    class="container_modal"
    v-if="open"
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
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useSupabase } from '../composables/useSupabase';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  receptores: {
    type: Array,
    default: () => [],
  },
  equipamentos: {
    type: Array,
    default: () => [],
  },
  carregandoReceptores: {
    type: Boolean,
    default: false,
  },
  carregandoEquipamentos: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'created']);
const { supabase, session } = useSupabase();

const fallbackImage = 'https://placehold.co/120x120?text=Foto';
const etapaCadastroMovimentacao = ref(1);
const novoTipoMovimentacao = ref('Entrega');
const novoTipoReceptor = ref('Funcionário');
const pesquisaReceptor = ref('');
const pesquisaEquipamento = ref('');
const receptorSelecionadoId = ref(null);
const receptorSelecionadoKey = ref(null);
const novosItensMovimentacao = ref([]);
const salvandoCadastroMovimentacao = ref(false);
const erroCadastroMovimentacao = ref('');
const sucessoCadastroMovimentacao = ref('');

const normalizarTexto = (valor = '') =>
  String(valor)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

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

const receptoresFiltrados = computed(() => {
  const tipoSelecionado = normalizarTexto(novoTipoReceptor.value);
  const termoBusca = normalizarTexto(pesquisaReceptor.value);

  return props.receptores.filter((item) => {
    const mesmoTipo = normalizarTexto(item.tipo) === tipoSelecionado;
    const textoBusca = normalizarTexto(`${item.nome_completo} ${item.telefone || ''}`);
    const bateBusca = !termoBusca || textoBusca.includes(termoBusca);

    return mesmoTipo && bateBusca;
  });
});

const receptorSelecionadoNome = computed(() => {
  if (!receptorSelecionadoKey.value) return 'Nenhum receptor selecionado';

  const receptorSelecionado = props.receptores.find(
    (item) => item.key === receptorSelecionadoKey.value,
  );

  return receptorSelecionado?.nome_completo || 'Nenhum receptor selecionado';
});

const equipamentosFiltradosModal = computed(() => {
  const termoBusca = normalizarTexto(pesquisaEquipamento.value);

  return props.equipamentos.filter((item) => {
    const textoBusca = normalizarTexto(`${item.nome || ''} ${item.classificacao || ''}`);
    return !termoBusca || textoBusca.includes(termoBusca);
  });
});

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

const limparSelecaoReceptor = () => {
  receptorSelecionadoId.value = null;
  receptorSelecionadoKey.value = null;
  pesquisaReceptor.value = '';
};

const selecionarReceptor = (receptor) => {
  receptorSelecionadoId.value = receptor.id_receptor;
  receptorSelecionadoKey.value = receptor.key;
  novoTipoReceptor.value = normalizarTipoReceptor(receptor.tipo);
  erroCadastroMovimentacao.value = '';
};

const avancarEtapaCadastro = () => {
  erroCadastroMovimentacao.value = '';

  if (!receptorSelecionadoId.value) {
    erroCadastroMovimentacao.value = 'Selecione um receptor na listagem.';
    return;
  }

  etapaCadastroMovimentacao.value = 2;
};

const voltarEtapaCadastro = () => {
  erroCadastroMovimentacao.value = '';
  etapaCadastroMovimentacao.value = 1;
};

const resetarFormularioMovimentacao = () => {
  etapaCadastroMovimentacao.value = 1;
  novoTipoMovimentacao.value = 'Entrega';
  novoTipoReceptor.value = 'Funcionário';
  pesquisaReceptor.value = '';
  pesquisaEquipamento.value = '';
  receptorSelecionadoId.value = null;
  receptorSelecionadoKey.value = null;
  novosItensMovimentacao.value = [];
  salvandoCadastroMovimentacao.value = false;
  erroCadastroMovimentacao.value = '';
  sucessoCadastroMovimentacao.value = '';
};

const fecharModalCadastroMovimentacao = () => {
  emit('close');
};

const aplicarFallbackImagem = (event) => {
  event.target.src = fallbackImage;
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

  if (!receptorSelecionadoId.value) {
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
    sucessoCadastroMovimentacao.value = 'Movimentação cadastrada com sucesso.';
    emit('created');
  } catch (error) {
    erroCadastroMovimentacao.value = error?.message || 'Erro ao cadastrar movimentação.';
    salvandoCadastroMovimentacao.value = false;
    return;
  }

  salvandoCadastroMovimentacao.value = false;

  setTimeout(() => {
    fecharModalCadastroMovimentacao();
    resetarFormularioMovimentacao();
  }, 800);
};

watch(
  () => props.open,
  (aberto) => {
    if (aberto) {
      resetarFormularioMovimentacao();
    }
  },
  { immediate: true },
);
</script>

<style scoped>
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

.receptor_list_wrapper,
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

.receptor_card--selected,
.equipamento_card--selected {
  border-color: #f6821f;
  background: linear-gradient(145deg, #fff7ef 0%, #ffeedf 100%);
  box-shadow: 0 0 0 2px rgba(246, 130, 31, 0.16);
}

.receptor_avatar,
.equipamento_avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.equipamento_avatar {
  border-radius: 10px;
  border: 1px solid #f0f0f0;
}

.receptor_info,
.equipamento_info {
  min-width: 0;
  flex: 1;
}

.receptor_name,
.receptor_meta,
.equipamento_name,
.equipamento_meta {
  margin: 0;
}

.receptor_name,
.equipamento_name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #172033;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.receptor_meta_row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.2rem;
}

.receptor_meta,
.equipamento_meta {
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

.equipamento_quantity {
  display: grid;
  grid-template-columns: 90px 120px;
  gap: 0.45rem;
  align-items: center;
}

.modal_actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
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
  .container_input2,
  .equipamento_quantity {
    grid-template-columns: 1fr;
  }
}
</style>
