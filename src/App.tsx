import * as React from 'react';
import BoardToolbar from './components/toolbar/board-toolbar';
import Board from './components/canvas/board';
import BoardSizeModal from './components/modal/board-size-modal';
import ConfigurationUtils from './utils/configuration-utils';
import TileSetPanel from './components/widget/tile-set-panel';
import LayersPanel from './components/widget/layers-panel';
import { store, Store, areLayersVisible } from './stores/store';
import { ButtonToolbar, ButtonGroup, Button, Glyphicon } from 'react-bootstrap';
import { toggleGrid, ToggleAction, setDrawingTile, toggleErase, togglePicker,
  toggleBucketFill } from './stores/board.store';
import SaveSessionModal from './components/modal/save-session-modal';
import LoadSessionModal from './components/modal/load-session-modal';
import Tile from './board-editor-modules/layer/image-tile';
import DOMUtils from './utils/dom-utils';
import EditUtils from './utils/undo-redo-utils';

const { connect } = require('react-redux');

document.body.style.background = 'rgb(35, 35, 35)';

DOMUtils.eventer.on(
  document,
  'keydown',
  (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.ctrlKey && e.keyCode === 90) {
      EditUtils.undoAction();
    } else if (e.ctrlKey && e.keyCode === 89) {
      EditUtils.redoAction();
    }
  },
  document
);

interface State {
  displayBoardSize: boolean;
  displaySaveBoard: boolean;
  displayLoadBoard: boolean;
}

interface StateProps {
  gridEnabled: boolean;
  visibleLayers: boolean[];
  eraseEnabled: boolean;
  bucketFillEnabled: boolean;
  pickerEnabled: boolean;
}

interface DispatchProps {
  toggleGrid: (toggle: boolean) => ToggleAction;
  toggleErase: (toggle: boolean) => ToggleAction;
  toggleBucketFill: (toggle: boolean) => ToggleAction;
  togglePicker: (toggle: boolean) => ToggleAction;
}

const mapStateToProps = (state: Store) => {
  return {
    gridEnabled: state.board.gridEnabled,
    visibleLayers: areLayersVisible(state),
    eraseEnabled: state.board.eraseEnabled,
    bucketFillEnabled: state.board.bucketFillEnabled,
    pickerEnabled: state.board.pickerEnabled
  };
};

const mapDispatchToProps = (dispatch: (T: {}) => void) => {
  return {
    toggleGrid: (toggle: boolean) => { dispatch(toggleGrid(toggle)); },
    toggleErase: (toggle: boolean) => { dispatch(toggleErase(toggle)); },
    togglePicker: (toggle: boolean) => { dispatch(togglePicker(toggle)); },
    toggleBucketFill: (toggle: boolean) => { dispatch(toggleBucketFill(toggle)); }
  };
};

class App extends React.Component<StateProps & DispatchProps, State> {
  constructor(props: StateProps & DispatchProps) {
    super(props);
    this.state = this.getInitialState();
  }

  public getInitialState(): State {
    return  {
      displayBoardSize: false,
      brdLayerWidth: 0,
      brdLayerHeight: 0,
      displaySaveBoard: false,
      displayLoadBoard: false
    } as State;
  }

