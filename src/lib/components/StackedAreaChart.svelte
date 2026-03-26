<script lang="ts">
	import { LayerCake, Svg } from 'layercake';
	import { stack, stackOrderInsideOut, stackOffsetSilhouette } from 'd3-shape';
	import { scaleLinear } from 'd3-scale';

	import AreaLayer from './AreaLayer.svelte';
	import Annotation from './Annotation.svelte';

	import { regions, regionColors, type YearRow } from '$lib/data/expenditure';
	import type { HistoricalEvent } from '$lib/data/events';

	let {
		data,
		events = [],
		heightPx = 8000
	}: {
		data: YearRow[];
		events?: HistoricalEvent[];
		heightPx?: number;
	} = $props();

	const stackGen = stack<YearRow>()
		.keys([...regions])
		.order(stackOrderInsideOut)
		.offset(stackOffsetSilhouette);

	let stackedData = $derived(stackGen(data));

	// Symmetric X extent — stream centered, extra space on right for text
	let xExtent = $derived.by(() => {
		let min = Infinity;
		let max = -Infinity;
		for (const series of stackedData) {
			for (const d of series) {
				if (d[0] < min) min = d[0];
				if (d[1] > max) max = d[1];
			}
		}
		const abs = Math.max(Math.abs(min), Math.abs(max));
		return [-abs * 1.5, abs * 1.5];
	});

	// Reverse yDomain so LayerCake maps 1992→top, 2024→bottom
	// LayerCake reverses y by default (SVG convention), so we flip the domain
	let yDomain = $derived.by(() => {
		if (data.length === 0) return [2024, 1992];
		return [data[data.length - 1].year, data[0].year];
	});
</script>

<div class="stream-chart" style:height="{heightPx}px">
	<LayerCake
		data={data}
		x={[0, 1]}
		y="year"
		xScale={scaleLinear()}
		yScale={scaleLinear()}
		xDomain={xExtent}
		yDomain={yDomain}
		padding={{ top: 60, right: 20, bottom: 60, left: 20 }}
	>
		<Svg>
			<AreaLayer {stackedData} colors={regionColors} />
			<Annotation {events} />
		</Svg>
	</LayerCake>
</div>

<style>
	.stream-chart {
		width: 100%;
		position: relative;
	}
</style>
