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

// SIPRI Military Expenditure Database (April 2026 update) — constant 2024 USD, billions
// Main regions only, 1992–2025
const raw: YearRow[] = [
	{ year: 1992, Africa: 12.5, Americas: 776.7, 'Asia & Oceania': 156.1, Europe: 380.6, 'Middle East': 77.4 },
	{ year: 1993, Africa: 14.8, Americas: 742.4, 'Asia & Oceania': 159.8, Europe: 354.6, 'Middle East': 73.5 },
	{ year: 1994, Africa: 22.6, Americas: 709.7, 'Asia & Oceania': 160.8, Europe: 347.9, 'Middle East': 69.9 },
	{ year: 1995, Africa: 12.8, Americas: 670.8, 'Asia & Oceania': 165.7, Europe: 324.0, 'Middle East': 66.2 },
	{ year: 1996, Africa: 12.5, Americas: 634.4, 'Asia & Oceania': 169.9, Europe: 322.1, 'Middle East': 66.4 },
	{ year: 1997, Africa: 13.6, Americas: 627.0, 'Asia & Oceania': 176.2, Europe: 323.3, 'Middle East': 73.6 },
	{ year: 1998, Africa: 13.5, Americas: 615.6, 'Asia & Oceania': 176.8, Europe: 313.2, 'Middle East': 78.1 },
	{ year: 1999, Africa: 19.3, Americas: 615.5, 'Asia & Oceania': 187.5, Europe: 318.8, 'Middle East': 75.2 },
	{ year: 2000, Africa: 16.6, Americas: 637.5, 'Asia & Oceania': 191.9, Europe: 328.5, 'Middle East': 80.7 },
	{ year: 2001, Africa: 17.6, Americas: 646.0, 'Asia & Oceania': 203.0, Europe: 331.2, 'Middle East': 83.9 },
	{ year: 2002, Africa: 18.5, Americas: 717.7, 'Asia & Oceania': 212.9, Europe: 339.2, 'Middle East': 81.0 },
	{ year: 2003, Africa: 18.5, Americas: 806.3, 'Asia & Oceania': 222.2, Europe: 346.9, 'Middle East': 81.7 },
	{ year: 2004, Africa: 19.4, Americas: 875.6, 'Asia & Oceania': 236.4, Europe: 351.4, 'Middle East': 89.1 },
	{ year: 2005, Africa: 20.8, Americas: 916.6, 'Asia & Oceania': 248.5, Europe: 355.7, 'Middle East': 99.1 },
	{ year: 2006, Africa: 21.9, Americas: 931.3, 'Asia & Oceania': 263.1, Europe: 361.3, 'Middle East': 107.3 },
	{ year: 2007, Africa: 22.9, Americas: 960.2, 'Asia & Oceania': 279.4, Europe: 371.0, 'Middle East': 118.4 },
	{ year: 2008, Africa: 25.9, Americas: 1030.3, 'Asia & Oceania': 296.9, Europe: 380.9, 'Middle East': 118.1 },
	{ year: 2009, Africa: 27.3, Americas: 1110.4, 'Asia & Oceania': 335.9, Europe: 386.4, 'Middle East': 120.1 },
	{ year: 2010, Africa: 29.1, Americas: 1141.2, 'Asia & Oceania': 343.9, Europe: 378.9, 'Middle East': 123.1 },
	{ year: 2011, Africa: 32.5, Americas: 1128.8, 'Asia & Oceania': 356.4, Europe: 372.1, 'Middle East': 126.1 },
	{ year: 2012, Africa: 33.8, Americas: 1071.4, 'Asia & Oceania': 374.3, Europe: 375.8, 'Middle East': 140.8 },
	{ year: 2013, Africa: 37.2, Americas: 996.5, 'Asia & Oceania': 391.5, Europe: 368.9, 'Middle East': 153.9 },
	{ year: 2014, Africa: 39.4, Americas: 943.4, 'Asia & Oceania': 411.9, Europe: 371.8, 'Middle East': 169.7 },
	{ year: 2015, Africa: 38.0, Americas: 924.2, 'Asia & Oceania': 437.2, Europe: 381.4, 'Middle East': 180.1 },
	{ year: 2016, Africa: 37.6, Americas: 919.8, 'Asia & Oceania': 458.1, Europe: 392.3, 'Middle East': 153.9 },
	{ year: 2017, Africa: 36.2, Americas: 917.2, 'Asia & Oceania': 478.9, Europe: 384.8, 'Middle East': 165.9 },
	{ year: 2018, Africa: 35.6, Americas: 943.7, 'Asia & Oceania': 497.6, Europe: 394.7, 'Middle East': 173.0 },
	{ year: 2019, Africa: 36.9, Americas: 992.0, 'Asia & Oceania': 522.8, Europe: 414.9, 'Middle East': 164.9 },
	{ year: 2020, Africa: 38.7, Americas: 1039.3, 'Asia & Oceania': 538.1, Europe: 437.4, 'Middle East': 156.2 },
	{ year: 2021, Africa: 38.8, Americas: 1026.5, 'Asia & Oceania': 553.6, Europe: 451.8, 'Middle East': 157.1 },
	{ year: 2022, Africa: 38.2, Americas: 1014.5, 'Asia & Oceania': 565.0, Europe: 515.4, 'Middle East': 166.2 },
	{ year: 2023, Africa: 47.6, Americas: 1039.8, 'Asia & Oceania': 592.8, Europe: 591.5, 'Middle East': 181.8 },
	{ year: 2024, Africa: 50.3, Americas: 1112.5, 'Asia & Oceania': 627.2, Europe: 693.8, 'Middle East': 208.5 },
	{ year: 2025, Africa: 54.6, Americas: 1038.8, 'Asia & Oceania': 677.6, Europe: 791.5, 'Middle East': 208.8 }
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
