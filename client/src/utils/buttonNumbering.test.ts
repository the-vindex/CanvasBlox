import { describe, expect, it } from 'vitest';
import type { InteractableObject } from '@/types/level';
import {
    assignButtonNumber,
    calculateLuminance,
    getBadgeColorScheme,
    getButtonsLinkingToDoor,
    getMaxButtonNumber,
    validateButtonNumber,
} from './buttonNumbering';

describe('buttonNumbering', () => {
    describe('getMaxButtonNumber', () => {
        it('returns 0 when no buttons exist', () => {
            const objects: InteractableObject[] = [];
            expect(getMaxButtonNumber(objects)).toBe(0);
        });

        it('returns 0 when no buttons have numbers', () => {
            const objects: InteractableObject[] = [
                {
                    id: '1',
                    type: 'button',
                    position: { x: 0, y: 0 },
                    dimensions: { width: 1, height: 1 },
                    rotation: 0,
                    layer: 1,
                    properties: { interactable: true },
                },
            ];
            expect(getMaxButtonNumber(objects)).toBe(0);
        });

        it('returns max button number from all buttons', () => {
            const objects: InteractableObject[] = [
                {
                    id: '1',
                    type: 'button',
                    position: { x: 0, y: 0 },
                    dimensions: { width: 1, height: 1 },
                    rotation: 0,
                    layer: 1,
                    properties: { interactable: true, buttonNumber: 1 },
                },
                {
                    id: '2',
                    type: 'button',
                    position: { x: 1, y: 0 },
                    dimensions: { width: 1, height: 1 },
                    rotation: 0,
                    layer: 1,
                    properties: { interactable: true, buttonNumber: 5 },
                },
                {
                    id: '3',
                    type: 'button',
                    position: { x: 2, y: 0 },
                    dimensions: { width: 1, height: 1 },
                    rotation: 0,
                    layer: 1,
                    properties: { interactable: true, buttonNumber: 3 },
                },
            ];
            expect(getMaxButtonNumber(objects)).toBe(5);
        });

        it('ignores non-button objects', () => {
            const objects: InteractableObject[] = [
                {
                    id: '1',
                    type: 'door',
                    position: { x: 0, y: 0 },
                    dimensions: { width: 1, height: 1 },
                    rotation: 0,
                    layer: 1,
                    properties: { interactable: true },
                },
                {
                    id: '2',
                    type: 'button',
                    position: { x: 1, y: 0 },
                    dimensions: { width: 1, height: 1 },
                    rotation: 0,
                    layer: 1,
                    properties: { interactable: true, buttonNumber: 2 },
                },
            ];
            expect(getMaxButtonNumber(objects)).toBe(2);
        });
    });

    describe('assignButtonNumber', () => {
        it('assigns 1 when no buttons exist', () => {
            const objects: InteractableObject[] = [];
            expect(assignButtonNumber(objects)).toBe(1);
        });

        it('assigns max + 1', () => {
            const objects: InteractableObject[] = [
                {
                    id: '1',
                    type: 'button',
                    position: { x: 0, y: 0 },
                    dimensions: { width: 1, height: 1 },
                    rotation: 0,
                    layer: 1,
                    properties: { interactable: true, buttonNumber: 3 },
                },
            ];
            expect(assignButtonNumber(objects)).toBe(4);
        });
    });

    describe('calculateLuminance', () => {
        it('calculates luminance for black (0, 0, 0)', () => {
            expect(calculateLuminance(0, 0, 0)).toBe(0);
        });

        it('calculates luminance for white (255, 255, 255)', () => {
            expect(calculateLuminance(255, 255, 255)).toBeCloseTo(1, 2);
        });

        it('calculates luminance for red (255, 0, 0)', () => {
            const luminance = calculateLuminance(255, 0, 0);
            expect(luminance).toBeCloseTo(0.299, 2);
        });

        it('calculates luminance for green (0, 255, 0)', () => {
            const luminance = calculateLuminance(0, 255, 0);
            expect(luminance).toBeCloseTo(0.587, 2);
        });

        it('calculates luminance for blue (0, 0, 255)', () => {
            const luminance = calculateLuminance(0, 0, 255);
            expect(luminance).toBeCloseTo(0.114, 2);
        });

        it('calculates luminance for gray (128, 128, 128)', () => {
            const luminance = calculateLuminance(128, 128, 128);
            expect(luminance).toBeCloseTo(0.502, 2);
        });
    });

    describe('getBadgeColorScheme', () => {
        it('uses light scheme for dark backgrounds (luminance < 0.5)', () => {
            const scheme = getBadgeColorScheme(0.3);
            expect(scheme.text).toBe('#ffffff');
            expect(scheme.bg).toBe('#000000');
            expect(scheme.opacity).toBe(0.7);
        });

        it('uses dark scheme for light backgrounds (luminance >= 0.5)', () => {
            const scheme = getBadgeColorScheme(0.7);
            expect(scheme.text).toBe('#000000');
            expect(scheme.bg).toBe('#ffffff');
            expect(scheme.opacity).toBe(0.8);
        });

        it('uses dark scheme at exact threshold (0.5)', () => {
            const scheme = getBadgeColorScheme(0.5);
            expect(scheme.text).toBe('#000000');
            expect(scheme.bg).toBe('#ffffff');
            expect(scheme.opacity).toBe(0.8);
        });
    });

    describe('getButtonsLinkingToDoor', () => {
        it('returns empty array when no buttons link to door', () => {
            const door: InteractableObject = {
                id: 'door1',
                type: 'door',
                position: { x: 0, y: 0 },
                dimensions: { width: 1, height: 1 },
                rotation: 0,
                layer: 1,
                properties: { interactable: true },
            };
            const objects: InteractableObject[] = [
                {
                    id: 'btn1',
                    type: 'button',
                    position: { x: 1, y: 0 },
                    dimensions: { width: 1, height: 1 },
                    rotation: 0,
                    layer: 1,
                    properties: { interactable: true, buttonNumber: 1 },
                },
            ];
            expect(getButtonsLinkingToDoor(door, objects)).toEqual([]);
        });

        it('returns buttons that link to door via linkedObjects', () => {
            const door: InteractableObject = {
                id: 'door1',
                type: 'door',
                position: { x: 0, y: 0 },
                dimensions: { width: 1, height: 1 },
                rotation: 0,
                layer: 1,
                properties: { interactable: true },
            };
            const objects: InteractableObject[] = [
                {
                    id: 'btn1',
                    type: 'button',
                    position: { x: 1, y: 0 },
                    dimensions: { width: 1, height: 1 },
                    rotation: 0,
                    layer: 1,
                    properties: { interactable: true, buttonNumber: 1, linkedObjects: ['door1'] },
                },
                {
                    id: 'btn2',
                    type: 'button',
                    position: { x: 2, y: 0 },
                    dimensions: { width: 1, height: 1 },
                    rotation: 0,
                    layer: 1,
                    properties: { interactable: true, buttonNumber: 2 },
                },
            ];
            const result = getButtonsLinkingToDoor(door, objects);
            expect(result).toHaveLength(1);
            expect(result[0]?.id).toBe('btn1');
        });

        it('returns multiple buttons when multiple link to door', () => {
            const door: InteractableObject = {
                id: 'door1',
                type: 'door',
                position: { x: 0, y: 0 },
                dimensions: { width: 1, height: 1 },
                rotation: 0,
                layer: 1,
                properties: { interactable: true },
            };
            const objects: InteractableObject[] = [
                {
                    id: 'btn1',
                    type: 'button',
                    position: { x: 1, y: 0 },
                    dimensions: { width: 1, height: 1 },
                    rotation: 0,
                    layer: 1,
                    properties: { interactable: true, buttonNumber: 1, linkedObjects: ['door1'] },
                },
                {
                    id: 'btn2',
                    type: 'button',
                    position: { x: 2, y: 0 },
                    dimensions: { width: 1, height: 1 },
                    rotation: 0,
                    layer: 1,
                    properties: { interactable: true, buttonNumber: 2, linkedObjects: ['door1'] },
                },
            ];
            const result = getButtonsLinkingToDoor(door, objects);
            expect(result).toHaveLength(2);
        });

        it('only returns buttons, not other object types', () => {
            const door: InteractableObject = {
                id: 'door1',
                type: 'door',
                position: { x: 0, y: 0 },
                dimensions: { width: 1, height: 1 },
                rotation: 0,
                layer: 1,
                properties: { interactable: true },
            };
            const objects: InteractableObject[] = [
                {
                    id: 'lever1',
                    type: 'lever',
                    position: { x: 1, y: 0 },
                    dimensions: { width: 1, height: 1 },
                    rotation: 0,
                    layer: 1,
                    properties: { interactable: true, linkedObjects: ['door1'] },
                },
            ];
            expect(getButtonsLinkingToDoor(door, objects)).toEqual([]);
        });
    });

    describe('validateButtonNumber', () => {
        it('returns true for valid numbers 1-99', () => {
            expect(validateButtonNumber(1)).toBe(true);
            expect(validateButtonNumber(50)).toBe(true);
            expect(validateButtonNumber(99)).toBe(true);
        });

        it('returns false for numbers < 1', () => {
            expect(validateButtonNumber(0)).toBe(false);
            expect(validateButtonNumber(-1)).toBe(false);
        });

        it('returns false for numbers > 99', () => {
            expect(validateButtonNumber(100)).toBe(false);
            expect(validateButtonNumber(999)).toBe(false);
        });

        it('returns false for non-integers', () => {
            expect(validateButtonNumber(1.5)).toBe(false);
            expect(validateButtonNumber(99.9)).toBe(false);
        });
    });
});
