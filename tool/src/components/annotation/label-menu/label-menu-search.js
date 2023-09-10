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
import {MenuSearch} from "../data-view.styled";


function LabelMenuSearch({searchChange, hasExtraData}) {
    const keyStopPropagation = (e) => {
        e.stopPropagation();
    }
    return <MenuSearch extra={hasExtraData}>
        <input type={"search"} placeholder={'search'} onChange={searchChange} onClick={keyStopPropagation}
               onKeyDown={keyStopPropagation}
               onKeyPress={keyStopPropagation}/>
    </MenuSearch>
}

export default LabelMenuSearch