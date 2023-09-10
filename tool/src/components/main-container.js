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

import React, {useState} from "react";
import TaskTypeSelect from "./project-setting/task-type-select";
import AnnotationTool from "./annotation/annotation-tool";
import {AppContainer} from "./main-container.styled";
import tikaImage from "../assets/images/tikawork.png"


function MainContainer({dataTypeList, installedModules}) {
    const [selection, setSelection] = useState()

    const resetSelection = () => {
        setSelection({...selection, ready: false})
    }
    return <AppContainer>
        {(!selection || !selection.ready) &&
        <TaskTypeSelect dataTypeList={dataTypeList} onProceed={setSelection} logo={tikaImage}/>}
        {selection?.ready && <AnnotationTool selection={selection} installedModules={installedModules} logo={tikaImage}
                                             goHome={resetSelection}/>}
    </AppContainer>
}

export default MainContainer