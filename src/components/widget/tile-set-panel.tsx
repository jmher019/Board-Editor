import './tile-set-panel.css';
import * as React from 'react';
import Board from '../canvas/board';
import { Vector, ceil, floor } from '../../utils/math-utils';
import { Form } from 'react-bootstrap';
import TileLayerCollection,
{ TileLayerCollectionOptions } from '../../board-editor-modules/layer/tile-layer-collection';
import SelectItem from '../select/select-item';
import FileItem from '../button/file-button';
import { putImage, setDrawingTile } from '../../stores/board.store';
import { store } from '../../stores/store';
import ImageMap from '../../utils/image-map';
import Tile from '../../board-editor-modules/layer/image-tile';

interface State {
    currentImage: string;
    collection: TileLayerCollection;
    images: string[];
}

interface Props {
    imageMap: ImageMap;
    drawingTile: Tile;
}

export default class TileSetPanel extends React.Component<Props, State> {
    private board: Board;

    constructor(props: Props) {
        super(props);
        this.state = this.getInitialState();
    }

    public getInitialState(): State {
        return {
            currentImage: '',
            collection: new TileLayerCollection({
                layerSize: new Vector(4, 14),
                numberOfLayers: 1,
                tilePixelSize: new Vector(32, 32)
            } as TileLayerCollectionOptions),
            images: ['Select an Image']
        } as State;
    }

    public render(): JSX.Element {
        let collection = new TileLayerCollection({
            layerSize: new Vector(1, 1),
            numberOfLayers: 1,
            tilePixelSize: new Vector(32, 32)
        } as TileLayerCollectionOptions);
        collection.getLayer(0).setTile(0, 0, this.props.drawingTile);

        return (
            <div className={'tile-set-panel'}>
                <div className={'row'}>
                    <div className={'col-xs-12 col-sm-12 col-md-12 col-lg-12'}>
                        <Form>
                            <SelectItem
                                options={this.state.images}
                                value={this.state.currentImage}
                                onChange={(value: string) => {
                                    this.onCurrentImageChange(value);
                                }}
                            />
                        </Form>
                    </div>
                </div>
                <div className={'row'}>
                    <div className={'col-xs-12 col-sm-12 col-md-3 col-lg-3'}>
                        <div className={'tile-set-preview'} >
                            <Board
                                isSelecting={true}
                                isHighlighting={false}
                                collection={collection}
                                imageMap={this.props.imageMap}
                                gridEnabled={true}
                                currentLayer={0}
                            />
                        </div>
                    </div>
                    <div className={'col-xs-12 col-sm-12 col-md-9 col-lg-9'}>
                        <div className={'tile-set-board'}>
                            <Board
                                ref={board => { this.board = board; }}
                                isSelecting={true}
                                isHighlighting={true}
                                onCurrentTileUpdate={(t: Tile) => {
                                    this.updateTile(t);
                                }}
                                collection={this.state.collection}
                                imageMap={this.props.imageMap}
                                gridEnabled={true}
                                currentLayer={0}
                            />
                        </div>
                    </div>
                </div>
                <div className={'row'}>
                    <div className={'col-xs-12 col-sm-12 col-md-12 col-lg-12'}>
                        <Form>
                            <FileItem
                                accept={'.png,.jpg'}
                                multiple={true}
                                onChange={(files: FileList) => {
                                    for (let i = 0; i < files.length; i++) {
                                        if (this.props.imageMap.get(files.item(i).name)) {
                                            continue;
                                        }
                                        let img = new Image();
                                        img.src = URL.createObjectURL(files.item(i));
                                        img.onload = () => {
                                            store.dispatch(putImage(img, files.item(i).name));
                                            let images = this.state.images;
                                            images.push(files.item(i).name);
                                            this.setState({images: images});
                                        };
                                    }
                                }}
                            />
                        </Form>
                    </div>
                </div>
            </div>
        );
    }

    private onCurrentImageChange(currentImage: string): void {
        let img = this.props.imageMap.get(currentImage);
        if (img) {
            let collection = this.state.collection.clone();
            let width = img.width;
            let height = img.height;
            let tileWidth = collection.getTilePixelWidth();
            let tileHeight = collection.getTilePixelHeight();
            let numTiles = floor(width * height / (tileWidth * tileHeight));
            let newCollectionHeight = ceil(numTiles / 4);

            collection.setLayerHeight(newCollectionHeight);
            let tileStride = width / tileWidth;
            let index = 0;
            for (let y = 0; y < collection.getLayerHeight(); y++) {
                for (let x = 0; x < collection.getLayerWidth(); x++) {
                    collection.getLayer(0).setTile(x, y, new Tile({
                        imageSrc: currentImage,
                        tileCoords: new Vector(floor(index % tileStride), floor(index / tileStride)),
                        pixelSize: new Vector(tileWidth, tileHeight)
                    }));
                    index++;
                }
            }
            this.setState({collection, currentImage});
        }
    }

    private updateTile(t: Tile): void {
        if (!store.getState().board.eraseEnabled) {
            store.dispatch(setDrawingTile(t));
        }
    }
}