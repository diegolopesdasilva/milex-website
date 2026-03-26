<script lang="ts">
	import { getContext } from 'svelte';
	import type { HistoricalEvent } from '$lib/data/events';

	let {
		events = []
	}: {
		events?: HistoricalEvent[];
	} = $props();

	const { yScale, width, padding } = getContext('LayerCake');
</script>

<g class="annotations">
	{#each events as event}
		{@const y = $yScale(event.year)}
		<line
			x1={$padding.left}
			x2={$width - $padding.right}
			y1={y}
			y2={y}
			stroke="var(--text)"
			stroke-width="0.5"
			opacity="0.1"
			stroke-dasharray="4,4"
		/>
	{/each}
</g>
