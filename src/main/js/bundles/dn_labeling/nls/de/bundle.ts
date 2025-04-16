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

import { Messages } from "../bundle";

export default {
    bundleName: "Labeling Bundle",
    bundleDescription: "Dieses Bundle beschriftet Features mit Kantenlängen und beliebigen zusätzlichen Attributen.",
    ui: {
        title: "Beschriftungswerkzeug",
        tooltip: "Beschriftungswerkzeug",
        selectionTitle: "Layer auswählen",
        selectionFields: "Felder auswählen",
        editAttributeLabel: "Attributbeschriftung bearbeiten",
        finishEditingAttributeLabel: "Bearbeitung der Attributbeschriftung beenden",
        deleteAttributeLabel: "Attributbeschriftung entfernen",
        edgesLabel: "Kantenlängen beschriften",
        autoUpdate: "Änderungen automatisch anwenden",
        prefix: "Präfix",
        postfix: "Postfix",
        lengthPrefix: "Länge",

        labeling: {
            start: "Beschriften Starten",
            stop: "Beschriften beenden",
            delete: "Beschriftungen löschen"
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
} satisfies Messages;
