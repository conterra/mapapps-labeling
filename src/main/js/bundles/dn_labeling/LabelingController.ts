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
import LabelCreator from "./LabelCreator";
import * as reactiveUtils from "esri/core/reactiveUtils";
import { Observers, createObservers } from "apprt-core/Observers";


import type { InjectedReference } from "apprt-core/InjectedReference";
import LabelingModel from "./LabelingModel";
import { MapWidgetModel } from "map-widget/api";
import Collection from "esri/core/Collection";

export default class LabelingController {

    private modelObservers?: Observers;
    private mapLayerWatcher?: __esri.WatchHandle;
    private layerObservers?: Observers;
    private drawAction: any; // TODO Typing
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
    }

    public onToolDeactivated(): void {
        if (this.modelObservers) {
            this.modelObservers.destroy();
            this.modelObservers = undefined;
        }

        if (this.mapLayerWatcher) {
            this.mapLayerWatcher.remove();
        }

        if (this.layerObservers) {
            this.layerObservers.destroy();
            this.layerObservers = undefined;
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
                });
            })
        );

        return modelOberservers;
    }

    private createMapLayerWatcher(mapWidgetModel: MapWidgetModel): __esri.WatchHandle {
        return reactiveUtils.watch(
            () => [mapWidgetModel.map.layers], ([layers]) => {
                if (this.layerObservers) {
                    this.layerObservers.clean();
                }

                this.layerObservers = this.createLayerObservers(layers);
            },
            {
                initial: true
            }
        );
    }

    private createLayerObservers(layers: Collection<__esri.Layer>): Observers {
        const layerObservers = createObservers();

        layers.forEach(layer => {
            layerObservers.add(
                layer.watch("loaded", loaded => {
                    this.updateSelectableLayers();

                    if (loaded && layer?.layers?.length >= 1)
                        layer.layers.forEach(layer => {
                            layerObservers.add(
                                layer.watch("loaded", () => {
                                    this.updateSelectableLayers();
                                })
                            );
                        });

                    if (loaded && layer?.sublayers?.length >= 1) {
                        layer.sublayers.forEach(() => {
                            layerObservers.add(
                                layer.watch("loaded", () => {
                                    this.updateSelectableLayers();
                                })
                            );
                        });
                    }
                })
            );
        });

        return layerObservers;
    }

    private updateSelectableLayers() {
        const model = this._labelingModel!;
        const mapWidgetModel = this._mapWidgetModel!;

        const layers = mapWidgetModel.map.layers;
        const flattenedLayer = this.getFlattenLayers(layers);

        model.layers = flattenedLayer.items.filter((layer: __esri.Layer) => layer.title && layer.type !== "group" && !layer?.sublayers);
        model.selectedLayer = model.layers[0];
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
        const model = this._labelingModel;
        const view = this._mapWidgetModel.view;

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

        // Resets the drawing, but doesnt disable it, since labeling is done via toggle tool
        this.activateDrawing();

        const x = coordinates[0];
        const y = coordinates[1];
        const spatialReference = this._mapWidgetModel.view.spatialReference;
        const point = new Point({ x, y, spatialReference });

        const queryParams = model.selectedLayer.createQuery();
        queryParams.geometry = point;
        queryParams.outFields = ["*"];

        const layer = model.selectedLayer;
        layer.queryFeatures(queryParams).then(this.addLabelsToFoundFeature.bind(this));
    }

    private addLabelsToFoundFeature(result): void {
        const model = this._labelingModel;

        if (result.features.length === 0)
            return;

        const feature = result.features[0];

        this.addFieldLabelsToFeature(feature);

        if (model.showFeatureEdgeLengths) {
            this.labelCreator.getEdgeLengthLabels(feature)
                .then(labels => labels.forEach((label) => this.addLabelToMap(label, feature, "edge")));
        }
    }

    private addFieldLabelsToFeature(feature): void {
        const model = this._labelingModel;

        const attributes = feature.attributes;
        const labelStrings = [];
        for (const labelDef of model.selectedFields) {
            const attributeName = labelDef.name;
            const attributeValue = attributes[attributeName];
            const value = attributeValue ? attributeValue : "";
            let label = `${attributeName}:${value}`;
            if (labelDef.prefix || labelDef.postfix) {
                label = `${labelDef.prefix} ${value} ${labelDef.postfix}`;
            }
            labelStrings.push(label);
        }

        const labelString = labelStrings.join("\n");

        const symbol = Object.assign({}, model.textSymbol);
        symbol.text = labelString;

        const geometry = feature.geometry;
        const center = geometry.centroid;
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

    private getView(): Promise< __esri.MapView | __esri.SceneView> {
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

}
