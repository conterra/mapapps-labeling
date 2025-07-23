[![devnet-bundle-snapshot](https://github.com/conterra/mapapps-bookmarks/actions/workflows/devnet-bundle-snapshot.yml/badge.svg)](https://github.com/conterra/mapapps-bookmarks/actions/workflows/devnet-bundle-snapshot.yml)
![Static Badge](https://img.shields.io/badge/requires_map.apps-4.13.0-e5e5e5?labelColor=%233E464F&logoColor=%23e5e5e5)
![Static Badge](https://img.shields.io/badge/tested_for_map.apps-4.17.0-%20?labelColor=%233E464F&color=%232FC050)
# Labeling

The Labeling Bundle labels features with border length and optional additional attributes.

![Screenshot App](https://github.com/conterra/mapapps-labeling/blob/main/screenshot.JPG)

## Sample App
https://demos.conterra.de/mapapps/resources/apps/public_demo_labeling/index.htm

## Installation Guide
Simply add the bundle "dn_labeling" to your app.

[dn_labeling Documentation](https://github.com/conterra/mapapps-labeling/tree/main/src/main/js/bundles/dn_labeling)

## Quick start

Clone this project and ensure that you have all required dependencies installed correctly (see [Documentation](https://docs.conterra.de/en/mapapps/latest/developersguide/getting-started/set-up-development-environment.html)).

Then run the following commands from the project root directory to start a local development server:

```bash
# install all required node modules
$ mvn initialize

# start dev server
$ mvn compile -Denv=dev -Pinclude-mapapps-deps

# run unit tests
$ mvn test -P run-js-tests,include-mapapps-deps
```
