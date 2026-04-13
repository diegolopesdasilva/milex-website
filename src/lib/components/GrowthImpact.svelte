<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	const RE_MEAN = 0.066;

	type Period  = '1950s' | '1960s–80s' | '1990s+';
	type Country = 'developing' | 'developed';

	const MOD_PERIOD:  Record<Period, number>  = { '1950s': 0.253, '1960s–80s': 0, '1990s+': -0.226 };
	const MOD_COUNTRY: Record<Country, number> = { developing: 0, developed: 0.185 };

	// ── SVG layout ──
	const W = 890, H_SCATTER = 360;
	const ML = 60, MR = 120, MT = 20, MB = 50;
	const PW = W - ML - MR;
	const PH = H_SCATTER - MT - MB;

	const Y_MIN = -0.6, Y_MAX = 0.7;
	const X_YEAR_MIN = 1973, X_YEAR_MAX = 2011;
	function xYear(yr: number): number { return ML + ((yr - X_YEAR_MIN) / (X_YEAR_MAX - X_YEAR_MIN)) * PW; }
	function yPcc(pcc: number): number { return MT + PH - ((pcc - Y_MIN) / (Y_MAX - Y_MIN)) * PH; }
	// Inverse scales (SVG coords → data)
	function invXYear(px: number): number { return X_YEAR_MIN + ((px - ML) / PW) * (X_YEAR_MAX - X_YEAR_MIN); }
	function invYPcc(py: number): number { return Y_MIN + ((MT + PH - py) / PH) * (Y_MAX - Y_MIN); }

	// Floating CI dot position (right of plot area)
	const CI_X = W - MR + 25; // center x of floating dot

	// ── Seeded RNG ──
	function mulberry32(seed: number) {
		let a = seed;
		return () => {
			a = (a + 0x6D2B79F5) | 0;
			let t = Math.imul(a ^ (a >>> 15), a | 1);
			t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}
	const rng = mulberry32(31337);
	function gauss(): number {
		const u = Math.max(rng(), 1e-10), v = rng();
		return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
	}

	const YEAR_RANGE: Record<Period, [number, number]> = {
		'1950s':     [1973, 1984],
		'1960s–80s': [1983, 2002],
		'1990s+':    [1997, 2010],
	};

	interface Dot { pcc: number; year: number; period: Period; country: Country }

	const dotGroups: { period: Period; country: Country; n: number }[] = [
		{ period: '1950s',     country: 'developing', n: 5  },
		{ period: '1950s',     country: 'developed',  n: 3  },
		{ period: '1960s–80s', country: 'developing', n: 18 },
		{ period: '1960s–80s', country: 'developed',  n: 14 },
		{ period: '1990s+',    country: 'developing', n: 20 },
		{ period: '1990s+',    country: 'developed',  n: 17 },
	];

	const allDots: Dot[] = [];
	for (const g of dotGroups) {
		const mean = RE_MEAN + MOD_PERIOD[g.period] + MOD_COUNTRY[g.country];
		const [yrLo, yrHi] = YEAR_RANGE[g.period];
		for (let i = 0; i < g.n; i++) {
			allDots.push({
				pcc: Math.max(-0.55, Math.min(0.65, mean + 0.14 * gauss())),
				year: Math.round(yrLo + rng() * (yrHi - yrLo)),
				period: g.period,
				country: g.country,
			});
		}
	}
	allDots.push(
		{ pcc:  0.383, year: 1978, period: '1950s',     country: 'developing' },
		{ pcc:  0.131, year: 1983, period: '1960s–80s', country: 'developing' },
		{ pcc: -0.284, year: 1989, period: '1960s–80s', country: 'developing' },
		{ pcc: -0.456, year: 1997, period: '1990s+',    country: 'developing' },
		{ pcc: -0.148, year: 2007, period: '1990s+',    country: 'developing' },
	);

	const COL_DEVELOPING = '#DD9D7C';
	const COL_DEVELOPED  = '#567B57';

	const devingDots = allDots.filter(d => d.country === 'developing');
	const devedDots  = allDots.filter(d => d.country === 'developed');

	// ── OLS trend line with CI band ──
	interface TrendResult {
		slope: number; intercept: number;
		predict(yr: number): number;
		ciHalf(yr: number): number;
	}

	function computeTrend(dots: Dot[]): TrendResult {
		const n = dots.length;
		let sx = 0, sy = 0, sxx = 0, sxy = 0;
		for (const d of dots) { sx += d.year; sy += d.pcc; sxx += d.year * d.year; sxy += d.year * d.pcc; }
		const xbar = sx / n;
		const denom = n * sxx - sx * sx;
		const slope = denom !== 0 ? (n * sxy - sx * sy) / denom : 0;
		const intercept = (sy - slope * sx) / n;
		let ssr = 0;
		for (const d of dots) { const r = d.pcc - (slope * d.year + intercept); ssr += r * r; }
		const s2 = ssr / (n - 2);
		const sxx_centered = sxx - n * xbar * xbar;
		function predict(yr: number) { return slope * yr + intercept; }
		function ciHalf(yr: number) {
			const h = 1 / n + (yr - xbar) ** 2 / sxx_centered;
			return 1.96 * Math.sqrt(s2 * h);
		}
		return { slope, intercept, predict, ciHalf };
	}

	const trendDeveloping = computeTrend(devingDots);
	const trendDeveloped  = computeTrend(devedDots);

	function ciBandPath(trend: TrendResult): string {
		const years: number[] = [];
		for (let yr = X_YEAR_MIN; yr <= X_YEAR_MAX; yr += 2) years.push(yr);
		if (years[years.length - 1] !== X_YEAR_MAX) years.push(X_YEAR_MAX);
		const upper = years.map(yr => `${xYear(yr).toFixed(1)},${yPcc(trend.predict(yr) + trend.ciHalf(yr)).toFixed(1)}`);
		const lower = [...years].reverse().map(yr => `${xYear(yr).toFixed(1)},${yPcc(trend.predict(yr) - trend.ciHalf(yr)).toFixed(1)}`);
		return `M${upper.join(' L')} L${lower.join(' L')} Z`;
	}

	const ciBandDeveloping = ciBandPath(trendDeveloping);
	const ciBandDeveloped  = ciBandPath(trendDeveloped);

	// ── Mean + CI ──
	function meanAndSE(dots: Dot[]): { mean: number; se: number; n: number } {
		const n = dots.length;
		if (n === 0) return { mean: 0, se: 0, n: 0 };
		const m = dots.reduce((s, d) => s + d.pcc, 0) / n;
		if (n === 1) return { mean: m, se: 0, n: 1 };
		const variance = dots.reduce((s, d) => s + (d.pcc - m) ** 2, 0) / (n - 1);
		return { mean: m, se: Math.sqrt(variance / n), n };
	}

	// ── Selection state for each panel ──
	// Selection box in SVG coordinates
	let selDeveloping: { x0: number; y0: number; x1: number; y1: number } | null = $state(null);
	let selDeveloped:  { x0: number; y0: number; x1: number; y1: number } | null = $state(null);
	let draggingPanel: 'developing' | 'developed' | null = $state(null);

	function getSvgPoint(e: MouseEvent, svg: SVGSVGElement): { x: number; y: number } {
		const pt = svg.createSVGPoint();
		pt.x = e.clientX;
		pt.y = e.clientY;
		const ctm = svg.getScreenCTM()!.inverse();
		const svgPt = pt.matrixTransform(ctm);
		return { x: svgPt.x, y: svgPt.y };
	}

	function onMouseDown(e: MouseEvent, panel: 'developing' | 'developed') {
		const svg = (e.currentTarget as SVGSVGElement);
		const pt = getSvgPoint(e, svg);
		if (pt.x < ML || pt.x > W - MR || pt.y < MT || pt.y > MT + PH) return;
		draggingPanel = panel;
		const sel = { x0: pt.x, y0: pt.y, x1: pt.x, y1: pt.y };
		if (panel === 'developing') selDeveloping = sel;
		else selDeveloped = sel;
	}

	function onMouseMove(e: MouseEvent) {
		if (!draggingPanel) return;
		const svg = (e.currentTarget as SVGSVGElement);
		const pt = getSvgPoint(e, svg);
		const clamped = { x: Math.max(ML, Math.min(W - MR, pt.x)), y: Math.max(MT, Math.min(MT + PH, pt.y)) };
		if (draggingPanel === 'developing' && selDeveloping) {
			selDeveloping = { ...selDeveloping, x1: clamped.x, y1: clamped.y };
		} else if (draggingPanel === 'developed' && selDeveloped) {
			selDeveloped = { ...selDeveloped, x1: clamped.x, y1: clamped.y };
		}
	}

	function onMouseUp() {
		draggingPanel = null;
	}

	function dotInSelection(d: Dot, sel: { x0: number; y0: number; x1: number; y1: number } | null): boolean {
		if (!sel) return false;
		const dx = xYear(d.year);
		const dy = yPcc(d.pcc);
		const xMin = Math.min(sel.x0, sel.x1), xMax = Math.max(sel.x0, sel.x1);
		const yMin = Math.min(sel.y0, sel.y1), yMax = Math.max(sel.y0, sel.y1);
		return dx >= xMin && dx <= xMax && dy >= yMin && dy <= yMax;
	}

	// Is the selection large enough to be meaningful (not just a click)?
	function selIsActive(sel: { x0: number; y0: number; x1: number; y1: number } | null): boolean {
		if (!sel) return false;
		return Math.abs(sel.x1 - sel.x0) > 5 && Math.abs(sel.y1 - sel.y0) > 5;
	}

	// Selected dots per panel
	let selDevingDots = $derived(selIsActive(selDeveloping)
		? devingDots.filter(d => dotInSelection(d, selDeveloping)) : devingDots);
	let selDevedDots = $derived(selIsActive(selDeveloped)
		? devedDots.filter(d => dotInSelection(d, selDeveloped)) : devedDots);

	let statsDeveloping = $derived(meanAndSE(selDevingDots));
	let statsDeveloped  = $derived(meanAndSE(selDevedDots));

	let hasDevingSel = $derived(selIsActive(selDeveloping));
	let hasDevedSel  = $derived(selIsActive(selDeveloped));

	function clearSelection(panel: 'developing' | 'developed') {
		if (panel === 'developing') selDeveloping = null;
		else selDeveloped = null;
	}

	// Rect attributes for selection box
	function selRect(sel: { x0: number; y0: number; x1: number; y1: number }) {
		return {
			x: Math.min(sel.x0, sel.x1),
			y: Math.min(sel.y0, sel.y1),
			width: Math.abs(sel.x1 - sel.x0),
			height: Math.abs(sel.y1 - sel.y0),
		};
	}

	const Y_TICKS = [-0.4, -0.2, 0, 0.2, 0.4, 0.6];
	const X_YEAR_TICKS = [1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010];

	const panelData = [
		{ key: 'developed' as const,  label: 'Developed countries',  dots: devedDots,  col: COL_DEVELOPED,  trend: trendDeveloped,  ciBand: ciBandDeveloped },
		{ key: 'developing' as const, label: 'Developing countries', dots: devingDots, col: COL_DEVELOPING, trend: trendDeveloping, ciBand: ciBandDeveloping },
	];
</script>

<section class="growth-section">
	<div class="growth-content">
		<h2 class="section-title">Is There Such a Thing as a "Defence Dividend"?</h2>
		<p class="section-intro">
			United Kingdom Prime Minister Keir Starmer
			<a href="https://www.gov.uk/government/speeches/prime-ministers-remarks-at-the-london-defence-conference-8-may-2025" class="source-link" target="_blank" rel="noopener">said in 2025</a>
			that "there is a lot of talk about the end of the
			peace dividend: our task now is to seize the defence dividend, felt directly in the pockets
			of working people, creating the jobs of the future." His remark echoes a longstanding argument
			that military expenditures contribute to economic growth.
		</p>
		<p class="section-intro">
			Researchers have been studying this link with econometric methods since at least the late 1970s.
			Initially, it seemed that military expenditures did indeed contribute to economic growth. However,
			over time results began to weaken and eventually reverse. The changes are mostly due to more data
			and more sophisticated statistical methods. Nowadays, most of the evidence points to a null or
			negative effect of military expenditures on economic growth.
		</p>
		<p class="section-intro">
			The two figures below plot the estimates of a meta-study on the relationship between military
			expenditures and economic growth. The trend is quite clear, as the strength and signal of the
			effect weaken and change over time.
		</p>
		<p class="section-intro">
			Remarks like those of Starmer seem to be greatly influenced by earlier results — decades old —
			that have mostly considered industrial economies.
		</p>

		<div class="chart-block">
			<p class="chart-label">
				77 statistically significant estimates by publication year
				<span class="chart-sublabel">— drag to select dots and compute their mean</span>
			</p>
			<div class="scatter-stack">
				{#each panelData as panel}
					{@const sel = panel.key === 'developing' ? selDeveloping : selDeveloped}
					{@const stats = panel.key === 'developing' ? statsDeveloping : statsDeveloped}
					{@const hasSel = panel.key === 'developing' ? hasDevingSel : hasDevedSel}
					{@const selDots = panel.key === 'developing' ? selDevingDots : selDevedDots}
					<div class="scatter-panel">
						<p class="panel-label" style:color={panel.col}>
							{panel.label}
							<span class="panel-count">({panel.dots.length} estimates)</span>
						</p>

						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<svg
							viewBox="0 0 {W} {H_SCATTER}"
							preserveAspectRatio="xMidYMid meet"
							class="chart-svg scatter-svg"
							onmousedown={(e) => onMouseDown(e, panel.key)}
							onmousemove={onMouseMove}
							onmouseup={onMouseUp}
							onmouseleave={onMouseUp}
						>
							<!-- Zone shading -->
							<rect x={ML} y={MT} width={PW} height={yPcc(0) - MT}
								fill="var(--region-americas)" opacity="0.03"/>
							<rect x={ML} y={yPcc(0)} width={PW} height={MT + PH - yPcc(0)}
								fill="var(--region-africa)" opacity="0.03"/>

							<!-- Zero reference line -->
							<line x1={ML} x2={W - MR} y1={yPcc(0)} y2={yPcc(0)}
								stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="5,3" opacity="0.4"/>

							<!-- Grid lines (horizontal) -->
							{#each Y_TICKS as t}
								{#if t !== 0}
									<line x1={ML} x2={W - MR} y1={yPcc(t)} y2={yPcc(t)}
										stroke="var(--border-light)" stroke-width="0.5" opacity="0.5"/>
								{/if}
							{/each}

							<!-- Grid lines (vertical) -->
							{#each X_YEAR_TICKS as yr}
								<line x1={xYear(yr)} x2={xYear(yr)} y1={MT} y2={MT + PH}
									stroke="var(--border-light)" stroke-width="0.5" opacity="0.3"/>
							{/each}

							<!-- Trend CI band -->
							<path d={panel.ciBand} fill={panel.col} opacity="0.12"/>

							<!-- Trend line (continuous) -->
							<line
								x1={xYear(X_YEAR_MIN)} y1={yPcc(panel.trend.predict(X_YEAR_MIN))}
								x2={xYear(X_YEAR_MAX)} y2={yPcc(panel.trend.predict(X_YEAR_MAX))}
								stroke={panel.col} stroke-width="2.5" opacity="0.7"
							/>

							<!-- Dots -->
							{#each panel.dots as d}
								<circle
									cx={xYear(d.year)} cy={yPcc(d.pcc)}
									r={4}
									fill={panel.col}
									opacity={hasSel ? (dotInSelection(d, sel) ? 0.85 : 0.15) : 0.6}
									stroke={hasSel && dotInSelection(d, sel) ? panel.col : 'var(--bg)'}
									stroke-width={hasSel && dotInSelection(d, sel) ? 1.5 : 0.8}
								/>
							{/each}

							<!-- Selection rectangle -->
							{#if sel && selIsActive(sel)}
								<rect
									x={selRect(sel).x} y={selRect(sel).y}
									width={selRect(sel).width} height={selRect(sel).height}
									fill={panel.col} fill-opacity="0.08"
									stroke={panel.col} stroke-width="1.5" stroke-dasharray="4,3"
									rx="3"
								/>
							{/if}

							<!-- Y-axis -->
							{#each Y_TICKS as t}
								<line x1={ML - 4} x2={ML} y1={yPcc(t)} y2={yPcc(t)}
									stroke="var(--text-muted)" stroke-width="1"/>
								<text x={ML - 8} y={yPcc(t) + 4}
									text-anchor="end" class="tick-label">{t.toFixed(1)}</text>
							{/each}
							<text
								x={14} y={MT + PH / 2}
								transform="rotate(-90, 14, {MT + PH / 2})"
								text-anchor="middle" class="axis-title">
								Partial correlation (PCC)
							</text>

							<!-- X-axis -->
							<line x1={ML} x2={W - MR} y1={MT + PH} y2={MT + PH}
								stroke="var(--border-light)" stroke-width="1"/>
							{#each X_YEAR_TICKS as yr}
								<line x1={xYear(yr)} x2={xYear(yr)} y1={MT + PH} y2={MT + PH + 6}
									stroke="var(--text-muted)" stroke-width="1"/>
								<text x={xYear(yr)} y={MT + PH + 20}
									text-anchor="middle" class="tick-label">{yr}</text>
							{/each}
							<text x={ML + PW / 2} y={H_SCATTER - 5}
								text-anchor="middle" class="axis-title">
								Publication year
							</text>

							<!-- Zero label -->
							<text x={W - MR - 4} y={yPcc(0) - 6}
								text-anchor="end" class="zero-label">PCC = 0</text>

							<!-- ── Floating mean dot + CI whisker (right side) ── -->
							<!-- Vertical CI whisker -->
							<line
								x1={CI_X} x2={CI_X}
								y1={yPcc(stats.mean + 1.96 * stats.se)}
								y2={yPcc(stats.mean - 1.96 * stats.se)}
								stroke={panel.col} stroke-width="2" stroke-linecap="round"
								opacity="0.7" class="ci-anim"/>
							<!-- End caps -->
							<line
								x1={CI_X - 5} x2={CI_X + 5}
								y1={yPcc(stats.mean + 1.96 * stats.se)}
								y2={yPcc(stats.mean + 1.96 * stats.se)}
								stroke={panel.col} stroke-width="1.5" opacity="0.7" class="ci-anim"/>
							<line
								x1={CI_X - 5} x2={CI_X + 5}
								y1={yPcc(stats.mean - 1.96 * stats.se)}
								y2={yPcc(stats.mean - 1.96 * stats.se)}
								stroke={panel.col} stroke-width="1.5" opacity="0.7" class="ci-anim"/>
							<!-- Mean dot -->
							<circle cx={CI_X} cy={yPcc(stats.mean)} r={6}
								fill={panel.col} opacity="0.9" class="ci-anim"/>
							<!-- Value label -->
							<text x={CI_X + 14} y={yPcc(stats.mean) + 4}
								text-anchor="start" class="ci-val" fill={panel.col}>
								{stats.mean.toFixed(3)}
							</text>
							<!-- "mean" label -->
							<text x={CI_X} y={MT + PH + 20}
								text-anchor="middle" class="ci-axis-label">mean</text>
						</svg>

						<!-- Selection info text -->
						<p class="sel-info">
							{#if hasSel}
								Selection: {selDots.length} of {panel.dots.length} estimates
								<button class="clear-btn" onclick={() => clearSelection(panel.key)}>Clear</button>
							{:else}
								{panel.dots.length} estimates — drag to select
							{/if}
						</p>
					</div>
				{/each}
			</div>
		</div>

		<p class="methodology-note">
			Based on Alptekin &amp; Levine (2012), "Military Expenditure and Economic Growth: A Meta-Analysis,"
			<em>European Journal of Political Economy</em> 28(4), 636–650. Of 169 estimates across 32 studies,
			77 are statistically significant (26 negative, 51 positive). Dot positions are simulated from
			group-specific distributions shifted by the HLM meta-regression moderator coefficients
			(Table&thinsp;4): period dummies (1950s: +0.253; 1990s+: −0.226) and developed-country dummy (+0.185).
			Publication years are approximate within each period. The trend line is a simple OLS fit
			with a 95% confidence band for the regression line.
			No publication bias detected (FAT: β₀ = 0.112, t = 0.43, p &gt; 0.05).
			A genuine effect was confirmed (PET: β₁ = 0.099, t = 3.48, p &lt; 0.01).
		</p>
	</div>
</section>

<style>
	.growth-section {
		padding: 2rem 0 8rem;
	}

	.growth-content {
		width: 100%;
	}

	.section-title {
		font-family: var(--font-display);
		font-size: clamp(2.5rem, 5vw, 4rem);
		font-weight: 400;
		font-style: italic;
		color: var(--text);
		text-align: left;
		margin-bottom: 2.5rem;
		line-height: 1.2;
	}

	.section-intro {
		font-family: var(--font-sans);
		font-size: clamp(1.15rem, 2.2vw, 1.5rem);
		font-weight: 300;
		line-height: 1.85;
		color: var(--text-muted);
		text-align: justify;
		margin-bottom: 1.5rem;
	}

	.section-intro strong {
		font-weight: 600;
		color: var(--text);
	}

	.section-intro :global(.source-link) {
		color: var(--text-muted);
		text-decoration: underline;
		text-underline-offset: 2px;
		transition: color 0.2s ease;
	}

	.section-intro :global(.source-link:hover) {
		color: var(--text);
	}

	.chart-block {
		margin-top: 2rem;
	}

	.chart-label {
		font-family: var(--font-sans);
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--text-muted);
		letter-spacing: 0.02em;
		text-transform: uppercase;
		margin: 0 0 0.5rem;
	}

	.chart-sublabel {
		font-weight: 300;
		text-transform: none;
		letter-spacing: 0;
		color: var(--text-light);
	}

	.chart-svg {
		width: 100%;
		height: auto;
		display: block;
	}

	.scatter-svg {
		cursor: crosshair;
		user-select: none;
	}

	.scatter-stack {
		display: flex;
		flex-direction: column;
		gap: 3rem;
	}

	.scatter-panel {
		width: 100%;
	}

	.panel-label {
		font-family: var(--font-display);
		font-size: 1.4rem;
		font-weight: 400;
		font-style: italic;
		margin: 0 0 0.3rem;
	}

	.panel-count {
		font-family: var(--font-sans);
		font-size: 0.85rem;
		font-weight: 300;
		font-style: normal;
		color: var(--text-light);
	}

	.sel-info {
		font-family: var(--font-sans);
		font-size: 0.85rem;
		font-weight: 300;
		color: var(--text-light);
		margin: 0.3rem 0 0;
	}

	.clear-btn {
		font-family: var(--font-sans);
		font-size: 0.78rem;
		font-weight: 400;
		color: var(--text-light);
		background: none;
		border: 1px solid var(--border-light);
		border-radius: 3px;
		padding: 0.15rem 0.5rem;
		cursor: pointer;
		margin-left: 0.5rem;
		vertical-align: middle;
		transition: color 0.2s, border-color 0.2s;
	}

	.clear-btn:hover {
		color: var(--text);
		border-color: var(--text-muted);
	}

	:global(.zone-label) {
		font-family: var(--font-sans);
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.03em;
	}
	:global(.zone-label.neg) { fill: var(--region-africa); }
	:global(.zone-label.pos) { fill: var(--region-americas); }

	:global(.ci-anim) {
		transition: all 0.4s ease;
	}

	:global(.ci-val) {
		font-family: var(--font-display);
		font-size: 13px;
		font-style: italic;
		font-weight: 400;
		transition: all 0.4s ease;
	}

	:global(.ci-axis-label) {
		font-family: var(--font-sans);
		font-size: 10px;
		fill: var(--text-light);
	}

	:global(.zero-label) {
		font-family: var(--font-sans);
		font-size: 10px;
		font-weight: 400;
		fill: var(--text-light);
	}

	:global(.tick-label) {
		font-family: var(--font-sans);
		font-size: 12px;
		fill: var(--text-muted);
	}

	:global(.axis-title) {
		font-family: var(--font-sans);
		font-size: 12px;
		fill: var(--text-muted);
	}


	.methodology-note {
		font-family: var(--font-sans);
		font-size: clamp(0.88rem, 1.4vw, 1rem);
		font-weight: 300;
		line-height: 1.8;
		color: var(--text-light);
		margin-top: 3.5rem;
		text-align: justify;
		border-top: 1px solid var(--border-light);
		padding-top: 1.5rem;
	}

	.methodology-note em {
		font-style: italic;
	}

	@media (max-width: 768px) {
		.growth-section { padding: 4rem 0 6rem; }
		.section-title { font-size: 2rem; }
	}
</style>
