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
import {ModuleToolButton} from "./controls.styled";

function ToolButton({name, toolName, changeTool, children, title, style = {}}) {
    const handleClick = () => {
        changeTool(name)
    };
    return <ModuleToolButton style={style} onClick={handleClick} title={title}
                             className={`icon ${toolName && name === toolName ? 'active' : ''}`}>{children}</ModuleToolButton>
}

export default ToolButton