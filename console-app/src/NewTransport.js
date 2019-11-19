import {Component, Fragment} from "react";
import _ from 'lodash';
import {
    Button,
    Container,
    Divider,
    Grid,
    Header,
    Icon,
    Segment,
    Form,
    Modal, List, Search, Dropdown
} from "semantic-ui-react";
import React from "react";
import { API, graphqlOperation } from 'aws-amplify';
import * as mutations from './graphql/mutations'
import * as queries from "./graphql/queries";
import moment from "moment";
import Message from "semantic-ui-react/dist/commonjs/collections/Message/Message";

class NewTransportForm extends Component {
    constructor(props) {
        super(props);

        this.handleInput = this.handleInput.bind(this);
    }

    renderField(label, field) {
        return (
            <Form.Field key={this.item++}>
                <Form.Input onChange={this.handleInput} name={field} value={this.props.value[field]} label={label}/>
            </Form.Field>
        );
    }

    renderFields() {
        this.item = 0;
    }

    render() {
        return (
            <Container>
                <Header as={'h3'}>{this.label}</Header>
                <Form>
                    {this.renderFields()}
                </Form>
            </Container>
        );
    }

    handleInput(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        const newFormState = Object.assign({}, this.props.value, {[name]: value});

        this.props.onChange(newFormState);
    }
}

class ContactPicker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            options: []
        };

        this.loadContacts();
    }

    async loadContacts() {
        const response = await API.graphql(graphqlOperation(queries.listContacts));
        this.setState({
            options: response.data.listContacts.items.map(e => ({text: `${e.name}, ${e.address}, ${e.country}`, key: e.id, value: e.id}))
        });
    }

    render() {
        const { address } = this.props;

        return (
            <div style={{marginBottom: '15px'}}>
                <Dropdown
                    placeholder='Select contact'
                    fluid
                    search
                    clearable
                    selection
                    value={this.props.contactId}
                    onChange={(e, data) => {this.props.contactSelected(data.value)}}
                    options={this.state.options}
                />
                {address && (
                    <List>
                        <List.Item>
                            <List.Content><strong>{address.name}</strong></List.Content>
                        </List.Item>
                        <List.Item>
                            <List.Content>{address.address}</List.Content>
                        </List.Item>
                        <List.Item>
                            <List.Content>{address.postalCode} {address.city}{address.country && `, ${address.country}`}</List.Content>
                        </List.Item>
                    </List>)}
            </div>
        )
    }

    close() {
        this.setState({addingItem: false});
    }

    addItem() {
        this.setState({addingItem: true});
    }
}

class Carrier extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<div>
            <Header as={'h3'}>Enter carrier information</Header>
            <ContactPicker contactSelected={(contactId) => {this.props.contactSelected(contactId)}}
                           contactId={this.props.contactId} />

        </div>);
    }
}



class Shipper extends NewTransportForm {
    constructor(props) {
        super(props);
    }

    render() {
        return (<div>
            <Header as={'h3'}>Enter shipper information</Header>
            <ContactPicker contactSelected={(contactId) => {this.props.contactSelected(contactId)}}
                           contactId={this.props.contactId} />

        </div>);
    }
}

class Delivery extends NewTransportForm {
    constructor(props) {
        super(props);

        this.label = "Enter delivery address";
    }

    renderFields() {
        super.renderFields();

        return (
            <Fragment>
                <ContactPicker contactSelected={(contactId) => {this.props.contactSelected(contactId)}}
                               contactId={this.props.contactId} />

                <Form.Field key={"pickup"}>
                    <label>Planned delivery date</label>
                    <Form.Group inline >
                        <Form.Input label="On" onChange={this.handleInput} name="deliveryDate" value={this.props.value["deliveryDate"]} type={'date'} width={8}/>
                    </Form.Group>
                </Form.Field>
            </Fragment>
        )
    }
}

class Pickup extends NewTransportForm {
    state = { modalOpen: false }
    constructor(props) {
        super(props);

        this.label = "Add a loading point";
    }

    handleChangeForLoad = (e, { name, value }) => {
        this.setState({ [name]: value });
    };

    renderFields() {
        super.renderFields();

        let times = [
            {
                "text": "00:00",
                "value": "00:00"
            }
        ];

        return (
            <Fragment>
                <ContactPicker contactSelected={(contactId) => {this.props.contactSelected(contactId)}}
                               contactId={this.props.contactId} />

                <Form.Field key={"pickup"}>
                    <label>Planned pickup date</label>
                    <Form.Group inline >
                        <Form.Input label="On" onChange={this.handleInput} name="pickupDate" value={this.props.value["pickupDate"]} type={'date'} width={8}/>
                    </Form.Group>
                </Form.Field>
                <Header as={'h3'} key={"header"}>Loads</Header>
                {this.showLoad()}
                {this.renderLoads()}
            </Fragment>
        );
    }