  public render(): JSX.Element {
    return (
      <div className={'container-fluid'}>
        <div className={'row'}>
          <div className={'col-xs-12 col-sm-12 col-md-12 col-lg-12'}>
            <BoardToolbar
              onNewBoardSpecifySizeClick={() => { this.setState({displayBoardSize: true}); }}
              onSaveBoardClick={() => { this.setState({displaySaveBoard: true}); }}
              onLoadBoardClick={() => { this.setState({displayLoadBoard: true}); }}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col-xs-2 col-sm-2 col-md-2 col-lg-2'}>
            <TileSetPanel
              imageMap={store.getState().board.imageMap}
              drawingTile={store.getState().board.drawingTile}
            />
          </div>
          <div className={'col-xs-8 col-sm-8 col-md-8 col-lg-8'}>
            <div
              style={{
                width: '100%',
                height: '500px',
                overflow: 'auto',
                border: '1px solid #666',
                position: 'relative',
                top: '0px',
                left: '0px',
                boxShadow: '1px 1px 1px rgba(102, 102, 102, 0.6)',
                background: 'rgb(45, 45, 45)'
              }}
            >
              <Board
                isHighlighting={true}
                collection={store.getState().board.collection}
                imageMap={store.getState().board.imageMap}
                drawingTile={store.getState().board.drawingTile}
                gridEnabled={this.props.gridEnabled}
                visibleLayers={this.props.visibleLayers}
                currentLayer={store.getState().board.selectedLayer}
                bucketFill={this.props.bucketFillEnabled}
                isSelecting={this.props.pickerEnabled}
                onCurrentTileUpdate={(t: Tile) => { store.dispatch(setDrawingTile(t)); }}
              />
            </div>
          </div>
          <div className={'col-xs-2 col-sm-2 col-md-2 col-lg-2'}>
            <LayersPanel
              tileLayerCollection={store.getState().board.collection}
            />
          </div>
        </div>
        <div 
          className={'row'}
          style={{
            marginTop: '10px'
          }}  
        >
          <div className={'col-xs-2 col-sm-2 col-md-2 col-lg-2'} />
          <div className={'col-xs-8 col-sm-8 col-md-8 col-lg-8'}>
            <ButtonToolbar>
              <ButtonGroup>
                <Button
                  onClick={() => { this.props.toggleGrid(!this.props.gridEnabled); }}
                  bsStyle={this.props.gridEnabled ? 'success' : 'default'}
                >
                  <Glyphicon glyph="th" />
                </Button>
                <Button
                  onClick={() => { this.setState({displaySaveBoard: true}); }}
                >
                  <Glyphicon glyph="floppy-disk" />
                </Button>
                <Button
                  onClick={() => { this.setState({displayLoadBoard: true}); }}
                >
                  <Glyphicon glyph="folder-open" />
                </Button>
              </ButtonGroup>
              <ButtonGroup>
                <Button
                  onClick={() => {
                    this.props.toggleErase(false);
                    this.props.togglePicker(false);
                    this.props.toggleBucketFill(!this.props.bucketFillEnabled);
                  }}
                  bsStyle={this.props.bucketFillEnabled ? 'success' : 'default'}
                >
                  <Glyphicon glyph="tint" />
                </Button>
                <Button
                  onClick={() => {
                    this.props.toggleErase(false);
                    this.props.togglePicker(!this.props.pickerEnabled);
                    this.props.toggleBucketFill(false);
                  }}
                  bsStyle={this.props.pickerEnabled ? 'success' : 'default'}
                >
                  <Glyphicon glyph="pushpin" />
                </Button>
                <Button
                  onClick={() => {
                    this.props.toggleErase(!this.props.eraseEnabled);
                    this.props.togglePicker(false);
                    this.props.toggleBucketFill(false);
                  }}
                  bsStyle={this.props.eraseEnabled ? 'success' : 'default'}
                >
                  <Glyphicon glyph="erase" />
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
          </div>
          <div className={'col-xs-2 col-sm-2 col-md-2 col-lg-2'} />
        </div>
        <BoardSizeModal
          display={this.state.displayBoardSize}
          width={ConfigurationUtils.BoardSizeModalWidth}
          height={ConfigurationUtils.BoardSizeModalHeight}
          shouldClose={() => { return true; }}
          onHide={() => { this.setState({displayBoardSize: false}); }}
          title={'Set Board Dimensions in Tiles'}
        />
        <SaveSessionModal
          display={this.state.displaySaveBoard}
          width={ConfigurationUtils.SaveBoardModalWidth}
          height={ConfigurationUtils.SaveBoardModalHeight}
          shouldClose={() => { return true; }}
          onHide={() => { this.setState({displaySaveBoard: false}); }}
          title={'Save Board'}
          collection={store.getState().board.collection}
          imageMap={store.getState().board.imageMap}
        />
        <LoadSessionModal
          display={this.state.displayLoadBoard}
          width={ConfigurationUtils.LoadBoardModalWidth}
          height={ConfigurationUtils.LoadBoardModalHeight}
          shouldClose={() => { return true; }}
          onHide={() => { this.setState({displayLoadBoard: false}); }}
          title={'Load Board'}
        />
      </div>
    );
  }
}

const ReduxApp = connect(mapStateToProps, mapDispatchToProps)(App);

export default ReduxApp;