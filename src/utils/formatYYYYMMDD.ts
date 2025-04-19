function padTo2Digits(num: number): string {
	return num.toString().padStart(2, "0");
}

export default function formatYYYYMMDD(date: Date): string {
	return `${date.getFullYear()}-${padTo2Digits(date.getMonth() + 1)}-${padTo2Digits(date.getDate())}`;
}
