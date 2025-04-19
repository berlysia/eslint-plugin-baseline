/**
 *
 * @param target - The date to check against. YYYY-MM-DD format.
 * @param threshold - The date should be past. YYYY-MM-DD format.
 */
export default function isDatePastThreshold(
	current: string,
	threshold?: string | null | undefined,
): boolean {
	if (!threshold) {
		return false;
	}

	const currentDate = new Date(current);
	const thresholdDate = new Date(threshold);

	return currentDate >= thresholdDate;
}
