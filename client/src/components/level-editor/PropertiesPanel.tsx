import { useId } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { EditorState, InteractableObject, LevelData, SpawnPoint, Tile } from '@/types/level';
import { validateButtonNumber } from '@/utils/buttonNumbering';

interface PropertiesPanelProps {
    levelData: LevelData;
    editorState: EditorState;
    onLevelUpdate: (updater: (level: LevelData) => LevelData, action?: string) => void;
    onDuplicateLevel: () => void;
    onClose?: () => void;
}

export function PropertiesPanel({
    levelData,
    editorState,
    onLevelUpdate,
    onDuplicateLevel,
    onClose,
}: PropertiesPanelProps) {
    const collidableId = useId();
    const defaultSpawnId = useId();
    const selectedObjectId = editorState.selectedObjects[0];
    const selectedObject = selectedObjectId
        ? [...levelData.tiles, ...levelData.objects, ...levelData.spawnPoints].find(
              (obj) => obj.id === selectedObjectId
          )
        : null;

    const handleLevelPropertyChange = (property: string, value: string | object) => {
        onLevelUpdate((level) => {
            if (property === 'levelName') {
                return { ...level, levelName: value as string };
            }
            return {
                ...level,
                metadata: { ...level.metadata, [property]: value },
            };
        });
    };

    const handleObjectPropertyChange = (property: string, value: string | boolean | number | object) => {
        if (!selectedObject) return;

        onLevelUpdate((level) => {
            const updateTile = (obj: Tile): Tile => {
                if (obj.id !== selectedObjectId) return obj;
                if (property.startsWith('properties.')) {
                    const propKey = property.replace('properties.', '');
                    return { ...obj, properties: { ...obj.properties, [propKey]: value } };
                }
                return { ...obj, [property]: value };
            };

            const updateObject = (obj: InteractableObject): InteractableObject => {
                if (obj.id !== selectedObjectId) return obj;
                if (property.startsWith('properties.')) {
                    const propKey = property.replace('properties.', '');
                    return { ...obj, properties: { ...obj.properties, [propKey]: value } };
                }
                return { ...obj, [property]: value };
            };

            const updateSpawn = (obj: SpawnPoint): SpawnPoint => {
                if (obj.id !== selectedObjectId) return obj;
                if (property.startsWith('properties.')) {
                    const propKey = property.replace('properties.', '');
                    return { ...obj, properties: { ...obj.properties, [propKey]: value } };
                }
                return { ...obj, [property]: value };
            };

            return {
                ...level,
                tiles: level.tiles.map(updateTile),
                objects: level.objects.map(updateObject),
                spawnPoints: level.spawnPoints.map(updateSpawn),
            };
        });
    };

    return (
        <aside
            className="w-72 bg-card border-l border-border flex flex-col overflow-hidden"
            data-testid="properties-panel"
        >
            <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                    <i className="fas fa-sliders-h"></i>
                    Properties
                </h2>
                {onClose && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                        title="Close Properties Panel (P)"
                        data-testid="button-close-properties"
                    >
                        <i className="fas fa-times text-xs"></i>
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-custom p-4 space-y-4">
                {/* Level Properties */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase">Level Settings</h3>

                    <div>
                        <Label className="text-sm text-muted-foreground mb-1">Level Name</Label>
                        <Input
                            value={levelData.levelName}
                            onChange={(e) => handleLevelPropertyChange('levelName', e.target.value)}
                            className="text-sm"
                            data-testid="input-level-name"
                        />
                    </div>

                    <div>
                        <Label className="text-sm text-muted-foreground mb-1">Description</Label>
                        <Textarea
                            value={levelData.metadata.description}
                            onChange={(e) => handleLevelPropertyChange('description', e.target.value)}
                            placeholder="Enter level description..."
                            rows={3}
                            className="text-sm resize-none"
                            data-testid="textarea-level-description"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-sm text-muted-foreground mb-1">Width</Label>
                            <Input
                                type="number"
                                value={levelData.metadata.dimensions.width}
                                onChange={(e) =>
                                    handleLevelPropertyChange('dimensions', {
                                        ...levelData.metadata.dimensions,
                                        width: parseInt(e.target.value, 10) || 1920,
                                    })
                                }
                                className="text-sm"
                                data-testid="input-level-width"
                            />
                        </div>
                        <div>
                            <Label className="text-sm text-muted-foreground mb-1">Height</Label>
                            <Input
                                type="number"
                                value={levelData.metadata.dimensions.height}
                                onChange={(e) =>
                                    handleLevelPropertyChange('dimensions', {
                                        ...levelData.metadata.dimensions,
                                        height: parseInt(e.target.value, 10) || 1080,
                                    })
                                }
                                className="text-sm"
                                data-testid="input-level-height"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm text-muted-foreground mb-1">Background Color</Label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={levelData.metadata.backgroundColor}
                                onChange={(e) => handleLevelPropertyChange('backgroundColor', e.target.value)}
                                className="w-12 h-10 rounded cursor-pointer"
                                data-testid="input-background-color"
                            />
                            <Input
                                type="text"
                                value={levelData.metadata.backgroundColor}
                                onChange={(e) => handleLevelPropertyChange('backgroundColor', e.target.value)}
                                className="flex-1 text-sm"
                                data-testid="input-background-color-text"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={onDuplicateLevel}
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        data-testid="button-duplicate-level"
                    >
                        <i className="fas fa-clone mr-2"></i>
                        Duplicate Level
                    </Button>
                </div>

                {/* Object Properties (shown when object selected) */}
                {selectedObject && (
                    <div className="space-y-3 pt-4 border-t border-border">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase">Selected Object</h3>

                        <div>
                            <Label className="text-sm text-muted-foreground mb-1">Type</Label>
                            <Select
                                value={selectedObject.type}
                                onValueChange={(value) => handleObjectPropertyChange('type', value)}
                            >
                                <SelectTrigger className="text-sm" data-testid="select-object-type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="platform-basic">Platform - Basic</SelectItem>
                                    <SelectItem value="platform-grass">Platform - Grass</SelectItem>
                                    <SelectItem value="platform-stone">Platform - Stone</SelectItem>
                                    <SelectItem value="button">Button</SelectItem>
                                    <SelectItem value="door">Door</SelectItem>
                                    <SelectItem value="lever">Lever</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1">X Position</Label>
                                <Input
                                    type="number"
                                    value={selectedObject.position.x}
                                    onChange={(e) =>
                                        handleObjectPropertyChange('position', {
                                            ...selectedObject.position,
                                            x: parseInt(e.target.value, 10) || 0,
                                        })
                                    }
                                    className="text-sm"
                                    data-testid="input-object-x"
                                />
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1">Y Position</Label>
                                <Input
                                    type="number"
                                    value={selectedObject.position.y}
                                    onChange={(e) =>
                                        handleObjectPropertyChange('position', {
                                            ...selectedObject.position,
                                            y: parseInt(e.target.value, 10) || 0,
                                        })
                                    }
                                    className="text-sm"
                                    data-testid="input-object-y"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1">Width</Label>
                                <Input
                                    type="number"
                                    value={selectedObject.dimensions.width}
                                    onChange={(e) =>
                                        handleObjectPropertyChange('dimensions', {
                                            ...selectedObject.dimensions,
                                            width: parseInt(e.target.value, 10) || 32,
                                        })
                                    }
                                    className="text-sm"
                                    data-testid="input-object-width"
                                />
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1">Height</Label>
                                <Input
                                    type="number"
                                    value={selectedObject.dimensions.height}
                                    onChange={(e) =>
                                        handleObjectPropertyChange('dimensions', {
                                            ...selectedObject.dimensions,
                                            height: parseInt(e.target.value, 10) || 32,
                                        })
                                    }
                                    className="text-sm"
                                    data-testid="input-object-height"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-sm text-muted-foreground mb-1">Rotation</Label>
                            <Select
                                value={selectedObject.rotation.toString()}
                                onValueChange={(value) =>
                                    handleObjectPropertyChange('rotation', parseInt(value, 10) as 0 | 90 | 180 | 270)
                                }
                            >
                                <SelectTrigger className="text-sm" data-testid="select-object-rotation">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">0°</SelectItem>
                                    <SelectItem value="90">90°</SelectItem>
                                    <SelectItem value="180">180°</SelectItem>
                                    <SelectItem value="270">270°</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-sm text-muted-foreground mb-1">Layer</Label>
                            <Input
                                type="number"
                                value={selectedObject.layer}
                                onChange={(e) => handleObjectPropertyChange('layer', parseInt(e.target.value, 10) || 0)}
                                className="text-sm"
                                data-testid="input-object-layer"
                            />
                        </div>

                        {'properties' in selectedObject && 'collidable' in selectedObject.properties && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id={collidableId}
                                    checked={selectedObject.properties.collidable}
                                    onCheckedChange={(checked) =>
                                        handleObjectPropertyChange('properties.collidable', checked)
                                    }
                                    data-testid="checkbox-collidable"
                                />
                                <Label htmlFor={collidableId} className="text-sm cursor-pointer">
                                    Collidable
                                </Label>
                            </div>
                        )}
                    </div>
                )}

                {/* Interactable Properties */}
                {selectedObject && 'properties' in selectedObject && 'interactable' in selectedObject.properties && (
                    <div className="space-y-3 pt-4 border-t border-border">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase">Interactable Settings</h3>

                        {/* Button Number - only for buttons */}
                        {selectedObject.type === 'button' && (
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1">Button Number</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={selectedObject.properties.buttonNumber || 1}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value, 10);
                                        if (validateButtonNumber(value)) {
                                            handleObjectPropertyChange('properties.buttonNumber', value);
                                        }
                                    }}
                                    className="text-sm"
                                    aria-label="Button Number"
                                    data-testid="input-button-number"
                                />
                                {(() => {
                                    const currentNumber = selectedObject.properties.buttonNumber;
                                    const hasDuplicate = levelData.objects.some(
                                        (obj) =>
                                            obj.id !== selectedObject.id &&
                                            obj.type === 'button' &&
                                            obj.properties.buttonNumber === currentNumber
                                    );
                                    return hasDuplicate ? (
                                        <p className="text-xs text-yellow-600 mt-1">
                                            ⚠ Warning: Button number {currentNumber} is already used by another button
                                        </p>
                                    ) : null;
                                })()}
                            </div>
                        )}

                        <div>
                            <Label className="text-sm text-muted-foreground mb-1">Action Type</Label>
                            <Select
                                value={selectedObject.properties.actionType || 'toggle'}
                                onValueChange={(value) => handleObjectPropertyChange('properties.actionType', value)}
                            >
                                <SelectTrigger className="text-sm" data-testid="select-action-type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="toggle">Toggle</SelectItem>
                                    <SelectItem value="one-time">One-Time</SelectItem>
                                    <SelectItem value="delayed">Delayed</SelectItem>
                                    <SelectItem value="continuous">Continuous</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-sm text-muted-foreground mb-1">Delay (seconds)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                value={selectedObject.properties.delay || 0}
                                onChange={(e) =>
                                    handleObjectPropertyChange('properties.delay', parseFloat(e.target.value) || 0)
                                }
                                className="text-sm"
                                data-testid="input-object-delay"
                            />
                        </div>

                        {/* Linked Objects */}
                        {selectedObject.properties.linkedObjects &&
                            selectedObject.properties.linkedObjects.length > 0 && (
                                <div>
                                    <Label className="text-sm text-muted-foreground mb-1">Linked Objects</Label>
                                    <div className="text-sm text-muted-foreground">
                                        {selectedObject.properties.linkedObjects.map((linkedId) => {
                                            const linkedObj = levelData.objects.find((obj) => obj.id === linkedId);
                                            return (
                                                <div key={linkedId} className="py-1">
                                                    {linkedObj
                                                        ? `${linkedObj.type} (${linkedObj.position.x}, ${linkedObj.position.y})`
                                                        : 'Unknown'}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                    </div>
                )}

                {/* Spawn Point Properties */}
                {selectedObject && 'facingDirection' in selectedObject && (
                    <div className="space-y-3 pt-4 border-t border-border">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase">Spawn Settings</h3>

                        <div>
                            <Label className="text-sm text-muted-foreground mb-1">Spawn ID</Label>
                            <Input
                                type="text"
                                value={selectedObject.properties.spawnId || ''}
                                onChange={(e) => handleObjectPropertyChange('properties.spawnId', e.target.value)}
                                className="text-sm"
                                data-testid="input-spawn-id"
                            />
                        </div>

                        <div>
                            <Label className="text-sm text-muted-foreground mb-1">Facing Direction</Label>
                            <Select
                                value={selectedObject.facingDirection}
                                onValueChange={(value) => handleObjectPropertyChange('facingDirection', value)}
                            >
                                <SelectTrigger className="text-sm" data-testid="select-facing-direction">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="right">Right</SelectItem>
                                    <SelectItem value="left">Left</SelectItem>
                                    <SelectItem value="up">Up</SelectItem>
                                    <SelectItem value="down">Down</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id={defaultSpawnId}
                                checked={selectedObject.isDefault}
                                onCheckedChange={(checked) => handleObjectPropertyChange('isDefault', checked)}
                                data-testid="checkbox-default-spawn"
                            />
                            <Label htmlFor={defaultSpawnId} className="text-sm cursor-pointer">
                                Default Spawn
                            </Label>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
