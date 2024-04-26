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
const i18n = {
    root: {
        bundleName: "Labeling Bundle",
        bundleDescription: "This bundle labels features with border length and optional additional attributes.",
        ui: {
            title: "Labeling Tool",
            tooltip: "Labeling Tool",
            selectionTitle: "Select Layer",
            selectionFields: "Select Fields",
            edgesLabel: "Label Edge Lengths",
            autoUpdate: "Keep updated",
            prefix: "Prefix",
            postfix: "Postfix",
            lengthPrefix: "Length",

            labeling: {
                start: "Start Labeling",
                stop: "Stop Labeling",
                delete: "Delete Labels"
            },

            lengthUnitAbbreviations: {
                milimeters: "mm",
                centimeters: "cm",
                decimeters: "dm",
                meters: "m",
                kilometers: "km",
                inches: "in",
                feet: "ft",
                yards: "yd",
                miles: "mi",
                "nautical-miles": "nmi"
            }
        }
    },
    de: true
};

export type Messages = (typeof i18n)["root"];
export interface MessagesReference {
    get: () => Messages
}
export default i18n;
