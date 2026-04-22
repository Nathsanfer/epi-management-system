<script setup>
// Importando componentes 
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
</script>

<template>
    <Header />

    <main class="contact-page">

        <!-- SEÇÃO HERO - BANNER -->
        <section class="hero">
            <img class="hero-image" src="../assets/hero.png" alt="EPI Manager em uso" />
            <div class="hero-overlay"></div>

            <div class="hero-content">
                <h1 class="hero-title">Entre em Contato</h1>
                <p class="hero-subtitle">Vamos conversar sobre como melhorar o controle de EPIs com mais seguranca, rastreabilidade e eficiencia.</p>

                <div class="hero-info">
                    <div class="info-item">
                        <span class="info-icon">@</span>
                        <div class="info-text">
                            <span class="info-label">Email</span>
                            <span class="info-value">contato@epimanager.com</span>
                        </div>
                    </div>

                    <div class="info-item">
                        <span class="info-icon">#</span>
                        <div class="info-text">
                            <span class="info-label">Localizacao</span>
                            <span class="info-value">Joinville - SC</span>
                        </div>
                    </div>

                    <div class="info-item">
                        <span class="info-icon">*</span>
                        <div class="info-text">
                            <span class="info-label">Resposta</span>
                            <span class="info-value">24 a 48 horas</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- SEÇÃO FORMULÁRIO -->
        <section class="contact-content">
            <div class="form-side">
                <h2 class="section-title">Envie sua <span class="highlight-word">Mensagem</span></h2>
                <p class="section-description">
                    Tem duvidas sobre o sistema? Quer solicitar uma demonstracao ou suporte? Nossa equipe esta pronta para te
                    atender.
                </p>

                <form class="form" @submit.prevent>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="label" for="name">Nome Completo</label>
                            <input id="name" name="name" class="input" type="text" placeholder="Digite seu nome" required />
                        </div>

                        <div class="form-group">
                            <label class="label" for="email">Email</label>
                            <input id="email" name="email" class="input" type="email" placeholder="seu@email.com" required />
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="label" for="subject">Assunto</label>
                        <select id="subject" name="subject" class="select" required>
                            <option value="" disabled>Selecione um assunto</option>
                            <option value="duvida">Duvida sobre funcionalidades</option>
                            <option value="demonstracao">Solicitar demonstracao</option>
                            <option value="suporte">Suporte tecnico</option>
                            <option value="feedback">Feedback do sistema</option>
                            <option value="outro">Outro</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="label" for="message">Mensagem</label>
                        <textarea id="message" name="message" class="textarea" placeholder="Conte para nossa equipe como podemos ajudar..."
                            rows="6" required></textarea>
                    </div>

                    <button type="submit" class="submit-button">Enviar Mensagem</button>
                </form>
            </div>

            <aside class="info-side">
                <article class="info-card">
                    <h3 class="info-title">Vamos Conversar!</h3>
                    <p class="info-description">
                        Cada mensagem ajuda a evoluir a gestao de EPIs. Queremos entender seu cenario para oferecer a melhor
                        experiencia no uso da plataforma.
                    </p>

                    <div class="social-section">
                        <h4 class="social-title">Acompanhe nossas redes</h4>
                        <div class="social-links">
                            <a href="#" class="social-link" aria-label="Instagram">IG</a>
                            <a href="#" class="social-link" aria-label="YouTube">YT</a>
                            <a href="#" class="social-link" aria-label="Facebook">FB</a>
                        </div>
                    </div>
                </article>

                <article class="reasons-card">
                    <h3 class="info-title">Por que entrar em contato?</h3>

                    <div class="reason-item">
                        <span class="reason-icon">?</span>
                        <div>
                            <h4 class="reason-title">Tire suas duvidas</h4>
                            <p class="reason-text">Entenda funcionalidades, fluxos e aplicacao no seu ambiente.</p>
                        </div>
                    </div>

                    <div class="reason-item">
                        <span class="reason-icon">+</span>
                        <div>
                            <h4 class="reason-title">Compartilhe necessidades</h4>
                            <p class="reason-text">Conte os desafios da sua rotina para ajustarmos a melhor solucao.</p>
                        </div>
                    </div>

                    <div class="reason-item">
                        <span class="reason-icon">!</span>
                        <div>
                            <h4 class="reason-title">Solicite melhorias</h4>
                            <p class="reason-text">Sugira evolucoes para tornar a gestao de EPIs ainda mais eficiente.</p>
                        </div>
                    </div>
                </article>
            </aside>
        </section>
    </main>

    <Footer />
</template>

<style scoped>
.contact-page {
    background: linear-gradient(180deg, #f8f8f8 0%, #f2f2f2 100%);
}

/* Estilização da seção hero */

.hero {
    position: relative;
    min-height: 460px;
    display: grid;
    place-items: center;
    overflow: hidden;
}

.hero-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.55);
}

.hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(125deg, rgba(61, 60, 58, 0.6), rgba(61, 60, 58, 0.24));
}

