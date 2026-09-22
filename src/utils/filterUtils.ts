/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Mathematically scales CSS filter properties by intensity percentage (0 - 100)
 */
export function computeFilteredCss(baseCss: string, intensityPercent: number = 100): string {
  if (!baseCss || baseCss === 'none' || intensityPercent === 100) {
    return baseCss || 'none';
  }

  const factor = Math.max(0, Math.min(1, intensityPercent / 100));

  // If factor is 0, completely neutral
  if (factor === 0) return 'none';

  return baseCss.replace(/([a-zA-Z-]+)\(([^)]+)\)/g, (match, filterName, valueStr) => {
    const trimmedVal = valueStr.trim();
    if (trimmedVal.endsWith('%')) {
      const val = parseFloat(trimmedVal);
      // For contrast, saturate, brightness: neutral base value is 100%
      if (['contrast', 'saturate', 'brightness'].includes(filterName)) {
        const adjusted = 100 + (val - 100) * factor;
        return `${filterName}(${Math.round(adjusted)}%)`;
      } else {
        // For grayscale, sepia, invert: neutral base value is 0%
        const adjusted = val * factor;
        return `${filterName}(${Math.round(adjusted)}%)`;
      }
    } else if (trimmedVal.endsWith('deg')) {
      // hue-rotate: neutral is 0deg
      const val = parseFloat(trimmedVal);
      return `${filterName}(${Math.round(val * factor)}deg)`;
    } else if (trimmedVal.endsWith('px')) {
      // blur: neutral is 0px
      const val = parseFloat(trimmedVal);
      return `${filterName}(${(val * factor).toFixed(1)}px)`;
    }
    return match;
  });
}
