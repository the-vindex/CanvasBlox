import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LevelTabs } from './LevelTabs';
import { LevelData } from '@/types/level';

describe('LevelTabs', () => {
  const mockLevels: LevelData[] = [
    {
      levelName: 'Level 1',
      metadata: {
        version: '1.0',
        createdAt: new Date().toISOString(),
        author: 'Test',
        description: 'Test level 1',
        dimensions: { width: 60, height: 30 },
        backgroundColor: '#87CEEB',
      },
      tiles: [],
      objects: [],
      spawnPoints: [],
    },
    {
      levelName: 'Level 2',
      metadata: {
        version: '1.0',
        createdAt: new Date().toISOString(),
        author: 'Test',
        description: 'Test level 2',
        dimensions: { width: 60, height: 30 },
        backgroundColor: '#87CEEB',
      },
      tiles: [],
      objects: [],
      spawnPoints: [],
    },
  ];

  it('should render level tabs', () => {
    const mockOnLevelSelect = vi.fn();
    const mockOnLevelClose = vi.fn();
    const mockOnNewLevel = vi.fn();

    render(
      <LevelTabs
        levels={mockLevels}
        currentLevelIndex={0}
        onLevelSelect={mockOnLevelSelect}
        onLevelClose={mockOnLevelClose}
        onNewLevel={mockOnNewLevel}
      />
    );

    expect(screen.getByTestId('level-tabs')).toBeInTheDocument();
    expect(screen.getByText('Level 1')).toBeInTheDocument();
    expect(screen.getByText('Level 2')).toBeInTheDocument();
  });

  it('should visually distinguish the active tab', () => {
    const mockOnLevelSelect = vi.fn();
    const mockOnLevelClose = vi.fn();
    const mockOnNewLevel = vi.fn();

    render(
      <LevelTabs
        levels={mockLevels}
        currentLevelIndex={1}
        onLevelSelect={mockOnLevelSelect}
        onLevelClose={mockOnLevelClose}
        onNewLevel={mockOnNewLevel}
      />
    );

    // Verify active tab has visual distinction (CSS class is acceptable for unit test)
    const tab1 = screen.getByTestId('tab-level-1');
    expect(tab1).toHaveClass('border-primary');
  });

  it('should call onLevelSelect when tab is clicked', async () => {
    const user = userEvent.setup();
    const mockOnLevelSelect = vi.fn();
    const mockOnLevelClose = vi.fn();
    const mockOnNewLevel = vi.fn();

    render(
      <LevelTabs
        levels={mockLevels}
        currentLevelIndex={0}
        onLevelSelect={mockOnLevelSelect}
        onLevelClose={mockOnLevelClose}
        onNewLevel={mockOnNewLevel}
      />
    );

    const tab1 = screen.getByTestId('tab-level-1');
    await user.click(tab1);

    expect(mockOnLevelSelect).toHaveBeenCalledWith(1);
  });

  it('should call onNewLevel when new level button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnLevelSelect = vi.fn();
    const mockOnLevelClose = vi.fn();
    const mockOnNewLevel = vi.fn();

    render(
      <LevelTabs
        levels={mockLevels}
        currentLevelIndex={0}
        onLevelSelect={mockOnLevelSelect}
        onLevelClose={mockOnLevelClose}
        onNewLevel={mockOnNewLevel}
      />
    );

    const newLevelButton = screen.getByTestId('button-new-level');
    await user.click(newLevelButton);

    expect(mockOnNewLevel).toHaveBeenCalled();
  });

  it('should show close buttons when multiple levels exist', () => {
    const mockOnLevelSelect = vi.fn();
    const mockOnLevelClose = vi.fn();
    const mockOnNewLevel = vi.fn();

    render(
      <LevelTabs
        levels={mockLevels}
        currentLevelIndex={0}
        onLevelSelect={mockOnLevelSelect}
        onLevelClose={mockOnLevelClose}
        onNewLevel={mockOnNewLevel}
      />
    );

    expect(screen.getByTestId('button-close-level-0')).toBeInTheDocument();
    expect(screen.getByTestId('button-close-level-1')).toBeInTheDocument();
  });

  it('should not show close button when only one level exists', () => {
    const mockOnLevelSelect = vi.fn();
    const mockOnLevelClose = vi.fn();
    const mockOnNewLevel = vi.fn();

    render(
      <LevelTabs
        levels={[mockLevels[0]]}
        currentLevelIndex={0}
        onLevelSelect={mockOnLevelSelect}
        onLevelClose={mockOnLevelClose}
        onNewLevel={mockOnNewLevel}
      />
    );

    expect(screen.queryByTestId('button-close-level-0')).not.toBeInTheDocument();
  });

  it('should call onLevelClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnLevelSelect = vi.fn();
    const mockOnLevelClose = vi.fn();
    const mockOnNewLevel = vi.fn();

    render(
      <LevelTabs
        levels={mockLevels}
        currentLevelIndex={0}
        onLevelSelect={mockOnLevelSelect}
        onLevelClose={mockOnLevelClose}
        onNewLevel={mockOnNewLevel}
      />
    );

    const closeButton = screen.getByTestId('button-close-level-1');
    await user.click(closeButton);

    expect(mockOnLevelClose).toHaveBeenCalledWith(1);
    // Verify close doesn't also trigger level selection
    expect(mockOnLevelSelect).not.toHaveBeenCalled();
  });
});