    showLoad() {
        const trigger = <Button content={"Add a load"} icon={"plus square"} labelPosition={"left"} onClick={() => this.setState({ modalOpen: true })}/>;

        return (<Modal key={"showLoad"} open={this.state.modalOpen}  trigger={trigger} size='small'>
            <Header icon={"plus square"} content={"Add load"} />
            <Modal.Content>
                <Form id={"item"}>
                    <Form.Input label='Category' type='input' name={"category"} onChange={this.handleChangeForLoad}/>
                    <Form.Input label='Quantity' type='input' name={"quantity"} onChange={this.handleChangeForLoad}/>
                    <Form.Input label='Description' type='input' name={"description"} onChange={this.handleChangeForLoad}/>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button color='red' inverted>
                    <Icon name='remove' /> Cancel
                </Button>
                <Button color='green' inverted onClick={() => this.addLoad()}>
                    <Icon name='checkmark' /> Add load
                </Button>
            </Modal.Actions>
        </Modal>);
    }

    addLoad() {
        this.setState({modalOpen: false});
        const load = { ...this.state };
        delete load.modalOpen;
        this.props.onLoadAdded(load);
    }

    renderLoads() {
        return (
            <List divided relaxed>
                {
                    this.props.loads.map(load => {
                        return (<List.Item key={load.description}>
                            <List.Icon name='archive' size='large' verticalAlign='middle' />
                            <List.Content>
                                <List.Header as='a'>{load.quantity} {load.category}</List.Header>
                                <List.Description as='a'>{load.description}</List.Description>
                            </List.Content>
                        </List.Item>);
                    })
                }
            </List>
        )
    }
}

class Driver extends NewTransportForm {
    constructor(props) {
        super(props);

        this.label = "Enter driver information";
    }

    renderFields() {
        super.renderFields();

        return ([
           this.renderField("Name", "name")
        ]);
    }
}

class Vehicle extends NewTransportForm {
    constructor(props) {
        super(props);

        this.label = "Enter vehicle information";
    }

    renderFields() {
        super.renderFields();

        return ([
            this.renderField("Vehicle license plate", "licensePlate")
        ]);
    }
}

class Trailer extends NewTransportForm {
    constructor(props) {
        super(props);

        this.label = "Enter trailer information";
    }

    renderFields() {
        super.renderFields();

        return ([
            this.renderField("Trailer license plate", "licensePlate")
        ]);
    }
}

class NewTransport extends Component {
    constructor(props) {
        super(props);

        this.form = [
            {
                section: 'Carrier',
                items: [
                    {label: 'Carrier', icon: 'truck', form: () =>
                            <Carrier
                                contactSelected={(contactId) => this.setState({'carrierContactId' : contactId})}
                                contactId={this.state.carrierContactId}
                            />},
                    {label: 'Driver', icon: 'user', form: () => <Driver onChange={this.createOnUpdateFor('driver')} value={this.state.driver} />},
                    {label: 'Vehicle license plate', icon: 'truck', form: () => <Vehicle onChange={this.createOnUpdateFor('truck')} value={this.state.truck}/>},
                    {label: 'Trailer license plate', icon: 'truck', form: () => <Trailer onChange={this.createOnUpdateFor('trailer')} value={this.state.trailer}/>}
                ]
            },
            {
                section: 'Shipper',
                items: [
                    {label: 'Shipper', icon: 'building', form: () =>
                            <Shipper  contactSelected={(contactId) => this.setState({'shipperContactId' : contactId})}
                                      contactId={this.state.shipperContactId} />}
                ]
            },
            {
                section: 'Pickup',
                items: [
                    {label: 'Pickup', icon: 'sign-out', form: () =>
                            <Pickup contactSelected={(contactId) => this.setState({
                                'pickup': {
                                    ...this.state.pickup,
                                    contactId
                                }
                            })}
                                    onChange={this.createOnUpdateFor('pickup', this.copyDateToDelivery)}
                                    onLoadAdded={(load) => this.onLoadAdded(load)}
                                    contactId={this.state.pickup.contactId}
                                    value={this.state.pickup}
                                    loads={this.state.loads}/> }
                ]
            },
            {
                section: 'Delivery',
                items: [
                    {label: 'Delivery', icon: 'sign-in', form: () =>
                            <Delivery onChange={this.createOnUpdateFor('delivery')}
                                      contactSelected={(contactId) => this.setState({'delivery': {
                                          ...this.state.delivery,
                                          contactId
                                          }
                                      })}
                                      contactId={this.state.delivery.contactId}
                                      value={this.state.delivery} />}
                ]
            }
        ];

        this.state = {
            selectedLabel: this.form[0].items[0].label,
            form: this.form[0].items[0].form,
            driver: {
            },
            trailer: {
            },
            truck: {
            },
            shipper: {
            },
            delivery: {
            },
            pickup: {
            },
            loads: [
            ]

        };

        const copyId = this.props.match.params.copy_id;
        if (copyId) {
            this.copyFromExisting(copyId);
        }
    }

