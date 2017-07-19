import * as React from 'react';
import GenericModal, { ModalProps } from './generic-modal';
import { Form, FormGroup, Button } from 'react-bootstrap';
import FileItem from '../button/file-button';
import { BoardSession } from '../../board-editor-modules/board-session';
import { StringMap } from '../../utils/string-map';
import TileLayerCollection,
    { TileLayerCollectionOptions } from '../../board-editor-modules/layer/tile-layer-collection';
import Tile, { TileOptions } from '../../board-editor-modules/layer/image-tile';
import { floor, Vector } from '../../utils/math-utils';
import { overrideTileLayerCollection } from '../../stores/board.store';
import { store } from '../../stores/store';
import EditUtils from '../../utils/undo-redo-utils';

interface State {
    file: File | null;
}

export default class LoadSessionModal extends React.Component<ModalProps, State> {
    constructor(props: ModalProps) {
        super(props);
        this.state = this.getInitialState();
    }

    public getInitialState(): State {
        return {
            file: null
        } as State;
    }

    public render(): JSX.Element {
        return (
            <GenericModal {...this.props}>
                <Form>
                    <FormGroup>
                        <FileItem
                            accept={'.json'}
                            onChange={(files: FileList) => {
                               this.setState({file: files.item(0)});
                            }}
                        />
                    </FormGroup>
                    <Button
                        onClick={() => {
                            this.onLoad();
                        }}
                        disabled={!this.state.file}
                    >
                        Load
                    </Button>
                </Form>
            </GenericModal>
        );
    }

    private onLoad(): void {
        let reader = new FileReader();
        reader.onload = () => {
            let session = JSON.parse(reader.result) as BoardSession;
            let imageToIdMap = session.board.images;
            let idToImage = {} as StringMap<string>;
            for (let key in imageToIdMap) {
                if (imageToIdMap[key]) {
                    idToImage[imageToIdMap[key]] = key;
                }
            }
            idToImage[''] = '';

            let width = session.board.layers.width;
            let height = session.board.layers.height;
            let tileWidth = session.board.layers.tileWidth;
            let tileHeight = session.board.layers.tileHeight;
            let numberOfLayers = session.board.layers.tiles.length;

            let collection = new TileLayerCollection({
                layerSize: new Vector(width, height),
                tilePixelSize: new Vector(tileWidth, tileHeight),
                numberOfLayers
            } as TileLayerCollectionOptions);

            for (let i = 0; i < numberOfLayers; i++) {
                for (let j = 0; j < session.board.layers.tiles[i].length; j++) {
                    let tileData = session.board.layers.tiles[i][j];
                    collection.getLayer(i).setTile(
                        floor(j % width), floor(j / width), 
                        new Tile({
                            imageSrc: idToImage[tileData.id],
                            pixelSize: new Vector(tileWidth, tileHeight),
                            tileCoords: new Vector(tileData.x, tileData.y)
                        } as TileOptions)
                    );
                }
            }

            store.dispatch(overrideTileLayerCollection(collection));
            this.setState({file: null});
            EditUtils.clearStacks();
        };
        reader.readAsText(new Blob([this.state.file], {type: 'octet/stream'}));

        if (this.props.shouldClose) {
            if (this.props.shouldClose()) {
                if (this.props.onHide) {
                    this.props.onHide();
                }
            }
        } else {
            if (this.props.onHide) {
                this.props.onHide();
            }
        }
    }
}