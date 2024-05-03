///
/// Copyright (C) 2024 con terra GmbH (info@conterra.de)
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

import Graphic from "esri/Graphic";
import Draw from "esri/views/draw/Draw";
import Point from "esri/geometry/Point";
import Extent from "esri/geometry/Extent";
import { geodesicLength, planarLength } from "esri/geometry/geometryEngine";
import LabelCreator from "./LabelCreator";
import { watch } from "esri/core/reactiveUtils";
import { Observers, createObservers } from "apprt-core/Observers";
import async from "apprt-core/async";

import type { InjectedReference } from "apprt-core/InjectedReference";
import LabelingModel from "./LabelingModel";
import { MapWidgetModel } from "map-widget/api";
import Collection from "esri/core/Collection";

export default class LabelingController {

    private lastTimeout: any;
    private modelObservers?: Observers;
    private mapLayerWatcher?: __esri.WatchHandle;
    private mapObservers?: Observers;
    private drawAction: any;
    private hoverGraphic?: Graphic;
    private draw?: Draw;
    private labelCreator?: LabelCreator;
    private _fieldLabels: Array<any> = [];
    private _edgeLabels: Array<any> = [];
    private _labelingModel: InjectedReference<typeof LabelingModel>;
    private _mapWidgetModel: InjectedReference<MapWidgetModel>;

    public onToolActivated(): void {
        const model = this._labelingModel!;
        const mapWidgetModel = this._mapWidgetModel!;

        this.labelCreator = new LabelCreator(
            mapWidgetModel,
            model.generalization,
            model.textSymbol,
            model.lengthUnit
        );

        this.modelObservers = this.createModelObservers();
        this.mapLayerWatcher = this.createMapLayerWatcher(mapWidgetModel);
        this.updateSelectableLayers();
    }

    public onToolDeactivated(): void {
        if (this.modelObservers) {
            this.modelObservers.destroy();
            this.modelObservers = undefined;
        }

        if (this.mapLayerWatcher) {
            this.mapLayerWatcher.remove();
        }

        if (this.mapObservers) {
            this.mapObservers.destroy();
            this.mapObservers = undefined;
        }
    }

    private createModelObservers(): Observers {
        const model = this._labelingModel!;
        const modelOberservers = createObservers();

        modelOberservers.add(
            model.watch("active", ({ value: active }) => {
                if (active) {
                    this.activateFeatureSelection();
                }
                else {
                    this.deactivateDrawing();
                }
            })
        );

        modelOberservers.add(
            model.watch("selectedLayer", ({ value: layer }) => {
                if (layer.loadStatus === "not-loaded") {
                    layer.load();
                }
                layer.when(() => {
                    const fields = layer.fields;
                    fields.forEach((field: __esri.Field, index: number) => {
                        if (!fields[index].prefix) {
                            fields[index].prefix = `${fields[index].name}: `;
                        }
                        if (!fields[index].postfix) {
                            fields[index].postfix = "";
                        }
                    });
                    model.fields = fields;
                    model.selectedFields = [];

                    if (layer.geometryType && layer.geometryType === "point") {
                        model.showFeatureEdgeLengths = false;
                        model.edgeLengthsDisabled = true;
                    } else {
                        model.edgeLengthsDisabled = false;
                    }
                });
            })
        );

        return modelOberservers;
    }

    private createMapLayerWatcher(mapWidgetModel: MapWidgetModel): __esri.WatchHandle {
        return watch(
            () => [mapWidgetModel.map.layers], ([layers]) => {
                if (this.mapObservers) {
                    this.mapObservers.clean();
                }

                this.createMapObservers(layers).then(observers => {
                    this.mapObservers = observers;
                });
            },
            {
                initial: true
            }
        );
    }

    private async createMapObservers(layers: Collection<__esri.Layer>): Promise<Observers> {
        const mapObservers = createObservers();

        const view = await this.getView();
        mapObservers.add(
            view.watch("scale", () => {
                const toggleTimeout = 500;
                clearTimeout(this.lastTimeout);
                this.lastTimeout = setTimeout(() => {
                    this.updateSelectableLayers();
                }, toggleTimeout);
            })
        );

        this.getFlattenLayers(layers).forEach(layer => {
            mapObservers.add(
                layer.watch("loaded", loaded => {
                    this.updateSelectableLayers();

                    if (loaded && layer?.layers?.length >= 1)
                        layer.layers.forEach(layer => {
                            mapObservers.add(
                                layer.watch("loaded", () => {
                                    this.updateSelectableLayers();
                                })
                            );
                        });

                    if (loaded && layer?.sublayers?.length >= 1) {
                        layer.sublayers.forEach(() => {
                            mapObservers.add(
                                layer.watch("loaded", () => {
                                    this.updateSelectableLayers();
                                })
                            );
                        });
                    }
                })
            );

            mapObservers.add(
                layer.watch("visible", visible => {
                    this.updateSelectableLayers();

                    if (visible && layer?.layers?.length >= 1)
                        layer.layers.forEach(layer => {
                            mapObservers.add(
                                layer.watch("visible", () => {
                                    this.updateSelectableLayers();
                                })
                            );
                        });

                    if (visible && layer?.sublayers?.length >= 1) {
                        layer.sublayers.forEach(() => {
                            mapObservers.add(
                                layer.watch("visible", () => {
                                    this.updateSelectableLayers();
                                })
                            );
                        });
                    }
                })
            );
        });

        return mapObservers;
    }

