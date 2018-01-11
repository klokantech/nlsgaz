PLOVR_VERSION=3.1.0
PLOVR=../plovr-$(PLOVR_VERSION).jar

.PHONY: all plovr build serve lint webserver

all: serve
plovr: $(PLOVR)
build:
	mkdir -p build
	java -jar $(PLOVR) build nlsgaz.json > build/index.js
serve:
	java -jar $(PLOVR) serve *.json
