<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	// ── Alptekin & Levine (2012) ──
	// "Military Expenditure and Economic Growth: A Meta-Analysis"
	// European Journal of Political Economy 28(4), 636–650
	//
	// 32 studies · 169 estimates
	// RE pooled mean PCC = 0.066  [95% CI: 0.037, 0.095]
	// FE pooled mean PCC = 0.056
	// Distribution: 40% negative, 60% positive
	// No publication bias: FAT β₀ = 0.112 (t = 0.43, p > 0.05)
	// Genuine effect confirmed: PET β₁ = 0.099 (t = 3.48, p < 0.01, HLM)
	// Heterogeneity: Q(168) = 593.1, p < 0.001  → very high between-study variance

	const RE_MEAN = 0.066;
	const RE_CI_LO = 0.037;
	const RE_CI_HI = 0.095;
	const STUDY_SD = 0.25; // estimated from spread of named study-level PCCs
	const N_DOTS = 169;

	// Named study-level average PCCs from Table 1
	// above = true → label placed above the dot
	const named = [
		{ label: 'Benoit (1978)',        pcc:  0.383, above: true  },
		{ label: 'Deger & Smith (1983)', pcc:  0.131, above: false },
		{ label: 'Looney (1989)',        pcc: -0.284, above: false },
		{ label: 'Yakovlev (2007)',      pcc: -0.148, above: true  },
		{ label: 'Antonakis (1997)',     pcc: -0.456, above: true  },
	];

	// ── Moderator coefficients from HLM meta-regression, Table 4 (specific model) ──
	// Baseline: 1960s–80s data, developing countries → RE mean ≈ 0.066
	type Period  = '1950s' | '1960s–80s' | '1990s+';
	type Country = 'developing' | 'developed';

	const MOD_PERIOD: Record<Period, number> = {
		'1950s':    0.253,
		'1960s–80s': 0,
		'1990s+':  -0.226
	};
	const MOD_COUNTRY: Record<Country, number> = {
		developing: 0,
		developed:  0.185
	};

	let period:  Period  = $state('1960s–80s');
	let country: Country = $state('developing');

	let rawCtx = $derived(RE_MEAN + MOD_PERIOD[period] + MOD_COUNTRY[country]);

	const tweenedCtx = tweened(RE_MEAN, { duration: 500, easing: cubicOut });
	$effect(() => { tweenedCtx.set(rawCtx); });

	// ── Seeded RNG → reproducible dot positions ──
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
		const u = Math.max(rng(), 1e-10);
		const v = rng();
		return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
	}

	// 169 simulated estimates: N(0.066, 0.25), clamped to [-0.63, 0.63]
	const dots = Array.from({ length: N_DOTS }, () => ({
		pcc: Math.max(-0.63, Math.min(0.63, RE_MEAN + STUDY_SD * gauss())),
		jy:  (rng() - 0.5) * 82   // vertical jitter
	}));

	// ── SVG dimensions ──
	const W = 800;
	const H_SWARM = 248;
	const H_GAUGE = 92;
	const ML = 35, MR = 35, MT = 32, MB = 46;
	const PW = W - ML - MR;
	const CY  = MT + (H_SWARM - MT - MB) / 2 + 6;   // dot-cloud centre Y

	const X_MIN = -0.65, X_MAX = 0.65;
	function xs(v: number): number {
		return ML + ((v - X_MIN) / (X_MAX - X_MIN)) * PW;
	}

	const TICKS = [-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6];
	const AX_S  = H_SWARM - MB + 8;   // x-axis y of swarm
	const AX_G  = H_GAUGE - 30;       // x-axis y of gauge

	// ── Gauge pointer (derived so they're valid in template) ──
	let pointerX   = $derived(xs($tweenedCtx));
	let pointerCol = $derived($tweenedCtx < 0 ? 'var(--region-africa)' : 'var(--region-americas)');

	// ── Interpretation text ──
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
			but the results are highly heterogeneous. <strong>40&thinsp;%</strong> of estimates are
			negative; <strong>60&thinsp;%</strong> are positive. Where you look, and when, matters
			enormously.
		</p>

		<!-- ══ Dot swarm ══ -->
		<div class="chart-block">
			<p class="chart-label">
				169 effect estimates across 32 studies
				<span class="chart-sublabel">— selected named studies shown with outlines</span>
			</p>
			<svg
				viewBox="0 0 {W} {H_SWARM}"
				preserveAspectRatio="xMidYMid meet"
				class="chart-svg"
				aria-label="Dot distribution of 169 PCC estimates"
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

				<!-- Simulated dots -->
				{#each dots as d}
					<circle
						cx={xs(d.pcc)} cy={CY + d.jy}
						r={2.8}
						fill={d.pcc < 0 ? 'var(--region-africa)' : 'var(--region-americas)'}
						opacity={0.35}
					/>
				{/each}

				<!-- Pooled RE mean + CI band -->
				<rect
					x={xs(RE_CI_LO)} y={CY - 15}
					width={xs(RE_CI_HI) - xs(RE_CI_LO)} height={30}
					fill="var(--text)" opacity="0.09" rx="2"
				/>
				<line x1={xs(RE_MEAN)} x2={xs(RE_MEAN)}
					y1={CY - 26} y2={CY + 26}
					stroke="var(--text)" stroke-width="2.5" stroke-linecap="round"/>
				<text x={xs(RE_MEAN)} y={CY - 30}
					text-anchor="middle" class="mean-label">pooled mean</text>

				<!-- Named study dots with labels -->
				{#each named as s}
					{@const lx = xs(s.pcc)}
					{@const ly = CY}
					{@const col = s.pcc < 0 ? 'var(--region-africa)' : 'var(--region-americas)'}
					{@const labelY = s.above ? ly - 28 : ly + 33}
					{@const lineY1 = s.above ? ly - 7  : ly + 7}
					{@const lineY2 = s.above ? ly - 20 : ly + 20}
					<circle cx={lx} cy={ly} r={5.5}
						fill={col} opacity={0.92}
						stroke="var(--bg)" stroke-width="1.8"/>
					<line x1={lx} x2={lx} y1={lineY1} y2={lineY2}
						stroke={col} stroke-width="1" opacity="0.65"/>
					<text x={lx} y={labelY}
						text-anchor="middle" class="study-label" fill={col}>{s.label}</text>
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

		<!-- ══ Interactive context ══ -->
		<div class="context-block">
			<p class="chart-label">How does context shift the estimated effect?</p>
			<p class="context-sub">
				These sliders use HLM meta-regression coefficients from Table&thinsp;4 of the paper
				to show how the pooled estimate shifts with study characteristics.
			</p>

			<div class="filters">
				<div class="filter-group">
					<span class="filter-label">Time period of data</span>
					<div class="btn-group">
						{#each (['1950s', '1960s–80s', '1990s+'] as Period[]) as p}
							<button class="tog" class:active={period === p}
								onclick={() => period = p}>{p}</button>
						{/each}
					</div>
				</div>
				<div class="filter-group">
					<span class="filter-label">Country sample</span>
					<div class="btn-group">
						<button class="tog" class:active={country === 'developing'}
							onclick={() => country = 'developing'}>Developing</button>
						<button class="tog" class:active={country === 'developed'}
							onclick={() => country = 'developed'}>Developed</button>
					</div>
				</div>
			</div>

			<!-- Gauge on same PCC axis -->
			<svg
				viewBox="0 0 {W} {H_GAUGE}"
				preserveAspectRatio="xMidYMid meet"
				class="chart-svg gauge-svg"
				aria-label="Animated pointer showing contextual meta-analytic estimate"
			>
				<!-- Zone shading -->
				<rect x={ML} y={8} width={xs(0) - ML} height={H_GAUGE - 38}
					fill="var(--region-africa)" opacity="0.05"/>
				<rect x={xs(0)} y={8} width={W - MR - xs(0)} height={H_GAUGE - 38}
					fill="var(--region-americas)" opacity="0.05"/>

				<!-- Axis -->
				<line x1={ML} x2={W - MR} y1={AX_G} y2={AX_G}
					stroke="var(--border-light)" stroke-width="1.5"/>
				<line x1={xs(0)} x2={xs(0)} y1={8} y2={AX_G}
					stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="4,3" opacity="0.55"/>
				{#each TICKS as t}
					<line x1={xs(t)} x2={xs(t)} y1={AX_G - 4} y2={AX_G + 7}
						stroke="var(--border-light)" stroke-width="1"/>
					<text x={xs(t)} y={AX_G + 20}
						text-anchor="middle" class="tick-label">{t.toFixed(1)}</text>
				{/each}

				<!-- Animated pointer (compute in script via $derived) -->
				<line x1={pointerX} x2={pointerX} y1={28} y2={AX_G - 2}
					stroke={pointerCol} stroke-width="3" stroke-linecap="round"/>
				<polygon points="{pointerX},{28} {pointerX - 9},{44} {pointerX + 9},{44}" fill={pointerCol}/>
				<text x={pointerX} y={18} text-anchor="middle" class="pointer-val" fill={pointerCol}>
					{$tweenedCtx.toFixed(3)}
				</text>
			</svg>

			<p class="interp-text" class:neg={rawCtx < -0.05} class:neutral={rawCtx >= -0.05 && rawCtx <= 0.05}>
				{@html interp(rawCtx)}
			</p>
		</div>

		<p class="methodology-note">
			Based on Alptekin &amp; Levine (2012), "Military Expenditure and Economic Growth: A Meta-Analysis,"
			<em>European Journal of Political Economy</em> 28(4), 636–650. The dot distribution simulates the reported
			pooled PCC (RE = 0.066, 95%&thinsp;CI [0.037, 0.095]) and between-study standard deviation (≈ 0.25)
			using a seeded random number generator; named-study dots use actual study-level average PCCs from Table&thinsp;1.
			The contextual pointer uses HLM meta-regression coefficients from Table&thinsp;4: period dummies
			(1950s: +0.253; 1990s+: −0.226) and developed-country dummy (+0.185), relative to the 1960s–80s
			developing-country baseline. No publication bias detected (FAT: β₀ = 0.112, t = 0.43, p &gt; 0.05).
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
		margin-top: 3rem;
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

	.context-sub {
		font-family: var(--font-sans);
		font-size: 0.92rem;
		font-weight: 300;
		color: var(--text-light);
		line-height: 1.6;
		margin: 0 0 1.5rem;
	}

	.chart-svg {
		width: 100%;
		height: auto;
		display: block;
	}

	.gauge-svg {
		margin-top: 1.2rem;
	}

	/* SVG text classes */
	:global(.zone-label) {
		font-family: var(--font-sans);
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.03em;
	}
	:global(.zone-label.neg) { fill: var(--region-africa); }
	:global(.zone-label.pos) { fill: var(--region-americas); }

	:global(.mean-label) {
		font-family: var(--font-sans);
		font-size: 11px;
		font-weight: 500;
		fill: var(--text);
		letter-spacing: 0.02em;
	}

	:global(.study-label) {
		font-family: var(--font-sans);
		font-size: 10.5px;
		font-weight: 400;
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
