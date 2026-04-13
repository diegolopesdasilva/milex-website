<script lang="ts">
	// ── Alptekin & Levine (2012), Table 1 ──
	// Real study-level average PCCs from the paper
	interface Study {
		label: string;
		year: number;       // publication year
		n: number;          // number of estimates within the study
		pcc: number;        // average effect size (partial correlation)
	}

	const studies: Study[] = [
		{ label: 'Benoit (1978)',                      year: 1978, n:  3, pcc:  0.383 },
		{ label: 'Deger & Smith (1983)',               year: 1983, n:  5, pcc:  0.131 },
		{ label: 'Lim (1983)',                         year: 1983, n:  9, pcc:  0.078 },
		{ label: 'Deger & Sen (1983)',                 year: 1983, n:  1, pcc:  0.146 },
		{ label: 'Faini et al. (1984)',                year: 1984, n:  1, pcc: -0.120 },
		{ label: 'Cappelen et al. (1984)',             year: 1984, n:  8, pcc:  0.079 },
		{ label: 'Landau (1986)',                      year: 1986, n: 12, pcc:  0.060 },
		{ label: 'Biswas & Ram (1986)',                year: 1986, n:  6, pcc:  0.198 },
		{ label: 'Deger (1986)',                       year: 1986, n:  5, pcc:  0.330 },
		{ label: 'Lebovic & Ishaq (1987)',             year: 1987, n:  4, pcc: -0.129 },
		{ label: 'Chan (1988)',                        year: 1988, n:  3, pcc:  0.089 },
		{ label: 'Grobar & Porter (1989)',             year: 1989, n:  5, pcc:  0.128 },
		{ label: 'Gyimah-Brempong (1989)',             year: 1989, n:  2, pcc:  0.038 },
		{ label: 'Looney (1989)',                      year: 1989, n:  2, pcc: -0.284 },
		{ label: 'Landau (1993)',                      year: 1993, n: 29, pcc:  0.173 },
		{ label: 'Dunne & Mohammed (1995)',            year: 1995, n:  3, pcc:  0.006 },
		{ label: 'Lipow & Antinori (1995)',            year: 1995, n:  2, pcc:  0.192 },
		{ label: 'Blomberg (1996)',                    year: 1996, n:  1, pcc: -0.042 },
		{ label: 'Knight et al. (1996)',               year: 1996, n:  4, pcc: -0.100 },
		{ label: 'Landau (1996)',                      year: 1996, n: 11, pcc:  0.285 },
		{ label: 'Brumm (1997)',                       year: 1997, n:  2, pcc:  0.316 },
		{ label: 'Antonakis (1997)',                   year: 1997, n:  2, pcc: -0.456 },
		{ label: 'Heo & DeRouen (1998)',               year: 1998, n:  5, pcc: -0.101 },
		{ label: 'DeRouen (2000)',                     year: 2000, n:  1, pcc:  0.168 },
		{ label: 'Stroup & Heckelman (2001)',          year: 2001, n:  5, pcc:  0.202 },
		{ label: 'Galvin (2003)',                      year: 2003, n:  9, pcc: -0.156 },
		{ label: 'Aizenman & Glick (2006)',            year: 2006, n:  7, pcc: -0.205 },
		{ label: 'Bose et al. (2007)',                 year: 2007, n:  4, pcc:  0.278 },
		{ label: 'Kalaitzidakis & Tzouvelekas (2007)', year: 2007, n:  3, pcc:  0.095 },
		{ label: 'Kollias et al. (2007)',              year: 2007, n:  2, pcc:  0.156 },
		{ label: 'Yakovlev (2007)',                    year: 2007, n: 10, pcc: -0.148 },
		{ label: 'Looney & McNab (2008)',              year: 2008, n:  3, pcc: -0.129 },
	];

	// Pooled estimates
	const FE_MEAN = 0.056;
	const RE_MEAN = 0.066;

	// ── SVG layout ──
	const W = 890, H_SCATTER = 400;
	const ML = 60, MR = 80, MT = 20, MB = 55;
	const PW = W - ML - MR;
	const PH = H_SCATTER - MT - MB;

	const Y_MIN = -0.5, Y_MAX = 0.45;
	const X_YEAR_MIN = 1976, X_YEAR_MAX = 2010;
	function xYear(yr: number): number { return ML + ((yr - X_YEAR_MIN) / (X_YEAR_MAX - X_YEAR_MIN)) * PW; }
	function yPcc(pcc: number): number { return MT + PH - ((pcc - Y_MIN) / (Y_MAX - Y_MIN)) * PH; }

	// Floating CI dot position
	const CI_X = W - MR + 25;

	// ── OLS trend line ──
	function computeTrend(pts: { x: number; y: number }[]): { slope: number; intercept: number; predict: (x: number) => number; ciHalf: (x: number) => number } {
		const n = pts.length;
		let sx = 0, sy = 0, sxx = 0, sxy = 0;
		for (const p of pts) { sx += p.x; sy += p.y; sxx += p.x * p.x; sxy += p.x * p.y; }
		const xbar = sx / n;
		const denom = n * sxx - sx * sx;
		const slope = denom !== 0 ? (n * sxy - sx * sy) / denom : 0;
		const intercept = (sy - slope * sx) / n;
		let ssr = 0;
		for (const p of pts) { const r = p.y - (slope * p.x + intercept); ssr += r * r; }
		const s2 = n > 2 ? ssr / (n - 2) : 0;
		const sxx_c = sxx - n * xbar * xbar;
		return {
			slope, intercept,
			predict: (x: number) => slope * x + intercept,
			ciHalf: (x: number) => { const h = 1/n + (x - xbar)**2 / sxx_c; return 1.96 * Math.sqrt(s2 * h); }
		};
	}

	const trend = computeTrend(studies.map(s => ({ x: s.year, y: s.pcc })));

	// CI band path
	function ciBandPath(): string {
		const years: number[] = [];
		for (let yr = X_YEAR_MIN; yr <= X_YEAR_MAX; yr += 1) years.push(yr);
		const upper = years.map(yr => `${xYear(yr).toFixed(1)},${yPcc(trend.predict(yr) + trend.ciHalf(yr)).toFixed(1)}`);
		const lower = [...years].reverse().map(yr => `${xYear(yr).toFixed(1)},${yPcc(trend.predict(yr) - trend.ciHalf(yr)).toFixed(1)}`);
		return `M${upper.join(' L')} L${lower.join(' L')} Z`;
	}
	const ciBand = ciBandPath();

	// ── Mean + CI of all studies ──
	const allMean = studies.reduce((s, d) => s + d.pcc, 0) / studies.length;
	const allVar = studies.reduce((s, d) => s + (d.pcc - allMean) ** 2, 0) / (studies.length - 1);
	const allSE = Math.sqrt(allVar / studies.length);

	// ── Selection state ──
	let sel: { x0: number; y0: number; x1: number; y1: number } | null = $state(null);
	let dragging = $state(false);

	function getSvgPoint(e: MouseEvent, svg: SVGSVGElement): { x: number; y: number } {
		const pt = svg.createSVGPoint();
		pt.x = e.clientX; pt.y = e.clientY;
		const svgPt = pt.matrixTransform(svg.getScreenCTM()!.inverse());
		return { x: svgPt.x, y: svgPt.y };
	}

	function onMouseDown(e: MouseEvent) {
		const svg = e.currentTarget as SVGSVGElement;
		const pt = getSvgPoint(e, svg);
		if (pt.x < ML || pt.x > W - MR || pt.y < MT || pt.y > MT + PH) return;
		dragging = true;
		sel = { x0: pt.x, y0: pt.y, x1: pt.x, y1: pt.y };
	}

	function onMouseMove(e: MouseEvent) {
		if (!dragging || !sel) return;
		const svg = e.currentTarget as SVGSVGElement;
		const pt = getSvgPoint(e, svg);
		sel = { ...sel,
			x1: Math.max(ML, Math.min(W - MR, pt.x)),
			y1: Math.max(MT, Math.min(MT + PH, pt.y))
		};
	}

	function onMouseUp() { dragging = false; }

	function inSel(s: Study): boolean {
		if (!sel || !selActive) return false;
		const sx = xYear(s.year), sy = yPcc(s.pcc);
		const xMin = Math.min(sel.x0, sel.x1), xMax = Math.max(sel.x0, sel.x1);
		const yMin = Math.min(sel.y0, sel.y1), yMax = Math.max(sel.y0, sel.y1);
		return sx >= xMin && sx <= xMax && sy >= yMin && sy <= yMax;
	}

	let selActive = $derived(sel !== null && Math.abs(sel.x1 - sel.x0) > 5 && Math.abs(sel.y1 - sel.y0) > 5);
	let selectedStudies = $derived(selActive ? studies.filter(s => inSel(s)) : studies);
	let selMean = $derived(selectedStudies.length > 0 ? selectedStudies.reduce((a, s) => a + s.pcc, 0) / selectedStudies.length : 0);
	let selSE = $derived(selectedStudies.length > 1
		? Math.sqrt(selectedStudies.reduce((a, s) => a + (s.pcc - selMean) ** 2, 0) / (selectedStudies.length - 1) / selectedStudies.length)
		: 0);

	function clearSel() { sel = null; }

	function selRect(s: { x0: number; y0: number; x1: number; y1: number }) {
		return { x: Math.min(s.x0, s.x1), y: Math.min(s.y0, s.y1), width: Math.abs(s.x1 - s.x0), height: Math.abs(s.y1 - s.y0) };
	}

	const Y_TICKS = [-0.4, -0.2, 0, 0.2, 0.4];
	const X_YEAR_TICKS = [1978, 1983, 1988, 1993, 1998, 2003, 2008];

	// Dot radius scaled by number of estimates (sqrt scale)
	const MAX_N = Math.max(...studies.map(s => s.n));
	function dotR(n: number): number { return 3 + 5 * Math.sqrt(n / MAX_N); }
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
			The figure below plots the average effect size from each of the 32 studies in Alptekin &amp;
			Levine's (2012) meta-analysis. The trend is quite clear, as the strength and signal of the
			effect weaken and change over time.
		</p>
		<p class="section-intro">
			Remarks like those of Starmer seem to be greatly influenced by earlier results — decades old —
			that have mostly considered industrial economies.
		</p>

		<div class="chart-block">
			<p class="chart-label">
				Average effect size (PCC) by publication year, 32 studies
				<span class="chart-sublabel">— dot size reflects the number of estimates within each study; drag to select</span>
			</p>

			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<svg
				viewBox="0 0 {W} {H_SCATTER}"
				preserveAspectRatio="xMidYMid meet"
				class="chart-svg scatter-svg"
				onmousedown={onMouseDown}
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
				<path d={ciBand} fill="var(--text)" opacity="0.06"/>

				<!-- Trend line -->
				<line
					x1={xYear(X_YEAR_MIN)} y1={yPcc(trend.predict(X_YEAR_MIN))}
					x2={xYear(X_YEAR_MAX)} y2={yPcc(trend.predict(X_YEAR_MAX))}
					stroke="var(--text)" stroke-width="2" opacity="0.35"
				/>

				<!-- Study dots -->
				{#each studies as s}
					<circle
						cx={xYear(s.year)} cy={yPcc(s.pcc)}
						r={dotR(s.n)}
						fill={s.pcc >= 0 ? 'var(--region-americas)' : 'var(--region-africa)'}
						opacity={selActive ? (inSel(s) ? 0.8 : 0.12) : 0.65}
						stroke="var(--bg)" stroke-width="1"
					/>
				{/each}

				<!-- Selection rectangle -->
				{#if sel && selActive}
					<rect
						x={selRect(sel).x} y={selRect(sel).y}
						width={selRect(sel).width} height={selRect(sel).height}
						fill="var(--text)" fill-opacity="0.05"
						stroke="var(--text-muted)" stroke-width="1.5" stroke-dasharray="4,3"
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
					Average effect size (PCC)
				</text>

				<!-- X-axis -->
				<line x1={ML} x2={W - MR} y1={MT + PH} y2={MT + PH}
					stroke="var(--border-light)" stroke-width="1"/>
				{#each X_YEAR_TICKS as yr}
					<line x1={xYear(yr)} x2={xYear(yr)} y1={MT + PH} y2={MT + PH + 6}
						stroke="var(--text-muted)" stroke-width="1"/>
					<text x={xYear(yr)} y={MT + PH + 22}
						text-anchor="middle" class="tick-label">{yr}</text>
				{/each}
				<text x={ML + PW / 2} y={H_SCATTER - 5}
					text-anchor="middle" class="axis-title">
					Publication year
				</text>

				<!-- Zero label -->
				<text x={W - MR - 4} y={yPcc(0) - 6}
					text-anchor="end" class="zero-label">PCC = 0</text>

				<!-- Floating mean dot + CI whisker -->
				<line x1={CI_X} x2={CI_X}
					y1={yPcc(selMean + 1.96 * selSE)}
					y2={yPcc(selMean - 1.96 * selSE)}
					stroke="var(--text)" stroke-width="2" stroke-linecap="round" opacity="0.6" class="ci-anim"/>
				<line x1={CI_X - 5} x2={CI_X + 5}
					y1={yPcc(selMean + 1.96 * selSE)}
					y2={yPcc(selMean + 1.96 * selSE)}
					stroke="var(--text)" stroke-width="1.5" opacity="0.6" class="ci-anim"/>
				<line x1={CI_X - 5} x2={CI_X + 5}
					y1={yPcc(selMean - 1.96 * selSE)}
					y2={yPcc(selMean - 1.96 * selSE)}
					stroke="var(--text)" stroke-width="1.5" opacity="0.6" class="ci-anim"/>
				<circle cx={CI_X} cy={yPcc(selMean)} r={5}
					fill="var(--text)" opacity="0.7" class="ci-anim"/>
				<text x={CI_X + 12} y={yPcc(selMean) + 4}
					text-anchor="start" class="ci-val" fill="var(--text)">
					{selMean.toFixed(3)}
				</text>
				<text x={CI_X} y={MT + PH + 22}
					text-anchor="middle" class="ci-axis-label">mean</text>
			</svg>

			<p class="sel-info">
				{#if selActive}
					{selectedStudies.length} of 32 studies selected
					<button class="clear-btn" onclick={clearSel}>Clear</button>
				{:else}
					32 studies — drag to select
				{/if}
			</p>
		</div>

		<p class="methodology-note">
			Data from Table 1 of Alptekin &amp; Levine (2012), "Military Expenditure and Economic Growth:
			A Meta-Analysis," <em>European Journal of Political Economy</em> 28(4), 636–650. Each dot
			represents the average partial correlation coefficient (PCC) within a single study. Dot size
			is proportional to the number of estimates within the study (range: 1–29). The trend line is
			a simple OLS fit with a 95% confidence band. The floating dot on the right shows the mean PCC
			of the selected (or all) studies with 95% CI.
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
		.growth-section { padding: 2rem 0 6rem; }
		.section-title { font-size: 2rem; }
	}
</style>
