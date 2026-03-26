<script lang="ts">
	import { getContext } from 'svelte';
	import { area, curveMonotoneY } from 'd3-shape';

	let { stackedData, colors }: { stackedData: any[]; colors: Record<string, string> } = $props();

	const { xScale, yScale } = getContext('LayerCake');
</script>

<g class="area-layer">
	{#each stackedData as series}
		{@const areaGen = area()
			.y((d: any) => $yScale(d.data.year))
			.x0((d: any) => $xScale(d[0]))
			.x1((d: any) => $xScale(d[1]))
			.curve(curveMonotoneY)}
		<path
			d={areaGen(series) ?? ''}
			fill={colors[series.key] || '#ccc'}
			opacity="0.9"
			stroke={colors[series.key] || '#ccc'}
			stroke-width="0.5"
		/>
	{/each}
</g>
