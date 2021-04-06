import {Button, Icon, Loader, Menu, Progress, Table} from "semantic-ui-react";
import {Link} from "react-router-dom";
import {API, Auth, graphqlOperation, I18n} from "aws-amplify";
import React, {Component} from "react";
import {AddressCell, ConsignmentCell, DateCell, IdCell, Pagination} from "./Transports";
import {trackEvent} from "./ConsoleUtils";
import * as queries from "./graphql/queries";

const StatusMappings = () => ({
    DRAFT: {
        progress: 0,
        label: I18n.get('draft'),
        color: 'grey'
    },
    ORDER_SENT: {
        progress: 33,
        label: I18n.get('order sent'),
        color: 'blue'
    },
    ORDER_ACCEPTED: {
        progress: 33,
        label: I18n.get('order accepted'),
        color: 'blue'
    },
    PLANNED: {
        progress: 66,
        label: I18n.get('planned'),
        color: 'orange'
    },
    IN_PROGRESS: {
        progress: 66,
        label: I18n.get('ongoing'),
        color: 'orange'
    },
    DONE: {
        progress: 100,
        label: I18n.get('done'),
        color: 'green'
    },
    ARCHIVED: {
        progress: 100,
        label: I18n.get('archived'),
        color: 'grey'
    }
});

const Status = ({status, updatedAt}) => {
    console.log("status", status);
    const statusMapping = StatusMappings()[status];
    return <Table.Cell width={1}>
        <Progress percent={statusMapping.progress} size={'tiny'} color={statusMapping.color}>
        </Progress>
        <div style={{whiteSpace: "nowrap", marginTop: -30, textAlign: "center", fontWeight: "bold", fontSize: "x-small"}}>{statusMapping.label}</div>
    </Table.Cell>
};

class Orders extends Component {

    constructor(props) {
        super(props);

        this.state = {
            orders: []
        }
    }

    render() {
        const cols = 10;
        const ordersSent = this.props.direction === "sent";

        return <Table className="App-text-with-newlines" selectable compact='very' sortable columns={cols} fixed>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell style={{overflow: 'visible'}} colSpan={cols}>
                        <Pagination onFirst={this.onFirst} currentPageToken={this.state.currentPageToken}
                                    onPrevious={this.onPrev} onNext={this.onNext} nextToken={this.state.nextToken}
                                    onRefresh={this.refresh}/>

                        {ordersSent && <Link to={"/orders-new"}>
                            <Button floated='right' icon labelPosition='left' primary size='small'>
                                <Icon name='plus'/> {I18n.get('New order')}
                            </Button>
                        </Link>}
                    </Table.HeaderCell>
                </Table.Row>
                <Table.Row>
                    <Table.HeaderCell>{I18n.get('Number')}</Table.HeaderCell>
                    <Table.HeaderCell>{I18n.get('Status')}</Table.HeaderCell>
                    <Table.HeaderCell>{I18n.get('Shipper')}</Table.HeaderCell>
                    <Table.HeaderCell>{I18n.get('Pick-up address')}</Table.HeaderCell>
                    <Table.HeaderCell className={"sort"}>{I18n.get('Pick-up date')}</Table.HeaderCell>
                    <Table.HeaderCell>{I18n.get('Delivery address')}</Table.HeaderCell>
                    <Table.HeaderCell>{I18n.get('Delivery date')}</Table.HeaderCell>
                    <Table.HeaderCell>{I18n.get('Last change')}</Table.HeaderCell>
                    <Table.HeaderCell className={"sort"} sorted={"ascending"}>{I18n.get('Created')}</Table.HeaderCell>
                    <Table.HeaderCell>{I18n.get('Loads')}</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>

                {!this.state.loading && this.renderConsignmentNotes()}
                {!this.state.loading && this.state.orders.length === 0 && !this.state.currentPageToken &&
                <Table.Row>
                    <Table.Cell colSpan={'10'} textAlign={"center"} selectable={false}>
                        <div style={{padding: '50px', paddingTop: '200px', minHeight: '560px'}}>
                            <p>
                                {I18n.get('No orders found, please create one using the button above.')}
                            </p>
                            <Icon name={"shipping fast"} size={"massive"}/>
                        </div>
                    </Table.Cell>
                </Table.Row>
                }
                {this.state.loading &&
                <Table.Row>
                    <Table.Cell colSpan={cols} textAlign={"center"} selectable={false}>
                        <Loader active={true} inline size={"large"}/>
                    </Table.Cell>
                </Table.Row>
                }
            </Table.Body>
            <Table.Footer>
                <Table.Row>
                    <Table.HeaderCell colSpan={cols}>
                        <Menu floated='right' pagination>
                            <Menu.Item as='a' icon onClick={this.onPrev} disabled={!this.state.currentPageToken}>
                                <Icon name='chevron left'/>
                            </Menu.Item>
                            <Menu.Item as='a' icon onClick={this.onNext} disabled={!this.state.nextToken}>
                                <Icon name='chevron right'/>
                            </Menu.Item>
                        </Menu>
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>;
    }

    renderConsignmentNotes() {
        return (
            this.state.orders.map((e) =>
                <Table.Row key={e.id}>
                    {/*<TextCell text={moment(e.updatedAt).format("ll")}/>*/}
                    <IdCell id={e.id}/>
                    <Status status={e.orderStatus} lastUpdate={e.updatedAt}/>
                    <AddressCell address={e.shipper}/>
                    <AddressCell address={e.pickup}/>
                    <DateCell date={e.arrivalDate}/>
                    <AddressCell address={e.delivery}/>
                    <DateCell date={e.deliveryDate}/>
                    <DateCell date={e.updatedAt} showTime/>
                    <DateCell date={e.createdAt} showTime/>
                    <ConsignmentCell loads={e.loads}/>
                </Table.Row>
            )
        )
    }

    componentDidMount() {
        this.retrieveAppSync();
    }

    async retrieveAppSync(token) {
        const direction = this.props.direction;
        const queryName = direction === "received" ? "ordersByCarrierCreatedAt" : "ordersByOwnerCreatedAt"
        const ownerField = direction === "received" ? "orderCarrier" : "orderOwner";

        console.log(queryName);

        const user = await Auth.currentAuthenticatedUser();
        const response = await API.graphql(graphqlOperation(
            queries[queryName], {
                limit: 10,
                [ownerField]: user.getUsername(),
                sortDirection: this.state.sortOrder === 'descending' ? "DESC" : "ASC",
                ...token && {nextToken: token},
            }));

        console.warn("response", response);

        const nextToken = response.data[queryName].nextToken;
        this.setState({
            nextToken: nextToken,
            orders: response.data[queryName].items,
            loading: false
        });
    }
}

export default Orders;