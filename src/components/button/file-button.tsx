import * as React from 'react';
import { FormGroup, FormControl, ControlLabel, FormControlProps } from 'react-bootstrap';
import { FormControlEventTarget } from '../../utils/form-utils';

interface Props {
    accept: string;
    multiple?: boolean;
    label?: string;
    onChange?: (files: FileList) => void;
}

interface State {

}

export default class FileItem extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = this.getInitialState();
    }

    public getInitialState(): State {
        return {} as State;
    }

    public render(): JSX.Element {
        return (
            <FormGroup>
                {this.props.label ? <ControlLabel>{this.props.label}</ControlLabel> : <div />}
                <FormControl
                    type={'file'}
                    multiple={this.props.multiple}
                    style={{
                        color: '#9d9d9d'
                    }}
                    onChange={(e: React.FormEvent<React.Component<FormControlProps, {}>>) => {
                        if (this.props.onChange) {
                            this.props.onChange((e.target as FormControlEventTarget).files);
                        }
                    }}
                    accept={this.props.accept}
                />
            </FormGroup>
        );
    }
}