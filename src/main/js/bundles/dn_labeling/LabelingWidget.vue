<!--

    Copyright (C) 2025 con terra GmbH (info@conterra.de)

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
    <div class="ct-labeling-widget">
        <div class="ct-labeling-widget__selections">
            <v-sheet class="mb-1">
                <h3>{{ i18n.selectionTitle }}</h3>
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
            </v-sheet>
            <v-sheet
                v-show="edit"
                class="my-1 ct-labeling-widget__edit-section"
            >
                <div class="align-right">
                    <v-tooltip
                        top
                        open-delay="800"
                    >
                        <template #activator="{ on }">
                            <v-btn
                                class="ct-labeling-widget__edit-close-section mr-2"
                                icon
                                small
                                v-on="on"
                                :aria-label="i18n.finishEditingAttributeLabel"
                                @click="edit = !edit"
                            >
                                <v-icon>close</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ i18n.finishEditingAttributeLabel }}</span>
                    </v-tooltip>
                </div>
                <div class="ct-labeling-widget__edit-inputs">
                    <v-text-field
                        v-model="editedField.prefix"
                        :label="i18n.prefix"
                    />
                    <v-text-field
                        v-model="editedField.postfix"
                        :label="i18n.postfix"
                    />
                </div>
            </v-sheet>
            <v-sheet class="my-1">
                <h3>{{ i18n.selectionFields }}</h3>
                <!--TODO: Element not focusable with keyboard, even when not disabled-->
                <v-select
                    v-model="selectedFields"
                    :items="fields"
                    rounded
                    multiple
                    single-line
                    label="Felder auswählen"
                    item-text="name"
                    return-object
                    class="ct-labeling-widget__draggable-select pt-1 mt-0"
                    clearable
                    :disabled="!selectedLayer"
                >
                    <template #selection="data">
                        <draggable
                            :id="`ct-labeling-attribute-${data.index}`"
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
                                    <v-tooltip
                                        top
                                        open-delay="800"
                                    >
                                        <template #activator="{ on }">
                                            <v-btn
                                                icon
                                                :aria-label="i18n.editAttributeLabel"
                                                v-on="on"
                                                @click="setEdit(data.item)"
                                            >
                                                <v-icon small>edit</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>{{ i18n.editAttributeLabel }}</span>
                                    </v-tooltip>
                                    <v-tooltip
                                        top
                                        open-delay="800"
                                    >
                                        <template #activator="{ on }">
                                            <v-btn
                                                icon
                                                :aria-label="i18n.deleteAttributeLabel"
                                                v-on="on"
                                                @click="remove(data.item)"
                                            >
                                                <v-icon small>close</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>{{ i18n.deleteAttributeLabel }}</span>
                                    </v-tooltip>
                                </span>
                            </v-chip>
                        </draggable>
                    </template>
                </v-select>
            </v-sheet>
        </div>
        <v-divider />
        <div class="ct-labeling-widget__controls-div">
            <div class="my-1">
                <v-switch
                    v-model="showFeatureEdgeLengths"
                    class="controls circumference-switch"
                    color="primary"
                    :label="i18n.edgesLabel"
                    :disabled="edgeLengthsDisabled"
                />
            </div>
            <div>
                <v-btn
                    color="primary"
                    :aria-pressed="active"
                    :disabled="selectedFields.length === 0"
                    @click.native="setLabeling"
                >
                    <v-icon>{{ !active ? "icon-play" : "icon-pause" }}</v-icon>
                    {{ !active ? i18n.labeling.start : i18n.labeling.stop }}
                </v-btn>
                <v-btn
                    color="error"
                    outline
                    :disabled="!selectedLayer || (selectedLayer && selectedFields.length === 0)"
                    @click.native="deleteLabel"
                >
                    <v-icon>icon-trashcan-detailed</v-icon>
                    {{ i18n.labeling.delete }}
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
                }
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
