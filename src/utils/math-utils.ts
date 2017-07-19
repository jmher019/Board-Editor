export let cos = (rads: number) => { return Math.cos(rads); };
export let sin = (rads: number) => { return Math.cos(rads); };
export let radians = (degrees: number) => { return degrees * Math.PI / 180; };
export let cos2 = (degrees: number) => { return cos(radians(degrees)); };
export let sin2 = (degrees: number) => { return sin(radians(degrees)); };
export let round = (val: number) => { return Math.round(val); };
export let floor = (val: number) => { return Math.floor(val); };
export let ceil = (val: number) => { return Math.ceil(val); };
export let pow = (base: number, exp: number) => { return Math.pow(base, exp); };
export let sqrt = (val: number) => { return Math.sqrt(val); };

export class Vector {
    private x: number;
    private y: number;

    constructor(x: number, y: number) {
        this.setX(x).setY(y);
    }

    public clone() {
        return new Vector(this.getX(), this.getY());
    }

    public getX(): number {
        return this.x;
    }

    public setX(x: number): Vector {
        this.x = x;
        return this;
    }

    public getY() {
        return this.y;
    }

    public setY(y: number): Vector {
        this.y = y;
        return this;
    }

    public add(v: Vector): Vector {
        return new Vector(
            this.getX() + v.getX(),
            this.getY() + v.getY())
        ;
    }

    public subtract(v: Vector): Vector {
        return new Vector(
            this.getX() - v.getX(),
            this.getY() - v.getY()
        );
    }

    public scalarMultiply(val: number): Vector {
        return new Vector(
            val * this.getX(),
            val * this.getY()
        );
    }

    public scalarDivide(val: number): Vector {
        return new Vector(
            this.getX() / val,
            this.getY() / val
        );
    }

    public dot(v: Vector): number {
        return this.getX() * v.getX() + this.getY() * v.getY();
    }

    public magnitude(): number {
        return sqrt(this.dot(this));
    }

    public floor(): Vector {
        return new Vector(
            floor(this.getX()),
            floor(this.getY())
        );
    }

    public ceil(): Vector {
        return new Vector(
            ceil(this.getX()),
            ceil(this.getY())
        );
    }

    public round(): Vector {
        return new Vector(
            round(this.getX()),
            round(this.getY())
        );
    }

    public toString(): string {
        return 'x: ' + this.x + ' y: ' + this.y;
    }

    public equals(v: Vector): boolean {
        return this.getX() === v.getX() && this.getY() === v.getY();
    }
}