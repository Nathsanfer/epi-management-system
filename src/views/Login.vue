<script setup>
// Importa as dependências necessárias
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useSupabase } from "../composables/useSupabase";

// Define as variáveis reativas para email, senha, erro e estado de carregamento
const email = ref("");
const password = ref("");
const erro = ref(null);
const loading = ref(false);

// Obtém a instância do Supabase e do roteador
const { supabase } = useSupabase();
const router = useRouter();

// Função para lidar com o login do usuário
const login = async () => {
  // Reseta o erro e define o estado de carregamento
  erro.value = null;
  loading.value = true;

  // Validação básica para garantir que email e senha foram preenchidos
  if (!email.value || !password.value) {
    erro.value = "Email e senha são obrigatórios";
    loading.value = false;
    return;
  }

  try {
    // Tenta fazer login com email e senha usando o Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) {
      console.error("Erro de login:", error);

      // Tratamento de erros específicos
      if (error.message.includes("Invalid login credentials")) {
        erro.value = "Email ou senha inválidos";
      } else if (error.message.includes("Email not confirmed")) {
        erro.value = "Email não foi confirmado. Verifique seu email";
      } else if (error.message.includes("Too many requests")) {
        erro.value = "Muitas tentativas. Tente novamente depois";
      } else {
        erro.value = error.message || "Erro ao fazer login";
      }
      loading.value = false;
      return;
    }

    // Se o login for bem-sucedido, redireciona para o dashboard
    if (data?.session) {
      router.push("/dashboard");
    }
  } catch (erroCatch) {
    console.error("Erro inesperado:", erroCatch);
    erro.value = "Erro inesperado. Tente novamente tarde";
    loading.value = false;
  }
};
</script>

<template>
  <div class="container">
    <section class="content">
      <div class="auth-card">
        <h1 class="brand"><span>EPI</span> MANAGER</h1>
        <h2 class="title">Faça seu login</h2>

        <div class="social-row" aria-label="Opções sociais">
          <button
            type="button"
            class="social-btn"
            aria-label="Continuar com Google"
          >
            G
          </button>
          <button
            type="button"
            class="social-btn"
            aria-label="Continuar com Facebook"
          >
            f
          </button>
          <button type="button" class="social-btn" aria-label="Continuar com X">
            t
          </button>
        </div>

        <p class="subtitle">ou utilize seu email para se cadastrar:</p>

        <div class="form-group">
          <input
            type="email"
            class="form-control"
            id="email"
            placeholder="Email"
            v-model="email"
          />
        </div>
        <div class="form-group">
          <input
            type="password"
            class="form-control"
            id="password"
            placeholder="Senha"
            v-model="password"
          />
        </div>

        <label class="terms">
          <input type="checkbox" checked />
          <span>
            Concordo com os <a href="#">Termos</a> e com a
            <a href="#">Política de Privacidade</a>.
          </span>
        </label>

        <button class="submit-btn" @click="login" :disabled="loading">
          {{ loading ? "Entrando..." : "Entrar" }}
        </button>

        <p v-if="erro" class="error-message">{{ erro }}</p>
      </div>
    </section>
    <section class="image">
      <img class="img" src="../assets/login.png" alt="" />
    </section>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  min-height: 100vh;
  background: #ffffff;
}

.content {
  width: 60%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  box-sizing: border-box;
}

.auth-card {
  width: min(100%, 420px);
  text-align: center;
}

.image {
  width: 40%;
  min-height: 100vh;
  display: flex;
  justify-content: end;
}

.brand {
  margin: 0 0 0.75rem;
  font-size: clamp(2rem, 3vw, 2.8rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--color-gray);
}

.brand span {
  color: var(--highlights);
}

.title {
  margin: 0 0 1.5rem;
  font-size: 1.15rem;
  font-weight: 700;
  color: #4c4c4c;
}

.social-row {
  display: flex;
  justify-content: center;
  gap: 1.1rem;
  margin-bottom: 1rem;
}

.social-btn {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  border: 1px solid #4c4c4c;
  background: #fff;
  color: #222;
  font-size: 1rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.subtitle {
  margin: 0 0 1.3rem;
  font-size: 0.92rem;
  color: #7b7b7b;
}

.form-group {
  margin-bottom: 0.85rem;
}

.form-control {
  width: 100%;
  height: 3rem;
  border: 1px solid #ececec;
  border-radius: 0.55rem;
  box-sizing: border-box;
  padding: 0 1rem;
  font-size: 0.95rem;
  background: #fff;
  color: #333;
  outline: none;
}

.form-control::placeholder {
  color: #b8b8b8;
}

.form-control:focus {
  border-color: var(--highlights);
  box-shadow: 0 0 0 3px rgba(246, 130, 31, 0.12);
}

.terms {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 1rem 0 1.5rem;
  text-align: left;
  font-size: 0.78rem;
  line-height: 1.45;
  color: #8a8a8a;
}

.terms input {
  width: 1rem;
  height: 1rem;
  margin-top: 0.1rem;
  accent-color: var(--highlights);
  flex: 0 0 auto;
}

.terms a {
  color: var(--highlights);
  text-decoration: none;
}

.submit-btn {
  width: 8.5rem;
  height: 2.9rem;
  border: none;
  border-radius: 0.55rem;
  background: var(--highlights);
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  color: #d64545;
  font-size: 0.9rem;
}

.img {
  width: 100%;
  border-radius: 4rem 0 0 4rem;
  object-fit: cover;
}

@media (max-width: 900px) {
  .container {
    flex-direction: column;
  }

  .content,
  .image {
    width: 100%;
    min-height: auto;
  }

  .content {
    order: 1;
    padding: 3rem 1.25rem 2rem;
  }

  .image {
    order: 2;
    height: 320px;
  }

  .img {
    border-radius: 2rem 2rem 0 0;
  }
}
</style>
