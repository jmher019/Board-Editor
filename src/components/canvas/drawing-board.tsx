import * as React from 'react';
import TileLayerCollection from '../../board-editor-modules/layer/tile-layer-collection';
import ImageMap from '../../utils/image-map';
import Tile from '../../board-editor-modules/layer/image-tile';
import Canvas from './canvas';
import { ceil, floor, Vector } from '../../utils/math-utils';
import EditUtils, { DRAW_START, EditAction, DRAW } from '../../utils/undo-redo-utils';
import DOMUtils from '../../utils/dom-utils';

interface State {

}

interface Props {
  mode: DrawingBoardMode;
  highlightTiles: boolean;
  collection: TileLayerCollection;
  imageMap: ImageMap;
  drawingLayerIndex: number;
  collisonLayerIndex?: number;
  eventLayerIndex?: number;
  gridEnabled?: boolean;
  drawingTile?: Tile;
  x?: number;
  y?: number;
  onTileSelect?: (t: Tile) => void;
  visibleLayers?: boolean[];
}

export enum DrawingBoardMode {
  DRAWING,
  DRAWING_BUCKET_FILL,
  DRAWING_ERASING,
  SELECTING_TILE,
  DRAWING_COLLISON_WALLS,
  DRAWING_EVENT_TRIGGERS
}

const BoardWidth = 16;
const BoardHeight = 16;

export default class DrawingBoard extends React.Component<Props, State> {
  private cachedCanvases: JSX.Element[];
  private boardCanvases: Array<Canvas | null>;
  private canvasBlocksX: number;
  private sizeInvalidated: boolean;
  private currentTilePos: Vector;
  private div: HTMLDivElement;
  private isHovering: boolean;
  private isInteracting: boolean;
  
  constructor(props: Props) {
    super(props);
    this.state = this.getInitialState();
    this.sizeInvalidated = true;
    this.isHovering = false;
    this.isInteracting = false;
  }

  public getInitialState(): State {
    return {} as State;
  }

  public render(): JSX.Element {
    if (this.sizeInvalidated) {
      this.getBoardCanvases();
    }
    
    return (
      <div
        ref={div => { this.div = div; }}
        style={{
          position: 'absolute',
          top: this.props.x + 'px',
          left: this.props.y + 'px',
          width: (this.props.collection.getLayerWidth() * this.props.collection.getTilePixelWidth()) + 'px',
          height: (this.props.collection.getLayerHeight() * this.props.collection.getTilePixelHeight()) + 'px',
        }}
        onMouseDown={e => {
            this.onMouseDown(e);
        }}
        onMouseEnter={e => {
            this.onMouseEnter(e);
        }}
        onMouseLeave={e => {
            this.onMouseLeave(e);
        }}
        onMouseMove={e => {
            this.onMouseMove(e);
        }}
      >
        {this.cachedCanvases}
      </div>
    );
  }

  public componentDidMount(): void {
    this.refreshBoard();
  }

  public componentWillReceiveProps(next: Props) {
    this.sizeInvalidated = 
      this.props.collection !== next.collection ||
      (next.gridEnabled !== undefined && this.props.gridEnabled !== next.gridEnabled) ? true : false;

    // Check if the visible layers has changed
    if (!this.sizeInvalidated) {
      if (this.props.visibleLayers !== next.visibleLayers) {
        if (!this.props.visibleLayers || !next.visibleLayers) {
          this.sizeInvalidated = true;
        } else if (this.props.visibleLayers && next.visibleLayers) {
          let maxLength = this.props.visibleLayers.length > next.visibleLayers.length ?
              this.props.visibleLayers.length : next.visibleLayers.length;
          for (let i = 0; i < maxLength; i++) {
            if (this.props.visibleLayers[i] !== next.visibleLayers[i]) {
              this.sizeInvalidated = true;
              break;
            }
          }
        }
      }
    }
  }

  public componentDidUpdate() {
    if (this.sizeInvalidated) {
      this.refreshBoard();
      this.sizeInvalidated = false;
    }
  }

  public setTile(x: number, y: number, tile: Tile) {
    let layer = this.props.collection.getLayer(this.props.drawingLayerIndex);
    if (layer) {
      layer.setTile(x, y, tile);
      this.currentTilePos = new Vector(x, y);
      this.refreshTile(x, y, '#666', true);
    }
  }

