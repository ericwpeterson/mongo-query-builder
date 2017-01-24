import {expect} from 'chai';
import parseExpression, {buildQueryFromObject }  from '../src/expression-parser.js';

describe('expression parser', () => {

    let x  = { 'property_x': {'$lte': 123 }};
    let y  = { 'property_y': {'$lte': 123 }};
    let z  = { 'property_z': {'$lte': 123 }};

    it('parses x', () => {

        let x  = { 'property_x': {'$lte': 123 }};

        let expressionSample = [
            x
        ];

        let result = parseExpression(expressionSample, '');
        let q = buildQueryFromObject(result);

        expect(q).to.deep.equal({
                "property_x": {
                "$lte": 123
            }
        });
    });

    it('parses (x)', () => {

        let x  = { 'property_x': {'$lte': 123 }};

        let expressionSample = [
            '(', x, ')'
        ];

        let result = parseExpression(expressionSample, '');
        let q = buildQueryFromObject(result);

        expect(q).to.deep.equal({
                "property_x": {
                "$lte": 123
            }
        });
    });


    it('parses ( x | y )', () => {

        let x  = { 'property_x': {'$lte': 123 }};
        let y  = { 'property_y': {'$lte': 123 }};

        let expressionSample = [
            '(', x, ')', '|', '(', y, ')'
        ];

        let result = parseExpression(expressionSample, '');
        let q = buildQueryFromObject(result);

        expect(q).to.deep.equal({
            "$or": [
                {
                    "property_x": {
                        "$lte": 123
                    }
                },
                {
                    "property_y": {
                        "$lte": 123
                    }
                }
            ]
        });
    });

    it('parses (( x | y ))', () => {

        let expressionSample = [
            '(','(', x, ')', '|', '(', y,')',')'
        ];

        let result = parseExpression(expressionSample, '');
        let q = buildQueryFromObject(result);


        expect(q).to.deep.equal({
            "$or": [
                {
                    "property_x": {
                        "$lte": 123
                    }
                },
                {
                    "property_y": {
                        "$lte": 123
                    }
                }
            ]
        });
    });

    it('parses ( x & y )', () => {

        let x  = { 'property_x': {'$lte': 123 }};
        let y  = { 'property_y': {'$lte': 123 }};

        let expressionSample = [
            '(', x, ')', '&', '(', y, ')'
        ];

        let result = parseExpression(expressionSample, '');
        let q = buildQueryFromObject(result);

        expect(q).to.deep.equal({
            "$and": [
                {
                    "property_x": {
                        "$lte": 123
                    }
                },
                {
                    "property_y": {
                        "$lte": 123
                    }
                }
            ]
        });
    });

    it('parses ( ( x | y ) & z )', () => {

        let expressionSample = [
            '(','(', x, ')', '|', '(', y, ')', ')',
            '&',
            '(', z, ')'
        ];

        let result = parseExpression(expressionSample, '');
        let q = buildQueryFromObject(result);


        expect(q).to.deep.equal({
                "$and": [
                    {
                        "$or": [
                            {
                                "property_x": {
                                    "$lte": 123
                                }
                            },
                            {
                                "property_y": {
                                    "$lte": 123
                                }
                            }
                        ]
                    },
                    {
                        "property_z": {
                            "$lte": 123
                        }
                    }
                ]
            }
        );
    });

    it('parses ( ( x & y ) | z )', () => {

        let expressionSample = [
            '(','(', x, ')', '&', '(', y, ')', ')','|', '(', z, ')'
        ];

        let result = parseExpression(expressionSample, '');
        let q = buildQueryFromObject(result);


        expect(q).to.deep.equal({
                "$or": [
                    {
                        "$and": [
                            {
                                "property_x": {
                                    "$lte": 123
                                }
                            },
                            {
                                "property_y": {
                                    "$lte": 123
                                }
                            }
                        ]
                    },
                    {
                        "property_z": {
                            "$lte": 123
                        }
                    }
                ]
            }
        );
    });

    it('parses ( ( ( x & y ) | z )  &  ( ( x & y ) | z ) )', () => {

        let expressionSample = [
            '(',
                '(','(', x, ')', '&', '(', y, ')', ')', '|', '(', z, ')',
            ')',
            '&',
            '(',
                '(','(', x, ')', '&', '(', y, ')', ')', '|', '(', z, ')',
            ')'
        ];

        let result = parseExpression(expressionSample, '');
        let q = buildQueryFromObject(result);

        expect(q).to.deep.equal({
                "$and": [
                    {
                        "$or": [
                            {
                                "$and": [
                                    {
                                        "property_x": {
                                            "$lte": 123
                                        }
                                    },
                                    {
                                        "property_y": {
                                            "$lte": 123
                                        }
                                    }
                                ]
                            },
                            {
                                "property_z": {
                                    "$lte": 123
                                }
                            }
                        ]
                    },
                    {
                        "$or": [
                            {
                                "$and": [
                                    {
                                        "property_x": {
                                            "$lte": 123
                                        }
                                    },
                                    {
                                        "property_y": {
                                            "$lte": 123
                                        }
                                    }
                                ]
                            },
                            {
                                "property_z": {
                                    "$lte": 123
                                }
                            }
                        ]
                    }
                ]
            }
        );
    });
});
