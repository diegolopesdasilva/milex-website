<script lang="ts">
	// ── Alptekin & Levine (2012), Table 1 ──
	// Real study-level average PCCs
	// Country classification: 'developing' includes LDC-focused and mixed/cross-country samples;
	// 'developed' = studies focused on OECD, NATO, US, or industrial economies.
	type CountryType = 'developing' | 'developed';

	interface Study {
		label: string;
		year: number;
		n: number;
		pcc: number;
		country: CountryType;
	}

	const studies: Study[] = [
		{ label: 'Benoit (1978)',                       year: 1978, n:  3, pcc:  0.383, country: 'developing' },
		{ label: 'Deger & Smith (1983)',                year: 1983, n:  5, pcc:  0.131, country: 'developing' },
		{ label: 'Lim (1983)',                          year: 1983, n:  9, pcc:  0.078, country: 'developing' },
		{ label: 'Deger & Sen (1983)',                  year: 1983, n:  1, pcc:  0.146, country: 'developing' },
		{ label: 'Faini et al. (1984)',                 year: 1984, n:  1, pcc: -0.120, country: 'developing' },
		{ label: 'Cappelen et al. (1984)',              year: 1984, n:  8, pcc:  0.079, country: 'developed' },
		{ label: 'Landau (1986)',                       year: 1986, n: 12, pcc:  0.060, country: 'developing' },
		{ label: 'Biswas & Ram (1986)',                 year: 1986, n:  6, pcc:  0.198, country: 'developing' },
		{ label: 'Deger (1986)',                        year: 1986, n:  5, pcc:  0.330, country: 'developing' },
		{ label: 'Lebovic & Ishaq (1987)',              year: 1987, n:  4, pcc: -0.129, country: 'developing' },
		{ label: 'Chan (1988)',                         year: 1988, n:  3, pcc:  0.089, country: 'developing' },
		{ label: 'Grobar & Porter (1989)',              year: 1989, n:  5, pcc:  0.128, country: 'developing' },
		{ label: 'Gyimah-Brempong (1989)',              year: 1989, n:  2, pcc:  0.038, country: 'developing' },
		{ label: 'Looney (1989)',                       year: 1989, n:  2, pcc: -0.284, country: 'developing' },
		{ label: 'Landau (1993)',                       year: 1993, n: 29, pcc:  0.173, country: 'developing' },
		{ label: 'Dunne & Mohammed (1995)',             year: 1995, n:  3, pcc:  0.006, country: 'developing' },
		{ label: 'Lipow & Antinori (1995)',             year: 1995, n:  2, pcc:  0.192, country: 'developed' },
		{ label: 'Blomberg (1996)',                     year: 1996, n:  1, pcc: -0.042, country: 'developing' },
		{ label: 'Knight et al. (1996)',                year: 1996, n:  4, pcc: -0.100, country: 'developing' },
		{ label: 'Landau (1996)',                       year: 1996, n: 11, pcc:  0.285, country: 'developing' },
		{ label: 'Brumm (1997)',                        year: 1997, n:  2, pcc:  0.316, country: 'developed' },
		{ label: 'Antonakis (1997)',                    year: 1997, n:  2, pcc: -0.456, country: 'developing' },
		{ label: 'Heo & DeRouen (1998)',                year: 1998, n:  5, pcc: -0.101, country: 'developed' },
		{ label: 'DeRouen (2000)',                      year: 2000, n:  1, pcc:  0.168, country: 'developed' },
		{ label: 'Stroup & Heckelman (2001)',           year: 2001, n:  5, pcc:  0.202, country: 'developing' },
		{ label: 'Galvin (2003)',                       year: 2003, n:  9, pcc: -0.156, country: 'developing' },
		{ label: 'Aizenman & Glick (2006)',             year: 2006, n:  7, pcc: -0.205, country: 'developing' },
		{ label: 'Bose et al. (2007)',                  year: 2007, n:  4, pcc:  0.278, country: 'developing' },
		{ label: 'Kalaitzidakis & Tzouvelekas (2007)', year: 2007, n:  3, pcc:  0.095, country: 'developed' },
		{ label: 'Kollias et al. (2007)',               year: 2007, n:  2, pcc:  0.156, country: 'developed' },
		{ label: 'Yakovlev (2007)',                     year: 2007, n: 10, pcc: -0.148, country: 'developing' },
		{ label: 'Looney & McNab (2008)',               year: 2008, n:  3, pcc: -0.129, country: 'developing' },
	];

	const devingStudies = studies.filter(s => s.country === 'developing');
	const devedStudies  = studies.filter(s => s.country === 'developed');

	const COL_DEVELOPING = '#DD9D7C';
	const COL_DEVELOPED  = '#567B57';

	// ── SVG layout ──
	const W = 890, H_SCATTER = 380;
	const ML = 60, MR = 80, MT = 20, MB = 55;
	const PW = W - ML - MR;
	const PH = H_SCATTER - MT - MB;

	const Y_MIN = -0.5, Y_MAX = 0.45;
	const X_YEAR_MIN = 1976, X_YEAR_MAX = 2010;
	function xYear(yr: number): number { return ML + ((yr - X_YEAR_MIN) / (X_YEAR_MAX - X_YEAR_MIN)) * PW; }
	function yPcc(pcc: number): number { return MT + PH - ((pcc - Y_MIN) / (Y_MAX - Y_MIN)) * PH; }

	const CI_X = W - MR + 25;

	// ── OLS trend line with CI band ──
	function computeTrend(pts: { x: number; y: number }[]) {
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

	function makeBand(trend: ReturnType<typeof computeTrend>): string {
		const years: number[] = [];
		for (let yr = X_YEAR_MIN; yr <= X_YEAR_MAX; yr++) years.push(yr);
		const upper = years.map(yr => `${xYear(yr).toFixed(1)},${yPcc(trend.predict(yr) + trend.ciHalf(yr)).toFixed(1)}`);
		const lower = [...years].reverse().map(yr => `${xYear(yr).toFixed(1)},${yPcc(trend.predict(yr) - trend.ciHalf(yr)).toFixed(1)}`);
		return `M${upper.join(' L')} L${lower.join(' L')} Z`;
	}

	const trendDeving = computeTrend(devingStudies.map(s => ({ x: s.year, y: s.pcc })));
	const trendDeved  = computeTrend(devedStudies.map(s => ({ x: s.year, y: s.pcc })));
	const bandDeving = makeBand(trendDeving);
	const bandDeved  = makeBand(trendDeved);

	// ── Mean + CI ──
	function meanAndSE(dots: Study[]) {
		const n = dots.length;
		if (n === 0) return { mean: 0, se: 0 };
		const m = dots.reduce((s, d) => s + d.pcc, 0) / n;
		if (n === 1) return { mean: m, se: 0 };
		const v = dots.reduce((s, d) => s + (d.pcc - m) ** 2, 0) / (n - 1);
		return { mean: m, se: Math.sqrt(v / n) };
	}

	// ── Selection state per panel ──
	let selDeving: { x0: number; y0: number; x1: number; y1: number } | null = $state(null);
	let selDeved:  { x0: number; y0: number; x1: number; y1: number } | null = $state(null);
	let draggingPanel: 'developing' | 'developed' | null = $state(null);

	function getSvgPoint(e: MouseEvent, svg: SVGSVGElement) {
		const pt = svg.createSVGPoint();
		pt.x = e.clientX; pt.y = e.clientY;
		return pt.matrixTransform(svg.getScreenCTM()!.inverse());
	}

	function onDown(e: MouseEvent, panel: 'developing' | 'developed') {
		const svg = e.currentTarget as SVGSVGElement;
		const pt = getSvgPoint(e, svg);
		if (pt.x < ML || pt.x > W - MR || pt.y < MT || pt.y > MT + PH) return;
		draggingPanel = panel;
		const s = { x0: pt.x, y0: pt.y, x1: pt.x, y1: pt.y };
		if (panel === 'developing') selDeving = s; else selDeved = s;
	}

	function onMove(e: MouseEvent) {
		if (!draggingPanel) return;
		const svg = e.currentTarget as SVGSVGElement;
		const pt = getSvgPoint(e, svg);
		const cx = Math.max(ML, Math.min(W - MR, pt.x));
		const cy = Math.max(MT, Math.min(MT + PH, pt.y));
		if (draggingPanel === 'developing' && selDeving) selDeving = { ...selDeving, x1: cx, y1: cy };
		else if (draggingPanel === 'developed' && selDeved) selDeved = { ...selDeved, x1: cx, y1: cy };
	}

	function onUp() { draggingPanel = null; }

	function inBox(s: Study, box: { x0: number; y0: number; x1: number; y1: number } | null): boolean {
		if (!box) return false;
		const sx = xYear(s.year), sy = yPcc(s.pcc);
		return sx >= Math.min(box.x0, box.x1) && sx <= Math.max(box.x0, box.x1)
			&& sy >= Math.min(box.y0, box.y1) && sy <= Math.max(box.y0, box.y1);
	}

	function isActive(box: { x0: number; y0: number; x1: number; y1: number } | null): boolean {
		return box !== null && Math.abs(box.x1 - box.x0) > 5 && Math.abs(box.y1 - box.y0) > 5;
	}

	function boxRect(b: { x0: number; y0: number; x1: number; y1: number }) {
		return { x: Math.min(b.x0, b.x1), y: Math.min(b.y0, b.y1), width: Math.abs(b.x1 - b.x0), height: Math.abs(b.y1 - b.y0) };
	}

	let selDevingActive = $derived(isActive(selDeving));
	let selDevedActive  = $derived(isActive(selDeved));
	let selDevingStudies = $derived(selDevingActive ? devingStudies.filter(s => inBox(s, selDeving)) : devingStudies);
	let selDevedStudies  = $derived(selDevedActive  ? devedStudies.filter(s => inBox(s, selDeved))   : devedStudies);
	let statsDeving = $derived(meanAndSE(selDevingStudies));
	let statsDeved  = $derived(meanAndSE(selDevedStudies));

	function clearSel(panel: 'developing' | 'developed') {
		if (panel === 'developing') selDeving = null; else selDeved = null;
	}

	const Y_TICKS = [-0.4, -0.2, 0, 0.2, 0.4];
	const X_YEAR_TICKS = [1978, 1983, 1988, 1993, 1998, 2003, 2008];

	const panels = [
		{ key: 'developed' as const,  label: 'Developed countries',  dots: devedStudies,  col: COL_DEVELOPED,  trend: trendDeved,  band: bandDeved },
		{ key: 'developing' as const, label: 'Developing countries', dots: devingStudies, col: COL_DEVELOPING, trend: trendDeving, band: bandDeving },
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
			The two figures below plot the average effect size from each of the 32 studies in Alptekin &amp;
			Levine's (2012) meta-analysis. The trend is quite clear, as the strength and signal of the
			effect weaken and change over time.
		</p>
		<p class="section-intro">
			Remarks like those of Starmer seem to be greatly influenced by earlier results — decades old —
			that have mostly considered industrial economies.
		</p>

		<div class="chart-block">
			<p class="chart-label">
				Average effect size (PCC) by publication year
				<span class="chart-sublabel">— drag to select studies and compute their mean</span>
			</p>
			<div class="scatter-stack">
				{#each panels as panel}
					{@const sel = panel.key === 'developing' ? selDeving : selDeved}
					{@const active = panel.key === 'developing' ? selDevingActive : selDevedActive}
					{@const stats = panel.key === 'developing' ? statsDeving : statsDeved}
					{@const selStudies = panel.key === 'developing' ? selDevingStudies : selDevedStudies}
					<div class="scatter-panel">
						<p class="panel-label" style:color={panel.col}>
							{panel.label}
							<span class="panel-count">({panel.dots.length} studies)</span>
						</p>

						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<svg
							viewBox="0 0 {W} {H_SCATTER}"
							preserveAspectRatio="xMidYMid meet"
							class="chart-svg scatter-svg"
							onmousedown={(e) => onDown(e, panel.key)}
							onmousemove={onMove}
							onmouseup={onUp}
							onmouseleave={onUp}
						>
							<!-- Zone shading -->
							<rect x={ML} y={MT} width={PW} height={yPcc(0) - MT}
								fill="var(--region-americas)" opacity="0.03"/>
							<rect x={ML} y={yPcc(0)} width={PW} height={MT + PH - yPcc(0)}
								fill="var(--region-africa)" opacity="0.03"/>

							<!-- Zero line -->
							<line x1={ML} x2={W - MR} y1={yPcc(0)} y2={yPcc(0)}
								stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="5,3" opacity="0.4"/>

							<!-- Grid -->
							{#each Y_TICKS as t}
								{#if t !== 0}
									<line x1={ML} x2={W - MR} y1={yPcc(t)} y2={yPcc(t)}
										stroke="var(--border-light)" stroke-width="0.5" opacity="0.5"/>
								{/if}
							{/each}
							{#each X_YEAR_TICKS as yr}
								<line x1={xYear(yr)} x2={xYear(yr)} y1={MT} y2={MT + PH}
									stroke="var(--border-light)" stroke-width="0.5" opacity="0.3"/>
							{/each}

							<!-- Trend CI band -->
							<path d={panel.band} fill={panel.col} opacity="0.12"/>

							<!-- Trend line -->
							<line
								x1={xYear(X_YEAR_MIN)} y1={yPcc(panel.trend.predict(X_YEAR_MIN))}
								x2={xYear(X_YEAR_MAX)} y2={yPcc(panel.trend.predict(X_YEAR_MAX))}
								stroke={panel.col} stroke-width="2.5" opacity="0.7"
							/>

							<!-- Dots (uniform size) -->
							{#each panel.dots as s}
								<circle
									cx={xYear(s.year)} cy={yPcc(s.pcc)}
									r={5}
									fill={panel.col}
									opacity={active ? (inBox(s, sel) ? 0.8 : 0.12) : 0.65}
									stroke="var(--bg)" stroke-width="1"
								/>
							{/each}

							<!-- Selection box -->
							{#if sel && active}
								<rect
									x={boxRect(sel).x} y={boxRect(sel).y}
									width={boxRect(sel).width} height={boxRect(sel).height}
									fill={panel.col} fill-opacity="0.06"
									stroke={panel.col} stroke-width="1.5" stroke-dasharray="4,3" rx="3"
								/>
							{/if}

							<!-- Y-axis -->
							{#each Y_TICKS as t}
								<line x1={ML - 4} x2={ML} y1={yPcc(t)} y2={yPcc(t)}
									stroke="var(--text-muted)" stroke-width="1"/>
								<text x={ML - 8} y={yPcc(t) + 4}
									text-anchor="end" class="tick-label">{t.toFixed(1)}</text>
							{/each}
							<text x={14} y={MT + PH / 2}
								transform="rotate(-90, 14, {MT + PH / 2})"
								text-anchor="middle" class="axis-title">Average effect size (PCC)</text>

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
								text-anchor="middle" class="axis-title">Publication year</text>

							<text x={W - MR - 4} y={yPcc(0) - 6}
								text-anchor="end" class="zero-label">PCC = 0</text>

							<!-- Floating mean + CI -->
							<line x1={CI_X} x2={CI_X}
								y1={yPcc(stats.mean + 1.96 * stats.se)}
								y2={yPcc(stats.mean - 1.96 * stats.se)}
								stroke={panel.col} stroke-width="2" stroke-linecap="round" opacity="0.7" class="ci-anim"/>
							<line x1={CI_X - 5} x2={CI_X + 5}
								y1={yPcc(stats.mean + 1.96 * stats.se)}
								y2={yPcc(stats.mean + 1.96 * stats.se)}
								stroke={panel.col} stroke-width="1.5" opacity="0.7" class="ci-anim"/>
							<line x1={CI_X - 5} x2={CI_X + 5}
								y1={yPcc(stats.mean - 1.96 * stats.se)}
								y2={yPcc(stats.mean - 1.96 * stats.se)}
								stroke={panel.col} stroke-width="1.5" opacity="0.7" class="ci-anim"/>
							<circle cx={CI_X} cy={yPcc(stats.mean)} r={5}
								fill={panel.col} opacity="0.9" class="ci-anim"/>
							<text x={CI_X + 12} y={yPcc(stats.mean) + 4}
								text-anchor="start" class="ci-val" fill={panel.col}>
								{stats.mean.toFixed(3)}
							</text>
							<text x={CI_X} y={MT + PH + 22}
								text-anchor="middle" class="ci-axis-label">mean</text>
						</svg>

						<p class="sel-info">
							{#if active}
								{selStudies.length} of {panel.dots.length} studies selected
								<button class="clear-btn" onclick={() => clearSel(panel.key)}>Clear</button>
							{:else}
								{panel.dots.length} studies — drag to select
							{/if}
						</p>
					</div>
				{/each}
			</div>
		</div>

		<p class="methodology-note">
			Data from Table 1 of Alptekin &amp; Levine (2012), "Military Expenditure and Economic Growth:
			A Meta-Analysis," <em>European Journal of Political Economy</em> 28(4), 636–650. Each dot
			is the average partial correlation coefficient (PCC) within a single study. Country
			classification follows the paper's moderator coding: "developed" denotes studies focused on
			OECD, NATO, or industrial economies; "developing" includes LDC-focused and mixed samples.
			The trend line is a simple OLS fit with a 95% confidence band.
		</p>
	</div>
</section>

<style>
	.growth-section { padding: 2rem 0 8rem; }
	.growth-content { width: 100%; }

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
	.section-intro :global(.source-link:hover) { color: var(--text); }

	.chart-block { margin-top: 2rem; }

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

	.chart-svg { width: 100%; height: auto; display: block; }
	.scatter-svg { cursor: crosshair; user-select: none; }

	.scatter-stack { display: flex; flex-direction: column; gap: 3rem; }
	.scatter-panel { width: 100%; }

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
	.clear-btn:hover { color: var(--text); border-color: var(--text-muted); }

	:global(.ci-anim) { transition: all 0.4s ease; }
	:global(.ci-val) { font-family: var(--font-display); font-size: 13px; font-style: italic; font-weight: 400; transition: all 0.4s ease; }
	:global(.ci-axis-label) { font-family: var(--font-sans); font-size: 10px; fill: var(--text-light); }
	:global(.zero-label) { font-family: var(--font-sans); font-size: 10px; font-weight: 400; fill: var(--text-light); }
	:global(.tick-label) { font-family: var(--font-sans); font-size: 12px; fill: var(--text-muted); }
	:global(.axis-title) { font-family: var(--font-sans); font-size: 12px; fill: var(--text-muted); }

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
	.methodology-note em { font-style: italic; }

	@media (max-width: 768px) {
		.growth-section { padding: 2rem 0 6rem; }
		.section-title { font-size: 2rem; }
	}
</style>
