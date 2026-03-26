<script lang="ts">
</script>

<section class="hero">
	<div class="hero-content">
		<h1>Global Military<br />Expenditures:<br /><span class="subtitle-line">A Visual History 1992–2024</span></h1>
		<div class="scroll-hint">
			<span>Scroll to explore</span>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<path d="M12 5v14M19 12l-7 7-7-7" />
			</svg>
		</div>
	</div>
</section>

<style>
	.hero {
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: var(--space-lg);
	}

	.hero-content {
		max-width: 900px;
	}

	h1 {
		font-family: var(--font-display);
		font-size: clamp(3.5rem, 10vw, 8rem);
		font-weight: 400;
		font-style: italic;
		letter-spacing: -0.02em;
		line-height: 1.05;
		color: var(--text);
		margin: 0 0 var(--space-xl);
	}

	.subtitle-line {
		font-family: var(--font-sans);
		font-style: normal;
		font-weight: 300;
		color: var(--text);
		font-size: 0.52em;
	}

	.scroll-hint {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-muted);
		font-size: 1rem;
		font-family: var(--font-sans);
		font-weight: 400;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		animation: drift 2.5s ease infinite;
	}

	@keyframes drift {
		0%, 100% { transform: translateY(0); opacity: 0.5; }
		50% { transform: translateY(5px); opacity: 0.8; }
	}
</style>
