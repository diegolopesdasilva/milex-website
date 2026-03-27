<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	// d'Agostino et al. (2019) IV estimate: Φ₁ = -2.791
	// A 1pp increase in military burden → -2.791pp impact on per-capita GDP growth
	const PHI = -2.791;
	const PHI_SE = 1.055;

	// Slider state
	let milexIncrease = $state(1.0); // pp increase in military burden

	// Chart parameters
	const baselineGrowth = 3.0; // baseline annual per-capita GDP growth (%)
	const preYears = 5;
	const postYears = 5;
	const totalYears = preYears + postYears;
	// Sub-year resolution for smoother curves
	const stepsPerYear = 4;
	const totalSteps = totalYears * stepsPerYear;
	const preSteps = preYears * stepsPerYear;

	// Tweened values for smooth animation
	const tweenedIncrease = tweened(1.0, { duration: 400, easing: cubicOut });
	$effect(() => { tweenedIncrease.set(milexIncrease); });

	// Seeded noise for natural-looking GDP fluctuation
	// Pre-generated mild business cycle noise (quarterly)
	const cycleNoise = [
		0, 0.15, 0.25, 0.10, -0.05, -0.20, -0.10, 0.05,
		0.20, 0.35, 0.40, 0.30, 0.15, 0.00, -0.15, -0.25,
		-0.10, 0.10, 0.25, 0.35, 0.20, 0.05, -0.05, 0.00,
		0.10, 0.20, 0.30, 0.25, 0.15, 0.05, -0.10, -0.20,
		-0.15, 0.00, 0.15, 0.25, 0.30, 0.20, 0.10, 0.05
	];

	// Generate GDP index path with quarterly steps and cycle noise
	function generatePathWithNoise(annualGrowth, steps, noiseOffset = 0) {
		const quarterlyGrowth = annualGrowth / stepsPerYear;
		const pts = [100];
		for (let i = 1; i <= steps; i++) {
			const noise = cycleNoise[(i + noiseOffset) % cycleNoise.length] * 0.3;
			const effectiveGrowth = quarterlyGrowth + noise / stepsPerYear;
			pts.push(pts[i - 1] * (1 + effectiveGrowth / 100));
		}
		return pts;
	}

	// Reactive computations
	let impactedGrowth = $derived(baselineGrowth + PHI * $tweenedIncrease);
	let lowerGrowth = $derived(baselineGrowth + (PHI - 1.96 * PHI_SE) * $tweenedIncrease);
	let upperGrowth = $derived(baselineGrowth + (PHI + 1.96 * PHI_SE) * $tweenedIncrease);

	let baselinePath = $derived(generatePathWithNoise(baselineGrowth, totalSteps));
	let impactedPath = $derived(() => {
		const pre = generatePathWithNoise(baselineGrowth, preSteps);
		const baseAtTreatment = pre[preSteps];
		const post = generatePathWithNoise(impactedGrowth, postYears * stepsPerYear, preSteps);
		return [
			...pre,
			...post.slice(1).map(v => baseAtTreatment * (v / 100))
		];
	});
	let lowerPathData = $derived(() => {
		const pre = generatePathWithNoise(baselineGrowth, preSteps);
		const baseAtTreatment = pre[preSteps];
		const post = generatePathWithNoise(lowerGrowth, postYears * stepsPerYear, preSteps + 5);
		return [
			...pre,
			...post.slice(1).map(v => baseAtTreatment * (v / 100))
		];
	});
	let upperPathData = $derived(() => {
		const pre = generatePathWithNoise(baselineGrowth, preSteps);
		const baseAtTreatment = pre[preSteps];
		const post = generatePathWithNoise(upperGrowth, postYears * stepsPerYear, preSteps + 10);
		return [
			...pre,
			...post.slice(1).map(v => baseAtTreatment * (v / 100))
		];
	});

	// SVG dimensions
	const width = 800;
	const height = 420;
	const margin = { top: 30, right: 120, bottom: 55, left: 70 };
	const plotW = width - margin.left - margin.right;
	const plotH = height - margin.top - margin.bottom;

	// Scales
	function xScale(step) {
		return margin.left + (step / totalSteps) * plotW;
	}

	let allPts = $derived([...baselinePath, ...impactedPath(), ...lowerPathData()]);
	let yMin = $derived(Math.min(...allPts) * 0.97);
	let yMax = $derived(Math.max(...baselinePath) * 1.03);

	function yScale(val) {
		return margin.top + plotH - ((val - yMin) / (yMax - yMin)) * plotH;
	}

	// Smooth SVG path using cardinal spline approximation
	function toSvgPath(pts) {
		if (pts.length < 2) return '';
		let d = `M${xScale(0).toFixed(1)},${yScale(pts[0]).toFixed(1)}`;
		for (let i = 1; i < pts.length; i++) {
			d += ` L${xScale(i).toFixed(1)},${yScale(pts[i]).toFixed(1)}`;
		}
		return d;
	}

	// Confidence band polygon
	let bandPath = $derived(() => {
		const upper = upperPathData();
		const lower = lowerPathData();
		const fwd = upper.map((v, i) => `${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`);
		const bwd = [...lower].reverse().map((v, i) => {
			const idx = lower.length - 1 - i;
			return `${xScale(idx).toFixed(1)},${yScale(v).toFixed(1)}`;
		});
		return `M${fwd.join(' L')} L${bwd.join(' L')} Z`;
	});

	// Growth gap at end
	let endBaseline = $derived(baselinePath[totalSteps]);
	let endImpacted = $derived(impactedPath()[totalSteps]);
	let growthGap = $derived((endBaseline - endImpacted).toFixed(1));
	let pctGap = $derived(((1 - endImpacted / endBaseline) * 100).toFixed(1));

	// Format
	function fmt(n) { return n.toFixed(1); }
