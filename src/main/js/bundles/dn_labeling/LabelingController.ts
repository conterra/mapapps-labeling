///
/// Copyright (C) 2023 con terra GmbH (info@conterra.de)
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///         http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import type { InjectedReference } from "apprt-core/InjectedReference";
import Graphic from "esri/Graphic";
import Draw from "esri/views/draw/Draw";
import Point from "esri/geometry/Point";
import EdgeLengthLabelCreator from "./EdgeLengthLabelCreator";

export default class {

    private _labelingModel: InjectedReference<any>;
    private _mapWidgetModel: InjectedReference<any>;
    private _hoverGraphic: InjectedReference<Graphic>;
    private _draw: InjectedReference<Draw>;
    private _lengthLabelCreator: InjectedReference<any>;
    private _fieldLabels: Array<any>;
    private _edgeLabels: Array<any>;



    activate() {
        const _labelingModel = this._labelingModel;
        this._fieldLabels= [];
        this._edgeLabels = [];

        this._hoverSymbol = this._properties.hoverSymbol;
        this._textSymbol = this._properties.textSymbol;
        this._generalizationConfig = this._properties.generalization;
        this._lengthUnit = this._properties.lengthUnit;

        this._lengthLabelCreator = new EdgeLengthLabelCreator({
            textSymbol: this._textSymbol,
            lengthUnit: this._lengthUnit,
            mapWidgetModel: this._mapWidgetModel,
            generalizationConfig: this._generalizationConfig
        });


        const layers= this._mapWidgetModel.map.layers.items.filter(item => item.title);
        this._labelingModel.layers= layers;
        this._labelingModel.selectedLayer= layers[0];
        layers[0].when(() => {
            const fields = layers[0].fields;
            fields.forEach((_, index) => {
                if (!fields[index].prefix){
                fields[index].prefix =  fields[index].name + ": ";
                }
                if (!fields[index].postfix){
                    fields[index].postfix =  "";
                }
            this._labelingModel.fields= fields;
          });
        });


        _labelingModel.watch("active", ({ value }) => {
           if(value){
            this._activateFeatureSelection();
           }
           else{
            this._deactivateDrawing();
           }
        });

        _labelingModel.watch("selectedLayer", ({ value }) => {
            const fields = value.fields;
            fields.forEach((_, index) => {
                if (!fields[index].prefix){
                fields[index].prefix =  fields[index].name + ": ";
                }
                if (!fields[index].postfix){
                    fields[index].postfix =  "";
                }
            });
            this._labelingModel.fields= fields;

            this._labelingModel.selectedFields = [];
         });
        }

    _activateFeatureSelection() {
            const view = this._mapWidgetModel.view;
            if (!this._draw)
                this._draw = new Draw({view});
            this._activateDrawing();
        }


    _activateDrawing() {
        this._draw?.reset();
        this.drawAction = this._draw.create("point");
        this.drawAction.on("cursor-update", this._drawHoverGraphic.bind(this));
        this.drawAction.on("draw-complete", this._findFeatureAndAddLabels.bind(this));
    }

    _deactivateDrawing() {
        this._draw.reset();
        this._drawAction = null;
        this._deleteHoverGraphic();
    }

    _drawHoverGraphic({coordinates}) {

        const view = this._mapWidgetModel.view;

        const point = {
            type: "point",
            x: coordinates[0],
            y: coordinates[1],
            spatialReference: view.spatialReference
        };

        const  graphic = new Graphic({
            geometry: point,
            symbol: this._hoverSymbol
        });

        view.graphics.remove(this._hoverGraphic);
        this._hoverGraphic = graphic;
        view.graphics.add(this._hoverGraphic);
    }

    _deleteHoverGraphic() {
        this._mapWidgetModel.view.graphics.remove(this._hoverGraphic);
        this._hoverGraphic = null;
    }

    _findFeatureAndAddLabels({coordinates}) {

        // Resets the drawing, but doesnt disable it, since labeling is done via toggle tool
        this._activateDrawing();

        const x = coordinates[0];
        const y = coordinates[1];
        const spatialReference = this._mapWidgetModel.view.spatialReference;
        const point = new Point({x, y, spatialReference});

        const queryParams =  this._labelingModel.selectedLayer.createQuery();
        queryParams.geometry = point;
        queryParams.outFields = ["*"];

        const layer = this._labelingModel.selectedLayer;
        layer.queryFeatures(queryParams).then(this._addLabelsToFoundFeature.bind(this));
    }

    _addLabelsToFoundFeature(result) {

        if (result.features.length === 0)
            return;

        const feature = result.features[0];

        this._addFieldLabelsToFeature(feature);

        if (this._labelingModel.showFeatureEdgeLengths) {
            this._lengthLabelCreator.getEdgeLengthLabels(feature)
                .then(labels => labels.forEach((label) => this._addLabelToMap(label, feature, "edge")));
        }
    }

    _addFieldLabelsToFeature(feature) {

        const attributes = feature.attributes;
        const labelStrings = [];
        console.info(this._labelingModel.selectedFields);
        for (let labelDef of this._labelingModel.selectedFields) {
            const attributeName = labelDef.name;
            const attributeValue = attributes[attributeName];
            const value = attributeValue ? attributeValue : "";
            let label = attributeName + ": " + value;
            if (labelDef.prefix || labelDef. postfix){
                label = labelDef.prefix + " " + value + " " + labelDef.postfix;
            }
            labelStrings.push(label);
        }

        const labelString = labelStrings.join("\n");

        const symbol = Object.assign({}, this._textSymbol);
        symbol.text = labelString;

        let geometry = feature.geometry;
        let center = geometry.centroid;
        let graphic = new Graphic({symbol, geometry: center});

        this._addLabelToMap(graphic, feature, "field");
    }

    _addLabelToMap(graphic, feature, fieldOrEdge) {
        console.info(feature);
        if(fieldOrEdge == "field"){
            this._fieldLabels.push({graphic: graphic, feature: feature});
        }
        else{
            this._edgeLabels.push({graphic: graphic, feature: feature});
        }
        this._mapWidgetModel.view.graphics.add(graphic);

    }

    deleteAllLabels() {
        for (let graphic of this._fieldLabels){
            this._mapWidgetModel.view.graphics.remove(graphic.graphic);
        }
        for (let graphic of this._edgeLabels){
            this._mapWidgetModel.view.graphics.remove(graphic.graphic);
        }
    }

    deleteLabel(feature){
        console.info(feature)
    }


}
