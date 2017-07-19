import * as React from 'react';
import TileLayerCollection from '../../board-editor-modules/layer/tile-layer-collection';
import GenericModal, { ModalProps } from './generic-modal';
import { Form, ControlLabel, FormControl, FormControlProps, FormGroup, Button } from 'react-bootstrap';
import { FormControlEventTarget } from '../../utils/form-utils';
import { BoardData, LayersData, TileData, BoardSession } from '../../board-editor-modules/board-session';
import { StringMap } from '../../utils/string-map';
import ImageMap from '../../utils/image-map';

interface Props extends ModalProps {
    collection: TileLayerCollection;
    imageMap: ImageMap;
}

interface State {
    filename: string;
}

export default class SaveSessionModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = this.getInitialState();
    }

    public getInitialState(): State {
        return {
            filename: ''
        } as State;
    }

    public render(): JSX.Element {
        return (
            <GenericModal {...this.props}>
                <Form>
                    <FormGroup>
                        <ControlLabel>Name:</ControlLabel>
                        <FormControl
                            type={'text'}
                            value={this.state.filename}
                            onChange={(e: React.FormEvent<React.Component<FormControlProps, {}>>) => {
                                this.setState({filename: (e.target as FormControlEventTarget).value});
                            }}
                        />
                    </FormGroup>
                    <Button
                        onClick={() => {
                            this.onSave();
                        }}
                        disabled={!this.state.filename || this.props.collection.getNumberOfLayers() === 0}
                    >
                        Save
                    </Button>
                </Form>
            </GenericModal>
        );
    }

  private onSave() {
    let collection = this.props.collection;
    let imageMap = this.props.imageMap;
    let session = {} as BoardSession;
    session.name = this.state.filename;
    session.board = {} as BoardData;
    
    let keys = imageMap.getKeys();
    let brd = session.board;
    brd.images = {} as StringMap<string>;
    for (let i = 0; i < keys.length; i++) {
      brd.images[keys[i]] = '' + i;
    }

    brd.layers = {} as LayersData;
    let layers = brd.layers;
    layers.width = collection.getLayerWidth();
    layers.height = collection.getLayerHeight();
    layers.tileWidth = collection.getTilePixelWidth();
    layers.tileHeight = collection.getTilePixelHeight();
    layers.tiles = new Array<Array<TileData>>();
    for (let i = 0; i < collection.getNumberOfLayers(); i++) {
      let layer = collection.getLayer(i);
      let arr = new Array<TileData>();
      for (let y = 0; y < layers.height; y++) {
        for (let x = 0; x < layers.width; x++) {
          let tile = layer.getTile(x, y);
          arr.push({
            id: brd.images[tile.getImageSrc()] ?  brd.images[tile.getImageSrc()] : '',
            x: tile.getTileX(),
            y: tile.getTileY()
          } as TileData);
        }
      }
      layers.tiles.push(arr);
    }

    let result: string = JSON.stringify(session);
    let a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    let blob = new Blob([result], {type: 'octet/stream'});
    let url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = this.state.filename + '.json';
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

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