///
/// Copyright (C) 2025 con terra GmbH (info@conterra.de)
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

import { Mutable, properties } from "apprt-core/Mutable";
import type { Mutable as MutableType } from "@conterra/ct-mapapps-typings/apprt-core/Mutable";

function defineProperties<Impl, P>(mutableDefinition: any, mutableProperties: {
    active: false;
    labels: [];
    layers: [];
    selectedLayer: null;
    fields: [];
    selectedFields: [];
    showFeatureEdgeLengths: false;
    edgeLengthsDisabled: false;
    allowEmptyPrefix: false;
}): Impl & MutableType<P> {
    properties(mutableDefinition, mutableProperties);
    return mutableDefinition;
}

class LabelingModel extends Mutable {
}

interface LabelingModelProps {
    active: boolean;
    labels: Array<any>;
    layers: Array<any>;
    selectedLayer: __esri.Layer;
    fields: Array<any>;
    selectedFields: Array<any>;
    showFeatureEdgeLengths: boolean;
    edgeLengthsDisabled: boolean;
    allowEmptyPrefix: boolean;
}

export default defineProperties<LabelingModel, LabelingModelProps>(LabelingModel,
    {
        active: false,
        labels: [],
        layers: [],
        selectedLayer: null,
        fields: [],
        selectedFields: [],
        showFeatureEdgeLengths: false,
        edgeLengthsDisabled: false,
        allowEmptyPrefix: false
    });