.hero-content {
    position: relative;
    z-index: 2;
    width: min(92%, 1080px);
    text-align: center;
    color: #fff;
    padding: 2rem 0;
}

.hero-title {
    margin: 0;
    font-family: var(--font-secondary);
    font-size: clamp(2.1rem, 4.6vw, 3.35rem);
    font-weight: 500;
}

.hero-subtitle {
    margin: 1rem auto 2.2rem;
    max-width: 760px;
    font-family: var(--font-primary);
    font-size: 1.15rem;
    line-height: 1.55;
    color: #f0f0f0;
}

.hero-info {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 1rem 1.2rem;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.22);
    backdrop-filter: blur(8px);
}

.info-icon {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--highlights);
    color: #fff;
    font-weight: 700;
    font-family: var(--font-primary);
}

.info-text {
    text-align: left;
    display: flex;
    flex-direction: column;
}

.info-label {
    font-size: 0.78rem;
    font-family: var(--font-primary);
    color: #f1f1f1;
}

.info-value {
    font-size: 0.98rem;
    font-family: var(--font-primary);
    color: #fff;
}

/* Estilização da seção formulário */

.contact-content {
    width: min(92%, 1200px);
    margin: 0 auto;
    padding: 4rem 0 4.2rem;
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2.2rem;
}

.section-title {
    margin: 0;
    font-family: var(--font-secondary);
    color: var(--color-gray);
    font-size: 2rem;
    font-weight: 500;
}

.highlight-word {
    color: var(--highlights);
}

.section-description {
    margin: 0.9rem 0 1.4rem;
    font-family: var(--font-primary);
    color: #656565;
    line-height: 1.6;
    max-width: 800px;
}

.form {
    background: #fff;
    border: 1px solid #ebebeb;
    border-radius: 18px;
    box-shadow: 0 10px 26px rgba(0, 0, 0, 0.06);
    padding: 1.7rem;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
}

.label {
    font-family: var(--font-primary);
    font-weight: 700;
    color: #3f3f3f;
    margin-bottom: 0.42rem;
}

.input,
.select,
.textarea {
    border: 2px solid #e8e8e8;
    border-radius: 10px;
    padding: 0.8rem 0.9rem;
    font-family: var(--font-primary);
    font-size: 1rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    background: #fff;
}

.input:focus,
.select:focus,
.textarea:focus {
    outline: none;
    border-color: var(--highlights);
    box-shadow: 0 0 0 4px rgba(246, 130, 31, 0.15);
}

.textarea {
    min-height: 120px;
    resize: vertical;
}

.submit-button {
    width: 100%;
    border: 0;
    border-radius: 12px;
    background: var(--highlights);
    color: #fff;
    font-family: var(--font-primary);
    font-size: 1.05rem;
    font-weight: 700;
    padding: 0.9rem 1.2rem;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.submit-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(246, 130, 31, 0.34);
}

.info-side {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.info-card,
.reasons-card {
    background: #fff;
    border: 1px solid #ececec;
    border-radius: 18px;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);
    padding: 1.3rem;
}

.info-title {
    margin: 0;
    color: var(--color-gray);
    font-size: 1.35rem;
    font-family: var(--font-secondary);
    font-weight: 500;
}

.info-description {
    margin: 0.8rem 0 0;
    color: #5f5f5f;
    line-height: 1.6;
    font-family: var(--font-primary);
}

.social-section {
    margin-top: 1.15rem;
    border-top: 1px solid #efefef;
    padding-top: 1rem;
}

.social-title {
    margin: 0;
    color: #4f4f4f;
    font-size: 1rem;
    font-family: var(--font-primary);
}

.social-links {
    margin-top: 0.75rem;
    display: flex;
    gap: 0.65rem;
}

.social-link {
    width: 40px;
    height: 40px;
    border-radius: 999px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--highlights);
    color: #fff;
    font-weight: 700;
    font-family: var(--font-primary);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.social-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 18px rgba(246, 130, 31, 0.32);
}

.reason-item {
    margin-top: 1rem;
    display: flex;
    gap: 0.65rem;
}

.reason-icon {
    width: 30px;
    height: 30px;
    flex-shrink: 0;
    border-radius: 999px;
    background: color-mix(in srgb, var(--highlights) 15%, white);
    color: var(--highlights);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    margin-top: 0.15rem;
}

.reason-title {
    margin: 0;
    color: #434343;
    font-size: 1.02rem;
    font-family: var(--font-primary);
}

.reason-text {
    margin: 0.2rem 0 0;
    color: #666;
    line-height: 1.45;
    font-family: var(--font-primary);
    font-size: 0.95rem;
}

@media (max-width: 1024px) {
    .contact-content {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 760px) {
    .hero {
        min-height: 560px;
    }

    .hero-info {
        flex-direction: column;
        align-items: stretch;
    }

    .form-row {
        grid-template-columns: 1fr;
    }
}
</style>
