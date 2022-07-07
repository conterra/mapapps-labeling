<!--

    Copyright (C) 2022 con terra GmbH (info@conterra.de)

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
    <v-container class="px-0 py-0">
        <v-layout column>
            <v-flex>
                <v-select
                    :items="[1,2,3]"
                    label="Standard"
                ></v-select>
            </v-flex>

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
export default {
    data: function () {
        return {
            //
        }
    },
    props: {
        i18n: Object
    },
    methods: {
        handleSelectionActivation() {
            this.$emit("activate-selection");
        },
        handleSelectionDeactivation() {
            this.$emit("deactivate-selection");
        }
    }
}
</script>
