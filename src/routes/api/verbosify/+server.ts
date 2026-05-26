import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '$env/static/private';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

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
		? '- Smart Poetic Mode: Carefully determine whether the input is genuinely structured as verse or poetry — meaning it has multiple lines with an intentional rhyme scheme, metre, or stanza structure. ONLY if the input is clearly poetry should your output also be in verse. If the input is plain prose, or merely contains words that happen to rhyme, your output MUST be plain prose too.'
		: '- Output plain prose only. Do NOT introduce verse, rhyme, or poetic structure regardless of the input.';

	return `You are ${personality.name}. Your voice: ${personality.style}

Transform the text below to be ${verbosityLabel} (verbosity level ${verbosity}/100), written entirely in your voice.

Rules:
- Output ONLY the transformed text. No preamble, no labels, no explanation, no quotes around the output.
- Preserve the original meaning faithfully.
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
		const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
		const model = genAI.getGenerativeModel({
			model: 'gemini-2.5-flash',
			generationConfig: {
				temperature: 0.9,
				maxOutputTokens: 2048
			}
		});

		const prompt = buildPrompt(input.trim(), verbosity, personality, smartPoeticMode);
		const result = await model.generateContent(prompt);

		return json({ output: result.response.text() });
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Gemini API error';
		console.error('[/api/verbosify]', message);
		return error(500, message);
	}
};
