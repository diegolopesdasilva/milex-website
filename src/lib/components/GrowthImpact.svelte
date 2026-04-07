<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	// ── Alptekin & Levine (2012) ──
	// 32 studies · 169 estimates · 77 statistically significant

	const RE_MEAN = 0.066;

	type Period  = '1950s' | '1960s–80s' | '1990s+';
	type Country = 'developing' | 'developed';

	const MOD_PERIOD:  Record<Period, number>  = { '1950s': 0.253, '1960s–80s': 0, '1990s+': -0.226 };
	const MOD_COUNTRY: Record<Country, number> = { developing: 0, developed: 0.185 };

	// ── SVG layout ──
	const W = 800, H_SCATTER = 360, H_GAUGE = 70;
	const ML = 60, MR = 30, MT = 20, MB = 50;
	const PW = W - ML - MR;
	const PH = H_SCATTER - MT - MB;

	const Y_MIN = -0.6, Y_MAX = 0.7;
	const X_YEAR_MIN = 1973, X_YEAR_MAX = 2011;
	function xYear(yr: number): number { return ML + ((yr - X_YEAR_MIN) / (X_YEAR_MAX - X_YEAR_MIN)) * PW; }
	function yPcc(pcc: number): number { return MT + PH - ((pcc - Y_MIN) / (Y_MAX - Y_MIN)) * PH; }

	// PCC axis for gauge
	const PCC_MIN = -0.6, PCC_MAX = 0.6;
	function xsPcc(v: number): number { return ML + ((v - PCC_MIN) / (PCC_MAX - PCC_MIN)) * PW; }
	const PCC_TICKS = [-0.4, -0.2, 0, 0.2, 0.4];
	const AX_G = H_GAUGE - 18;
	const GCY = 30;

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
	// Named studies
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
		// for CI band at each year
		predict(yr: number): number;
		ciHalf(yr: number): number; // ±1.96 * SE of prediction
	}

	function computeTrend(dots: Dot[]): TrendResult {
		const n = dots.length;
		let sx = 0, sy = 0, sxx = 0, sxy = 0;
		for (const d of dots) { sx += d.year; sy += d.pcc; sxx += d.year * d.year; sxy += d.year * d.pcc; }
		const xbar = sx / n;
		const denom = n * sxx - sx * sx;
		const slope = denom !== 0 ? (n * sxy - sx * sy) / denom : 0;
		const intercept = (sy - slope * sx) / n;

		// Residual SE
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

	// Build CI band polygon points (sample every 2 years)
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

	// ── Mean + CI for each panel's gauge ──
	function meanAndSE(dots: Dot[]): { mean: number; se: number } {
		const n = dots.length;
		const m = dots.reduce((s, d) => s + d.pcc, 0) / n;
		const variance = dots.reduce((s, d) => s + (d.pcc - m) ** 2, 0) / (n - 1);
		return { mean: m, se: Math.sqrt(variance / n) };
	}

	const statsDeveloping = meanAndSE(devingDots);
	const statsDeveloped  = meanAndSE(devedDots);

	const Y_TICKS = [-0.4, -0.2, 0, 0.2, 0.4, 0.6];
	const X_YEAR_TICKS = [1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010];

	function interp(v: number): string {
		if (v >  0.20) return 'These studies tend to find a <b>clearly positive</b> association — higher military spending linked to faster growth.';
		if (v >  0.05) return 'These studies tend to find a <b>weakly positive</b> association — slightly higher growth with higher spending.';
		if (v > -0.05) return 'These studies tend to find <b>little or no effect</b> — the relationship is ambiguous.';
		return 'These studies tend to find a <b>negative</b> association — higher military spending linked to slower growth.';
	}

	const panels = [
		{ label: 'Developing countries', dots: devingDots, col: COL_DEVELOPING, trend: trendDeveloping, ciBand: ciBandDeveloping, stats: statsDeveloping },
		{ label: 'Developed countries',  dots: devedDots,  col: COL_DEVELOPED,  trend: trendDeveloped,  ciBand: ciBandDeveloped,  stats: statsDeveloped },
	];
</script>

<section class="growth-section">
	<div class="growth-content">
		<h2 class="section-title">What Does the Evidence Say?</h2>
		<p class="section-intro">
			The relationship between military spending and economic growth has been debated for decades.
			Alptekin &amp; Levine (2012) synthesised <strong>169 estimates</strong> from
			<strong>32 studies</strong> in the most comprehensive meta-analysis of this literature.
			Their headline finding: the average partial correlation between military spending and growth
			is small and positive (PCC ≈ 0.07), with no evidence of publication bias —
			but the results are highly heterogeneous. Of the 169 estimates,
			<strong>77</strong> are statistically significant: 26 negative (military spending
			harms growth) and 51 positive (military spending helps growth).
			Where you look, and when, matters enormously.
		</p>

		<div class="chart-block">
			<p class="chart-label">
				77 statistically significant estimates by publication year
			</p>
			<div class="scatter-stack">
				{#each panels as panel}
					<div class="scatter-panel">
						<p class="panel-label" style:color={panel.col}>
							{panel.label}
							<span class="panel-count">({panel.dots.length} estimates)</span>
						</p>

						<!-- Scatterplot -->
						<svg
							viewBox="0 0 {W} {H_SCATTER}"
							preserveAspectRatio="xMidYMid meet"
							class="chart-svg"
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
									opacity={0.6}
									stroke="var(--bg)" stroke-width="0.8"
								/>
							{/each}

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
						</svg>

						<!-- Gauge for this panel -->
						<div class="panel-gauge">
							<p class="gauge-label">
								Mean PCC = {panel.stats.mean.toFixed(3)}
								<span class="gauge-sublabel">
									(95% CI: {(panel.stats.mean - 1.96 * panel.stats.se).toFixed(3)} to {(panel.stats.mean + 1.96 * panel.stats.se).toFixed(3)})
								</span>
							</p>
							<svg
								viewBox="0 0 {W} {H_GAUGE}"
								preserveAspectRatio="xMidYMid meet"
								class="chart-svg"
							>
								<!-- Zone shading -->
								<rect x={ML} y={4} width={xsPcc(0) - ML} height={H_GAUGE - 22}
									fill="var(--region-africa)" opacity="0.04"/>
								<rect x={xsPcc(0)} y={4} width={W - MR - xsPcc(0)} height={H_GAUGE - 22}
									fill="var(--region-americas)" opacity="0.04"/>

								<!-- Zero reference -->
								<line x1={xsPcc(0)} x2={xsPcc(0)} y1={4} y2={AX_G}
									stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="4,3" opacity="0.55"/>

								<!-- Axis -->
								<line x1={ML} x2={W - MR} y1={AX_G} y2={AX_G}
									stroke="var(--border-light)" stroke-width="1"/>
								{#each PCC_TICKS as t}
									<line x1={xsPcc(t)} x2={xsPcc(t)} y1={AX_G - 3} y2={AX_G + 5}
										stroke="var(--border-light)" stroke-width="1"/>
									<text x={xsPcc(t)} y={AX_G + 16}
										text-anchor="middle" class="tick-label">{t.toFixed(1)}</text>
								{/each}

								<!-- CI whisker -->
								<line
									x1={xsPcc(panel.stats.mean - 1.96 * panel.stats.se)}
									x2={xsPcc(panel.stats.mean + 1.96 * panel.stats.se)}
									y1={GCY} y2={GCY}
									stroke={panel.col} stroke-width="2.5" stroke-linecap="round"/>
								<line
									x1={xsPcc(panel.stats.mean - 1.96 * panel.stats.se)}
									x2={xsPcc(panel.stats.mean - 1.96 * panel.stats.se)}
									y1={GCY - 6} y2={GCY + 6}
									stroke={panel.col} stroke-width="1.5"/>
								<line
									x1={xsPcc(panel.stats.mean + 1.96 * panel.stats.se)}
									x2={xsPcc(panel.stats.mean + 1.96 * panel.stats.se)}
									y1={GCY - 6} y2={GCY + 6}
									stroke={panel.col} stroke-width="1.5"/>
								<circle
									cx={xsPcc(panel.stats.mean)} cy={GCY}
									r={5} fill={panel.col}/>
							</svg>
							<p class="interp-text" class:neg={panel.stats.mean < -0.05} class:neutral={panel.stats.mean >= -0.05 && panel.stats.mean <= 0.05}>
								{@html interp(panel.stats.mean)}
							</p>
						</div>
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
		padding: 6rem 0 8rem;
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
		text-align: center;
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

	/* ── Charts ── */
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

	.chart-svg {
		width: 100%;
		height: auto;
		display: block;
	}

	/* ── Scatter panels (stacked) ── */
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

	/* ── Per-panel gauge ── */
	.panel-gauge {
		margin-top: 0.8rem;
	}

	.gauge-label {
		font-family: var(--font-sans);
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-muted);
		margin: 0 0 0.3rem;
	}

	.gauge-sublabel {
		font-weight: 300;
		color: var(--text-light);
	}

	/* ── SVG text ── */
	:global(.zone-label) {
		font-family: var(--font-sans);
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.03em;
	}
	:global(.zone-label.neg) { fill: var(--region-africa); }
	:global(.zone-label.pos) { fill: var(--region-americas); }

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

	/* ── Interpretation text ── */
	.interp-text {
		font-family: var(--font-sans);
		font-size: clamp(1rem, 1.8vw, 1.15rem);
		font-weight: 300;
		line-height: 1.75;
		color: var(--text-muted);
		margin-top: 0.5rem;
		transition: color 0.3s ease;
	}

	.interp-text.neg     { color: var(--region-africa); }
	.interp-text.neutral { color: var(--text-muted); }

	.interp-text :global(b) {
		font-weight: 600;
		color: inherit;
	}

	/* ── Methodology note ── */
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

	/* ── Responsive ── */
	@media (max-width: 768px) {
		.growth-section { padding: 4rem 0 6rem; }
		.section-title { font-size: 2rem; }
	}
</style>