    private updateSelectableLayers() {
        const model = this._labelingModel!;
        const mapWidgetModel = this._mapWidgetModel!;

        const layers = mapWidgetModel.map.layers;
        const flattenedLayers = this.getFlattenLayers(layers);
        this.getView().then(view => {
            const delay = model?.loadTimeTolerance;
            if (delay && delay > 0) {
                async(() => {
                    model.layers = this.filterLayers(flattenedLayers, view);
                }, delay);
            } else {
                model.layers = this.filterLayers(flattenedLayers, view);
            }
        });
    }

    private filterLayers(layers: Collection<__esri.Layer>, view: __esri.View): Array<__esri.Layer> {
        const titledLayers = layers.filter((layer) => layer.title !== undefined && layer.title !== null && layer.title !== "");
        const usableTypeLayers = titledLayers.filter((layer) => layer.type !== "group" && layer.type !== "wms");
        const layersWithFields = usableTypeLayers.filter((layer) => layer.fields);
        const visibleLayers = layersWithFields.filter((layer) =>
            this.layerAndAllParentLayersVisible(layer) && this.isVisibleAtScale(layer, view.scale)
        );

        return Array.from(visibleLayers);
    }

    private layerAndAllParentLayersVisible(layer: __esri.Layer): boolean {
        if (layer.parent && layer.parent.declaredClass !== "esri.Map") {
            return layer.visible && this.layerAndAllParentLayersVisible(layer?.parent);
        } else {
            return layer.visible;
        }
    }

    private isVisibleAtScale(layer: __esri.Layer, scale: number) {
        const minScale = layer.minScale || 0;
        const maxScale = layer.maxScale || 0;
        if (minScale === 0 && maxScale === 0) {
            return true;
        }
        return scale >= maxScale && (minScale !== 0 ? scale <= minScale : true);
    }

    private activateFeatureSelection(): void {
        this.getView().then(view => {
            if (!this.draw)
                this.draw = new Draw({ view });
            this.activateDrawing();
        });
    }

    private activateDrawing(): void {
        this.draw?.reset();
        this.drawAction = this.draw.create("point");
        this.drawAction.on("cursor-update", this.drawHoverGraphic.bind(this)); // TODO Remove bind syntax
        this.drawAction.on("draw-complete", this.findFeatureAndAddLabels.bind(this));
    }

    private deactivateDrawing(): void {
        this.draw.reset();
        this.drawAction = null;
        this.deleteHoverGraphic();
    }

    private drawHoverGraphic({ coordinates }): void {
        const model = this._labelingModel!;
        const view = this._mapWidgetModel!.view;

        const point = {
            type: "point",
            x: coordinates[0],
            y: coordinates[1],
            spatialReference: view.spatialReference
        };

        const graphic = new Graphic({
            geometry: point,
            symbol: model.hoverSymbol
        });

        view.graphics.remove(this.hoverGraphic);
        this.hoverGraphic = graphic;
        view.graphics.add(this.hoverGraphic);
    }

    private deleteHoverGraphic(): void {
        this._mapWidgetModel.view.graphics.remove(this.hoverGraphic);
        this.hoverGraphic = null;
    }

    private findFeatureAndAddLabels({ coordinates }): void {
        const model = this._labelingModel;
        const view = this._mapWidgetModel.view;

        this.activateDrawing();

        let targetGeometry;
        const layer = model.selectedLayer;
        if (layer.geometryType === "polygon") {
            targetGeometry = new Point({
                x: coordinates[0],
                y: coordinates[1],
                spatialReference: view.spatialReference
            });
        } else {
            targetGeometry = this.createGeometryWithTolerance(coordinates, view, view.spatialReference);
        }

        const queryParams = layer.createQuery();
        queryParams.geometry = targetGeometry;
        queryParams.outFields = ["*"];

        layer.queryFeatures(queryParams).then(this.addLabelsToFoundFeature.bind(this));
    }

