<template>
  <main class="not-found">
    <div class="top-pattern" aria-hidden="true"></div>

    <section class="panel">
      <p class="status-code">404</p>
      <h1 class="title">Pagina nao encontrada</h1>
      <p class="description">
        A rota que voce tentou acessar nao existe ou foi movida. Volte para a pagina inicial e continue a navegacao
        pelo sistema de gestao de EPIs.
      </p>

      <div class="actions">
        <RouterLink to="/" class="btn primary">Voltar para Home</RouterLink>
        <RouterLink to="/contato" class="btn ghost">Entrar em Contato</RouterLink>
      </div>
    </section>

    <div class="bottom-pattern" aria-hidden="true"></div>
  </main>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  background: linear-gradient(180deg, #f6f6f6 0%, #ededed 100%);
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.top-pattern,
.bottom-pattern {
  height: 34px;
  background-image: url('../assets/wallpaper-geometrico.png');
  background-repeat: repeat-x;
  background-position: center;
  background-size: auto 100%;
}

.panel {
  width: min(92%, 860px);
  margin: 2.5rem auto;
  background: #ffffff;
  border-radius: 28px;
  border: 1px solid #ececec;
  box-shadow: 0 16px 34px rgba(61, 60, 58, 0.12);
  padding: 3.2rem 2.6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(246, 130, 31, 0.13), transparent 48%);
  pointer-events: none;
}

.status-code {
  margin: 0;
  font-family: var(--font-secondary);
  font-size: clamp(3.8rem, 12vw, 7rem);
  line-height: 1;
  color: var(--highlights);
}

.title {
  margin: 0.4rem 0 0.8rem;
  font-family: var(--font-secondary);
  font-size: clamp(1.7rem, 3.5vw, 2.4rem);
  color: var(--color-gray);
  font-weight: 500;
}

.description {
  margin: 0;
  max-width: 640px;
  font-family: var(--font-primary);
  font-size: 1.07rem;
  line-height: 1.6;
  color: #575757;
}

.actions {
  margin-top: 2rem;
  display: flex;
  gap: 0.9rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  text-decoration: none;
  font-family: var(--font-primary);
  font-size: 1rem;
  padding: 0.78rem 1.25rem;
  border-radius: 12px;
  border: 1px solid transparent;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.btn.primary {
  background: var(--highlights);
  color: #fff;
}

.btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(246, 130, 31, 0.32);
}

.btn.ghost {
  color: var(--color-gray);
  border-color: #d5d5d5;
  background: #fff;
}

.btn.ghost:hover {
  border-color: var(--highlights);
  color: var(--highlights);
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .panel {
    padding: 2.4rem 1.25rem;
    border-radius: 20px;
  }

  .description {
    font-size: 1rem;
  }

  .btn {
    width: 100%;
  }
}
</style>
