import './board-toolbar.css';
import * as React from 'react';
import { Navbar, NavDropdown, MenuItem, Nav } from 'react-bootstrap';

interface Props {
    onNewBoardSpecifySizeClick: () => void;
    onSaveBoardClick: () => void;
    onLoadBoardClick: () => void;
}

interface State {

}

export default class BoardToolbar extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = this.getInitialState();
    }

    public getInitialState(): State {
        return {} as State;
    }

    public render(): JSX.Element {
        return (
            <Navbar
                inverse={true}
                collapseOnSelect={true}
                style={{border: '1px solid #666', borderRadius: '0px'}}
            >
                <Navbar.Header>
                    <Navbar.Brand>
                        <a href="#">Board-Editor</a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav>
                        <NavDropdown eventKey={1} title={'File'} id={'file-nav-dropdown'}>
                            <MenuItem 
                                eventKey={1.1} 
                                onSelect={(e: React.MouseEvent<MenuItem>) => {
                                    this.props.onLoadBoardClick();
                                }}
                            >
                                Load Board
                            </MenuItem>
                            <MenuItem 
                                eventKey={1.1} 
                                onSelect={(e: React.MouseEvent<MenuItem>) => {
                                    this.props.onSaveBoardClick();
                                }}
                            >
                                Save Board
                            </MenuItem>
                            <MenuItem divider={true} />
                            <MenuItem 
                                eventKey={1.2}
                                header={true}
                            >
                                New Board
                            </MenuItem>
                            <MenuItem
                                eventKey={1.3}
                                onSelect={() => {
                                    this.props.onNewBoardSpecifySizeClick();
                                }}
                            >
                                Specify Size
                            </MenuItem>
                        </NavDropdown>
                        <NavDropdown eventKey={2} title={'Edit'} id={'edit-nav-dropdown'} />
                        <NavDropdown eventKey={3} title={'View'} id={'view-nav-dropdown'} />
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}