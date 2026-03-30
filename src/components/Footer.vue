<template>
	<footer class="footer">
		<div class="footer-main">
			<div class="brand-column">
				<h2 class="brand-title">
					<span class="brand-highlight">EPI</span>
					<span class="brand-normal">MANAGER</span>
				</h2>

				<div class="social-list" aria-label="Redes sociais">
					<a href="#" class="social-item" aria-label="Google">G</a>
					<a href="#" class="social-item" aria-label="Facebook">f</a>
					<a href="#" class="social-item" aria-label="Twitter">t</a>
				</div>
			</div>

			<div class="divider" aria-hidden="true"></div>

			<p class="footer-description">
				Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
				industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
				scrambled it to make a type specimen book. It has survived not only five centuries.
			</p>
		</div>

		<div class="footer-separator" aria-hidden="true"></div>

		<div class="footer-bottom">
			<p class="footer-copy">Copyright @ 2025 IT Companyo All Rights Reserved</p>
			<p class="footer-links">User Terms & Conditions | Privacy Policy</p>
		</div>
	</footer>
</template>

<style scoped>
.footer {
	background-color: #ffffff;
	margin-top: 1rem;
}

.footer-main {
	max-width: 1200px;
	margin: 0 auto;
	padding: 2.2rem 2rem 1.4rem;
	display: grid;
	grid-template-columns: 230px 2px 1fr;
	align-items: start;
	gap: 2rem;
}

.brand-title {
	margin: 0;
	font-size: 1.4rem;
	font-weight: 700;
	letter-spacing: 0.4px;
	font-family: var(--font-primary);
}

.brand-highlight {
	color: var(--highlights);
	margin-right: 0.7rem;
}

.brand-normal {
	color: #494949;
}

.social-list {
	margin-top: 1.3rem;
	display: flex;
	align-items: center;
	gap: 1.1rem;
}

.social-item {
	width: 26px;
	height: 26px;
	border: 1px solid #151515;
	border-radius: 999px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	color: #151515;
	text-decoration: none;
	font-size: 1.7rem;
	font-weight: 500;
	line-height: 1;
}

.divider {
	width: 2px;
	min-height: 82px;
	background-color: var(--highlights);
}

.footer-description {
	margin: 0;
	max-width: 830px;
	color: #6d6d6d;
	font-size: 1rem;
	line-height: 1.35;
    margin-left: 3rem;  
	font-family: var(--font-primary);
}

.footer-separator {
	height: 1px;
	max-width: 1200px;
	margin: 0 auto;
	background-color: #d7d7d7;
}

.footer-bottom {
	background-color: var(--highlights);
	color: #fff;
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
	padding: 0.4rem 2rem;
	font-size: 1rem;
	font-family: var(--font-primary);
}

.footer-copy,
.footer-links {
	margin: 0;
}

@media (max-width: 860px) {
	.footer-main {
		grid-template-columns: 1fr;
		gap: 1.2rem;
	}

	.divider {
		width: 80px;
		min-height: 2px;
	}

	.footer-bottom {
		flex-direction: column;
		text-align: center;
	}
}
</style>
