var inp = {"op":">","left":{"op":">","left":{"tag":"html"},"right":{"tag":"body"}},"right":{"op":"+","left":{"op":"+","left":{"tag":"header"},"right":{"op":">","left":{"tag":"div","id":"wrapper","class":["test","abc","xyz"],"props":{"key":"val"},"multi":"5"},"right":{"op":"+","left":{"tag":"article","class":["main"],"props":{}},"right":{"tag":"aside","class":["col"],"props":{}}}}},"right":{"tag":"footer"}}};

var Parser = require('./lib/Parser').parser
	, Magic = new require('./lib/Magic').Magic(Parser);

// this will handle input as arg and on stdin with HTML output
console.log(Magic.create('html > body > header + (div#wrapper.test.abc.xyz[mad=props] > (article.main > img[src=abc])*5 + aside.col) + footer'/*process.argv[2]*/));
