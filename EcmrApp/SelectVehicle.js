import React, {Component} from "react";
import {FlatList, Image, ListView, StyleSheet, TextInput, TouchableOpacity, View} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import {MyText} from "./Components";
import {API, Auth, graphqlOperation, I18n} from "aws-amplify";
import {Button} from "react-native-elements";
import * as customQueries from "./graphql/custom-queries"
import * as queries from "./graphql/queries"

const VehicleItem = ({vehicle, onSelect}) =>
    <TouchableOpacity onPress={onSelect}>
        <View style={{
            flexDirection: "row",
            backgroundColor: 'white',
            padding: 10,
            borderBottomColor: 'rgb(246, 246, 246)',
            borderBottomWidth: 2
        }}>
            <Icon size={30} style={{color: 'rgb(111, 111, 111)'}} name={"user-alt"}/>
            <View style={{marginLeft: 10}}>
                <MyText style={{fontWeight: "bold"}}>{vehicle.item.licensePlateNumber}</MyText>
                <MyText style={{fontSize: 11}}>{vehicle.item.type} · {vehicle.item.description}</MyText>
            </View>
        </View>
    </TouchableOpacity>;

class SelectVehicle extends Component {
    static navigationOptions = ({navigation, screenProps}) => ({
        title: I18n.get('Select address')
    });

    constructor(props) {
        super(props);
        this.state = {
            onSelect: props.navigation.getParam("onSelect"),
            vehicleType: props.navigation.getParam("vehicleType"),
            vehicles: []
        };
        this.navigationEventSubscription = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this.componentDidMount();
            }
        );
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <FlatList renderItem={(address) => <VehicleItem onSelect={() => this.selectVehicle(address.item)}
                                                                vehicle={address} />}
                          keyExtractor={(item) => item.id}
                          data={this.state.vehicles}
                          style={{marginTop: 5, marginBottom: 70}}
                          ListEmptyComponent={<MyText style={{fontWeight: "bold", padding: 20, textAlign: "center"}}>
                              {I18n.get("No vehicles.")}</MyText>}

                />
            </View>
        )
    }

    selectVehicle(address) {
        this.state.onSelect(address);
        this.props.navigation.goBack();
    }

    async componentDidMount() {
        this.setState({
            loading: true
        });
        const companyOwner = this.props.navigation.getParam("companyOwner");
        try {
            const response = await API.graphql(graphqlOperation(queries.vehicleByOwner, {
                limit: 50,
                owner: companyOwner,
                sortDirection: "ASC"
            }));
            this.setState({
                vehicles: response.data.vehicleByOwner.items.filter(v => v.type === this.state.vehicleType),
                loading: false
            });
        } catch(ex) {
            console.warn(ex);
        }
    }

    componentWillUnmount() {
        this.navigationEventSubscription.remove();
    }
}

const styles = StyleSheet.create({
    textInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1
    },
    baseContainer: {
        flex: 1, padding: 10
    },
});

export default SelectVehicle;