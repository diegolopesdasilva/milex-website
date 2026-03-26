export const regions = [
	'Americas',
	'Europe',
	'Asia & Oceania',
	'Middle East',
	'Africa'
] as const;

export type Region = (typeof regions)[number];

export interface YearRow {
	year: number;
	[region: string]: number;
}

// SIPRI Military Expenditure Database — constant 2023 USD, billions
// Main regions only, 1992–2024
const raw: YearRow[] = [
	{ year: 1992, Africa: 16.8, Americas: 755.5, 'Asia & Oceania': 156.1, Europe: 375.3, 'Middle East': 84.4 },
	{ year: 1993, Africa: 19.3, Americas: 722.2, 'Asia & Oceania': 159.7, Europe: 344.4, 'Middle East': 79.6 },
	{ year: 1994, Africa: 26.1, Americas: 690.6, 'Asia & Oceania': 160.8, Europe: 337.9, 'Middle East': 76.1 },
	{ year: 1995, Africa: 15.9, Americas: 652.9, 'Asia & Oceania': 165.7, Europe: 313.5, 'Middle East': 72.7 },
	{ year: 1996, Africa: 15.1, Americas: 617.3, 'Asia & Oceania': 170.0, Europe: 310.9, 'Middle East': 72.9 },
	{ year: 1997, Africa: 16.1, Americas: 610.3, 'Asia & Oceania': 176.3, Europe: 314.0, 'Middle East': 79.8 },
	{ year: 1998, Africa: 18.0, Americas: 599.2, 'Asia & Oceania': 176.8, Europe: 303.8, 'Middle East': 85.6 },
	{ year: 1999, Africa: 25.7, Americas: 599.1, 'Asia & Oceania': 186.5, Europe: 309.3, 'Middle East': 83.1 },
	{ year: 2000, Africa: 24.9, Americas: 620.3, 'Asia & Oceania': 191.9, Europe: 319.1, 'Middle East': 91.9 },
	{ year: 2001, Africa: 24.0, Americas: 628.6, 'Asia & Oceania': 203.0, Europe: 321.9, 'Middle East': 94.7 },
	{ year: 2002, Africa: 27.8, Americas: 698.3, 'Asia & Oceania': 213.0, Europe: 329.5, 'Middle East': 90.6 },
	{ year: 2003, Africa: 24.3, Americas: 784.2, 'Asia & Oceania': 222.2, Europe: 337.0, 'Middle East': 92.1 },
	{ year: 2004, Africa: 30.0, Americas: 851.5, 'Asia & Oceania': 236.1, Europe: 341.3, 'Middle East': 98.4 },
	{ year: 2005, Africa: 29.7, Americas: 891.4, 'Asia & Oceania': 248.1, Europe: 345.5, 'Middle East': 107.1 },
	{ year: 2006, Africa: 31.7, Americas: 905.8, 'Asia & Oceania': 262.5, Europe: 351.1, 'Middle East': 114.7 },
	{ year: 2007, Africa: 33.7, Americas: 933.9, 'Asia & Oceania': 278.5, Europe: 360.5, 'Middle East': 126.6 },
	{ year: 2008, Africa: 39.6, Americas: 1002.0, 'Asia & Oceania': 296.1, Europe: 370.2, 'Middle East': 129.0 },
	{ year: 2009, Africa: 40.1, Americas: 1079.9, 'Asia & Oceania': 334.4, Europe: 375.5, 'Middle East': 133.4 },
	{ year: 2010, Africa: 41.3, Americas: 1110.0, 'Asia & Oceania': 343.0, Europe: 368.0, 'Middle East': 140.9 },
	{ year: 2011, Africa: 45.2, Americas: 1098.0, 'Asia & Oceania': 355.1, Europe: 361.6, 'Middle East': 146.4 },
	{ year: 2012, Africa: 44.8, Americas: 1042.2, 'Asia & Oceania': 371.6, Europe: 364.8, 'Middle East': 160.2 },
	{ year: 2013, Africa: 47.7, Americas: 969.3, 'Asia & Oceania': 388.4, Europe: 358.6, 'Middle East': 178.8 },
	{ year: 2014, Africa: 49.4, Americas: 915.9, 'Asia & Oceania': 409.3, Europe: 362.2, 'Middle East': 192.6 },
	{ year: 2015, Africa: 46.5, Americas: 898.8, 'Asia & Oceania': 434.3, Europe: 371.5, 'Middle East': 204.1 },
	{ year: 2016, Africa: 44.6, Americas: 895.2, 'Asia & Oceania': 455.8, Europe: 383.1, 'Middle East': 178.7 },
	{ year: 2017, Africa: 44.0, Americas: 893.4, 'Asia & Oceania': 476.5, Europe: 375.6, 'Middle East': 190.9 },
	{ year: 2018, Africa: 40.6, Americas: 919.6, 'Asia & Oceania': 495.2, Europe: 384.8, 'Middle East': 198.7 },
	{ year: 2019, Africa: 41.1, Americas: 966.4, 'Asia & Oceania': 520.0, Europe: 405.1, 'Middle East': 191.8 },
	{ year: 2020, Africa: 42.3, Americas: 1010.6, 'Asia & Oceania': 538.3, Europe: 427.4, 'Middle East': 181.7 },
	{ year: 2021, Africa: 44.4, Americas: 999.1, 'Asia & Oceania': 554.1, Europe: 441.2, 'Middle East': 183.8 },
	{ year: 2022, Africa: 42.5, Americas: 987.1, 'Asia & Oceania': 566.7, Europe: 505.0, 'Middle East': 193.3 },
	{ year: 2023, Africa: 50.2, Americas: 1009.6, 'Asia & Oceania': 595.0, Europe: 581.6, 'Middle East': 211.2 },
	{ year: 2024, Africa: 51.7, Americas: 1068.4, 'Asia & Oceania': 632.2, Europe: 680.7, 'Middle East': 243.5 }
];

export function getPivotedData(): YearRow[] {
	return raw;
}

export const regionColors: Record<string, string> = {
	Americas: '#567B57',
	Europe: '#A9BDA1',
	'Asia & Oceania': '#EEC7A3',
	'Middle East': '#DD9D7C',
	Africa: '#D24C4A'
};
