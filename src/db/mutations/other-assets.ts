'use server';

import { db } from '@/index';
import { otherAssetsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { getCurrentUserId } from '@/lib/auth';
import { requireOwnership } from '@/lib/ownership';
import { z } from 'zod';
import { parseFormData, zRequiredString, zNumber, zString, zCheckbox } from '@/lib/form-schema';
import { ASSET_TYPES } from '@/lib/other-asset-types';


const otherAssetSchema = z.object({
  name: zRequiredString(),
  asset_type: z.enum(ASSET_TYPES),
  value: zNumber({ min: 0 }),
  weight_grams: zString(),
  is_zakatable: zCheckbox(),
  notes: zString(),
});

function parseOtherAssetForm(formData: FormData) {
  return parseFormData(otherAssetSchema, formData);
}

export async function addOtherAsset(formData: FormData) {
  const userId = await getCurrentUserId();
  const { name, asset_type, value, weight_grams, is_zakatable, notes } = parseOtherAssetForm(formData);

  const parsedWeight = weight_grams ? parseFloat(weight_grams) : null;

  const [result] = await db.insert(otherAssetsTable).values({
    user_id: userId,
    name,
    asset_type,
    value,
    weight_grams: parsedWeight,
    is_zakatable,
    notes: notes || null,
  }).returning({ id: otherAssetsTable.id });

  revalidateDomains('accounts', 'zakat');
  return result;
}

export async function editOtherAsset(id: string, formData: FormData) {
  const userId = await getCurrentUserId();
  await requireOwnership(otherAssetsTable, id, userId, 'asset');

  const { name, asset_type, value, weight_grams, is_zakatable, notes } = parseOtherAssetForm(formData);

  const parsedWeight = weight_grams ? parseFloat(weight_grams) : null;

  await db.update(otherAssetsTable).set({
    name,
    asset_type,
    value,
    weight_grams: parsedWeight,
    is_zakatable,
    notes: notes || null,
    updated_at: new Date(),
  }).where(and(eq(otherAssetsTable.id, id), eq(otherAssetsTable.user_id, userId)));

  revalidateDomains('accounts', 'zakat');
}

export async function deleteOtherAsset(id: string) {
  const userId = await getCurrentUserId();
  await requireOwnership(otherAssetsTable, id, userId, 'asset');
  await db.delete(otherAssetsTable).where(and(eq(otherAssetsTable.id, id), eq(otherAssetsTable.user_id, userId)));
  revalidateDomains('accounts', 'zakat');
}
