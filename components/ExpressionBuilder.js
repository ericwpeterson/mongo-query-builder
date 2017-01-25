import React from 'react';
import { Button } from 'react-bootstrap';
import {Typeahead} from 'react-bootstrap-typeahead';
import { ALL_DONE } from '../src/index.js';
import parseExpression, {buildQueryFromObject }  from '../src/expression-parser.js';

var begin = [
  '('
];

var endConditional = [
  ')'
];

var andOr = [
  'And',
  'Or'
];

var closingParen = [
    ')',
    'And',
    'Or'
];

var data = {
    BEGIN: begin,
    AND_OR: andOr,
    NEED_CLOSING_PAREN: closingParen,
    TEST_FOR_END_COND: endConditional
};

var TOKENSTATE = {
    INITIAL_STATE: 'INITIAL_STATE',
    BEGIN: 'BEGIN',
    END: 'END',
    TEST_FOR_END_COND: 'TEST_FOR_END_COND',
    AND_OR: 'AND_OR',
    NEED_CLOSING_PAREN: 'NEED_CLOSING_PAREN',
    EXTERNAL: 'EXTERNAL'
};

class ExpressionBuilder extends React.Component {
    constructor() {
        super();
        this.state = {};
        this.tokenState = TOKENSTATE.INITIAL_STATE;
        this.lParens = 0;
        this.rParens = 0;
        this.index = 0;
        this.chosenItems = [];
        this.expression = [];

        this.state.shouldFocus = true;
    }

    _copyExpression() {
        let copy = JSON.stringify(this.expression);
        return JSON.parse(copy);
    }

    _handleChange(text) {

        if (!text[0] ) return;

        //need to unmount the typeahead component
        this.setState( {unMount: true }, ()=> {
            this.setState( {unMount: false });

            if ( text[0] === '(' ) {
                this.expression.push(text[0]);
            } else if ( text[0] === 'And' ) {
                this.index = 0;
                this.chosenItems = [];
                this.expression.push('&');
            } else if ( text[0] === 'Or' ) {
                this.index = 0;
                this.chosenItems = [];
                this.expression.push('|');
            } else {
                this.index++;
                if ( this.tokenState !== TOKENSTATE.EXTERNAL ) {
                    this.expression.push(text[0]);
                } else {
                    this.chosenItems.push(text[0]);
                    this.expression[this.expression.lastIndexOf('(')+1] = this.chosenItems;
                }
            }

            if ( this.tokenState === TOKENSTATE.AND_OR ) {
                this.tokenState = TOKENSTATE.EXTERNAL;
                this.expression.push('(');
                this.index=0;
            } else if ( TOKENSTATE.EXTERNAL &&  text[0] === '('  ) {
                this.lParens++;
            } else if ( this.tokenState === TOKENSTATE.NEED_CLOSING_PAREN &&  text[0] === ')' ) {
                this.rParens++;
                if ( this.rParens === this.lParens ) {
                    this.tokenState = TOKENSTATE.END;
                    this.props.addExpression(this._copyExpression());
                } else {
                    this.tokenState = TOKENSTATE.NEED_CLOSING_PAREN;
                }
            } else if ( this.tokenState === TOKENSTATE.NEED_CLOSING_PAREN &&  ( text[0] === 'And' || text[0] === 'Or' )) {
                this.expression.push('(');
                this.tokenState = TOKENSTATE.EXTERNAL;
                this.index = 0;
                this.lParens++;
            } else {
                if ( this.tokenState === TOKENSTATE.TEST_FOR_END_COND ) {
                    this.rParens++;
                    if ( this.rParens === this.lParens ) {
                        //close up the expression
                        this.tokenState = TOKENSTATE.END;
                        this.props.addExpression(this._copyExpression())
                        this.lParens = 0;
                        this.rParens = 0;
                    } else {
                        //wait for ending paren
                        this.tokenState = TOKENSTATE.NEED_CLOSING_PAREN;
                        this.rParens--;
                        this.lParens--;
                        return;
                    }
                }
            }

            this.setState( {expression: this.expression, shouldFocus: false }, ()=> {
                this.setState( {expression: this.expression, shouldFocus: true});
            });
        });
    }

