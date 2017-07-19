import * as React from 'react';
import Canvas from '../canvas/canvas';
import './icon-button.css';

interface Props {
    width: number;
    height: number;
    imageUrl: string;
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
    onClick?: () => void;
}

export default class IconButton extends React.Component<Props, null> {
    private cvs: Canvas;
    private container: HTMLDivElement | null;
    private img: HTMLImageElement;
    
    constructor(props: Props) {
        super(props);
        this.img = new Image();
        this.img.src = this.props.imageUrl;
        this.img.onload = () => {
            setTimeout(this.renderImage(), 0);
        };

    }

    public render(): JSX.Element {
        return (
            <div
                ref={container => {
                    this.container = container;
                }}
                className={'icon-button'}
                style={{
                    width: this.props.width + 'px',
                    height: this.props.height + 'px',
                    left: this.props.left !== undefined ? this.props.left + 'px' : '',
                    top: this.props.top !== undefined ? this.props.top + 'px' : '',
                    right: this.props.right !== undefined ? this.props.right + 'px' : '',
                    bottom: this.props.bottom !== undefined ? this.props.bottom + 'px' : ''
                }}
            >
                <Canvas
                    ref={cvs => {
                        this.cvs = cvs;
                    }}
                    width={this.props.width}
                    height={this.props.height}
                    onMouseEnter={() => {
                        this.onMouseEnter();
                    }}
                    onMouseLeave={() => {
                        this.onMouseLeave();
                    }}
                    onClick={() => {
                        if (this.props.onClick) {
                            this.props.onClick();
                        }
                    }}
                />
            </div>
        );
    }

    private renderImage(): void {
        this.cvs.draw(() => {
            if (this.cvs) {
                let canvas = this.cvs.getCanvas();
                if (canvas) {
                    let ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(
                            this.img, 0, 0, this.img.width, this.img.height,
                            0, 0, this.props.width, this.props.height
                        );
                    }
                }
            }
        });
    }

    private onMouseLeave(): void {
        if (this.container) {
            this.container.style.opacity = '';
        }
    }

    private onMouseEnter(): void {
        if (this.container) {
            this.container.style.opacity = '0.6';
        }
    }
}