import TileLayerCollection, { TileLayerCollectionOptions } from '../board-editor-modules/layer/tile-layer-collection';
import { Vector, floor, ceil } from '../utils/math-utils';
import TileLayer from '../board-editor-modules/layer/tile-layer';
import ImageMap from '../utils/image-map';
import Tile, { TileOptions } from '../board-editor-modules/layer/image-tile';
import { StringMap } from '../utils/string-map';
import ConfigurationUtils from '../utils/configuration-utils';

/**
 * Board State ACTIONS
 */

export interface BoardStateAction {
    type: string;
    index: number;
    layer: TileLayer;
    indexStart: number;
    indexDest: number;
    width: number;
    height: number;
    collection: TileLayerCollection;
    toggleGrid: boolean;
    toggleErase: boolean;
    togglePicker: boolean;
    toggleBucketFill: boolean;
    tile: Tile;
    x: number;
    y: number;
    bucketFill: boolean;
    currentImage: string;
}

const ADD_LAYER = 'ADD_LAYER';
const REMOVE_LAYER = 'REMOVE_LAYER';
const SET_LAYER = 'SET_LAYER';
const INSERT_LAYER = 'INSERT_LAYER';
const MOVE_LAYER = 'MOVE_LAYER';
const SET_WIDTH = 'SET_WIDTH';
const SET_HEIGHT = 'SET_HEIGHT';
const TOGGLE_VISIBILITY = 'TOGGLE_VISIBILITY';
const SELECT_LAYER = 'SELECT_LAYER';
const OVERRIDE_TILE_LAYER_COLLECTION = 'OVERRIDE_TILE_LAYER_COLLECTION';
const TOGGLE_GRID = 'TOGGLE_GRID';
const TOGGLE_ERASE = 'TOGGLE_ERASE';
const TOGGLE_PICKER = 'TOGGLE_PICKER';
const TOGGLE_BUCKET_FILL = 'TOGGLE_BUCKET_FILL';
const SET_TILE = 'SET_TILE';
const SET_DRAWING_TILE = 'SET_DRAWING_TILE';
const SET_CURRENT_TILESET = 'SET_CURRENT_TILESET';

export let addLayer = (): BoardStateAction => {
    return {
        type: ADD_LAYER
    } as BoardStateAction;
};

export let removeLayer = (index: number): BoardStateAction => {
    return {
        type: REMOVE_LAYER,
        index
    } as BoardStateAction;
};

export let setLayer = (index: number, layer: TileLayer): BoardStateAction => {
    return {
        type: SET_LAYER,
        index,
        layer
    } as BoardStateAction;
};

export let insertLayer = (index: number, layer: TileLayer): BoardStateAction => {
    return {
        type: INSERT_LAYER,
        index,
        layer
    } as BoardStateAction;
};

export let moveLayer = (indexStart: number, indexDest: number): BoardStateAction => {
    return {
        type: MOVE_LAYER,
        indexStart,
        indexDest
    } as BoardStateAction;
};

export let setWidth = (width: number): BoardStateAction => {
    return {
        type: SET_WIDTH,
        width
    } as BoardStateAction;
};

export let setHeight = (height: number): BoardStateAction => {
    return {
        type: SET_HEIGHT,
        height
    } as BoardStateAction;
};

export let toggleVisibility = (index: number): BoardStateAction => {
    return {
        type: TOGGLE_VISIBILITY,
        index
    } as BoardStateAction;
};

export let selectLayer = (index: number): BoardStateAction => {
    return {
        type: SELECT_LAYER,
        index
    } as BoardStateAction;
};

export let overrideTileLayerCollection = (collection: TileLayerCollection): BoardStateAction => {
    return {
        type: OVERRIDE_TILE_LAYER_COLLECTION,
        collection
    } as BoardStateAction;
};

export function toggleGrid(toggleGrid: boolean): BoardStateAction {
    return {
        type: TOGGLE_GRID,
        toggleGrid
    } as BoardStateAction;
}

