export interface HistoricalEvent {
	year: number;
	title: string;
	description: string;
	context: string;
}

export const events: HistoricalEvent[] = [
	{
		year: 1992,
		title: 'Post\u2013Cold War Drawdown',
		description:
			'With the Soviet Union dissolved, militaries across the world begin deep budget cuts \u2014 the so-called "peace dividend."',
		context:
			'Between 1992 and 1996, global military spending fell by more than 30 per cent in real terms. The steepest cuts came in the former Soviet states, but NATO members also reduced their forces substantially.'
	},
	{
		year: 1996,
		title: 'First Chechen War Ends',
		description:
			"Russia's costly campaign in Chechnya ends amid economic turmoil, with military spending at historic lows.",
		context:
			'Russian military expenditure in the mid-1990s was a fraction of Soviet-era levels. The war exposed deep structural weaknesses in the armed forces that would take decades to address.'
	},
	{
		year: 2001,
		title: '9/11 & War on Terror',
		description:
			'Global military expenditure reverses its post\u2013Cold War decline, led by the US with operations in Afghanistan.',
		context:
			'US defence spending rose by 50 per cent in real terms between 2001 and 2010. The wars in Afghanistan and Iraq accounted for trillions of dollars in cumulative spending over two decades.'
	},
	{
		year: 2003,
		title: 'Iraq War',
		description:
			'The US-led invasion of Iraq drives a sharp surge in American and Middle Eastern military spending.',
		context:
			'At the height of the Iraq War, supplemental war funding alone exceeded the entire defence budget of most European nations. The conflict reshaped Middle Eastern security dynamics for a generation.'
	},
	{
		year: 2008,
		title: 'Global Financial Crisis',
		description:
			'Economic pressures begin to slow military spending growth in Western nations, though Asian spending continues to rise.',
		context:
			'While Europe and the Americas began to cut defence budgets, China continued double-digit annual increases. By 2008, East Asian military expenditure had more than doubled since 2000.'
	},
	{
		year: 2011,
		title: 'Peak US Spending',
		description:
			'American military expenditure reaches its post-9/11 peak, then begins a sustained decline through sequestration.',
		context:
			'The Budget Control Act of 2011 imposed automatic spending cuts across the US federal budget. Defence spending fell for five consecutive years, dropping by over 15 per cent in real terms.'
	},
	{
		year: 2014,
		title: 'Crimea Annexation',
		description:
			"Russia's annexation of Crimea triggers renewed European defence commitments and NATO's 2% GDP spending pledge.",
		context:
			'At the 2014 Wales Summit, NATO allies committed to spending 2 per cent of GDP on defence within a decade. In 2014, only three allies met the target; by 2024, twenty-three did.'
	},
	{
		year: 2017,
		title: 'Trump Defence Buildup',
		description:
			'The United States reverses spending cuts, beginning a new phase of military budget increases.',
		context:
			'Bipartisan budget deals lifted the sequestration caps, enabling the largest peacetime military budgets in US history. Modernisation of the nuclear triad became a major spending driver.'
	},
	{
		year: 2020,
		title: 'COVID-19 Pandemic',
		description:
			"Despite the pandemic's economic toll, most major powers maintain or increase military budgets.",
		context:
			'Military spending proved remarkably resilient to the pandemic. While many sectors of government spending were redirected to health, defence budgets were largely protected or increased.'
	},
	{
		year: 2022,
		title: 'Russia\u2013Ukraine War',
		description:
			'The full-scale invasion of Ukraine causes the largest spike in European military spending since the Cold War.',
		context:
			'Germany announced a \u20ac100 billion special defence fund within days of the invasion. European military spending rose by 30 per cent between 2021 and 2024, the fastest increase in the post-Cold War era.'
	}
];
