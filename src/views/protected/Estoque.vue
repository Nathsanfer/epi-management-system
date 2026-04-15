<script setup>
import { ref, onMounted } from "vue";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const equipamentos = ref([]);

const carregarEquipamentos = async () => {
  const { data, error } = await supabase
    .from("equipamento")
    .select("*, estoque(quantidade)");

  if (error) {
    console.error("Erro ao carregar equipamentos:", error);
    return;
  }

  console.log("DADOS:", data);

  equipamentos.value = data;
};

onMounted(() => {
  carregarEquipamentos();
});

const modalRegister = ref(false);

function openRegisterModal() {
  modalRegister.value = true;
}

function closeRegisterModal() {
  modalRegister.value = false;
}
</script>

<template>
  <main class="page">
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
              <p class="info">{{ item.estoque[0]?.quantidade || 0 }}</p>
            </div>
            <div class="divider"></div>
            <div class="info_size">
              <p class="label">Tamanho:</p>
              <p class="info">{{ item.tamanho }}</p>
            </div>
            <div class="divider"></div>
            <div class="info_classification">
              <p class="label">Classificação:</p>
              <p class="info">{{ item.classificacao }}</p>
            </div>
            <div class="divider"></div>
            <div class="info_validity">
              <p class="label">Validade:</p>
              <p class="info">{{ item.validade_certificado }}</p>
            </div>
            <button
              class="more-options-btn"
              type="button"
              aria-label="Mostrar opções extras"
            >
              &#8942;
            </button>
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
            <label for="nome-equipamento" class="label">Nome do Equipamento</label>
            <input
              type="text"
              id="nome-equipamento"
              class="input"
              placeholder="Nome do Equipamento"
            />
          </div>
          <div class="container_input2">
            <div class="container_input1">
              <label for="validade" class="label">Validade</label>
              <input 
              type="date"
              class="input"
              id="validade"
              />
            </div>
            <div class="container_input1">
              <label for="certificado" class="label">Certificado</label>
              <input 
              type="text"
              class="input"
              id="certificado"
              placeholder="Certificade de Aprovação"
              />
            </div>
            <div class="container_input1">
              <label for="tamanho" class="label">Tamanho</label>
              <input 
              type="text"
              class="input"
              id="tamanho"
              placeholder="Tamanho"
              />
            </div>
          </div>
          <div class="container_input2">
            <div class="container_input1">
              <label for="quantidade_minima" class="label">Quantidade Mínima</label>
              <input 
              type="text"
              class="input"
              id="quantidade_minima"
              placeholder="Quantidade Mínima"
              />
            </div>
            <div class="container_input1">
              <label for="quantidade_estoque" class="label">Quantidade em Estoque</label>
              <input 
              type="text"
              class="input"
              id="quantidade_estoque"
              placeholder="Quantidade em Estoque"
              />
            </div>
          </div>
          <div class="container_input1">
            <label for="classificacao" class="label">Classificação</label>
            <select name="classificacao" id="classificacao" class="select">
              <option value="classe-1">Reutilizável</option>
              <option value="classe-2">Descartável</option>
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
            />  
          </div>
        </div>
        <div class="modal_image_button">
          <div class="modal_image">

          </div>
          <button class="modal_btn">Cadastrar Equipamento</button>
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


.btn {
  width: 98%;
  margin-left: 0.5rem;
  padding: 0.7rem;
  border-radius: 30px;
  border: none;
  background-color: #ececec;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
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
  overflow: hidden;
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
  align-self: stretch;
  background-color: #000000;
  margin: 0 1.5rem;
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
</style>
