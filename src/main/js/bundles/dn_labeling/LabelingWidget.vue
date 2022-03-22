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
    <v-container fill-height pa-0>
        <v-layout column>

            <v-flex column fill-height id="labeling-options">
                <h4>Beschriftung festlegen</h4>
                <v-switch
                    class="controls circumference-switch"
                    color="primary"
                    v-model="showFeatureEdgeLengths"
                    label="Kantenlängen beschriften"
                >
                </v-switch>
                <v-layout column>
                    <v-layout shrink row>
                        <v-autocomplete :items="layerFields" v-model="selectedField" item-text="alias" return-object single-line
                                        label="Attribut zur Beschriftung hinzufügen" hide-details
                                        class="pt-0 mt-0"></v-autocomplete>
                        <v-btn @click="handleFieldAdditionClick" :disabled="disableAddButton" icon small dark color="primary">
                            <v-icon>add</v-icon>
                        </v-btn>
                    </v-layout>
                    <v-flex grow style="overflow-y: auto;">
                        <v-list id="labeling-options-list">
                            <label-definition-widget v-for="label in fieldLabels" :key="label.id" :name="label.alias"
                                                     :id="label.id" :initial-prefix="label.prefix"
                                                     :initial-postfix="label.postfix"
                                                     v-on:delete-label-definition="handleLabelDefinitionDeletion"
                                                     v-on:edit-label="handleLabelEdit">
                            </label-definition-widget>
                        </v-list>
                    </v-flex>
                </v-layout>
            </v-flex>

            <v-flex shrink>
                <v-btn @click="handleDeleteAllLabelsClick" block color="primary" class="ma-0">Alle Beschriftungen
                    Löschen
                </v-btn>
            </v-flex>


            <!-- Divider -->
            <v-divider class="mt-2 mb-3"></v-divider>

            <!-- Activate/Deactivate Buttons -->

            <v-flex column justify-space-around align-center>
                <div>
                    <v-btn
                        class="success"
                        @click="handleSelectionActivation"
                    >
                        Auswahl aktivieren
                    </v-btn>
                    <v-btn
                        class="error"
                        @click="handleSelectionDeactivation"
                    >
                        Auswahl deaktivieren
                    </v-btn>
                </div>
            </v-flex>
        </v-layout>

    </v-container>
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
