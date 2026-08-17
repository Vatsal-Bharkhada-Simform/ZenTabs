/**
 * Deterministic tag color palette — muted, low-saturation dusty pastels.
 * Backgrounds are near-white tints; text is a grayed version of the same hue.
 * Colors are derived from the tag name's hash so they are always consistent.
 */

const TAG_PALETTES = [
  { bg: "#F5F3FF", text: "#6B69A0", border: "#DDD6FE" }, // dusty indigo
  { bg: "#FFFBEB", text: "#92724D", border: "#F3D99A" }, // warm amber
  { bg: "#F0FDF4", text: "#4B7460", border: "#C8EDD8" }, // sage green
  { bg: "#FEF2F2", text: "#9F6060", border: "#FDD5D5" }, // dusty rose
  { bg: "#EFF8FF", text: "#476B8A", border: "#C3D9EE" }, // steel blue
  { bg: "#FAF5FF", text: "#7C6B96", border: "#E8DCFA" }, // dusty lilac
  { bg: "#FFF7ED", text: "#8B6040", border: "#F5CEAC" }, // warm copper
  { bg: "#F0FEFA", text: "#417D78", border: "#C5EDE9" }, // dusty teal
  { bg: "#FDF4FF", text: "#8B6BA3", border: "#EAD8F5" }, // warm mauve
  { bg: "#FAFDF0", text: "#637044", border: "#D6ECA8" }, // olive
  { bg: "#F8FAFC", text: "#64748B", border: "#DDE4EC" }, // cool slate
  { bg: "#FFF5F5", text: "#9E6565", border: "#FAD4D4" }, // dusty coral
  { bg: "#F7FEE7", text: "#586B35", border: "#D2ECA0" }, // mossy
  { bg: "#F1F5F9", text: "#566376", border: "#DAEAF6" }, // dusty ocean
  { bg: "#FEFCE8", text: "#7A6B3A", border: "#EEE195" }, // warm sand
  { bg: "#FFF1F2", text: "#9F6E72", border: "#F9D4D6" }, // blush
  { bg: "#EEF2FF", text: "#6672A0", border: "#C8D0EE" }, // periwinkle
  { bg: "#F5F5F4", text: "#68635E", border: "#E4E1DF" }, // warm stone
  { bg: "#F0F9FF", text: "#4B7896", border: "#C0D9EE" }, // sky mist
  { bg: "#FFFBF5", text: "#8A6B50", border: "#EDD9C4" }, // warm parchment
] as const;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash | 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export function getTagColor(name: string) {
  return TAG_PALETTES[hashString(name) % TAG_PALETTES.length];
}
