import './layers-panel.css';
import * as React from 'react';
import TileLayerCollection from '../../board-editor-modules/layer/tile-layer-collection';
import { ButtonToolbar, ButtonGroup, Button, Glyphicon } from 'react-bootstrap';
import { store, Store, areLayersVisible } from '../../stores/store';
import { toggleVisibility, addLayer, selectLayer, removeLayer, moveLayer } from '../../stores/board.store';
import EditUtils, { EditAction, SELECT_LAYER, TOGGLE_VISIBILITY, REMOVE_LAYER, MOVE_LAYER,
    ADD_LAYER } from '../../utils/undo-redo-utils';

const { connect } = require('react-redux');

interface DispatchProps {
    toggleVisibility: (i: number) => Store;
}

interface StateProps {
    visibleLayers: boolean[];
}

const mapStateToProps = (state: Store) => {
    return {
        visibleLayers: areLayersVisible(state)
    };
};

const mapDispatchToProps = (dispatch: (T: {}) => void) => {
    return {
        toggleVisibility: (i: number) => {
            dispatch(toggleVisibility(i));
        }
    };
};

interface Props {
    tileLayerCollection: TileLayerCollection;
}

interface State {

}

class LayersPanel extends React.Component<Props & DispatchProps & StateProps, State> {
    constructor(props: Props & DispatchProps & StateProps) {
        super(props);
        this.state = this.getInitialState();
    }

    public getInitialState(): State {
        return {} as State;
    }

    public render(): JSX.Element {
        return (
            <div className={'layers-panel'}>
                <div className={'layer-components-container'}>
                    {this.getLayerDivs()}
                    <Button
                        style={{
                            marginTop: '10px',
                            marginLeft: '25%'
                        }}
                        onClick={() => {
                            let editAction = {
                                type: ADD_LAYER,
                                layerIndex: store.getState().board.collection.getNumberOfLayers()
                            } as EditAction;
                            store.dispatch(addLayer());
                            EditUtils.pushAction(editAction);
                        }}
                    >
                        Add Layer
                    </Button>
                </div>
            </div>
        );
    }

    private getLayerDivs(): JSX.Element[] {
        let ret: JSX.Element[] = [];
        const length: number = this.props.tileLayerCollection.getNumberOfLayers();
        let selectedIndex: number = store.getState().board.selectedLayer;
        for (let i = 0; i < length; i++) {
            const layer = this.props.tileLayerCollection.getLayer(i);
            ret.push(
            <div className={'container-fluid layer-component'} key={'Layer ' + i}>
                <div className={'row'}>
                    <div className={'col-xs-12 col-sm-12 col-md-4 col-lg-4'}>
                        <label
                            className={selectedIndex === i ? 'layer-component-label selected' : 'layer-component-label'}
                            onClick={() => {
                                let editAction = {
                                    type: SELECT_LAYER,
                                    layerIndex: store.getState().board.selectedIndex,
                                    layerIndexDest: i
                                } as EditAction;
                                store.dispatch(selectLayer(i));
                                EditUtils.pushAction(editAction);
                            }}
                        >
                            {layer.getName() || ('Layers' + (i + 1))}
                        </label>
                    </div>
                    <div className={'col-xs-12 col-sm-12 col-md-8 col-lg-8'}>
                        <div className={'layer-component-buttons'}>
                            <ButtonToolbar>
                                <ButtonGroup>
                                    <Button
                                        bsSize={'xsmall'}
                                        onClick={() => {
                                            let editAction = {
                                                type: TOGGLE_VISIBILITY,
                                                layerIndex: i
                                            } as EditAction;
                                            store.dispatch(toggleVisibility(i));
                                            EditUtils.pushAction(editAction);
                                        }}
                                        onDoubleClick={() => {
                                            // do nothing yet
                                        }}
                                    >
                                        <Glyphicon
                                            glyph={
                                                this.props.visibleLayers[i] ? 
                                                    'eye-open' : 'eye-close'    
                                            }
                                        />
                                    </Button>
                                    <Button
                                        bsSize={'xsmall'}
                                        onClick={() => {
                                            let editAction = {
                                                type: REMOVE_LAYER,
                                                layerIndex: i,
                                                layer: store.getState().board.collection.getLayer(i)
                                            } as EditAction;
                                            store.dispatch(removeLayer(i));
                                            EditUtils.pushAction(editAction);
                                        }}
                                    >
                                        <Glyphicon glyph="remove-circle" />
                                    </Button>
                                    {(i === 0) ? 
                                        (this.props.tileLayerCollection.getNumberOfLayers() > 1 ? 
                                            <Button
                                                bsSize={'xsmall'}
                                                onClick={() => {
                                                    let editAction = {
                                                        type: MOVE_LAYER,
                                                        layerIndex: i,
                                                        layerIndexDest: i + 1
                                                    } as EditAction;
                                                    store.dispatch(moveLayer(i, i + 1));
                                                    EditUtils.pushAction(editAction);
                                                }}
                                            >
                                                <Glyphicon glyph={'arrow-down'} />
                                            </Button> : null) : 
                                        (i !== this.props.tileLayerCollection.getNumberOfLayers() - 1 ? 
                                            <ButtonGroup>
                                                <Button
                                                    bsSize={'xsmall'}
                                                    onClick={() => {
                                                        let editAction = {
                                                            type: MOVE_LAYER,
                                                            layerIndex: i,
                                                            layerIndexDest: i - 1
                                                        } as EditAction;
                                                        store.dispatch(moveLayer(i, i - 1));
                                                        EditUtils.pushAction(editAction);
                                                    }}
                                                >
                                                    <Glyphicon glyph={'arrow-up'} />
                                                </Button>
                                                <Button
                                                    bsSize={'xsmall'}
                                                    onClick={() => {
                                                        let editAction = {
                                                            type: MOVE_LAYER,
                                                            layerIndex: i,
                                                            layerIndexDest: i + 1
                                                        } as EditAction;
                                                        store.dispatch(moveLayer(i, i + 1));
                                                        EditUtils.pushAction(editAction);
                                                    }}
                                                >
                                                    <Glyphicon glyph={'arrow-down'} />
                                                </Button>
                                            </ButtonGroup> : 
                                            <Button
                                                bsSize={'xsmall'}
                                                onClick={() => {
                                                    let editAction = {
                                                        type: MOVE_LAYER,
                                                        layerIndex: i,
                                                        layerIndexDest: i - 1
                                                    } as EditAction;
                                                    store.dispatch(moveLayer(i, i - 1));
                                                    EditUtils.pushAction(editAction);
                                                }}
                                            >
                                                <Glyphicon glyph={'arrow-up'} />
                                            </Button>)}
                                </ButtonGroup>
                            </ButtonToolbar>
                        </div>
                    </div>
                </div>
            </div>);
        }

        return ret;
    }
}

const ReduxLayersPanel = connect(mapStateToProps, mapDispatchToProps)(LayersPanel);

export default ReduxLayersPanel;