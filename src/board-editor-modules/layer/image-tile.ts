import { Vector } from '../../utils/math-utils';

export interface TileOptions {
    imageSrc: string;
    pixelSize: Vector;
    tileCoords: Vector;
}

export default class Tile {
    private options: TileOptions;

    constructor(options: TileOptions) {
        this.options = options;
    }

    public clone(): Tile {
        return new Tile({
            imageSrc: this.options.imageSrc,
            pixelSize: this.options.pixelSize.clone(),
            tileCoords: this.options.tileCoords.clone()
        } as TileOptions);
    }

    public equals(t: Tile): boolean {
        return this.options.imageSrc === t.options.imageSrc &&
            this.options.pixelSize.equals(t.options.pixelSize) &&
            this.options.tileCoords.equals(t.options.tileCoords);
    }

    public getPixelWidth(): number {
        return this.options.pixelSize.getX();
    }

    public setPixelWidth(w: number): Tile {
        this.options.pixelSize.setX(w);
        return this;
    }

    public getPixelHeight(): number {
        return this.options.pixelSize.getY();
    }

    public setPixelHeight(h: number): Tile {
        this.options.pixelSize.setY(h);
        return this;
    }

    public getTileX(): number {
        return this.options.tileCoords.getX();
    }

    public setTileX(x: number): Tile {
        this.options.tileCoords.setX(x);
        return this;
    }

    public getTileY(): number {
        return this.options.tileCoords.getY();
    }

    public setTileY(y: number): Tile {
        this.options.tileCoords.setY(y);
        return this;
    }

    public getImageSrc(): string {
        return this.options.imageSrc;
    }

    public setImageSrc(imageSrc: string): Tile {
        this.options.imageSrc = imageSrc;
        return this;
    }

    public toString(): string {
        return 'Tile:\nimageSrc: ' + this.options.imageSrc +
            '\npixelSize: ' + this.options.pixelSize.toString() +
            '\ntileCoords: ' + this.options.tileCoords.toString();
    }
}