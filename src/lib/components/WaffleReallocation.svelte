<script lang="ts">
	// 600 total squares, 12 = 2% savings
	const TOTAL_SQUARES = 600;
	const COLS = 24;
	const SAVINGS_SQUARES = 12;
	const TOTAL_MILEX_B = 2718;
	const SAVINGS_B = TOTAL_MILEX_B * 0.02; // 54.36B
	const PER_SQUARE_B = SAVINGS_B / SAVINGS_SQUARES; // ~4.53B per savings square

	const impacts = {
		health: {
			label: 'Health',
			perBillion: 200_000,
			unit: 'lives saved',
			unitSingular: 'life saved',
			description: 'Via malaria prevention, vaccines and maternal care',
			source: 'GiveWell, 2024',
			color: '#567B57'
		},
		education: {
			label: 'Education',
			perBillion: 2_190_000,
			unit: 'children schooled for a year',
			unitSingular: 'child schooled for a year',
			description: 'Primary and secondary education in low-income countries',
			source: 'World Bank Education Finance Watch, 2024',
			color: '#A9BDA1'
		},
		climate: {
			label: 'Climate Mitigation',
			perBillion: 20_000_000,
			unit: 'tons CO\u2082 abated',
			unitSingular: 'ton CO\u2082 abated',
			description: 'Cost-effective emissions reduction and renewable energy',
			source: 'IPCC AR6, 2023',
			color: '#EEC7A3'
		}
	};

	type Category = keyof typeof impacts;

	let allocations: Record<Category, number> = $state({
		health: 0,
		education: 0,
		climate: 0
	});

	// Drag state
	let dragging = $state(false);
	let dragSourceIdx = $state(-1);
	let dragOverCategory: Category | null = $state(null);
	let dragOverWaffle = $state(false);

	interface WaffleCell {
		idx: number;
		type: 'milex' | 'savings';
		savingsIdx?: number;
	}

	// Place savings squares in the FIRST row (top), rest are milex
	const waffleGrid: WaffleCell[] = [];
	let savingsCount = 0;
	for (let i = 0; i < TOTAL_SQUARES; i++) {
		if (i < SAVINGS_SQUARES) {
			waffleGrid.push({ idx: i, type: 'savings', savingsIdx: savingsCount++ });
		} else {
			waffleGrid.push({ idx: i, type: 'milex' });
		}
	}

	// Track where each savings square is allocated (null = still in waffle)
	let savingsAllocation: (Category | null)[] = $state(Array(SAVINGS_SQUARES).fill(null));

	function handleDragStart(e: DragEvent, savingsIdx: number) {
		dragging = true;
		dragSourceIdx = savingsIdx;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', String(savingsIdx));
		}
	}

	function handleDragEnd() {
		dragging = false;
		dragSourceIdx = -1;
		dragOverCategory = null;
		dragOverWaffle = false;
	}

	function handleDropOnCategory(e: DragEvent, category: Category) {
		e.preventDefault();
		dragOverCategory = null;
		const idx = parseInt(e.dataTransfer?.getData('text/plain') ?? '-1');
		if (idx < 0 || idx >= SAVINGS_SQUARES) return;

		const prev = savingsAllocation[idx];
		if (prev) {
			allocations[prev] = Math.max(0, allocations[prev] - 1);
		}
		savingsAllocation[idx] = category;
		allocations[category]++;
		dragging = false;
	}

	function handleDropOnWaffle(e: DragEvent) {
		e.preventDefault();
		dragOverWaffle = false;
		const idx = parseInt(e.dataTransfer?.getData('text/plain') ?? '-1');
		if (idx < 0 || idx >= SAVINGS_SQUARES) return;

		const prev = savingsAllocation[idx];
		if (prev) {
			allocations[prev] = Math.max(0, allocations[prev] - 1);
		}
		savingsAllocation[idx] = null;
		dragging = false;
	}

	function handleDragOverCategory(e: DragEvent, category: Category) {
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		dragOverCategory = category;
	}

	function handleDragOverWaffle(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		dragOverWaffle = true;
	}

	function handleDragLeaveCategory() { dragOverCategory = null; }
	function handleDragLeaveWaffle() { dragOverWaffle = false; }

	function resetAll() {
		savingsAllocation = Array(SAVINGS_SQUARES).fill(null);
		allocations = { health: 0, education: 0, climate: 0 };
	}

	let hasAnyAllocation = $derived(allocations.health + allocations.education + allocations.climate > 0);

	function formatNumber(n: number): string {
		if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' billion';
		if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' million';
		if (n >= 1_000) return Math.round(n / 1_000) + ' thousand';
		return n.toFixed(0);
	}

	function getCategoryImpact(category: Category): number {
		return allocations[category] * PER_SQUARE_B * impacts[category].perBillion;
	}

	function getCategoryBillions(category: Category): number {
		return allocations[category] * PER_SQUARE_B;
	}

	// Click to cycle: null -> health -> education -> climate -> null
	function handleSquareClick(savingsIdx: number) {
		const current = savingsAllocation[savingsIdx];
		const cycle: (Category | null)[] = [null, 'health', 'education', 'climate'];
		const pos = cycle.indexOf(current);
		const next = cycle[(pos + 1) % cycle.length];

		if (current) allocations[current] = Math.max(0, allocations[current] - 1);
		savingsAllocation[savingsIdx] = next;
		if (next) allocations[next]++;
	}

	// A moved (allocated) savings square becomes an empty gap
	function isMoved(cell: WaffleCell): boolean {
		if (cell.type !== 'savings') return false;
		return savingsAllocation[cell.savingsIdx ?? 0] !== null;
	}

	function getCellColor(cell: WaffleCell): string {
		if (cell.type === 'milex') return 'var(--region-africa)';
		const alloc = savingsAllocation[cell.savingsIdx ?? 0];
		if (alloc) return 'transparent'; // moved away — gap
		return 'var(--region-middle-east)';
	}
