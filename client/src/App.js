import React, {Component} from 'react';
import './App.css';
import {ApolloProvider} from 'react-apollo';
import {ApolloClient} from 'apollo-client';
import {HttpLink} from 'apollo-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {graphql} from 'react-apollo';

import gql from 'graphql-tag';
import moment from "moment";

const client = new ApolloClient({
    link: new HttpLink({uri: 'http://localhost:3001/graphql'}),
    cache: new InMemoryCache()
});

let today = moment().format('YYYY-MM-DD');
console.log(today);
const infoQuery = gql`
    query{matblasbo(date: "${today}"),matkristiansborg,temp{morning,noon,evening}}
`;

console.log(infoQuery);

client.query({query: infoQuery})
    .then(data => console.log(data))
    .catch(error => console.log(error));

const MatblasboWithData = graphql(infoQuery)(data => Box("Mat Blåsbo", data.data.matblasbo ? data.data.matblasbo : "Ingen uppgift"));
const MatkristiansborgWithData = graphql(infoQuery)(data => Box("Mat Kristiansborg", data.data.matkristiansborg ? data.data.matkristiansborg : "Ingen uppgift" ));


class App extends Component {
    render() {
        return (
            <ApolloProvider client={client}>

                <div className="App">
                    <header className="App-header">
                        <h1 className="App-title">Dagens info</h1>
                    </header>

                    <Watch/>

                    <div className="wrapper">
                        <MatblasboWithData />
                        <MatkristiansborgWithData/>
                        <BoxClass name="David"/>
                        <BoxClassFun name="David"/>
                    </div>
                </div>
            </ApolloProvider>
        );
    }
}

function BoxClassFun(props) {
    return <div className="box">
        Hej igen {props.name}
    </div>;
}

class BoxClass extends React.Component {
    render() {
        return <div className="box">
            Hej {this.props.name}
        </div>;
    }
}

function Box(name, value) {
    return <div className="box">
        {name}:{value}
    </div>;
}

class Watch extends Component {

    constructor(props) {
        super(props);
        this.state = {date: new Date()};
    }

    componentDidMount() {
        this.timerID = setInterval(() => this.tick(),
            1000);
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    tick() {
        this.setState({date: new Date()});
    }

    render() {
        return (
            <p className="App-intro">{this.state.date.toLocaleString('sv-SE', {timeZone: 'UTC'})} </p>
        )
    }
}

export default App;
