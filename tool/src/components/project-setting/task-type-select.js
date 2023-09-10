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
import {Container, FormRow, FormRowCenter, ImageLogo, TwButton, TwFileLabel} from './task-type-select.styled'
import Toggle from 'react-toggle'
import "react-toggle/style.css"
import TagTreeInput from "./tag-tree-input";
import ReactModal from "react-modal";
import {ModalButton} from "../annotation/annotation-tool.styled";
import {saveAs} from 'file-saver';

function TaskTypeSelect({dataTypeList, onProceed, logo}) {
    const [dataType, setDataType] = useState();
    const [taskTypeList, setTaskTypeList] = useState([]);
    const [taskType, setTaskType] = useState();
    const [modeTypeList, setModeTypeList] = useState([]);
    const [modeType, setModeType] = useState();
    const [levelList, setLevelList] = useState([]);
    const [level, setLevel] = useState();
    const [labelMultipleAssignment, setLabelMultipleAssignment] = useState(false);
    const [labelExclusivity, setLabelExclusivity] = useState(false);
    const [tagTree, setTagTree] = useState();
    const [loadLabels, setLoadLabels] = useState();
    const [modalOpened, setModalOpened] = useState(false)
    const [modalMessage, setModalMessage] = useState(false)

    useEffect(() => {
        setDataType(dataTypeList.length > 0 ? dataTypeList[0] : null);
    }, [dataTypeList])

    useEffect(() => {
        initTaskOptions(dataType);
    }, [dataType])

    const initTaskOptions = (dataTypeObj) => {
        const list = dataTypeObj ? dataTypeObj.taskTypes : [];
        setTaskTypeList(list)
        setTaskType(list.length > 0 ? list[0] : null);
        return list
    }

    useEffect(() => {
        initModeOptions(taskType);
    }, [taskType])

    const initModeOptions = (taskTypeObj) => {
        let list = taskTypeObj ? taskTypeObj.modeTypes : []
        setModeTypeList(list)
        setModeType(list && list.length > 0 ? list[0] : null);
        return list
    }

    useEffect(() => {
        initLevelOptions(taskType, modeType);
    }, [taskType, modeType])

    const initLevelOptions = (taskTypeObj, modeTypeObj) => {
        let list
        if (taskTypeObj && taskTypeObj.levelTypes) {
            list = taskTypeObj ? taskTypeObj.levelTypes : [];
        } else {
            list = modeTypeObj ? modeTypeObj.levelTypes : [];
        }
        setLevelList(list)
        setLevel(list && list.length > 0 ? list[0] : null);
        return list
    }

    function dataTypeChanged(e) {
        setDataType(dataTypeList.find(dt => dt.value === e.target.value))
    }

    function taskTypeChanged(e) {
        setTaskType(taskTypeList.find(tt => tt.value === e.target.value))
    }

    function modeTypeChanged(e) {
        setModeType(modeTypeList.find(mt => mt.value === e.target.value))
    }

    function levelChanged(e) {
        setLevel(levelList.find(l => l.value === e.target.value))
    }

    const handleMultipleAssignment = (e) => {
        e.preventDefault();
        setLabelMultipleAssignment(!labelMultipleAssignment)
    }
    const handleLabelExclusivity = (e) => {
        e.preventDefault();
        setLabelExclusivity(!labelExclusivity)
    }
    const getConfig = () => {
        return {
            dataType: dataType?.value,
            taskType: taskType?.value,
            modeType: modeType?.value,
            level: level?.value,
            labels: tagTree,
            labelAssignment: labelMultipleAssignment,
            labelExclusivity: labelExclusivity
        }
    }
    const getJSONConfig = () => {
        const config = getConfig()
        return {
            ...config,
            labelAssignment: config.labelAssignment ? "multiple" : 'single',
            labelExclusivity: config.labelExclusivity ? 'exclusive' : 'non-exclusive'
        }
    }
    const saveConfig = () => {
        let now = new Date();
        const blob = new Blob([JSON.stringify(getJSONConfig())], {type: 'text/json'})
        let fileName = `${[now.getDate(), now.getMonth(), now.getFullYear(), now.getHours(), now.getMinutes()].map(n => n.toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false
        })).join('')}_${dataType?.label}_${taskType?.label}.json`;
        saveAs(blob, fileName);
    }
    const loadConfig = (config) => {
        let dataTypeObj = dataTypeList.find(dt => dt.value === config.dataType);
        setDataType(dataTypeObj)

        let taskTypeListObj = initTaskOptions(dataTypeObj);
        let taskTypeObj = taskTypeListObj.find(tt => tt.value === config.taskType);
        setTaskType(taskTypeObj)

        let modeTypeListObj = initModeOptions(taskTypeObj);
        let modeTypeObj = modeTypeListObj?.find(mt => mt.value === config.modeType);
        setModeType(modeTypeObj)

        let levelTypeListObj = initLevelOptions(taskTypeObj, modeTypeObj)
        let levelTypeObj = levelTypeListObj.find(lt => lt.value === config.level)
        setLevel(levelTypeObj)

        setLoadLabels(config.labels)
        setLabelMultipleAssignment(config.labelAssignment === 'multiple')
        setLabelExclusivity(config.labelExclusivity === 'exclusive')
    }
    const handlerProceed = (e) => {
        e.preventDefault();
        if (checkLabels(tagTree) || !(modeType || level)) {
            onProceed({...getConfig(), ready: true,})
        } else {
            openModal("you must add at least one label on every label field")
        }
    }
    const checkLabels = (block) => {
        if (!block || block.length === 0)
            return false
        return !block.some(b => b.labels?.length === 0 && (b.levels?.length === 0 || (b.levels?.length > 0 && !checkLabels(b.levels))))
    }
    const showFile = (e) => {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = (e) => {
            loadConfig(JSON.parse(e.target.result));
        };
        reader.readAsText(e.target.files[0]);
    };

    const openModal = (msg) => {
        setModalMessage(msg)
        setModalOpened(true)
    }
    return <React.Fragment>
        <Container>
            <FormRow className={'center'}>
                <ImageLogo src={logo} alt={'tika logo'}/>
            </FormRow>

            {/* Data Type selection */}
            <FormRow>
                <label>Data Type </label>
                <select name="data-type" value={dataType?.value} onChange={dataTypeChanged}>
                    {dataTypeList.map(dt =>
                        <option value={dt.value} key={dt.value}>{dt.label}</option>
                    )}
                </select>
            </FormRow>

            {/* Task Type selection */}
            <FormRow>
                <label>Task Type </label>
                <select name="task-type" value={taskType?.value} onChange={taskTypeChanged}>
                    {taskTypeList.map(tt =>
                        <option value={tt.value} key={tt.value}>{tt.label}</option>
                    )}
                </select>

                {/* Mode selection */}
                {modeTypeList && <select name="mode-type" value={modeType?.value} onChange={modeTypeChanged}>
                    {modeTypeList.map(mt =>
                        <option value={mt.value} key={mt.value}>{mt.label}</option>
                    )}
                </select>}
            </FormRow>

            {/* Level selection */}
            {levelList && levelList.length > 1 &&
            <FormRow>
                <label>Label Type </label>
                <select name="level-type" value={level?.value} onChange={levelChanged}>
                    {levelList.map(l =>
                        <option value={l.value} key={l.value}>{l.label}</option>
                    )}
                </select>
            </FormRow>}

            {/* Labels Tree Main Component */}
            <TagTreeInput taskType={taskType?.value} modeType={modeType?.value} level={level?.value}
                          options={level?.options} onChange={setTagTree} loadLabels={loadLabels}/>

            {/* Label Assigment toggle */}
            {taskType?.showLabelAssigment !== false && <FormRow>
                <label>Label Assignment</label>
                <label className={"toggle-label"}>
                    <span className={"left"}>Single</span>
                    <Toggle
                        className='black-toggle small'
                        icons={false}
                        checked={labelMultipleAssignment}
                        aria-labelledby='Label Assignment'
                        onChange={handleMultipleAssignment}/>
                    <span className={"right"}>Multiple</span>
                </label>
            </FormRow>}

            {/* Label Exclusivity toggle */}
            {taskType?.showLabelExclusivity !== false && <FormRow>
                <label>Label Exclusivity</label>
                <label className={"toggle-label"}>
                    <span className={"left"}>Non-Exclusive</span>
                    <Toggle
                        className='black-toggle small'
                        icons={false}
                        checked={labelExclusivity}
                        aria-labelledby='Label Exclusivity'
                        onChange={handleLabelExclusivity}/>
                    <span className={"right"}>Exclusive</span>
                </label>
            </FormRow>}

            {/* Load/Save config section */}
            <FormRowCenter className={'top'}>
                <TwFileLabel className={'small'}>Load Config<input type="file" onChange={showFile}/></TwFileLabel>
                <TwButton className={'small'} onClick={saveConfig}>Save Config</TwButton>
            </FormRowCenter>

            {/* Proceed Button */}
            <FormRowCenter>
                <TwButton onClick={handlerProceed}>Proceed</TwButton>
            </FormRowCenter>
        </Container>

        <ReactModal isOpen={modalOpened} ariaHideApp={false}
                    style={{
                        overlay: {
                            display: "flex",
                            alignItems: "start",
                            justifyContent: "center",
                        },
                        content: {
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }
                    }}>
            <p>{modalMessage}</p>
            <ModalButton onClick={() => setModalOpened(false)}>OK</ModalButton>
        </ReactModal>
    </React.Fragment>
}

export default TaskTypeSelect;
