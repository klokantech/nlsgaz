PLOVR_VERSION=2.0.0
PLOVR=../plovr-2.0.0.jar

.PHONY: all plovr build serve lint webserver

all: serve
plovr: $(PLOVR)
build: 
	mkdir -p build
	java -jar $(PLOVR) build nlsgaz.json > build/index.js
serve:
	java -jar $(PLOVR) serve *.json
