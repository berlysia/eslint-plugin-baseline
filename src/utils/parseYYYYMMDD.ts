class MyDate {
	year: number;
	month: number;
	day: number;

	constructor(year: number, month: number, day: number) {
		this.year = year;
		this.month = month;
		this.day = day;
	}

	nextDay(): MyDate {
		const nextDay = new Date(this.year, this.month - 1, this.day + 1);
		return new MyDate(
			nextDay.getFullYear(),
			nextDay.getMonth() + 1,
			nextDay.getDate(),
		);
	}

	prevDay(): MyDate {
		const prevDay = new Date(this.year, this.month - 1, this.day - 1);
		return new MyDate(
			prevDay.getFullYear(),
			prevDay.getMonth() + 1,
			prevDay.getDate(),
		);
	}

	toString() {
		return `${this.year}-${this.month.toString().padStart(2, "0")}-${this.day
			.toString()
			.padStart(2, "0")}`;
	}
}

export default function parseYYYYMMDD(dateString: string) {
	const [year, month, day] = dateString.split("-").map(Number);
	if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
		throw new TypeError("Invalid date format. Expected YYYY-MM-DD.");
	}
	return new MyDate(year, month, day);
}
