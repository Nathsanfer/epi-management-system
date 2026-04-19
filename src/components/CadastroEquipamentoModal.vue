<template>
  <div class="container_modal" v-if="open" @click="closeModal">
    <div class="modal_content" @click.stop>
      <div class="modal_inputs">
        <h2 class="modal_title">Cadastro de Novo Equipamento</h2>

        <div class="container_input1">
          <label for="nome-equipamento" class="label">Nome do Equipamento</label>
          <input
            id="nome-equipamento"
            type="text"
            class="input"
            placeholder="Nome do Equipamento"
            v-model="nomeEquipamento"
          />
        </div>

        <div class="container_input2">
          <div class="container_input1">
            <label for="validade" class="label">Validade</label>
            <input id="validade" type="date" class="input" v-model="validade" />
          </div>
          <div class="container_input1">
            <label for="certificado" class="label">Certificado</label>
            <input
              id="certificado"
              type="text"
              class="input"
              placeholder="Certificado de Aprovação"
              v-model="certificado"
            />
          </div>
          <div class="container_input1">
            <label for="tamanho" class="label">Tamanho</label>
            <input id="tamanho" type="text" class="input" placeholder="Tamanho" v-model="tamanho" />
          </div>
        </div>

        <div class="container_input2">
          <div class="container_input1">
            <label for="quantidade_minima" class="label">Quantidade Mínima</label>
            <input
              id="quantidade_minima"
              type="number"
              min="0"
              class="input"
              placeholder="Quantidade Mínima"
              v-model="quantidadeMinima"
            />
          </div>
          <div class="container_input1">
            <label for="quantidade_estoque" class="label">Quantidade em Estoque</label>
            <input
              id="quantidade_estoque"
              type="number"
              min="0"
              class="input"
              placeholder="Quantidade em Estoque"
              v-model="quantidadeEstoque"
            />
          </div>
        </div>

        <div class="container_input1">
          <label for="classificacao" class="label">Classificação</label>
          <select id="classificacao" class="select" v-model="classificacao">
            <option value="Reutilizável">Reutilizável</option>
            <option value="Descartável">Descartável</option>
          </select>
        </div>

        <div class="container_input1">
          <label for="descricao-equipamento" class="label">Descrição</label>
          <textarea
            id="descricao-equipamento"
            rows="2"
            class="input textarea"
            placeholder="Descrição do Equipamento"
            v-model="descricao"
          />
        </div>

        <p v-if="erroCadastro" class="cadastro_feedback cadastro_feedback--erro">
          {{ erroCadastro }}
        </p>
        <p v-if="sucessoCadastro" class="cadastro_feedback cadastro_feedback--sucesso">
          {{ sucessoCadastro }}
        </p>
      </div>

      <div class="modal_image_button">
        <button class="modal_image" type="button" @click="abrirSeletorImagem">
          <img
            v-if="previewImagem"
            :src="previewImagem"
            alt="Pré-visualização da imagem selecionada"
            class="modal_image_preview"
          />
          <span v-else class="modal_image_placeholder">
            Clique para selecionar uma imagem
          </span>
        </button>

        <input
          ref="inputImagemRef"
          type="file"
          accept="image/*"
          class="input_file_hidden"
          @change="selecionarImagem"
        />

        <button
          class="modal_btn"
          type="button"
          :disabled="salvandoCadastro"
          @click="cadastrarEquipamento"
        >
          {{ salvandoCadastro ? 'Cadastrando...' : 'Cadastrar Equipamento' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';
import { createClient } from '@supabase/supabase-js';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'created']);

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const inputImagemRef = ref(null);
const imagemSelecionada = ref(null);
const previewImagem = ref(null);

const nomeEquipamento = ref('');
const validade = ref('');
const certificado = ref('');
const tamanho = ref('');
const quantidadeMinima = ref('');
const quantidadeEstoque = ref('');
const classificacao = ref('');
const descricao = ref('');

const salvandoCadastro = ref(false);
const erroCadastro = ref('');
const sucessoCadastro = ref('');

const IMAGEM_PADRAO = 'https://via.placeholder.com/150?text=Equipamento';

