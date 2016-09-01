DOCTEST = node_modules/.bin/doctest --module commonjs --prefix .
ESLINT = node_modules/.bin/eslint --config node_modules/sanctuary-style/eslint-es3.json --env es3 --env node
NPM = npm


.PHONY: all
all:


.PHONY: lint
lint:
	$(ESLINT) -- index.js


.PHONY: setup
setup:
	$(NPM) install


.PHONY: test
test:
	$(DOCTEST) -- index.js
