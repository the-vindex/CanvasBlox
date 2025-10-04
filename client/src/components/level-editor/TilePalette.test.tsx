import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TilePalette } from './TilePalette';

describe('TilePalette', () => {
  it('should render all tile categories', () => {
    const mockOnTileSelect = vi.fn();
    render(<TilePalette selectedTileType={null} onTileSelect={mockOnTileSelect} />);

    // Check all category titles are present
    expect(screen.getByText('Platforms')).toBeInTheDocument();
    expect(screen.getByText('Interactables')).toBeInTheDocument();
    expect(screen.getByText('Decorations')).toBeInTheDocument();
    expect(screen.getByText('Spawn Points')).toBeInTheDocument();
  });

  it('should render all platform tiles', () => {
    const mockOnTileSelect = vi.fn();
    render(<TilePalette selectedTileType={null} onTileSelect={mockOnTileSelect} />);

    // Check all platform tiles are present
    expect(screen.getByTestId('tile-platform-basic')).toBeInTheDocument();
    expect(screen.getByTestId('tile-platform-stone')).toBeInTheDocument();
    expect(screen.getByTestId('tile-platform-grass')).toBeInTheDocument();
    expect(screen.getByTestId('tile-platform-ice')).toBeInTheDocument();
    expect(screen.getByTestId('tile-platform-lava')).toBeInTheDocument();
    expect(screen.getByTestId('tile-platform-metal')).toBeInTheDocument();
  });

  it('should highlight selected tile', () => {
    const mockOnTileSelect = vi.fn();
    render(<TilePalette selectedTileType="platform-basic" onTileSelect={mockOnTileSelect} />);

    const basicTile = screen.getByTestId('tile-platform-basic');
    expect(basicTile).toHaveAttribute('aria-selected', 'true');

    const stoneTile = screen.getByTestId('tile-platform-stone');
    expect(stoneTile).toHaveAttribute('aria-selected', 'false');
  });

  it('should call onTileSelect when tile is clicked', async () => {
    const user = userEvent.setup();
    const mockOnTileSelect = vi.fn();
    render(<TilePalette selectedTileType={null} onTileSelect={mockOnTileSelect} />);

    const grassTile = screen.getByTestId('tile-platform-grass');
    await user.click(grassTile);

    expect(mockOnTileSelect).toHaveBeenCalledTimes(1);
    expect(mockOnTileSelect).toHaveBeenCalledWith('platform-grass');
  });

  it('should handle spawn point tile selection', async () => {
    const user = userEvent.setup();
    const mockOnTileSelect = vi.fn();
    render(<TilePalette selectedTileType={null} onTileSelect={mockOnTileSelect} />);

    const playerSpawn = screen.getByTestId('tile-spawn-player');
    await user.click(playerSpawn);

    expect(mockOnTileSelect).toHaveBeenCalledWith('spawn-player');
  });

  it('should handle interactable object tile selection', async () => {
    const user = userEvent.setup();
    const mockOnTileSelect = vi.fn();
    render(<TilePalette selectedTileType={null} onTileSelect={mockOnTileSelect} />);

    const buttonTile = screen.getByTestId('tile-button');
    await user.click(buttonTile);

    expect(mockOnTileSelect).toHaveBeenCalledWith('button');
  });
});
