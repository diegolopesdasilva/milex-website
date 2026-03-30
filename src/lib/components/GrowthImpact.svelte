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
	type PeriodFilter  = 'all' | Period;
	type CountryFilter = 'both' | Country;

	// ── Moderator coefficients (HLM, Table 4 col 6) ──
	const MOD_PERIOD:  Record<Period, number>  = { '1950s': 0.253, '1960s–80s': 0, '1990s+': -0.226 };
	const MOD_COUNTRY: Record<Country, number> = { developing: 0, developed: 0.185 };

	// Approximate SEs derived from significance levels in Table 4
	const SE_BASE = 0.015;
	const SE_P: Record<PeriodFilter, number>  = { all: 0, '1950s': 0.115, '1960s–80s': 0, '1990s+': 0.103 };
	const SE_C: Record<CountryFilter, number> = { both: 0, developing: 0, developed: 0.062 };

	// ── Filter state ──
	let periodFilter:  PeriodFilter  = $state('all');
	let countryFilter: CountryFilter = $state('both');

	// ── Contextual estimate + CI ──
	let pMod   = $derived(periodFilter === 'all' ? 0 : MOD_PERIOD[periodFilter]);
	let cMod   = $derived(countryFilter === 'both' ? 0 : MOD_COUNTRY[countryFilter]);
	let rawCtx = $derived(RE_MEAN + pMod + cMod);
	let ctxSE  = $derived(Math.sqrt(SE_BASE ** 2 + SE_P[periodFilter] ** 2 + SE_C[countryFilter] ** 2));
	let ciLo   = $derived(rawCtx - 1.96 * ctxSE);
	let ciHi   = $derived(rawCtx + 1.96 * ctxSE);

	// ── Tweened values ──
	const tCtx  = tweened(RE_MEAN, { duration: 500, easing: cubicOut });
	const tCILo = tweened(RE_MEAN - 1.96 * SE_BASE, { duration: 500, easing: cubicOut });
	const tCIHi = tweened(RE_MEAN + 1.96 * SE_BASE, { duration: 500, easing: cubicOut });
	$effect(() => { tCtx.set(rawCtx); tCILo.set(ciLo); tCIHi.set(ciHi); });

	// ── SVG layout (defined early so xs() is available for $derived) ──
	const W = 800, H_SWARM = 248, H_GAUGE = 80;
	const ML = 35, MR = 35, MT = 32, MB = 46;
	const PW = W - ML - MR;
	const CY = MT + (H_SWARM - MT - MB) / 2 + 6;
	const X_MIN = -0.65, X_MAX = 0.65;
	function xs(v: number): number { return ML + ((v - X_MIN) / (X_MAX - X_MIN)) * PW; }
	const TICKS = [-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6];
	const AX_S = H_SWARM - MB + 8;
	const AX_G = H_GAUGE - 20;
	const GCY = 34; // gauge vertical centre for CI line

	// ── Derived gauge SVG values ──
	let ptX    = $derived(xs($tCtx));
	let loX    = $derived(xs($tCILo));
	let hiX    = $derived(xs($tCIHi));
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

	// ── Generate 77 significant dots with period/country attributes ──
	interface Dot { pcc: number; jy: number; period: Period; country: Country }

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
		for (let i = 0; i < g.n; i++) {
			allDots.push({
				pcc: Math.max(-0.63, Math.min(0.63, mean + 0.14 * gauss())),
				jy: (rng() - 0.5) * 82,
				period: g.period,
				country: g.country,
			});
		}
	}

	// Named studies with period/country attributes
	const named: (Dot & { label: string; above: boolean })[] = [
		{ label: 'Benoit (1978)',        pcc:  0.383, above: true,  jy: 0, period: '1950s',     country: 'developing' },
		{ label: 'Deger & Smith (1983)', pcc:  0.131, above: false, jy: 0, period: '1960s–80s', country: 'developing' },
		{ label: 'Looney (1989)',        pcc: -0.284, above: false, jy: 0, period: '1960s–80s', country: 'developing' },
		{ label: 'Yakovlev (2007)',      pcc: -0.148, above: true,  jy: 0, period: '1990s+',    country: 'developing' },
		{ label: 'Antonakis (1997)',     pcc: -0.456, above: true,  jy: 0, period: '1990s+',    country: 'developing' },
	];

	// ── Visibility ──
	function isVis(d: { period: Period; country: Country }): boolean {
		return (periodFilter === 'all' || d.period === periodFilter)
			&& (countryFilter === 'both' || d.country === countryFilter);
	}

	let visCount = $derived(allDots.filter(d => isVis(d)).length);

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

		<!-- ══ Filters (shared by both panels) ══ -->
		<div class="filters">
			<div class="filter-group">
				<span class="filter-label">Time period of data</span>
				<div class="btn-group">
					<button class="tog" class:active={periodFilter === 'all'}
						onclick={() => periodFilter = 'all'}>All</button>
					{#each (['1950s', '1960s–80s', '1990s+'] as Period[]) as p}
						<button class="tog" class:active={periodFilter === p}
							onclick={() => periodFilter = p}>{p}</button>
					{/each}
				</div>
			</div>
			<div class="filter-group">
				<span class="filter-label">Country sample</span>
				<div class="btn-group">
					<button class="tog" class:active={countryFilter === 'both'}
						onclick={() => countryFilter = 'both'}>Both</button>
					<button class="tog" class:active={countryFilter === 'developing'}
						onclick={() => countryFilter = 'developing'}>Developing</button>
					<button class="tog" class:active={countryFilter === 'developed'}
						onclick={() => countryFilter = 'developed'}>Developed</button>
				</div>
			</div>
		</div>

		<!-- ══ Dot swarm ══ -->
		<div class="chart-block">
			<p class="chart-label">
				{visCount} of 77 statistically significant estimates shown
				<span class="chart-sublabel">— vertical position is random jitter for readability; only horizontal position (PCC) carries meaning</span>
			</p>
			<svg
				viewBox="0 0 {W} {H_SWARM}"
				preserveAspectRatio="xMidYMid meet"
				class="chart-svg"
				aria-label="Dot distribution of significant PCC estimates"
			>
				<!-- Zone shading -->
				<rect x={ML} y={MT} width={xs(0) - ML} height={H_SWARM - MT - MB}
					fill="var(--region-africa)" opacity="0.05"/>
				<rect x={xs(0)} y={MT} width={W - MR - xs(0)} height={H_SWARM - MT - MB}
					fill="var(--region-americas)" opacity="0.05"/>

				<!-- Zero reference -->
				<line x1={xs(0)} x2={xs(0)} y1={MT} y2={AX_S}
					stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="5,3" opacity="0.55"/>

				<!-- Zone labels -->
				<text x={(ML + xs(0)) / 2} y={MT - 10}
					text-anchor="middle" class="zone-label neg">← Harmful to growth</text>
				<text x={(xs(0) + W - MR) / 2} y={MT - 10}
					text-anchor="middle" class="zone-label pos">Beneficial to growth →</text>

				<!-- Simulated dots (filtered via opacity) -->
				{#each allDots as d, i (i)}
					<circle
						cx={xs(d.pcc)} cy={CY + d.jy}
						r={2.8}
						fill={d.pcc < 0 ? 'var(--region-africa)' : 'var(--region-americas)'}
						opacity={isVis(d) ? 0.45 : 0.04}
						class="dot"
					/>
				{/each}

				<!-- Named study dots with labels (filtered) -->
				{#each named as s}
					{@const vis = isVis(s)}
					{@const lx = xs(s.pcc)}
					{@const ly = CY}
					{@const col = s.pcc < 0 ? 'var(--region-africa)' : 'var(--region-americas)'}
					{@const labelY = s.above ? ly - 28 : ly + 33}
					{@const lineY1 = s.above ? ly - 7  : ly + 7}
					{@const lineY2 = s.above ? ly - 20 : ly + 20}
					<circle cx={lx} cy={ly} r={5.5}
						fill={col} opacity={vis ? 0.92 : 0.06}
						stroke="var(--bg)" stroke-width="1.8"
						class="dot"/>
					<line x1={lx} x2={lx} y1={lineY1} y2={lineY2}
						stroke={col} stroke-width="1" opacity={vis ? 0.65 : 0.04}
						class="dot"/>
					<text x={lx} y={labelY}
						text-anchor="middle" class="study-label" fill={col}
						opacity={vis ? 1 : 0.06}>{s.label}</text>
				{/each}

				<!-- X-axis -->
				<line x1={ML} x2={W - MR} y1={AX_S} y2={AX_S}
					stroke="var(--border-light)" stroke-width="1"/>
				{#each TICKS as t}
					<line x1={xs(t)} x2={xs(t)} y1={AX_S - 3} y2={AX_S + 6}
						stroke="var(--text-muted)" stroke-width="1"/>
					<text x={xs(t)} y={AX_S + 18}
						text-anchor="middle" class="tick-label">{t.toFixed(1)}</text>
				{/each}
				<text x={ML + PW / 2} y={H_SWARM - 5}
					text-anchor="middle" class="axis-title">
					Partial correlation coefficient (PCC)
				</text>
			</svg>
		</div>

		<!-- ══ Meta-regression estimate with CI ══ -->
		<div class="context-block">
			<p class="chart-label">Meta-regression adjusted estimate with 95% confidence interval</p>

			<svg
				viewBox="0 0 {W} {H_GAUGE}"
				preserveAspectRatio="xMidYMid meet"
				class="chart-svg gauge-svg"
				aria-label="Forest-plot style meta-regression estimate with confidence interval"
			>
				<!-- Zone shading -->
				<rect x={ML} y={4} width={xs(0) - ML} height={H_GAUGE - 24}
					fill="var(--region-africa)" opacity="0.04"/>
				<rect x={xs(0)} y={4} width={W - MR - xs(0)} height={H_GAUGE - 24}
					fill="var(--region-americas)" opacity="0.04"/>

				<!-- Zero reference -->
				<line x1={xs(0)} x2={xs(0)} y1={4} y2={AX_G}
					stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="4,3" opacity="0.55"/>

				<!-- Axis -->
				<line x1={ML} x2={W - MR} y1={AX_G} y2={AX_G}
					stroke="var(--border-light)" stroke-width="1.5"/>
				{#each TICKS as t}
					<line x1={xs(t)} x2={xs(t)} y1={AX_G - 4} y2={AX_G + 7}
						stroke="var(--border-light)" stroke-width="1"/>
					<text x={xs(t)} y={AX_G + 18}
						text-anchor="middle" class="tick-label">{t.toFixed(1)}</text>
				{/each}

				<!-- CI whisker line -->
				<line x1={loX} x2={hiX} y1={GCY} y2={GCY}
					stroke={ptCol} stroke-width="2.5" stroke-linecap="round" class="ci-line"/>
				<!-- End caps -->
				<line x1={loX} x2={loX} y1={GCY - 7} y2={GCY + 7}
					stroke={ptCol} stroke-width="1.8" class="ci-line"/>
				<line x1={hiX} x2={hiX} y1={GCY - 7} y2={GCY + 7}
					stroke={ptCol} stroke-width="1.8" class="ci-line"/>

				<!-- Diamond at point estimate -->
				<polygon
					points="{ptX},{GCY - 10} {ptX + 8},{GCY} {ptX},{GCY + 10} {ptX - 8},{GCY}"
					fill={ptCol} class="ci-line"
				/>

				<!-- Value label -->
				<text x={ptX} y={GCY - 16}
					text-anchor="middle" class="pointer-val" fill={ptCol}>
					{$tCtx.toFixed(3)}
				</text>

				<!-- CI bounds labels -->
				<text x={loX} y={GCY - 12}
					text-anchor="middle" class="ci-bound-label" fill={ptCol}>
					{$tCILo.toFixed(2)}
				</text>
				<text x={hiX} y={GCY - 12}
					text-anchor="middle" class="ci-bound-label" fill={ptCol}>
					{$tCIHi.toFixed(2)}
				</text>
			</svg>

			<p class="interp-text" class:neg={rawCtx < -0.05} class:neutral={rawCtx >= -0.05 && rawCtx <= 0.05}>
				{@html interp(rawCtx)}
			</p>
		</div>

		<p class="methodology-note">
			Based on Alptekin &amp; Levine (2012), "Military Expenditure and Economic Growth: A Meta-Analysis,"
			<em>European Journal of Political Economy</em> 28(4), 636–650. Of 169 estimates across 32 studies,
			77 are statistically significant (26 negative, 51 positive). Only these are plotted, with positions
			simulated from group-specific distributions shifted by the HLM meta-regression moderator coefficients
			(Table&thinsp;4): period dummies (1950s: +0.253; 1990s+: −0.226) and developed-country dummy (+0.185).
			The diamond-and-whisker shows the point estimate and approximate 95% CI, computed by propagating
			the standard errors of the moderator coefficients. No publication bias detected
			(FAT: β₀ = 0.112, t = 0.43, p &gt; 0.05).
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

	/* ── Filters ── */
	.filters {
		display: flex;
		gap: 3rem;
		flex-wrap: wrap;
		margin: 2.5rem 0 0.5rem;
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

	/* ── Charts ── */
	.chart-block,
	.context-block {
		margin-top: 1.5rem;
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

	.gauge-svg {
		margin-top: 0.5rem;
	}

	/* ── Dot transitions ── */
	.dot {
		transition: opacity 0.45s ease;
	}

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
		transition: opacity 0.45s ease;
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

	:global(.ci-bound-label) {
		font-family: var(--font-sans);
		font-size: 10px;
		font-weight: 400;
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
	}
</style>
