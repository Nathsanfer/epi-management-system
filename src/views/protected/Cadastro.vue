<script setup>
  import { ref, onMounted, computed } from 'vue';
  import { useSupabase } from '../../composables/useSupabase';

  const { supabase, session } = useSupabase();

  const usuarios = ref([]);

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

  onMounted(() => {
    carregarUsuarios();
  })



</script>

<template>
  <section class="page">
    <div class="toolbar">
      <button class="btn">Cadastrar Novo Usuário</button>
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
            <button class="options-btn" type="button" aria-label="Mais opções">...</button>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

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

.options-btn {
  min-width: 40px;
  height: 36px;
  border: 1px solid #e2e2e2;
  border-radius: 10px;
  background-color: #fff;
  color: #666;
  font-size: 1.05rem;
  line-height: 1;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.options-btn:hover {
  background-color: #f7f7f7;
  border-color: #d7d7d7;
  color: #444;
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
</style>
