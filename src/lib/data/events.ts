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
			'The dissolution of the Soviet Union triggered immediate military downsizing across the former Eastern Bloc, while NATO members also began their own force reductions. Defence ministries reoriented from large standing armies toward smaller, more agile structures suited to peacekeeping and crisis response.'
	},
	{
		year: 1996,
		title: 'First Chechen War Ends',
		description:
			"Russia's costly campaign in Chechnya ends amid economic turmoil, with military spending at historic lows.",
		context:
			'Russian military expenditure in the mid-1990s was a fraction of Soviet-era levels. The war exposed deep structural weaknesses in the armed forces, contributing to two decades of largely unreformed Soviet-era military structures.'
	},
	{
		year: 1999,
		title: 'Trough and Turning Point',
		description:
			'Between 1992 and 1998, global military spending fell by 15 per cent in real terms \u2014 a trough deepened by Russia\u2019s 1998 financial crisis. 1999 marked the reversal.',
		context:
			'NATO\u2019s 11-week Operation Allied Force over Kosovo and the deployment of KFOR added several billion dollars in operational costs. Russia launched the Second Chechen War and began raising defence spending after a decade of collapse. India and Pakistan, having tested nuclear weapons in 1998, increased spending amid the Kargil conflict in Kashmir.'
	},
	{
		year: 2001,
		title: '9/11 & War on Terror',
		description:
			'Global military expenditure reverses its post\u2013Cold War decline, led by the US with operations in Afghanistan.',
		context:
			'9/11 set off a sustained reversal of the post\u2013Cold War cuts. Operations in Afghanistan, soon followed by Iraq, would expand into the largest US military buildup since the Korean War, with major increases also coming from Brazil, China and India.'
	},
	{
		year: 2003,
		title: 'Iraq War',
		description:
			'The US-led invasion of Iraq drives a sharp surge in American and Middle Eastern military spending.',
		context:
			'By the end of 2011, the wars in Afghanistan and Iraq had cost the USA over $1.2 trillion in additional military expenditure, with potential long-term total costs estimated as high as $4 trillion.'
	},
	{
		year: 2005,
		title: 'War-Funded Expansion',
		description:
			'Global military spending continued its post-9/11 ascent, erasing most of the post\u2013Cold War peace dividend. The US alone accounted for 80 per cent of the global increase that year.',
		context:
			'Oil-exporting states also raised spending 11 per cent as commodity prices climbed. Supplemental appropriations for operations in Afghanistan and Iraq ran at roughly $100 billion per year, driving sustained increases through the decade.'
	},
	{
		year: 2008,
		title: 'Global Financial Crisis',
		description:
			'Economic pressures begin to slow military spending growth in Western nations, though Asian spending continues to rise.',
		context:
			'Despite the global recession, military spending rose 6.9 per cent in real terms in 2009. Of 120 countries with data, 65 per cent increased budgets, including 16 of the G20 economies. Between 2001 and 2009, global military spending grew by an average of 5.6 per cent per year, with more than half of the real-terms rise coming from the United States.'
	},
	{
		year: 2011,
		title: 'Peak US Spending',
		description:
			'American military expenditure reaches its post-9/11 peak, then begins a sustained decline through sequestration.',
		context:
			'Global military expenditure stood at 2.5 per cent of GDP in 2011. US spending accounted for 41 per cent of the world total, roughly equal to the next 14 countries combined. Nine of the 15 largest spenders cut budgets.'
	},
	{
		year: 2012,
		title: 'First Global Decline',
		description:
			'After more than a decade of increases, world military spending fell for the first time since 1998 \u2014 driven entirely by US and Western austerity cuts.',
		context:
			'Global military expenditure fell 1.0 per cent in real terms in 2012. The Americas fell 5.1 per cent as the US withdrew from Iraq and sequestration took effect. But the decline was confined to the West \u2014 Asia and Eastern Europe continued rising.'
	},
	{
		year: 2014,
		title: 'Crimea Annexation',
		description:
			"Russia's annexation of Crimea triggers renewed European defence commitments and NATO's 2% GDP spending pledge.",
		context:
			'Eastern Europe rose 7.2 per cent in 2014, while Central Europe broke from post-2008 austerity with a 6.5 per cent increase. At the NATO Wales Summit, allies committed to spending 2 per cent of GDP on defence within a decade.'
	},
	{
		year: 2015,
		title: 'Spending Resumes Growth',
		description:
			'Global military expenditure rose for the first time since 2011, ending a three-year decline, even as collapsing oil prices hit Africa and the Middle East.',
		context:
			'Global military spending rose 1.3 per cent in real terms in 2015. Central Europe surged 13 per cent, led by Poland, in response to the crisis in Ukraine. Africa fell 3.6 per cent \u2014 the first African decline in years \u2014 as oil-dependent states slashed budgets.'
	},
	{
		year: 2017,
		title: 'Trump Defence Buildup',
		description:
			'The United States reverses spending cuts, beginning a new phase of military budget increases.',
		context:
			'Global military expenditure in 2017 was the highest since the Cold War, 7.1 per cent above 2008 in real terms. Central Europe recorded a strong subregional increase (+7.9 per cent), driven by the perceived Russian threat.'
	},
	{
		year: 2020,
		title: 'COVID-19 Pandemic',
		description:
			"Despite the pandemic's economic toll, most major powers maintain or increase military budgets.",
		context:
			'In 2020 global military expenditure reached its highest level since 1988 and recorded its sixth consecutive annual increase. The global military burden rose to 2.4 per cent of GDP as economies contracted but defence budgets held.'
	},
	{
		year: 2022,
		title: 'Russia\u2013Ukraine War',
		description:
			'The full-scale invasion of Ukraine causes the largest spike in European military spending since the Cold War.',
		context:
			'European military spending rose 13.8 per cent in 2022, with 39 of 43 European countries increasing budgets. Ukraine\u2019s spending rose more than sevenfold, amounting to over a third of its GDP.'
	},
	{
		year: 2023,
		title: 'Sharpest Rise in a Decade',
		description:
			'Military spending surged 6.7 per cent \u2014 the steepest annual increase since 2009 \u2014 with all five regions rising simultaneously for the first time in 14 years.',
		context:
			'Europe rose 14.8 per cent, with 10 of 28 NATO European members meeting the 2 per cent of GDP target. Russia\u2019s spending jumped 24 per cent. In the Middle East, the Israel\u2013Hamas war drove a 24 per cent increase in Israeli spending.'
	}
];
