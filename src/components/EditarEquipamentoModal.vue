<template>
  <div class="container_modal" v-if="open" @click="closeModal">
    <div class="modal_content" @click.stop>
      <div class="modal_inputs">
        <h2 class="modal_title">Editar Equipamento</h2>
        <div class="container_input1">
          <label for="edit-nome-equipamento" class="label">Nome do Equipamento</label>
          <input
            type="text"
            id="edit-nome-equipamento"
            class="input"
            placeholder="Nome do Equipamento"
            v-model="editNomeEquipamento"
          />
        </div>

        <div class="container_input2">
          <div class="container_input1">
            <label for="edit-validade" class="label">Validade</label>
            <input
              type="date"
              class="input"
              id="edit-validade"
              v-model="editValidade"
            />
          </div>
          <div class="container_input1">
            <label for="edit-certificado" class="label">Certificado</label>
            <input
              type="text"
              class="input"
              id="edit-certificado"
              placeholder="Certificado de Aprovação"
              v-model="editCertificado"
            />
          </div>
          <div class="container_input1">
            <label for="edit-tamanho" class="label">Tamanho</label>
            <input
              type="text"
              class="input"
              id="edit-tamanho"
              placeholder="Tamanho"
              v-model="editTamanho"
            />
          </div>
        </div>

        <div class="container_input2">
          <div class="container_input1">
            <label for="edit-quantidade-minima" class="label">Quantidade Mínima</label>
            <input
              type="text"
              class="input"
              id="edit-quantidade-minima"
              placeholder="Quantidade Mínima"
              v-model="editQuantidadeMinima"
            />
          </div>
          <div class="container_input1">
            <label for="edit-quantidade-estoque" class="label">Quantidade em Estoque</label>
            <input
              type="text"
              class="input"
              id="edit-quantidade-estoque"
              placeholder="Quantidade em Estoque"
              v-model="editQuantidadeEstoque"
            />
          </div>
        </div>

        <div class="container_input1">
          <label for="edit-classificacao" class="label">Classificação</label>
          <select
            name="edit-classificacao"
            id="edit-classificacao"
            class="select"
            v-model="editClassificacao"
          >
            <option value="Reutilizável">Reutilizável</option>
            <option value="Descartável">Descartável</option>
          </select>
        </div>

        <div class="container_input1">
          <label for="edit-descricao-equipamento" class="label">Descrição</label>
          <textarea
            rows="2"
            id="edit-descricao-equipamento"
            class="input"
            placeholder="Descrição do Equipamento"
            v-model="editDescricao"
          />
        </div>

        <p v-if="erroEdicao" class="cadastro_feedback cadastro_feedback--erro">
          {{ erroEdicao }}
        </p>
        <p v-if="sucessoEdicao" class="cadastro_feedback cadastro_feedback--sucesso">
          {{ sucessoEdicao }}
        </p>
      </div>

      <div class="modal_actions">
        <button class="modal_btn modal_btn--secondary" type="button" @click="closeModal">
          Cancelar
        </button>
        <button
          class="modal_btn"
          type="button"
          :disabled="salvandoEdicao"
          @click="salvarEdicaoEquipamento"
        >
          {{ salvandoEdicao ? "Salvando..." : "Salvar alterações" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { createClient } from "@supabase/supabase-js";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  equipamento: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "updated"]);

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const salvandoEdicao = ref(false);
const erroEdicao = ref("");
const sucessoEdicao = ref("");

const editNomeEquipamento = ref("");
const editValidade = ref("");
const editCertificado = ref("");
const editTamanho = ref("");
const editQuantidadeMinima = ref("");
const editQuantidadeEstoque = ref("");
const editClassificacao = ref("");
const editDescricao = ref("");

const equipamentoId = computed(() => props.equipamento?.id ?? null);

