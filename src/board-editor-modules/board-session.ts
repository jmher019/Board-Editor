import { StringMap } from '../utils/string-map';

export interface TileData {
    id: string;
    x: number;
    y: number;
}

export interface LayersData {
    width: number;
    height: number;
    tileWidth: number;
    tileHeight: number;
    tiles: Array<Array<TileData>>;
}

export interface BoardData {
    images: StringMap<string>;
    layers: LayersData;
}

export interface BoardSession {
    name: string;
    board: BoardData;
}