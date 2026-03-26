<script lang="ts">
	import { regionColors, regions } from '$lib/data/expenditure';
</script>

<div class="legend">
	{#each regions as region}
		<div class="legend-item">
			<span class="swatch" style:background-color={regionColors[region]}></span>
			<span class="label">{region}</span>
		</div>
	{/each}
</div>

<style>
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.5rem;
		justify-content: center;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	.swatch {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.label {
		font-size: 0.95rem;
		color: var(--text);
		font-family: var(--font-sans);
		font-weight: 400;
		white-space: nowrap;
	}
</style>
