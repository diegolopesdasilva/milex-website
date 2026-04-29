export interface WorldNeed {
	year: number; // can be fractional to space items at the same year
	side: 'left' | 'right';
	text: string;
}

// Period-based annotations contrasting military expenditure with global
// funding gaps. Each entry is placed inside a safe window between the
// dated milex events so that the world-need card never overlaps an event
// card on the same side.
export const worldNeeds: WorldNeed[] = [
	{
		year: 1993.7,
		side: 'left',
		text: 'Through the early 1990s, UNHCR was tracking around 27 million displaced persons of concern — the highest tally since the agency’s founding — as wars erupted in the former Yugoslavia, Rwanda and the Great Lakes.'
	},
	{
		year: 1994.5,
		side: 'right',
		text: 'Across the post–Cold War decade, OECD-DAC aid hovered around 0.27 per cent of donor national income — barely a third of the 0.7 per cent target most members had reaffirmed since 1970. Only a handful of Nordic donors met the commitment.'
	},
	{
		year: 1997.7,
		side: 'left',
		text: 'Through the late 1990s, around 800 million people in developing countries remained chronically undernourished. The 1996 World Food Summit had pledged to halve that figure by 2015, but progress was running at roughly a third of the pace required.'
	},
	{
		year: 1997.9,
		side: 'right',
		text: 'Across the late 1990s, the UN’s Consolidated Appeals routinely closed each year roughly half-funded — a pattern of half-met humanitarian needs that would persist for the next two decades.'
	},
	{
		year: 2006.7,
		side: 'left',
		text: 'Through the mid-2000s, around 100 million primary-school-age children remained outside any classroom. Donor pledges from the Dakar Education for All summit fell short year after year, even as humanitarian appeals raised only a fraction of comparable crisis costs.'
	},
	{
		year: 2006.85,
		side: 'right',
		text: 'From the mid-2000s onward, climate finance from rich economies to vulnerable ones lagged far behind the trillions estimated as needed for adaptation and mitigation by successive UNFCCC reviews and the Stern Review.'
	},
	{
		year: 2009.7,
		side: 'left',
		text: 'Around the 2007–08 food-price spike, an estimated 100 million additional people were pushed into food insecurity, and the number of chronically undernourished crossed one billion the following year — the highest level on record.'
	},
	{
		year: 2018.7,
		side: 'left',
		text: 'Through the late 2010s, donor funding for AIDS, malaria and tuberculosis stagnated, leaving multi-billion-dollar annual shortfalls against UNAIDS and WHO targets — and, in parts of Africa, reversing decades of decline in cases and deaths.'
	},
	{
		year: 2018.85,
		side: 'right',
		text: 'By the 2020 deadline of the Copenhagen pledge of $100 billion a year in climate finance, only roughly half the promised flow was being delivered, with adaptation finance for the most vulnerable economies running at a small fraction of estimated needs.'
	},
	{
		year: 2024.65,
		side: 'left',
		text: 'In the early 2020s, UN humanitarian appeals saw the largest absolute funding gaps on record — a $30 billion shortfall in 2023.'
	},
	{
		year: 2024.7,
		side: 'right',
		text: 'By 2024, OECD-DAC aid fell 23 per cent — the steepest one-year drop on record — as 295 million people faced acute food insecurity.'
	}
];
