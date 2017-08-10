import { Vector } from '../../utils/math-utils';
import Tile, { TileOptions } from './image-tile';

export interface TileLayerOptions {
    tilePixelSize: Vector;
    layerSize: Vector;
}

export default class TileLayer {
  private options: TileLayerOptions;
  private tiles: Array<Array<Tile>>;
  private displaying: boolean;
  private name: string;

  constructor(options: TileLayerOptions) {
    this.options = options;
    this.displaying = true;
    this.reset();
  }

  public clone(): TileLayer {
    let clone = new TileLayer({
      layerSize: this.options.layerSize.clone(),
      tilePixelSize: this.options.tilePixelSize.clone()
    } as TileLayerOptions);

    for (let x = 0; x < this.getLayerWidth(); x++) {
      for (let y = 0; y < this.getLayerHeight(); y++) {
        let cloneTile = clone.getTile(x, y);
        let tile = this.getTile(x, y);
        cloneTile.setImageSrc(tile.getImageSrc());
        cloneTile.setTileX(tile.getTileX());
        cloneTile.setTileY(tile.getTileY());
      }
    }

    clone.setName(this.getName());
    clone.displaying = this.isVisible();
    return clone;
  }

  public reset(): TileLayer {
    let width = this.getLayerWidth();
    let height = this.getLayerHeight();
    this.tiles = new Array<Array<Tile>>();
      
    for (let y = 0; y < height; y++) {
      let arr = new Array<Tile>();
      for (let x = 0; x < width; x++) {
        arr.push(new Tile({
          imageSrc: '',
          pixelSize: this.options.tilePixelSize,
          tileCoords: new Vector(0, 0)
        } as TileOptions));
      }
      this.tiles.push(arr);
    }
    return this;
  }

  public getTilePixelWidth(): number {
    return this.options.tilePixelSize.getX();
  }

  public setTilePixelWidth(w: number): TileLayer {
    this.options.tilePixelSize.setX(w);
    return this;
  }

  public getTilePixelHeight(): number {
    return this.options.tilePixelSize.getY();
  }

  public setTilePixelHeight(h: number): TileLayer {
    this.options.tilePixelSize.setY(h);
    return this;
  }

  public getLayerWidth(): number {
    return this.options.layerSize.getX();
  }

  public setLayerWidth(w: number): TileLayer {
    let width = this.getLayerWidth();
    this.options.layerSize.setX(w);

    let getNewRow = (row: number): Array<Tile> => {
      let arr = new Array<Tile>();

      if (row > this.tiles.length - 1) {
        for (let i = 0; i < this.getLayerWidth(); i++) {
          arr.push(new Tile({
            imageSrc: '',
            pixelSize: this.options.tilePixelSize,
            tileCoords: new Vector(0, 0)
          } as TileOptions));
        }
      } else {
        let i = 0;
        while (i < width && i < this.getLayerWidth()) {
          arr.push(this.getTile(i++, row));
        }

        while (i < this.getLayerWidth()) {
          arr.push(new Tile({
            imageSrc: '',
            pixelSize: this.options.tilePixelSize,
            tileCoords: new Vector(0, 0)
          } as TileOptions));
          i++;
        }
      }

      return arr;
    };

    let newTiles = new Array<Array<Tile>>();
    let height = this.getLayerHeight();
    for (let j = 0; j < height; j++) {
      let arr = getNewRow(j);
      newTiles.push(arr);
    }
    this.tiles = newTiles;
    return this;
  }

  public getLayerHeight(): number {
    return this.options.layerSize.getY();
  }

  public setLayerHeight(h: number): TileLayer {
    let height = this.getLayerHeight();
    this.options.layerSize.setY(h);

    if (h < height) {
      this.tiles.splice(h, height - h);
    } else {
      for (let j = height; j < h; j++) {
        let arr = new Array<Tile>();
        for (let i = 0; i < this.getLayerWidth(); i++) {
          arr.push(new Tile({
            imageSrc: '',
            pixelSize: this.options.tilePixelSize,
            tileCoords: new Vector(0, 0)
          } as TileOptions));
        }
        this.tiles.push(arr);
      }
    }

    return this;
  }

  public getTile(x: number, y: number): Tile {
    return this.tiles[y][x];
  }

  public setTile(x: number, y: number, tile: Tile, bucketFill?: boolean, bucketTile?: Tile): TileLayer {
    let t = this.getTile(x, y);
    if (!bucketFill) {
      if (t) {
        t.setImageSrc(tile.getImageSrc());
        t.setTileX(tile.getTileX());
        t.setTileY(tile.getTileY());
      }
    } else {
      if (t) {
        let currBucketTile = bucketTile ? bucketTile : t.clone();
        t.setImageSrc(tile.getImageSrc());
        t.setTileX(tile.getTileX());
        t.setTileY(tile.getTileY());
        
        if (x - 1 >= 0) {
          let nextTile = this.getTile(x - 1, y);
          if (nextTile.equals(currBucketTile) && !nextTile.equals(tile)) {
            this.setTile(x - 1, y, tile, true, currBucketTile);
          }
        }

        if (x + 1 < this.getLayerWidth()) {
          let nextTile = this.getTile(x + 1, y);
          if (nextTile.equals(currBucketTile) && !nextTile.equals(tile)) {
            this.setTile(x + 1, y, tile, true, currBucketTile);
          }
        }

        if (y - 1 >= 0) {
          let nextTile = this.getTile(x, y - 1);
          if (nextTile.equals(currBucketTile) && !nextTile.equals(tile)) {
            this.setTile(x, y - 1, tile, true, currBucketTile);
          }
        }

        if (y + 1 < this.getLayerHeight()) {
          let nextTile = this.getTile(x, y + 1);
          if (nextTile.equals(currBucketTile) && !nextTile.equals(tile)) {
            this.setTile(x, y + 1, tile, true, currBucketTile);
          }
        }
      }
    }
    return this;
  }

  public isVisible(): boolean {
    return this.displaying;
  }

  public show(): TileLayer {
    this.displaying = true;
    return this;
  }

  public hide(): TileLayer {
    this.displaying = false;
    return this;
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): TileLayer {
    this.name = name;
    return this;
  }
}