</script>

<section class="growth-section">
	<div class="growth-content">
		<h2 class="section-title">The Cost of the Arms Buildup</h2>
		<p class="section-intro">
			What does rising military expenditure mean for economic growth? Research by
			d'Agostino, Dunne & Pieroni (2019) found that increases in military burden
			significantly reduce per-capita GDP growth. Using an instrumental variable
			approach on 109 non-high-income countries (1998–2012), they estimated that
			each percentage point increase in military spending as a share of GDP reduces
			annual per-capita growth by approximately 2.8 percentage points.
		</p>
		<p class="section-intro">
			Use the slider below to explore how different increases in military burden
			affect a hypothetical economy's growth trajectory.
		</p>

		<div class="interactive-area">
			<!-- Slider -->
			<div class="slider-container">
				<div class="slider-label-row">
					<span class="slider-label">Increase in military burden</span>
					<span class="slider-value">+{fmt(milexIncrease)} pp of GDP</span>
				</div>
				<input
					type="range"
					min="0"
					max="3"
					step="0.1"
					bind:value={milexIncrease}
					class="milex-slider"
				/>
				<div class="slider-ticks">
					<span>0</span>
					<span>+1 pp</span>
					<span>+2 pp</span>
					<span>+3 pp</span>
				</div>
			</div>

			<!-- Chart -->
			<div class="chart-container">
				<svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid meet">
					<!-- Grid lines -->
					{#each [0, 1, 2, 3, 4] as i}
						{@const val = yMin + (i / 4) * (yMax - yMin)}
						<line
							x1={margin.left} x2={width - margin.right}
							y1={yScale(val)} y2={yScale(val)}
							stroke="var(--border-light)" stroke-width="0.5"
						/>
						<text
							x={margin.left - 10} y={yScale(val) + 5}
							text-anchor="end"
							class="axis-label"
						>{val.toFixed(0)}</text>
					{/each}

					<!-- Treatment zone background -->
					<rect
						x={xScale(preSteps)}
						y={margin.top}
						width={xScale(totalSteps) - xScale(preSteps)}
						height={plotH}
						fill="var(--region-middle-east)"
						opacity="0.06"
					/>

					<!-- Treatment line -->
					<line
						x1={xScale(preSteps)} x2={xScale(preSteps)}
						y1={margin.top} y2={margin.top + plotH}
						stroke="var(--region-middle-east)"
						stroke-width="1.5"
						stroke-dasharray="6,4"
					/>
					<text
						x={xScale(preSteps) + 8} y={margin.top + 16}
						class="treatment-label"
					>Military burden increases</text>

					<!-- Confidence band (only post-treatment) -->
					{#if milexIncrease > 0}
						<path
							d={bandPath()}
							fill="var(--region-middle-east)"
							opacity="0.10"
						/>
					{/if}

					<!-- Baseline path (full) -->
					<path
						d={toSvgPath(baselinePath)}
						fill="none"
						stroke="var(--region-americas)"
						stroke-width="2.5"
						stroke-dasharray={milexIncrease > 0 ? "8,4" : "none"}
					/>

					<!-- Impacted path -->
					{#if milexIncrease > 0}
						<path
							d={toSvgPath(impactedPath())}
							fill="none"
							stroke="var(--region-africa)"
							stroke-width="2.5"
						/>
					{/if}

					<!-- End-point labels -->
					<text
						x={xScale(totalSteps) + 8}
						y={yScale(baselinePath[totalSteps]) + 5}
						class="endpoint-label baseline-label"
					>Baseline ({fmt(baselineGrowth)}%/yr)</text>

					{#if milexIncrease > 0}
						<text
							x={xScale(totalSteps) + 8}
							y={yScale(endImpacted) + 5}
							class="endpoint-label impact-label"
						>+{fmt(milexIncrease)}pp ({fmt(impactedGrowth)}%/yr)</text>
					{/if}

					<!-- Gap annotation -->
					{#if milexIncrease > 0}
						<line
							x1={xScale(totalSteps) - 2}
							x2={xScale(totalSteps) - 2}
							y1={yScale(endBaseline)}
							y2={yScale(endImpacted)}
							stroke="var(--text-muted)"
							stroke-width="1"
							stroke-dasharray="3,2"
						/>
					{/if}

					<!-- X-axis labels -->
					{#each Array.from({ length: totalYears + 1 }, (_, i) => i) as year}
						{@const label = year - preYears}
						<text
							x={xScale(year * stepsPerYear)} y={margin.top + plotH + 24}
							text-anchor="middle"
							class="axis-label"
							class:treatment-year={year === preYears}
						>t{label >= 0 ? '+' : ''}{label}</text>
					{/each}

					<!-- Y-axis title -->
					<text
						x={18} y={margin.top + plotH / 2}
						transform="rotate(-90, 18, {margin.top + plotH / 2})"
						text-anchor="middle"
						class="axis-title"
					>GDP per capita index (t−5 = 100)</text>

					<!-- X-axis title -->
					<text
						x={margin.left + plotW / 2} y={height - 8}
						text-anchor="middle"
						class="axis-title"
					>Years relative to increase in military burden</text>
				</svg>
			</div>

			<!-- Impact summary cards -->
			<div class="impact-cards">
				<div class="impact-card">
					<div class="card-value" class:negative={milexIncrease > 0}>
						{milexIncrease > 0 ? fmt(impactedGrowth) : fmt(baselineGrowth)}%
					</div>
					<div class="card-label">Annual per-capita growth after increase</div>
				</div>
				<div class="impact-card">
					<div class="card-value" class:negative={milexIncrease > 0}>
						{milexIncrease > 0 ? '−' + growthGap : '0'}
					</div>
					<div class="card-label">GDP per capita gap after 5 years (index points)</div>
				</div>
				<div class="impact-card">
					<div class="card-value" class:negative={milexIncrease > 0}>
						{milexIncrease > 0 ? '−' + pctGap + '%' : '0%'}
					</div>
					<div class="card-label">Cumulative output loss after 5 years</div>
				</div>
			</div>
		</div>

		<!-- Methodology note -->
		<p class="methodology-note">
			Based on IV estimates from d'Agostino, Dunne & Pieroni (2019),
			"Military Expenditure, Endogeneity and Economic Growth,"
			<em>Defence and Peace Economics</em> 29(4). The coefficient Φ₁ = −2.791
			(s.e. = 1.055) represents the causal effect of military burden on per-capita
			GDP growth, estimated using turmoil as an instrumental variable for military
			spending across 109 non-high-income countries (1998–2012). The shaded band
			shows the 95% confidence interval. Results are illustrative — actual effects
			vary by country context, institutional quality and the nature of spending.
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

	.interactive-area {
		margin-top: 3rem;
	}

	/* ── Slider ── */
	.slider-container {
		max-width: 700px;
		margin: 0 auto 2.5rem;
	}

	.slider-label-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 0.75rem;
	}

	.slider-label {
		font-family: var(--font-sans);
		font-size: 1.1rem;
		font-weight: 500;
		color: var(--text);
	}

	.slider-value {
		font-family: var(--font-display);
		font-size: 1.6rem;
		font-weight: 400;
		color: var(--region-africa);
	}

	.milex-slider {
		width: 100%;
		-webkit-appearance: none;
		appearance: none;
		height: 4px;
		background: var(--border-light);
		border-radius: 2px;
		outline: none;
		cursor: pointer;
	}

	.milex-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: var(--region-africa);
		cursor: pointer;
		border: 3px solid var(--bg);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
	}

	.milex-slider::-moz-range-thumb {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: var(--region-africa);
		cursor: pointer;
		border: 3px solid var(--bg);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
	}

	.slider-ticks {
		display: flex;
		justify-content: space-between;
		margin-top: 0.5rem;
		font-family: var(--font-sans);
		font-size: 0.9rem;
		color: var(--text-light);
	}

	/* ── Chart ── */
	.chart-container {
		width: 100%;
		margin: 0 auto;
		padding: 1rem 0;
	}

	.chart-container svg {
		width: 100%;
		height: auto;
	}

	.axis-label {
		font-family: var(--font-sans);
		font-size: 14px;
		fill: var(--text-muted);
	}

	.axis-label.treatment-year {
		fill: var(--region-africa);
		font-weight: 600;
	}

	.axis-title {
		font-family: var(--font-sans);
		font-size: 13px;
		fill: var(--text-muted);
	}

	.treatment-label {
		font-family: var(--font-sans);
		font-size: 13px;
		fill: var(--region-africa);
		font-weight: 500;
	}

	.endpoint-label {
		font-family: var(--font-sans);
		font-size: 13px;
		font-weight: 500;
	}

	.baseline-label {
		fill: var(--region-americas);
	}

	.impact-label {
		fill: var(--region-africa);
	}

	/* ── Impact cards ── */
	.impact-cards {
		display: flex;
		gap: 2rem;
		justify-content: center;
		margin-top: 2.5rem;
		flex-wrap: wrap;
	}

	.impact-card {
		text-align: center;
		flex: 0 1 220px;
		padding: 1.5rem 1rem;
	}

	.card-value {
		font-family: var(--font-display);
		font-size: 2.5rem;
		font-weight: 400;
		color: var(--region-americas);
		margin-bottom: 0.4rem;
		transition: color 0.3s ease;
	}

	.card-value.negative {
		color: var(--region-africa);
	}

	.card-label {
		font-family: var(--font-sans);
		font-size: 0.95rem;
		font-weight: 300;
		color: var(--text-muted);
		line-height: 1.5;
	}

	/* ── Methodology note ── */
	.methodology-note {
		font-family: var(--font-sans);
		font-size: clamp(0.9rem, 1.5vw, 1.05rem);
		font-weight: 300;
		line-height: 1.8;
		color: var(--text-light);
		margin-top: 3rem;
		text-align: justify;
		border-top: 1px solid var(--border-light);
		padding-top: 1.5rem;
	}

	/* ── Responsive ── */
	@media (max-width: 768px) {
		.growth-section {
			padding: 4rem 1rem 6rem;
		}

		.section-title {
			font-size: 2rem;
		}

		.impact-cards {
			flex-direction: column;
			align-items: center;
		}
	}
</style>
