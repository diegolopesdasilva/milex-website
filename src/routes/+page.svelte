<script lang="ts">
	import { onMount } from 'svelte';
	import Hero from '$lib/components/Hero.svelte';
	import StackedAreaChart from '$lib/components/StackedAreaChart.svelte';
	import Legend from '$lib/components/Legend.svelte';
	import GrowthImpact from '$lib/components/GrowthImpact.svelte';
	import WaffleReallocation from '$lib/components/WaffleReallocation.svelte';

	import { events as globalEvents } from '$lib/data/events';
	import { regionalEvents } from '$lib/data/regional-events';
	import { getPivotedData, regions } from '$lib/data/expenditure';

	const data = getPivotedData();

	let activeRegion: string | null = $state(null);

	let events = $derived(
		activeRegion && regionalEvents[activeRegion]
			? regionalEvents[activeRegion]
			: globalEvents
	);

	const chartHeight = 12000;
	const firstYear = data[0].year;
	const lastYear = data[data.length - 1].year;
	const yearRange = lastYear - firstYear;

	// Dynamic totals for first/last year based on region filter
	let firstYearTotal = $derived.by(() => {
		const row = data[0];
		if (activeRegion) return (row as any)[activeRegion] || 0;
		let t = 0;
		for (const r of regions) t += (row as any)[r] || 0;
		return t;
	});

	let lastYearTotal = $derived.by(() => {
		const row = data[data.length - 1];
		if (activeRegion) return (row as any)[activeRegion] || 0;
		let t = 0;
		for (const r of regions) t += (row as any)[r] || 0;
		return t;
	});

	function formatBillions(b: number): string {
		return '$' + Math.round(b) + ' billion';
	}

	// Regional ending data from SIPRI Fact Sheet 2025
	const endingData: Record<string, { figure: string; text1: string; text2: string }> = {
		'Americas': {
			figure: '$1100 billion',
			text1: 'Military expenditure in the Americas totalled $1,100 billion in 2024, an increase of 5.8 per cent from 2023 and of 19 per cent from 2015. The Americas accounted for 40 per cent of global military spending ($2,718 billion). North American military spending rose by 5.7 per cent to $1,027 billion, driven primarily by the United States, whose $997 billion budget was 37 per cent of the world total.',
			text2: 'Military spending in Central America and the Caribbean more than doubled between 2015 and 2024, driven almost entirely by Mexico, whose spending went up by 39 per cent in 2024 as it boosted funding to the Guardia Nacional. South American spending remained stable at $53.6 billion. In 2024 Guyana recorded the largest annual percentage increase in the world, 78 per cent, amid tensions with Venezuela.'
		},
		'Europe': {
			figure: '$693 billion',
			text1: 'Total military spending in Europe rose by 17 per cent to $693 billion in 2024, up by 83 per cent from 2015. All European countries increased their military spending except Malta. Europe accounted for 26 per cent of global military spending ($2,718 billion). The Russia\u2013Ukraine war, now in its third year, continued to drive spending upward, pushing European expenditure beyond levels recorded at the end of the Cold War.',
			text2: 'Military expenditure in Central and Western Europe grew by 14 per cent to $472 billion. Germany rose 28 per cent to $88.5 billion, becoming the biggest spender in Central and Western Europe for the first time since reunification. Poland\u2019s spending went up by 31 per cent to $38 billion. Eastern European spending rose 24 per cent to $221 billion, the highest since the Soviet break-up, driven by Russia and Ukraine.'
		},
		'Asia & Oceania': {
			figure: '$629 billion',
			text1: 'Total military spending in Asia and Oceania amounted to $629 billion in 2024, up by 6.3 per cent from 2023 and by 46 per cent from 2015, continuing an uninterrupted upward trend dating back to at least 1989. Asia and Oceania accounted for 23 per cent of global military spending ($2,718 billion). The year-on-year increase in 2024 was the biggest since 2009, reflecting heightening tensions, especially in East Asia.',
			text2: 'East Asian military expenditure increased by 7.8 per cent to $433 billion. China allocated an estimated $314 billion, up 7.0 per cent \u2014 the 30th consecutive year of growth and the longest unbroken streak in the SIPRI database. Japan\u2019s annual increase of 21 per cent was the largest since 1952. Myanmar\u2019s spending went up by 66 per cent as internal conflicts escalated.'
		},
		'Middle East': {
			figure: '$243 billion',
			text1: 'Military expenditure in the Middle East reached an estimated $243 billion in 2024, an increase of 15 per cent from 2023 and of 19 per cent over the decade 2015\u201324. The Middle East accounted for 9 per cent of global military spending ($2,718 billion). The wars in Gaza and the wider region were key drivers of increased spending in 2024.',
			text2: 'Israel\u2019s military expenditure surged by 65 per cent in 2024, the largest increase among the top 15 spenders globally, raising its military burden to 8.8 per cent of GDP. Saudi Arabia remained the largest spender in the region at an estimated $80.3 billion, with a military burden of 7.3 per cent of GDP. Iran\u2019s spending declined by 10 per cent.'
		},
		'Africa': {
			figure: '$52 billion',
			text1: 'Military expenditure in Africa totalled $52.1 billion in 2024, 3.0 per cent more than in 2023 and 11 per cent more than in 2015. Africa accounted for 1.9 per cent of global military spending ($2,718 billion). North African spending reached $30.2 billion, up 8.8 per cent from 2023, driven by Algeria and Morocco, which accounted for 90 per cent of the subregional total.',
			text2: 'Sub-Saharan African spending totalled $21.9 billion, down 3.2 per cent from 2023 and 13 per cent from 2015, primarily due to falling spending in South Africa, Nigeria and Ethiopia. Mali, Burkina Faso and Niger, all under military junta rule, allocated $2.4 billion to their militaries. Chad increased its spending by 43 per cent after ending military cooperation with France.'
		}
	};

	const globalEndingData = {
		figure: '$2718 billion',
		text1: 'World military expenditure rose to $2718 billion in 2024, meaning that spending has increased every year for a full decade, going up by 37 per cent between 2015 and 2024. The 9.4 per cent increase in 2024 was the steepest year-on-year rise since at least 1988. The global military burden\u2014the share of the world\u2019s gross domestic product (GDP) devoted to military expenditure\u2014increased to 2.5 per cent in 2024. Average military expenditure as a share of government expenditure rose to 7.1 per cent in 2024 and world military spending per person was the highest since 1990, at $334.',
		text2: 'For the second year in a row, military expenditure increased in all five of the world\u2019s geographical regions, reflecting heightened geopolitical tensions across the globe. The decade-long growth in global spending can be partly attributed to spending increases in Europe, largely driven by the ongoing Russia\u2013Ukraine war, and in the Middle East, driven by the war in Gaza and wider regional conflicts. Many countries have also committed to raising military spending, which will lead to further global increases in the coming years.'
	};

	let currentEnding = $derived(
		activeRegion && endingData[activeRegion]
			? endingData[activeRegion]
			: globalEndingData
	);

	// Generate ruler ticks for every year
	const rulerYears: number[] = [];
	for (let y = firstYear; y <= lastYear; y++) {
		rulerYears.push(y);
	}

	// Track visibility per event card — reset when events change
	let visible: boolean[] = $state(globalEvents.map(() => false));
	$effect(() => {
		// When events change (region switch), reset visibility and re-measure
		visible = events.map(() => false);
		// Re-observe new cards and recalculate stream edges after DOM updates
		requestAnimationFrame(() => {
			if (chartSection) {
				setupObserver();
				measureStreamEdges();
				measureStreamTail();
				measureBracket();
			}
		});
	});
	let chartSection: HTMLElement;
	let streamTailWidth = $state(0);
	let streamTailLeft = $state(0);
	let figureFontSize = $state('10vw');

	// Bracket at top of stream: left edge and width in px (relative to chart-column)
	let bracketLeft = $state(0);
	let bracketWidth = $state(0);

	// ── Intro stream-taper dimensions ──
	// Stream width at 1992 as a fraction of the chart plot area
	const allTotals = data.map((row: any) => regions.reduce((s: number, r: string) => s + (row[r] || 0), 0));
	const total1992 = allTotals[0];
	const maxTotal = Math.max(...allTotals);
	const STREAM_FRAC_1992 = total1992 / (maxTotal * 1.5); // fraction of plotW that the stream occupies at 1992

	let introW = $state(0); // measured via bind:clientWidth

	// The ruler takes 90px (20px margin + 70px width). The chart-column is the rest.
	// LayerCake uses 20px padding on each side inside the chart-column.
	// Stream center relative to page = 90 + chartColW/2
	// Stream width at 1992 = STREAM_FRAC_1992 * (chartColW - 40)
	let taperStreamW = $derived(introW > 0 ? STREAM_FRAC_1992 * (introW - 90 - 40) : 300);
	let taperStreamCenter = $derived(introW > 0 ? 90 + (introW - 90) / 2 : introW / 2);
	let taperStreamLeft = $derived(taperStreamCenter - taperStreamW / 2);
	let taperStreamRight = $derived(taperStreamCenter + taperStreamW / 2);

	// Float widths at top (narrow → text is wide) and bottom (wide → text matches stream)
	const TAPER_TOP_PAD = 40; // px padding at top of text on each side
	let taperLeftW = $derived(Math.max(TAPER_TOP_PAD, taperStreamLeft)); // left float max width = bottom left edge
	let taperRightW = $derived(Math.max(TAPER_TOP_PAD, introW - taperStreamRight)); // right float max width

	// Current "active" year based on scroll position (NOT reactive — updated via DOM)
	let activeYear = firstYear;

	// Right edge x positions for each event (relative to chart-column)
	let contextPositions: { x: number; year: number }[] = $state([]);
	// Per-event stream edge positions for shape-following text (multiple y samples)
	let contextShapes: { offsets: number[] }[] = $state([]);

	let currentObserver: IntersectionObserver | null = null;

	function setupObserver() {
		if (currentObserver) currentObserver.disconnect();
		const cards = chartSection.querySelectorAll('.event-overlay-left [data-event-idx]');
		currentObserver = new IntersectionObserver(
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
			currentObserver.observe(card);
		}
	}

	onMount(() => {
		setupObserver();

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
			measureBracket();
		});
		window.addEventListener('resize', () => {
			measureStreamTail();
			measureStreamEdges();
			measureBracket();
		});

		return () => {
			if (currentObserver) currentObserver.disconnect();
			window.removeEventListener('scroll', handleScroll);
		};
	});

	// Helper: get the total spending for a year, respecting activeRegion filter
	function getYearTotal(row: any, regionFilter: string | null): number {
		if (regionFilter) return row[regionFilter] || 0;
		let t = 0;
		for (const r of regions) t += row[r] || 0;
		return t;
	}

	// Helper: compute the max half-total across all years for the current filter
	function getMaxHalf(regionFilter: string | null): number {
		let maxHalf = 0;
		for (const d of data) {
			const t = getYearTotal(d, regionFilter);
			if (t / 2 > maxHalf) maxHalf = t / 2;
		}
		return maxHalf;
	}

	function measureBracket() {
		const chartCol = chartSection?.querySelector('.chart-column') as HTMLElement;
		if (!chartCol) return;
		const chartColW = chartCol.clientWidth;
		const absExtent = getMaxHalf(activeRegion) * 1.5;
		const padL = 20, padR = 20;
		const plotW = chartColW - padL - padR;

		const firstRow = data[0];
		const firstTotal = getYearTotal(firstRow, activeRegion);
		const halfFirst = firstTotal / 2;
		const rightEdge = padL + ((halfFirst + absExtent) / (2 * absExtent)) * plotW;
		const leftEdge = padL + ((-halfFirst + absExtent) / (2 * absExtent)) * plotW;

		bracketLeft = leftEdge;
		bracketWidth = rightEdge - leftEdge;
	}

	function measureStreamTail() {
		const chartCol = chartSection?.querySelector('.chart-column') as HTMLElement;
		if (!chartCol) return;
		const chartColW = chartCol.clientWidth;
		const chartColRect = chartCol.getBoundingClientRect();

		const lastRow = data[data.length - 1];
		const lastTotal = getYearTotal(lastRow, activeRegion);
		const absExtent = getMaxHalf(activeRegion) * 1.5;
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

	function getStreamRightEdge(year: number, absExtent: number, padL: number, plotW: number, regionFilter: string | null): number {
		const floorYear = Math.floor(year);
		const ceilYear = Math.ceil(year);
		const frac = year - floorYear;
		const rowA = data.find(d => d.year === floorYear);
		const rowB = data.find(d => d.year === ceilYear);
		if (!rowA) return padL + plotW * 0.7;
		const totalA = getYearTotal(rowA, regionFilter);
		const totalB = rowB ? getYearTotal(rowB, regionFilter) : totalA;
		const total = totalA + (totalB - totalA) * frac;
		const halfTotal = total / 2;
		return padL + ((halfTotal + absExtent) / (2 * absExtent)) * plotW;
	}

	function measureStreamEdges() {
		const chartCol = chartSection?.querySelector('.chart-column') as HTMLElement;
		if (!chartCol) return;
		const chartColW = chartCol.clientWidth;

		const absExtent = getMaxHalf(activeRegion) * 1.5;
		const padL = 20, padR = 20;
		const plotW = chartColW - padL - padR;

		const positions: { x: number; year: number }[] = [];
		const shapes: { offsets: number[] }[] = [];

		const pxPerYear = chartHeight / yearRange;
		const lineHeightPx = 30;
		const lineHeightYears = lineHeightPx / pxPerYear;
		const numLines = 10;

		for (const event of events) {
			const baseEdge = getStreamRightEdge(event.year, absExtent, padL, plotW, activeRegion);
			positions.push({ x: baseEdge, year: event.year });

			const offsets: number[] = [];
			for (let line = 0; line < numLines; line++) {
				const sampleYear = event.year + line * lineHeightYears;
				const edge = getStreamRightEdge(sampleYear, absExtent, padL, plotW, activeRegion);
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

	<section class="intro-text">
		<p>
			While military expenditure is primarily intended to fund the armed forces and secure
			sovereignty, it has effects that extend far beyond a country's national security. It is
			known to affect economic growth, development, income inequality and political institutions,
			among many others. One of the most serious and complex impacts of military expenditure is
			on international stability. As a country increases its military expenditure, others may
			perceive it as a threat and respond in kind, which may prompt the first country to
			counter-respond with further increases — setting off a spiral or traditional security
			dilemma. This predicament can lead to increasingly higher military expenditure at the
			expense of investment in other areas, but with the paradoxical result of more insecurity,
			not less as initially intended.
		</p>
		<p>
			Given its far-reaching impacts on international security and development, the
			Stockholm International Peace Research Institute (<span class="sipri">SIPRI</span>)
			has been tracking military expenditure for nearly six decades. Below, the data tells
			a visual history from the end of the cold war, through the peace dividend years, up to now.
		</p>
		<div class="scroll-hint">
			<span>Scroll to explore</span>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<path d="M12 5v14M19 12l-7 7-7-7" />
			</svg>
		</div>
	</section>

	<section class="legend-bar">
		<Legend {activeRegion} onRegionClick={(r) => { activeRegion = r; }} />
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
					<span class="tick-mark"></span>
					<span class="tick-label" data-year={year}>{year}</span>
				</div>
			{/each}
		</div>

		<!-- Chart column with overlaid annotations on both sides -->
		<div class="chart-column">
			<StackedAreaChart {data} {events} heightPx={chartHeight} {activeRegion} />

			<!-- Bracket at top: figure + solid line matching stream width -->
			<div
				class="bracket-line"
				style:top="{yearToPercent(firstYear)}%"
				style:left="{bracketLeft}px"
				style:width="{bracketWidth}px"
			>
				<span class="bracket-label">${Math.round(firstYearTotal)} Billion</span>
				<div class="bracket-bar">
					<span class="bracket-tick-left"></span>
					<span class="bracket-tick-right"></span>
				</div>
			</div>

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

			<!-- Right overlay: context text, follows stream silhouette via shape-outside -->
			{#each events as event, i}
				{@const pct = yearToPercent(event.year)}
				{@const offsets = contextShapes[i]?.offsets ?? []}
				{@const gap = 40}
				{@const lineH = 30}
				{@const totalH = offsets.length * lineH}
				{@const polyPts = offsets.length > 0
					? offsets.map((x, li) => `${x + gap}px ${li * lineH}px`).join(', ')
						+ `, ${offsets[offsets.length - 1] + gap}px ${totalH}px, 0px ${totalH}px, 0px 0px`
					: '0px 0px, 0px 100%, 0px 100%'}
				<div
					class="context-card"
					class:visible={visible[i]}
					style:top="{pct}%"
					style:left="0"
					style:width="calc(100% - 20px)"
				>
					<div
						class="shape-float"
						style:width="{Math.max(...offsets) + gap + 10}px"
						style:height="{totalH}px"
						style:shape-outside="polygon({polyPts})"
						style:clip-path="polygon({polyPts})"
					></div>
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
		<p class="ending-figure" style:font-size={figureFontSize}>{currentEnding.figure}</p>
		<p class="ending-text">{currentEnding.text1}</p>
		<p class="ending-text" style="margin-top: 1.5rem;">{currentEnding.text2}</p>
	</section>

	<!-- Defence Dividend section -->
	<div
		style:width="{streamTailWidth > 0 ? streamTailWidth + 'px' : '60%'}"
		style:margin-left="{streamTailLeft > 0 ? streamTailLeft + 'px' : 'auto'}"
		style:margin-right="{streamTailLeft > 0 ? 'auto' : 'auto'}"
	>
		<GrowthImpact />
	</div>

	<!-- Reallocation thought exercise -->
	<div
		style:width="{streamTailWidth > 0 ? streamTailWidth + 'px' : '60%'}"
		style:margin-left="{streamTailLeft > 0 ? streamTailLeft + 'px' : 'auto'}"
		style:margin-right="{streamTailLeft > 0 ? 'auto' : 'auto'}"
	>
		<WaffleReallocation />
	</div>

	<footer>
		<p>Data: SIPRI Military Expenditure Database. All figures in constant 2023 USD.</p>
		<p class="closing">
			Did you enjoy this visualization? If so, consider making a donation to the Red Cross,
			Doctors Without Borders, or to <span class="sipri">SIPRI</span>. I won't leave any links here for security reasons,
			but you can easily find information online. If you do, I would love to hear from you
			at diego.lopes@sipri.org.
		</p>
	</footer>
</main>

<style>
	main {
		max-width: 100%;
		overflow-x: hidden;
	}

	/* ── Intro text — centered over chart column ── */
	.intro-text {
		max-width: 700px;
		margin: 0 auto var(--space-lg);
		padding: 0 var(--space-lg);
		transform: translateX(45px);
	}

	.intro-text p {
		font-family: var(--font-sans);
		font-size: clamp(1.1rem, 2vw, 1.4rem);
		font-weight: 300;
		line-height: 1.85;
		color: var(--text-muted);
		text-align: justify;
		margin: 0 0 1.2rem;
	}

	.intro-text :global(.sipri) {
		font-family: var(--font-display);
		font-weight: 400;
		color: #E2003F;
	}

	.scroll-hint {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-muted);
		font-size: 1rem;
		font-family: var(--font-sans);
		font-weight: 400;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		margin-top: var(--space-lg);
		animation: drift 2.5s ease infinite;
	}

	@keyframes drift {
		0%, 100% { transform: translateY(0); opacity: 0.5; }
		50% { transform: translateY(5px); opacity: 0.8; }
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

	/* ── Bracket at top of stream ── */
	.bracket-line {
		position: absolute;
		transform: translateY(-3.5rem);
		z-index: 4;
		display: flex;
		flex-direction: column;
		align-items: center;
		pointer-events: none;
		transition: left 0.6s ease, width 0.6s ease;
	}

	.bracket-label {
		font-family: var(--font-display);
		font-size: 1.3rem;
		font-weight: 400;
		font-style: italic;
		color: var(--text);
		margin-bottom: 0.3rem;
		white-space: nowrap;
	}

	.bracket-bar {
		width: 100%;
		height: 1px;
		background: var(--text-muted);
		position: relative;
	}

	.bracket-tick-left,
	.bracket-tick-right {
		position: absolute;
		top: -4px;
		width: 1px;
		height: 9px;
		background: var(--text-muted);
	}

	.bracket-tick-left { left: 0; }
	.bracket-tick-right { right: 0; }

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

	.shape-float {
		float: left;
		background: transparent;
	}

	.context-card:first-of-type {
		transform: translateY(0);
	}

	.context-card.visible {
		opacity: 1;
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
		padding: 4vh 0 4vh;
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

	footer .closing {
		max-width: 650px;
		margin: 2.5rem auto 0;
		font-size: 1.05rem;
		font-weight: 300;
		line-height: 1.8;
		color: var(--text-light);
	}

	footer .closing :global(.sipri) {
		font-family: var(--font-display);
		font-weight: 400;
		color: #E2003F;
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
