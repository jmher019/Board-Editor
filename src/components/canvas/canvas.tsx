import * as React from 'react';

interface State {
    update: boolean;
}

interface Props {
    width: number;
    height: number;
    x?: number;
    y?: number;
    onClick?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseDown?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseUp?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseMove?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseLeave?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseEnter?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

export default class Canvas extends React.Component<Props, State> {
    private canvas: HTMLCanvasElement;

    constructor(props: Props) {
        super(props);
        this.state = this.getInitialState();
    }

    public getInitialState(): State {
        return {} as State;
    }

    public render(): JSX.Element {
        return (
            <canvas
                ref={canvas => { this.canvas = canvas; }}
                onMouseDown={e => {
                    if (this.props.onMouseDown) {
                        this.props.onMouseDown(e);
                    }
                }}
                onMouseUp={e => {
                    if (this.props.onMouseUp) {
                        this.props.onMouseUp(e);
                    }
                }}
                onMouseMove={e => {
                    if (this.props.onMouseMove) {
                        this.props.onMouseMove(e);
                    }
                }}
                onMouseEnter={e => {
                    if (this.props.onMouseEnter) {
                        this.props.onMouseEnter(e);
                    }
                }}
                onMouseLeave={e => {
                    if (this.props.onMouseLeave) {
                        this.props.onMouseLeave(e);
                    }
                }}
                onClick={this.props.onClick}
                style={{
                    width: this.props.width + 'px',
                    height: this.props.height + 'px',
                    position: 'absolute',
                    top: (this.props.y ? this.props.y : 0) + 'px',
                    left: (this.props.x ? this.props.x : 0) + 'px'
                }}
                width={this.props.width}
                height={this.props.height}
            />
        );
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    public draw(f: () => void) {
        if (f) {
            f();
            this.update();
        }
    }

    private update(): void {
        this.setState({update: true}, () => {
            this.setState({update: false});
        });
    }
}