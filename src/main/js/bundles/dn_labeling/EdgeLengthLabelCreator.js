/*
 * Copyright (C) 2021 con terra GmbH (info@conterra.de)
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
import * as GeomEngineAsync from "esri/geometry/geometryEngineAsync";
import Polyline from "esri/geometry/Polyline";
import Graphic from "esri/Graphic";
import Point from "esri/geometry/Point";


export default class EdgeLengthLabelCreator {

    constructor({mapWidgetModel, generalizationConfig, textSymbol, lengthUnit}){
        this.generalizationConfig = generalizationConfig;
        this.mapWidgetModel = mapWidgetModel;
        this.textSymbol = textSymbol;
        this.lengthUnit = lengthUnit;
    }

    getEdgeLengthLabels(feature){

        let geometry = feature.geometry;
        let spatialReference = this.mapWidgetModel.view.spatialReference;
        let config = this.generalizationConfig;
        let deviation = config.maxDeviation;
        let removeDegenParts = config.removeDegenerateParts;
        let unit = config.maxDeviationUnit;

        return GeomEngineAsync
            .generalize(geometry, deviation, removeDegenParts, unit)
            .then(this._collectLabels.bind(this, spatialReference));
    }

    _collectLabels(spatialReference, geometry){
        let promises = [];
        for(let ring of geometry.rings) {
            let lines = this._getLinesFromRing(ring, spatialReference);
            for(let line of lines) {
                let promise =  this._getLabelForLine(line, spatialReference);
                promises.push(promise);
            }
        }
        return Promise.all(promises);
    }

    _getLinesFromRing(ring, spatialReference){
        let lines = [];
        for(let i = 0; i < ring.length - 1; i++){
            let firstPoint = ring[i];
            let secondPoint = ring[i + 1];
            let paths = [[firstPoint, secondPoint]];
            let line = new Polyline({paths, spatialReference});
            lines.push(line);
        }
        return lines;
    }


    _getLabelForLine(line, spatialReference){
        let center = this._getCenterFromLine(line, spatialReference);
        if(this._spatialReferenceIsProjected(spatialReference))
            return GeomEngineAsync
                .planarLength(line, this.lengthUnit)
                .then(this._createLengthLabel.bind(this, center));
        else
            return GeomEngineAsync
                .geodesicLength(line, this.lengthUnit)
                .then(this._createLengthLabel.bind(this, center));
    }

    _createLengthLabel(geometry, length){
        let symbol = Object.assign({}, this.textSymbol);
        symbol.text = length.toFixed(2).toString();
        return  new Graphic({geometry, symbol});
    }

    _spatialReferenceIsProjected(spatialReference){
        return spatialReference.wkid !== 4326
            && spatialReference.wkid !== 3857
            && spatialReference.wkid !== 102100;
    }


    _getCenterFromLine(line, spatialReference){
        let path = line.paths[0];
        let point1 = path[0];
        let point2 = path[1];
        let xCenter = (point1[0] + point2[0]) / 2;
        let yCenter = (point1[1] + point2[1]) / 2;
        return new Point({ x: xCenter, y: yCenter, spatialReference });
    }
}
