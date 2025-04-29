import type { computeBaseline } from "compute-baseline";
import type { BaselineRuleConfig } from "../types.ts";
import isDatePastThreshold from "./isDatePastThreshold.ts";

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
	return Boolean(isAvailable);
}
