import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '$env/dynamic/private';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const MAX_RETRIES = 1;
const DEFAULT_RETRY_AFTER_SECONDS = 60;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parseRetryAfterSeconds = (message: string): number | null => {
	const match = message.match(/retry in\s+([\d.]+)\s*s/i);
	if (!match) return null;
	const seconds = Number.parseFloat(match[1]);
	return Number.isFinite(seconds) ? Math.ceil(seconds) : null;
};

const isRateLimitError = (message: string) =>
	/\b429\b|rate limit|too many requests/i.test(message);

const isQuotaError = (message: string) => /quota.*exceeded/i.test(message);

const PERSONALITY_STYLES: Record<string, { name: string; style: string }> = {
	bard: {
		name: 'The Bard',
		style:
			'Shakespearean eloquence — use archaic English, poetic metaphors, iambic cadences, and dramatic flourish. Channel the spirit of soliloquies and sonnets.'
	},
	orator: {
		name: 'The Orator',
		style:
			'Tharoorian grandiosity — deploy sesquipedalian vocabulary, elaborate subordinate clauses, and the rhetorical grandeur of a scholar-statesman addressing Parliament.'
	},
	explorer: {
		name: 'The Explorer',
		style:
			"Victorian expeditionary prose — write with the confident, observational tone of a 19th-century naturalist dispatching field notes. Invoke discovery, wonder, and the spirit of Empire's great surveys."
	},
	bot: {
		name: 'The Automaton',
		style:
			'Technical sesquipedalian — employ precise, jargon-laden terminology with a systematic, almost robotic structure. Think dense academic paper meets corporate memo meets machine output.'
	},
	sartre: {
		name: 'The Existentialist',
		style: `Sartrean phenomenology in the mode of Nausea. You are Roquentin. You are rewriting the input as something you — the narrator — are actually saying or doing or experiencing, but filtered through your condition: the creeping awareness that objects and actions have no inherent essence, that existence precedes meaning, that the familiar names we give things are thin conventions draped over a nauseating, unjustified thereness.

CRITICAL: The output must still communicate what the input communicates. If the input is a greeting, the output is still a greeting — but one delivered by someone half-overwhelmed by the contingency of the moment. If the input describes an action, the output describes that same action — but as the narrator experiences its strange, brute facticity alongside it. The meaning survives; only the mode of experiencing it changes.

Key principles:
- Write in first person where natural, as Roquentin experiencing or performing the input
- The familiar names of things sit uneasily — "what they call a hand", "the sound that passes for hello"
- A low current of nausea or existential unease runs beneath everything, without overwhelming the content
- Existence insists on itself: the thereness of things presses in at the edges of even ordinary moments
- Prose is halting, circling slightly — the narrator notices things others would not
- Use: exists, contingent, facticity, insisting, unjustified, thereness, brute, dense — but woven in, not listed
- The social act or statement still happens; it is just strange, slightly vertiginous, shot through with the absurd`
	}
};

