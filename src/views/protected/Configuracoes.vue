<script setup>
import { ref, watch } from "vue";
import { useSupabase } from "../../composables/useSupabase";

const { supabase, session, loadingSession } = useSupabase();

const usuarioLogado = ref(null);
const nomeExibicao = ref("");
const email = ref("");
const senha = ref("");
const funcaoUsuario = ref("");
const fotoPadrao =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop";
const fotoPerfil = ref(fotoPadrao);

const idioma = ref("pt-BR");
const fusoHorario = ref("America/Sao_Paulo");
const tema = ref("claro");

const notificarEstoque = ref(true);
const notificarValidade = ref(true);
const notificarMovimentacoes = ref(false);
const salvandoSenha = ref(false);
const mensagemSenha = ref("");
const tipoMensagemSenha = ref("");

const carregarUsuarioLogado = async () => {
  const userId = session.value?.user?.id;
  if (!userId) return;

  const { data, error } = await supabase
    .from("usuario")
    .select("id, nome_completo, funcao, imagem")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao carregar dados do usuário:", error);
    return;
  }

  usuarioLogado.value = data;
  nomeExibicao.value = data?.nome_completo ?? "";
  email.value = data?.email ?? session.value?.user?.email ?? "";
  funcaoUsuario.value = (data?.funcao ?? "").toLowerCase().trim();
  fotoPerfil.value = data?.imagem ?? fotoPadrao;
};

const alterarSenha = async () => {
  mensagemSenha.value = "";
  tipoMensagemSenha.value = "";

  if (!senha.value?.trim()) {
    mensagemSenha.value = "Digite uma nova senha para continuar.";
    tipoMensagemSenha.value = "erro";
    return;
  }

  if (senha.value.trim().length < 6) {
    mensagemSenha.value = "A senha precisa ter pelo menos 6 caracteres.";
    tipoMensagemSenha.value = "erro";
    return;
  }

  salvandoSenha.value = true;

  const { error } = await supabase.auth.updateUser({
    password: senha.value,
  });

  salvandoSenha.value = false;

  if (error) {
    mensagemSenha.value = error.message || "Nao foi possivel alterar a senha.";
    tipoMensagemSenha.value = "erro";
    return;
  }

  senha.value = "";
  mensagemSenha.value = "Senha alterada com sucesso.";
  tipoMensagemSenha.value = "sucesso";
};

watch(
  () => loadingSession.value,
  (loading) => {
    if (!loading && session.value?.user) {
      carregarUsuarioLogado();
    }
  },
  { immediate: true }
);

</script>

