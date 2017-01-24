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

class App extends React.Component {
    constructor() {
        super();
        this.state = {};
        this.state.tokenItems = [];
        this.state.tokens = [];
        this.tokenState = TOKENSTATE.INITIAL_STATE;
        this.lParens = 0;
        this.rParens = 0;
        this.index = 0;
        this.chosenItems = [];
        this.expression = [];
    }

    _handleChange(text) {
        var tokens = this.state.tokens;

        if( !text[0] ) {
            return;
        }

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
            if ( this.tokenState !== TOKENSTATE.EXTERNAL ) {
                this.expression.push(text[0]);
            }
        }

        if ( text[0] !== '(' ) {
            this.index++;
        }

        if ( this.tokenState === TOKENSTATE.AND_OR ) {
            this.tokenState = TOKENSTATE.EXTERNAL;

            this.expression.push('(');

            this.index=0;

            if ( this.state.tokens.length > 0 ) {
                var items = this.state.tokenItems;
                items.push('');
                tokens.push( <div style={this.props.tokenStyle}> {text[0]} </div> );
                tokens.push( <div style={this.props.tokenStyle}> { "(" } </div> );
                this.setState( {tokens: tokens, tokenItems: items, shouldFocus: false }, ()=> {
                    this.setState( {tokens: tokens, tokenItems: items, shouldFocus: true});
                });
            }

        } else if ( TOKENSTATE.EXTERNAL &&  text[0] === '('  ) {
            var items = this.state.tokenItems;
            items.push('');
            tokens.push( <div style={this.props.tokenStyle}> {text[0]} </div> );
            this.lParens++;

            this.setState( {tokens: tokens, tokenItems: items, shouldFocus: false }, ()=> {
                this.setState({tokens: tokens, tokenItems: items, shouldFocus: true});
            });

        } else if ( this.tokenState === TOKENSTATE.NEED_CLOSING_PAREN &&  text[0] === ')' ) {
            var items = this.state.tokenItems;
            this.rParens++;
            tokens.push( <div style={this.props.tokenStyle}> {text[0]} </div> );

            if ( this.rParens === this.lParens ) {
                this.tokenState = TOKENSTATE.END;
                this.props.addExpression(this.expression);
            } else {
                this.tokenState = TOKENSTATE.NEED_CLOSING_PAREN;
            }

            this.setState( {tokens: tokens, tokenItems: items, shouldFocus: false }, ()=> {
                this.setState( {tokens: tokens, tokenItems: items, shouldFocus: true});
            });

        } else if ( this.tokenState === TOKENSTATE.NEED_CLOSING_PAREN &&  ( text[0] === 'And' || text[0] === 'Or' )) {
            this.expression.push('(');
            this.tokenState = TOKENSTATE.EXTERNAL;
            this.index = 0;
            tokens.push( <div style={this.props.tokenStyle}> {text[0]} </div> );
            tokens.push( <div style={this.props.tokenStyle}> {'('} </div> );
            this.lParens++;

            this.setState( {tokens: tokens, tokenItems: [], shouldFocus: false }, ()=> {
                this.setState({tokens: tokens, tokenItems: [], shouldFocus: true});
            });

        } else {
            if ( this.tokenState === TOKENSTATE.EXTERNAL ) {
                this.chosenItems.push(text[0]);
                this.expression[this.expression.lastIndexOf('(')+1] = this.chosenItems;
            }

            if ( this.tokenState === TOKENSTATE.TEST_FOR_END_COND ) {
                this.rParens++;
                if ( this.rParens === this.lParens ) {
                    //close up the expression
                    this.tokenState = TOKENSTATE.END;
                    this.props.addExpression(this.expression)
                    this.lParens = 0;
                    this.rParens = 0;
                    //tokens.push( <div style={this.props.tokenStyle}> {'condition'} </div> );
                    tokens.push( <div style={this.props.tokenStyle}> {this.chosenItems[0]} </div> );

                    this.setState( {tokens: tokens, shouldFocus: false }, ()=> {
                        this.setState( {tokens: tokens, tokenItems: [''], shouldFocus: true});
                    });
                } else {
                    //wait for ending paren
                    this.tokenState = TOKENSTATE.NEED_CLOSING_PAREN;

                    //tokens.push( <div style={this.props.tokenStyle}> {'condition'} </div> );
                    tokens.push( <div style={this.props.tokenStyle}> {this.chosenItems[0]} </div> );

                    tokens.push( <div style={this.props.tokenStyle}> {text[0]} </div> );
                    this.rParens--;
                    this.lParens--;
                    this.setState( {tokens: tokens, shouldFocus: false }, ()=> {
                        this.setState( {tokens: tokens, tokenItems: [''], shouldFocus: true});
                    });
                    return;
                }
            }

            if ( this.tokenState === TOKENSTATE.END ) {
                tokens.push( <div style={this.props.tokenStyle}> { ")" } </div> );
                this.setState({tokens: tokens, tokenItems: [] });
            } else {
                var items = this.state.tokenItems;
                items.push(text[0]);
                this.setState( {tokenItems: items, shouldFocus: false }, ()=> {
                    this.setState( {tokenItems: items, shouldFocus: true} );
                })
            }
        }
    }

    _addExpression() {

        this.chosenItems = [];
        this.index = 0;

        if ( this.tokenState !== TOKENSTATE.INITIAL_STATE ) {
            this.tokenState = TOKENSTATE.AND_OR;
            this.lParens = 1;
            this.rParens = 0;
            this.setState( {tokenItems: [''], shouldFocus: false }, ()=> {
                this.setState( {tokenItems: [''], shouldFocus: true} );
            });
        } else {
            this.tokenState = TOKENSTATE.EXTERNAL;
            this.lParens++;
            this.expression.push('(');
            this.setState( {tokens: [<div style={this.props.tokenStyle}> { "(" } </div>]} );
        }
    }

    _keyDown(e) {

        //TODO: implement this feature

        if (e.nativeEvent.key === 'Backspace' && e._targetInst._hostNode.defaultValue.length === 0 ) {

            this.index--;

            //going backwards
            if ( this.index === 0 ) {
                this.tokenState = TOKENSTATE.END;
                if ( this.state.tokens.length > 1 ) {
                    this.state.tokens.pop();
                }
            } else if ( this.tokenState === TOKENSTATE.AND_OR ) {
                this.tokenState = TOKENSTATE.END;
            }

            var tokItems = this.state.tokenItems;
            tokItems.pop();

            this.setState( {tokenItems: tokItems, shouldFocus: false }, ()=> {
                this.setState( {tokenItems: tokItems, shouldFocus: true} );
            });
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
        this.setState( {tokenItems: [], tokens: [] });
    }

    render() {

        var plusButton;
        var tokenItems = [];

        let d;

        if ( this.tokenState === TOKENSTATE.EXTERNAL ) {

            d = this.props.dataFunction(this.index, this.chosenItems);

            //for the first item we need to Append a (
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

        if (this.tokenState === TOKENSTATE.END || this.tokenState === TOKENSTATE.INITIAL_STATE ) {
            plusButton = <div style={this.props.buttonDivStyle} >  <Button onClick={this._addExpression.bind(this)} >+</Button> </div>
        } else {
            for ( var i=0; i<this.state.tokenItems.length; i++ ) {
                let item = this.state.tokenItems[i];
                tokenItems.push(<div key={'tokItemContainer'+i} ref={'tokItemContainer'+i} style={this.props.partialTokenDivStyle} > {item} </div> );
            }

            tokenItems.push(
                <div key={'tokItemContainer'+i} ref={'tokItemContainer'+i}  style={this.props.typeAheadDivStyle} >
                    <Typeahead
                        key={'tokItem'+i} ref={'tokItem'+this.state.tokenItems.length}
                        onChange={this._handleChange.bind(this)}
                        options= {d}
                        selected={[]}
                        multiple={false}
                    />
                </div>
            );
        }

        return (
            <div style={this.props.mainContainerStyle} onKeyDown={this._keyDown.bind(this)}  id='mainContainer' ref={()=>
                {
                    if (this.state.shouldFocus && this.state.tokenItems.length > 0 ) {
                        if ( this.refs['tokItem'+(this.state.tokenItems.length)] ) {
                            //TODO: Get an understaning of why the extra focus is necessary
                            this.refs['tokItem'+(this.state.tokenItems.length)].getInstance().focus();
                            this.refs['tokItem'+(this.state.tokenItems.length)].getInstance().blur();
                            this.refs['tokItem'+(this.state.tokenItems.length)].getInstance().focus();
                        }
                    }
                }
            }>
                {this.state.tokens}
                {tokenItems}
                {plusButton}
                {resetButton}
            </div>
        )
    }
}

export default App;
