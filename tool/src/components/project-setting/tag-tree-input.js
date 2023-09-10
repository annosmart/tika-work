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

import React, {useEffect, useState,} from "react";
import {FormRow} from "./task-type-select.styled";
import LoadLabels from "./tag-tree-controls/load-labels";
import MultiTypeFlat from "./tag-tree-controls/multi-type-flat";
import MultiLevelTree from "./tag-tree-controls/multi-level-tree";
import {LevelTypes, ModeTypes} from "../enums";

function TagTreeInput({taskType, modeType, level, options, onChange, loadLabels}) {
    const [modes, setModes] = useState([]);
    const [levels, setLevels] = useState([]);
    const [labels, setLabels] = useState([]);

    useEffect(() => {
        setModes([])
        setLevels([])
        setLabels(level === 'fixed' ? options : [])
    }, [taskType, modeType, level])

    useEffect(() => {
        switch (uniqueKey()) {
            case 'keySingleLevel':
                onChange(labels);
                break;
            case 'keyMultiLevel':
                onChange(levels);
                break;
            case 'keyMultiType':
                onChange(modes);
                break;
        }
    }, [modes, levels, labels])

    useEffect(() => {
        switch (uniqueKey()) {
            case 'keySingleLevel':
                setLabels(loadLabels);
                break;
            case 'keyMultiLevel':
                setLevels(loadLabels)
                break;
            case 'keyMultiType':
                setModes(loadLabels)
                break;
        }
    }, [loadLabels])

    const getNewType = (name) => {
        return {name: name, labels: [], levels: [], boxColor: '#000', textColor: '#000'}
    }
    const getNewLevel = (name) => {
        return {name: name, labels: [], levels: []}
    }
    const uniqueKey = () => {
        if (modeType === ModeTypes.MultiType) {
            return 'keyMultiType';
        } else {
            if (level === LevelTypes.SingleLevel || level === LevelTypes.Fixed) {
                return 'keySingleLevel'
            } else if (!!level) {
                return 'keyMultiLevel'
            }
        }
    }

    const selectControl = () => {
        switch (uniqueKey()) {
            case 'keySingleLevel':
                return (
                    <FormRow>
                        <label>Labels </label>
                        <LoadLabels labels={labels} setLabels={setLabels} level={level}/>
                    </FormRow>)
            case 'keyMultiLevel':
                return <MultiLevelTree levels={levels} setLevels={setLevels} getNewLevel={getNewLevel} levelCount={1}
                                       maxLevel={level === LevelTypes.TwoLevel ? 1 : 100}/>
            case 'keyMultiType':
                return <MultiTypeFlat modes={modes} setModes={setModes} getNewMode={getNewType} level={level}
                                      getNewLevel={getNewLevel}/>
            default:
                return null
        }
    }
    return selectControl()
}

export default TagTreeInput;