import React from 'react';
import ReactDOM from 'react-dom';
import ExpressionBuilder from '../components/ExpressionBuilder.js';
import parseExpression, {buildQueryFromObject }  from '../src/expression-parser.js';

export const ALL_DONE = 1;

let buttonDivStyle = {padding: 5, float: 'left', marginTop: -2 };
let mainContainerStyle = { border: '1px solid #e5e3e3', borderRadius: 3, padding: 10, margin: 10, height: 65 };
let partialTokenDivStyle = {padding: 5, float: 'left', marginTop: 5 };
let typeAheadDivStyle= {padding: 5, float: 'left'};
let textAreaStyle = {border: '1px solid #e5e3e3', fontWeight: 'bold', fontSize: 13, width: '100%', height: screen.height- 315};

//TODO: Document this variable
var expressionData = [
    [
        "x",
        "y",
        "z",
    ],
    ALL_DONE
];

const DEFAULT_MESSAGE = "No query defined. Press the button to create one.";

class ExpressionWrapper extends React.Component {
    constructor() {
        super();
        this.state = {};
        this.state.query = DEFAULT_MESSAGE;
    }

    getItems(index, chosenItems) {
        return expressionData[index];
    }

    expressionAdded(expression) {
        let q;

        if ( !expression ) {
            q = DEFAULT_MESSAGE;
        } else {
            console.log( JSON.stringify(expression,null,4) )

            for ( let i = 0; i < expression.length; i++ ) {
                if ( typeof expression[i] === 'object' && expression[i].length ) {
                    //to do: map the the choices to a valid mongo query
                    //for now just make a key in the mongo query for demonstration purposes
                    let e = {};
                    e[expression[i][0]] = { $eq: true };
                    expression[i] = e;
                }
            }
            q = JSON.stringify( buildQueryFromObject(parseExpression(expression, '')), null, 4 );
        }

        this.setState({query: q });
    }

    render() {
        return (
            <div style={{padding: 15}}>
                <h2> Mongo Query Builder </h2>
                <h5> <strong> Note: </strong> Parenthesis are used to group and order expressions just as you would with a calculator. </h5>
                <ExpressionBuilder
                    addExpression={this.expressionAdded.bind(this)}
                    dataFunction={this.getItems.bind(this)}
                    buttonDivStyle={buttonDivStyle}
                    mainContainerStyle={mainContainerStyle}
                    partialTokenDivStyle={partialTokenDivStyle}
                    typeAheadDivStyle={typeAheadDivStyle}
                />
                <div style={{padding: 10}}>
                    <textarea style={textAreaStyle} name="Text1" value={this.state.query}> </textarea>
                </div>
            </div>
        )
    }
}

ReactDOM.render( <ExpressionWrapper />, document.getElementById('app'));
