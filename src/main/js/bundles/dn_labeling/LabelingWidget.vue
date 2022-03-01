<!--

    Copyright (C) 2021 con terra GmbH (info@conterra.de)

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

            http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

-->
<template>
    <v-layout column fill-height>
        <v-flex shrink row justify-space-around>
            <v-btn block class="success" @click="handleSelectionActivation">Auswahl aktivieren</v-btn>
            <v-btn block class="error" @click="handleSelectionDeactivation">Auswahl deaktivieren</v-btn>

        </v-flex>
        <v-flex shrink>
            <v-layout row>
                <span>Umring bemaßen</span>
                <v-checkbox v-model="showFeatureEdgeLengths" class="shrink pt-0 mt-0 ml-2" hide-details
                            color="primary"></v-checkbox>
            </v-layout>
        </v-flex>
        <v-divider class="mt-2 mb-3"></v-divider>

        <v-layout column>
            <h4>Beschriftung festlegen</h4>
            <v-layout shrink row>
                <v-autocomplete :items="layerFields" v-model="selectedField" item-text="alias" return-object single-line
                                label="Attribut zur Beschriftung hinzufügen" hide-details
                                class="pt-0 mt-0"></v-autocomplete>
                <v-btn @click="handleFieldAdditionClick" :disabled="disableAddButton" icon small dark color="primary">
                    <v-icon>add</v-icon>
                </v-btn>
            </v-layout>
            <v-flex grow style="overflow-y: auto; height: 0;">
                <v-list>
                    <label-definition-widget v-for="label in fieldLabels" :key="label.id" :name="label.alias"
                                             :id="label.id" :initial-prefix="label.prefix"
                                             :initial-postfix="label.postfix"
                                             v-on:delete-label-definition="handleLabelDefinitionDeletion"
                                             v-on:edit-label="handleLabelEdit">
                    </label-definition-widget>
                </v-list>
            </v-flex>
        </v-layout>

        <v-flex shrink>
            <v-btn @click="handleDeleteAllLabelsClick" block color="primary" class="ma-0">Alle Beschriftungen Löschen
            </v-btn>
        </v-flex>
    </v-layout>
</template>
<script>

import Bindable from "apprt-vue/mixins/Bindable";
import LabelDefinitionWidget from "./LabelDefinitionWidget.vue";

export default {

    mixins: [Bindable],

    components: {
        "label-definition-widget": LabelDefinitionWidget
    },

    data: function () {
        return {
            showFeatureEdgeLengths: true,
            selectedField: null,
            selectionActivated: false
        }
    },

    props: {
        i18n: Object,
        layerFields: Array,
        fieldLabels: Array
    },

    methods: {
        handleDeleteAllLabelsClick() {
            this.$emit("delete-all-labels");
        },
        handleEdgeLabelingChange() {
            this.$emit("set-show-edge-lengths", this.showFeatureEdgeLengths);
        },
        handleFieldAdditionClick() {
            this.$emit("add-field-label", this.selectedField);
            this.selectedField = null;
        },
        handleLabelDefinitionDeletion(id) {
            this.$emit("delete-label-definition", id);
        },
        handleLabelEdit(event) {
            this.$emit("edit-label", event);
        },
        handleSelectionActivation() {
            this.$emit("activate-selection");
        },
        handleSelectionDeactivation() {
            this.$emit("deactivate-selection");
        }
    },
    watch: {
        showFeatureEdgeLengths() {
            this.handleEdgeLabelingChange();
        }
    },
    computed: {
        disableAddButton() {
            return !this.selectedField;
        }
    }
}
</script>
