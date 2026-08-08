<script lang="ts">
	import { theme } from '$lib/theme.svelte';
	import { personalities, type Personality } from '$lib/personalities';
	import { fade } from 'svelte/transition';
	import {
		Sparkles,
		MessageSquare,
		History,
		Wand2,
		Eye,
		Copy,
		Check,
		Loader2
	} from '@lucide/svelte';

	const iconsById: Record<string, typeof Sparkles> = {
		bard: Sparkles,
		orator: MessageSquare,
		explorer: History,
		bot: Wand2,
		sartre: Eye
	};

	let input = $state('');
	let output = $state('');
	let isVerbosing = $state(false);
	let verbosity = $state(50);
	let smartPoeticMode = $state(true);
	let error = $state('');
	let copied = $state(false);

	let selectedPersonality = $state<Personality>(personalities[0]);

	function copyOutput() {
		navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function handleKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
			e.preventDefault();
			handleVerbosify();
		}
	}

	async function handleVerbosify() {
		if (!input.trim()) return;
		isVerbosing = true;
		error = '';

		try {
			const res = await fetch('/api/verbosify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					input,
					verbosity,
					personality: selectedPersonality.id,
					smartPoeticMode
				})
			});

			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				if (res.status === 429) {
					const retryAfter = body.retryAfterSeconds ?? 60;
					error = `Rate limit — retry after ${retryAfter}s`;
					return;
				}
				throw new Error(body.message ?? `HTTP ${res.status}`);
			}

			const data = await res.json();
			output = data.output;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Something went wrong';
		} finally {
			isVerbosing = false;
		}
	}
</script>

<div class="verbosify-layout" in:fade style="--accent-color: {selectedPersonality.color}">
	<!-- ==================== CONTROLS RAIL ==================== -->
	<aside class="controls-rail">
		<div class="panel">
			<p class="panel__title">Personality</p>
			<div class="personality-list">
				{#each personalities as p}
					{@const Icon = iconsById[p.id]}
					<button
						class="personality-chip"
						class:personality-chip--active={selectedPersonality.id === p.id}
						onclick={() => (selectedPersonality = p)}
						aria-pressed={selectedPersonality.id === p.id}
					>
						<Icon />
						<span>{p.name}</span>
					</button>
				{/each}
			</div>

			<div class="field">
				<div class="field__header">
					<span class="field__label">Verbosity</span>
					<span class="field__value">{verbosity}%</span>
				</div>
				<input
					class="slider"
					type="range"
					min="0"
					max="100"
					step="1"
					bind:value={verbosity}
					style="--slider-fill: {verbosity}%"
					aria-label="Verbosity level"
				/>
				<div class="slider-labels">
					<span>Succinct</span>
					<span>Verbose</span>
				</div>
			</div>

			<div class="switch-row">
				<div>
					<p class="panel__title" style="margin-bottom:0.25rem">Smart poetic</p>
					<p class="switch-hint">Preserve poems, songs &amp; verse</p>
				</div>
				<label class="switch">
					<input type="checkbox" bind:checked={smartPoeticMode} />
					<span class="switch__track"></span>
				</label>
			</div>
		</div>
	</aside>

	<!-- ==================== WORKSPACE ==================== -->
	<div class="workspace">
		<!-- Input card -->
		<div class="panel">
			<div class="input-wrap">
				<textarea
					class="textarea"
					bind:value={input}
					placeholder="Type something plain…"
					disabled={isVerbosing}
					onkeydown={handleKeydown}
					aria-label="Text to verbosify"
				></textarea>
				<div class="input-foot">
					<span class="char-count">{input.length.toLocaleString()} chars</span>
					<button
						class="btn btn-primary"
						onclick={handleVerbosify}
						disabled={!input.trim() || isVerbosing}
					>
						{#if isVerbosing}
							<span class="spinner"></span>
						{/if}
						{isVerbosing ? 'Verbosifying…' : 'Verbosify'}
					</button>
				</div>
			</div>
		</div>

		<!-- Output card -->
		<div class="panel output-card">
			<div class="output-card__head">
				<div class="output-card__meta">
					<span class="personality-dot"></span>
					<span>{selectedPersonality.name}</span>
				</div>
				{#if output}
					<button class="btn btn-ghost" onclick={copyOutput}>
						{#if copied}
							<Check size={14} />
							<span>Copied</span>
						{:else}
							<Copy size={14} />
							<span>Copy</span>
						{/if}
					</button>
				{/if}
			</div>

			{#if error}
				<div class="error-box" role="alert">
					{error}
				</div>
			{/if}

			{#if isVerbosing && !output}
				<div class="empty">
					<span class="spinner"></span>
				</div>
			{:else if output}
				<div class="output themed-scrollbar">
					<p>{output}</p>
				</div>
			{:else}
				<div class="empty">Your verbose translation will appear here.</div>
			{/if}
		</div>
	</div>
</div>