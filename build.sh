#!/bin/bash

cd nepali-calendar@sanghaarsha.github.com

zip -r ../nepali-calendar@sanghaarsha.github.com.zip *.js metadata.json stylesheet.css data/*.json utils/*.js schemas/*.xml
cp -f ../nepali-calendar@sanghaarsha.github.com.zip ../nepali-calendar-gse.zip

