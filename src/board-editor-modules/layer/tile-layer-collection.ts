import { Vector } from '../../utils/math-utils';
import Tile from './image-tile';
import TileLayer, { TileLayerOptions } from './tile-layer';

export interface TileLayerCollectionOptions {
    numberOfLayers: number;
    tilePixelSize: Vector;
    layerSize: Vector;
}

export default class TileLayerCollection {
    private options: TileLayerCollectionOptions;
    private layers: Array<TileLayer>;

    constructor(options: TileLayerCollectionOptions) {
        this.options = options;
        this.reset();
    }

    public clone(): TileLayerCollection {
        let clone = new TileLayerCollection({
            numberOfLayers: this.options.numberOfLayers,
            layerSize: this.options.layerSize.clone(),
            tilePixelSize: this.options.tilePixelSize.clone()
        } as TileLayerCollectionOptions);

        for (let i = 0; i < this.options.numberOfLayers; i++) {
            let layer = this.getLayer(i);
            clone.setLayer(i, layer.clone());
        }
        
        return clone;
    }

    public reset(): void {
        this.layers = new Array<TileLayer>();

        for (let i = 0; i < this.options.numberOfLayers; i++) {
            this.layers.push(new TileLayer({
                tilePixelSize: this.options.tilePixelSize,
                layerSize: this.options.layerSize.clone()
            } as TileLayerOptions));
        }
    }

    public getLayerWidth(): number {
        return this.options.layerSize.getX();
    }

    public setLayerWidth(w: number): TileLayerCollection {
        this.options.layerSize.setX(w);

        for (let i = 0; i < this.options.numberOfLayers; i++) {
            this.getLayer(i).setLayerWidth(w);
        }

        return this;
    }

    public getLayerHeight(): number {
        return this.options.layerSize.getY();
    }

    public setLayerHeight(h: number): TileLayerCollection {
        this.options.layerSize.setY(h);

        for (let i = 0; i < this.options.numberOfLayers; i++) {
            this.getLayer(i).setLayerHeight(h);
        }

        return this;
    }

    public getTilePixelWidth(): number {
        return this.options.tilePixelSize.getX();
    }

    public setTilePixelWidth(w: number): TileLayerCollection {
        this.options.tilePixelSize.setX(w);
        return this;
    }

    public getTilePixelHeight(): number {
        return this.options.tilePixelSize.getY();
    }

    public setTilePixelHeight(h: number): TileLayerCollection {
        this.options.tilePixelSize.setY(h);
        return this;
    }

    public getNumberOfLayers(): number {
        return this.options.numberOfLayers;
    }

    public setNumberOfLayers(n: number): TileLayerCollection {
        let numberOfLayers = this.getNumberOfLayers();
        this.options.numberOfLayers = n;

        if (numberOfLayers < n && n > -1) {
            for (let i = numberOfLayers; i > n; i--) {
                this.removeLayer(i - 1);
            }
        } else {
            for (let i = numberOfLayers; i < n; i++) {
                this.addLayer();
            }
        }

        return this;
    }

    public addLayer(): TileLayerCollection {
        this.layers.push(new TileLayer({
            layerSize: this.options.layerSize.clone(),
            tilePixelSize: this.options.tilePixelSize
        } as TileLayerOptions));

        if (this.layers.length > this.getNumberOfLayers()) {
            this.options.numberOfLayers++;
        }

        return this;
    }

    public getLayer(i: number): TileLayer {
        return this.layers[i];
    }

    public setLayer(i: number, layer: TileLayer): TileLayerCollection {
        this.layers[i] = layer;
        return this;
    }

    public insertLayer(i: number, layer: TileLayer): TileLayerCollection {
        this.layers.splice(i, 0, layer);

        if (this.layers.length > this.getNumberOfLayers()) {
            this.options.numberOfLayers++;
        }

        return this;
    }

    public removeLayer(i: number): TileLayer {
        let removedLayer = this.layers.splice(i, 1)[0];

        if (this.layers.length < this.getNumberOfLayers()) {
            this.options.numberOfLayers--;
        }

        return removedLayer;
    }

    public moveLayer(i: number, j: number): TileLayerCollection {
        return this.insertLayer(j < i ? j : j + 1, this.removeLayer(i));
    }

    public swapLayers(i: number, j: number): TileLayerCollection {
        let layer1 = this.getLayer(i);
        let layer2 = this.getLayer(j);

        return this.setLayer(i, layer2).setLayer(j, layer1);
    }

    public getVisibleTiles(x: number, y: number): Array<Tile> {
        let arr = new Array<Tile>();

        for (let n = this.getNumberOfLayers() - 1; n > -1; n--) {
            let layer = this.getLayer(n);
            if (layer.isVisible()) {
                let tile = layer.getTile(x, y);

                if (tile.getImageSrc() !== '') {
                    arr.push(tile);
                }
            }
        }

        return arr;
    }

    public toggleLayerVisibility(i: number): TileLayerCollection {
        let layer = this.getLayer(i);
        if (layer) {
            if (layer.isVisible()) {
                layer.hide();
            } else {
                layer.show();
            }
        }

        return this;
    }
}