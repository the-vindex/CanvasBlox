import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

global.localStorage = localStorageMock as any;

// Mock HTMLCanvasElement.getContext for canvas tests
HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
    if (contextType === '2d') {
        return {
            canvas: { width: 800, height: 600 },
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            globalAlpha: 1,
            shadowColor: '',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            textAlign: '',
            textBaseline: '',
            font: '',
            fillRect: vi.fn(),
            strokeRect: vi.fn(),
            clearRect: vi.fn(),
            beginPath: vi.fn(),
            closePath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            arc: vi.fn(),
            ellipse: vi.fn(),
            stroke: vi.fn(),
            fill: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
            translate: vi.fn(),
            rotate: vi.fn(),
            scale: vi.fn(),
            fillText: vi.fn(),
            strokeText: vi.fn(),
            setLineDash: vi.fn(),
            createLinearGradient: vi.fn(() => ({
                addColorStop: vi.fn(),
            })),
            createRadialGradient: vi.fn(() => ({
                addColorStop: vi.fn(),
            })),
            getImageData: vi.fn(() => ({
                data: new Uint8ClampedArray(400 * 4), // 100x100 pixels
            })),
        } as any;
    }
    return null;
}) as any;
