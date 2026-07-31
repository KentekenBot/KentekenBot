export type BoardView = 'spotters' | 'expensive' | 'oldest' | 'mostSpotted' | 'stats';

export function isBoardView(value: string): value is BoardView {
    return (
        value === 'spotters' ||
        value === 'expensive' ||
        value === 'oldest' ||
        value === 'mostSpotted' ||
        value === 'stats'
    );
}
