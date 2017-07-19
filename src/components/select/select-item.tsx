import './select-item.css';
import * as React from 'react';
import { FormGroup, FormControl, FormControlProps, ControlLabel } from 'react-bootstrap';
import { FormControlEventTarget } from '../../utils/form-utils';

interface Props {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
}

export default class SelectItem extends React.Component<Props, null> {
    constructor(props: Props) {
        super(props);
    }

    public render(): JSX.Element {
        return (
            <FormGroup>
                {this.props.label ? <ControlLabel>{this.props.label}</ControlLabel> : <div />}
                <FormControl
                    componentClass={'select'}
                    placeholder={this.props.placeholder}
                    value={this.props.value}
                    onChange={(e: React.FormEvent<React.Component<FormControlProps, {}>>) => {
                        this.props.onChange((e.target as FormControlEventTarget).value);
                    }}
                >
                    {this.getOptions()}
                </FormControl>
            </FormGroup>
        );
    }

    private getOptions(): JSX.Element[] {
        let ret: JSX.Element[] = [];

        if (this.props.options.length > 0) {
            for (let i = 0; i < this.props.options.length; i++) {
                ret.push((<option key={'option' + i}>{this.props.options[i]}</option>));
            }
        }

        return ret;
    }
}