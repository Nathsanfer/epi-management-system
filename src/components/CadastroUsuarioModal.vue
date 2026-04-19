<template>
  <div class="container_modal" v-if="open" @click="closeModal">
    <div class="modal_content" @click.stop>
      <div class="modal_inputs">
        <h2 class="modal_title">Cadastro de Novo Usuário</h2>

        <div class="container_input1">
          <label for="nome-usuario" class="label">Nome Completo</label>
          <input
            id="nome-usuario"
            type="text"
            class="input"
            placeholder="Digite o nome completo"
            v-model="nomeNovoUsuario"
          />
        </div>

        <div class="container_input1">
          <label for="email-usuario" class="label">E-mail</label>
          <input
            id="email-usuario"
            type="email"
            class="input"
            placeholder="Digite o e-mail"
            v-model="emailNovoUsuario"
          />
        </div>

        <div class="container_input1">
          <label for="senha-usuario" class="label">Senha</label>
          <input
            id="senha-usuario"
            type="password"
            class="input"
            placeholder="Digite a senha"
            v-model="senhaNovoUsuario"
          />
        </div>

        <div class="container_input1">
          <label for="funcao-usuario" class="label">Função</label>
          <select id="funcao-usuario" class="select" v-model="funcaoNovoUsuario">
            <option value="administrador">Administrador</option>
            <option value="operador">Operador</option>
          </select>
        </div>

        <p v-if="erroCadastro" class="cadastro_feedback cadastro_feedback--erro">
          {{ erroCadastro }}
        </p>
        <p v-if="sucessoCadastro" class="cadastro_feedback cadastro_feedback--sucesso">
          {{ sucessoCadastro }}
        </p>
      </div>

      <div class="modal_image_button">
        <div class="avatar-picker">
          <p class="label avatar-picker__label">Escolha a imagem</p>
          <div class="avatar-options">
            <button
              v-for="avatar in avataresDisponiveis"
              :key="avatar.key"
              class="avatar-option"
              :class="{ 'avatar-option--active': avatarSelecionado === avatar.key }"
              type="button"
              @click="selecionarAvatar(avatar.key)"
            >
              <img class="avatar-option__image" :src="avatar.src" :alt="avatar.label" />
              <span class="avatar-option__label">{{ avatar.label }}</span>
            </button>
          </div>
        </div>

        <button
          class="modal_btn"
          type="button"
          :disabled="salvandoCadastro"
          @click="cadastrarUsuario"
        >
          {{ salvandoCadastro ? "Cadastrando..." : "Cadastrar Usuário" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { createClient } from "@supabase/supabase-js";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "created"]);

const authSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

const storageBaseUrl = String(import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");

const avatarUrlPublica = (nomeArquivo) =>
  `${storageBaseUrl}/storage/v1/object/public/avatares/${nomeArquivo}`;

const avataresDisponiveis = ref([
  {
    key: "usuario_h.jpeg",
    label: "Imagem 1",
    src: avatarUrlPublica("usuario_h.jpeg"),
  },
  {
    key: "usuario_m.jpeg",
    label: "Imagem 2",
    src: avatarUrlPublica("usuario_m.jpeg"),
  },
]);

const nomeNovoUsuario = ref("");
const emailNovoUsuario = ref("");
const senhaNovoUsuario = ref("");
const funcaoNovoUsuario = ref("operador");
const avatarSelecionado = ref("");
const salvandoCadastro = ref(false);
const erroCadastro = ref("");
const sucessoCadastro = ref("");

function selecionarAvatar(avatarKey) {
  avatarSelecionado.value = avatarKey;
}

function resetarFormulario() {
  nomeNovoUsuario.value = "";
  emailNovoUsuario.value = "";
  senhaNovoUsuario.value = "";
  funcaoNovoUsuario.value = "operador";
  avatarSelecionado.value = "";
  erroCadastro.value = "";
  sucessoCadastro.value = "";
  salvandoCadastro.value = false;
}

function closeModal() {
  emit("close");
}

const formatarFuncao = (valor) => {
  const texto = String(valor ?? "").trim().toLowerCase();
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

async function cadastrarUsuario() {
  erroCadastro.value = "";
  sucessoCadastro.value = "";

  if (!nomeNovoUsuario.value.trim()) {
    erroCadastro.value = "Informe o nome do usuário.";
    return;
  }

  if (!emailNovoUsuario.value.trim()) {
    erroCadastro.value = "Informe o e-mail do usuário.";
    return;
  }

  if (!senhaNovoUsuario.value.trim()) {
    erroCadastro.value = "Informe a senha do usuário.";
    return;
  }

  if (senhaNovoUsuario.value.trim().length < 6) {
    erroCadastro.value = "A senha precisa ter pelo menos 6 caracteres.";
    return;
  }

  if (!avatarSelecionado.value) {
    erroCadastro.value = "Selecione uma imagem para o usuário.";
    return;
  }

  salvandoCadastro.value = true;
  const imagemUrl =
    avataresDisponiveis.value.find((avatar) => avatar.key === avatarSelecionado.value)?.src ||
    avatarUrlPublica(avatarSelecionado.value);

  const { error: authError } = await authSupabase.auth.signUp({
    email: emailNovoUsuario.value.trim().toLowerCase(),
    password: senhaNovoUsuario.value,
    options: {
      data: {
        nome_completo: nomeNovoUsuario.value,
        nome: nomeNovoUsuario.value,
        funcao: formatarFuncao(funcaoNovoUsuario.value),
        role: formatarFuncao(funcaoNovoUsuario.value),
        imagem: imagemUrl,
        avatar_url: imagemUrl,
      },
    },
  });

  salvandoCadastro.value = false;

  if (authError) {
    const mensagemErro = String(authError.message || "").toLowerCase();

    if (mensagemErro.includes("user already registered")) {
      erroCadastro.value = "Este e-mail já está cadastrado.";
      return;
    }

    if (mensagemErro.includes("email rate limit exceeded")) {
      erroCadastro.value = "Limite de envio de e-mail atingido.";
      return;
    }

    if (mensagemErro.includes("database error saving new user")) {
      erroCadastro.value =
        "Erro ao salvar novo usuário no banco de autenticação. Verifique a trigger de criação de usuário no Supabase (campos esperados em raw_user_meta_data).";
      return;
    }

    erroCadastro.value = authError.message;
    return;
  }

  sucessoCadastro.value = "Usuário cadastrado com sucesso!";
  emit("created");
  resetarFormulario();
  closeModal();
}

watch(
  () => props.open,
  (aberto) => {
    if (!aberto) {
      resetarFormulario();
    }
  },
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

.modal_image_button {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
}

.avatar-picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.avatar-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.avatar-option {
  border: 1px solid #dde3ec;
  border-radius: 16px;
  background: #fafbfe;
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.avatar-option:hover {
  transform: translateY(-1px);
  border-color: #f0c39e;
  box-shadow: 0 6px 16px rgba(246, 130, 31, 0.1);
}

.avatar-option--active {
  border-color: #f6821f;
  background: #fff7ef;
  box-shadow: 0 0 0 2px rgba(246, 130, 31, 0.16);
}

.avatar-option__image {
  width: 100%;
  max-width: 92px;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.avatar-option__label {
  font-size: 0.8rem;
  color: #394255;
  font-weight: 600;
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

.cadastro_feedback {
  margin: 0;
  font-size: 0.78rem;
}

.cadastro_feedback--erro {
  color: #c0392b;
}

.cadastro_feedback--sucesso {
  color: #2e7d32;
}

@media (max-width: 900px) {
  .modal_content {
    grid-template-columns: 1fr;
  }
}
</style>