    private createGeometryWithTolerance(
        coordinates: Array<number>,
        view: __esri.View,
        ref: __esri.SpatialReference
    ): __esri.Point | __esri.Extent {
        const model = this._labelingModel;

        const centerPoint = new Point({ x: coordinates[0], y: coordinates[1], spatialReference: ref });
        if (!model!.clickTolerance || model!.clickTolerance === 0) {
            return centerPoint;
        } else {
            const toleranceMapUnits = this.convertClickToleranceToMapUnits(model!.clickTolerance, view);
            return this.createBufferExtent(centerPoint, toleranceMapUnits, ref);
        }
    }

    private convertClickToleranceToMapUnits(clickTolerance: number, view: __esri.View) {
        const pixelWidth = view.width;
        const mapUnitWidth = view.extent.width;
        return mapUnitWidth / pixelWidth * (clickTolerance);
    }

    private createBufferExtent(
        point: __esri.Point,
        bufferDistance: number,
        ref: __esri.SpatialReference
    ): __esri.Extent {
        return new Extent({
            xmin: point.x - bufferDistance,
            xmax: point.x + bufferDistance,
            ymin: point.y - bufferDistance,
            ymax: point.y + bufferDistance,
            spatialReference: ref
        });
    }

    private addLabelsToFoundFeature(result): void {
        const model = this._labelingModel;

        if (result.features.length === 0)
            return;

        const feature = result.features[0];

        this.addFieldLabelsToFeature(feature);

        if (model.showFeatureEdgeLengths && feature.geometry.type === "polygon") {
            this.labelCreator.getEdgeLengthLabels(feature)
                .then(labels => labels.forEach((label) => this.addLabelToMap(label, feature, "edge")));
        }
    }

    private addFieldLabelsToFeature(feature): void {
        const model = this._labelingModel;
        const i18n = this._i18n.get();

        const attributes = feature.attributes;
        const labelStrings = [];
        for (const labelDef of model.selectedFields) {
            const attributeName = labelDef.name;
            const attributeValue = attributes[attributeName];
            const value = attributeValue ? attributeValue : "";
            let label = `${attributeName}: ${value}`;
            if (labelDef.prefix || labelDef.postfix) {
                label = `${labelDef.prefix} ${value} ${labelDef.postfix}`;
            } else if (model!.allowEmptyPrefix) {
                label = `${value}`;
            }
            labelStrings.push(label);
        }

        if (feature.geometry.type === "polyline" && model.showFeatureEdgeLengths) {
            const attributeValue = this.getPolyLineLength(feature.geometry);
            const value = attributeValue ? attributeValue : "";
            const roundedValue = value.toFixed(2);
            const label = `${i18n.ui.lengthPrefix}: ${roundedValue} ${i18n.ui.lengthUnitAbbreviations[model.lengthUnit]}`;
            labelStrings.push(label);
        }

        const labelString = labelStrings.join("\n");

        const symbol = Object.assign({}, model.textSymbol);
        symbol.text = labelString;

        const geometry = feature.geometry;
        let center;
        if (geometry.type === "point") {
            center = new Point({
                x: geometry.x,
                y: geometry.y,
                spatialReference: geometry.spatialReference
            });
        }
        else if (geometry.type === "polyline") {
            center = geometry.extent.center;
        } else {
            center = geometry.centroid;
        }

        const graphic = new Graphic({ symbol, geometry: center });

        this.addLabelToMap(graphic, feature, "field");
    }

    private addLabelToMap(graphic: __esri.Graphic, feature: __esri.Feature, fieldOrEdge: "field" | "edge"): void {
        if (fieldOrEdge == "field") {
            this._fieldLabels.push({ graphic: graphic, feature: feature });
        }
        else {
            this._edgeLabels.push({ graphic: graphic, feature: feature });
        }
        this._mapWidgetModel.view.graphics.add(graphic);

    }

    public deleteAllLabels(): void {
        for (const graphic of this._fieldLabels) {
            this._mapWidgetModel.view.graphics.remove(graphic.graphic);
        }
        for (const graphic of this._edgeLabels) {
            this._mapWidgetModel.view.graphics.remove(graphic.graphic);
        }
    }

    private getView(): Promise<__esri.MapView | __esri.SceneView> {
        const mapWidgetModel = this._mapWidgetModel;
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

    private getFlattenLayers(layers: __esri.Collection<__esri.Layer>): __esri.Collection<__esri.Layer> {
        return layers.flatten(item => item.layers || item.sublayers);
    }

    private getPolyLineLength(line: __esri.Polyline): number {
        const model = this._labelingModel;
        let length: number;

        if (line.spatialReference.isWebMercator || line.spatialReference.wkid === 4326) {
            length = geodesicLength(line, model.lengthUnit);
        } else {
            length = planarLength(line, model.lengthUnit);
        }

        return length;
    }

}
