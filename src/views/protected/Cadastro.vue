<script setup>
  import { ref, onMounted, computed } from 'vue';
  import { createClient } from '@supabase/supabase-js';
  import { useSupabase } from '../../composables/useSupabase';

  const { supabase, session } = useSupabase();
  const authSupabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const usuarios = ref([]);
  const modalRegister = ref(false);
  const menuAbertoId = ref(null);
  const modalEditFuncao = ref(false);
  const usuarioEditandoId = ref(null);
  const editFuncaoUsuario = ref('operador');
  const salvandoEdicao = ref(false);
  const erroEdicao = ref('');

  const nomeNovoUsuario = ref('');
  const emailNovoUsuario = ref('');
  const senhaNovoUsuario = ref('');
  const funcaoNovoUsuario = ref('operador');

  const avatarSelecionado = ref('');

  const salvandoCadastro = ref(false);
  const erroCadastro = ref('');
  const sucessoCadastro = ref('');

  const storageBaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');

  const avatarUrlPublica = (nomeArquivo) =>
    `${storageBaseUrl}/storage/v1/object/public/avatares/${nomeArquivo}`;

  const avataresDisponiveis = ref([
    { key: 'usuario_h.jpeg', label: 'Imagem 1', src: avatarUrlPublica('usuario_h.jpeg') },
    { key: 'usuario_m.jpeg', label: 'Imagem 2', src: avatarUrlPublica('usuario_m.jpeg') },
  ]);

  const pesquisa = ref('');
  const filtroAtivo = ref('todos');

  const filtros = [
    { label: 'Todos', value: 'todos' },
    { label: 'Administradores', value: 'administrador' },
    { label: 'Operadores', value: 'operador' }
  ]

  const normalizarTexto = (valor) => {
    return String(valor ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  };

  const formatarFuncao = (valor) => {
    const texto = String(valor ?? '').trim().toLowerCase();
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  };

  const usuariosFiltrados = computed(() => {
    const termo = normalizarTexto(pesquisa.value);

    return usuarios.value.filter((item) => {
      const funcao = normalizarTexto(item.funcao);
      const bateFiltro =
        filtroAtivo.value === 'todos' || funcao === filtroAtivo.value;

      const textoBusca = normalizarTexto(
        [item.nome_completo, item.email, item.funcao].filter(Boolean).join(' ')
      );

      const bateBusca = !termo || textoBusca.includes(termo);

      return bateFiltro && bateBusca;
    });
  });

  const obterEmailUsuario = (item) => {
    if (item?.id && item.id === session.value?.user?.id) {
      return session.value?.user?.email ?? item?.email ?? 'Nao informado';
    }

    return item?.email ?? 'Nao informado';
  };

  const carregarUsuarios = async () => {
    const { data: dataComEmailAuth, error: erroComEmailAuth } = await supabase
      .rpc('listar_usuarios_com_email');

    if (!erroComEmailAuth && Array.isArray(dataComEmailAuth)) {
      usuarios.value = dataComEmailAuth;
      return;
    }

    const { data, error } = await supabase
      .from('usuario')
      .select('*');

    if (error) {
      console.error('Erro ao carregar dados dos usuários:', error);
      return;
    }

    usuarios.value = data;
  }

  function openRegisterModal() {
    modalRegister.value = true;
  }

  function closeRegisterModal() {
    modalRegister.value = false;
    erroCadastro.value = '';
    sucessoCadastro.value = '';

    nomeNovoUsuario.value = '';
    emailNovoUsuario.value = '';
    senhaNovoUsuario.value = '';
    funcaoNovoUsuario.value = 'operador';
    avatarSelecionado.value = '';
  }

  function selecionarAvatar(avatarKey) {
    avatarSelecionado.value = avatarKey;
  }

  function toggleMenuOpcoes(id) {
    menuAbertoId.value = menuAbertoId.value === id ? null : id;
  }

  function fecharMenuOpcoes() {
    menuAbertoId.value = null;
  }

  function abrirModalEditarFuncao(item) {
    usuarioEditandoId.value = item.id;
    editFuncaoUsuario.value = normalizarTexto(item.funcao) === 'administrador' ? 'administrador' : 'operador';
    erroEdicao.value = '';
    modalEditFuncao.value = true;
    fecharMenuOpcoes();
  }

  function fecharModalEditarFuncao() {
    modalEditFuncao.value = false;
    usuarioEditandoId.value = null;
    erroEdicao.value = '';
  }

  async function salvarEdicaoFuncao() {
    if (!usuarioEditandoId.value) {
      erroEdicao.value = 'Usuário inválido para edição.';
      return;
    }

    salvandoEdicao.value = true;

    const { error } = await supabase
      .from('usuario')
      .update({
        funcao: formatarFuncao(editFuncaoUsuario.value),
      })
      .eq('id', usuarioEditandoId.value);

    salvandoEdicao.value = false;

    if (error) {
      erroEdicao.value = error.message;
      return;
    }

    await carregarUsuarios();
    fecharModalEditarFuncao();
  }

  async function deletarUsuario(item) {
    fecharMenuOpcoes();

    if (!item?.id) return;

    const confirmado = window.confirm(`Tem certeza que deseja deletar o usuário "${item.nome_completo}"?`);
    if (!confirmado) return;

    const { error } = await supabase
      .from('usuario')
      .delete()
      .eq('id', item.id);

    if (error) {
      window.alert(`Erro ao deletar usuário: ${error.message}`);
      return;
    }

    await carregarUsuarios();
  }

  async function cadastrarUsuario() {
    erroCadastro.value = '';
    sucessoCadastro.value = '';

    if (!nomeNovoUsuario.value.trim()) {
      erroCadastro.value = 'Informe o nome do usuário.';
      return;
    }

    if (!emailNovoUsuario.value.trim()) {
      erroCadastro.value = 'Informe o e-mail do usuário.';
      return;
    }

    if (!senhaNovoUsuario.value.trim()) {
      erroCadastro.value = 'Informe a senha do usuário.';
      return;
    }

    if (senhaNovoUsuario.value.trim().length < 6) {
      erroCadastro.value = 'A senha precisa ter pelo menos 6 caracteres.';
      return;
    }

    if (!avatarSelecionado.value) {
      erroCadastro.value = 'Selecione uma imagem para o usuário.';
      return;
    }

    salvandoCadastro.value = true;
    const imagemUrl =
      avataresDisponiveis.value.find(
        (avatar) => avatar.key === avatarSelecionado.value,
      )?.src || avatarUrlPublica(avatarSelecionado.value);

    // Envia dados para a trigger que popula a tabela usuario
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
      const mensagemErro = String(authError.message || '').toLowerCase();

      if (mensagemErro.includes('user already registered')) {
        erroCadastro.value = 'Este e-mail já está cadastrado.';
        return;
      }

      if (mensagemErro.includes('email rate limit exceeded')) {
        erroCadastro.value = 'Limite de envio de e-mail atingido.';
        return;
      }

      if (mensagemErro.includes('database error saving new user')) {
        erroCadastro.value =
          'Erro ao salvar novo usuário no banco de autenticação. Verifique a trigger de criação de usuário no Supabase (campos esperados em raw_user_meta_data).';
        return;
      }

      erroCadastro.value = authError.message;
      return;
    }

    sucessoCadastro.value = 'Usuário cadastrado com sucesso!';
    await carregarUsuarios();
    closeRegisterModal();
  }

  onMounted(() => {
    carregarUsuarios();
  })

