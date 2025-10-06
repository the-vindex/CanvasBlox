import type { InteractableObject } from '@/types/level';

/**
 * Get the maximum button number from all buttons in the level
 */
export function getMaxButtonNumber(objects: InteractableObject[]): number {
    const buttonNumbers = objects
        .filter((obj) => obj.type === 'button' && obj.properties.buttonNumber !== undefined)
        .map((obj) => obj.properties.buttonNumber as number);

    return buttonNumbers.length > 0 ? Math.max(...buttonNumbers) : 0;
}

/**
 * Assign a new button number (max + 1)
 */
export function assignButtonNumber(objects: InteractableObject[]): number {
    return getMaxButtonNumber(objects) + 1;
}

/**
 * Calculate luminance from RGB values (0-255 range)
 * Formula: 0.299*R + 0.587*G + 0.114*B
 * Returns value between 0 (black) and 1 (white)
 */
export function calculateLuminance(r: number, g: number, b: number): number {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    return 0.299 * rNorm + 0.587 * gNorm + 0.114 * bNorm;
}

/**
 * Get badge color scheme based on background luminance
 * Returns appropriate colors for maximum contrast
 */
export function getBadgeColorScheme(luminance: number): {
    text: string;
    bg: string;
    opacity: number;
} {
    if (luminance < 0.5) {
        // Dark background - use light badge
        return {
            text: '#ffffff',
            bg: '#000000',
            opacity: 0.7,
        };
    }
    // Light background - use dark badge
    return {
        text: '#000000',
        bg: '#ffffff',
        opacity: 0.8,
    };
}

/**
 * Get all buttons that link to a specific door
 * Only returns buttons (not other object types like levers)
 */
export function getButtonsLinkingToDoor(door: InteractableObject, objects: InteractableObject[]): InteractableObject[] {
    return objects.filter((obj) => obj.type === 'button' && obj.properties.linkedObjects?.includes(door.id));
}

/**
 * Validate button number is in valid range (1-99, integer)
 */
export function validateButtonNumber(num: number): boolean {
    return Number.isInteger(num) && num >= 1 && num <= 99;
}
