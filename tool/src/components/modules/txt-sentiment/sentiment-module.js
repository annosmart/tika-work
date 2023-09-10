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
import {ModuleRow} from "./sentiment-module.styled";
import TagsInput from "react-tagsinput";


function SentimentModule({
                             file,
                             setFile,
                             dataType,
                             currentTool,
                             setCurrentTool,
                             mouseEvent,
                             toolData,
                             setToolData,
                             displayMenu,
                             labelSelected, setUsedLabels,
                             labelAssignment, labelExclusivity, setFormats,
                             reset, setReset, selectedType, changeSelectedType,
                             setValidateAnnotation, validateAnnotation,
                             options, setOptions,
                             fileName
                         }) {
    const [localData, setLocalData] = useState({labels: []})
    const [imageDim, setImageDim] = useState({width: 0, height: 0});

    const handleReset = () => {
        setLocalData({labels: []})
    }

    useEffect(() => {
        switch (mouseEvent.type) {
            case "contextmenu":
                displayMenu(mouseEvent.e)
                break;
        }
    }, [mouseEvent]);

    useEffect(() => {
        setUsedLabels(localData.labels)
        const valid = localData.labels?.length > 0
        let currentAnnotation = getAnnotation();
        setValidateAnnotation({
            valid: valid,
            error: valid ? null : "It's necessary to complete all the labels",
            'tjson': currentAnnotation,
            'txml': currentAnnotation,
        })
    }, [localData.labels])

    useEffect(() => {
        if (validateAnnotation.metaData) {
            let result = loadMetaData({...validateAnnotation.metaData})
            setValidateAnnotation(
                {...validateAnnotation, runningError: result.error, warnings: result.warnings, metaData: null}
            )
        }
    }, [validateAnnotation])

    useEffect(() => {
        setLabel()
    }, [labelSelected])

    useEffect(() => {
        if (reset) {
            handleReset()
            setReset(false)
        }
    }, [reset])

    useEffect(() => {
        setOptions({...options, _hideZoom: dataType === "audio"})
        setFormats([
            {'value': 'tjson', 'label': 'tika-json', 'parser': 'json'},
            {'value': 'txml', 'label': 'tika-xml', 'parser': 'xml'},
        ])
    }, []);

    useEffect(() => {
        if (file && dataType === 'image') {
            const img = new Image;
            img.onload = function () {
                setImageDim({width: img.width, height: img.height});
            };
            img.src = file;
        }
    }, [file])

    const getAnnotation = () => {
        const annotation = {
            "data_filename": fileName?.name,
            "data_type": dataType
        }
        if (dataType === 'image') {
            annotation["image_width"] = imageDim.width;
            annotation["image_height"] = imageDim.height;
        }
        annotation["data_annotation"] = {"classification_label": localData.labels?.map(l => l.tags.join('::')) ?? []}
        return annotation
    }
    const loadMetaData = (meta) => {
        let result = {error: null, warnings: []}
        if (meta.data_type !== dataType) {
            return {error: `Meta file must have the same data type. Expected: ${dataType} and got ${meta.data_type}`}
        }
        if (dataType === 'image' && (meta.image_width !== imageDim.width || meta.image_height !== imageDim.height)) {
            result['warnings'].push('Width or height of Meta file are different of current image')
        }
        if (!(meta.data_annotation && meta.data_annotation.classification_label && meta.data_annotation.classification_label.length > 0))
            return {error: `Meta file format error`}
        try {
            let l = meta.data_annotation.classification_label;
            let labels = (l.map ? l : [l]).map(cl => {
                return {'tags': cl.split('::')}
            })
            setLocalData({
                ...localData,
                labels: [...(validateAnnotation.metaOptions?.overwrite ? [] : localData.labels), ...labels]
            })
        } catch (e) {
            console.error(e);
            return {error: `Meta file format error`}
        }
        return result
    }
    const setLabel = () => {
        const {fullPath, label, format} = labelSelected
        if (!label)
            return;
        const fullLabel = {tags: [...fullPath ?? [], label]}
        const resultLabels = () => {
            if (labelAssignment) {
                return localData.labels.map(l => l.tags.join("::")).includes(fullLabel.tags.join("::")) ? localData.labels : [...localData.labels, fullLabel]
            }
            return [fullLabel]
        }
        setLocalData({...localData, labels: resultLabels()})
    }
    const handleChange = (tags, changed, changedIndexes) => {
        setLocalData({
            ...localData,
            labels: localData.labels.map((l, i) => changedIndexes.includes(i) ? null : l).filter(l => l)
        })
    }

    function disabled() {
        return false;
    }

    return <React.Fragment>
        <ModuleRow className={'toolbar flex-column'}>
            <label className={'full-width'} htmlFor={'tool-tag-input'}><b>Current Labels</b></label>
            <TagsInput onlyUnique={true} id={'tool-tag-input'}
                       value={localData.labels?.map(l => l.tags.join(':')) ?? []}
                       onChange={handleChange} disabled={disabled()} inputProps={{
                className: 'react-tagsinput-input',
                placeholder: ''
            }}/>
        </ModuleRow>
    </React.Fragment>
}

export default SentimentModule