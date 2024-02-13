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
            <b style="display: inline-flex;align-items: center;font-size: 1.3em;">{{name}}</b>
            <v-spacer></v-spacer>
            <v-btn @click="handleEdit" :dark="edit" icon small dark color="primary">
                <v-icon>edit</v-icon>
            </v-btn>
            <v-btn @click="handleDeletion" icon small dark color="primary">
                <v-icon>delete</v-icon>
            </v-btn>
        </v-layout>
        <v-layout column v-show="edit">
            <v-layout row>
                <v-text-field v-model="prefix" label="Präfix" hide-details class="mt-2 mb-2 pt-0"></v-text-field>
            </v-layout>
            <v-layout row>
                <v-text-field v-model="postfix" label="Postfix" hide-details class="mt-2 mb-2 pt-0"></v-text-field>
            </v-layout>
            <v-layout row>
                <v-btn @click="handleSave" block color="primary">Speichern</v-btn>
                <v-btn @click="handleCancel" block>Abbrechen</v-btn>
            </v-layout>
        </v-layout>
    </v-layout>
</template>

<script>
    export default {
        data: function(){
            return {
                edit: false,
                prefix: null,
                postfix: null
            }
        },
        props: {
            name: String,
            id: Number,
            initialPrefix: String,
            initialPostfix: String
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
                let id = this.id;
                let prefix = this.prefix;
                let postfix = this.postfix;

                this.$emit("edit-label", {id, prefix, postfix});
            }
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
        }
    }
</script>