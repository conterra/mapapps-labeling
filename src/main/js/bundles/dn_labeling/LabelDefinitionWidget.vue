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
    <v-layout column>
        <v-layout row>
            <b style="display: inline-flex;align-items: center;font-size: 1.3em;"> {{ name }} </b>
            <v-spacer />
            <v-btn
                :dark="edit"
                icon
                small
                color="primary"
                @click="handleEdit"
            >
                <v-icon>edit</v-icon>
            </v-btn>
            <v-btn
                icon
                small
                dark
                color="primary"
                @click="handleDeletion"
            >
                <v-icon>delete</v-icon>
            </v-btn>
        </v-layout>
        <v-layout
            v-show="edit"
            column
        >
            <v-layout row>
                <v-text-field
                    v-model="prefix"
                    label="Präfix"
                    hide-details
                    class="mt-2 mb-2 pt-0"
                />
            </v-layout>
            <v-layout row>
                <v-text-field
                    v-model="postfix"
                    label="Postfix"
                    hide-details
                    class="mt-2 mb-2 pt-0"
                />
            </v-layout>
            <v-layout row>
                <v-btn
                    block
                    color="primary"
                    @click="handleSave"
                >
                    Speichern
                </v-btn>
                <v-btn
                    block
                    @click="handleCancel"
                >
                    Abbrechen
                </v-btn>
            </v-layout>
        </v-layout>
    </v-layout>
</template>

<script>
    export default {
        props: {
            name:{
                type: String,
                default: ""
            },
            id: {
                type: Number,
                default: undefined
            },
            initialPrefix:{
                type: String,
                default: ""
            },
            initialPostfix:{
                type: String,
                default: ""
            }

        },
        data: function(){
            return {
                edit: false,
                prefix: null,
                postfix: null
            };
        },
        watch: {
            edit(){
                if(this.edit){
                    this.prefix = this.initialPrefix;
                    this.postfix = this.initialPostfix;
                }
            },
            initialPrefix(){
                this.prefix = this.initialPrefix;
            },
            initialPostfix(){
                this.postfix = this.initialPostfix;
            }
        },
        methods: {
            handleDeletion(){
                this.$emit("delete-label-definition", this.id);
            },
            handleEdit(){
                this.edit = !this.edit;
            },
            handleCancel(){
                this.edit = false;
            },
            handleSave(){
                const id = this.id;
                const prefix = this.prefix;
                const postfix = this.postfix;

                this.$emit("edit-label", {id, prefix, postfix});
            }
        }
    };
</script>
