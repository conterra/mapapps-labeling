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

import Vue from "apprt-vue/Vue";
import VueDijit from "apprt-vue/VueDijit";
import LabelingWidget from "./LabelingWidget.vue";
import Binding from "apprt-binding/Binding"

const binding = Symbol("binding");

export default class LabelingWidgetFactory {

    createInstance(){

        let model = this.model;

        let vueComponent = new Vue(LabelingWidget);
        let widget = VueDijit(vueComponent, {class: "fullHeight"});

        vueComponent.i18n = this._i18n.get();

        vueComponent.$on("delete-all-labels", model.deleteLabels.bind(model));
        vueComponent.$on("set-show-edge-lengths", model.setShowFeatureEdgeLengths.bind(model));
        vueComponent.$on("add-field-label", model.addLabelDefinition.bind(model));
        vueComponent.$on("delete-label-definition", model.removeLabelDefinition.bind(model));
        vueComponent.$on("edit-label", model.editLabelDefinition.bind(model));
        vueComponent.$on("activate-selection", model._activateFeatureSelection.bind(model));
        vueComponent.$on("deactivate-selection", model._deactivateFeatureSelection.bind(model));

        widget[binding] = Binding.for(vueComponent, model)
            .syncAllToLeft("layerFields", "fieldLabels")
            .enable()
            .syncToLeftNow();

        return widget;
    }

    destroyInstance(instance){
        instance[binding].unbind();
        instance.destroy();
    }

}
