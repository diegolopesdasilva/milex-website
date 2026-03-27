import type { HistoricalEvent } from './events';

export const regionalEvents: Record<string, HistoricalEvent[]> = {
	Americas: [
		{
			year: 1992,
			title: 'Post\u2013Cold War Cuts',
			description: 'US defence spending begins a steep post-Cold War decline, falling over 30 per cent in real terms by 1998.',
			context: 'The US shifted from Cold War force structures to a smaller, expeditionary military. The Base Realignment and Closure process shut dozens of installations across the country.'
		},
		{
			year: 2001,
			title: '9/11 & Afghan War',
			description: 'The September 11 attacks trigger the largest US military buildup since the Korean War.',
			context: 'US defence spending doubled in real terms between 2001 and 2010. Supplemental war funding for Afghanistan and Iraq exceeded $150 billion per year at peak levels.'
		},
		{
			year: 2003,
			title: 'Iraq Invasion',
			description: 'The US-led invasion of Iraq drives a sustained surge in American military expenditure.',
			context: 'By 2021, the total cost of the war on terror — including operations in Afghanistan and Iraq — exceeded $2.3 trillion in additional US military expenditure.'
		},
		{
			year: 2011,
			title: 'Budget Control Act',
			description: 'Sequestration imposes automatic spending cuts, beginning five years of declining US defence budgets.',
			context: 'US military spending fell by over 15 per cent in real terms between 2011 and 2015. The cuts forced the Pentagon to reduce force size and delay modernisation programmes.'
		},
		{
			year: 2017,
			title: 'Trump Buildup',
			description: 'Bipartisan budget deals lift sequestration caps, enabling the largest peacetime military budgets in US history.',
			context: 'Modernisation of the nuclear triad became a major spending driver. US spending reached $732 billion in 2019 — 2.7 times larger than China and equal to the next 14 countries combined.'
		},
		{
			year: 2022,
			title: 'Ukraine Aid Surge',
			description: 'The US provides tens of billions in military aid to Ukraine while maintaining a historically high defence budget.',
			context: 'A $35.7 billion Ukraine-related supplemental budget was approved in 2023, including $25.4 billion in direct military aid. US spending reached $916 billion.'
		}
	],

	Europe: [
		{
			year: 1992,
			title: 'Peace Dividend',
			description: 'European nations dramatically reduce military spending as the Cold War ends.',
			context: 'European military expenditure fell steadily through the 1990s as NATO members downsized forces and redirected budgets to social spending.'
		},
		{
			year: 1999,
			title: 'Kosovo War',
			description: 'NATO\'s air campaign against Yugoslavia exposes European capability gaps.',
			context: 'The conflict highlighted Europe\'s dependence on US military assets. European nations launched capability improvement pledges but spending continued to decline.'
		},
		{
			year: 2008,
			title: 'Financial Crisis Austerity',
			description: 'The global financial crisis leads to deep defence cuts across Europe.',
			context: 'European spending fell sharply after 2008 as austerity measures hit defence budgets. Most NATO members spent well below the 2 per cent GDP target.'
		},
		{
			year: 2014,
			title: 'Crimea & NATO Pledge',
			description: 'Russia\'s annexation of Crimea triggers NATO\'s 2 per cent GDP spending commitment.',
			context: 'At the 2014 Wales Summit, NATO allies pledged to spend 2 per cent of GDP on defence within a decade. In 2014, only three allies met the target.'
		},
		{
			year: 2022,
			title: 'Russia\u2013Ukraine War',
			description: 'The full-scale invasion of Ukraine causes a historic surge in European military spending.',
			context: 'European spending rose 13 per cent in 2022, with 39 of 43 European countries increasing budgets. Germany announced a \u20ac100 billion special defence fund within days of the invasion.'
		}
	],

	'Asia & Oceania': [
		{
			year: 1992,
			title: 'Post\u2013Cold War Stability',
			description: 'Asian military spending remains relatively stable while other regions cut deeply.',
			context: 'Unlike Europe and the Americas, Asian spending did not decline significantly after the Cold War. Regional tensions and economic growth sustained budgets.'
		},
		{
			year: 2001,
			title: 'War on Terror Spillover',
			description: 'The 9/11 attacks and Afghan war draw several Asian nations into counterterrorism operations.',
			context: 'Pakistan, Australia, and Japan all increased military spending in response to the war on terror. India accelerated defence modernisation amid persistent tensions with Pakistan.'
		},
		{
			year: 2008,
			title: 'China\'s Rise',
			description: 'China continues double-digit annual increases while the global economy reels from the financial crisis.',
			context: 'By 2008, East Asian military expenditure had more than doubled since 2000. China\'s uninterrupted military spending increases, beginning in the mid-1990s, reshaped the regional balance.'
		},
		{
			year: 2014,
			title: 'Maritime Tensions Escalate',
			description: 'Territorial disputes in the South and East China Seas drive regional military buildups.',
			context: 'Asian and Oceanian military expenditure rose for the 25th consecutive year. Japan began reinterpreting its pacifist constitution to allow greater military activities.'
		},
		{
			year: 2022,
			title: 'Indo-Pacific Buildup',
			description: 'Geopolitical rivalry with China drives historic spending increases across the Indo-Pacific.',
			context: 'Japan surpassed its longstanding 1 per cent of GDP cap for the third year and announced plans to reach 2 per cent by 2027. Australia, India and Taiwan all cited China tensions as a driver.'
		}
	],

	'Middle East': [
		{
			year: 1992,
			title: 'Post\u2013Gulf War',
			description: 'The aftermath of the 1991 Gulf War sustains elevated spending across the region.',
			context: 'Kuwait, Saudi Arabia and other Gulf states invested heavily in military modernisation following Iraq\'s invasion of Kuwait.'
		},
		{
			year: 2003,
			title: 'Iraq War',
			description: 'The US-led invasion of Iraq reshapes Middle Eastern security dynamics.',
			context: 'Regional spending fluctuated through the 2000s, driven by oil price volatility and the Iraq conflict\'s destabilising effects on neighbouring states.'
		},
		{
			year: 2014,
			title: 'ISIS & Yemen War',
			description: 'The rise of ISIS and the Saudi-led intervention in Yemen drive a spending surge.',
			context: 'Saudi Arabia became the world\'s third-largest military spender. The Yemen conflict and broader regional instability pushed Gulf state budgets to record levels.'
		},
		{
			year: 2017,
			title: 'Oil Price Contraction',
			description: 'Low oil prices force Gulf states to cut military budgets for the first time in years.',
			context: 'Saudi Arabia\'s spending fell 16 per cent in 2017 as oil revenues declined. The cuts were temporary — spending rebounded as oil prices recovered.'
		},
		{
			year: 2022,
			title: 'Gaza War & Regional Tensions',
			description: 'The Israel\u2013Hamas war and wider regional conflicts drive a sharp spending increase.',
			context: 'Israel\'s spending rose 24 per cent in 2023 and a further 65 per cent in 2024. Saudi Arabia increased spending 16 per cent in 2022 as oil revenues surged.'
		}
	],

	Africa: [
		{
			year: 1992,
			title: 'Post\u2013Cold War Decline',
			description: 'African military spending drops as Cold War proxy support dries up.',
			context: 'Many African states lost military aid from Cold War patrons. Civil conflicts in Somalia, Rwanda, and elsewhere continued despite declining conventional military budgets.'
		},
		{
			year: 2001,
			title: 'Counterterrorism Era',
			description: 'The war on terror brings renewed international military engagement in Africa.',
			context: 'US and European counterterrorism programmes expanded across the Sahel and Horn of Africa. Several African states increased defence spending to combat Islamist insurgencies.'
		},
		{
			year: 2008,
			title: 'Resource-Driven Growth',
			description: 'High commodity prices enable rapid military spending increases across resource-rich Africa.',
			context: 'African military spending reached $27.4 billion in 2009, a 6.5 per cent real increase. Oil revenues funded modernisation in Algeria, Angola, Nigeria and Libya.'
		},
		{
			year: 2014,
			title: 'Boko Haram & Instability',
			description: 'The rise of Boko Haram and Sahel insurgencies drive military buildups in West Africa.',
			context: 'Nigeria\'s military spending surged as the government fought Boko Haram in the northeast. Regional coalitions formed to combat cross-border extremist threats.'
		},
		{
			year: 2022,
			title: 'Sahel Conflicts Deepen',
			description: 'Ongoing conflicts in the Sahel and military coups reshape African defence spending patterns.',
			context: 'African spending fell 5.3 per cent in 2022 amid poor economic performance, then rebounded 22 per cent in 2023, boosted by oil revenues and ongoing conflicts in Burkina Faso and elsewhere.'
		}
	]
};