</script>

<section class="reallocation-section">
	<h2 class="section-title">What If?</h2>
	<p class="section-intro">
		Global military expenditure reached $2,718 billion in 2024. What if just 2 per cent
		— <strong>${SAVINGS_B.toFixed(0)} billion</strong> — were redirected?
		Each square below represents a fraction of global military spending.
		The <span class="highlight-swatch"></span> highlighted squares represent 2 per cent of the total.
		Drag them into the boxes on the right to explore what that money could achieve.
	</p>

	<div class="interactive-area">
		<div
			class="waffle-container"
			class:drag-target={dragging && dragOverWaffle}
			role="grid"
			ondragover={handleDragOverWaffle}
			ondragleave={handleDragLeaveWaffle}
			ondrop={handleDropOnWaffle}
		>
			<div class="waffle-grid">
				{#each waffleGrid as cell (cell.idx)}
					{@const isSavings = cell.type === 'savings'}
					{@const sIdx = cell.savingsIdx ?? 0}
					{@const moved = isSavings && isMoved(cell)}
					{@const isDragSource = isSavings && dragSourceIdx === sIdx}
					<div
						class="waffle-cell"
						class:savings={isSavings && !moved}
						class:gap={moved}
						class:drag-source={isDragSource}
						style:background-color={getCellColor(cell)}
						style:animation-delay={isSavings && !moved ? `${sIdx * 0.12}s` : undefined}
						draggable={isSavings && !moved ? 'true' : 'false'}
						ondragstart={isSavings && !moved ? (e: DragEvent) => handleDragStart(e, sIdx) : undefined}
						ondragend={isSavings ? handleDragEnd : undefined}
						onclick={isSavings && !moved ? () => handleSquareClick(sIdx) : undefined}
						role={isSavings && !moved ? 'button' : 'presentation'}
						tabindex={isSavings && !moved ? 0 : -1}
						title={isSavings && !moved
							? `$${PER_SQUARE_B.toFixed(1)}B — drag to allocate or click to cycle`
							: moved ? 'Reallocated' : ''}
					>
						{#if isSavings && !moved}
							<span class="cell-pulse"></span>
						{/if}
					</div>
				{/each}
			</div>
			<div class="waffle-footer">
				<span class="waffle-footnote">Each highlighted square = ${PER_SQUARE_B.toFixed(1)}B</span>
				{#if hasAnyAllocation}
					<button class="reset-btn" onclick={resetAll}>Reset</button>
				{/if}
			</div>
		</div>

		<div class="categories">
			{#each Object.entries(impacts) as [key, cat]}
				{@const category = key as Category}
				{@const count = allocations[category]}
				{@const impact = getCategoryImpact(category)}
				{@const billions = getCategoryBillions(category)}
				<div
					class="category-box"
					class:has-allocation={count > 0}
					class:drag-over={dragOverCategory === category}
					style:border-color={count > 0 ? cat.color : 'var(--border-light)'}
					role="button"
					tabindex={0}
					ondragover={(e: DragEvent) => handleDragOverCategory(e, category)}
					ondragleave={handleDragLeaveCategory}
					ondrop={(e: DragEvent) => handleDropOnCategory(e, category)}
				>
					<div class="cat-header">
						<span class="cat-label">{cat.label}</span>
					</div>

					{#if count > 0}
						<div class="cat-impact" style:color={cat.color}>
							<span class="impact-number">{formatNumber(impact)}</span>
							<span class="impact-unit">{impact === 1 ? cat.unitSingular : cat.unit}</span>
						</div>
						<div class="cat-dollars">${billions.toFixed(1)}B allocated ({count} square{count > 1 ? 's' : ''})</div>
						<div class="cat-allocated-squares">
							{#each Array(count) as _, i}
								<div
									class="mini-square"
									style:background-color={cat.color}
									draggable="true"
									ondragstart={(e: DragEvent) => {
										// Find which savings square this corresponds to
										const allocated = savingsAllocation
											.map((a, idx) => ({ a, idx }))
											.filter(x => x.a === category);
										if (allocated[i]) handleDragStart(e, allocated[i].idx);
									}}
									ondragend={handleDragEnd}
									role="button"
									tabindex={0}
									title="Drag back to waffle or to another category"
								></div>
							{/each}
						</div>
					{:else}
						<div class="cat-placeholder">
							<span class="drop-hint">Drop squares here</span>
						</div>
					{/if}

					<div class="cat-description">{cat.description}</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="sources-note">
		<p>
			Impact estimates based on: <em>GiveWell</em> (2024) for health interventions (~$5,000 per life saved via malaria prevention);
			<em>World Bank Education Finance Watch</em> (2024) for education (~$456 per child per year in low-income countries);
			<em>IPCC AR6</em> (2023) for climate mitigation (~$50 per ton CO&#8322; for cost-effective abatement).
			These are approximate figures intended for illustration.
		</p>
	</div>
</section>

<style>
	.reallocation-section {
		padding: var(--space-xxl) 0;
		max-width: 100%;
	}

	.section-title {
		font-family: var(--font-display);
		font-size: clamp(3rem, 6vw, 5rem);
		font-weight: 400;
		font-style: italic;
		color: var(--text);
		text-align: center;
		margin: 0 0 var(--space-lg);
	}

	.section-intro {
		font-family: var(--font-sans);
		font-size: clamp(1.15rem, 2.2vw, 1.5rem);
		font-weight: 300;
		color: var(--text);
		line-height: 1.75;
		text-align: justify;
		margin: 0 auto 4rem;
		max-width: 100%;
	}

	.section-intro strong {
		font-weight: 600;
	}

	.highlight-swatch {
		display: inline-block;
		width: 14px;
		height: 14px;
		background: var(--region-middle-east);
		border-radius: 2px;
		vertical-align: middle;
		margin: 0 2px;
	}

	.interactive-area {
		display: flex;
		gap: var(--space-xl);
		align-items: flex-start;
		justify-content: center;
		flex-wrap: wrap;
		margin: 0 auto;
	}

	/* ── Waffle Chart ── */
	.waffle-container {
		flex: 0 0 auto;
		transition: border-color 0.3s ease, background-color 0.3s ease;
	}

	.waffle-container.drag-target {
		background-color: rgba(0, 0, 0, 0.02);
	}

	.waffle-grid {
		display: grid;
		grid-template-columns: repeat(24, 1fr);
		gap: 2px;
		width: min(560px, 60vw);
		aspect-ratio: 24 / 25;
	}

	.waffle-cell {
		border-radius: 2px;
		position: relative;
		transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.4s ease, opacity 0.4s ease;
	}

	.waffle-cell.savings {
		cursor: grab;
		box-shadow: 0 0 0 1.5px rgba(0, 0, 0, 0.2);
		z-index: 1;
		animation: wiggle 2.5s ease-in-out infinite;
	}

	@keyframes wiggle {
		0%, 60%, 100% { transform: rotate(0deg) scale(1); }
		10% { transform: rotate(-3deg) scale(1.05); }
		20% { transform: rotate(3deg) scale(1.05); }
		30% { transform: rotate(-2deg) scale(1.02); }
		40% { transform: rotate(1deg) scale(1); }
	}

	.waffle-cell.savings:hover {
		transform: scale(1.4);
		z-index: 3;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
	}

	.waffle-cell.savings:active {
		cursor: grabbing;
	}

	.waffle-cell.drag-source {
		opacity: 0.3;
		transform: scale(0.9);
	}

	.waffle-cell.gap {
		background: transparent !important;
		border: 1.5px dashed var(--border-light);
		border-radius: 2px;
	}

	.cell-pulse {
		display: none;
	}

	.waffle-footer {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin-top: var(--space-sm);
	}

	.waffle-footnote {
		font-family: var(--font-sans);
		font-size: 0.85rem;
		color: var(--text-light);
	}

	.reset-btn {
		font-family: var(--font-sans);
		font-size: 0.8rem;
		font-weight: 400;
		color: var(--text-light);
		background: none;
		border: 1px solid var(--border-light);
		border-radius: 4px;
		padding: 0.25rem 0.7rem;
		cursor: pointer;
		transition: color 0.2s ease, border-color 0.2s ease;
		letter-spacing: 0.02em;
	}

	.reset-btn:hover {
		color: var(--text);
		border-color: var(--text-muted);
	}

	/* ── Category boxes ── */
	.categories {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		min-width: 300px;
		max-width: 440px;
	}

	.category-box {
		border: 2px dashed var(--border-light);
		border-radius: 10px;
		padding: var(--space-md) var(--space-lg);
		transition: border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
		cursor: default;
		position: relative;
		overflow: hidden;
	}

	.category-box.drag-over {
		border-style: solid;
		border-color: var(--text-muted) !important;
		background-color: rgba(0, 0, 0, 0.02);
		box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
	}

	.category-box.has-allocation {
		border-style: solid;
		background-color: rgba(0, 0, 0, 0.01);
	}

	.cat-header {
		margin-bottom: 0.5rem;
	}

	.cat-label {
		font-family: var(--font-display);
		font-size: 1.6rem;
		font-weight: 400;
		font-style: italic;
		color: var(--text);
	}

	.cat-impact {
		margin: 0.3rem 0;
	}

	.impact-number {
		font-family: var(--font-display);
		font-size: 2.2rem;
		font-weight: 400;
		font-style: italic;
		display: block;
		line-height: 1.1;
	}

	.impact-unit {
		font-family: var(--font-display);
		font-size: 2.2rem;
		font-weight: 400;
		font-style: italic;
		display: block;
		line-height: 1.1;
	}

	.cat-dollars {
		font-family: var(--font-sans);
		font-size: 0.85rem;
		font-weight: 400;
		color: var(--text-muted);
		margin-top: 0.3rem;
	}

	.cat-placeholder {
		padding: 0.8rem 0;
	}

	.drop-hint {
		font-family: var(--font-sans);
		font-size: 0.95rem;
		color: var(--text-light);
		font-style: italic;
	}

	.cat-description {
		font-family: var(--font-sans);
		font-size: 0.85rem;
		font-weight: 300;
		color: var(--text-light);
		margin-top: 0.4rem;
		line-height: 1.5;
	}

	.cat-allocated-squares {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-top: 0.6rem;
	}

	.mini-square {
		width: 16px;
		height: 16px;
		border-radius: 2px;
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
		cursor: grab;
		transition: transform 0.2s ease;
	}

	.mini-square:hover {
		transform: scale(1.3);
	}

	.mini-square:active {
		cursor: grabbing;
	}

	/* ── Sources ── */
	.sources-note {
		margin-top: var(--space-xl);
		padding-top: var(--space-md);
		border-top: 1px solid var(--border-light);
	}

	.sources-note p {
		font-family: var(--font-sans);
		font-size: 0.85rem;
		font-weight: 300;
		color: var(--text-light);
		line-height: 1.6;
		text-align: center;
		margin: 0;
	}

	.sources-note em {
		font-style: normal;
		font-weight: 500;
		color: var(--text-muted);
	}

	/* ── Responsive ── */
	@media (max-width: 768px) {
		.interactive-area {
			flex-direction: column;
			align-items: center;
		}

		.waffle-grid {
			width: 90vw;
		}

		.categories {
			min-width: 280px;
		}
	}
</style>
