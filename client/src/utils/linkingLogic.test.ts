import { describe, expect, it } from 'vitest';
import type { InteractableObject, SpawnPoint, Tile } from '@/types/level';
import { canLinkObjects, canObjectBeLinked, createLink, removeLink } from '@/utils/linkingLogic';

describe('Linking Tool Logic', () => {
    describe('canObjectBeLinked', () => {
        it('should return true for interactable objects', () => {
            const button: InteractableObject = {
                id: 'btn1',
                type: 'button',
                position: { x: 0, y: 0 },
                dimensions: { width: 1, height: 1 },
                rotation: 0,
                layer: 1,
                properties: { interactable: true },
            };

            expect(canObjectBeLinked(button)).toBe(true);
        });

        it('should return false for tiles', () => {
            const tile: Tile = {
                id: 'tile1',
                type: 'platform-basic',
                position: { x: 0, y: 0 },
                dimensions: { width: 1, height: 1 },
                rotation: 0,
                layer: 0,
                properties: { collidable: true },
            };

            expect(canObjectBeLinked(tile)).toBe(false);
        });

        it('should return false for spawn points', () => {
            const spawn: SpawnPoint = {
                id: 'spawn1',
                type: 'player',
                position: { x: 0, y: 0 },
                dimensions: { width: 1, height: 1 },
                rotation: 0,
                layer: 2,
                facingDirection: 'right',
                isDefault: true,
                properties: { spawnId: 'player1' },
            };

            expect(canObjectBeLinked(spawn)).toBe(false);
        });
    });

    describe('canLinkObjects', () => {
        const button: InteractableObject = {
            id: 'btn1',
            type: 'button',
            position: { x: 0, y: 0 },
            dimensions: { width: 1, height: 1 },
            rotation: 0,
            layer: 1,
            properties: { interactable: true },
        };

        const door: InteractableObject = {
            id: 'door1',
            type: 'door',
            position: { x: 5, y: 0 },
            dimensions: { width: 1, height: 2 },
            rotation: 0,
            layer: 1,
            properties: { interactable: true },
        };

        it('should allow linking button to door', () => {
            const result = canLinkObjects(button, door);
            expect(result.valid).toBe(true);
            expect(result.reason).toBeUndefined();
        });

        it('should prevent linking object to itself', () => {
            const result = canLinkObjects(button, button);
            expect(result.valid).toBe(false);
            expect(result.reason).toBe('Cannot link object to itself');
        });

        it('should prevent duplicate links', () => {
            const buttonWithLink: InteractableObject = {
                ...button,
                properties: {
                    ...button.properties,
                    linkedObjects: ['door1'],
                },
            };

            const result = canLinkObjects(buttonWithLink, door);
            expect(result.valid).toBe(false);
            expect(result.reason).toBe('Link already exists');
        });

        it('should allow multiple different links from same source', () => {
            const buttonWithLink: InteractableObject = {
                ...button,
                properties: {
                    ...button.properties,
                    linkedObjects: ['door1'],
                },
            };

            const door2: InteractableObject = {
                ...door,
                id: 'door2',
            };

            const result = canLinkObjects(buttonWithLink, door2);
            expect(result.valid).toBe(true);
        });
    });

    describe('createLink', () => {
        it('should not mutate original objects', () => {
            const button: InteractableObject = {
                id: 'btn1',
                type: 'button',
                position: { x: 0, y: 0 },
                dimensions: { width: 1, height: 1 },
                rotation: 0,
                layer: 1,
                properties: { interactable: true },
            };

            const door: InteractableObject = {
                id: 'door1',
                type: 'door',
                position: { x: 5, y: 0 },
                dimensions: { width: 1, height: 2 },
                rotation: 0,
                layer: 1,
                properties: { interactable: true },
            };

            const originalButtonLinked = button.properties.linkedObjects;
            const originalDoorLinkedFrom = door.properties.linkedFrom;

            createLink(button, door);

            expect(button.properties.linkedObjects).toBe(originalButtonLinked);
            expect(door.properties.linkedFrom).toBe(originalDoorLinkedFrom);
        });
    });

    describe('removeLink', () => {
        it('should not mutate original objects', () => {
            const button: InteractableObject = {
                id: 'btn1',
                type: 'button',
                position: { x: 0, y: 0 },
                dimensions: { width: 1, height: 1 },
                rotation: 0,
                layer: 1,
                properties: {
                    interactable: true,
                    linkedObjects: ['door1'],
                },
            };

            const door: InteractableObject = {
                id: 'door1',
                type: 'door',
                position: { x: 5, y: 0 },
                dimensions: { width: 1, height: 2 },
                rotation: 0,
                layer: 1,
                properties: {
                    interactable: true,
                    linkedFrom: ['btn1'],
                },
            };

            const originalButtonLinked = button.properties.linkedObjects;
            const originalDoorLinkedFrom = door.properties.linkedFrom;

            removeLink(button, door);

            expect(button.properties.linkedObjects).toBe(originalButtonLinked);
            expect(door.properties.linkedFrom).toBe(originalDoorLinkedFrom);
        });
    });
});
