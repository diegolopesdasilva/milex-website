<script lang="ts">
	let { year, title, description, active = false }: {
		year: number;
		title: string;
		description: string;
		active?: boolean;
	} = $props();
</script>

<div class="step" class:active data-year={year}>
	<span class="year-badge">{year}</span>
	<h3>{title}</h3>
	<p>{description}</p>
</div>

<style>
	.step {
		padding: var(--space-lg);
		margin-bottom: var(--space-xl);
		opacity: 0.25;
		transition: opacity 0.4s ease;
		background: var(--bg-card);
		border: 1px solid var(--border-light);
		border-radius: 10px;
	}

	.step.active {
		opacity: 1;
		border-color: var(--border);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	}

	.year-badge {
		display: inline-block;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--chart-annotation);
		background: rgba(239, 68, 68, 0.08);
		padding: 0.2rem 0.6rem;
		border-radius: 4px;
		margin-bottom: 0.5rem;
	}

	h3 {
		font-family: var(--font-sans);
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 0.5rem;
		line-height: 1.3;
	}

	p {
		font-family: var(--font-sans);
		font-size: 0.9rem;
		color: var(--text-muted);
		line-height: 1.6;
		margin: 0;
	}
</style>
