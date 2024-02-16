/*
 * Copyright (C) 2023 con terra GmbH (info@conterra.de)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {declare} from "apprt-core/Mutable";
import {whenOnce} from "esri/core/reactiveUtils";
import Draw from "esri/views/draw/Draw";
import Graphic from "esri/Graphic";
import Point from "esri/geometry/Point";
import request from 'apprt-request';
import EdgeLengthLabelCreator from "./EdgeLengthLabelCreator";

export default declare({

    _labels: [],
    _hoverGraphic: null,
    _showFeatureEdgeLengths: true,

    layerFields: [],
    fieldLabels: [],


    activate() {
        this._hoverSymbol = this._properties.hoverSymbol;
        this._textSymbol = this._properties.textSymbol;
        this._layerId = this._properties.layerId;
        // this._subLayerId = this._properties.subLayerId;
        this._lengthUnit = this._properties.lengthUnit;
        this._generalizationConfig = this._properties.generalization;

        this._lengthLabelCreator = new EdgeLengthLabelCreator({
            textSymbol: this._textSymbol,
            lengthUnit: this._lengthUnit,
            mapWidgetModel: this._mapWidgetModel,
            generalizationConfig: this._generalizationConfig
        });

        whenOnce(
            () => this._mapWidgetModel.map)
            .then(() => {
                this._setFieldsFromLayer();
            });

        this._labelingTool.watch("active", this._handleToolStateChange.bind(this));
    },

    _getLayer() {
        const layer = this._mapWidgetModel.map.findLayerById(this._layerId);
        return layer;
    },

    _setFieldsFromLayer() {
        const layer = this._mapWidgetModel.map.findLayerById(this._layerId);
        layer.when(_ => {
            this.layerFields = layer.fields.map(clone);
        });
    },

    _setFieldsFromSubLayer(layer) {
        if (!layer.fields) {
            this._setFieldsFromMetadata(layer);
        } else {
            this.layerFields = layer.fields.map(clone);
        }
    },

    _setFieldsFromMetadata(layer) {
        request.get(layer.url, {query: {f: "json"}}).then(
            metadata => this.layerFields = metadata.fields.map(clone)
        );
    },

    _handleToolStateChange() {
        if (this._labelingTool.active) {
            this._activateFeatureSelection();
        } else {
            this._deactivateFeatureSelection();
        }
    },

    _activateFeatureSelection() {
        const view = this._mapWidgetModel.view;
        if (!this.draw)
            this.draw = new Draw({view});
        this._activateDrawing();
    },


    _deactivateFeatureSelection() {
        this._stopDrawing();
    },


    _activateDrawing() {
        this.draw.reset();
        this.drawAction = this.draw.create("point");
        this.drawAction.on("cursor-update", this._drawHoverGraphic.bind(this));
        this.drawAction.on("draw-complete", this._findFeatureAndAddLabels.bind(this));
    },


    _stopDrawing() {
        this.draw.reset();
        this.drawAction = null;
        this._deleteHoverGraphic();
    },


    _drawHoverGraphic({coordinates}) {

        const view = this._mapWidgetModel.view;

        const point = {
            type: "point",
            x: coordinates[0],
            y: coordinates[1],
            spatialReference: view.spatialReference
        };

        const graphic = new Graphic({
            geometry: point,
            symbol: this._hoverSymbol
        });

        view.graphics.remove(this._hoverGraphic);
        this._hoverGraphic = graphic;
        view.graphics.add(this._hoverGraphic);
    },


    _deleteHoverGraphic() {
        const view = this._mapWidgetModel.view;
        view.graphics.remove(this._hoverGraphic);
        this._hoverGraphic = null;
    },


    _findFeatureAndAddLabels({coordinates}) {

        // Resets the drawing, but doesnt disable it, since labeling is done via toggle tool
        this._activateDrawing();

        const x = coordinates[0];
        const y = coordinates[1];
        const spatialReference = this._mapWidgetModel.view.spatialReference;
        const point = new Point({x, y, spatialReference});

        const layer = this._getLayer();

        const queryParams = layer.createQuery();
        queryParams.geometry = point;
        queryParams.outFields = ["*"];

        layer.queryFeatures(queryParams).then(this._addLabelsToFoundFeature.bind(this));
    },


    _addLabelsToFoundFeature(result) {

        if (result.features.length === 0)
            return;

        const feature = result.features[0];

        this._addFieldLabelsToFeature(feature);

        if (this._showFeatureEdgeLengths) {
            this._lengthLabelCreator.getEdgeLengthLabels(feature)
                .then(labels => labels.forEach(this._addLabelToMap.bind(this)));
        }
    },


    _addFieldLabelsToFeature(feature) {

        const attributes = feature.attributes;
        const labelStrings = [];
        for (const labelDef of this.fieldLabels) {
            const attributeName = labelDef.name;
            const attributeValue = attributes[attributeName];
            const value = attributeValue ? attributeValue : "";
            const label = labelDef.prefix + " " + value + " " + labelDef.postfix;
            labelStrings.push(label);
        }

        const labelString = labelStrings.join("\n");

        const symbol = Object.assign({}, this._textSymbol);
        symbol.text = labelString;

        const geometry = feature.geometry;
        const center = geometry.centroid;
        const graphic = new Graphic({symbol, geometry: center});

        this._addLabelToMap(graphic);
    },

    _addLabelToMap(graphic) {
        this._labels.push(graphic);
        this._mapWidgetModel.view.graphics.add(graphic);

    },

    deleteLabels() {
        for (const graphic of this._labels)
            this._mapWidgetModel.view.graphics.remove(graphic);
    },

    setShowFeatureEdgeLengths(showFeatureEdgeLengths) {
        this._showFeatureEdgeLengths = showFeatureEdgeLengths;
    },

    addLabelDefinition({name, alias}) {
        const id = Date.now();
        const prefix = alias + ": ";
        const postfix = "";
        this.fieldLabels.push({id, name, alias, prefix, postfix});
    },

    editLabelDefinition({id, prefix, postfix}) {
        const label = this.fieldLabels.find(label => label.id === id);
        label.prefix = prefix;
        label.postfix = postfix;
    },

    removeLabelDefinition(id) {
        const index = this.fieldLabels.findIndex(labelDef => labelDef.id === id);
        if (index !== -1) {
            this.fieldLabels.splice(index, 1);
        }
    }
});

function clone(feature) {
    const clone = {};
    for (const key in feature) {
        if (feature.hasOwnProperty(key))
            clone[key] = feature[key];
    }
    return clone;
}
