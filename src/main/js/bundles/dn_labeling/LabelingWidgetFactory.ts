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

import Binding, {Bindable} from "apprt-binding/Binding";
import Vue from "apprt-vue/Vue";
import VueDijit from "apprt-vue/VueDijit";
import LabelingWidget from "./LabelingWidget.vue";
import type {InjectedReference} from "apprt-core/InjectedReference";

export default class LabelingWidgetFactory {

    private vm? : Vue;
    private _properties: InjectedReference<any>;
    private _labelingModel: InjectedReference<any>;
    private labelingBinding?: Bindable;
    private _controller: InjectedReference<any>;

    activate (): void {
        this.initComponent();
    }

    deactivate() : void{
        if (this.labelingBinding) {
            this.labelingBinding.unbind();
            this.labelingBinding= undefined;
        }

        this.vm = undefined;
    }

    initComponent() :void {
        const vm: InjectedReference<any> = this.vm = new Vue(LabelingWidget);

        const labelingModel = this._labelingModel;
        const controller = this._controller;

        vm.$on("delete", () => {
            controller.deleteAllLabels();
        });

        this.labelingBinding = Binding.for(vm, labelingModel)
            .syncAll("active")
            .syncAllToLeft("layers")
            .syncAll("selectedLayer")
            .syncAllToLeft("fields")
            .syncAll("selectedFields")
            .syncAll("showFeatureEdgeLengths")
            .syncAll("syncChanges")
            .enable()
            .syncToLeftNow();
    }

    createInstance() : typeof VueDijit {
        return VueDijit(this.vm, {class: "labeling-widget"});
    }

}
