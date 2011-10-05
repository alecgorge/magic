var Parser = require('./lib/Parser').parser
	, Magic = new require('./lib/Magic').Magic(Parser);

// this will handle input as arg and on stdin with HTML output
console.log(Magic.create('html > body > header + (div#wrapper.test.abc.xyz[mad=props] > (article.main > img[src=abc])*5 + aside.col) + footer'/*process.argv[2]*/));
