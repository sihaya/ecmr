import React, { Component } from 'react';
import './App.css';
import {Grid, Header, Menu} from "semantic-ui-react";
import Transports from "./Transports";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import NewTransport from "./NewTransport";

import Amplify from 'aws-amplify';
import awsmobile from './aws-exports';
import { withAuthenticator } from 'aws-amplify-react';
import Transport from "./Transport";

Amplify.configure(awsmobile);


class App extends Component {
    render() {
        return (
            <Router>
                <Grid columns={2} stackable container style={{ padding: '1em 0em' }}>
                    <Grid.Row>
                        <Grid.Column>
                            <Header as={'h2'}>e-CMR console app</Header>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column width={3}>
                            <Menu vertical secondary>
                                <Menu.Item
                                    name='consignments'
                                    to={'/transports'}
                                    as={Link}
                                />
                                <Menu.Item
                                    name='settings'
                                    to={'/settings'}
                                    as={Link}
                                />
                            </Menu>
                        </Grid.Column>
                        <Grid.Column width={13}>
                            <Route exact path="/transports" component={Transports}/>
                            <Route exact path="/transports-new/:copy_id" component={NewTransport}/>
                            <Route exact path="/transports-new" component={NewTransport}/>
                            <Route exact path="/transports/:id" component={Transport}/>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Router>
        );
    }
}
export default withAuthenticator(App, true);