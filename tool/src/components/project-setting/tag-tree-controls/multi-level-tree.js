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
import 'react-tagsinput/react-tagsinput.css'
import {FaChevronDown, FaChevronRight, FaTimes} from "react-icons/fa";
import LoadLabels from "./load-labels";
import {FormRow, FormRowList} from "../task-type-select.styled";
import {AddTypeButton, FormInputAdd} from "../tag-tree-input.styled";

function MultiLevelTree({levels = [], setLevels, getNewLevel, levelCount = 1, maxLevel}) {
    const [newLevelText, setNewLevelText] = useState('');
    const setLabelsTo = (level, labels) => {
        setLevels(levels.map(l => {
            if (l.name === level.name) {
                return {...level, labels: labels}
            }
            return l;
        }));
    }
    const setLevelsTo = (level, lvs) => {
        setLevels(levels.map(l => {
            if (l.name === level.name) {
                return {...level, levels: lvs}
            }
            return l;
        }));
    }
    const toggleExpandedTo = (level) => {
        setLevels(levels.map(l => {
            if (l.name === level.name) {
                if(!l.expanded)
                    return {...level, labels: [], expanded: !l.expanded}
                else
                    return {...level, expanded: !l.expanded}
            }
            return l;
        }));
    }
    const addLevel = () => {
        if (newLevelText && !levels.some(l => l.name === newLevelText)) {
            setLevels([...levels, getNewLevel(newLevelText)])
            setNewLevelText('')
        }
    }
    const removeLevel = (level) => {
        setLevels(levels.filter(l => l.name !== level.name))
    }

    function newLevelTextChanged(e) {
        setNewLevelText(e.target.value)
    }

    const canExpand = () => {
        return levelCount < maxLevel;
    }
    return <FormRowList levelCount={levelCount}>
        {levels.map(l =>
            <React.Fragment key={l.name}>
                <FormRow>
                    <label>
                        {canExpand() ?
                            l.expanded ?
                                <span className="expand"><FaChevronDown onClick={() => toggleExpandedTo(l)}/></span> :
                                <span className="expand"><FaChevronRight onClick={() => toggleExpandedTo(l)}/></span>
                            : null}
                        <FaTimes onClick={() => removeLevel(l)}/> {l.name} </label>
                    {l.levels.length === 0 && !l.expanded &&
                    <LoadLabels labels={l.labels} setLabels={(labels) => setLabelsTo(l, labels)}/>}
                </FormRow>
                {l.expanded &&
                <MultiLevelTree levels={l.levels} setLevels={lvs => setLevelsTo(l, lvs)} getNewLevel={getNewLevel}
                                levelCount={levelCount + 1} maxLevel={maxLevel}/>
                }
            </React.Fragment>
        )}
        {!levels.some(l => l.expanded) && <FormRow>
            {maxLevel===1 && <label>New Attribute Name</label>}
            {maxLevel===100 && <label>New Level Name</label>}
            <FormInputAdd type="text" value={newLevelText} onKeyPress={(e) => {
                if (e.key === "Enter") addLevel()
            }} onChange={newLevelTextChanged}/>
            <AddTypeButton onClick={addLevel}>Add</AddTypeButton>
        </FormRow>}
    </FormRowList>
}

export default MultiLevelTree