function buildPrompt(
	input: string,
	verbosity: number,
	personalityId: string,
	smartPoeticMode: boolean
): string {
	const personality = PERSONALITY_STYLES[personalityId] ?? PERSONALITY_STYLES.bard;

	const verbosityLabel =
		verbosity < 20
			? 'very slightly more elaborate — minimal expansion, just a touch more colour'
			: verbosity < 40
				? 'somewhat more elaborate — a modest increase in expressiveness'
				: verbosity < 60
					? 'moderately verbose and expressive — noticeably richer than the original'
					: verbosity < 80
						? 'highly verbose and expansive — significantly longer and more ornate'
						: 'extremely verbose — go entirely over the top with elaboration, extended passages, and extravagant flourishes';

	const poeticInstruction = smartPoeticMode
		? `- Smart Poetic Mode — FORMAT DETECTION AND PRESERVATION:
Analyze the input to determine its natural format. Detect whether it is:
  • Plain prose (normal sentences/paragraphs) → output as prose
  • A poem (stanzas, line breaks, metre, rhyme, free verse) → output as a poem in the same structural style (same stanza lengths, similar line count, same rhyme scheme if present)
  • A song or lyric (verses + chorus structure, repeated sections, refrain) → output as a song: preserve the verse/chorus/bridge structure, keep the refrain/chorus mostly intact (verbosify only the verses), maintain line breaks and stanzas
  • A limerick, haiku, sonnet, or other fixed form → output in that same fixed form, respecting syllable count or structural rules where possible
  • Lyrics with [bracket] stage directions → preserve those bracketed directions as-is

If the input is plain prose, keep output as prose — do NOT impose verse. If the input IS verse, your output MUST remain verse in the same format. Never mix: if it starts as prose, it stays prose; if it starts as verse, it stays verse.`
		: '- Output plain prose only. Do NOT introduce verse, rhyme, or poetic structure regardless of the input.';

	return `You are ${personality.name}. Your voice: ${personality.style}

Transform the text below to be ${verbosityLabel} (verbosity level ${verbosity}/100), written entirely in your voice.

Rules:
- Output ONLY the transformed text. No preamble, no labels, no explanation, no quotes around the output.
- Maintain the original formatting: line breaks, stanza spacing, verse/chorus labels, [bracketed stage directions]. The structure of the text is sacred.
- Preserve the original meaning faithfully.
- Preserve the input's structural format: if it has line breaks, stanzas, or section breaks, keep them. If it has labeled sections (e.g. "Verse 1:", "Chorus:"), keep those labels. Structure is part of the meaning.
- The verbosity level is ${verbosity}/100 — calibrate the richness and ornamentation accordingly.
- Proportionality: scale the output length to match the input length. A single sentence in should yield at most a short paragraph out, even at maximum verbosity. A greeting should become a few eloquent sentences, not an essay. Verbosity controls density of expression, not unlimited expansion.
- Conversation format: if the input uses "Name: line" format (e.g. "Ramesh: how are you?"), preserve each name prefix exactly as-is and only verbosify the speech after the colon. If the input is prose narrative (e.g. "he said, 'hello', and left"), verbosify the entire thing as normal.
${poeticInstruction}

Text to transform:
${input}`;
}

export const POST: RequestHandler = async ({ request }) => {
	let body: { input?: string; verbosity?: number; personality?: string; smartPoeticMode?: boolean };

	try {
		body = await request.json();
	} catch {
		return error(400, 'Invalid JSON body');
	}

	const { input, verbosity = 50, personality = 'bard', smartPoeticMode = true } = body;

	if (!input?.trim()) {
		return error(400, 'input is required');
	}

	try {
		const apiKey = env.GEMINI_API_KEY;
		if (!apiKey) {
			return error(500, 'GEMINI_API_KEY is not set');
		}

		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({
			model: env.GEMINI_MODEL ?? 'models/gemini-flash-lite-latest',
			generationConfig: {
				temperature: 0.9,
				maxOutputTokens: 2048
			}
		});

		const prompt = buildPrompt(input.trim(), verbosity, personality, smartPoeticMode);
		const result = await (async () => {
			let attempt = 0;
			while (true) {
				try {
					return await model.generateContent(prompt);
				} catch (err) {
					const message = err instanceof Error ? err.message : 'Gemini API error';
					if (isQuotaError(message)) {
						throw err;
					}
					if (!isRateLimitError(message) || attempt >= MAX_RETRIES) {
						throw err;
					}

					const retryAfter =
						parseRetryAfterSeconds(message) ?? DEFAULT_RETRY_AFTER_SECONDS;
					const backoffMs = Math.min(Math.max(retryAfter, 1), 10) * 1000;
					attempt += 1;
					await delay(backoffMs);
				}
			}
		})();

		return json({ output: result.response.text() });
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Gemini API error';
		console.error('[/api/verbosify]', message);

		if (isQuotaError(message) || isRateLimitError(message)) {
			const retryAfter =
				parseRetryAfterSeconds(message) ?? DEFAULT_RETRY_AFTER_SECONDS;
			return json(
				{
					error: 'Gemini rate limit or quota exceeded. Please retry later.',
					retryAfterSeconds: retryAfter
				},
				{
					status: 429,
					headers: {
						'Retry-After': String(retryAfter)
					}
				}
			);
		}

		return error(500, message);
	}
};
