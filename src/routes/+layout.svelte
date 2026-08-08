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
	<header class="app-header">
		<div class="app-header__inner">
			<h1
				class="app-brand"
				class:font-serif={theme.current === 'victorian'}
				class:font-mono={theme.current === 'lcars'}
			>
				Verbosify
			</h1>

			<div class="header-actions">
				<button
					onclick={() => theme.toggle()}
					class="btn btn-ghost"
					style="border-radius:999px;padding:0.4rem 0.85rem;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase"
				>
					Mode: {theme.current === 'victorian' ? 'Victorian' : 'LCARS'}
				</button>

				<div class="relative">
					<button
						onclick={togglePanel}
						class="btn btn-icon"
						aria-label="About output modes"
						aria-expanded={infoOpen}
						style="border:1px solid var(--panel-border);color:var(--text-muted);width:2.1rem;height:2.1rem;font-size:0.78rem;font-weight:700;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;background:transparent;cursor:pointer"
					>
						?
					</button>

					{#if infoOpen}
						<div
							class="info-panel__scrim"
							onclick={() => {
								infoOpen = false;
								openModeId = null;
							}}
							role="presentation"
						></div>
						<div class="info-panel">
							{#each personalities as p}
								<button
									class="info-persona"
									onclick={() => toggleMode(p.id)}
								>
									<span style="color:{p.color}">{p.name}</span>
									<ChevronDown
										class="h-3.5 w-3.5 opacity-40 transition-transform duration-200 {openModeId ===
										p.id
											? 'rotate-180'
											: ''}"
									/>
								</button>
								{#if openModeId === p.id}
									<div class="info-persona__detail">
										<p>
											{p.detail}
											<em>{p.example}</em>
										</p>
									</div>
								{/if}
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</header>

	<main class="main-content">
		{@render children()}
	</main>
</div>