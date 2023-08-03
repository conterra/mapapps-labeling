<!--

    Copyright (C) 2023 con terra GmbH (info@conterra.de)

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
    <v-container grid-list-md pa-0>
        <v-layout row wrap>
            <v-flex md12>
                <h4>Select Layer:</h4>
                <v-autocomplete :items="layers" v-model="selectedLayer" rounded item-text="title" return-object single-line
                    label="Layer auswählen" hide-details class="pt-0 mt-0"></v-autocomplete>
            </v-flex>
            <v-flex md12>
                <h4>Select Fields:</h4>
                <v-autocomplete id="autocomplete" v-model="selectedFields" :items="fields" rounded multiple
                    label="Felder auswählen" item-text="name" return-object class="draggableSelect">
                    <template #selection="data">
                        <draggable :id="data.index" :list="selectedFields" v-bind="dragOptionsChips" :move="move"
                            @change="change">
                            <v-chip draggable label outline :key="data.item.name" @mousedown.stop @click.stop class="short">
                                <v-icon>drag_indicator</v-icon>

                                <span>{{ data.item.name }}</span>
                                <span>
                                    <v-btn icon @click="setEdit(data.item)">
                                        <v-icon small>edit</v-icon>
                                    </v-btn>
                                    <v-btn icon @click="remove(data.item)">
                                        <v-icon small>close</v-icon>
                                    </v-btn>
                                </span>
                            </v-chip>
                        </draggable>
                    </template>
                </v-autocomplete>
            </v-flex>
            <v-flex md12 v-show="edit">
                <v-sheet elevation="12">
            <v-btn icon id="iconRight" small @click="edit = !edit">
            <v-icon>close</v-icon>
          </v-btn>
          <div id="editText">
            <v-text-field v-model="editedField.prefix" label="Präfix"
                />
                <v-text-field v-model="editedField.postfix" label="Postfix"
                />
          </div>
          </v-sheet>
            </v-flex>
            <v-flex md12>
                <v-switch class="controls circumference-switch" color="primary" v-model="showFeatureEdgeLengths"
                          label="Kantenlängen beschriften"
                />
                <v-switch class="controls circumference-switch" color="primary" v-model="syncChanges"
                          label="Änderungen automatisch anwenden"
                />
            </v-flex>
        </v-layout>
        <v-flex md12>
            <v-container fluid>
                <v-btn v-if="!active" @click.native="setLabeling">Start Labeling</v-btn>
                <v-btn v-else @click.native="setLabeling">Stop Labeling</v-btn>
                <v-btn @click.native="deleteLabel"> Delete labels</v-btn>
            </v-container>
        </v-flex>

        </v-layout>
    </v-container>
</template>
<script>
    import * as draggable from 'vuedraggable';
    import Bindable from "apprt-vue/mixins/Bindable";
    export default {
        components: {
            "draggable": draggable.draggable
        },
        mixins: [Bindable],
        props: {
            fields: [],
            layers: []
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
                    // insert
                    // eslint-disable-next-line max-len
                    this.selectedFields.splice(this.dragged.to + this.dragged.newIndex, 0, this.selectedFields[this.dragged.from])
                    // delete
                    if (this.dragged.from < this.dragged.to) { // LTR
                        this.selectedFields.splice(this.dragged.from, 1);
                    }
                    else{ // RTL
                        this.selectedFields.splice(this.dragged.from + 1, 1)
                    }
                }
            }
        }
    };
</script>