export function toggleErase(toggleErase: boolean): BoardStateAction {
    return {
        type: TOGGLE_ERASE,
        toggleErase
    } as BoardStateAction;
}

export function togglePicker(togglePicker: boolean): BoardStateAction {
    return {
        type: TOGGLE_PICKER,
        togglePicker
    } as BoardStateAction;
}

export function toggleBucketFill(toggleBucketFill: boolean): BoardStateAction {
    return {
        type: TOGGLE_BUCKET_FILL,
        toggleBucketFill
    } as BoardStateAction;
}

export function setTile(tile: Tile, x: number, y: number, index: number, bucketFill: boolean): BoardStateAction {
    return {
        type: SET_TILE,
        tile,
        x,
        y,
        index,
        bucketFill
    } as BoardStateAction;
}

export function setDrawingTile(tile: Tile): BoardStateAction {
    return {
        type: SET_DRAWING_TILE,
        tile
    } as BoardStateAction;
}

export function setCurrentTileset(currentImage: string): BoardStateAction {
    return {
        type: SET_CURRENT_TILESET,
        currentImage
    } as BoardStateAction;
}

/**
 * END OF Board State ACTIONS
 */

/**
 * Board Store ACTIONS
 */

const PUT_IMAGE = 'PUT_IMAGE';

export interface BoardStoreAction {
    type: string;
    img: HTMLImageElement;
    key: string;
}

export function putImage(img: HTMLImageElement, key: string): BoardStoreAction {
    return {
        type: PUT_IMAGE,
        img,
        key
    } as BoardStoreAction;
}

/**
 * END OF Board Store ACTIONS
 */

/**
 * REDUCERS
 */

export interface Action extends BoardStoreAction, BoardStateAction {
}

export interface BoardState {
    collection: TileLayerCollection;
    gridEnabled: boolean;
    selectedLayer: number;
    eraseEnabled: boolean;
    pickerEnabled: boolean;
    bucketFillEnabled: boolean;
}

export interface BoardStoreState {
    boards: StringMap<BoardState>;
    drawingTile: Tile;
    imageMap: ImageMap;
}

const boardStoreInitialState = {
    boards: {
        'tile-preview': {
            collection: new TileLayerCollection({
                layerSize: new Vector(1, 1),
                tilePixelSize: new Vector(32, 32),
                numberOfLayers: 1
            } as TileLayerCollectionOptions),
            gridEnabled: true,
            selectedLayer: 0,
            eraseEnabled: false,
            pickerEnabled: false,
            bucketFillEnabled: false
        } as BoardState,
        'tileset-viewer': {
            collection: new TileLayerCollection({
                layerSize: new Vector(4, 14),
                tilePixelSize: new Vector(32, 32),
                numberOfLayers: 1
            } as TileLayerCollectionOptions),
            gridEnabled: true,
            selectedLayer: 0,
            eraseEnabled: false,
            pickerEnabled: false,
            bucketFillEnabled: false
        } as BoardState,
        'drawing-board': {
            collection: new TileLayerCollection({
                layerSize: new Vector(32, 32),
                tilePixelSize: new Vector(32, 32),
                numberOfLayers: 1
            } as TileLayerCollectionOptions),
            gridEnabled: true,
            selectedLayer: 0,
            eraseEnabled: false,
            pickerEnabled: false,
            bucketFillEnabled: false
        } as BoardState
    } as StringMap<BoardState>,
    drawingTile: new Tile({
        imageSrc: '',
        pixelSize: new Vector(32, 32),
        tileCoords: new Vector(0, 0)
    } as TileOptions),
    imageMap: new ImageMap()
} as BoardStoreState;

