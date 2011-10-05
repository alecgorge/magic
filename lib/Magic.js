
function Magic (_parser) {
	this.parser = _parser;

	var that = this
		, buffer = ""
		, tagStack = []
		, selfClosingTags = ['li', 'input', 'img', 'link',
							 'meta', 'br', 'hr', 'area',
							 'base', 'basefont', "param", "col"];
		;
	function clear() {
		buffer = "";
		tagStack = [];
	}
	
	function write(str) {
		buffer += str;
	}
	
	function writeLine(str) {
		write(str + "\n");
	}
	
	function addSlashes(str) {
		return str.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
	}
	
	function repeat(str, times) {
		return (new Array(times+1)).join(str);
	}
	
	function isSelfClosing(tagName) {
		return selfClosingTags.indexOf(tagName) !== -1;
	}
	
	function writeTag(theTag, depth) {
		var tagName = theTag.tag
			, id = theTag.id
			, classes = theTag["class"]
			, props = theTag.props
			, selfClosing = isSelfClosing(tagName)
			;
			
		tagStack.push({tag: tagName, 'depth': depth});
		
		var r = ["<" + tagName]
			, closer = selfClosing ? false : {
				"depth": depth,
				"tag": tagName
			};
		
		if(id) r.push(' id="' + id + '"');
		if(classes) r.push(' class="' + classes.join(' ') + '"');
		if(props) {
			for(var key in props) {
				if(props.hasOwnProperty(key)) {
					r.push(' ' + key + '=' + '"' + addSlashes(props[key]) + '"');
				}
			}
		}
		
		if(selfClosing) {
			r.push('/');
		}
		
		r.push('>');
		
		writeLine(repeat("\t", depth) + r.join(''));
		
		return closer;
	}
	
	function closeTag(c) {
		// console.log("buffer: ", buffer);
		// var c = tagStack.shift();
		if(c === false) return;
		if(c.constructor == Array) {
			for(var k = 0; k < c.length; k++) {
				var v = c[k];
				if(v) writeLine(repeat("\t", v.depth) + '</' + v.tag + '>');
			}
		}
		else {
			writeLine(repeat("\t", c.depth) + '</' + c.tag + '>');
		}
	}
	
	function closeAtDepth(d) {
		var l = tagStack.length;
		for(var k = 0; k < l; k++) {
			var v = tagStack[k];
			if(v && v.depth == d) {
				writeLine(repeat("\t", v.depth) + '</' + v.tag + '>');
				delete tagStack[k];
			}
		}
	}
	
	this.create = function(inp) {
		if(typeof inp == 'string') {
			inp = this.parser.parse(inp);
		}
		
		closeTag((function theloop(i, depth) {
			// just a single tag
			if(i.tag) {
				return writeTag(i, depth);
				// closeTag();
			}
			else if(i.op == ">") {
				var parentCloser = theloop(i.left, depth)
					, depthInc = (i.left.tag ? 1 : 2) // funny things when parent has no sibilings
					, childCloser = theloop(i.right, depth + depthInc)
					;
				return [childCloser].concat(parentCloser);
			}
			else if(i.op == "+") {
				var closer = theloop(i.left, depth);
				closeTag(closer);
				
				return theloop(i.right, depth); // not sure if we can close, could have children so return
			}
			else if(i.op == "*") {
				for(var x = 0; x < i.right; x++) {
					closeTag(theloop(i.left, depth));
				}
				return false;
			}
		})(inp, 0));
		
		var r = buffer;
		clear();
		return r;
	}
	
	return this;
}

if(exports) {
	exports["Magic"] = Magic;
}
