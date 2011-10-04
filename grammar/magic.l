/* lexical grammar */
/* test: html > body > header + (div#wrapper.test.abc.xyz*5 > article.main + aside.col) + footer */
/* string, from https://github.com/zaach/jsonlint/blob/master/src/jsonlint.l */

%lex
id			"#"
class		"."
multi		"*"
identifier	[a-z0-9A-Z:_-]+
num			[0-9]+

%%
\s+			{ /* skip whitespace */ }
{num}		{ return 'NUM'; }
{identifier} { return 'IDENTIFIER'; }
{class}		{ return 'CLASS'; }
{id}		{ return 'ID'; }
{multi}		{ return 'MULTI'; }
'"'("\\"["bfnrt/{esc}]|"\\u"[a-fA-F0-9]{4}|[^\0-\x09\x0a-\x1f"{esc}])*'"'
			{yytext = yytext.substr(1,yyleng-2); return 'VAL';}
"+"			{ return '+' }
">"			{ return '>' }
"*"			{ return 'MULTI' }
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
	: e '>' e
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
	| element '[' IDENTIFIER EQUALS VAL ']'
		{var p = {}; p[$3] = $5; $$ = merge($$, {'props': p});}
	| element '[' IDENTIFIER EQUALS IDENTIFIER ']'
		{var p = {}; p[$3] = $5; $$ = merge($$, {'props': p});}
	| element MULTI NUM
		{$$['multi'] = $3;}
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
