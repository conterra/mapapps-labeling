# Labeling

The Labeling Bundle labels features with border length and optional additional attributes.

![Screenshot App](https://github.com/conterra/mapapps-labeling/blob/master/screenshot.JPG)

## Sample App
https://demos.conterra.de/mapapps/resources/apps/downloads_labeling/index.html

## Installation Guide
**Requirements:**
- map.apps 4.9.0 or later

Simply add the bundle "dn_labeling" to your app.

[dn_printingenhanced Documentation](https://github.com/conterra/mapapps-labeling/tree/master/src/main/js/bundles/dn_labeling)

## Development Guide
### Define the mapapps remote base
Before you can run the project you have to define the mapapps.remote.base property in the pom.xml-file:
`<mapapps.remote.base>http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%</mapapps.remote.base>`

### Other methods to to define the mapapps.remote.base property.
1. Goal parameters
   `mvn install -Dmapapps.remote.base=http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%`

2. Build properties
   Change the mapapps.remote.base in the build.properties file and run:
   `mvn install -Denv=dev -Dlocal.configfile=%ABSOLUTEPATHTOPROJECTROOT%/build.properties`
