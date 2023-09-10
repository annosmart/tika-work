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
import {FaTimes} from "react-icons/fa";
import LoadLabels from "./load-labels";
import {FormRow} from "../task-type-select.styled";
import {AddTypeButton, FormInputAdd} from "../tag-tree-input.styled";
import ColorPicker from "./color-picker";
import MultiLevelTree from "./multi-level-tree";
import {LevelTypes} from "../../enums";

function MultiTypeFlat({modes = [], setModes, getNewMode, level = LevelTypes.SingleLevel, getNewLevel}) {
    const [newModeText, setNewModeText] = useState('');
    const setLabelsTo = (mode, labels) => {
        setModes(modes.map(m => {
            if (m.name === mode.name) {
                return {...mode, labels: labels}
            }
            return m;
        }));
    }
    const setLevelsTo = (mode, levels) => {
        setModes(modes.map(m => {
            if (m.name === mode.name) {
                return {...mode, levels: levels}
            }
            return m;
        }));
    }
    const setColorTo = (mode, boxColor = null, textColor = null) => {
        setModes(modes.map(m => {
            if (m.name === mode.name) {
                return {...mode, boxColor: boxColor?.hex ?? mode.boxColor, textColor: textColor?.hex ?? mode.textColor}
            }
            return m;
        }));
    }
    const addModeType = () => {
        if (newModeText && !modes.some(m => m.name === newModeText)) {
            setModes([...modes, getNewMode(newModeText)])
            setNewModeText('')
        }
    }
    const removeType = (mode) => {
        setModes(modes.filter(m => m.name !== mode.name))
    }

    function newModeTextChanged(e) {
        setNewModeText(e.target.value)
    }

    return <React.Fragment>
        <FormRow>
            <label>New Type Name</label>
            <FormInputAdd type="text" value={newModeText} onKeyPress={(e) => {
                if (e.key === "Enter") addModeType()
            }} onChange={newModeTextChanged}/>
            <AddTypeButton onClick={addModeType}>Add Type</AddTypeButton>
        </FormRow>
        {modes.map(m =>
            <React.Fragment key={m.name}>
                <FormRow className={level !== LevelTypes.SingleLevel ? "center" : null}>
                    <label><FaTimes onClick={() => removeType(m)}/> {m.name} </label>
                    {level === LevelTypes.SingleLevel &&
                    <LoadLabels labels={m.labels} setLabels={(labels) => setLabelsTo(m, labels)}/>}
                </FormRow>
                <FormRow>
                    <label>Bounding-box color</label>
                    <ColorPicker color={m.boxColor} setColor={(color) => setColorTo(m, color)}/>
                    <label>Label text color</label>
                    <ColorPicker color={m.textColor} setColor={(color) => setColorTo(m, null, color)}/>
                </FormRow>
                {level !== LevelTypes.SingleLevel &&
                <MultiLevelTree levels={m.levels} setLevels={(levels) => setLevelsTo(m, levels)}
                                getNewLevel={getNewLevel} levelCount={1}
                                maxLevel={level === LevelTypes.TwoLevel ? 1 : 100}/>}
            </React.Fragment>
        )}
    </React.Fragment>
}

export default MultiTypeFlat