</script>

<template>
  <section class="page" @click="fecharMenuOpcoes">
    <div class="toolbar">
      <button class="btn" type="button" @click="openRegisterModal">Cadastrar Novo Usuário</button>
      <input
        v-model="pesquisa"
        type="search"
        placeholder="Pesquisar por nome"
        class="search-input"
      >
      <div class="filters">
        <button
          v-for="filtro in filtros"
          :key="filtro.value"
          class="filter-btn"
          :class="{ 'filter-btn--active': filtroAtivo === filtro.value }"
          @click="filtroAtivo = filtro.value"
        >
          {{ filtro.label }}
        </button>
      </div>
    </div>
    <div class="container-scroll">
      <ul class="list">
        <li class="element" v-for="item in usuariosFiltrados" :key="item.id">
          <div class="container-left">
            <img
              class="avatar"
              :src="item.imagem"
            >
          </div>

          <div class="container-right">
            <div class="info-list">
              <div class="info-row">
                <p class="label">Nome</p>
                <p class="value">{{ item.nome_completo }}</p>
              </div>
              <div class="info-row">
                <p class="label">E-mail</p>
                <p class="value">{{ obterEmailUsuario(item) }}</p>
              </div>
              <div class="info-row">
                <p class="label">Função</p>
                <p class="value">{{ item.funcao }}</p>
              </div>
            </div>
          </div>

          <div class="card-options">
            <div class="more-options-wrapper" @click.stop>
              <button
                class="more-options-btn"
                type="button"
                aria-label="Mais opções"
                @click="toggleMenuOpcoes(item.id)"
              >
                &#8942;
              </button>

              <div v-if="menuAbertoId === item.id" class="options-menu">
                <button
                  class="options-menu-btn"
                  type="button"
                  @click="abrirModalEditarFuncao(item)"
                >
                  Editar função
                </button>
                <button
                  class="options-menu-btn options-menu-btn--delete"
                  type="button"
                  @click="deletarUsuario(item)"
                >
                  Deletar usuário
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
            <select
              id="funcao-usuario"
              class="select"
              v-model="funcaoNovoUsuario"
            >
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
            {{ salvandoCadastro ? 'Cadastrando...' : 'Cadastrar Usuário' }}
          </button>
        </div>
      </div>
    </div>

    <div class="container_modal" v-if="modalEditFuncao" @click="fecharModalEditarFuncao">
      <div class="modal_content modal_content--small" @click.stop>
        <div class="modal_inputs">
          <h2 class="modal_title">Editar Função do Usuário</h2>

          <div class="container_input1">
            <label for="edit-funcao-usuario" class="label">Função</label>
            <select
              id="edit-funcao-usuario"
              class="select"
              v-model="editFuncaoUsuario"
            >
              <option value="administrador">Administrador</option>
              <option value="operador">Operador</option>
            </select>
          </div>

          <p v-if="erroEdicao" class="cadastro_feedback cadastro_feedback--erro">
            {{ erroEdicao }}
          </p>
        </div>

        <div class="modal_actions">
          <button class="modal_btn modal_btn--secondary" type="button" @click="fecharModalEditarFuncao">
            Cancelar
          </button>
          <button
            class="modal_btn"
            type="button"
            :disabled="salvandoEdicao"
            @click="salvarEdicaoFuncao"
          >
            {{ salvandoEdicao ? 'Salvando...' : 'Salvar função' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>

.page {
  position: relative;
}

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
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 0.85rem;
  display: flex;
  flex-direction: row;
  gap: 1.8rem;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 2px 6px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  justify-content: center;
}

.element:hover {
  border-color: #d0d0d0;
  box-shadow:
    0 12px 36px rgba(0, 0, 0, 0.12),
    0 4px 10px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.container-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  flex-shrink: 0;
  min-width: 130px;
  width: 130px;
  border-right: 1px solid #f0f0f0;
  padding-right: 1.2rem;
}

.container-right {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1;
  min-width: 0;
  justify-content: center;
}

.card-options {
  display: flex;
  align-items: center;
}

.more-options-wrapper {
  margin-left: 0.8rem;
  position: relative;
  z-index: 6;
}

.options-menu {
  position: absolute;
  top: 50%;
  right: calc(100% + 0.5rem);
  transform: translateY(-50%);
  min-width: 160px;
  border: 1px solid #e7e7e7;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  z-index: 10;
  padding: 0.3rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.options-menu-btn {
  height: 34px;
  border: none;
  background: #fff;
  border-radius: 8px;
  text-align: left;
  padding: 0 0.6rem;
  color: #333;
  font-size: 0.82rem;
  cursor: pointer;
}

.options-menu-btn:hover {
  background: #f6f6f6;
}

.options-menu-btn--delete {
  color: #b42318;
}

.info-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.55rem;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  background: linear-gradient(135deg, #fafbfc 0%, #f5f6f8 100%);
  padding: 0.55rem;
  border-radius: 10px;
  border: 1px solid #f0f1f3;
}

.avatar {
  width: 78px;
  height: 78px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
}

.name-value {
  font-size: 1.45rem;
  font-weight: 800;
  color: #0f0f0f;
  margin: 0;
  letter-spacing: -0.3px;
}

.more-options-btn {
  border: none;
  background: transparent;
  color: #555;
  font-size: 1.4rem;
  line-height: 1;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
}

.more-options-btn:hover {
  color: #222;
}

.badge-tipo {
  margin: 0;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.badge-aluno {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #0d47a1;
}

.card-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
  padding-bottom: 0.6rem;
  border-bottom: 2px solid #f5f5f5;
}

.data-block {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  background: linear-gradient(135deg, #fafbfc 0%, #f5f6f8 100%);
  padding: 0.45rem;
  border-radius: 10px;
  border: 1px solid #f0f1f3;
  transition: all 0.2s ease;
}

.data-block:hover {
  background: linear-gradient(135deg, #f5f6f8 0%, #eff0f3 100%);
  border-color: #e8eaed;
}

.label {
  margin: 0;
  font-size: 0.6rem;
  color: #999999;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1px;
}

.value {
  margin: 0;
  font-size: 0.75rem;
  color: #333333;
  font-weight: 600;
  word-break: break-word;
}

.card-extra {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.55rem;
  padding-top: 0.5rem;
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
  grid-template-columns: 1.3fr 0.8fr;
  gap: 1rem;
  padding: 1rem;
}

.modal_content--small {
  width: min(460px, 96vw);
  grid-template-columns: 1fr;
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
  gap: 0.8rem;
}

.avatar-picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.avatar-picker__label {
  margin: 0;
}

.avatar-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.avatar-option {
  border: 1px solid #d9d9d9;
  border-radius: 16px;
  background: #fff;
  padding: 0.65rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  transition: all 0.2s ease;
}

.avatar-option:hover {
  border-color: #f6821f;
  box-shadow: 0 0 0 2px rgba(246, 130, 31, 0.1);
}

.avatar-option--active {
  border-color: #f6821f;
  background: #fff3e8;
  box-shadow: 0 0 0 2px rgba(246, 130, 31, 0.15);
}

.avatar-option__image {
  width: 100%;
  max-width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.avatar-option__label {
  font-size: 0.85rem;
  color: #444;
  font-weight: 600;
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

.modal_btn--secondary {
  background: #efefef;
  color: #444;
}

.modal_btn--secondary:hover {
  background: #e5e5e5;
}

.modal_actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  align-items: center;
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
