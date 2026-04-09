/**
 * Minimal class-variance-authority replacement.
 * Supports base classes, variants, and defaultVariants — the only
 * features used in this project (button.tsx + badge.tsx).
 */

type ClassValue = string | undefined | null | false;

type VariantConfig = Record<string, Record<string, string>>;

interface CvaConfig<V extends VariantConfig> {
  variants?: V;
  defaultVariants?: { [K in keyof V]?: keyof V[K] };
}

type CvaFn<V extends VariantConfig> = (
  props?: { [K in keyof V]?: keyof V[K] | null } & { className?: ClassValue },
) => string;

export function cva<V extends VariantConfig>(
  base: string,
  config?: CvaConfig<V>,
): CvaFn<V> {
  return (props) => {
    const classes: string[] = [base];

    if (config?.variants) {
      for (const key of Object.keys(config.variants) as (keyof V)[]) {
        const selected =
          (props?.[key] as string | undefined | null) ??
          (config.defaultVariants?.[key] as string | undefined);
        if (selected && config.variants[key]?.[selected]) {
          classes.push(config.variants[key][selected]);
        }
      }
    }

    if (props?.className) {
      classes.push(props.className as string);
    }

    return classes.filter(Boolean).join(" ");
  };
}

/**
 * Extracts the variant props type from a cva return value.
 * Usage: `type Props = VariantProps<typeof myVariants>`
 */
export type VariantProps<T extends (...args: never[]) => string> =
  T extends CvaFn<infer V>
    ? { [K in keyof V]?: keyof V[K] | null }
    : never;
