interface HeartsProps {
    health: number;
    maxHealth?: number;
}

/**
 * Hearts UI component - Displays player health as heart icons.
 * Shows filled hearts for current health and empty hearts for lost health.
 */
export function Hearts({ health, maxHealth = 3 }: HeartsProps) {
    const hearts = [];

    for (let i = 0; i < maxHealth; i++) {
        const isFilled = i < health;
        hearts.push(
            <span
                key={i}
                data-testid={isFilled ? 'heart-filled' : 'heart-empty'}
                className={`text-2xl ${isFilled ? 'text-red-500' : 'text-gray-600'}`}
            >
                {isFilled ? '❤️' : '🤍'}
            </span>
        );
    }

    return (
        <output
            data-testid="hearts-container"
            className="flex gap-2 absolute top-4 left-4 pointer-events-none z-50"
            aria-live="polite"
            aria-label={`${health} out of ${maxHealth} health`}
        >
            {hearts}
        </output>
    );
}