function normalizarClassificacao(valor) {
  if (!valor) return "";

  const texto = String(valor).trim().toLowerCase();
  if (!texto) return "";

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function preencherFormulario() {
  editNomeEquipamento.value = props.equipamento?.nome ?? "";
  editValidade.value = props.equipamento?.validade_certificado ?? "";
  editCertificado.value = props.equipamento?.certificado_aprovacao ?? "";
  editTamanho.value = props.equipamento?.tamanho ?? "";
  editQuantidadeMinima.value = props.equipamento?.quantidade_minima ?? "";
  editQuantidadeEstoque.value = props.equipamento?.estoque?.[0]?.quantidade ?? "";
  editClassificacao.value = normalizarClassificacao(props.equipamento?.classificacao);
  editDescricao.value = props.equipamento?.descricao ?? "";
  erroEdicao.value = "";
  sucessoEdicao.value = "";
}

function resetarFormulario() {
  editNomeEquipamento.value = "";
  editValidade.value = "";
  editCertificado.value = "";
  editTamanho.value = "";
  editQuantidadeMinima.value = "";
  editQuantidadeEstoque.value = "";
  editClassificacao.value = "";
  editDescricao.value = "";
  erroEdicao.value = "";
  sucessoEdicao.value = "";
  salvandoEdicao.value = false;
}

function closeModal() {
  emit("close");
}

async function salvarEdicaoEquipamento() {
  erroEdicao.value = "";
  sucessoEdicao.value = "";

  if (!equipamentoId.value) {
    erroEdicao.value = "Equipamento inválido para edição.";
    return;
  }

  if (!editNomeEquipamento.value.trim()) {
    erroEdicao.value = "Informe o nome do equipamento.";
    return;
  }

  salvandoEdicao.value = true;

  const { error: equipamentoError } = await supabase
    .from("equipamento")
    .update({
      nome: editNomeEquipamento.value,
      descricao: editDescricao.value,
      tamanho: editTamanho.value,
      classificacao: normalizarClassificacao(editClassificacao.value),
      validade_certificado: editValidade.value,
      certificado_aprovacao: editCertificado.value,
      quantidade_minima: Number(editQuantidadeMinima.value) || 0,
    })
    .eq("id", equipamentoId.value);

  if (equipamentoError) {
    erroEdicao.value = equipamentoError.message;
    salvandoEdicao.value = false;
    return;
  }

  const { data: estoqueRegistro, error: buscaEstoqueError } = await supabase
    .from("estoque")
    .select("id")
    .eq("id_equipamento", equipamentoId.value)
    .maybeSingle();

  if (buscaEstoqueError) {
    erroEdicao.value = buscaEstoqueError.message;
    salvandoEdicao.value = false;
    return;
  }

  const quantidade = Number(editQuantidadeEstoque.value) || 0;
  let estoqueError = null;

  if (estoqueRegistro?.id) {
    const { error } = await supabase
      .from("estoque")
      .update({ quantidade })
      .eq("id", estoqueRegistro.id);
    estoqueError = error;
  } else {
    const { error } = await supabase.from("estoque").insert([
      {
        id_equipamento: equipamentoId.value,
        quantidade,
      },
    ]);
    estoqueError = error;
  }

  if (estoqueError) {
    erroEdicao.value = estoqueError.message;
    salvandoEdicao.value = false;
    return;
  }

  sucessoEdicao.value = "Equipamento atualizado com sucesso!";
  salvandoEdicao.value = false;
  emit("updated");
  closeModal();
  resetarFormulario();
}

watch(
  () => [props.open, props.equipamento],
  ([aberto]) => {
    if (aberto) {
      preencherFormulario();
      return;
    }

    resetarFormulario();
  },
  { immediate: true, deep: true },
);

onBeforeUnmount(() => {
  resetarFormulario();
});
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
  grid-template-columns: 1.3fr 0.8fr;
  gap: 1rem;
  padding: 1rem;
}

.modal_title {
  margin: 0 0 0.4rem;
  font-size: 1.2rem;
  color: #1f1f1f;
}

.modal_inputs {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.modal_actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.8rem;
}

.container_input1 {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.container_input2 {
  display: flex;
  width: 100%;
  max-width: 100%;
  gap: 0.5rem;
  justify-content: space-between;
  flex-wrap: wrap;
  box-sizing: border-box;
}

.container_input2 .container_input1 {
  flex: 1 1 0;
  min-width: 0;
}

.label {
  font-size: 0.75rem;
  color: #666;
  margin: 0;
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

.modal_btn {
  width: 100%;
  height: 42px;
  border-radius: 30px;
  border: none;
  background-color: #f6821f;
  color: #fff;
  font-size: 0.95rem;
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

@media (max-width: 900px) {
  .modal_content {
    grid-template-columns: 1fr;
  }
}
</style>
