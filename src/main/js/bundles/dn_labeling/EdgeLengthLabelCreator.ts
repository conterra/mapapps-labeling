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
import * as GeomEngineAsync from "esri/geometry/geometryEngineAsync";
import Polyline from "esri/geometry/Polyline";
import Graphic from "esri/Graphic";
import Point from "esri/geometry/Point";

import { InjectedReference } from "apprt-core/InjectedReference";
import { MapWidgetModel } from "map-widget/api";
import { GeneralizationConfig } from "../../types/GeneralizationConfig";

export default class EdgeLengthLabelCreator {

    private generalizationConfig: GeneralizationConfig;
    private mapWidgetModel: InjectedReference<MapWidgetModel>;
    private textSymbol: __esri.TextSymbol;
    private lengthUnit: __esri.LinearUnit;

    constructor(mapWidgetModel: MapWidgetModel, generalizationConfig: GeneralizationConfig,
        textSymbol: __esri.TextSymbol, lengthUnit: __esri.LinearUnit) {
        this.generalizationConfig = generalizationConfig;
        this.mapWidgetModel = mapWidgetModel;
        this.textSymbol = textSymbol;
        this.lengthUnit = lengthUnit;
    }

    public async getEdgeLengthLabels(feature: __esri.Feature): Promise<any> {
        const config = this.generalizationConfig;
        const deviation = config.maxDeviation;
        const removeDegenParts = config.removeDegenerateParts;
        const unit = config.maxDeviationUnit;

        const geometry = feature.geometry;
        const view = await this.getView();
        const spatialReference = view.spatialReference;

        return GeomEngineAsync
            .generalize(geometry, deviation, removeDegenParts, unit)
            .then(this.collectLabels.bind(this, spatialReference));
    }

    private collectLabels(spatialReference: __esri.SpatialReference, geometry: __esri.Polygon): Promise<any> {
        const promises = [];
        for (const ring of geometry.rings) {
            const lines = this.getLinesFromRing(ring, spatialReference);
            for (const line of lines) {
                const promise = this.getLabelForLine(line, spatialReference);
                promises.push(promise);
            }
        }
        return Promise.all(promises);
    }

    private getLinesFromRing(ring: Array<Array<number>>, spatialReference: __esri.SpatialReference):
    Array<__esri.Polyline> {
        const lines = [];
        for (let i = 0; i < ring.length - 1; i++) {
            const firstPoint = ring[i];
            const secondPoint = ring[i + 1];
            const paths = [[firstPoint, secondPoint]];
            const line = new Polyline({paths, spatialReference});
            lines.push(line);
        }

        return lines;
    }

    private getLabelForLine(line: __esri.Polyline, spatialReference: __esri.SpatialReference) {
        const center = this.getCenterFromLine(line, spatialReference);
        if (this.spatialReferenceIsProjected(spatialReference))
            return GeomEngineAsync
                .planarLength(line, this.lengthUnit)
                .then(this.createLengthLabel.bind(this, center));
        else
            return GeomEngineAsync
                .geodesicLength(line, this.lengthUnit)
                .then(this.createLengthLabel.bind(this, center));
    }

    private createLengthLabel(geometry: __esri.Geometry, length: number): __esri.Graphic {
        const symbol = Object.assign({}, this.textSymbol);
        symbol.text = length.toFixed(2).toString();
        return new Graphic({geometry, symbol});
    }

    private spatialReferenceIsProjected(spatialReference: __esri.SpatialReference): boolean {
        return spatialReference.wkid !== 4326
            && spatialReference.wkid !== 3857
            && spatialReference.wkid !== 102100;
    }

    private getCenterFromLine(line: __esri.Polyline, spatialReference: __esri.SpatialReference): __esri.Point {
        const path = line.paths[0];
        const point1: Array<number> = path[0];
        const point2: Array<number> = path[1];
        const xCenter = (point1[0] + point2[0]) / 2;
        const yCenter = (point1[1] + point2[1]) / 2;

        return new Point({x: xCenter, y: yCenter, spatialReference});
    }

    private getView(): Promise< __esri.MapView | __esri.SceneView> {
        const mapWidgetModel = this.mapWidgetModel;
        return new Promise((resolve) => {
            if (mapWidgetModel.view) {
                resolve(mapWidgetModel.view);
            } else {
                const watcher = mapWidgetModel.watch("view", ({ value: view }) => {
                    watcher.remove();
                    resolve(view);
                });
            }
        });
    }
}
