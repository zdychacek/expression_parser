
function Lexer () {
  this._currIndex = -1;
  this._source = null;
}

Lexer.prototype = {

  lex: function (source) {
    this._currIndex = -1;
    this._source = source;

    var tokens = [];
    var token;
    var nextChar;

    while (true) {
      this.skipWhitespaces();

      nextChar = this.peek();

      if (!nextChar) break;

      token = this.scanOperator();

      if (token) {
        tokens.push(token);
        continue;
      }

      token = this.scanNumber();

      if (token) {
        tokens.push(token);
        continue;
      }

      token = this.scanIdentifier();

      if (token) {
        tokens.push(token);
        continue;
      }

      throw new SyntaxError('Unexpected token \'' + nextChar + '\'.');
    }

    return tokens;
  },

  /**
   * 12
   * 12.5
   * .56
   * 1.52E+5
   */
  scanNumber: function () {
    var number = '';
    var char = this.peek();

    // whole part
    if (this.isDigit(char)) {
      number += this.advance();
    }

    char = this.peek();

    // decimal separator
    if (char == '.') {
      number += this.advance();
    }

    char = this.peek();

    // fractional part
    while (this.isDigit(char)) {
      number += this.advance();
      char = this.peek();
    }

    char = this.peek();

    // exponential notation
    if (char == 'e' || char == 'E') {
      number += this.advance();
      char = this.peek();

      if (this.isDigit(char) || char == '+' || char == '-') {
        number += this.advance();

        while (true) {
          char = this.peek();

          if (!this.isDigit(char)) {
              break;
          }
          number += this.advance();
        }
      }
      else {
        throw new SyntaxError('Unexpected character after the exponent sign.');
      }
    }

    if (number == '.') {
      throw new SyntaxError('Bad number.');
    }

    if (number) {
      return {
        type: 'Number',
        value: parseFloat(number)
      };
    }
  },

  scanOperator: function () {
    var char = this.peek();

    if ('+-*/=(),'.indexOf(char) > -1) {
      return {
        type: 'Operator',
        value: this.advance()
      }
    }
  },

  scanIdentifier: function () {
    var char = this.peek();
    var identifier = '';

    if (this.isIdentifierStart(char)) {
      identifier += this.advance();
    }

    char = this.peek();

    while (this.isIdentifierPart(char)) {
      identifier += this.advance();
      char = this.peek();
    }

    if (identifier) {
      return {
        type: 'Identifier',
        value: identifier
      };
    }
  },

  advance: function () {
    var char = this._source[++this._currIndex];

    return char;
  },

  peek: function () {
    return this._source[this._currIndex + 1];
  },

  skipWhitespaces: function () {
    while (this.isWhitespace(this.peek())) {
      this.advance();
    }
  },

  isWhitespace: function (char) {
    return /\s/.test(char);
  },

  isDigit: function (char) {
    return (char >= '0') && (char <= '9');
  },

  isIdentifierStart: function (char) {
    return char == '_' || char == '$' || (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
  },

  isIdentifierPart: function (char) {
    return this.isIdentifierStart(char) || this.isDigit(char);
  }
};
