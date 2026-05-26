<script lang="ts">
	import { theme } from '$lib/theme.svelte';
	import { fade, slide } from 'svelte/transition';
	import { Sparkles, MessageSquare, History, Wand2 } from '@lucide/svelte';

	let input = $state('');
	let output = $state('');
	let isVerbosing = $state(false);
	let verbosity = $state(50);
	let smartPoeticMode = $state(true);

	const personalities = [
		{
			id: 'bard',
			name: 'The Bard',
			description: 'Shakespearian eloquence',
			icon: Sparkles,
			color: '#cc99ff'
		},
		{
			id: 'orator',
			name: 'The Orator',
			description: 'Tharoorian grandiosity',
			icon: MessageSquare,
			color: '#5566ff'
		},
		{
			id: 'explorer',
			name: 'The Explorer',
			description: 'Victorian expeditionary',
			icon: History,
			color: '#cc4444'
		},
		{
			id: 'bot',
			name: 'The Automaton',
			description: 'Technical sesquipedalian',
			icon: Wand2,
			color: '#ffcc00'
		}
	];

	let selectedPersonality = $state(personalities[0]);

	// Radial Dial — full 360° cyclical
	let dialContainer: HTMLDivElement | undefined = $state();
	let isDraggingDial = false;

	// Map angle in degrees (0 = right, going clockwise) to 0-100
	// Full 360° maps to 0-100 cyclically
	function handleDialUpdate(e: PointerEvent) {
		if (!dialContainer) return;
		const rect = dialContainer.getBoundingClientRect();
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;
		// atan2 returns -π..π; shift so 12-o'clock (top) = 0
		const rad = Math.atan2(e.clientX - cx, -(e.clientY - cy));
		let deg = (rad * 180) / Math.PI; // -180..180, 0 = top
		if (deg < 0) deg += 360; // normalize to 0..360
		verbosity = Math.round((deg / 360) * 100) % 101; // 0-100 cyclically
	}

	function onPointerDown(e: PointerEvent) {
		isDraggingDial = true;
		handleDialUpdate(e);
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onPointerMove(e: PointerEvent) {
		if (isDraggingDial) handleDialUpdate(e);
	}

	function onPointerUp() {
		isDraggingDial = false;
	}

	async function handleVerbosify() {
		if (!input) return;
		isVerbosing = true;

		// Mock logic for now
		setTimeout(() => {
			output = `[${selectedPersonality.name} verbosity ${verbosity}%]: The input "${input}" has been meticulously expanded into a more sophisticated and elaborate linguistic structure.`;
			isVerbosing = false;
		}, 1500);
	}
</script>

{#if theme.current === 'lcars'}
	<div class="lcars-frame" in:fade style="--current-accent: {selectedPersonality.color}">
		<div class="lcars-header-pill" style="background-color: var(--current-accent)">
			VERBOSIFY // PERSONNEL ACCESS
		</div>

		<div class="lcars-sidebar">
			{#each personalities as p, i}
				<button
					onclick={() => (selectedPersonality = p)}
					class="lcars-pill transition-all"
					class:lcars-pill-active={selectedPersonality.id === p.id}
					data-number={(i + 1).toString().padStart(2, '0')}
					style="background-color: {selectedPersonality.id === p.id
						? 'var(--lcars-gold)'
						: p.color}; filter: {selectedPersonality.id === p.id ? 'none' : 'brightness(0.7)'}"
				>
					{p.name}
				</button>
			{/each}

			<div class="mt-auto space-y-4 pb-8">
				<div class="text-lcars-blue mb-2 text-center text-xs font-bold tracking-[0.2em]">
					VERBOSITY LEVEL
				</div>
				<div
					bind:this={dialContainer}
					class="lcars-dial-container"
					onpointerdown={onPointerDown}
					onpointermove={onPointerMove}
					onpointerup={onPointerUp}
				>
					<div class="lcars-dial-bg" style="border-color: {selectedPersonality.color}99"></div>
					<div
						class="lcars-dial-indicator"
						style="transform: rotate({(verbosity / 100) * 270 -
							45}deg); background-color: {selectedPersonality.color}"
					></div>
					<div class="lcars-dial-value" style="color: {selectedPersonality.color}">
						{verbosity}%
					</div>
				</div>

				<button
					onclick={() => (smartPoeticMode = !smartPoeticMode)}
					class="lcars-pill w-full transition-all"
					style="background-color: {smartPoeticMode ? 'var(--lcars-violet)' : 'var(--lcars-red)'}"
				>
					POETIC: {smartPoeticMode ? 'ON' : 'OFF'}
				</button>
			</div>
		</div>

		<div class="lcars-content-area" style="border-color: var(--current-accent)">
			<div class="space-y-8">
				<div class="relative">
					<textarea
						bind:value={input}
						placeholder="INPUT SOURCE DATA..."
						class="lcars-input-pill h-72 resize-none border-2 text-xl"
						style="border-color: var(--current-accent)"
					></textarea>
					<button
						onclick={handleVerbosify}
						disabled={isVerbosing}
						class="lcars-button absolute right-6 bottom-6 text-black transition-all hover:brightness-110 active:scale-95"
						style="background-color: var(--current-accent)"
					>
						{isVerbosing ? 'PROCESSING...' : 'TRANSMUTE'}
					</button>
				</div>

				{#if output || isVerbosing}
					<div
						in:slide
						class="rounded-r-3xl border-l-8 bg-white/5 py-6 pl-8"
						style="border-color: var(--current-accent)"
					>
						{#if isVerbosing}
							<div
								class="flex animate-pulse items-center gap-4 text-2xl font-bold"
								style="color: var(--lcars-red)"
							>
								<div class="bg-lcars-red h-6 w-6 rounded-full"></div>
								SYNTHESIZING...
							</div>
						{:else}
							<p
								class="font-mono text-2xl leading-relaxed"
								style="color: {selectedPersonality.color}"
							>
								{output}
							</p>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<div class="lcars-footer-pill" style="background-color: var(--current-accent)"></div>
	</div>
{:else}
	<div class="mx-auto grid max-w-6xl grid-cols-1 gap-8 pb-12 lg:grid-cols-4" in:fade>
		<!-- Victorian Sidebar -->
		<aside class="order-2 space-y-8 lg:order-1 lg:col-span-1">
			<div class="space-y-4">
				<h2 class="text-accent-color text-xs font-bold tracking-[0.3em] uppercase opacity-70">
					Select Personality
				</h2>
				<div class="grid grid-cols-1 gap-3">
					{#each personalities as p}
						<button
							onclick={() => (selectedPersonality = p)}
							class="group relative overflow-hidden border-2 p-4 text-left transition-all duration-300 {selectedPersonality.id ===
							p.id
								? 'border-accent-color'
								: 'border-white/10'}"
							style="border-radius: var(--theme-radius);"
						>
							<div class="relative z-10 flex items-center gap-3">
								<p.icon
									class="h-5 w-5 {selectedPersonality.id === p.id
										? 'text-accent-color'
										: 'opacity-50'}"
								/>
								<div>
									<h3 class="text-sm font-bold tracking-wide uppercase">{p.name}</h3>
									<p class="text-[10px] tracking-tighter uppercase opacity-60">{p.description}</p>
								</div>
							</div>
							{#if selectedPersonality.id === p.id}
								<div class="bg-accent-color/5 absolute inset-0" in:fade></div>
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<div
				class="space-y-6 border-2 border-white/10 bg-white/5 p-6"
				style="border-radius: var(--theme-radius);"
			>
				<h2 class="text-accent-color text-xs font-bold tracking-[0.3em] uppercase opacity-70">
					Verbosity Dial
				</h2>
				<div class="relative pt-2">
					<input
						type="range"
						min="0"
						max="100"
						bind:value={verbosity}
						class="accent-accent-color h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10"
					/>
					<div
						class="mt-4 flex justify-between text-[10px] font-bold tracking-widest uppercase opacity-60"
					>
						<span>Succinct</span>
						<span class="text-accent-color">{verbosity}%</span>
						<span>Verbose</span>
					</div>
				</div>
			</div>

			<div
				class="space-y-4 border-2 border-white/10 bg-white/5 p-6"
				style="border-radius: var(--theme-radius);"
			>
				<div class="flex items-center justify-between">
					<h2 class="text-accent-color text-xs font-bold tracking-[0.3em] uppercase opacity-70">
						Smart Poetic
					</h2>
					<button
						onclick={() => (smartPoeticMode = !smartPoeticMode)}
						class="relative h-6 w-12 rounded-full transition-colors duration-300 {smartPoeticMode
							? 'bg-accent-color'
							: 'bg-white/10'}"
					>
						<div
							class="bg-bg-color absolute top-1 left-1 h-4 w-4 rounded-full transition-transform duration-300 {smartPoeticMode
								? 'translate-x-6'
								: 'translate-x-0'}"
						></div>
					</button>
				</div>
				<p class="text-[10px] leading-relaxed tracking-wider uppercase opacity-40">
					Auto-detects structure to preserve cadence and rhymes.
				</p>
			</div>
		</aside>

		<!-- Victorian Main Area -->
		<div class="order-1 space-y-6 lg:order-2 lg:col-span-3">
			<div class="group relative">
				<textarea
					bind:value={input}
					placeholder="Enter text to verbosify..."
					class="focus:border-accent-color/50 h-64 w-full resize-none border-2 border-white/10 bg-white/5 p-6 text-lg transition-all duration-500 placeholder:opacity-30"
					style="border-radius: var(--theme-radius); font-family: var(--font-mono);"
				></textarea>
				<button
					onclick={handleVerbosify}
					disabled={isVerbosing}
					class="bg-accent-color text-bg-color absolute right-4 bottom-4 px-8 py-3 text-sm font-bold tracking-[0.3em] uppercase transition-all hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50"
					style="border-radius: var(--theme-radius);"
				>
					{isVerbosing ? 'Processing...' : 'Verbosify'}
				</button>
			</div>

			{#if output || isVerbosing}
				<div
					in:slide={{ axis: 'y' }}
					class="border-accent-color/30 bg-accent-color/5 relative overflow-hidden border-2 p-8"
					style="border-radius: var(--theme-radius);"
				>
					{#if isVerbosing}
						<div class="flex animate-pulse items-center gap-3">
							<div class="bg-accent-color h-2 w-2 rounded-full"></div>
							<div class="bg-accent-color animation-delay-200 h-2 w-2 rounded-full"></div>
							<div class="bg-accent-color animation-delay-400 h-2 w-2 rounded-full"></div>
							<span class="text-accent-color text-xs font-bold tracking-[0.4em] uppercase"
								>Transmuting Linguistics...</span
							>
						</div>
					{:else}
						<p
							class="font-serif text-xl leading-relaxed first-letter:mr-2 first-letter:text-4xl first-letter:font-bold"
						>
							{output}
						</p>
					{/if}

					<div
						class="border-accent-color/20 absolute top-0 right-0 m-2 h-8 w-8 border-t-2 border-r-2"
					></div>
					<div
						class="border-accent-color/20 absolute bottom-0 left-0 m-2 h-8 w-8 border-b-2 border-l-2"
					></div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 24px;
		height: 24px;
		background: var(--theme-accent);
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 0 15px var(--theme-accent);
	}

	.animation-delay-200 {
		animation-delay: 200ms;
	}
	.animation-delay-400 {
		animation-delay: 400ms;
	}

	/* Customscrollbar for LCARS */
	::-webkit-scrollbar {
		width: 15px;
	}
	::-webkit-scrollbar-track {
		background: black;
	}
	::-webkit-scrollbar-thumb {
		background: var(--lcars-blue);
		border-radius: 10px;
	}

	.lcars-dial-container {
		touch-action: none; /* Prevent scrolling while dragging dial */
	}
</style>
