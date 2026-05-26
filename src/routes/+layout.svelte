<script lang="ts">
	import { theme } from '$lib/theme.svelte';
	import './layout.css';

	let { children } = $props();

	$effect(() => {
		theme.init();
	});
</script>

<div
	class="relative min-h-screen transition-all duration-500"
	class:bg-linear-to-b={theme.current === 'victorian'}
	class:from-transparent={theme.current === 'victorian'}
	class:to-[var(--secondary-color)]={theme.current === 'victorian'}
	class:bg-black={theme.current === 'lcars'}
>
	<header class="absolute top-0 left-0 z-10 flex w-full items-center justify-between p-6">
		<h1
			class="text-accent-color text-3xl font-bold tracking-[0.2em] uppercase"
			class:font-serif={theme.current === 'victorian'}
		>
			Verbosify
		</h1>
		<button
			onclick={() => theme.toggle()}
			class="border-accent-color hover:bg-accent-color hover:text-bg-color rounded-[var(--border-radius)] border-2 px-6 py-2 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300"
		>
			Mode: {theme.current === 'victorian' ? 'Victorian' : 'LCARS'}
		</button>
	</header>

	<main class="min-h-screen px-4 pt-28 md:px-8">
		{@render children()}
	</main>
</div>
