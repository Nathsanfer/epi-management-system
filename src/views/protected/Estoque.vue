<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const equipamentos = ref([]);
const menuAbertoId = ref(null);

const modalEdit = ref(false);
const equipamentoEditandoId = ref(null);

const editNomeEquipamento = ref("");
const editValidade = ref("");
const editCertificado = ref("");
const editTamanho = ref("");
const editQuantidadeMinima = ref("");
const editQuantidadeEstoque = ref("");
const editClassificacao = ref("");
const editDescricao = ref("");

const salvandoEdicao = ref(false);
const erroEdicao = ref("");
const sucessoEdicao = ref("");

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

onMounted(() => {
  carregarEquipamentos();
}); 

// ---------------- MODAL ----------------
const modalRegister = ref(false);
const inputImagemRef = ref(null);

function openRegisterModal() {
  modalRegister.value = true;
}

function closeRegisterModal() {
  modalRegister.value = false;

  if (previewImagem.value) {
    URL.revokeObjectURL(previewImagem.value);
    previewImagem.value = null;
  }

  imagemSelecionada.value = null;

  if (inputImagemRef.value) {
    inputImagemRef.value.value = "";
  }
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
  equipamentoEditandoId.value = item.id;
  editNomeEquipamento.value = item.nome ?? "";
  editValidade.value = item.validade_certificado ?? "";
  editCertificado.value = item.certificado_aprovacao ?? "";
  editTamanho.value = item.tamanho ?? "";
  editQuantidadeMinima.value = item.quantidade_minima ?? "";
  editQuantidadeEstoque.value = item.estoque?.[0]?.quantidade ?? "";
  editClassificacao.value = normalizarClassificacao(item.classificacao);
  editDescricao.value = item.descricao ?? "";

  erroEdicao.value = "";
  sucessoEdicao.value = "";
  modalEdit.value = true;
  fecharMenuOpcoes();
}

function fecharModalEdicao() {
  modalEdit.value = false;
  equipamentoEditandoId.value = null;
  erroEdicao.value = "";
  sucessoEdicao.value = "";
}

