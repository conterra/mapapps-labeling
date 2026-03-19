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

const ID = "labeling-action";

import type { ActionDefinition, TocItem } from "toc/api";
import type { InjectedReference } from "apprt-core/InjectedReference";
import { MessagesReference } from "./nls/bundle";
import type Tool from "ct/tools/Tool";
import LabelingModel from "./LabelingModel";

export default class LayerRenameActionDefinitionFactory {

    private _i18n!: InjectedReference<MessagesReference>;
    private _tool!: InjectedReference<typeof Tool>;
    private _labelingModel: InjectedReference<typeof LabelingModel>;
    supportedIds: string[];

    constructor() {
        this.supportedIds = [ID];
    }

    createDefinitionById(id: string): ActionDefinition | undefined {
        const i18n = this._i18n!.get();
        const tool = this._tool;
        const labelingModel = this._labelingModel!;

        return {
            id,
            type: "button",
            label: i18n.ui.title,
            icon: "icon-edit-attributes",

            trigger(tocItem: TocItem) {
                tool.set("active", true);
                labelingModel.selectedLayer = tocItem.ref;
            },
            isVisibleForItem(tocItem: TocItem) {
                const layer = tocItem.ref;
                const isAddLayer = (layer: any) => {
                    if (layer.parent && layer.type != "group" && layer.fields) {
                        return true;
                    }
                    else if (!layer.parent) {
                        return false;
                    }
                    else {
                        return isAddLayer(layer.parent);
                    }
                };
                return isAddLayer(layer);
            }
        };
    }

}
