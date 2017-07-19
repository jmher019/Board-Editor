import * as React from 'react';
import { Vector, floor } from '../../utils/math-utils';
import ImageMap from '../../utils/image-map';
import DOMUtils from '../../utils/dom-utils';
import Canvas from './canvas';
import Tile from '../../board-editor-modules/layer/image-tile';
import TileLayerCollection from '../../board-editor-modules/layer/tile-layer-collection';
import EditUtils, { EditAction, DRAW_START, DRAW } from '../../utils/undo-redo-utils';

interface State {
    
}

interface Props {
    isHighlighting: boolean;
    collection: TileLayerCollection;
    imageMap: ImageMap;
    currentLayer: number;
    gridEnabled?: boolean;
    drawingTile?: Tile;
    x?: number;
    y?: number;
    isSelecting?: boolean;
    onCurrentTileUpdate?: (t: Tile) => void;
    visibleLayers?: boolean[];
    bucketFill?: boolean;
}

export default class Board extends React.Component<Props, State> {
    private cvs: Canvas | null;
    private currentTilePos: Vector;
    private isHovering: boolean;
    private isDrawing: boolean;
    private sizeInvalidated: boolean;

    constructor(props: Props) {
        super(props);
        this.state = this.getInitialState();
        this.isDrawing = false;
        this.isHovering = false;
        this.sizeInvalidated = false;
    }

    public getInitialState(): State {
        return {} as State;
    }

    public render(): JSX.Element {
        return (
            <Canvas
                width={this.props.collection.getTilePixelWidth() * this.props.collection.getLayerWidth()}
                height={this.props.collection.getTilePixelHeight() * this.props.collection.getLayerHeight()}
                x={this.props.x}
                y={this.props.y}
                ref={cvs => { this.cvs = cvs; }}
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
            />
        );
    }

    public componentDidMount(): void {
        this.refreshBoard();
    }

    public componentWillReceiveProps(next: Props) {
        if (this.cvs) {
            this.sizeInvalidated = this.cvs.props.width !== 
                next.collection.getLayerWidth() * next.collection.getTilePixelWidth() ||
                this.cvs.props.height !== next.collection.getLayerHeight() * next.collection.getTilePixelHeight() ||
                this.props.collection !== next.collection ||
                (next.gridEnabled !== undefined && this.props.gridEnabled !== next.gridEnabled) ||
                this.props.collection.getNumberOfLayers() !== next.collection.getNumberOfLayers() ||
                this.props.visibleLayers !== next.visibleLayers ? true : false;
        }
    }

    public componentDidUpdate() {
        if (this.sizeInvalidated) {
            this.refreshBoard();
            this.sizeInvalidated = false;
        }
    }

    public onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
        if (e.button !== 0) {
            return;
        }

        if (!this.props.isSelecting && (EditUtils.undo.length === 0 ||
            EditUtils.undo[EditUtils.undo.length - 1].type !== DRAW_START)) {
            let editAction = {
                type: DRAW_START
            } as EditAction;
            EditUtils.pushAction(editAction);
        }