    _addExpression() {

        this.chosenItems = [];
        this.index = 0;

        if ( this.tokenState !== TOKENSTATE.INITIAL_STATE ) {
            this.tokenState = TOKENSTATE.AND_OR;
            this.lParens = 1;
            this.rParens = 0;
            this.setState( {shouldFocus: false }, ()=> {
                this.setState( {shouldFocus: true} );
            });
        } else {
            this.tokenState = TOKENSTATE.EXTERNAL;
            this.lParens++;
            this.expression.push('(');
            this.setState({expression: this.expression});
        }
    }

    _keyDown(e) {

        if (e.nativeEvent.key === 'Backspace' && e._targetInst._hostNode.defaultValue.length === 0 ) {
            //TODO: implement this feature
            //this.index--;
        }
    }

    _reset() {

        this.tokenState = TOKENSTATE.INITIAL_STATE;
        this.lParens = 0;
        this.rParens = 0;
        this.index = 0;
        this.chosenItems = [];
        this.expression = [];
        this.props.addExpression(null);
        this.setState({expression: this.expression});
    }

    render() {

        var plusButton;
        var tokenItems = [];
        var expressionItems = [];
        let typeAhead;
        let d;

        //need to unmount the typeahead
        if ( this.state.unMount ) {
            return (
                <div>
                </div>
            )
        }

        if ( this.tokenState === TOKENSTATE.EXTERNAL ) {
            d = this.props.dataFunction(this.index, this.chosenItems);

            //for the first item we need to Append a ( outside component should not have to know
            //about parenthesis

            if ( this.index === 0 ) {
                let combined = ['('];
                for ( let i = 0; i < d.length; i++) {
                    combined.push(d[i]);
                }
                d = combined;
            }

            if ( d === ALL_DONE ) {
                this.tokenState = TOKENSTATE.TEST_FOR_END_COND;
                d = data[this.tokenState];
            }
        } else {
            d = data[this.tokenState];
        }

        let resetButton = <div style={this.props.buttonDivStyle} >  <Button onClick={this._reset.bind(this)} >Reset</Button> </div>

        for ( let i=0; i<this.expression.length; i++ ) {
            let item = this.expression[i];
            if (typeof item === 'object' && item.length ) {
                expressionItems.push(<div key={'tokItemContainer'+i} ref={'tokItemContainer'+i} style={this.props.partialTokenDivStyle} > {item[0]} </div> );
            } else {
                expressionItems.push(<div key={'tokItemContainer'+i} ref={'tokItemContainer'+i} style={this.props.partialTokenDivStyle} > {item} </div> );
            }
        }

        if (this.tokenState === TOKENSTATE.END || this.tokenState === TOKENSTATE.INITIAL_STATE ) {
            plusButton = <div style={this.props.buttonDivStyle} >  <Button onClick={this._addExpression.bind(this)} >+</Button> </div>

        } else {
            typeAhead =
                <div style={this.props.typeAheadDivStyle} >
                    <Typeahead
                        ref={'typeAhead'+this.expression.length}
                        onChange={this._handleChange.bind(this)}
                        options= {d}
                        selected={[]}
                        multiple={false}
                        name={'typeAhead'+this.expression.length}
                    />
                </div>
        }

        return (
            <div style={this.props.mainContainerStyle} onKeyDown={this._keyDown.bind(this)}  id='mainContainer' ref={()=>
                {
                    if (this.state.shouldFocus && this.expression.length > 0 ) {
                        if ( this.refs['typeAhead'+this.expression.length] ) {
                            //TODO: Get an understaning of why the extra focus is necessary
                            this.refs['typeAhead'+this.expression.length].getInstance().focus();
                            this.refs['typeAhead'+this.expression.length].getInstance().blur();
                            this.refs['typeAhead'+this.expression.length].getInstance().focus();
                        }
                    }
                }
            }>
                {expressionItems}
                {typeAhead}
                {plusButton}
                {resetButton}
            </div>
        )
    }
}

export default ExpressionBuilder;
