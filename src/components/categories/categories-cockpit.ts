import type { CategoryWithColor } from "@/lib/types";
import type { MonthlyCategorySpendPoint } from "@/db/queries/transactions";

type TopSpendCategory = {
  readonly category: string;
  readonly color: string;
  readonly total: number;
};

type CategorisationRule = {
  readonly id: string;
  readonly pattern: string;
  readonly category_id: string | null;
  readonly categoryName: string | null;
  readonly categoryColor: string | null;
  readonly priority: number;
};

type PrimaryActionKey = "add-rule" | "add-category";

type CategoriesPrimaryAction = {
  readonly key: PrimaryActionKey;
  readonly label: string;
  readonly description: string;
};

type CategoriesPriorityCard = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly eyebrow?: string;
};

export type CategoriesCockpitModel = {
  readonly heroTitle: string;
  readonly heroDescription: string;
  readonly primaryAction: CategoriesPrimaryAction;
  readonly priorityCards: readonly CategoriesPriorityCard[];
};

type BuildCategoriesCockpitModelParams = {
  readonly categories: readonly CategoryWithColor[];
  readonly topSpendByCategory: readonly TopSpendCategory[];
  readonly monthlySpendRows: readonly MonthlyCategorySpendPoint[];
  readonly rules: readonly CategorisationRule[];
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function formatWholePercent(value: number) {
  return `${Math.round(value)}%`;
}

function getCoverageMetrics(
  categories: readonly CategoryWithColor[],
  topSpendByCategory: readonly TopSpendCategory[],
  rules: readonly CategorisationRule[],
) {
  const activeIds = new Set(
    topSpendByCategory
      .map((entry) => categories.find((category) => category.name === entry.category)?.id ?? null)
      .filter((value): value is string => value !== null),
  );

  const relevantIds = activeIds.size > 0
    ? activeIds
    : new Set(categories.map((category) => category.id));

  const coveredIds = new Set(
    rules
      .map((rule) => rule.category_id)
      .filter((value): value is string => value !== null && relevantIds.has(value)),
  );

  const total = relevantIds.size;
  const covered = coveredIds.size;
  const ratio = total > 0 ? covered / total : 0;

  return {
    total,
    covered,
    ratio,
    gapScore: total > 0 ? 1 - ratio : 0,
  };
}

function getConcentrationMetrics(topSpendByCategory: readonly TopSpendCategory[]) {
  const sorted = [...topSpendByCategory].sort((left, right) => right.total - left.total);
  const total = sorted.reduce((sum, row) => sum + row.total, 0);
  const largest = sorted[0] ?? null;
  const share = total > 0 && largest ? largest.total / total : 0;

  return {
    total,
    largest,
    share,
    score: clamp((share - 0.34) / 0.36),
  };
}

function getCategoryDepthGap(categoryCount: number) {
  if (categoryCount === 0) {
    return 1;
  }

  return clamp((4 - categoryCount) / 4);
}

function getMovementMetrics(monthlySpendRows: readonly MonthlyCategorySpendPoint[]) {
  const rowsByCategory = new Map<string, MonthlyCategorySpendPoint[]>();

  for (const row of monthlySpendRows) {
    const current = rowsByCategory.get(row.category_id) ?? [];
    current.push(row);
    rowsByCategory.set(row.category_id, current);
  }

  const movements = Array.from(rowsByCategory.values())
    .map((rows) => [...rows].sort((left, right) => left.month.localeCompare(right.month)))
    .map((rows) => {
      const latest = rows.at(-1) ?? null;
      const previous = rows.at(-2) ?? null;
      if (!latest || !previous) {
        return null;
      }

      const delta = latest.total - previous.total;
      const baseline = Math.max(previous.total, 1);
      return {
        category: latest.category,
        latestTotal: latest.total,
        previousTotal: previous.total,
        delta,
        score: Math.abs(delta) / baseline,
      };
    })
    .filter((value): value is NonNullable<typeof value> => value !== null)
    .sort((left, right) => right.score - left.score);

  return movements[0] ?? null;
}

function selectPrimaryAction(params: {
  categoryCount: number;
  ruleCoverageGap: number;
  categoryDepthGap: number;
}): CategoriesPrimaryAction {
  if (params.categoryCount === 0) {
    return {
      key: "add-category",
      label: "Add category",
      description: "Start with the core categories that describe how your spending is shaped.",
    };
  }

  if (params.ruleCoverageGap > params.categoryDepthGap) {
    return {
      key: "add-rule",
      label: "Add rule",
      description: "Close the biggest automation gap so more transactions land in the right structure.",
    };
  }

  return {
    key: "add-category",
    label: "Add category",
    description: "Broaden the structure before adding more maintenance around it.",
  };
}

function buildHeroCopy(params: {
  categoryCount: number;
  primaryAction: CategoriesPrimaryAction;
  concentrationShare: number;
  largestCategoryName: string | null;
  coverageTotal: number;
  coverageCovered: number;
  movement: ReturnType<typeof getMovementMetrics>;
}) {
  if (params.categoryCount === 0) {
    return {
      heroTitle: "Build your category structure first",
      heroDescription:
        "Start with a few categories that match how you actually spend, then layer automation on once the structure feels believable.",
    };
  }

  if (
    params.movement &&
    params.movement.score >= 0.35 &&
    params.primaryAction.key !== "add-rule"
  ) {
    const direction = params.movement.delta >= 0 ? "up" : "down";
    return {
      heroTitle: `${params.movement.category} is moving the shape of spend`,
      heroDescription: `${params.movement.category} moved ${direction} month over month, so review whether that shift deserves a structural tweak before you jump into maintenance.`,
    };
  }

  if (params.primaryAction.key === "add-rule" && params.coverageTotal > 0) {
    const uncovered = params.coverageTotal - params.coverageCovered;
    return {
      heroTitle: "Rule coverage is the clearest gap in your structure",
      heroDescription:
        uncovered === 1
          ? "One active category still lacks rule coverage, so the next useful move is teaching the system that pattern."
          : `${uncovered} active categories still lack rule coverage, so automation is the fastest way to make this structure feel dependable.`,
    };
  }

  if (params.largestCategoryName && params.concentrationShare >= 0.45) {
    return {
      heroTitle: `${params.largestCategoryName} is carrying a single-category story`,
      heroDescription: `${params.largestCategoryName} currently makes up ${formatWholePercent(params.concentrationShare * 100)} of tracked spend, so it may be time to add more structure around the next layer down.`,
    };
  }

  return {
    heroTitle: "Your spending structure looks readable",
    heroDescription:
      "The current categories are doing their job, so use the charts and category cards below to keep the shape of spending easy to read.",
  };
}

function buildPriorityCards(params: {
  categories: readonly CategoryWithColor[];
  coverage: ReturnType<typeof getCoverageMetrics>;
  concentration: ReturnType<typeof getConcentrationMetrics>;
  movement: ReturnType<typeof getMovementMetrics>;
}) {
  const cards: CategoriesPriorityCard[] = [
    {
      id: "rule-coverage",
      eyebrow: "Automation quality",
      title:
        params.coverage.total > 0
          ? `${params.coverage.covered}/${params.coverage.total} active categories covered by rules`
          : "Rule coverage will appear once categories are active",
      description:
        params.coverage.total > 0
          ? "Use rules to reduce clean-up work after you understand the spending shape."
          : "Rules stay secondary until the category structure has something to support.",
    },
    {
      id: "category-depth",
      eyebrow: "Structure depth",
      title:
        params.categories.length > 0
          ? `${params.categories.length} categories are carrying the current structure`
          : "No categories are carrying the structure yet",
      description:
        params.concentration.largest && params.concentration.share >= 0.45
          ? `${params.concentration.largest.category} alone accounts for ${formatWholePercent(params.concentration.share * 100)} of tracked spend.`
          : "A broader category set makes the overall spend story easier to trust.",
    },
    {
      id: "category-movement",
      eyebrow: "Movement",
      title: params.movement
        ? `${params.movement.category} changed ${formatWholePercent((params.movement.delta / Math.max(params.movement.previousTotal, 1)) * 100)} month over month`
        : "Movement signals will appear as monthly history fills in",
      description: params.movement
        ? "Month-over-month shifts help you spot when the structure needs a closer read."
        : "Once two months of spend exist for a category, this card becomes the quickest structure pulse.",
    },
  ];

  return [...cards].sort((left, right) => {
    const scoreById = new Map<string, number>([
      ["rule-coverage", params.coverage.gapScore],
      [
        "category-depth",
        Math.max(getCategoryDepthGap(params.categories.length), params.concentration.score),
      ],
      ["category-movement", params.movement?.score ?? 0],
    ]);

    return (scoreById.get(right.id) ?? 0) - (scoreById.get(left.id) ?? 0);
  });
}

export function buildCategoriesCockpitModel(
  params: BuildCategoriesCockpitModelParams,
): CategoriesCockpitModel {
  const coverage = getCoverageMetrics(params.categories, params.topSpendByCategory, params.rules);
  const concentration = getConcentrationMetrics(params.topSpendByCategory);
  const movement = getMovementMetrics(params.monthlySpendRows);
  const categoryDepthGap = getCategoryDepthGap(params.categories.length);

  const primaryAction = selectPrimaryAction({
    categoryCount: params.categories.length,
    ruleCoverageGap: coverage.gapScore,
    categoryDepthGap,
  });

  const hero = buildHeroCopy({
    categoryCount: params.categories.length,
    primaryAction,
    concentrationShare: concentration.share,
    largestCategoryName: concentration.largest?.category ?? null,
    coverageTotal: coverage.total,
    coverageCovered: coverage.covered,
    movement,
  });

  return {
    heroTitle: hero.heroTitle,
    heroDescription: hero.heroDescription,
    primaryAction,
    priorityCards: buildPriorityCards({
      categories: params.categories,
      coverage,
      concentration,
      movement,
    }),
  };
}
