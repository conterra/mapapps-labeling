# dn_labeling

The Labeling bundle allows the user to label features. Contents of the labels is based on the available fields of the feature layers.
Additonally, the edges of the features can be measured and labeled accordingly.

## Usage
1. Add the bundle "dn_labeling" to your app.
2. Configure the bundle if desired.

## Configuration Reference

### Config

#### Sample configuration for map Time Slider
```json
"Config": {
    "clickTolerance": 10,
    "hoverSymbol": {
        "type": "simple-marker",
        "style": "circle",
        "color": "red",
        "size": "10px",
        "outline": {
            "width": 0
        }
    },
    "textSymbol": {
        "type": "text",
        "haloColor": "white",
        "haloSize": "2px",
        "font": {
            "size": 12
        }
    },
    "lengthUnit": "meters",
    "generalization": {
        "maxDeviationUnit": "meters",
        "maxDeviation": 0.5,
        "removeDegenerateParts": true
    }
}
```


| Property                             | Type               | Possible Values               | Default        | Description                                                                                                                                                                           |
|--------------------------------------|--------------------|-------------------------------|----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| clickTolerance                       | Number             |                               | ```10```       | Buffer size around selection to ease selections. |
| hoverSymbol                          | SimpleMarkerSymbol |                               |                | Marker placed at the cursor to symbolize activity state. See [SimpleMarkerSymbol](https://developers.arcgis.com/javascript/latest/api-reference/esri-symbols-SimpleMarkerSymbol.html) |
| textSymbol                           | TextSymbol         |                               |                | Styling applied to labels. See [TextSymbol](https://developers.arcgis.com/javascript/latest/api-reference/esri-symbols-TextSymbol.html)                                               |
| lengthUnit                           | LengthUnit         |                               | ```"meters"``` | Unit to calculate in. See: [LengthUnit](https://developers.arcgis.com/javascript/latest/api-reference/esri-core-units.html#LengthUnit)                                                |
| generalization.maxDeviationUnit      | LengthUnit         |                               | ```"meters"``` | Unit to calculate in. See: [LengthUnit](https://developers.arcgis.com/javascript/latest/api-reference/esri-core-units.html#LengthUnit)                                                |
| generalization.maxDeviation          | Number             |                               | ```0.5```      | Threshold for generalization in configured unit.                                                                                                                                      |
| generalization.removeDegenerateParts | Boolean            | ```true``` &#124; ```false``` | ```true```     | Activates or deactivates generalization.                                                                                                                                              |
