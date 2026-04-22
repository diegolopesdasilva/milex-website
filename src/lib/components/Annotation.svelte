<script lang="ts">
	import type { HistoricalEvent } from '$lib/data/events';

	let {
		events = []
	}: {
		events?: HistoricalEvent[];
	} = $props();
</script>

<!-- Annotations removed — no dashed lines -->
