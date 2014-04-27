var sourceInput = document.getElementById('source');
var btnDo = document.getElementById('do');
var preTokens = document.getElementById('tokens');
var preAST = document.getElementById('ast');

var lexer = new Lexer();
var parser = new Parser();

function _do () {
  var source = sourceInput.value;
  var tokens, ast;

  try {
    tokens = lexer.lex(source);
    preTokens.innerHTML = JSON.stringify(tokens, null, 3);
  }
  catch (ex) {
    preTokens.innerHTML = ex.toString();
  }

  try {
    ast = parser.parse(tokens);
    preAST.innerHTML = JSON.stringify(ast, null, 3);
  }
  catch (ex) {
    preAST.innerHTML = ex.toString();
  }
}

btnDo.addEventListener('click', _do, false);
