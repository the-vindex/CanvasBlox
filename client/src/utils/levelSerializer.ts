import { LevelData, LevelMetadata } from '@/types/level';

export class LevelSerializer {
  static serialize(levelData: LevelData): string {
    return JSON.stringify(levelData, null, 2);
  }

  static deserialize(jsonString: string): LevelData {
    try {
      const data = JSON.parse(jsonString);
      
      // Validate basic structure
      if (!data.levelName || !data.metadata || !data.tiles || !data.objects || !data.spawnPoints) {
        throw new Error('Invalid level format: missing required fields');
      }

      // Validate metadata
      if (!data.metadata.version || !data.metadata.dimensions) {
        throw new Error('Invalid metadata format');
      }

      return data as LevelData;
    } catch (error) {
      throw new Error(`Failed to parse level data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static createDefaultLevel(name: string = 'New Level'): LevelData {
    const now = new Date().toISOString();
    
    return {
      levelName: name,
      metadata: {
        version: '1.0',
        createdAt: now,
        author: 'Level Editor',
        description: '',
        dimensions: { width: 1920, height: 1080 },
        backgroundColor: '#1a1a1a'
      },
      tiles: [],
      objects: [],
      spawnPoints: []
    };
  }

  static exportToPNG(canvas: HTMLCanvasElement, filename: string = 'level.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL();
    link.click();
  }

  static downloadJSON(levelData: LevelData, filename?: string) {
    const jsonString = this.serialize(levelData);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `${levelData.levelName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }
}