const resetarFormulario = () => {
  nomeEquipamento.value = '';
  validade.value = '';
  certificado.value = '';
  tamanho.value = '';
  quantidadeMinima.value = '';
  quantidadeEstoque.value = '';
  classificacao.value = '';
  descricao.value = '';
  erroCadastro.value = '';
  sucessoCadastro.value = '';
  salvandoCadastro.value = false;

  if (previewImagem.value) {
    URL.revokeObjectURL(previewImagem.value);
    previewImagem.value = null;
  }

  imagemSelecionada.value = null;

  if (inputImagemRef.value) {
    inputImagemRef.value.value = '';
  }
};

const closeModal = () => {
  emit('close');
};

const abrirSeletorImagem = () => {
  inputImagemRef.value?.click();
};

const selecionarImagem = (event) => {
  const arquivo = event.target.files?.[0];
  if (!arquivo) return;

  imagemSelecionada.value = arquivo;

  if (previewImagem.value) {
    URL.revokeObjectURL(previewImagem.value);
  }

  previewImagem.value = URL.createObjectURL(arquivo);
};

const normalizarClassificacao = (valor) => {
  if (!valor) return '';

  const texto = String(valor).trim().toLowerCase();
  if (!texto) return '';

  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

const cadastrarEquipamento = async () => {
  erroCadastro.value = '';
  sucessoCadastro.value = '';

  if (!nomeEquipamento.value.trim()) {
    erroCadastro.value = 'Informe o nome do equipamento.';
    return;
  }

  salvandoCadastro.value = true;
  let imagemUrl = IMAGEM_PADRAO;

  if (imagemSelecionada.value) {
    const arquivo = imagemSelecionada.value;
    const nomeArquivo = `${Date.now()}-${arquivo.name.replace(/\s/g, '_')}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('equipamentos')
      .upload(nomeArquivo, arquivo, {
        cacheControl: '3600',
        upsert: true,
      });

    if (!uploadError) {
      const { data } = supabase.storage.from('equipamentos').getPublicUrl(nomeArquivo);
      imagemUrl = data.publicUrl;
    } else {
      console.error('Erro upload:', uploadError);
    }
  }

  const payload = {
    nome: nomeEquipamento.value,
    descricao: descricao.value,
    tamanho: tamanho.value,
    classificacao: normalizarClassificacao(classificacao.value),
    validade_certificado: validade.value,
    certificado_aprovacao: certificado.value,
    imagem: imagemUrl,
    quantidade_minima: Number(quantidadeMinima.value) || 0,
  };

  const { data: equipamentoCriado, error: equipamentoError } = await supabase
    .from('equipamento')
    .insert([payload])
    .select('id')
    .single();

  if (equipamentoError) {
    erroCadastro.value = equipamentoError.message;
    salvandoCadastro.value = false;
    return;
  }

  const { error: estoqueError } = await supabase.from('estoque').insert([
    {
      id_equipamento: equipamentoCriado.id,
      quantidade: Number(quantidadeEstoque.value) || 0,
    },
  ]);

  if (estoqueError) {
    erroCadastro.value = 'Equipamento cadastrado, mas erro no estoque.';
    salvandoCadastro.value = false;
    return;
  }

  sucessoCadastro.value = 'Equipamento cadastrado com sucesso!';
  salvandoCadastro.value = false;
  emit('created');
  resetarFormulario();
  closeModal();
};

watch(
  () => props.open,
  (aberto) => {
    if (!aberto) {
      resetarFormulario();
    }
  },
);

onBeforeUnmount(() => {
  if (previewImagem.value) {
    URL.revokeObjectURL(previewImagem.value);
  }
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

.textarea {
  height: auto;
  min-height: 40px;
  padding-top: 0.65rem;
  resize: vertical;
}

.input:focus,
.select:focus {
  outline: none;
  border-color: #f6821f;
  box-shadow: 0 0 0 2px rgba(246, 130, 31, 0.15);
}

.modal_image_button {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.8rem;
}

.modal_image {
  width: 100%;
  min-height: 210px;
  border: 1px dashed #d8d8d8;
  border-radius: 16px;
  background: #fafafa;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.6rem;
}

.modal_image_preview {
  width: 100%;
  height: 100%;
  max-height: 250px;
  object-fit: cover;
  border-radius: 12px;
}

.modal_image_placeholder {
  font-size: 0.86rem;
  color: #777;
  text-align: center;
}

.input_file_hidden {
  display: none;
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

  .modal_image {
    min-height: 150px;
  }
}
</style>