<script lang="ts">
</script>

<section class="hero">
	<div class="hero-content">
		<h1>Global Military<br />Expenditures:<br /><span class="subtitle-line">A Visual History 1992–2024</span></h1>
		<p class="byline">By <a href="https://diegolopesdasilva.github.io/website/" target="_blank" rel="noopener">Diego Lopes da Silva</a></p>
	</div>
</section>

<style>
	.hero {
		min-height: 60vh;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: var(--space-xxl) var(--space-lg) var(--space-lg);
	}

	.hero-content {
		max-width: 900px;
		/* Shift to align with chart column center (90px ruler / 2 = 45px) */
		transform: translateX(45px);
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

	.byline {
		font-family: var(--font-sans);
		font-size: 1.05rem;
		font-weight: 300;
		color: var(--text-light);
		margin: 0;
		letter-spacing: 0.02em;
	}

	.byline a {
		color: var(--text-muted);
		text-decoration: none;
		border-bottom: 1px solid var(--border-light);
		transition: color 0.2s ease, border-color 0.2s ease;
	}

	.byline a:hover {
		color: var(--text);
		border-color: var(--text-muted);
	}

</style>