        this.isDrawing = true;
        this.onMouseMove(e);
        DOMUtils.eventer.once(document, 'mouseup', this.onMouseUp, this);
        if (this.props.onCurrentTileUpdate) {
            this.props.onCurrentTileUpdate(
                this.props.collection.getLayer(this.props.currentLayer).getTile(
                    this.currentTilePos.getX(), this.currentTilePos.getY()
                )
            );
        }
    }

    public onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
        let currentTilePos = this.getTilePosFromCursor(e);

        if (this.currentTilePos && !this.currentTilePos.equals(currentTilePos)) {
            if (this.cvs) {
                this.cvs.draw(() => {
                    this.refreshCurrentTile('#666');
                });
            }
        }
        this.currentTilePos = currentTilePos;
        if (this.isDrawing && this.isHovering && !this.props.isSelecting && this.props.drawingTile) {
            let layer = this.props.collection.getLayer(this.props.currentLayer);
            if (layer && layer.isVisible()) {
                let tile = layer.getTile(currentTilePos.getX(), currentTilePos.getY()).clone();
                layer.setTile(currentTilePos.getX(), currentTilePos.getY(),
                              this.props.drawingTile, this.props.bucketFill);
                if (!tile.equals(this.props.drawingTile)) {
                    let editAction = {
                        type: DRAW,
                        x: currentTilePos.getX(),
                        y: currentTilePos.getY(),
                        tile: tile,
                        bucketFill: this.props.bucketFill,
                        layerIndex: this.props.currentLayer
                    } as EditAction;
                    EditUtils.pushAction(editAction);
                }
                
                if (this.props.bucketFill) {
                    this.refreshBoard();
                }
            }
        }

        if (this.props.isHighlighting) {
            if (this.cvs) {
                this.cvs.draw(() => {
                    this.refreshCurrentTile('#ff0');
                });
            }
        }
    }

    public onMouseUp(e: React.MouseEvent<Document>) {
        this.isDrawing = false;
    }

    public onMouseLeave(e: React.MouseEvent<HTMLCanvasElement>) {
        this.isHovering = false;
        if (this.cvs) {
            this.cvs.draw(() => {
                this.refreshCurrentTile('#666');
            });
        }
    }

    public onMouseEnter(e: React.MouseEvent<HTMLCanvasElement>) {
        this.isHovering = true;
        if (this.props.isHighlighting) {
            if (this.cvs) {
                this.cvs.draw(() => {
                    this.refreshCurrentTile('#ff0');
                });
            }
        }
    }

    public setTile(x: number, y: number, tile: Tile) {
        let layer = this.props.collection.getLayer(this.props.currentLayer);
        if (layer) {
            layer.setTile(x, y, tile);
            this.currentTilePos = new Vector(x, y);
            if (this.cvs) {
                this.cvs.draw(() => {
                    this.refreshTile(x, y, '#666');
                });
            }
        }
    }

    private getTilePosFromCursor(e: React.MouseEvent<HTMLCanvasElement>): Vector {
        let currentTilePos = new Vector(0, 0);
        if (this.cvs) {
            let canvas = this.cvs.getCanvas();
            if (canvas) {
                let rect = canvas.getBoundingClientRect();
                let cvsPos = new Vector(rect.left, rect.top);
                let pos = (new Vector(e.clientX, e.clientY)).subtract(cvsPos);
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
        }

        return currentTilePos;
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

        this.refreshTile(x, y, color);
    }

    private refreshTile(x: number, y: number, color: string) {
        if (this.cvs) {
            let canvas = this.cvs.getCanvas();
            if (canvas) {
                let ctx = canvas.getContext('2d');
                if (ctx) {
                    let pWidth = this.props.collection.getTilePixelWidth();
                    let pHeight = this.props.collection.getTilePixelHeight();

                    ctx.clearRect(x * pWidth, y * pHeight, pWidth, pHeight);

                    let arr = this.props.collection.getVisibleTiles(x, y);
                    for (let i = 0; i < arr.length; i++) {
                        let tile = arr[i];
                        let img = this.props.imageMap.get(tile.getImageSrc());
                        if (img) {
                            ctx.drawImage(
                                img, tile.getTileX() * pWidth, tile.getTileY() * pHeight, pWidth, pHeight,
                                x * pWidth, y * pHeight, pWidth, pHeight
                            );
                        }
                    }

                    if (this.props.gridEnabled) {
                        ctx.fillStyle = color;
                        ctx.fillRect(x * pWidth, y * pHeight, 2, pHeight);
                        ctx.fillRect(x * pWidth, y * pHeight, pWidth, 2);
                        ctx.fillRect((x + 1) * pWidth - 2, y * pHeight, 2, pHeight);
                        ctx.fillRect(x * pWidth, (y + 1) * pHeight - 2, pWidth, 2);
                    }
                }
            }
        }
        
    }

    private refreshBoard(): void {
        if (this.cvs) {
            this.cvs.draw(() => {
                for (let x = 0; x < this.props.collection.getLayerWidth(); x++) {
                    for (let y = 0; y < this.props.collection.getLayerHeight(); y++) {
                        this.refreshTile(x, y, '#666');
                    }
                }
            });
        }
    }
}