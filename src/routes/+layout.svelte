<script lang="ts">
	import { theme } from '$lib/theme.svelte';
	import { personalities } from '$lib/personalities';
	import { ChevronDown } from '@lucide/svelte';
	import './layout.css';

	let { children } = $props();
	let infoOpen = $state(false);
	let openModeId = $state<string | null>(null);

	function togglePanel() {
		infoOpen = !infoOpen;
		if (!infoOpen) openModeId = null;
	}

	function toggleMode(id: string) {
		openModeId = openModeId === id ? null : id;
	}

	$effect(() => {
		theme.init();
	});
</script>

<div class="app-root">
	<header class="absolute top-0 left-0 z-10 flex w-full items-center justify-between px-6 py-4">
		<h1
			class="text-accent-color text-3xl font-bold tracking-[0.2em] uppercase"
			class:font-serif={theme.current === 'victorian'}
		>
			Verbosify
		</h1>

		<div class="flex items-center gap-2">
			<button
				onclick={() => theme.toggle()}
				class="border-accent-color hover:bg-accent-color hover:text-bg-color rounded-[var(--border-radius)] border-2 px-6 py-2 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300"
			>
				Mode: {theme.current === 'victorian' ? 'Victorian' : 'LCARS'}
			</button>

			<div class="relative">
				<button
					onclick={togglePanel}
					class="border-accent-color text-accent-color flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 hover:bg-white/10"
					aria-label="Output mode information"
				>
					?
				</button>

				{#if infoOpen}
					<div
						class="fixed inset-0 z-20"
						onclick={() => {
							infoOpen = false;
							openModeId = null;
						}}
					></div>
					<div
						class="absolute top-10 right-0 z-30 w-72 overflow-hidden border border-white/15 shadow-2xl"
						style="background: var(--theme-bg); border-radius: var(--theme-radius);"
					>
						{#each personalities as p, i}
							<button
								onclick={() => toggleMode(p.id)}
								class="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5
								{i < personalities.length - 1 || openModeId === p.id ? 'border-b border-white/10' : ''}"
							>
								<span class="text-xs font-bold tracking-[0.2em] uppercase" style="color: {p.color}"
									>{p.name}</span
								>
								<ChevronDown
									class="h-3.5 w-3.5 opacity-40 transition-transform duration-200 {openModeId ===
									p.id
										? 'rotate-180'
										: ''}"
								/>
							</button>
							{#if openModeId === p.id}
								<div
									class="border-b border-white/10 bg-white/3 px-4 py-3
									{i === personalities.length - 1 ? 'border-b-0' : ''}"
								>
									<p class="mb-2 text-[11px] leading-relaxed opacity-55">{p.detail}</p>
									<p class="text-[11px] italic opacity-35">{p.example}</p>
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</header>

	<main class="main-content">
		{@render children()}
	</main>
</div>
