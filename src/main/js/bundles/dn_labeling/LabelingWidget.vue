<!--

    Copyright (C) 2024 con terra GmbH (info@conterra.de)

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
    <div class="labelingWidgetContainer">
        <div class="__selections-div">
            <div>
                <h4>{{ i18n.selectionTitle }}</h4>
                <v-autocomplete
                    v-model="selectedLayer"
                    :items="layers"
                    rounded
                    item-text="title"
                    return-object
                    single-line
                    label="Layer auswählen"
                    hide-details
                    class="pt-0 mt-0 pb-2"
                />
            </div>
            <div>
                <div v-show="edit">
                    <v-sheet elevation="12">
                        <v-btn
                            id="iconRight"
                            icon
                            small
                            @click="edit = !edit"
                        >
                            <v-icon>close</v-icon>
                        </v-btn>
                        <div id="editText">
                            <v-text-field
                                v-model="editedField.prefix"
                                label="Präfix"
                            />
                            <v-text-field
                                v-model="editedField.postfix"
                                label="Postfix"
                            />
                        </div>
                    </v-sheet>
                </div>
                <h4>{{ i18n.selectionFields }}</h4>
                <v-select
                    id="autocomplete"
                    v-model="selectedFields"
                    :items="fields"
                    rounded
                    multiple
                    single-line
                    label="Felder auswählen"
                    item-text="name"
                    return-object
                    class="draggableSelect pt-1 mt-0"
                    clearable
                    :disabled="!selectedLayer"
                >
                    <template #selection="data">
                        <draggable
                            :id="data.index"
                            :list="selectedFields"
                            v-bind="dragOptionsChips"
                            :move="move"
                            @change="change"
                        >
                            <v-chip
                                :key="data.item.name"
                                draggable
                                label
                                outline
                                class="short"
                                @mousedown.stop
                                @click.stop
                            >
                                <v-icon>drag_indicator</v-icon>

                                <span>{{ data.item.name }}</span>
                                <span>
                                    <v-btn
                                        icon
                                        @click="setEdit(data.item)"
                                    >
                                        <v-icon small>edit</v-icon>
                                    </v-btn>
                                    <v-btn
                                        icon
                                        @click="remove(data.item)"
                                    >
                                        <v-icon small>close</v-icon>
                                    </v-btn>
                                </span>
                            </v-chip>
                        </draggable>
                    </template>
                </v-select>
            </div>
        </div>
        <div class="__controls-div">
            <div>
                <v-switch
                    v-model="showFeatureEdgeLengths"
                    class="controls circumference-switch"
                    color="primary"
                    :label="i18n.edgesLabel"
                    :disabled="edgeLengthsDisabled"
                />
                <v-switch
                    v-model="syncChanges"
                    class="controls circumference-switch"
                    color="primary"
                    :label="i18n.autoUpdate"
                />
            </div>
            <div>
                <v-btn
                    v-if="!active"
                    color="primary"
                    @click.native="setLabeling"
                >
                    Start Labeling
                </v-btn>
                <v-btn
                    v-else
                    color="primary"
                    @click.native="setLabeling"
                >
                    Stop Labeling
                </v-btn>
                <v-btn
                    color="secondary"
                    @click.native="deleteLabel"
                >
                    Delete labels
                </v-btn>
            </div>
        </div>
    </div>
</template>
<script>
    import draggable from 'vuedraggable';
    import Bindable from "apprt-vue/mixins/Bindable";
    export default {
        components: {
            "draggable": draggable
        },
        mixins: [Bindable],
        props: {
            fields: {
                type: Array,
                default: () => []
            },
            layers: {
                type: Array,
                default: () => []
            },
            edgeLengthsDisabled: {
                type: Boolean,
                default: false
            },
            i18n: {
                type: Object,
                default: function () {
                    return {};
                }
            }
        },
        data: function () {
            return {
                dragged: {
                    from: -1,
                    to: -1,
                    newIndex: -1
                },
                active: false,
                lables: [],
                selectedFields: [],
                selectedLayer: null,
                showFeatureEdgeLengths: false,
                edit: false,
                editedField: {
                    prefix: "",
                    postfix: ""
                },
                syncChanges: true
            };
        },
        computed: {
            dragOptionsChips() {
                return {
                    animation: 200,
                    group: "group",
                    disabled: false,
                    ghostClass: "ghost",
                    sort: true
                };
            }
        },
        methods: {
            setLabeling() {
                this.active = !this.active;
            },
            setEdit(item) {
                this.edit = true;
                this.editedField = item;
            },
            deleteLabel() {
                this.$emit("delete");
            },
            remove(item) {
                this.selectedFields.splice(this.selectedFields.indexOf(item), 1);
                this.selectedFields = [...this.selectedFields];
            },
            move: function (value) {
                this.dragged = {
                    from: parseInt(value.from.id),
                    to: parseInt(value.to.id),
                    newIndex: value.draggedContext.futureIndex
                };
            },
            change: function (value) {
                if (value.removed) {
                    // eslint-disable-next-line max-len
                    this.selectedFields.splice(this.dragged.to + this.dragged.newIndex, 0, this.selectedFields[this.dragged.from]);
                    if (this.dragged.from < this.dragged.to) {
                        this.selectedFields.splice(this.dragged.from, 1);
                    }
                    else{
                        this.selectedFields.splice(this.dragged.from + 1, 1);
                    }
                }
            }
        }
    };
</script>