  public onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.button !== 0) {
      return;
    }

    if (this.isDrawing() && (EditUtils.undo.length === 0 ||
      EditUtils.undo[EditUtils.undo.length - 1].type !== DRAW_START)) {
      let editAction = {
        type: DRAW_START
      } as EditAction;
      EditUtils.pushAction(editAction);
    }

    this.isInteracting = true;
    this.onMouseMove(e);
    DOMUtils.eventer.once(document, 'mouseup', this.onMouseUp, this);
    if (this.props.onTileSelect) {
      this.props.onTileSelect(
        this.props.collection.getLayer(this.props.drawingLayerIndex).getTile(
          this.currentTilePos.getX(), this.currentTilePos.getY()
        )
      );
    }
  }

  public onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    let currentTilePos = this.getTilePosFromCursor(e);

    if (this.currentTilePos && !this.currentTilePos.equals(currentTilePos)) {
      this.refreshCurrentTile('#666');
    }
    
    this.currentTilePos = currentTilePos;
    if (this.isInteracting && this.isHovering && this.isDrawing() && this.props.drawingTile) {
      let layer = this.props.collection.getLayer(this.props.drawingLayerIndex);
      if (layer && layer.isVisible()) {
        let tile = layer.getTile(currentTilePos.getX(), currentTilePos.getY()).clone();
        if (!tile.equals(this.props.drawingTile)) {
          let clonedLayer = this.props.mode === DrawingBoardMode.DRAWING_BUCKET_FILL ? layer.clone() : undefined;
          let editAction = {
            type: DRAW,
            x: currentTilePos.getX(),
            y: currentTilePos.getY(),
            tile: tile,
            bucketFill: this.props.mode === DrawingBoardMode.DRAWING_BUCKET_FILL,
            layerIndex: this.props.drawingLayerIndex,
            layer: clonedLayer
          } as EditAction;
          EditUtils.pushAction(editAction);
        }

        layer.setTile(currentTilePos.getX(), currentTilePos.getY(),
                      this.props.drawingTile, this.props.mode === DrawingBoardMode.DRAWING_BUCKET_FILL);
        
        if (!tile.equals(this.props.drawingTile) && this.props.mode === DrawingBoardMode.DRAWING_BUCKET_FILL) {
          this.refreshBoard();
        }
      }
    }

    if (this.props.highlightTiles) {
      this.refreshCurrentTile('#ff0');
    }
  }

  public onMouseUp(e: React.MouseEvent<Document>) {
    this.isInteracting = false;
  }

  public onMouseLeave(e: React.MouseEvent<HTMLDivElement>) {
    this.isHovering = false;
    this.refreshCurrentTile('#666');
  }

  public onMouseEnter(e: React.MouseEvent<HTMLDivElement>) {
    this.isHovering = true;
    if (this.props.highlightTiles) {
      this.refreshCurrentTile('#ff0');
    }
  }

  private getBoardCanvases(): void {
    this.boardCanvases = [];
    this.cachedCanvases = [];
    let width = this.props.collection.getLayerWidth();
    let height = this.props.collection.getLayerHeight();
    let tileWidth = this.props.collection.getTilePixelWidth();
    let tileHeight = this.props.collection.getTilePixelHeight();
    
    let blocksX = ceil(width / BoardWidth);
    let blocksY = ceil(height / BoardHeight);

    let index = 0;
    for (let y = 0; y < blocksY; y++) {
      let pY = y * BoardHeight * tileHeight;
      let pH = BoardHeight * tileHeight;

      if (y === blocksY - 1) {
        pH = height * tileHeight - pY;
      }

      for (let x = 0; x < blocksX; x++) {
        let pX = x * BoardWidth * tileWidth;
        let pW = BoardWidth * tileWidth;

        if (x === blocksX - 1) {
          pW = width * tileWidth - pX;
        }

        this.boardCanvases.push(null);
        this.cachedCanvases.push(
          <Canvas
            ref={canvas => {
              if (canvas) {
                this.boardCanvases[canvas.props.idKey] = canvas;
              }
            }}
            x={pX}
            y={pY}
            width={pW}
            height={pH}
            key={index}
            idKey={index}
          />
        );

        index++;
      }
    }

    this.canvasBlocksX = blocksX;
  }

  private refreshTile(x: number, y: number, color: string, refreshCanvas?: boolean) {
    if (this.boardCanvases) {
      let index = floor(x / BoardWidth) + this.canvasBlocksX * floor(y / BoardHeight);
      let cvs = this.boardCanvases[index];
      let pX = x - floor(x / BoardWidth) * BoardWidth;
      let pY = y - floor(y / BoardHeight) * BoardHeight;
      if (cvs) {
        let canvas = cvs.getCanvas();
        if (canvas) {
          let ctx = canvas.getContext('2d');
          if (ctx) {
            let pWidth = this.props.collection.getTilePixelWidth();
            let pHeight = this.props.collection.getTilePixelHeight();

            ctx.clearRect(pX * pWidth, pY * pHeight, pWidth, pHeight);

            let arr = this.props.collection.getVisibleTiles(x, y);
            for (let i = 0; i < arr.length; i++) {
              let tile = arr[i];
              let img = this.props.imageMap.get(tile.getImageSrc());
              if (img) {
                ctx.drawImage(
                    img, tile.getTileX() * pWidth, tile.getTileY() * pHeight, pWidth, pHeight,
                    pX * pWidth, pY * pHeight, pWidth, pHeight
                );
              }
            }

            if (this.props.gridEnabled) {
              ctx.fillStyle = color;
              ctx.fillRect(pX * pWidth, pY * pHeight, 2, pHeight);
              ctx.fillRect(pX * pWidth, pY * pHeight, pWidth, 2);
              ctx.fillRect((pX + 1) * pWidth - 2, pY * pHeight, 2, pHeight);
              ctx.fillRect(pX * pWidth, (pY + 1) * pHeight - 2, pWidth, 2);
            }
          }
          if (refreshCanvas) {
            cvs.refresh();
          }
        }
      }
    }
  }

  private refreshBoard(): void {
    for (let x = 0; x < this.props.collection.getLayerWidth(); x++) {
        for (let y = 0; y < this.props.collection.getLayerHeight(); y++) {
            this.refreshTile(x, y, '#666');
        }
    }
    this.refreshCanvases();
  }

  private refreshCanvases(): void {
    if (this.boardCanvases) {
      for (let i = 0; i < this.boardCanvases.length; i++) {
        let canvas = this.boardCanvases[i];
        if (canvas) {
          canvas.refresh();
        }
      }
    }
  }

  private refreshCurrentTile(color: string): void {
    if (!this.currentTilePos) {
      return;
    }

    let x = this.currentTilePos.getX();
    let y = this.currentTilePos.getY();

    if (x >= this.props.collection.getLayerWidth()) {
      x = this.props.collection.getLayerWidth() - 1;
    }
    if (y >= this.props.collection.getLayerHeight()) {
      y = this.props.collection.getLayerHeight() - 1;
    }

    this.refreshTile(x, y, color, true);
  }

  private getTilePosFromCursor(e: React.MouseEvent<HTMLDivElement>): Vector {
    let currentTilePos = new Vector(0, 0);
    if (this.div) {
      let rect = this.div.getBoundingClientRect();
      let divPos = new Vector(rect.left, rect.top);
      let pos = (new Vector(e.clientX, e.clientY)).subtract(divPos);
      let pWidth = this.props.collection.getTilePixelWidth();
      let pHeight = this.props.collection.getTilePixelHeight();

      currentTilePos = new Vector(floor(pos.getX() / pWidth), floor(pos.getY() / pHeight));
  
      if (currentTilePos.getX() < 0) {
          currentTilePos.setX(0);
      } else if (currentTilePos.getX() > pWidth * this.props.collection.getLayerWidth()) {
          currentTilePos.setX(this.props.collection.getLayerWidth() - 1);
      }

      if (currentTilePos.getY() < 0) {
          currentTilePos.setY(0);
      } else if (currentTilePos.getY() > pHeight * this.props.collection.getLayerHeight()) {
          currentTilePos.setY(this.props.collection.getLayerHeight() - 1);
      }
    }

    return currentTilePos;
  }

  private isDrawing(): boolean {
    switch (this.props.mode) {
      case DrawingBoardMode.DRAWING: return true;
      case DrawingBoardMode.DRAWING_BUCKET_FILL: return true;
      case DrawingBoardMode.DRAWING_ERASING: return true;
      case DrawingBoardMode.SELECTING_TILE: return false;
      case DrawingBoardMode.DRAWING_COLLISON_WALLS: return false;
      case DrawingBoardMode.DRAWING_EVENT_TRIGGERS: return false;
      default: return false;
    }
  }
}