async function salvarEdicaoEquipamento() {
  erroEdicao.value = "";
  sucessoEdicao.value = "";

  if (!equipamentoEditandoId.value) {
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
    .eq("id", equipamentoEditandoId.value);

  if (equipamentoError) {
    erroEdicao.value = equipamentoError.message;
    salvandoEdicao.value = false;
    return;
  }

  const { data: estoqueRegistro, error: buscaEstoqueError } = await supabase
    .from("estoque")
    .select("id")
    .eq("id_equipamento", equipamentoEditandoId.value)
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
        id_equipamento: equipamentoEditandoId.value,
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
  await carregarEquipamentos();
  fecharModalEdicao();
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

// ---------------- IMAGEM ----------------
const imagemSelecionada = ref(null);
const previewImagem = ref(null);

function abrirSeletorImagem() {
  inputImagemRef.value?.click();
}

function selecionarImagem(event) {
  const arquivo = event.target.files?.[0];
  if (!arquivo) return;

  imagemSelecionada.value = arquivo;

  if (previewImagem.value) {
    URL.revokeObjectURL(previewImagem.value);
  }

  previewImagem.value = URL.createObjectURL(arquivo);
}

onBeforeUnmount(() => {
  if (previewImagem.value) {
    URL.revokeObjectURL(previewImagem.value);
  }
});

// ---------------- FORM ----------------
const nomeEquipamento = ref("");
const validade = ref("");
const certificado = ref("");
const tamanho = ref("");
const quantidadeMinima = ref("");
const quantidadeEstoque = ref("");
const classificacao = ref("");
const descricao = ref("");

const salvandoCadastro = ref(false);
const erroCadastro = ref("");
const sucessoCadastro = ref("");

// 🟡 fallback
const IMAGEM_PADRAO = "https://via.placeholder.com/150?text=Equipamento";

// ---------------- CADASTRO ----------------
async function cadastrarEquipamento() {
  erroCadastro.value = "";
  sucessoCadastro.value = "";

  if (!nomeEquipamento.value.trim()) {
    erroCadastro.value = "Informe o nome do equipamento.";
    return;
  }

  salvandoCadastro.value = true;
  let imagemUrl = IMAGEM_PADRAO;

  // 🚀 UPLOAD CORRIGIDO
  if (imagemSelecionada.value) {
    const arquivo = imagemSelecionada.value;

    // nome seguro (evita problema com espaço)
    const nomeArquivo = `${Date.now()}-${arquivo.name.replace(/\s/g, "_")}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("equipamentos")
      .upload(nomeArquivo, arquivo, {
        cacheControl: "3600",
        upsert: true,
      });

    console.log("UPLOAD DATA:", uploadData);
    console.log("UPLOAD ERROR:", uploadError);

    if (!uploadError) {
      const { data } = supabase.storage
        .from("equipamentos")
        .getPublicUrl(nomeArquivo);

      imagemUrl = data.publicUrl;

      console.log("URL GERADA:", imagemUrl);
    } else {
      console.error("Erro upload:", uploadError);
    }
  }

  // ---------------- INSERT EQUIPAMENTO ----------------
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

  console.log("PAYLOAD:", payload);

  const { data: equipamentoCriado, error: equipamentoError } =
    await supabase
      .from("equipamento")
      .insert([payload])
      .select("id")
      .single();

  if (equipamentoError) {
    console.error("Erro equipamento:", equipamentoError);
    erroCadastro.value = equipamentoError.message;
    salvandoCadastro.value = false;
    return;
  }

  // ---------------- INSERT ESTOQUE ----------------
  const { error: estoqueError } = await supabase
    .from("estoque")
    .insert([
      {
        id_equipamento: equipamentoCriado.id,
        quantidade: Number(quantidadeEstoque.value) || 0,
      },
    ]);

  if (estoqueError) {
    console.error("Erro estoque:", estoqueError);
    erroCadastro.value = "Equipamento cadastrado, mas erro no estoque.";
    salvandoCadastro.value = false;
    return;
  }

  // ---------------- RESET ----------------
  nomeEquipamento.value = "";
  validade.value = "";
  certificado.value = "";
  tamanho.value = "";
  quantidadeMinima.value = "";
  quantidadeEstoque.value = "";
  classificacao.value = "";
  descricao.value = "";

  sucessoCadastro.value = "Equipamento cadastrado com sucesso!";
  salvandoCadastro.value = false;

  closeRegisterModal();
  await carregarEquipamentos();
}
</script>

<template>
  <main class="page" @click="fecharMenuOpcoes">
    <button class="btn" @click="openRegisterModal">
      + Clique para Adicionar Novo Equipamento no Estoque
    </button>
    <div class="container-scroll">
      <ul class="list">
        <li class="element" v-for="item in equipamentos" :key="item.id">
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

    <div
      class="container_modal"
      v-if="modalRegister"
      @click="closeRegisterModal"
    >
      <div class="modal_content" @click.stop>
        <div class="modal_inputs">
          <h2 class="modal_title">Cadastro de Novo Equipamento</h2>
          <div class="container_input1">
            <label for="nome-equipamento" class="label"
              >Nome do Equipamento</label
            >
            <input
              type="text"
              id="nome-equipamento"
              class="input"
              placeholder="Nome do Equipamento"
              v-model="nomeEquipamento"
            />
          </div>
          <div class="container_input2">
            <div class="container_input1">
              <label for="validade" class="label">Validade</label>
              <input
                type="date"
                class="input"
                id="validade"
                v-model="validade"
              />
            </div>
            <div class="container_input1">
              <label for="certificado" class="label">Certificado</label>
              <input
                type="text"
                class="input"
                id="certificado"
                placeholder="Certificade de Aprovação"
                v-model="certificado"
              />
            </div>
            <div class="container_input1">
              <label for="tamanho" class="label">Tamanho</label>
              <input
                type="text"
                class="input"
                id="tamanho"
                placeholder="Tamanho"
                v-model="tamanho"
              />
            </div>
          </div>
          <div class="container_input2">
            <div class="container_input1">
              <label for="quantidade_minima" class="label"
                >Quantidade Mínima</label
              >
              <input
                type="text"
                class="input"
                id="quantidade_minima"
                placeholder="Quantidade Mínima"
                v-model="quantidadeMinima"
              />
            </div>
            <div class="container_input1">
              <label for="quantidade_estoque" class="label"
                >Quantidade em Estoque</label
              >
              <input
                type="text"
                class="input"
                id="quantidade_estoque"
                placeholder="Quantidade em Estoque"
                v-model="quantidadeEstoque"
              />
            </div>
          </div>
          <div class="container_input1">
            <label for="classificacao" class="label">Classificação</label>
            <select
              name="classificacao"
              id="classificacao"
              class="select"
              v-model="classificacao"
            >
              <option value="Reutilizável">Reutilizável</option>
              <option value="Descartável">Descartável</option>
            </select>
          </div>
          <div class="container_input1">
            <label for="descricao-equipamento" class="label">Descrição</label>
            <textarea
              type="text"
              rows="2"
              id="descricao-equipamento"
              class="input"
              placeholder="Descrição do Equipamento"
              v-model="descricao"
            />
          </div>
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
            {{ salvandoCadastro ? "Cadastrando..." : "Cadastrar Equipamento" }}
          </button>
          <p
            v-if="erroCadastro"
            class="cadastro_feedback cadastro_feedback--erro"
          >
            {{ erroCadastro }}
          </p>
          <p
            v-if="sucessoCadastro"
            class="cadastro_feedback cadastro_feedback--sucesso"
          >
            {{ sucessoCadastro }}
          </p>
        </div>
      </div>
    </div>

    <div class="container_modal" v-if="modalEdit" @click="fecharModalEdicao">
      <div class="modal_content" @click.stop>
        <div class="modal_inputs">
          <h2 class="modal_title">Editar Equipamento</h2>
          <div class="container_input1">
            <label for="edit-nome-equipamento" class="label"
              >Nome do Equipamento</label
            >
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
              <label for="edit-quantidade-minima" class="label"
                >Quantidade Mínima</label
              >
              <input
                type="text"
                class="input"
                id="edit-quantidade-minima"
                placeholder="Quantidade Mínima"
                v-model="editQuantidadeMinima"
              />
            </div>
            <div class="container_input1">
              <label for="edit-quantidade-estoque" class="label"
                >Quantidade em Estoque</label
              >
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

          <p
            v-if="erroEdicao"
            class="cadastro_feedback cadastro_feedback--erro"
          >
            {{ erroEdicao }}
          </p>
          <p
            v-if="sucessoEdicao"
            class="cadastro_feedback cadastro_feedback--sucesso"
          >
            {{ sucessoEdicao }}
          </p>
        </div>

        <div class="modal_image_button modal_actions">
          <button class="modal_btn modal_btn--secondary" @click="fecharModalEdicao">
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
  </main>
</template>

<style scoped>
.container_modal {
  display: flex;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.3);
}

.modal_content {
  background-color: #f0f0f0;
  margin: auto;
  padding: 20px;
  border: 1px solid #888;
  width: 100%;
  max-width: 800px;
  border-radius: 10px;
  display: flex;
  gap: 1rem;
}

.modal_title {
  margin: 0 0 1rem;
  color: var(--color-gray);
  font-family: var(--font-secondary);
}

.modal_inputs {
  width: 60%;
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
}

.modal_image_button {
  width: 40%;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 1rem;
}

.container_input1 {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

.input {
  padding: 0.5rem;
  border-radius: 15px;
  border: none;
}

.select {
  padding: 0.5rem;
  border-radius: 15px;
  border: none;
}

.modal_image {
  width: 100%;
  height: 200px;
  background-color: #d9d9d9;
  border-radius: 10px;
  border: none;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal_image_preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.modal_image_placeholder {
  color: #666;
  font-size: 0.95rem;
  text-align: center;
  padding: 1rem;
}

.input_file_hidden {
  display: none;
}

.modal_btn {
  width: 100%;
  padding: 0.7rem;
  border-radius: 30px;
  border: none;
  background-color: var(--highlights);
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.modal_btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cadastro_feedback {
  margin: 0;
  font-size: 0.82rem;
}

.cadastro_feedback--erro {
  color: #c0392b;
}

.cadastro_feedback--sucesso {
  color: #2e7d32;
}

.btn {
  width: 98%;
  margin-left: 0.5rem;
  padding: 0.72rem 1rem;
  border-radius: 14px;
  border: 1px solid #d9d9d9;
  background: linear-gradient(180deg, #f8f8f8 0%, #eeeeee 100%);
  color: #2f2f2f;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.1px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: background-color 0.2s ease, border-color 0.2s ease,
    box-shadow 0.2s ease, transform 0.15s ease;
}

.btn:hover {
  background: linear-gradient(180deg, #fbfbfb 0%, #f2f2f2 100%);
  border-color: #cdcdcd;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

.btn:active {
  transform: translateY(1px);
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
  padding: 1rem;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-radius: 30px;
  width: 96%;
  position: relative;
  overflow: visible;
  border: 1px solid #aeaeae;
}

.element::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 20px;
  background-color: #ff0000;
  border-radius: 0 30px 30px 0;
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
  justify-content: flex-end;
}

.modal_btn--secondary {
  background-color: #c9c9c9;
  color: #333;
}
</style>
