import * as React from 'react';
import GenericModal, { ModalProps } from './generic-modal';
import { Form, FormGroup, FormControl, ControlLabel, FormControlProps, Button } from 'react-bootstrap';
import { FormEvent } from 'react';
import { FormControlEventTarget } from '../../utils/form-utils';
import { store } from '../../stores/store';
import { setWidth, setHeight } from '../../stores/board.store';
import './board-size-modal.css';
import EditUtils, { EditAction, CHANGE_SIZE } from '../../utils/undo-redo-utils';

interface State {
    width: string;
    height: string;
}

export default class BoardSizeModal extends React.Component<ModalProps, State> {
    constructor(props: ModalProps) {
        super(props);
        this.state = this.getInitialState();
    }

    public getInitialState(): State {
        return {
            width: '32',
            height: '32'
        } as State;
    }

    public render(): JSX.Element {
        return (
            <GenericModal
                {...this.props}
            >
                <Form>
                    <FormGroup>
                        <ControlLabel>Width:</ControlLabel>
                        <FormControl
                            type={'number'}
                            placeholder={'Enter positive integer'}
                            value={this.state.width}
                            onChange={(e: FormEvent<React.Component<FormControlProps, {}>>) => {
                                this.onWidthChange((e.target as FormControlEventTarget).value);
                            }}
                        />
                        <ControlLabel>Height:</ControlLabel>
                        <FormControl
                            type={'number'}
                            placeholder={'Enter positive integer'}
                            value={this.state.height}
                            onChange={(e: FormEvent<React.Component<FormControlProps, {}>>) => {
                                this.onHeightChange((e.target as FormControlEventTarget).value);
                            }}
                        />
                    </FormGroup>
                    <Button
                        onClick={(e: FormEvent<React.Component<FormControlProps, {}>>) => {
                            this.onSubmit(this.state.width, this.state.height);
                        }}
                    >
                        Submit
                    </Button>
                </Form>
            </GenericModal>
        );
    }

    private onWidthChange(value: string): void {
        this.setState({width: value});
    }

    private onHeightChange(value: string): void {
        this.setState({height: value});
    }

    private onSubmit(width: string, height: string) {
        let editAction = {
            type: CHANGE_SIZE,
            layerWidth: store.getState().board.collection.getLayerWidth(),
            layerHeight: store.getState().board.collection.getLayerHeight(),
        } as EditAction;
        EditUtils.pushAction(editAction);

        store.dispatch(setWidth(parseInt(width, 10)));
        store.dispatch(setHeight(parseInt(height, 10)));
        if (this.props.shouldClose) {
            if (this.props.shouldClose()) {
                if (this.props.onHide) {
                    this.props.onHide();
                }
            }
        } else {
            if (this.props.onHide) {
                this.props.onHide();
            }
        }
    }
}