    copyDateToDelivery(newState) {
        if (newState.pickupDate && !this.state.delivery.deliveryDate) {
            this.setState({
                delivery: {
                    ...this.state.delivery,
                    deliveryDate: newState.pickupDate
                }
            })
        }
    }

    async copyFromExisting(id) {
        const response = await API.graphql(graphqlOperation(queries.getContract, {
            "id": id
        }));
        const contract = response.data.getContract;

        this.setState({
            carrierContactId: contract.carrier.id,
            shipperContactId: contract.shipper.id,
            driver: contract.driver,
            trailer: contract.trailer,
            truck: contract.truck,
            delivery: {
                contactId: contract.delivery.id,
                deliveryDate: contract.deliveryDate
            },
            pickup: {
                contactId: contract.pickup.id,
                pickupDate: contract.arrivalDate
            },
            loads: contract.loads
        });
    }

    onLoadAdded(load) {
        this.setState(prevState => ({
            loads: [...prevState.loads, load]
        }))
    }

    createOnUpdateFor(item, customCallback) {
        let func = (value) => {
            let newState = {
            };
            newState[item] = Object.assign({}, this.state[item], value);

            if (customCallback) {
                customCallback.call(this, newState[item]);
            }

            this.setState(newState)
        };

        func.bind(this);
        return func;
    }

    render() {
        const menu = this.form.map((section) => {
            const buttons = section.items.map((item) =>
                <Button toggle={true}
                        key={item.label}
                        active={item.label === this.state.selectedLabel}
                        content={item.label}
                        icon={item.icon}
                        labelPosition='left'
                        onClick={() => this.activate(item)}/>);

            return (<Segment key={section.section}>
                        <Header as={'h3'}>{section.section}</Header>
                        <Button.Group vertical fluid>
                            {buttons}
                        </Button.Group>
                    </Segment>
            );
        });

        let activeForm = this.state.form ? this.state.form() : null;

        return (
                <Grid columns={2} container stackable style={{ padding: '1em 0em' }}>
                    <Grid.Row>
                        <Grid.Column>
                            <Header as={'h2'}>New A -> B Transport</Header>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column width={6}>
                            <Segment>
                                { menu }

                                <Divider />
                                {this.state.error && <Message
                                    error
                                    header='Error'
                                    list={[
                                        this.state.error
                                    ]}
                                />}
                                <Button floated={"right"} onClick={() => this.save()}>Save</Button>
                                <Divider clearing hidden fitted />
                            </Segment>
                        </Grid.Column>
                        <Grid.Column width={1}>
                            <Divider vertical><Icon name='arrow right' /></Divider>
                        </Grid.Column>
                        <Grid.Column width={9}>
                            <Segment>
                                {activeForm}
                            </Segment>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
        )
    }

    async save() {
        const now = moment().toISOString();
        const input = {
            status: 'CREATED',
            arrivalDate: this.state.pickup.pickupDate,
            deliveryDate: this.state.delivery.deliveryDate,
            contractShipperId: this.state.shipperContactId,
            contractCarrierId: this.state.carrierContactId,
            contractDeliveryId: this.state.delivery.contactId,
            contractPickupId: this.state.pickup.contactId,
            loads: this.state.loads,
            driver: this.state.driver,
            trailer: this.state.trailer,
            truck: this.state.truck,
            events: [],
            updatedAt: now,
            createdAt: now,
        };

        try {
            await API.graphql(graphqlOperation(mutations.createContract, {input: input}));
            this.props.history.push('/transports')
        } catch (ex) {
            this.setState({
                error: JSON.stringify(ex)
            })
        }
    }

    activate(item) {
        if (!item) {
            return;
        }

        this.setState({
            'form': item.form,
            'selectedLabel': item.label
        });
    }
}

export default NewTransport;