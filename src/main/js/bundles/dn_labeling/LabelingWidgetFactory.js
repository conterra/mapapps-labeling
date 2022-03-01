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
        let controller = this._controller;
        let vueComponent = new Vue(LabelingWidget);
        let widget = VueDijit(vueComponent, {class: "fullHeight"});

        vueComponent.i18n = this._i18n.get();

        vueComponent.$on("delete-all-labels", controller.deleteLabels.bind(controller));
        vueComponent.$on("set-show-edge-lengths", controller.setShowFeatureEdgeLengths.bind(controller));
        vueComponent.$on("add-field-label", controller.addLabelDefinition.bind(controller));
        vueComponent.$on("delete-label-definition", controller.removeLabelDefinition.bind(controller));
        vueComponent.$on("edit-label", controller.editLabelDefinition.bind(controller));
        vueComponent.$on("activate-selection", controller._activateFeatureSelection.bind(controller));
        vueComponent.$on("deactivate-selection", controller._deactivateFeatureSelection.bind(controller));

        widget[binding] = Binding.for(vueComponent, controller)
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
