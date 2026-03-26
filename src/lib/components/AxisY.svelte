<script lang="ts">
	import { getContext } from 'svelte';

	const { yScale, width, padding } = getContext('LayerCake');

	let ticks: number[] = $derived.by(() => {
		const domain = $yScale.domain();
		const start = Math.ceil(domain[0] / 5) * 5;
		const end = domain[1];
		const result: number[] = [];
		for (let y = start; y <= end; y += 5) {
			result.push(y);
		}
		return result;
	});

	let centerX = $derived(($width - $padding.left - $padding.right) / 2 + $padding.left);
</script>

<g class="axis-y">
	{#each ticks as tick}
		{@const y = $yScale(tick)}
		{@const isMajor = tick % 10 === 0}
		{#if isMajor}
			<text
				x={centerX}
				y={y}
				text-anchor="middle"
				dominant-baseline="middle"
				fill="var(--text-light)"
				font-size="13"
				font-weight="400"
				font-family="var(--font-sans)"
				opacity="0.3"
			>
				{tick}
			</text>
		{/if}
	{/each}
</g>
