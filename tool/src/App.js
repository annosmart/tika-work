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

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {useEffect, useState} from "react";
import MainContainer from "./components/main-container";

const importAll = (r) => r.keys().map(r);

function App() {
    const [dataTypeList, setDataTypeList] = useState([])
    const [installedModules, setInstalledModules] = useState({})

    useEffect(() => {
        let localDataTypeList = [];
        const localInstalledModules = {};
        importAll(require.context('./components/modules/', true, /config.js$/)).map(
            im => Object.assign({}, im).default).sort((a, b) => {
            return (b.priority ?? 0) - (a.priority ?? 0)
        }).map(mod => {
            localInstalledModules[mod.dataType] = {
                ...(localInstalledModules[mod.dataType] ?? {}),
                [mod.value]: mod.index.file
            }
            localDataTypeList = localDataTypeList.some(dt => dt.value === mod.dataType) ? localDataTypeList.map(dt => dt.value === mod.dataType ? {
                ...dt,
                taskTypes: [...dt.taskTypes, {...mod}]
            } : dt) : [...localDataTypeList, {value: mod.dataType, label: mod.dataType, taskTypes: [{...mod}]}]
            setDataTypeList(localDataTypeList);
            setInstalledModules(localInstalledModules);
        })
    }, [])
    return (
        <div className="App">
            <MainContainer dataTypeList={dataTypeList} installedModules={installedModules}/>
        </div>
    );
}

export default App;
