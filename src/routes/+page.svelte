<script lang="ts">
	import { onMount } from 'svelte';
	import Hero from '$lib/components/Hero.svelte';
	import StackedAreaChart from '$lib/components/StackedAreaChart.svelte';
	import Legend from '$lib/components/Legend.svelte';

	import { events } from '$lib/data/events';
	import { getPivotedData, regions } from '$lib/data/expenditure';

	const data = getPivotedData();

	const chartHeight = 12000;
	const firstYear = data[0].year;
	const lastYear = data[data.length - 1].year;
	const yearRange = lastYear - firstYear;

	// Generate ruler ticks for every year
	const rulerYears: number[] = [];
	for (let y = firstYear; y <= lastYear; y++) {
		rulerYears.push(y);
	}

	// Track visibility per event card
	let visible: boolean[] = $state(events.map(() => false));
	let chartSection: HTMLElement;
	let streamTailWidth = $state(0);
	let streamTailLeft = $state(0);
	let figureFontSize = $state('10vw');

	// Current "active" year based on scroll position (NOT reactive — updated via DOM)
	let activeYear = firstYear;

	// Right edge x positions for each event (relative to chart-column)
	let contextPositions: { x: number; year: number }[] = $state([]);
	// Per-event stream edge positions for shape-following text (multiple y samples)
	let contextShapes: { offsets: number[] }[] = $state([]);

	onMount(() => {
		const cards = chartSection.querySelectorAll('.event-overlay-left [data-event-idx]');

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const idx = Number((entry.target as HTMLElement).dataset.eventIdx);
					visible[idx] = entry.isIntersecting;
				}
			},
			{
				rootMargin: '-25% 0px -25% 0px',
				threshold: 0
			}
		);

		for (const card of cards) {
			observer.observe(card);
		}

		// Track scroll to determine active year — update ruler labels via DOM directly
		let rafId = 0;
		function handleScroll() {
			if (rafId) return;
			rafId = requestAnimationFrame(() => {
				rafId = 0;
				if (!chartSection) return;
				const rect = chartSection.getBoundingClientRect();
				const viewportCenter = window.innerHeight / 2;
				const scrollProgress = (viewportCenter - rect.top) / rect.height;
				const paddingFrac = 60 / chartHeight;
				const usableFrac = 1 - 2 * paddingFrac;
				const yearFrac = (scrollProgress - paddingFrac) / usableFrac;
				const newYear = Math.round(firstYear + yearFrac * yearRange);
				if (newYear !== activeYear) {
					activeYear = newYear;
					updateRulerStyles(newYear);
				}
			});
		}

		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll();

		// Measure stream tail width at 2024 (bottom of chart)
		requestAnimationFrame(() => {
			measureStreamTail();
			measureStreamEdges();
		});
		window.addEventListener('resize', () => {
			measureStreamTail();
			measureStreamEdges();
		});

		return () => {
			observer.disconnect();
			window.removeEventListener('scroll', handleScroll);
		};
	});

	function measureStreamTail() {
		// Compute stream tail width from data (avoids expensive SVG path sampling)
		const chartCol = chartSection?.querySelector('.chart-column') as HTMLElement;
		if (!chartCol) return;
		const chartColW = chartCol.clientWidth;
		const chartColRect = chartCol.getBoundingClientRect();

		// Find the last year's total spending
		const lastRow = data[data.length - 1];
		let lastTotal = 0;
		for (const r of regions) lastTotal += (lastRow as any)[r] || 0;

		// Find global max half-total
		let globalMaxHalf = 0;
		for (const d of data) {
			let t = 0;
			for (const r of regions) t += (d as any)[r] || 0;
			if (t / 2 > globalMaxHalf) globalMaxHalf = t / 2;
		}

		const absExtent = globalMaxHalf * 1.5;
		const padL = 20, padR = 20;
		const plotW = chartColW - padL - padR;

		const halfLast = lastTotal / 2;
		const rightEdge = padL + ((halfLast + absExtent) / (2 * absExtent)) * plotW;
		const leftEdge = padL + ((-halfLast + absExtent) / (2 * absExtent)) * plotW;

		streamTailWidth = rightEdge - leftEdge;
		streamTailLeft = chartColRect.left + leftEdge;

		setTimeout(() => {
			const fig = document.querySelector('.ending-figure') as HTMLElement;
			if (!fig) return;
			fig.style.fontSize = '100px';
			const range = document.createRange();
			range.selectNodeContents(fig);
			const textW = range.getBoundingClientRect().width;
			if (textW > 0 && streamTailWidth > 0) {
				const targetFontSize = Math.round((streamTailWidth / textW) * 100 * 1.00);
				figureFontSize = `${targetFontSize}px`;
				fig.style.fontSize = `${targetFontSize}px`;
			}
		}, 100);
	}

	function getStreamRightEdge(year: number, absExtent: number, padL: number, plotW: number): number {
		// Interpolate between data points for fractional years
		const floorYear = Math.floor(year);
		const ceilYear = Math.ceil(year);
		const frac = year - floorYear;
		const rowA = data.find(d => d.year === floorYear);
		const rowB = data.find(d => d.year === ceilYear);
		if (!rowA) return padL + plotW * 0.7;
		let totalA = 0, totalB = 0;
		for (const r of regions) {
			totalA += (rowA as any)[r] || 0;
			totalB += (rowB ? (rowB as any)[r] : (rowA as any)[r]) || 0;
		}
		const total = totalA + (totalB - totalA) * frac;
		const halfTotal = total / 2;
		return padL + ((halfTotal + absExtent) / (2 * absExtent)) * plotW;
	}

	function measureStreamEdges() {
		const chartCol = chartSection?.querySelector('.chart-column') as HTMLElement;
		if (!chartCol) return;
		const chartColW = chartCol.clientWidth;

		let globalMaxHalf = 0;
		for (const d of data) {
			let t = 0;
			for (const r of regions) t += (d as any)[r] || 0;
			if (t / 2 > globalMaxHalf) globalMaxHalf = t / 2;
		}

		const absExtent = globalMaxHalf * 1.5;
		const padL = 20, padR = 20;
		const plotW = chartColW - padL - padR;

		const positions: { x: number; year: number }[] = [];
		const shapes: { offsets: number[] }[] = [];

		// Each line of text ≈ 1.7rem * 1.05rem font ≈ ~28px.
		// In chart coordinates, each year = chartHeight / yearRange px
		const pxPerYear = chartHeight / yearRange;
		const lineHeightPx = 28; // approx line height in pixels
		const lineHeightYears = lineHeightPx / pxPerYear; // fraction of a year per line
		const numLines = 10; // sample enough lines

		for (const event of events) {
			const baseEdge = getStreamRightEdge(event.year, absExtent, padL, plotW);
			positions.push({ x: baseEdge, year: event.year });

			// Compute edge at each line offset
			const offsets: number[] = [];
			for (let line = 0; line < numLines; line++) {
				const sampleYear = event.year + line * lineHeightYears;
				const edge = getStreamRightEdge(sampleYear, absExtent, padL, plotW);
				offsets.push(edge);
			}
			shapes.push({ offsets });
		}
		contextPositions = positions;
		contextShapes = shapes;
	}

	function updateRulerStyles(active: number) {
		const labels = chartSection?.querySelectorAll('.tick-label[data-year]');
		if (!labels) return;
		for (const el of labels) {
			const year = Number((el as HTMLElement).dataset.year);
			const dist = Math.abs(year - active);
			let scale = 1, weight = 400, opacity = 0.3, color = 'var(--text-light)';
			if (dist === 0) { scale = 1.8; weight = 700; opacity = 1; color = 'var(--text)'; }
			else if (dist === 1) { scale = 1.4; weight = 600; opacity = 0.8; color = 'var(--text)'; }
			else if (dist === 2) { scale = 1.1; weight = 500; opacity = 0.6; color = 'var(--text-muted)'; }
			else if (dist <= 4) { opacity = 0.4; }
			const s = (el as HTMLElement).style;
			s.fontSize = `${0.85 * scale}rem`;
			s.fontWeight = String(weight);
			s.opacity = String(opacity);
			s.color = color;
		}
	}

	function yearToPercent(year: number): number {
		const paddingTop = 60 / chartHeight * 100;
		const paddingBottom = 60 / chartHeight * 100;
		const usable = 100 - paddingTop - paddingBottom;
		return paddingTop + ((year - firstYear) / yearRange) * usable;
	}

