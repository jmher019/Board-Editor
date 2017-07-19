import { StringMap } from './string-map';

export default class ImageMap {
    private map: StringMap<HTMLImageElement>;

    constructor() {
        this.map = {} as StringMap<HTMLImageElement>;
    }

    public clone(): ImageMap {
        let clone = new ImageMap();

        for (let key in this.map) {
            if (this.map.hasOwnProperty(key)) {
                clone.put(key, this.get(key));
            }
        }

        return clone;
    }

    public put(k: string, v: HTMLImageElement): ImageMap {
        this.map[k] = v;
        return this;
    }

    public get(k: string): HTMLImageElement {
        return this.map[k];
    }

    public getKeys(): Array<string> {
        let arr = new Array<string>();

        for (let key in this.map) {
            if (this.map.hasOwnProperty(key)) {
                arr.push(key);
            }
        }

        return arr;
    }

    public length(): number {
        return this.getKeys().length;
    }

    public toString(): string {
        let ret = 'ImageMap:\n';

        for (let key in this.map) {
            if (this.map.hasOwnProperty(key)) {
                ret = ret + key +  ': ' + this.get(key) + '\n';
            }
        }

        return ret;
    }
}