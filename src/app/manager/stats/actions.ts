"use server";

export async function getSubscriptionCountsForMenuItems(
  menuItemIds: string[],
): Promise<Record<string, number>> {
  // TODO: Implement this
  return Object.fromEntries(menuItemIds.map((id) => [id, 0]));
}
