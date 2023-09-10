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

import React, {useState,} from "react";
import {SketchPicker} from "react-color";
import {ColorPickerCover, ColorPickerPopover, ColorPickerToggle} from "../tag-tree-input.styled";


function ColorPicker({color = '#000', setColor}) {
    const [displayColorPicker, setDisplayColorPicker] = useState(false)
    const handleClick = () => {
        setDisplayColorPicker(!displayColorPicker)
    };

    const handleClose = () => {
        setDisplayColorPicker(false);
    };

    const handleChange = (color) => {
        setColor(color)
    }
    return <div>
        <ColorPickerToggle color={color} onClick={handleClick}/>
        {displayColorPicker ? <ColorPickerPopover>
            <ColorPickerCover onClick={handleClose}/>
            <SketchPicker color={color} onChange={handleChange}/>
        </ColorPickerPopover> : null}
    </div>
}

export default ColorPicker