export let boardStore = (state = boardStoreInitialState, action: Action): BoardStoreState => {
    let drawingBoardState = state.boards[ConfigurationUtils.DrawingBoardId];
    let previewBoardState = state.boards[ConfigurationUtils.TilePreviewBoardId];
    let tilesetViewerBoardState = state.boards[ConfigurationUtils.TilesetViewerId];
    switch (action.type) {
        case ADD_LAYER:
            drawingBoardState.collection.addLayer();
            break;
        case REMOVE_LAYER:
            drawingBoardState.collection.removeLayer(action.index);
            break;
        case SET_LAYER:
            drawingBoardState.collection.setLayer(action.index, action.layer);
            break;
        case INSERT_LAYER:
            drawingBoardState.collection.insertLayer(action.index, action.layer);
            break;
        case MOVE_LAYER:
            drawingBoardState.collection.moveLayer(action.indexStart, action.indexDest);
            break;
        case SET_WIDTH:
            drawingBoardState.collection.setLayerWidth(action.width);
            break;
        case SET_HEIGHT:
            drawingBoardState.collection.setLayerHeight(action.height);
            break;
        case TOGGLE_VISIBILITY:
            drawingBoardState.collection.toggleLayerVisibility(action.index);
            break;
        case PUT_IMAGE:
            state.imageMap.put(action.key, action.img);
            break;
        case SET_DRAWING_TILE:
            state.drawingTile.setImageSrc(action.tile.getImageSrc());
            state.drawingTile.setTileX(action.tile.getTileX());
            state.drawingTile.setTileY(action.tile.getTileY());
            state.drawingTile.setPixelWidth(action.tile.getPixelWidth());
            state.drawingTile.setPixelHeight(action.tile.getPixelHeight());
            let collection = previewBoardState.collection.clone();
            collection.getLayer(0).setTile(0, 0, state.drawingTile);
            previewBoardState.collection = collection;
            break;
        case TOGGLE_GRID:
            drawingBoardState.gridEnabled = action.toggleGrid;
            break;
        case TOGGLE_ERASE:
            drawingBoardState.eraseEnabled = action.toggleErase;
            if (drawingBoardState.eraseEnabled) {
                state.drawingTile.setImageSrc('')
                    .setTileX(0)
                    .setTileY(0);
                let newCollection = previewBoardState.collection.clone();
                newCollection.getLayer(0).setTile(0, 0, state.drawingTile);
                previewBoardState.collection = newCollection;
            }
            break;
        case TOGGLE_PICKER:
            drawingBoardState.pickerEnabled = action.togglePicker;
            break;
        case TOGGLE_BUCKET_FILL:
            drawingBoardState.bucketFillEnabled = action.toggleBucketFill;
            break;
        case SELECT_LAYER:
            drawingBoardState.selectedLayer = action.index;
            break;
        case OVERRIDE_TILE_LAYER_COLLECTION:
            drawingBoardState.collection = action.collection;
            break;
        case SET_TILE:
            drawingBoardState.collection.getLayer(action.index)
                .setTile(action.x, action.y, action.tile, action.bucketFill);
            break;
        case SET_CURRENT_TILESET:
            let img = state.imageMap.get(action.currentImage);
            if (img) {
                let tilesetCollection = tilesetViewerBoardState.collection.clone();
                let width = img.width;
                let height = img.height;
                let tileWidth = tilesetCollection.getTilePixelWidth();
                let tileHeight = tilesetCollection.getTilePixelHeight();
                let numTiles = floor(width * height / (tileWidth * tileHeight));
                let newCollectionHeight = ceil(numTiles / 4);

                tilesetCollection.setLayerHeight(newCollectionHeight);
                let tileStride = width / tileWidth;
                let index = 0;
                for (let y = 0; y < tilesetCollection.getLayerHeight(); y++) {
                    for (let x = 0; x < tilesetCollection.getLayerWidth(); x++) {
                        tilesetCollection.getLayer(0).setTile(x, y, new Tile({
                            imageSrc: action.currentImage,
                            tileCoords: new Vector(floor(index % tileStride), floor(index / tileStride)),
                            pixelSize: new Vector(tileWidth, tileHeight)
                        }));
                        index++;
                    }
                }
                tilesetViewerBoardState.collection = tilesetCollection;
            }
            break;
        default:
            break;
    }

    return state;
};

/**
 * END OF REDUCERS
 */