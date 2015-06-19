CLOSURE=closure-library
COMPILER=$(CLOSURE)/compiler.jar
EXTERNS=$(CLOSURE)/externs

all:
	# Generate the deps.js for actual directory (the local namespace)

	$(CLOSURE)/closure/bin/build/depswriter.py --root_with_prefix=". ../../../" --output_file=deps.js

	# Compile the application into .min.js

	$(CLOSURE)/closure/bin/build/closurebuilder.py --root=$(CLOSURE)/closure/goog/ --root=$(CLOSURE)/third_party/closure/ --output_mode=compiled --compiler_jar=$(COMPILER) --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" --compiler_flags="--warning_level=VERBOSE" --compiler_flags="--externs=$(EXTERNS)/google_maps_api_v3.js" --root=. --input=main.js --output_file=./index.js
