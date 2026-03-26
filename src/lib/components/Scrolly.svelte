<script lang="ts">
	import { onMount, type Snippet } from 'svelte';

	let {
		activeStep = $bindable(0),
		background,
		foreground
	}: {
		activeStep?: number;
		background: Snippet;
		foreground: Snippet;
	} = $props();

	let stepsContainer: HTMLElement;

	onMount(() => {
		const stepElements = Array.from(stepsContainer.querySelectorAll('.step'));

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const index = stepElements.indexOf(entry.target as HTMLElement);
						if (index !== -1) {
							activeStep = index;
						}
					}
				}
			},
			{
				rootMargin: '-35% 0px -35% 0px',
				threshold: 0
			}
		);

		for (const el of stepElements) {
			observer.observe(el);
		}

		return () => observer.disconnect();
	});
</script>

<section class="scrolly">
	<div class="background-wrapper">
		<div class="background-sticky">
			{@render background()}
		</div>
	</div>
	<div class="foreground-wrapper" bind:this={stepsContainer}>
		{@render foreground()}
	</div>
</section>

<style>
	.scrolly {
		position: relative;
		display: flex;
		gap: 0;
		max-width: 1400px;
		margin: 0 auto;
	}

	.background-wrapper {
		flex: 1;
		min-width: 0;
	}

	.background-sticky {
		position: sticky;
		top: 0;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.foreground-wrapper {
		flex: 0 0 380px;
		padding: 50vh 2rem 50vh 0;
		position: relative;
	}

	@media (max-width: 900px) {
		.scrolly {
			flex-direction: column;
		}

		.background-wrapper {
			order: -1;
		}

		.background-sticky {
			height: 45vh;
		}

		.foreground-wrapper {
			flex: none;
			width: 100%;
			padding: var(--space-lg) var(--space-md);
		}
	}
</style>
