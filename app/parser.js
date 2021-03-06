function Parser () {
  this._currIndex = -1;
  this._tokens = tokens;
}

Parser.prototype = {

  parse: function (tokens) {
    this._currIndex = -1;
    this._tokens = tokens;

    var expr = this.parseExpression();
    var token = this.advance();

    if (token) {
      throw new SyntaxError('Unexpected token ' + token.value + '.');
    }

    return {
      'Expression': expr
    };
  },

  advance: function () {
    var token =  this._tokens[++this._currIndex];

    return token;
  },

  peek: function () {
    return this._tokens[this._currIndex + 1];
  },

  matchOp: function (token, op) {
    return token && token.type == 'Operator' && token.value == op;
  },

  parseExpression: function () {
    return this.parseAssignment();
  },

  parseAssignment: function () {
    var expr = this.parseAdditive();

    if (expr && expr.Identifier) {
      var token = this.peek();

      if (this.matchOp(token, '=')) {
        this.advance();

        return {
          'Assignment': {
            name: expr,
            value: this.parseAssignment()
          }
        };
      }

      return expr;
    }

    return expr;
  },

  parseAdditive: function () {
    var expr = this.parseMultiplicative();
    var token = this.peek();

    while (this.matchOp(token, '+') || this.matchOp(token, '-')) {
      token = this.advance();

      expr = {
        'Binary': {
          operator: token.value,
          left: expr,
          right: this.parseMultiplicative()
        }
      };

      token = this.peek();
    }

    return expr;
  },

  parseMultiplicative: function () {
    var expr = this.parseUnary();
    var token = this.peek();

    while (this.matchOp(token, '*') || this.matchOp(token, '/')) {
      token = this.advance();

      expr = {
        'Binary': {
          operator: token.value,
          left: expr,
          right: this.parseUnary()
        }
      };

      token = this.peek();
    }

    return expr;
  },

  parseUnary: function () {
    var token = this.peek();

    if (this.matchOp(token, '+') || this.matchOp(token, '-')) {
      token = this.advance();
      expr = this.parseUnary();

      return {
        'Unary': {
          operator: token.value,
          expression: expr
        }
      };
    }

    return this.parsePrimary();
  },

  parsePrimary: function () {
    var token = this.peek();

    if (!token) {
      throw new SyntaxError('Unexpected termination of expression.');
    }

    if (token.type == 'Number') {
      token = this.advance();

      return {
        'Number': token.value
      };
    }

    if (token.type == 'Identifier') {
      token = this.advance();

      if (this.matchOp(this.peek(), '(')) {
        return {
          'FunctionCall': this.parseFunctionCall(token.value)
        };
      }
      else {
        return {
          'Identifier': token.value
        };
      }
    }

    if (this.matchOp(token, '(')) {
      this.advance();
      expr = this.parseExpression();
      token = this.advance();

      if (!this.matchOp(token, ')')) {
        throw new SyntaxError('Expecting paren ).');
      }
      else {
        return {
          Expression: expr
        };
      }
    }

    throw new SyntaxError('Parse error, can not process token \'' + token.value + '\'.');
  },

  parseFunctionCall: function (name) {
    var args = [], token;

    this.advance();

    token = this.peek();

    if (!this.matchOp(token, ')')) {
      while (true) {
        args.push({ Expression: this.parseExpression() });

        token = this.peek();

        if (this.matchOp(token, ',')) {
          this.advance();
          continue;
        }
        else if (this.matchOp(token, ')')) {
          this.advance();
          break;
        }
        else {
          throw new SyntaxError('Expecting ) in a function call \'' + name +  '\'.');
        }
      }
    }
    else {
      this.advance();
    }

    return {
      'FunctionCall': {
        name: name,
        args: args
      }
    };
  }
};
