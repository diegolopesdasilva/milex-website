<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	// ── Alptekin & Levine (2012) ──
	// 32 studies · 169 estimates · 77 statistically significant
	// RE pooled PCC = 0.066 [0.037, 0.095]
	// No publication bias (FAT β₀ = 0.112, t = 0.43)
	// Genuine effect (PET β₁ = 0.099, t = 3.48)
	// Q(168) = 593.1 → high heterogeneity

	const RE_MEAN = 0.066;

	// ── Types ──
	type Period  = '1950s' | '1960s–80s' | '1990s+';
	type Country = 'developing' | 'developed';

	// ── Moderator coefficients (HLM, Table 4 col 6) ──
	const MOD_PERIOD:  Record<Period, number>  = { '1950s': 0.253, '1960s–80s': 0, '1990s+': -0.226 };
	const MOD_COUNTRY: Record<Country, number> = { developing: 0, developed: 0.185 };

	// Approximate SEs
	const SE_BASE = 0.015;
	const SE_P: Record<Period, number>  = { '1950s': 0.115, '1960s–80s': 0, '1990s+': 0.103 };
	const SE_C: Record<Country, number> = { developing: 0, developed: 0.062 };

	// ── Filter state (for meta-regression gauge) ──
	let periodFilter: Period  = $state('1960s–80s');
	let countryFilter: Country = $state('developing');

	// ── Contextual estimate + CI ──
	let pMod   = $derived(MOD_PERIOD[periodFilter]);
	let cMod   = $derived(MOD_COUNTRY[countryFilter]);
	let rawCtx = $derived(RE_MEAN + pMod + cMod);
	let ctxSE  = $derived(Math.sqrt(SE_BASE ** 2 + SE_P[periodFilter] ** 2 + SE_C[countryFilter] ** 2));
	let ciLo   = $derived(rawCtx - 1.96 * ctxSE);
	let ciHi   = $derived(rawCtx + 1.96 * ctxSE);

	// ── Tweened values ──
	const tCtx  = tweened(RE_MEAN, { duration: 500, easing: cubicOut });
	const tCILo = tweened(RE_MEAN - 1.96 * SE_BASE, { duration: 500, easing: cubicOut });
	const tCIHi = tweened(RE_MEAN + 1.96 * SE_BASE, { duration: 500, easing: cubicOut });
	$effect(() => { tCtx.set(rawCtx); tCILo.set(ciLo); tCIHi.set(ciHi); });

	// ── SVG layout ──
	const W = 800, H_SCATTER = 340, H_GAUGE = 80;
	const ML = 60, MR = 30, MT = 20, MB = 50;
	const PW = W - ML - MR;
	const PH = H_SCATTER - MT - MB;

	// Scales
	const Y_MIN = -0.6, Y_MAX = 0.7;
	const X_YEAR_MIN = 1973, X_YEAR_MAX = 2011;
	function xYear(yr: number): number { return ML + ((yr - X_YEAR_MIN) / (X_YEAR_MAX - X_YEAR_MIN)) * PW; }
	function yPcc(pcc: number): number { return MT + PH - ((pcc - Y_MIN) / (Y_MAX - Y_MIN)) * PH; }

	// PCC axis for gauge (same as before)
	const PCC_MIN = -0.8, PCC_MAX = 0.8;
	function xsPcc(v: number): number { return ML + ((v - PCC_MIN) / (PCC_MAX - PCC_MIN)) * (W - ML - MR); }
	const PCC_TICKS = [-0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8];
	const AX_G = H_GAUGE - 20;
	const GCY = 34;

	let ptX    = $derived(xsPcc($tCtx));
	let loX    = $derived(xsPcc($tCILo));
	let hiX    = $derived(xsPcc($tCIHi));
	let ptCol  = $derived($tCtx < 0 ? 'var(--region-africa)' : 'var(--region-americas)');

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

	// ── Year ranges for each period (publication years) ──
	const YEAR_RANGE: Record<Period, [number, number]> = {
		'1950s':     [1973, 1984],
		'1960s–80s': [1983, 2002],
		'1990s+':    [1997, 2010],
	};

	// ── Generate 77 significant dots with year + country ──
	interface Dot { pcc: number; year: number; period: Period; country: Country }

	const dotGroups: { period: Period; country: Country; n: number }[] = [
		{ period: '1950s',     country: 'developing', n: 5  },
		{ period: '1950s',     country: 'developed',  n: 3  },
		{ period: '1960s–80s', country: 'developing', n: 18 },
		{ period: '1960s–80s', country: 'developed',  n: 14 },
		{ period: '1990s+',    country: 'developing', n: 20 },
		{ period: '1990s+',    country: 'developed',  n: 17 },
	]; // total = 77

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
	const namedDots: (Dot & { label: string })[] = [
		{ label: 'Benoit (1978)',        pcc:  0.383, year: 1978, period: '1950s',     country: 'developing' },
		{ label: 'Deger & Smith (1983)', pcc:  0.131, year: 1983, period: '1960s–80s', country: 'developing' },
		{ label: 'Looney (1989)',        pcc: -0.284, year: 1989, period: '1960s–80s', country: 'developing' },
		{ label: 'Antonakis (1997)',     pcc: -0.456, year: 1997, period: '1990s+',    country: 'developing' },
		{ label: 'Yakovlev (2007)',      pcc: -0.148, year: 2007, period: '1990s+',    country: 'developing' },
	];

	// Colours
	const COL_DEVELOPING = '#DD9D7C';
	const COL_DEVELOPED  = '#567B57';

	// Split dots by country
	const devingDots = [...allDots.filter(d => d.country === 'developing'), ...namedDots.filter(d => d.country === 'developing')];
	const devedDots  = [...allDots.filter(d => d.country === 'developed'),  ...namedDots.filter(d => d.country === 'developed')];

	// Ticks
	const Y_TICKS = [-0.4, -0.2, 0, 0.2, 0.4, 0.6];
	const X_YEAR_TICKS = [1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010];

	// ── Button options ──
	const periodOptions: Period[] = ['1950s', '1960s–80s', '1990s+'];

	// ── Interpretation ──
	function interp(v: number): string {
		if (v >  0.20) return 'Studies of this type tend to find a <b>clearly positive</b> association — higher military spending linked to faster growth.';
		if (v >  0.05) return 'Studies of this type tend to find a <b>weakly positive</b> association — slightly higher growth with higher spending.';
		if (v > -0.05) return 'Studies of this type tend to find <b>little or no effect</b> — the relationship is ambiguous.';
		return 'Studies of this type tend to find a <b>negative</b> association — higher military spending linked to slower growth.';
	}
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

		<!-- ══ Scatterplots (side by side) ══ -->
		<div class="chart-block">
			<p class="chart-label">
				77 statistically significant estimates by publication year
			</p>
			<div class="scatter-pair">
				{#each [
					{ label: 'Developing countries', dots: devingDots, col: COL_DEVELOPING },
					{ label: 'Developed countries',  dots: devedDots,  col: COL_DEVELOPED }
				] as panel}
					<div class="scatter-panel">
						<p class="panel-label" style:color={panel.col}>{panel.label}</p>
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

							<!-- Zone labels -->
							<text x={ML + 6} y={yPcc(0) - 8}
								class="zone-label pos" text-anchor="start">Beneficial to growth</text>
							<text x={ML + 6} y={yPcc(0) + 16}
								class="zone-label neg" text-anchor="start">Harmful to growth</text>

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

							<!-- Dots (uniform size, no labels) -->
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
						</svg>
					</div>
				{/each}
			</div>
		</div>

		<!-- ══ Meta-regression estimate with CI ══ -->
		<div class="context-block">
			<p class="chart-label">How does context shift the estimated effect?</p>
			<p class="context-sub">
				Use the buttons below to see how the meta-regression adjusted estimate shifts
				with study characteristics (HLM coefficients from Table&thinsp;4).
			</p>

			<div class="filters">
				<div class="filter-group">
					<span class="filter-label">Time period of data</span>
					<div class="btn-group">
						{#each periodOptions as p}
							<button class="tog" class:active={periodFilter === p}
								onclick={() => periodFilter = p}>{p}</button>
						{/each}
					</div>
				</div>
				<div class="filter-group">
					<span class="filter-label">Country sample</span>
					<div class="btn-group">
						<button class="tog" class:active={countryFilter === 'developing'}
							onclick={() => countryFilter = 'developing'}>Developing</button>
						<button class="tog" class:active={countryFilter === 'developed'}
							onclick={() => countryFilter = 'developed'}>Developed</button>
					</div>
				</div>
			</div>

			<svg
				viewBox="0 0 {W} {H_GAUGE}"
				preserveAspectRatio="xMidYMid meet"
				class="chart-svg gauge-svg"
				aria-label="Meta-regression estimate with confidence interval"
			>
				<!-- Zone shading -->
				<rect x={ML} y={4} width={xsPcc(0) - ML} height={H_GAUGE - 24}
					fill="var(--region-africa)" opacity="0.04"/>
				<rect x={xsPcc(0)} y={4} width={W - MR - xsPcc(0)} height={H_GAUGE - 24}
					fill="var(--region-americas)" opacity="0.04"/>

				<!-- Zero reference -->
				<line x1={xsPcc(0)} x2={xsPcc(0)} y1={4} y2={AX_G}
					stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="4,3" opacity="0.55"/>

				<!-- Axis -->
				<line x1={ML} x2={W - MR} y1={AX_G} y2={AX_G}
					stroke="var(--border-light)" stroke-width="1.5"/>
				{#each PCC_TICKS as t}
					<line x1={xsPcc(t)} x2={xsPcc(t)} y1={AX_G - 4} y2={AX_G + 7}
						stroke="var(--border-light)" stroke-width="1"/>
					<text x={xsPcc(t)} y={AX_G + 18}
						text-anchor="middle" class="tick-label">{t.toFixed(1)}</text>
				{/each}

				<!-- CI whisker line -->
				<line x1={loX} x2={hiX} y1={GCY} y2={GCY}
					stroke={ptCol} stroke-width="2.5" stroke-linecap="round" class="ci-line"/>
				<line x1={loX} x2={loX} y1={GCY - 7} y2={GCY + 7}
					stroke={ptCol} stroke-width="1.8" class="ci-line"/>
				<line x1={hiX} x2={hiX} y1={GCY - 7} y2={GCY + 7}
					stroke={ptCol} stroke-width="1.8" class="ci-line"/>

				<!-- Circle at point estimate -->
				<circle cx={ptX} cy={GCY} r={6}
					fill={ptCol} class="ci-line"/>

				<!-- Value label -->
				<text x={ptX} y={GCY - 14}
					text-anchor="middle" class="pointer-val" fill={ptCol}>
					{$tCtx.toFixed(3)}
				</text>
			</svg>

			<p class="interp-text" class:neg={rawCtx < -0.05} class:neutral={rawCtx >= -0.05 && rawCtx <= 0.05}>
				{@html interp(rawCtx)}
			</p>
		</div>

		<p class="methodology-note">
			Based on Alptekin &amp; Levine (2012), "Military Expenditure and Economic Growth: A Meta-Analysis,"
			<em>European Journal of Political Economy</em> 28(4), 636–650. Of 169 estimates across 32 studies,
			77 are statistically significant (26 negative, 51 positive). Dot positions are simulated from
			group-specific distributions shifted by the HLM meta-regression moderator coefficients
			(Table&thinsp;4): period dummies (1950s: +0.253; 1990s+: −0.226) and developed-country dummy (+0.185).
			Publication years are approximate within each period.
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
	.chart-block,
	.context-block {
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

	.context-sub {
		font-family: var(--font-sans);
		font-size: 0.92rem;
		font-weight: 300;
		color: var(--text-light);
		line-height: 1.6;
		margin: 0 0 1rem;
	}

	.chart-svg {
		width: 100%;
		height: auto;
		display: block;
	}

	.scatter-pair {
		display: flex;
		gap: 1.5rem;
	}

	.scatter-panel {
		flex: 1;
		min-width: 0;
	}

	.panel-label {
		font-family: var(--font-display);
		font-size: 1.3rem;
		font-weight: 400;
		font-style: italic;
		margin: 0 0 0.3rem;
	}

	.gauge-svg {
		margin-top: 0.5rem;
	}

	/* ── Filters ── */
	.filters {
		display: flex;
		gap: 3rem;
		flex-wrap: wrap;
		margin-bottom: 0.5rem;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.filter-label {
		font-family: var(--font-sans);
		font-size: 0.88rem;
		font-weight: 400;
		color: var(--text-muted);
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}

	.btn-group {
		display: flex;
		gap: 0;
	}

	.tog {
		font-family: var(--font-sans);
		font-size: 0.9rem;
		font-weight: 400;
		color: var(--text-muted);
		background: none;
		border: 1px solid var(--border-light);
		padding: 0.35rem 0.9rem;
		cursor: pointer;
		transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
		margin-left: -1px;
	}

	.tog:first-child { border-radius: 4px 0 0 4px; margin-left: 0; }
	.tog:last-child  { border-radius: 0 4px 4px 0; }

	.tog.active {
		background: var(--text);
		color: var(--bg);
		border-color: var(--text);
		z-index: 1;
	}

	/* ── Transitions ── */
	.ci-line {
		transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
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

	:global(.study-label) {
		font-family: var(--font-sans);
		font-size: 10.5px;
		font-weight: 400;
	}

	:global(.legend-label) {
		font-family: var(--font-sans);
		font-size: 11px;
		font-weight: 400;
		fill: var(--text-muted);
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

	:global(.pointer-val) {
		font-family: var(--font-display);
		font-size: 14px;
		font-style: italic;
	}

	/* ── Interpretation text ── */
	.interp-text {
		font-family: var(--font-sans);
		font-size: clamp(1.05rem, 2vw, 1.25rem);
		font-weight: 300;
		line-height: 1.75;
		color: var(--text-muted);
		margin-top: 1.2rem;
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
		.filters { gap: 1.5rem; }
		.section-title { font-size: 2rem; }
		.scatter-pair { flex-direction: column; }
	}
</style>
