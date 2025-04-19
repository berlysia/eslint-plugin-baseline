import type { BaselineRuleConfig } from "../types.ts";
import isDatePastThreshold from "../utils/isDatePastThreshold.ts";
import { computeBaseline } from "compute-baseline";

export default function checkIsAvailable(
	config: BaselineRuleConfig,
	featureSupport: ReturnType<typeof computeBaseline> | undefined,
) {
	const requiredSupportLevel = config.support;
	const isAvailable =
		featureSupport &&
		isDatePastThreshold(
			config.asOf,
			requiredSupportLevel === "widely"
				? featureSupport.baseline_high_date
				: featureSupport.baseline_low_date,
		);
	return isAvailable;
}
