export interface BaselineRuleConfig {
	asOf: string;
	support: "widely" | "newly";
	overrides?: {
		[feature: string]: OverrideConfig;
	};
}

export interface OverrideConfig {
	support?: "widely" | "newly";
	enabled?: boolean;
}

export type PublicBaselineRuleConfig = Omit<
	Partial<BaselineRuleConfig>,
	"asOf"
> & {
	asOf?: string | Date;
};
