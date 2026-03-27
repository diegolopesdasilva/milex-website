<script lang="ts">
	import { getContext } from 'svelte';
	import { area, curveMonotoneY } from 'd3-shape';

	let {
		stackedData,
		colors,
		activeRegion = null
	}: {
		stackedData: any[];
		colors: Record<string, string>;
		activeRegion?: string | null;
	} = $props();

	const { xScale, yScale } = getContext('LayerCake');
</script>

<g class="area-layer">
	{#each stackedData as series}
		{@const areaGen = area()
			.y((d: any) => $yScale(d.data.year))
			.x0((d: any) => $xScale(d[0]))
			.x1((d: any) => $xScale(d[1]))
			.curve(curveMonotoneY)}
		{@const isActive = !activeRegion || activeRegion === series.key}
		<path
			d={areaGen(series) ?? ''}
			fill={colors[series.key] || '#ccc'}
			opacity={isActive ? 0.9 : 0.08}
			stroke={colors[series.key] || '#ccc'}
			stroke-width="0.5"
			style="transition: d 0.8s ease-in-out, opacity 0.5s ease;"
		/>
	{/each}
</g>
