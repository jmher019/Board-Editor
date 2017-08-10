import './tile-set-panel.css';
import * as React from 'react';
import DrawingBoard, { DrawingBoardMode } from '../canvas/drawing-board';
import { Form } from 'react-bootstrap';
import SelectItem from '../select/select-item';
import FileItem from '../button/file-button';
import { putImage, setDrawingTile, setCurrentTileset, overrideTileLayerCollection } from '../../stores/board.store';
import { store } from '../../stores/store';
import ImageMap from '../../utils/image-map';
import Tile from '../../board-editor-modules/layer/image-tile';
import ConfigurationUtils from '../../utils/configuration-utils';

interface State {
    currentImage: string;
    images: string[];
}

interface Props {
    imageMap: ImageMap;
    drawingTile: Tile;
}

export default class TileSetPanel extends React.Component<Props, State> {
    private board: DrawingBoard | null;

    constructor(props: Props) {
        super(props);
        this.state = this.getInitialState();
    }

    public getInitialState(): State {
        return {
            currentImage: '',
            images: ['Select an Image']
        } as State;
    }

    public render(): JSX.Element {
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
                            <DrawingBoard
                                mode={DrawingBoardMode.SELECTING_TILE}
                                highlightTiles={false}
                                collection={
                                    store.getState().boardStore.boards[ConfigurationUtils.TilePreviewBoardId]
                                        .collection
                                }
                                imageMap={store.getState().boardStore.imageMap}
                                gridEnabled={true}
                                drawingLayerIndex={0}
                            />
                        </div>
                    </div>
                    <div className={'col-xs-12 col-sm-12 col-md-9 col-lg-9'}>
                        <div className={'tile-set-board'}>
                            <DrawingBoard
                                ref={board => { this.board = board; }}
                                mode={DrawingBoardMode.SELECTING_TILE}
                                highlightTiles={true}
                                onTileSelect={(t: Tile) => {
                                    this.updateTile(t);
                                }}
                                collection={
                                    store.getState().boardStore.boards[ConfigurationUtils.TilesetViewerId].collection
                                }
                                imageMap={store.getState().boardStore.imageMap}
                                gridEnabled={true}
                                drawingLayerIndex={0}
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
                                    let count = files.length;
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
                                            if (--count === 0) {
                                                store.dispatch(
                                                    overrideTileLayerCollection(
                                                        store.getState().boardStore
                                                            .boards[ConfigurationUtils.DrawingBoardId]
                                                            .collection.clone()
                                                    )
                                                );
                                            }
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
        store.dispatch(setCurrentTileset(currentImage));
    }

    private updateTile(t: Tile): void {
        if (!store.getState().boardStore.boards[ConfigurationUtils.DrawingBoardId].eraseEnabled) {
            store.dispatch(setDrawingTile(t));
        }
    }
}