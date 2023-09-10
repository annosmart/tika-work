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

import React, {useEffect,} from "react";
import {MenuRow, TwSelect} from "../annotation-tool.styled";

function TypeMenu({isMultiType, selection, selectedType, setSelectedType}) {

    useEffect(() => {
        setSelectedType(isMultiType ? selection.labels[0] : selection)
    }, [selection])

    const typeChanged = (e) => {
        const typeName = e.target.value;
        setSelectedType(selection.labels.find(t => t.name === typeName));
    }

    return <React.Fragment>
        {isMultiType && <MenuRow className={'center'}>
            BBox Type <TwSelect onChange={typeChanged} value={selectedType?.name}>
            {selection.labels.map((mode, index) =>
                <option value={mode.name} key={index}>{mode.name}</option>)}
        </TwSelect>
        </MenuRow>}
    </React.Fragment>
}

export default TypeMenu