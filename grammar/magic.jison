/* lexical grammar */
/* test: html > body > header + (div#wrapper.test.abc.xyz[mad=props]*5 > article.main + aside.col) + footer */

%lex
id			"#"
class		"."
identifier	[a-z0-9A-Z:_-]+
num			[0-9]+

%%
\s+			{ /* skip whitespace */ }
{num}		{ return 'NUM'; }
{identifier} { return 'IDENTIFIER'; }
{class}		{ return 'CLASS'; }
{id}		{ return 'ID'; }
"+"			{ return '+' }
">"			{ return '>' }
"*"			{ return '*' }
"["			{ return '[' }
"]"			{ return ']' }
"="			{ return 'EQUALS' }
"("			{ return '(' }
")"			{ return ')' }
<<EOF>>		{ return 'EOF' }
.			{ return 'INVALID' }

/lex

/* author: Alec Gorge */

%left '>'
%left '+'
%left '*'

%start MagicExpr

%%

MagicExpr
	: e EOF
		{ return $1; }
	;

e
	: e '*' NUM
		{$$ = {op:'*', left:$1, right:$3};}
	| e '>' e
		{$$ = {op:$2, left:$1, right:$3};}
	| '(' e ')'
		{$$ = $2;}
	| element
		{$$ = $1;}
	| e '+' e
		{$$ = {op:$2, left:$1, right:$3};}
	;

element
	: IDENTIFIER
		{$$ = {tag:$1};}
	| IDENTIFIER CLASS class
		{$$ = {tag:$1, "class": $3, "props": {}};}
	| IDENTIFIER ID id
		{$$ = merge({tag:$1}, $3);}
	| element '[' IDENTIFIER EQUALS IDENTIFIER ']'
		{var p = {}; p[$3] = $5; $$ = merge($$, {'props': p});}
	;
	
class
	: IDENTIFIER
		{$$ = [$1];}
	| IDENTIFIER CLASS class
		{$$ = [$1].concat($3);}
	;
	
id
	: IDENTIFIER
		{$$ = {"id": $1, "class": []};}
	| IDENTIFIER CLASS class
		{$$ = {"id": $1, "class": $3};}
	;
