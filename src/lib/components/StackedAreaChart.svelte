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
		heightPx = 8000,
		activeRegion = null,
		onRegionClick = (_region: string | null) => {},
	}: {
		data: YearRow[];
		events?: HistoricalEvent[];
		heightPx?: number;
		activeRegion?: string | null;
		onRegionClick?: (region: string | null) => void;
	} = $props();

	// ── Hover state ──
	let hoveredRegion: string | null = $state(null);
	let tooltipX = $state(0);
	let tooltipY = $state(0);
	let showTooltip = $state(false);

	// When a region is selected, zero out the others so the stream morphs
	let filteredData = $derived.by(() => {
		if (!activeRegion) return data;
		return data.map((row) => {
			const newRow: YearRow = { year: row.year };
			for (const r of regions) {
				(newRow as any)[r] = r === activeRegion ? (row as any)[r] : 0;
			}
			return newRow;
		});
	});

	const stackGen = stack<YearRow>()
		.keys([...regions])
		.order(stackOrderInsideOut)
		.offset(stackOffsetSilhouette);

	let stackedData = $derived(stackGen(filteredData));

	// Symmetric X extent — when filtering, rescale to fill same width
	let xExtent = $derived.by(() => {
		// Compute extent from the current (possibly filtered) stacked data
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

	// Reverse yDomain so LayerCake maps 1992→top, 2025→bottom
	let yDomain = $derived.by(() => {
		if (data.length === 0) return [2025, 1992];
		return [data[data.length - 1].year, data[0].year];
	});

	// ── Hit detection: which region is the cursor over? ──
	function findRegionAtPoint(e: MouseEvent) {
		const chartEl = e.currentTarget as HTMLElement;
		const rect = chartEl.getBoundingClientRect();
		const relY = (e.clientY - rect.top) / rect.height; // 0..1
		const relX = (e.clientX - rect.left) / rect.width;  // 0..1

		// Map relY to year index (accounting for padding)
		const padFrac = 60 / heightPx;
		const usable = 1 - 2 * padFrac;
		const yearFrac = (relY - padFrac) / usable;
		if (yearFrac < 0 || yearFrac > 1) { hoveredRegion = null; showTooltip = false; return; }
		const yearIdx = Math.round(yearFrac * (data.length - 1));
		const clampedIdx = Math.max(0, Math.min(data.length - 1, yearIdx));

		// Map relX to data x value (accounting for padding: left=20, right=20 of container width)
		const padLFrac = 20 / rect.width;
		const padRFrac = 20 / rect.width;
		const plotFrac = 1 - padLFrac - padRFrac;
		const dataX = xExtent[0] + ((relX - padLFrac) / plotFrac) * (xExtent[1] - xExtent[0]);

		// Check which band contains dataX at this year
		let found: string | null = null;
		for (let ri = 0; ri < regions.length; ri++) {
			const band = stackedData[ri][clampedIdx];
			if (dataX >= band[0] && dataX <= band[1]) {
				found = regions[ri];
				break;
			}
		}

		hoveredRegion = found;
		showTooltip = found !== null;
		tooltipX = e.clientX - rect.left;
		tooltipY = e.clientY - rect.top;
	}

	function handleChartClick() {
		if (hoveredRegion) {
			if (activeRegion === hoveredRegion) {
				onRegionClick(null);
			} else {
				onRegionClick(hoveredRegion);
			}
		}
	}

	function handleMouseLeave() {
		hoveredRegion = null;
		showTooltip = false;
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="stream-chart"
	style:height="{heightPx}px"
	onmousemove={findRegionAtPoint}
	onmouseleave={handleMouseLeave}
	onclick={handleChartClick}
	style:cursor={hoveredRegion ? 'pointer' : 'default'}
>
	<LayerCake
		data={filteredData}
		x={[0, 1]}
		y="year"
		xScale={scaleLinear()}
		yScale={scaleLinear()}
		xDomain={xExtent}
		yDomain={yDomain}
		padding={{ top: 60, right: 20, bottom: 60, left: 20 }}
	>
		<Svg>
			<AreaLayer {stackedData} colors={regionColors} {activeRegion} />
			<Annotation {events} />
		</Svg>
	</LayerCake>

	<!-- Tooltip -->
	{#if showTooltip && hoveredRegion}
		<div
			class="region-tooltip"
			style:left="{tooltipX}px"
			style:top="{tooltipY - 36}px"
		>
			<span class="tooltip-swatch" style:background-color={regionColors[hoveredRegion]}></span>
			{hoveredRegion}
		</div>
	{/if}
</div>

<style>
	.stream-chart {
		width: 100%;
		position: relative;
	}

	.region-tooltip {
		position: absolute;
		transform: translateX(-50%);
		background: rgba(255, 252, 239, 0.95);
		border: 1px solid var(--border-light);
		border-radius: 4px;
		padding: 0.25rem 0.6rem;
		font-family: var(--font-sans);
		font-size: 0.85rem;
		font-weight: 400;
		color: var(--text);
		white-space: nowrap;
		pointer-events: none;
		display: flex;
		align-items: center;
		gap: 0.3rem;
		box-shadow: 0 1px 4px rgba(0,0,0,0.08);
	}

	.tooltip-swatch {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}
</style>
