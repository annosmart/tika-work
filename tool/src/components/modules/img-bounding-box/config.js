/*
 * Copyright (C) 2023  Annosmart Technologies Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export default {
    value: "bounding_box", label: "bounding-box",
    dataType: "image",
    index: {file: "img-bounding-box/bbox-module", args: {}},
    priority: 580,
    modeTypes: [
        {
            value: "single-type", label: "single-type",
            levelTypes: [
                {value: "single-level", label: "simple"},
                {value: "two-level", label: "attribute-based"},
		{value: "multi-level", label: "multi-level"}
            ]
        },
        {
            value: "multi-type", label: "multi-type",
            levelTypes: [
                {value: "single-level", label: "simple"},
                {value: "two-level", label: "attribute-based"},
		{value: "multi-level", label: "multi-level"}
            ]
        },
    ]
}