<template>
  <section class="page">
    <div class="content-grid">
      <section class="card card--perfil">
        <h2 class="title-section">Confira seus Dados Cadastrais</h2>
        <div class="profile-photo-card">
          <img class="profile-photo" :src="fotoPerfil" alt="Foto de perfil" />
          <span
            class="role-badge"
            :class="
              funcaoUsuario === 'administrador'
                ? 'role-badge--admin'
                : 'role-badge--operador'
            "
          >
            {{
              funcaoUsuario === "administrador" ? "Administrador" : "Operador"
            }}
          </span>
        </div>

        <div class="profile-fields">
            <div class="field-grid-profile">
              <label class="field">
                <span class="label">Nome</span>
                <input v-model="nomeExibicao" class="input" type="text" />
              </label>

              <label class="field">
                <span class="label">E-mail</span>
                <input v-model="email" class="input" type="email" />
              </label>

              <label class="field field--full">
                <span class="label">Senha</span>
                <input v-model="senha" class="input" type="password" placeholder="Digite uma nova senha" />
              </label>

              <p
                v-if="mensagemSenha"
                class="password-feedback"
                :class="tipoMensagemSenha === 'erro' ? 'password-feedback--erro' : 'password-feedback--sucesso'"
              >
                {{ mensagemSenha }}
              </p>

            </div>

            <button
              class="btn-save btn-save--profile"
              type="button"
              :disabled="salvandoSenha"
              @click="alterarSenha"
            >
              {{ salvandoSenha ? "Salvando..." : "Salvar alterações" }}
            </button>
          </div>
      </section>

      <div class="container_right">
        <article class="card card--sistema">
          <h2 class="card-title">Sistema</h2>
          <div class="field-grid">
            <label class="field">
              <span class="label">Idioma</span>
              <select v-model="idioma" class="input">
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
              </select>
            </label>

            <label class="field">
              <span class="label">Fuso horário</span>
              <select v-model="fusoHorario" class="input">
                <option value="America/Sao_Paulo">America/Sao_Paulo</option>
                <option value="America/Manaus">America/Manaus</option>
                <option value="America/Belem">America/Belem</option>
              </select>
            </label>

            <label class="field field--full">
              <span class="label">Tema</span>
              <div class="segmented">
                <button
                  class="segmented-btn"
                  :class="{ 'segmented-btn--active': tema === 'claro' }"
                  type="button"
                  @click="tema = 'claro'"
                >
                  Claro
                </button>
                <button
                  class="segmented-btn"
                  :class="{ 'segmented-btn--active': tema === 'escuro' }"
                  type="button"
                  @click="tema = 'escuro'"
                >
                  Escuro
                </button>
              </div>
            </label>
          </div>
        </article>

        <article class="card card--notificacoes">
          <h2 class="card-title">Notificações</h2>
          <div class="field-grid">
            <label class="switch-row field--full">
              <div>
                <span class="switch-label">Alertar estoque mínimo</span>
                <p class="switch-hint">
                  Receba avisos quando algum item atingir o limite mínimo.
                </p>
              </div>
              <input
                v-model="notificarEstoque"
                type="checkbox"
                class="switch"
              />
            </label>

            <label class="switch-row field--full">
              <div>
                <span class="switch-label">Alertar validade próxima</span>
                <p class="switch-hint">
                  Notifique itens com validade próxima do vencimento.
                </p>
              </div>
              <input
                v-model="notificarValidade"
                type="checkbox"
                class="switch"
              />
            </label>

            <label class="switch-row field--full">
              <div>
                <span class="switch-label">Alertar novas movimentações</span>
                <p class="switch-hint">
                  Envie alertas para entradas, saídas e ajustes no estoque.
                </p>
              </div>
              <input
                v-model="notificarMovimentacoes"
                type="checkbox"
                class="switch"
              />
            </label>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.profile-fields {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-save--profile {
  align-self: flex-end;
  min-width: 160px;
  margin-top: 0.1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field--full {
  grid-column: 1 / -1;
}

.label {
  font-size: 0.75rem;
  color: #666;
}

.input {
  height: 40px;
  border: 1px solid #d9d9d9;
  border-radius: 12px;
  padding: 0 0.7rem;
  font-size: 0.9rem;
  color: #333;
  background-color: #fff;
}

.input:focus {
  outline: none;
  border-color: #f6821f;
  box-shadow: 0 0 0 2px rgba(246, 130, 31, 0.15);
}

.title-section {
  font-family: var(--font-secondary);
}

.page {
  display: flex;
}

.content-grid {
  width: 98%;
  margin-left: 0.5rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  align-items: stretch;
}

.container_right {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.card {
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 1rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.card--perfil {
  height: 100%;
  padding: 0rem 1rem;
}

.card--sistema {
  margin-bottom: 0;
}

.card--notificacoes {
  margin-top: 0;
}

.card-title {
  margin: 0 0 0.9rem;
  font-size: 1rem;
  color: #303030;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.field-grid-profile {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem 1rem;  
}

.profile-fields {
  display: flex;
  gap: 1.5rem;
}

.profile-photo-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.profile-photo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.role-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.role-badge--admin {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #0d47a1;
}

.role-badge--operador {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  color: #e65100;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.field--full {
  grid-column: 1 / -1;
}

.label {
  font-size: 0.68rem;
  color: #666;
}

.card--perfil .field-grid {
  gap: 0.55rem;
}

.card--perfil .card-title {
  margin: 0 0 0.6rem;
  font-size: 0.95rem;
}

.card--perfil .input {
  height: 34px;
  border-radius: 10px;
  padding: 0 0.55rem;
  font-size: 0.82rem;
}

.input {
  height: 40px;
  border: 1px solid #d9d9d9;
  border-radius: 12px;
  padding: 0 0.7rem;
  font-size: 0.9rem;
  color: #333;
  background-color: #fff;
}

.input:focus {
  outline: none;
  border-color: #f6821f;
  box-shadow: 0 0 0 2px rgba(246, 130, 31, 0.15);
}

.btn-save {
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

.btn-save:hover {
  background-color: #ea7717;
}

.segmented {
  display: flex;
  gap: 0.5rem;
}

.segmented-btn {
  flex: 1;
  height: 40px;
  border: 1px solid #d9d9d9;
  border-radius: 12px;
  background: #f7f7f7;
  color: #555;
  cursor: pointer;
}

.segmented-btn--active {
  border-color: #f6821f;
  background: #fff3e8;
  color: #b45b10;
  font-weight: 600;
}

.switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ececec;
  border-radius: 12px;
  padding: 0.65rem 0.75rem;
  background: #fcfcfc;
}

.switch-label {
  font-size: 0.88rem;
  color: #444;
}

.switch-hint {
  margin: 0.15rem 0 0;
  font-size: 0.74rem;
  color: #777;
}

.switch {
  width: 18px;
  height: 18px;
  accent-color: #f6821f;
}

.password-feedback {
  margin: 0;
  grid-column: 1 / -1;
  font-size: 0.78rem;
}

.password-feedback--erro {
  color: #b42318;
}

.password-feedback--sucesso {
  color: #047857;
}

@media (max-width: 960px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.7rem;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .container_right {
    height: auto;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .btn-save--profile {
    align-self: stretch;
    min-width: 0;
  }

  .profile-layout {
    grid-template-columns: 1fr;
  }
}
</style>
