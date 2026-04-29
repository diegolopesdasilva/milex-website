<script lang="ts">
	import { onMount } from 'svelte';
	import Hero from '$lib/components/Hero.svelte';
	import StackedAreaChart from '$lib/components/StackedAreaChart.svelte';
	import Legend from '$lib/components/Legend.svelte';
	import GrowthImpact from '$lib/components/GrowthImpact.svelte';
	import WaffleReallocation from '$lib/components/WaffleReallocation.svelte';

	import { events as globalEvents } from '$lib/data/events';
	import { regionalEvents } from '$lib/data/regional-events';
	import { worldNeeds } from '$lib/data/world-needs';
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

	// Regional ending data from SIPRI Fact Sheet 2026 (covering 2025 data)
	const endingData: Record<string, { figure: string; text1: string; text2: string }> = {
		'Americas': {
			figure: '$1065 billion',
			text1: 'Military spending in the Americas fell by 6.6 per cent to $1,065 billion in 2025, but this was still 13 per cent higher than in 2016. The Americas accounted for 37 per cent of global military spending ($2,887 billion). Trends in the region are dominated by developments in North America, with the USA alone accounting for 90 per cent of the region\u2019s spending in 2025.',
			text2: 'US military expenditure was $954 billion in 2025, 7.5 per cent lower than in 2024 but still 11 per cent higher than in 2016. The decline was mainly due to a sharp reduction in financial military assistance overseas. Mexico\u2019s spending dropped by a third in 2025 to $13.6 billion. Brazil increased its military expenditure by 13 per cent to $23.9 billion, while Guyana\u2019s spending rose 16 per cent amid tensions with Venezuela.'
		},
		'Europe': {
			figure: '$864 billion',
			text1: 'Total military expenditure in Europe reached $864 billion in 2025, an increase of 14 per cent compared with 2024 and the highest level of European spending ever recorded by SIPRI. Over the decade 2016\u201325, military spending in the region doubled (+102 per cent). Europe accounted for 30 per cent of global military spending ($2,887 billion). The increase reflects growing geopolitical instability, mainly related to the Russia\u2013Ukraine war and uncertainty over US security guarantees.',
			text2: 'Russia\u2019s military expenditure reached an estimated $190 billion (+5.9 per cent), with a military burden of 7.5 per cent of GDP. Ukraine\u2019s spending grew 20 per cent to $84.1 billion, or 40 per cent of its GDP. Germany became the fourth biggest spender globally, reaching $114 billion (+24 per cent). Spain\u2019s military spending increased by 50 per cent to $40.2 billion, while Poland (+23 per cent) and Italy (+20 per cent) also recorded sharp rises.'
		},
		'Asia & Oceania': {
			figure: '$681 billion',
			text1: 'The combined military expenditure of states in Asia and Oceania in 2025 was $681 billion, an increase of 8.1 per cent from 2024 and of 48 per cent from 2016. This continued an uninterrupted trend dating back to at least 1989. Asia and Oceania accounted for 24 per cent of global military spending ($2,887 billion). The increase in 2025 represented the biggest year-on-year rise since 2009.',
			text2: 'China allocated an estimated $336 billion to its military in 2025 (+7.4 per cent), the largest year-on-year increase in the past decade. Chinese military expenditure has now increased each year for 31 consecutive years\u2014the longest streak of any country in the SIPRI database. Japan\u2019s spending rose 9.7 per cent to $62.2 billion, India\u2019s grew 8.9 per cent to $92.1 billion, and Taiwan\u2019s rose 14 per cent to $18.2 billion\u2014its largest year-on-year increase since at least 1988.'
		},
		'Middle East': {
			figure: '$218 billion',
			text1: 'Military expenditure in the Middle East was an estimated $218 billion in 2025. It went up only marginally in 2025 (+0.1 per cent) but increased by 36 per cent over the decade 2016\u201325, in the context of recurring regional conflicts and crises. The Middle East accounted for 7.6 per cent of global military spending ($2,887 billion).',
			text2: 'Saudi Arabia remained the region\u2019s largest spender at an estimated $83.2 billion (+1.4 per cent). Israel\u2019s military expenditure decreased by 4.9 per cent to $48.3 billion, reflecting reduced intensity of the war in Gaza after the January 2025 ceasefire, but spending remained 120 per cent higher than in 2016. T\u00fcrkiye\u2019s expenditure reached $30.0 billion (+7.2 per cent), while Iran\u2019s decreased for the second consecutive year to $7.4 billion amid 42 per cent annual inflation.'
		},
		'Africa': {
			figure: '$58 billion',
			text1: 'Military expenditure in Africa grew for the third consecutive year in 2025 to reach $58.2 billion, 8.5 per cent higher than in 2024 and 45 per cent higher than in 2016. Africa accounted for 2.0 per cent of global military spending ($2,887 billion). North African spending totalled $35.0 billion, 9.3 per cent more than in 2024 and 67 per cent more than in 2016, driven by Algeria and Morocco.',
			text2: 'Algeria\u2019s spending rose by 11 per cent to $25.4 billion, making it by far the biggest spender in Africa. Sub-Saharan Africa\u2019s expenditure totalled $23.3 billion (+7.4 per cent), driven by higher spending in Nigeria, whose expenditure rose 55 per cent to $2.1 billion amid worsening security conditions. South Africa allocated $3.2 billion (-1.2 per cent), while military spending in the Democratic Republic of the Congo increased 20 per cent to $1.2 billion.'
		}
	};

	const globalEndingData = {
		figure: '$2887 billion',
		text1: 'World military expenditure rose by 2.9 per cent in real terms to $2,887 billion in 2025, marking the 11th consecutive year of growth and the highest spending level ever recorded by SIPRI. Global spending has gone up by 41 per cent over the past decade (2016\u201325). The world\u2019s military burden\u2014the share of global GDP devoted to military expenditure\u2014went up from 2.4 per cent in 2024 to 2.5 per cent in 2025. Average military expenditure as a share of government expenditure was 6.9 per cent and world spending per person stood at $352.',
		text2: 'Global military expenditure rose in 2025 despite a drop in spending by the United States, the world\u2019s biggest spender. A sharp increase in European spending and continued growth in Asia and Oceania were more than enough to offset the decrease in US spending. World military expenditure excluding the USA grew by 9.2 per cent in 2025. The five biggest spenders\u2014the United States, China, Russia, Germany and India\u2014together accounted for 58 per cent of world military spending.'
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
				updateSlidingBar(slidingBarYear);
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

	// ── Sliding value bar state ──
	let slidingBarYear = $state(firstYear);
	let slidingBarTotal = $state(0);
	let slidingBarLeft = $state(0);
	let slidingBarWidth = $state(0);
	let slidingBarVisible = $state(true);

	function updateSlidingBar(year: number) {
		const clamped = Math.max(firstYear, Math.min(lastYear - 1, year));
		slidingBarYear = clamped;

		const chartCol = chartSection?.querySelector('.chart-column') as HTMLElement;
		if (!chartCol) return;
		const chartColW = chartCol.clientWidth;
		const absExtent = getMaxHalf(activeRegion) * 1.5;
		const padL = 20, plotW = chartColW - 40;

		// Find the data row for this year (or interpolate)
		const row = data.find(d => d.year === clamped);
		if (!row) return;

		const total = getYearTotal(row, activeRegion);
		slidingBarTotal = total;

		const half = total / 2;
		const rightEdge = padL + ((half + absExtent) / (2 * absExtent)) * plotW;
		const leftEdge = padL + ((-half + absExtent) / (2 * absExtent)) * plotW;
		slidingBarLeft = leftEdge;
		slidingBarWidth = rightEdge - leftEdge;
	}

	// Right edge x positions for each event (relative to chart-column)
	let contextPositions: { x: number; year: number }[] = $state([]);
	// Per-event stream edge positions for shape-following text (multiple y samples)
	let contextShapes: { offsets: number[] }[] = $state([]);
	// Per-event stream LEFT edge positions for shape-following text on the left side
	let leftContextShapes: { offsets: number[] }[] = $state([]);
	// World-needs (alternating left/right) shape offsets per item
	let worldNeedShapes: { side: 'left' | 'right'; offsets: number[] }[] = $state([]);
	let worldNeedVisible: boolean[] = $state(worldNeeds.map(() => false));

	let currentObserver: IntersectionObserver | null = null;

	function setupObserver() {
		if (currentObserver) currentObserver.disconnect();
		const eventCards = chartSection.querySelectorAll('[data-event-idx]');
		const needCards = chartSection.querySelectorAll('[data-need-idx]');
		currentObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const target = entry.target as HTMLElement;
					if (target.dataset.eventIdx !== undefined) {
						const idx = Number(target.dataset.eventIdx);
						visible[idx] = entry.isIntersecting;
					} else if (target.dataset.needIdx !== undefined) {
						const idx = Number(target.dataset.needIdx);
						worldNeedVisible[idx] = entry.isIntersecting;
					}
				}
			},
			{
				rootMargin: '-25% 0px -25% 0px',
				threshold: 0
			}
		);
		for (const card of eventCards) currentObserver.observe(card);
		for (const card of needCards) currentObserver.observe(card);
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

				// Show sliding bar while above or inside the chart section; hide when scrolled past
				const pastChart = yearFrac > 1;
				slidingBarVisible = !pastChart;

				if (newYear !== activeYear) {
					activeYear = newYear;
					updateRulerStyles(newYear);
				}
				// Above the chart: hold at 1992. Inside: follow scroll. Past: hold at 2023.
				const displayYear = yearFrac < 0 ? firstYear : Math.max(firstYear, Math.min(lastYear - 1, newYear));
				updateSlidingBar(displayYear);
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

	function getStreamLeftEdge(year: number, absExtent: number, padL: number, plotW: number, regionFilter: string | null): number {
		const floorYear = Math.floor(year);
		const ceilYear = Math.ceil(year);
		const frac = year - floorYear;
		const rowA = data.find(d => d.year === floorYear);
		const rowB = data.find(d => d.year === ceilYear);
		if (!rowA) return padL + plotW * 0.3;
		const totalA = getYearTotal(rowA, regionFilter);
		const totalB = rowB ? getYearTotal(rowB, regionFilter) : totalA;
		const total = totalA + (totalB - totalA) * frac;
		const halfTotal = total / 2;
		return padL + ((-halfTotal + absExtent) / (2 * absExtent)) * plotW;
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
		const leftShapes: { offsets: number[] }[] = [];

		const pxPerYear = chartHeight / yearRange;
		const lineHeightPx = 30;
		const lineHeightYears = lineHeightPx / pxPerYear;
		const numLines = 20;

		for (const event of events) {
			const baseEdge = getStreamRightEdge(event.year, absExtent, padL, plotW, activeRegion);
			positions.push({ x: baseEdge, year: event.year });

			const offsets: number[] = [];
			const leftOffsets: number[] = [];
			for (let line = 0; line < numLines; line++) {
				const sampleYear = event.year + line * lineHeightYears;
				offsets.push(getStreamRightEdge(sampleYear, absExtent, padL, plotW, activeRegion));
				leftOffsets.push(getStreamLeftEdge(sampleYear, absExtent, padL, plotW, activeRegion));
			}
			shapes.push({ offsets });
			leftShapes.push({ offsets: leftOffsets });
		}
		contextPositions = positions;
		contextShapes = shapes;
		leftContextShapes = leftShapes;

		// World-needs use a smaller window — fewer lines, alternating sides
		const needNumLines = 12;
		const needLineHeightPx = 32;
		const needLineHeightYears = needLineHeightPx / pxPerYear;
		const needShapes: { side: 'left' | 'right'; offsets: number[] }[] = [];
		for (let i = 0; i < worldNeeds.length; i++) {
			const need = worldNeeds[i];
			const side: 'left' | 'right' = need.side;
			const offsets: number[] = [];
			for (let line = 0; line < needNumLines; line++) {
				const sampleYear = need.year + line * needLineHeightYears;
				offsets.push(side === 'right'
					? getStreamRightEdge(sampleYear, absExtent, padL, plotW, activeRegion)
					: getStreamLeftEdge(sampleYear, absExtent, padL, plotW, activeRegion));
			}
			needShapes.push({ side, offsets });
		}
		worldNeedShapes = needShapes;
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

	<section class="legend-bar" class:legend-hidden={!slidingBarVisible}>
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
			<StackedAreaChart {data} {events} heightPx={chartHeight} {activeRegion} onRegionClick={(r) => { activeRegion = r; }} />

			<!-- Sliding value bar: follows active year -->
			<div
				class="bracket-line"
				class:bracket-hidden={!slidingBarVisible}
				style:top="{yearToPercent(slidingBarYear)}%"
				style:left="{slidingBarLeft}px"
				style:width="{slidingBarWidth}px"
			>
				<span class="bracket-label">${Math.round(slidingBarTotal)} Billion</span>
				<div class="bracket-bar">
					<span class="bracket-tick-left"></span>
					<span class="bracket-tick-right"></span>
				</div>
			</div>

			<!-- Left overlay: title + description, follows stream silhouette via shape-outside -->
			{#each events as event, i}
				{@const pct = yearToPercent(event.year)}
				{@const leftOffsets = leftContextShapes[i]?.offsets ?? []}
				{@const gap = 40}
				{@const lineH = 30}
				{@const totalH = leftOffsets.length * lineH}
				{@const cardW = leftOffsets.length > 0 ? Math.max(...leftOffsets) : 0}
				{@const leftPolyPts = leftOffsets.length > 0
					? `${cardW}px 0px, ${cardW}px ${totalH}px, `
						+ [...leftOffsets].reverse().map((x, li) => {
							const lineIdx = leftOffsets.length - 1 - li;
							return `${Math.max(0, x - gap)}px ${lineIdx * lineH}px`;
						}).join(', ')
					: '0 0, 100% 0, 100% 100%, 0 100%'}
				<div
					class="event-card-left"
					class:visible={visible[i]}
					data-event-idx={i}
					style:top="{pct}%"
					style:left="0.5rem"
					style:width="{Math.max(0, cardW - gap)}px"
					style:max-height="{totalH}px"
				>
					<div
						class="left-shape-float"
						style:width="{cardW}px"
						style:height="{totalH}px"
						style:shape-outside="polygon({leftPolyPts})"
						style:clip-path="polygon({leftPolyPts})"
					></div>
					<h3 class="event-title">{event.title}</h3>
					<p class="event-desc">{event.description}</p>
				</div>
			{/each}

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
					style:max-height="{totalH}px"
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

			<!-- World-needs annotations (only when no region is filtered) -->
			{#if !activeRegion}
				{#each worldNeeds as need, i}
					{@const pct = yearToPercent(need.year)}
					{@const shape = worldNeedShapes[i]}
					{@const side = shape?.side ?? need.side}
					{@const offsets = shape?.offsets ?? []}
					{@const gap = 40}
					{@const lineH = 32}
					{@const totalH = offsets.length * lineH}
					{#if side === 'right'}
						{@const polyPts = offsets.length > 0
							? offsets.map((x, li) => `${x + gap}px ${li * lineH}px`).join(', ')
								+ `, ${offsets[offsets.length - 1] + gap}px ${totalH}px, 0px ${totalH}px, 0px 0px`
							: '0px 0px, 0px 100%, 0px 100%'}
						<div
							class="need-card need-right"
							class:visible={worldNeedVisible[i]}
							data-need-idx={i}
							style:top="{pct}%"
							style:left="0"
							style:width="calc(100% - 20px)"
							style:max-height="{totalH}px"
						>
							<div
								class="shape-float"
								style:width="{Math.max(...offsets) + gap + 10}px"
								style:height="{totalH}px"
								style:shape-outside="polygon({polyPts})"
								style:clip-path="polygon({polyPts})"
							></div>
							<p class="need-text">{need.text}</p>
						</div>
					{:else}
						{@const leftPolyPts = offsets.length > 0
							? offsets.map((x, li) => `${Math.max(0, x - gap)}px ${li * lineH}px`).join(', ')
								+ `, ${Math.max(0, offsets[offsets.length - 1] - gap)}px ${totalH}px, 100% ${totalH}px, 100% 0px`
							: '0 0, 100% 0, 100% 100%, 0 100%'}
						<div
							class="need-card need-left"
							class:visible={worldNeedVisible[i]}
							data-need-idx={i}
							style:top="{pct}%"
							style:left="0"
							style:width="calc(100% - 20px)"
							style:max-height="{totalH}px"
						>
							<div
								class="left-shape-float"
								style:width="100%"
								style:height="{totalH}px"
								style:shape-outside="polygon({leftPolyPts})"
								style:clip-path="polygon({leftPolyPts})"
							></div>
							<p class="need-text">{need.text}</p>
						</div>
					{/if}
				{/each}
			{/if}
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

		<div class="acknowledgement">
			<p>
				The data used to build this visualization is available thanks to the hard work
				of dozens and dozens of researchers, editors, librarians and support staff that have worked at SIPRI over the years.
				The Military Expenditure chapter in the SIPRI Yearbook is a valuable source not only to data
				visualization pages like this one, but also to policymakers, historians, scholars, journalists,
				citizens and pretty much anyone interested in understanding how much money goes to the military.
				The data is freely available to anyone and you can access it
				<a href="https://www.sipri.org/databases/milex" target="_blank" rel="noopener">here</a>.
			</p>
			<p>
				A special thanks to all of those that have authored SIPRI Military Expenditure chapters over the years.
				The following list is incomplete and I apologize for the omissions; these are the authors
				from 1992–2025 of the military expenditure chapters of the Yearbook. There are still those
				that preceded us; SIPRI has been publishing the Yearbook since 1969.
				For those who will succeed us, I thank you in advance.
			</p>
			<p class="authors-list">
				Thanks to
				Agn&egrave;s Courades Allebeck,
				Alexandra Kuimova,
				Alexandra Marksteiner,
				Ana Carolina de Oliveira Assis,
				Aude Fleurant,
				Bengt-G&ouml;ran Bergstrand,
				Carina Solmirano,
				Catalina Perdomo,
				Christina Buchhold,
				Damien Fruchart,
				David Shambaugh,
				Diego Lopes da Silva,
				Elisabeth Sk&ouml;ns,
				Erik Whitlock,
				Evamaria Loose-Weintraub,
				Florian Erdle,
				Hel&eacute;n Wilandh,
				Jade Guiberteau Ricard,
				Jan Grebe,
				Julian Cooper,
				Kateryna Kuzmuk,
				Lara Maria G. G. Costa,
				Lorenzo Scarazzato,
				Lucie B&eacute;raud-Sudreau,
				Nan Tian,
				Neil Ferguson,
				Nicole Ball,
				Noah Heinemann,
				Noel Kelly,
				Olawale Ismail,
				Paul George,
				Petter St&aring;lenheim,
				Pieter D. Wezeman,
				Reinhilde Weidacher,
				Robert Bedeski,
				Sam Perlo-Freeman,
				Shaoguang Wang,
				Siemon T. Wezeman,
				Steven M. Kosiak,
				Susan Clark,
				Wael Abdul-Shafi,
				Wuyi Omitoogun,
				Xiao Liang,
				Zubaida A. Karim.
			</p>
		</div>

		<p class="closing">
			Did you enjoy this visualization? If so, consider making a donation to the Red Cross,
			Doctors Without Borders, or to SIPRI. I won't leave any links here for security reasons,
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
		padding-left: calc(var(--space-lg) + 90px);
		transition: opacity 0.4s ease, transform 0.4s ease;
	}

	.legend-bar.legend-hidden {
		opacity: 0;
		transform: translateY(-100%);
		pointer-events: none;
	}

	/* ── Sliding value bar ── */
	.bracket-line {
		position: absolute;
		transform: translateY(-100%);
		z-index: 4;
		display: flex;
		flex-direction: column;
		transition: top 0.35s ease, left 0.35s ease, width 0.35s ease, opacity 0.4s ease;
		align-items: center;
		pointer-events: none;
	}

	.bracket-line.bracket-hidden {
		opacity: 0;
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
		height: 2px;
		background: var(--text);
		opacity: 0.6;
		position: relative;
	}

	.bracket-tick-left,
	.bracket-tick-right {
		position: absolute;
		top: -5px;
		width: 2px;
		height: 12px;
		background: var(--text);
		opacity: 0.6;
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

	/* ── Left overlay: event cards follow stream silhouette ── */
	.event-card-left {
		position: absolute;
		transform: translateY(-0.5em);
		opacity: 0;
		transition: opacity 0.7s ease;
		pointer-events: none;
		z-index: 5;
		overflow: hidden;
	}

	.left-shape-float {
		float: right;
		background: transparent;
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

	/* ── World-needs annotations (alternative funding contrast) ── */
	.need-card {
		position: absolute;
		transform: translateY(-0.5em);
		opacity: 0;
		transition: opacity 0.7s ease;
		pointer-events: none;
		z-index: 4;
		overflow: hidden;
	}

	.need-card.visible {
		opacity: 1;
	}

	.need-text {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 400;
		color: #BB7154;
		line-height: 32px;
		margin: 0;
		font-style: italic;
	}

	/* Left-side world-needs: right edge follows the stream silhouette, mirroring
	   the right-side cards whose left edge follows the stream. */
	.need-card.need-left .need-text {
		text-align: right;
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
		color: var(--text-muted);
	}

	footer .acknowledgement {
		max-width: 650px;
		margin: 2rem auto 0;
	}

	footer .acknowledgement p {
		font-size: 0.95rem;
		font-weight: 300;
		line-height: 1.75;
		color: var(--text-muted);
		text-align: justify;
		margin: 0 0 1rem;
	}

	footer .acknowledgement a {
		color: var(--text-muted);
		text-decoration: underline;
		text-underline-offset: 2px;
		transition: color 0.2s ease;
	}

	footer .acknowledgement a:hover {
		color: var(--text);
	}

	footer .authors-list {
		font-style: italic;
		color: var(--text-muted);
		text-align: justify;
	}

	/* ── Responsive ── */
	@media (max-width: 768px) {
		.left-column {
			flex: 0 0 50px;
		}

		.tick-label {
			right: 8px;
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
