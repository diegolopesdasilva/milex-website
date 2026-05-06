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
			year: 1995,
			title: 'Deep US Cuts, Central American Peace',
			description: 'US military spending fell 6.2 per cent in real terms in its fourth consecutive annual cut, while civil wars in Central America ended.',
			context: 'By 1997, Central American military spending had halved since 1990. Nicaragua\u2019s expenditure fell 89 per cent over the decade as the contras and Sandinistas demobilised. Guatemala\u2019s 1996 peace accords closed out the region\u2019s last active civil war.'
		},
		{
			year: 1999,
			title: 'Plan Colombia',
			description: 'The United States launched a multi-year counter-narcotics and counter-insurgency aid programme for Colombia, reshaping the region\u2019s security spending.',
			context: 'Plan Colombia channelled billions of dollars into Colombian police and military capabilities. Combined with Brazil\u2019s post-crisis recovery, it drove South American spending up 59 per cent cumulatively from 1991.'
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
			year: 2009,
			title: 'US War Spending Peaks',
			description: 'US military expenditure reached $661 billion \u2014 43 per cent of the world total \u2014 driven by supplemental funding for Afghanistan and Iraq.',
			context: 'The United States accounted for 65 per cent of the global increase in military spending between 2000 and 2009. Supplemental war funding exceeded $150 billion per year at peak levels.'
		},
		{
			year: 2011,
			title: 'Budget Control Act',
			description: 'Sequestration imposes automatic spending cuts, beginning five years of declining US defence budgets.',
			context: 'US military spending fell by over 15 per cent in real terms between 2011 and 2015. The cuts forced the Pentagon to reduce force size and delay modernisation programmes.'
		},
		{
			year: 2013,
			title: 'Sequestration Bites',
			description: 'US spending fell 7.8 per cent under the Budget Control Act \u2014 the steepest annual cut in the post-9/11 era \u2014 while Latin American spending continued to grow.',
			context: 'Americas military expenditure fell 7.0 per cent overall in 2013. The US decline was driven by withdrawal from Afghanistan and mandatory sequestration cuts, while Honduras and Nicaragua increased spending to combat drug cartels.'
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
			context: 'A $35.7 billion Ukraine-related supplemental budget was approved in 2023, including $25.4 billion in direct military aid. US spending was $877 billion in 2022 and rose to $916 billion in 2023.'
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
			year: 1997,
			title: 'NATO Enlargement Begins',
			description: 'The Czech Republic, Hungary and Poland were invited to join NATO at the Madrid Summit, beginning a sustained defence-budget upswing in Central Europe.',
			context: 'All three countries raised defence spending in preparation for 1999 accession and set GDP burden targets of 1.8\u20132.4 per cent. The enlargement formalised a shift of Europe\u2019s security frontier 500 kilometres eastward.'
		},
		{
			year: 1999,
			title: 'Kosovo War',
			description: 'NATO\'s air campaign against Yugoslavia exposes European capability gaps.',
			context: 'The conflict highlighted Europe\'s dependence on US military assets. European nations launched capability improvement pledges but spending continued to decline.'
		},
		{
			year: 2004,
			title: 'Biggest NATO Enlargement',
			description: 'Seven states joined NATO in the alliance\u2019s largest single expansion, and the European Defence Agency was established to coordinate EU defence procurement.',
			context: 'Bulgaria, Estonia, Latvia, Lithuania, Romania, Slovakia and Slovenia raised spending in the years surrounding accession. Russia responded with an 8 per cent real-terms increase as oil revenues grew.'
		},
		{
			year: 2008,
			title: 'Financial Crisis Austerity',
			description: 'The global financial crisis leads to deep defence cuts across Europe.',
			context: 'European spending fell sharply after 2008 as austerity measures hit defence budgets. Most NATO members spent well below the 2 per cent GDP target.'
		},
		{
			year: 2012,
			title: 'Austerity Deepens',
			description: 'Western and Central European spending fell 3.4 per cent, continuing post-crisis cuts that had shrunk budgets across much of the region since 2008.',
			context: 'Ten countries \u2014 including Greece, Spain and the UK \u2014 had cut military budgets by more than 10 per cent since 2008. Eastern Europe bucked the trend, rising 14.9 per cent.'
		},
		{
			year: 2014,
			title: 'Crimea & NATO Pledge',
			description: 'Russia\'s annexation of Crimea triggers NATO\'s 2 per cent GDP spending commitment.',
			context: 'At the 2014 Wales Summit, NATO allies pledged to spend 2 per cent of GDP on defence within a decade. In 2014, only three allies met the target.'
		},
		{
			year: 2017,
			title: 'Trend Reversal',
			description: 'Western European spending rose for the third consecutive year, up 1.7 per cent, driven by the perceived Russian threat and the fight against ISIS.',
			context: 'Central Europe recorded a strong subregional increase of 7.9 per cent. The sustained growth marked a decisive break from the post-2008 austerity era.'
		},
		{
			year: 2022,
			title: 'Russia\u2013Ukraine War',
			description: 'The full-scale invasion of Ukraine causes a historic surge in European military spending.',
			context: 'European spending rose 13.8 per cent in 2022, with 39 of 43 European countries increasing budgets. Germany announced a \u20ac100 billion special defence fund within days of the invasion.'
		},
		{
			year: 2023,
			title: 'Europe Rearms',
			description: 'European military spending rose 14.8 per cent, with 39 of 43 countries increasing budgets.',
			context: 'Ten NATO European members reached the 2 per cent of GDP target \u2014 the highest number since the target was set in 2014. Poland announced plans to raise its burden to 4 per cent of GDP.'
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
			year: 1997,
			title: 'East Asian Financial Crisis',
			description: 'The regional financial crisis forced Thailand, South Korea, Malaysia, Indonesia and the Philippines to cut or postpone military procurement.',
			context: 'Thailand cut its defence budget three times in a single fiscal year for a cumulative 30 per cent reduction. Currency depreciations doubled the cost of arms imports; IMF conditions forced broad budget compression across the region.'
		},
		{
			year: 1998,
			title: 'Nuclear Tests in South Asia',
			description: 'India and Pakistan each conducted nuclear weapons tests in May 1998, triggering US sanctions and a sustained regional arms dynamic.',
			context: 'Both governments announced post-test defence increases, though actual Pakistani outlays fell 13 per cent under economic strain. India\u2019s next-year budget rose 6 per cent in real terms plus a supplementary allocation for Kashmir. The tests reset the strategic landscape for the next two decades.'
		},
		{
			year: 2001,
			title: 'War on Terror Spillover',
			description: 'The 9/11 attacks and Afghan war draw several Asian nations into counterterrorism operations.',
			context: 'Pakistan, Australia, and Japan all increased military spending in response to the war on terror. India accelerated defence modernisation amid persistent tensions with Pakistan.'
		},
		{
			year: 2006,
			title: 'China Overtakes Japan',
			description: 'China surpassed Japan to become the largest military spender in Asia and moved up to fourth place globally.',
			context: 'Chinese spending had risen roughly 165 per cent in real terms over the previous decade. North Korea\u2019s July 2006 missile tests and October 2006 nuclear test re-opened the Japanese debate on its 1 per cent of GDP cap and constitutional constraints.'
		},
		{
			year: 2008,
			title: 'China\'s Rise',
			description: 'China continues double-digit annual increases while the global economy reels from the financial crisis.',
			context: 'By 2008, East Asian military expenditure had more than doubled since 2000. China\'s uninterrupted military spending increases, beginning in the mid-1990s, reshaped the regional balance.'
		},
		{
			year: 2012,
			title: 'China\u2019s First Aircraft Carrier',
			description: 'China commissioned its first aircraft carrier as Chinese spending rose 7.8 per cent. East Asian military expenditure had now risen for 23 consecutive years.',
			context: 'The carrier represented a milestone in China\u2019s naval modernisation. Across the region, South East Asian states also increased spending amid growing maritime tensions in the South China Sea.'
		},
		{
			year: 2014,
			title: 'Maritime Tensions Escalate',
			description: 'Territorial disputes in the South and East China Seas drive regional military buildups.',
			context: 'Asian and Oceanian military expenditure rose for the 25th consecutive year. Japan began reinterpreting its pacifist constitution to allow greater military activities.'
		},
		{
			year: 2019,
			title: 'India Becomes Third-Largest Spender',
			description: 'Indian military expenditure reached $71.1 billion, overtaking Russia for the first time as the world\u2019s third-largest spender.',
			context: 'Spending rose 5.1 per cent across the region in 2019. China\u2019s estimated expenditure reached $261 billion \u2014 85 per cent higher than in 2010.'
		},
		{
			year: 2022,
			title: 'Indo-Pacific Buildup',
			description: 'Geopolitical rivalry with China drives historic spending increases across the Indo-Pacific.',
			context: 'Japan surpassed its longstanding 1 per cent of GDP cap for the third year and announced plans to reach 2 per cent by 2027. Australia, India and Taiwan all cited China tensions as a driver.'
		},
		{
			year: 2023,
			title: 'Japan\u2019s Historic Buildup',
			description: 'Japanese spending rose 11 per cent \u2014 the largest year-on-year increase since 1972 \u2014 as China\u2019s spending grew for the 29th consecutive year.',
			context: 'Chinese military expenditure reached $296 billion in 2023. Regional spending rose 4.9 per cent overall, with major increases also in South Korea and the Philippines.'
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
			year: 1995,
			title: 'Regional Buildup Diverges',
			description: 'While world military spending continued to fall, Middle Eastern expenditure kept rising as Iran and Saudi Arabia accelerated procurement.',
			context: 'Iranian spending had risen roughly 42 per cent in real terms since 1992 and Saudi spending around 13 per cent. The Oslo Accords and the Israel\u2013Jordan peace treaty had created expectations of a peace dividend that never materialised as the Israel\u2013Syria track stalled.'
		},
		{
			year: 2000,
			title: 'Second Intifada',
			description: 'The outbreak of the Second Intifada drove three consecutive years of supplementary Israeli defence budgets and accelerated Gulf procurement.',
			context: 'Israel\u2019s 2001 allocation was 7 per cent above its pre-Intifada baseline. Iran, Saudi Arabia, Oman and the UAE raised spending as oil prices climbed through 2000 and 2001.'
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
			description: 'The steep mid-2010s oil-price collapse forced Gulf states to cut military budgets for the first time in years.',
			context: 'Saudi Arabian spending had fallen 26 per cent between 2014 and 2016 amid the oil-price collapse — the deepest contraction of the decade. By 2017, with oil revenues recovering, Saudi spending rose 9.2 per cent.'
		},
		{
			year: 2019,
			title: 'Saudi Spending Plunges',
			description: 'Saudi Arabia\u2019s military spending fell 16 per cent, dropping from third- to fifth-largest spender globally.',
			context: 'The Middle East as a whole fell 4.7 per cent. The Saudi decline reflected both lower oil revenues and a reassessment of the costly Yemen intervention.'
		},
		{
			year: 2022,
			title: 'Gaza War & Regional Tensions',
			description: 'The Israel\u2013Hamas war and wider regional conflicts drive a sharp spending increase.',
			context: 'Israel\'s spending rose 24 per cent in 2023 and a further 65 per cent in 2024. Saudi Arabia increased spending 16 per cent in 2022 as oil revenues surged.'
		},
		{
			year: 2023,
			title: 'Israel\u2013Hamas War',
			description: 'The conflict in Gaza drove a 24 per cent increase in Israeli military spending. The Middle East rose 9.4 per cent \u2014 its first major regional increase in years.',
			context: 'Saudi Arabia also raised spending as high oil prices enabled larger budgets across the Gulf, while T\u00fcrkiye and the UAE accelerated their own modernisation drives.'
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
			year: 1994,
			title: 'Rwanda and South African Transition',
			description: 'The Rwandan genocide and South Africa\u2019s democratic transition reshaped the security landscape of eastern and southern Africa.',
			context: 'Post-genocide Rwanda and Uganda emerged as major regional security actors. South Africa began consolidating the armed forces of the former homelands into the South African National Defence Force, while cutting cumulative defence spending by more than half between 1989 and 1998.'
		},
		{
			year: 1998,
			title: 'African Great War',
			description: 'The Second Congo War and the Ethiopia\u2013Eritrea border war drew in at least seven states and reversed the continent\u2019s drawdown.',
			context: 'Rwanda and Uganda backed anti-Kabila rebels in the Democratic Republic of the Congo, while Angola, Namibia and Zimbabwe backed the government. Ethiopia raised spending 8 per cent in real terms and Eritrea mobilised 200,000 troops; Angola\u2019s military burden reached 11\u201319 per cent of GDP.'
		},
		{
			year: 2001,
			title: 'Counterterrorism Era',
			description: 'The war on terror brings renewed international military engagement in Africa.',
			context: 'US and European counterterrorism programmes expanded across the Sahel and Horn of Africa. Several African states increased defence spending to combat Islamist insurgencies.'
		},
		{
			year: 2002,
			title: 'Peace-Driven Modernisation',
			description: 'With the Angolan civil war ended and the Second Congo War winding down, armed-forces modernisation overtook active conflict as the main driver of African military spending.',
			context: 'Russia wrote off roughly $10 billion of Ethiopia\u2019s Soviet-era debt, opening a new modernisation path. Nigeria signed a military-cooperation agreement with Russia through 2005, and Algerian spending kept rising despite the easing of its civil war.'
		},
		{
			year: 2006,
			title: 'Commodity-Funded Arms Deals',
			description: 'Algeria signed a $10.5 billion arms contract with Russia as high oil prices funded major procurement across North Africa.',
			context: 'Russia wrote off $4.74 billion in Algerian Soviet-era debt alongside the contract. Angola\u2019s spending kept rising on demobilisation and modernisation programmes running to 2015. Darfur had become one of the continent\u2019s worst crises, though much of the related spending went unreported.'
		},
		{
			year: 2008,
			title: 'Resource-Driven Growth',
			description: 'High commodity prices enable rapid military spending increases across resource-rich Africa.',
			context: 'African military spending rose 5.4 per cent in real terms in 2009. Oil revenues funded modernisation in Algeria, Angola, Nigeria and Libya.'
		},
		{
			year: 2013,
			title: 'Africa Leads Growth',
			description: 'African military expenditure rose 10.2 per cent \u2014 the highest regional increase globally \u2014 with Ghana up 129 per cent and Angola up 36 per cent.',
			context: 'High commodity prices and growing security threats fuelled spending across the continent. The Central African Republic and Mali conflicts also drove increases in neighbouring states.'
		},
		{
			year: 2014,
			title: 'Boko Haram & Instability',
			description: 'The rise of Boko Haram and Sahel insurgencies drive military buildups in West Africa.',
			context: 'Nigeria\'s military spending surged as the government fought Boko Haram in the northeast. Regional coalitions formed to combat cross-border extremist threats.'
		},
		{
			year: 2015,
			title: 'Oil Price Crash',
			description: 'African spending fell 3.6 per cent \u2014 the first decline after years of increases \u2014 as collapsing oil prices forced cuts in Angola, South Sudan and other oil-dependent states.',
			context: 'The sharp fall in oil prices from late 2014 hit African budgets hard. Countries that had funded military modernisation through commodity revenues were forced to reverse course.'
		},
		{
			year: 2022,
			title: 'Sahel Conflicts Deepen',
			description: 'Ongoing conflicts in the Sahel and military coups reshape African defence spending patterns.',
			context: 'African spending fell 1.5 per cent in 2022 amid poor economic performance, then rebounded 24.7 per cent in 2023, boosted by oil revenues and ongoing conflicts in Burkina Faso and elsewhere.'
		},
		{
			year: 2023,
			title: 'Africa Surges',
			description: 'African military expenditure rose 24.7 per cent \u2014 the most significant rise of any region.',
			context: 'Conflicts in the Democratic Republic of the Congo and across the Sahel, combined with recovering oil revenues, drove the increase. Algeria and Nigeria accounted for a large share of the growth.'
		}
	]
};
