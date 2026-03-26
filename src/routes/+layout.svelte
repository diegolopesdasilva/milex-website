<script lang="ts">
	import '$lib/styles/variables.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Global Military Expenditures: A History — SIPRI</title>
	<meta name="description" content="A scroll-driven visualization of global military expenditure from 1992 to 2024, by world region." />
</svelte:head>

{@render children()}

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(body) {
		font-family: var(--font-sans);
		background: var(--bg);
		color: var(--text);
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	:global(html) {
		scroll-behavior: smooth;
	}
</style>