</script>

<main>
	<Hero />

	<section class="legend-bar">
		<Legend />
	</section>

	<section class="chart-section" bind:this={chartSection}>
		<!-- Left ruler -->
		<div class="left-column" style:height="{chartHeight}px">
			{#each rulerYears as year}
				{@const pct = yearToPercent(year)}
				{@const isEvent = events.some(e => e.year === year)}
				<div
					class="ruler-tick"
					class:event-tick={isEvent}
					style:top="{pct}%"
				>
					<span class="tick-mark" class:event-mark={isEvent}></span>
					<span class="tick-label" data-year={year}>{year}</span>
				</div>
			{/each}
		</div>

		<!-- Chart column with overlaid annotations on both sides -->
		<div class="chart-column">
			<StackedAreaChart {data} {events} heightPx={chartHeight} />

			<!-- Left overlay: title + description (year is on the ruler) -->
			<div class="event-overlay-left">
				{#each events as event, i}
					{@const pct = yearToPercent(event.year)}
					<div
						class="event-card-left"
						class:visible={visible[i]}
						data-event-idx={i}
						style:top="{pct}%"
					>
						<h3 class="event-title">{event.title}</h3>
						<p class="event-desc">{event.description}</p>
					</div>
				{/each}
			</div>

			<!-- Right overlay: context text, each line follows stream curve -->
			{#each events as event, i}
				{@const pct = yearToPercent(event.year)}
				{@const shape = contextShapes[i]}
				{@const minEdge = shape ? Math.min(...shape.offsets) : (contextPositions[i]?.x ?? 0)}
				{@const gap = 40}
				<div
					class="context-card"
					class:visible={visible[i]}
					style:top="{pct}%"
					style:left="{minEdge}px"
					style:width="calc(100% - {minEdge + 40}px)"
				>
					{#if shape}
						{@const lineH = 30}
						{@const totalH = shape.offsets.length * lineH}
						<div
							class="shape-spacer"
							style:width="{Math.max(...shape.offsets) - minEdge + gap}px"
							style:height="{totalH}px"
							style:shape-outside="polygon({shape.offsets.map((x, li) => `${x - minEdge + gap}px ${li * lineH}px`).join(', ')}, {shape.offsets[shape.offsets.length - 1] - minEdge + gap}px {totalH}px, 0px {totalH}px, 0px 0px)"
						></div>
					{/if}
					<p class="context-text">{event.context}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Ending section — aligned to stream tail width -->
	<section
		class="ending"
		style:width="{streamTailWidth > 0 ? streamTailWidth + 'px' : '60%'}"
		style:margin-left="{streamTailLeft > 0 ? streamTailLeft + 'px' : 'auto'}"
		style:margin-right="{streamTailLeft > 0 ? 'auto' : 'auto'}"
	>
		<p class="ending-figure" style:font-size={figureFontSize}>$2718 billion</p>
		<p class="ending-text">
			World military expenditure rose to $2718 billion in 2024, meaning that spending has increased every year for a full decade, going up by 37 per cent between 2015 and 2024. The 9.4 per cent increase in 2024 was the steepest year-on-year rise since at least 1988. The global military burden—the share of the world's gross domestic product (GDP) devoted to military expenditure—increased to 2.5 per cent in 2024. Average military expenditure as a share of government expenditure rose to 7.1 per cent in 2024 and world military spending per person was the highest since 1990, at $334.
		</p>
		<p class="ending-text" style="margin-top: 1.5rem;">
			For the second year in a row, military expenditure increased in all five of the world's geographical regions, reflecting heightened geopolitical tensions across the globe. The decade-long growth in global spending can be partly attributed to spending increases in Europe, largely driven by the ongoing Russia–Ukraine war, and in the Middle East, driven by the war in Gaza and wider regional conflicts. Many countries have also committed to raising military spending, which will lead to further global increases in the coming years.
		</p>
	</section>

	<footer>
		<p>Data: SIPRI Military Expenditure Database. All figures in constant 2023 USD.</p>
	</footer>
</main>

<style>
	main {
		max-width: 100%;
		overflow-x: hidden;
	}

	/* ── Legend bar ── */
	.legend-bar {
		position: sticky;
		top: 0;
		z-index: 10;
		background: rgba(255, 252, 239, 0.92);
		backdrop-filter: blur(8px);
		border-bottom: 1px solid var(--border-light);
		padding: 0.6rem var(--space-lg);
		/* Offset to center over the chart column (accounting for 90px ruler on left) */
		padding-left: calc(var(--space-lg) + 90px);
	}

	/* ── Chart section — layout ── */
	.chart-section {
		position: relative;
		display: flex;
		max-width: 100%;
		margin: 0 auto;
	}

	/* ── Left column: ruler ── */
	.left-column {
		flex: 0 0 70px;
		position: relative;
		border-right: 1px solid var(--ruler-color);
		margin-left: 20px;
	}

	.ruler-tick {
		position: absolute;
		right: 0;
		display: flex;
		align-items: center;
		transform: translateY(-50%);
	}

	.tick-mark {
		display: block;
		width: 8px;
		height: 1px;
		background: var(--ruler-color);
		position: absolute;
		right: -1px;
	}

	.tick-mark.event-mark {
		width: 20px;
		background: var(--text-muted);
	}

	.tick-label {
		position: absolute;
		right: 12px;
		font-family: var(--font-sans);
		white-space: nowrap;
		transition: font-size 0.3s ease, opacity 0.3s ease, font-weight 0.2s ease;
	}

	/* ── Center chart column ── */
	.chart-column {
		flex: 1;
		min-width: 0;
		position: relative;
		overflow: hidden;
	}

	/* ── Left overlay: event cards ── */
	.event-overlay-left {
		position: absolute;
		top: 0;
		left: 0.5rem;
		bottom: 0;
		width: 280px;
		pointer-events: none;
		z-index: 5;
	}

	.event-card-left {
		position: absolute;
		left: 0;
		right: 0;
		transform: translateY(-0.5em);
		opacity: 0;
		transition: opacity 0.7s ease;
		pointer-events: auto;
		background: rgba(255, 252, 239, 0.85);
		backdrop-filter: blur(3px);
		padding: 0.4rem 0.5rem;
		border-radius: 4px;
	}

	.event-card-left:first-of-type {
		transform: translateY(0);
	}

	.event-card-left.visible {
		opacity: 1;
	}

	.event-title {
		font-family: var(--font-display);
		font-size: 1.8rem;
		font-weight: 400;
		font-style: italic;
		color: var(--text);
		margin: 0 0 0.4rem;
		line-height: 1.3;
	}

	.event-desc {
		font-family: var(--font-sans);
		font-size: 1.15rem;
		font-weight: 300;
		color: var(--text);
		line-height: 1.65;
		margin: 0;
	}

	/* ── Right context cards — positioned dynamically ── */
	.context-card {
		position: absolute;
		transform: translateY(-0.5em);
		opacity: 0;
		transition: opacity 0.7s ease;
		pointer-events: none;
		z-index: 5;
		overflow: hidden;
	}

	.context-card:first-of-type {
		transform: translateY(0);
	}

	.context-card.visible {
		opacity: 1;
	}

	.shape-spacer {
		float: left;
		shape-margin: 0px;
	}

	.context-text {
		font-family: var(--font-sans);
		font-size: 1.15rem;
		font-weight: 300;
		color: var(--text);
		line-height: 30px;
		margin: 0;
	}

	/* ── Ending section — width matched to stream tail ── */
	.ending {
		padding: 4vh 0 14vh;
	}

	.ending-figure {
		font-family: var(--font-display);
		font-weight: 700;
		color: var(--text);
		line-height: 1;
		margin: 0 0 2rem;
		letter-spacing: -0.02em;
		white-space: nowrap;
		width: 100%;
		text-align: center;
		font-size: 10vw;
		margin-left: -0.03em;
		padding-right: 0;
	}

	.ending-text {
		font-family: var(--font-sans);
		font-size: clamp(1.15rem, 2.2vw, 1.5rem);
		font-weight: 300;
		color: var(--text-muted);
		line-height: 1.85;
		margin: 0;
		text-align: justify;
	}

	/* ── Footer ── */
	footer {
		text-align: center;
		padding: var(--space-xl) var(--space-lg);
		color: var(--text-light);
		font-size: 0.7rem;
		font-family: var(--font-sans);
		font-weight: 400;
		letter-spacing: 0.02em;
	}

	/* ── Responsive ── */
	@media (max-width: 768px) {
		.left-column {
			flex: 0 0 50px;
		}

		.tick-label {
			right: 8px;
		}

		.event-overlay-left {
			width: 180px;
		}

		.context-card {
			width: 180px;
		}

		.ending-figure {
			font-size: clamp(2.5rem, 12vw, 4.5rem);
		}

		.ending-text {
			font-size: 0.95rem;
		}
	}
</style>
