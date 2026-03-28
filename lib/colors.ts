// A fixed ordered array of 12 distinct, visually pleasing hex colors
export const COLOR_PALETTE = [
  "#3B82F6", // blue-500
  "#EF4444", // red-500
  "#10B981", // emerald-500
  "#F59E0B", // amber-500
  "#8B5CF6", // violet-500
  "#EC4899", // pink-500
  "#06B6D4", // cyan-500
  "#84CC16", // lime-500
  "#F97316", // orange-500
  "#6366F1", // indigo-500
  "#14B8A6", // teal-500
  "#A855F7", // purple-500
];

/**
 * Returns the next unused color from the palette
 * @param usedColors Array of already used color hex strings
 * @returns The next available color from the palette
 */
export function getNextColor(usedColors: string[]): string {
  for (const color of COLOR_PALETTE) {
    if (!usedColors.includes(color)) {
      return color;
    }
  }
  // If all colors are used, start recycling from the beginning
  return COLOR_PALETTE[0];
}