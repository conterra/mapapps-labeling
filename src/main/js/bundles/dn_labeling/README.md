# dn_labeling

The Labeling bundle allows users to label features with line lengths and additional attributes.

## Usage

1. First you need to add the bundle dn_labeling to your app.
2. Then you can configure it.

To make the functions of this bundle available to the user, the following tool can be added to a toolset:

| Tool ID                    | Component                  | Description              |
|----------------------------|----------------------------|--------------------------|
| labelingToggleTool         | LabelingToggleTool         | Show or hide the widget. |

## Configuration Reference

### Config

```json
"dn_labeling": {
    "LabelingController": {
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
        "layerId": "flur_ham",
        "subLayerId": 0,
        "lengthUnit": "meters",
        "generalization": {
            "maxDeviationUnit": "meters",
            "maxDeviation": 0.5,
            "removeDegenerateParts": true
            }
    }
}
```

| Property            | Type                    | Possible Values                     | Default                       | Description                                                                                                                                                                                                                       |
|---------------------|-------------------------|-------------------------------------|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| hoverSymbol         | esri/symbols/Symbol     | any valid Symbol                    | 10px, red circle              | Graphic at mouse pointer                                                                                                                                                                           |
| textSymbol          | esri/symbols/TextSymbol | any valid Textsymbol                | 12p, black text, white halo   | Style of text                                                                                                                                                                           |
| layerId             | String                  | ID of any available layer           | "flur_ham"                    | ID of layer to label                                                                                                                                                                            |
| subLayerId          | Number                  | Index of any sublayer of used layer | 0                             | Index of sublayer to label                                                                                                                                                                             |
| lengthUnit          | String                  | any esri/unit/LengthUnit            | "meters"                      | Unit of measurement for label                                                                                                                                                                             |
| generalization      | Object                  | any valid generalization object     | segments under 0.5 ignored    | Determines whether lengths below threshold will be ignored                                                                                                                                                                             |

