# Level Data Format Reference

Complete reference for the CanvasBlox level data JSON format.

## Overview

Levels are stored as JSON with this structure:

```json
{
  "levelName": "string",
  "metadata": { ... },
  "tiles": [ ... ],
  "objects": [ ... ],
  "spawnPoints": [ ... ]
}
```

## Top-Level Structure

```json
{
  "levelName": "My Level",
  "metadata": {
    "version": "1.0",
    "createdAt": "2025-10-04T00:00:00.000Z",
    "author": "Level Designer",
    "description": "Level description",
    "dimensions": { "width": 60, "height": 30 },
    "backgroundColor": "#87CEEB"
  },
  "tiles": [],
  "objects": [],
  "spawnPoints": []
}
```

### Fields

- `levelName` (string) - Display name of the level
- `metadata` (object) - Level metadata (see below)
- `tiles` (array) - Platform tiles (see Tiles)
- `objects` (array) - Interactive objects (see Objects)
- `spawnPoints` (array) - Player/enemy spawn locations (see Spawn Points)

## Metadata

```json
"metadata": {
  "version": "1.0",
  "createdAt": "2025-10-04T00:00:00.000Z",
  "author": "Level Designer",
  "description": "Level description",
  "dimensions": { "width": 60, "height": 30 },
  "backgroundColor": "#87CEEB"
}
```

### Fields

- `version` (string) - Data format version (currently "1.0")
- `createdAt` (ISO string) - Creation timestamp
- `author` (string) - Creator name
- `description` (string) - Level description
- `dimensions` (object) - Level size in tiles
  - `width` (number) - Width in tiles
  - `height` (number) - Height in tiles
- `backgroundColor` (string) - CSS color (hex or name)

## Tiles

Platforms that players can stand on.

```json
{
  "id": "tile-1",
  "type": "platform-grass",
  "position": { "x": 5, "y": 25 },
  "dimensions": { "width": 10, "height": 2 },
  "rotation": 0,
  "layer": 0,
  "properties": {
    "collidable": true,
    "material": "grass"
  }
}
```

### Fields

- `id` (string) - Unique identifier
- `type` (string) - Tile type (see Tile Types)
- `position` (object) - Top-left corner in tile coordinates
  - `x` (number) - X coordinate (0 = left edge)
  - `y` (number) - Y coordinate (0 = top edge)
- `dimensions` (object) - Size in tiles
  - `width` (number) - Width in tiles
  - `height` (number) - Height in tiles
- `rotation` (number) - Rotation in degrees (0, 90, 180, 270)
- `layer` (number) - Z-order (higher = front)
- `properties` (object) - Tile-specific properties
  - `collidable` (boolean) - Can player collide?
  - `material` (string) - Material type (optional)

### Tile Types

- `platform-basic` - Gray platform
- `platform-grass` - Grass platform with texture
- `platform-stone` - Stone platform
- `platform-ice` - Ice platform (slippery)
- `platform-metal` - Metal platform

## Objects

Interactive objects like buttons, doors, etc.

```json
{
  "id": "button-1",
  "type": "button",
  "position": { "x": 8, "y": 24 },
  "dimensions": { "width": 1, "height": 1 },
  "rotation": 0,
  "properties": {
    "linkedObjects": ["door-1"]
  }
}
```

### Fields

- `id` (string) - Unique identifier
- `type` (string) - Object type (see Object Types)
- `position` (object) - Position in tile coordinates
- `dimensions` (object) - Size in tiles
- `rotation` (number) - Rotation in degrees
- `properties` (object) - Object-specific properties
  - `linkedObjects` (array) - IDs of linked objects

### Object Types

- `button` - Pressure plate (activates linked objects)
- `door` - Doorway (can be opened/closed)
- `lever` - Switch (toggles linked objects)
- `teleport` - Teleporter (links to another teleport)
- `tree` - Decoration (non-interactive)
- `coin` - Collectible
- `checkpoint` - Save point

## Spawn Points

Player and enemy spawn locations.

```json
{
  "id": "spawn-player",
  "type": "player",
  "position": { "x": 6, "y": 23 },
  "facingDirection": "right",
  "properties": {}
}
```

### Fields

- `id` (string) - Unique identifier
- `type` (string) - Spawn type: "player" or "enemy"
- `position` (object) - Position in tile coordinates
- `facingDirection` (string) - Direction: "right" or "left"
- `properties` (object) - Type-specific properties

### Player Spawn Properties

```json
"properties": {}
```

(No additional properties)

### Enemy Spawn Properties

```json
"properties": {
  "aiType": "patrol",
  "patrolPath": []
}
```

- `aiType` (string) - AI behavior type
- `patrolPath` (array) - Patrol waypoints (optional)

## Coordinate System

- **Grid-based**: All positions use tile coordinates (not pixels)
- **Origin**: Top-left is (0, 0)
- **X-axis**: Increases to the right
- **Y-axis**: Increases downward
- **Tile size**: 32px × 32px (1 tile = 32 pixels)

### Conversion

```
Tile coordinates → Pixel coordinates:
pixelX = tileX * 32
pixelY = tileY * 32

Pixel coordinates → Tile coordinates:
tileX = floor(pixelX / 32)
tileY = floor(pixelY / 32)
```

### Example

```
Tile (5, 10) = Pixel (160, 320)
Tile (0, 0) = Pixel (0, 0)
Tile (60, 30) = Pixel (1920, 960)
```

## Storage

Levels are stored in localStorage as JSON arrays:

```javascript
localStorage.setItem('levelEditor_levels', JSON.stringify([level1, level2, ...]))
```

**Keys:**
- `levelEditor_levels` - Array of level data
- `levelEditor_autosave` - Last auto-save timestamp

## Validation

The `LevelSerializer` class validates level data on import:

- Required fields: `levelName`, `metadata`, `tiles`, `objects`, `spawnPoints`
- Required metadata: `version`, `dimensions`
- Valid types for tiles, objects, spawn points

## Example: Complete Level

See `test-level-data.json` for a complete example with all features.

## Related

- For loading test data, see `docs/LOADING_TEST_DATA.md`
- For serialization utilities, see `client/src/utils/levelSerializer.ts`
- For type definitions, see `client/src/types/level.ts`
