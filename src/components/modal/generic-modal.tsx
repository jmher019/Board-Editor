import './generic-modal.css';
import * as React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface State {
}

export interface ModalProps {
    /** Determines if the modal should be displayed */
    display: boolean;
    /** Modal Width */
    width: string;
    /** Modal Height */
    height: string;
    /** Modal Title */
    title?: string;
    /** Is the modal contained? */
    isContained?: boolean;
    /** Function returning a boolean for logic to decide if modal should close */
    shouldClose?: () => boolean;
    /** Function to call when the modal hides */
    onHide?: () => void;
}

export default class GenericModal extends React.Component<ModalProps, State> {
    constructor(props: ModalProps) {
        super(props);
        this.state = this.getInitialState();
    }

    public getInitialState(): State {
        return {} as State;
    }

    public render(): JSX.Element {
        let close = () => { this.onClose(); };
        let hide = () => { this.onHide(); };
        return (
            <div className={this.props.isContained ? 'modal-container' : ''}>
                <Modal
                    show={this.props.display}
                    container={this}
                    onHide={hide}
                    className={'modal'}
                    width={this.props.width}
                    height={this.props.height}
                >
                    <Modal.Header
                        className={'modal-header'}
                    >
                        <Modal.Title className={'h4'}>
                            {this.props.title}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={'modal-body'}>
                        {this.props.children}
                    </Modal.Body>
                    <Modal.Footer className={'modal-footer'}>
                        <Button onClick={close}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }

    private onClose(): void {
        if (this.props.shouldClose && !this.props.shouldClose()) {
            return;
        }

        this.onHide();
    }

    private onHide(): void {
        if (this.props.onHide) {
            this.props.onHide();
        }
    }
}
