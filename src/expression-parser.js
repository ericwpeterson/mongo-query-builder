
//Because an expression can be made up of zero or many sub-expressions, parse returns an array of top level expressions
let parse = (expression) => {

    let lp = 0;
    let rp = 0;

    let exprs = [];

    let currentExp = [];

    for (let i = 0; i < expression.length; i++) {
        if (expression[i] === '(') {
            lp++;
        } else if (expression[i] === ')') {
            rp++;
        }

        currentExp.push(expression[i]);

        if (lp === rp) {
            //got an expression
            exprs.push(currentExp);
            currentExp = [];
        }
    }

    //if length returned is 1 remove leading and trailing parens and return that length
    //(   (  (cond) and (cond)  )   ) = 2  Not 1
    //or simply (   (  (cond) and (cond)  )   ) =  cond and cond

    if (exprs.length === 1) {
        if (exprs[0][0] === '(' && exprs[0][exprs[0].length - 1] === ')') {
            var res = expression.slice(1, -1);
            if (res[0] === '('  && res[res.length - 1] === ')') {
                return parse(res);
            }
        }
    }
    return exprs;
};

let getParent = (obj, path) => {

    let keys = path.split('');
    let o = obj;

    //stop once we reach  the parent of the last item
    for (let i = 0; i < keys.length - 1; i++) {
        o = o[keys[i]];
    }

    return {parent: o, child: keys[keys.length - 1]};
};

let assignExpressions = (obj, path, expressions) => {

    let p = getParent(obj,path);
    p.parent[p.child] = expressions.reduce(function(acc, cur, i) {
        acc[i] = cur;
        return acc;
    }, {});
};

let parseExpression = (expression, parent, obj) => {

    let expressions = parse(expression);

    //console.log( 'expressions = ', expressions )
    let ret;

    if (parent === '') {
        ret = expressions.reduce(function(acc, cur, i) {
            acc[i] = cur;
            return acc;
        }, {});
    } else {
        ret = obj;
        assignExpressions(ret, parent, expressions);
    }

    for (let i = 0; i < expressions.length; i++) {
        if (expressions[i][1] === '(') {
            parseExpression(expressions[i],  parent + i, ret);
        }
    }

    return ret;
};

export function buildQueryFromObject(obj) {

    let query = {};
    let key;

    if ( !obj[1] ) {
        if ( obj[0] && obj[0].length === 1 ) {
            return obj[0][0];
        } else if ( obj[0] && obj[0].length === 3 ) {
            return obj[0][1];
        } else {
            return obj;
        }
    }

    //FIXME: query type is always at obj[1] because algorithm requires parenthesis.
    //all subsequent operators are ignored. For that reason we should detect and warn if the query expression has a mix of
    //and/or operators

    if (obj[1][0] === '|') {
        key = '$or';
        query[key] = [];
    } else if (obj[1][0] === '&') {
        key = '$and';
        query[key] = [];
    } else {
        console.log('malformed query');
        return;
    }

    let done = false;
    for (let i = 0; i < +Infinity && !done; i++) {
        if (obj[i]) {
            if ((i % 2) === 0) {
                if (typeof obj[i] === 'object') {
                     if ( obj[i].length ) {
                         query[key].push(buildQueryFromObject(obj[i][1]));
                     } else {
                         query[key].push(buildQueryFromObject(obj[i]));
                     }
                } else {
                    query[key].push(obj[i]);
                }
            }
        } else {
            done = true;
        }
    }

    return query;
}

export default parseExpression;
