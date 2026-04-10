export const ASSET_TYPES = [
  'gold',
  'silver',
  'property',
  'pension',
  'vehicle',
  'collectible',
  'business',
  'cash',
  'other',
] as const;

export type AssetType = (typeof ASSET_TYPES)[number];

const ZAKATABLE_BY_DEFAULT: ReadonlySet<string> = new Set([
  'gold',
  'silver',
  'cash',
  'business',
]);

export function isZakatableByDefault(assetType: string): boolean {
  return ZAKATABLE_BY_DEFAULT.has(assetType);
}
