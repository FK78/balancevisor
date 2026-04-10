export type NudgeCategory = "save" | "watch" | "celebrate" | "info";

export type Nudge = {
  readonly id: string;
  readonly category: NudgeCategory;
  readonly title: string;
  readonly body: string;
  readonly actionUrl?: string;
  readonly actionLabel?: string;
  readonly priority: number;
  readonly icon: "alert-triangle" | "trending-down" | "piggy-bank" | "party-popper" | "info" | "scissors" | "repeat" | "zap" | "target";
  readonly savingsEstimate?: number;
  readonly dismissible: boolean;
};
