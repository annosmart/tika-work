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

import React from "react";
import {ViewContainer} from "./data-view.styled";
import ImageView from "./view-controls/image-view";
import TextView from "./view-controls/text-view";
import AudioView from "./view-controls/audio-view";
import {DataTypes} from "../enums";

// view wrapper for data types views components
function DataView({dataType, file, options, toolName, mouseEvent, setMouseEvent, toolData, dimensions, reset}) {

    return <ViewContainer left={dimensions?.leftPanel.width}>
        {dataType === DataTypes.Image &&
        <ImageView image={file} options={options} toolName={toolName} dimensions={dimensions}
                   setMouseEvent={setMouseEvent} toolData={toolData}/>}
        {dataType === DataTypes.Text &&
        <TextView text={file} options={options} toolName={toolName} dimensions={dimensions}
                  setMouseEvent={setMouseEvent} toolData={toolData}/>}
        {(dataType === DataTypes.Audio || dataType === DataTypes.Video) &&
        <AudioView audio={file} options={options} toolName={toolName} dimensions={dimensions}
                   setMouseEvent={setMouseEvent} toolData={toolData} hasVideo={dataType === DataTypes.Video}
                   reset={reset}
        />}
    </ViewContainer>
}

export default DataView
