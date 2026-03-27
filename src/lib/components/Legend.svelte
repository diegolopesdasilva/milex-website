<script lang="ts">
	import { regionColors, regions } from '$lib/data/expenditure';

	let {
		activeRegion = null,
		onRegionClick = (_region: string | null) => {}
	}: {
		activeRegion?: string | null;
		onRegionClick?: (region: string | null) => void;
	} = $props();

	function handleClick(region: string) {
		if (activeRegion === region) {
			onRegionClick(null); // deselect → back to world view
		} else {
			onRegionClick(region);
		}
	}
</script>

<div class="legend">
	{#if activeRegion}
		<button
			class="legend-item world-btn"
			onclick={() => onRegionClick(null)}
		>
			<span class="world-icon">←</span>
			<span class="label">World</span>
		</button>
	{/if}
	{#each regions as region}
		<button
			class="legend-item"
			class:active={activeRegion === region}
			class:dimmed={activeRegion !== null && activeRegion !== region}
			onclick={() => handleClick(region)}
		>
			<span class="swatch" style:background-color={regionColors[region]}></span>
			<span class="label">{region}</span>
		</button>
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
		background: none;
		border: none;
		padding: 0.3rem 0.5rem;
		border-radius: 4px;
		cursor: pointer;
		transition: opacity 0.3s ease, background 0.3s ease;
	}

	.legend-item:hover {
		background: rgba(0, 0, 0, 0.04);
	}

	.legend-item.dimmed {
		opacity: 0.3;
	}

	.legend-item.active {
		background: rgba(0, 0, 0, 0.06);
	}

	.world-btn {
		border-right: 1px solid var(--border-light);
		padding-right: 1rem;
		margin-right: 0.5rem;
	}

	.world-icon {
		font-size: 0.9rem;
		color: var(--text-muted);
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
