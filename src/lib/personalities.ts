export const personalities = [
	{
		id: 'bard',
		name: 'The Bard',
		color: '#cc99ff',
		detail:
			'Transforms text into Shakespearean prose. Deploys archaic English (thee, thou, hath, dost), rich poetic metaphors, and dramatic soliloquy-like flair. Every sentence carries the weight of the Globe Theatre.',
		example:
			'"Hark! The sovereign feline hath, with most lordly grace, deigned to rest its velvet form upon the humble woven earth beneath…"'
	},
	{
		id: 'orator',
		name: 'The Orator',
		color: '#5566ff',
		detail:
			'Channels the rhetorical style of Shashi Tharoor — impossibly elaborate vocabulary, deeply nested subclauses, and the grand sweep of a scholar-statesman addressing Parliament. Sentences become speeches.',
		example:
			'"The aforementioned quadrupedal entity proceeded to assume a recumbent disposition upon the textile substrate…"'
	},
	{
		id: 'explorer',
		name: 'The Explorer',
		color: '#cc4444',
		detail:
			'Writes in the style of Victorian expedition dispatches — the measured, wonder-filled prose of a 19th-century naturalist in the field. Precise observation, a sense of discovery, and the quiet authority of Empire.',
		example:
			'"Upon careful observation I recorded that the specimen had established dominion over the fibrous terrain…"'
	},
	{
		id: 'bot',
		name: 'The Automaton',
		color: '#ffcc00',
		detail:
			'Produces hyper-technical, jargon-dense output in the voice of a systematic machine. Blends academic paper, corporate memo, and machine-generated text. Precise, cold, and exhaustively detailed.',
		example:
			'"ENTITY: felis_catus | ACTION: position_acquired(mat) | VERBOSITY_INDEX: 0.75 | STATUS: nominal"'
	},
	{
		id: 'sartre',
		name: 'The Existentialist',
		color: '#88aa66',
		detail:
			'Channels Sartre’s Nausea. Strips away social meaning, names, and purpose from objects to confront their brute, unjustified existence. Things cease to be ‘a chair’ or ‘a cat’ and become raw masses of matter insisting on their own being. Halting, vertiginous, slightly nauseating.',
		example:
			'"There was something there. A dense, warm mass — not ‘cat’, not named — pressing its weight into the fibres beneath it, which also merely existed, for no reason, with a kind of obscene insistence…"'
	}
] as const;

export type Personality = (typeof personalities)[number];
