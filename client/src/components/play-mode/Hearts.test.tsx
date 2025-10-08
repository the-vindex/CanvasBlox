import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Hearts } from './Hearts';

describe('Hearts', () => {
    it('renders 3 hearts with full health', () => {
        render(<Hearts health={3} />);

        const container = screen.getByTestId('hearts-container');
        expect(container).toBeInTheDocument();

        const filledHearts = screen.getAllByTestId('heart-filled');
        expect(filledHearts).toHaveLength(3);

        const emptyHearts = screen.queryAllByTestId('heart-empty');
        expect(emptyHearts).toHaveLength(0);
    });

    it('shows correct filled/empty hearts with 2/3 health', () => {
        render(<Hearts health={2} />);

        const filledHearts = screen.getAllByTestId('heart-filled');
        expect(filledHearts).toHaveLength(2);

        const emptyHearts = screen.getAllByTestId('heart-empty');
        expect(emptyHearts).toHaveLength(1);
    });

    it('shows correct filled/empty hearts with 1/3 health', () => {
        render(<Hearts health={1} />);

        const filledHearts = screen.getAllByTestId('heart-filled');
        expect(filledHearts).toHaveLength(1);

        const emptyHearts = screen.getAllByTestId('heart-empty');
        expect(emptyHearts).toHaveLength(2);
    });

    it('shows all empty hearts with 0/3 health', () => {
        render(<Hearts health={0} />);

        const filledHearts = screen.queryAllByTestId('heart-filled');
        expect(filledHearts).toHaveLength(0);

        const emptyHearts = screen.getAllByTestId('heart-empty');
        expect(emptyHearts).toHaveLength(3);
    });

    it('accepts custom maxHealth prop', () => {
        render(<Hearts health={3} maxHealth={5} />);

        const filledHearts = screen.getAllByTestId('heart-filled');
        expect(filledHearts).toHaveLength(3);

        const emptyHearts = screen.getAllByTestId('heart-empty');
        expect(emptyHearts).toHaveLength(2);
    });

    it('has accessible aria labels', () => {
        render(<Hearts health={2} maxHealth={3} />);

        const container = screen.getByRole('status');
        expect(container).toHaveAttribute('aria-label', '2 out of 3 health');
        expect(container).toHaveAttribute('aria-live', 'polite');
    });
});
