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

import React, {useCallback, useEffect, useRef, useState,} from "react";
import {AnnotationToolContainer, ImageLogo, LeftPanel, MenuRow, ModalButton} from "./annotation-tool.styled";
import FileMenu from "./menus-panel/file-menu";
import ModuleMenu from "./menus-panel/module-menu";
import DataMenu from "./menus-panel/data-menu";
import DataView from "./data-view";
import loadable from "@loadable/component";
import {useContextMenu} from "react-contexify";
import LabelMenu from "./label-menu/label-menu";
import TypeMenu from "./menus-panel/type-menu";
import ReactModal from 'react-modal';
import * as js2xmlparser from "js2xmlparser";
import {ModeTypes} from "../enums";
import JSZip from "jszip";
import {saveAs} from 'file-saver';

// initial reference to dynamic main module
let ModuleComponent = loadable(() => {
    return import(`./empty-module`)
})
const MENU_ID = "menu-id";

// main component for annotation with menus and data view
function AnnotationTool({selection, installedModules, logo, goHome}) {
    const [file, setFile] = useState()
    const [fileName, setFileName] = useState(null);
    const [options, setOptions] = useState({_zoom: 1})
    const [formats, setFormats] = useState([]);
    const [toolName, setToolName] = useState(null);
    const [toolData, setToolData] = useState(null);
    const [reset, setReset] = useState(null);
    const defaultMouseEvent = useCallback((e, f) => {
    }, [])
    const [mouseEvent, setMouseEvent] = useState(() => defaultMouseEvent);
    const [validateAnnotation, setValidateAnnotation] = useState({valid: true, error: ""});
    const [labelSelected, setLabelSelected] = useState([]);
    const [usedLabels, setUsedLabels] = useState();
    const {dataType, taskType, modeType, level, labels, labelAssignment, labelExclusivity} = selection
    const [selectedType, setSelectedType] = useState()
    const [modalOpened, setModalOpened] = useState(false)
    const [modalMessage, setModalMessage] = useState(false)
    const leftPanelRef = useRef()
    const [dimensions, setDimensions] = useState()

    // import module component setting in config file for the selection
    useEffect(() => {
        ModuleComponent = loadable(() => {
            return import(`../modules/${installedModules[dataType][taskType]}`)
        })
    }, [selection])

    // open modal with message if running error happen on module
    useEffect(() => {
        if (validateAnnotation.runningError) {
            openModal(validateAnnotation.runningError)
            setValidateAnnotation({...validateAnnotation, runningError: null})
        }
    }, [validateAnnotation])

    const getDimensions = () => {
        return {
            leftPanel: {width: leftPanelRef.current?.clientWidth ?? 0, height: leftPanelRef.current?.clientHeight ?? 0},
            screen: {width: window.innerWidth, height: window.innerHeight}
        };
    }

    const resizeListener = useCallback(() => {
        setDimensions(getDimensions())
    }, []);

    useEffect(() => {
        setDimensions(getDimensions());
        window.addEventListener('resize', resizeListener);
        return () => {
            window.removeEventListener('resize', resizeListener);
        }
    }, [])

    // helper function for display context menu
    const {show} = useContextMenu({
        id: MENU_ID
    });

    function displayMenu(e) {
        show(e);
    }

    // export function to import/export MetaData from File Menu
    const metaData = (operation, data, options = null) => {
        switch (operation) {
            case 'import':
                return importMeta(data, options)
            case 'export':
                return exportMeta(data, options)
            case 'load':
                return loadValidation(data, options)
        }
    }

    // load meta data from JSON and send to the Module Component with options
    const importMeta = (data, options = {overwrite: false}) => {
        try {
            let meta = JSON.parse(data)
            if (!meta.annotation) {
                openModal('File format is not correct')
            }
            setValidateAnnotation({...validateAnnotation, metaData: meta.annotation, metaOptions: options})
            return true
        } catch (e) {
            JSZip.loadAsync(data).then(zip => {
                let annotationName = Object.keys(zip.files).find(fn => fn.toLowerCase().endsWith(".json"))
                if (annotationName) {
                    zip.file(annotationName).async("string").then(text => {
                        importMeta(text, options)
                    })
                } else {
                    openModal(`File format is not correct: missing ${annotationName}`)
                }
            }).catch(e => {
                openModal('File format is not correct')
            })
        }
    }

    // download meta data to a file with specific format after check if it is valid
    const exportMeta = (format, options = {validation: false}) => {
        if (options && !options.file) {
            openModal('It\'s necessary to load a data file first');
            return
        }
        if (validateAnnotation.valid) {
            if (!options?.validation) {
                let fileData = parseMeta(format?.parser, validateAnnotation[format?.value]);
                let blob = new Blob([fileData], {type: `text/${format?.parser};charset=utf-8`});
                let baseFileName = fileName?.name.replace(/\.[^/.]+$/, "");
                let fullName = `${baseFileName}.${format?.parser}`
                if (validateAnnotation.files && validateAnnotation.files.length > 0) {
                    let zip = new JSZip();
                    zip.file(fullName, blob)
                    validateAnnotation.files.map(f => {
                        zip.file(f.name, f.data);
                    })
                    zip.generateAsync({type: "blob"})
                        .then(function (content) {
                            saveAs(content, `${baseFileName}.zip`);
                        });
                } else {
                    saveAs(blob, fullName)
                }
            }
            return true
        } else {
            openModal(validateAnnotation.error);
        }
    }
    const loadValidation = (data, options) => {
        let validation = data.file?.type.toLowerCase().includes(dataType.toLowerCase());
        if (!validation) {
            openModal('Opening wrong file format')
        }
        return validation
    }
    const parseMeta = (parser, data) => {
        switch (parser) {
            case 'json':
                return JSON.stringify({"annotation": data});
            case 'xml':
                return js2xmlparser.parse("annotation", data);
            default:
                return '';
        }
    }

    const openModal = (msg) => {
        setModalMessage(msg)
        setModalOpened(true)
    }

    const isMultiType = () => {
        return modeType === ModeTypes.MultiType
    }

    const changeSelectedType = (typeName) => {
        setSelectedType(selection.labels.find(l => l.name === typeName))
    }

    return <React.Fragment>
        <AnnotationToolContainer height={dimensions?.screen.height}>
            <LeftPanel ref={leftPanelRef}>
                <MenuRow className={'center'}>
                    <ImageLogo src={logo} alt={'tika logo'} onClick={goHome}/>
                </MenuRow>
                {/* Menu for open data file, import/export meta and reset*/}
                <FileMenu file={file} setFile={setFile} fileName={fileName} setFileName={setFileName}
                          dataType={dataType} taskType={taskType} metaData={metaData} setReset={setReset}
                          formats={formats}/>
                {/* Menu for multi-type setting */}
                <TypeMenu isMultiType={isMultiType()} selection={selection} selectedType={selectedType}
                          setSelectedType={setSelectedType}/>
                {/* wrapper to load main module component dynamically*/}
                <ModuleMenu>
                    <ModuleComponent currentTool={toolName} setCurrentTool={setToolName} mouseEvent={mouseEvent}
                                     toolData={toolData} setToolData={setToolData} displayMenu={displayMenu}
                                     labelSelected={labelSelected} setFormats={setFormats}
                                     labelAssignment={labelAssignment} labelExclusivity={labelExclusivity}
                                     reset={reset} setReset={setReset} setUsedLabels={setUsedLabels}
                                     selectedType={selectedType} changeSelectedType={changeSelectedType}
                                     validateAnnotation={validateAnnotation}
                                     setValidateAnnotation={setValidateAnnotation} labels={labels} options={options}
                                     setOptions={setOptions} file={file} fileName={fileName} dataType={dataType}
                    />
                </ModuleMenu>
                {/* specific menu for data type options */}
                <DataMenu file={file} dataType={dataType} options={options} setOptions={setOptions}
                          mouseEvent={mouseEvent}/>
            </LeftPanel>
            {/* view wrapper for data types views */}
            <DataView dataType={dataType} file={file} options={options} setOptions={setOptions} toolName={toolName}
                      mouseEvent={mouseEvent} dimensions={dimensions}
                      setMouseEvent={setMouseEvent} toolData={toolData}
                      reset={reset}/>
            {/* label context menu */}
            <LabelMenu selection={selectedType} menuId={MENU_ID} labelSelected={setLabelSelected}
                       usedLabels={usedLabels} labelExclusivity={labelExclusivity} toolData={toolData}/>
        </AnnotationToolContainer>
        <ReactModal isOpen={modalOpened} ariaHideApp={false}
                    style={{
                        overlay: {
                            display: "flex",
                            alignItems: "start",
                            justifyContent: "center",
                            zIndex: "10",
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

export default AnnotationTool
