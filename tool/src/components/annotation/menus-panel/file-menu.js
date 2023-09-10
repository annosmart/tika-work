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

import React, {useEffect, useRef, useState,} from "react";
import {
    FileMenuHeader,
    MenuButton,
    MenuRow,
    ModalButton,
    ModalFooter,
    ModalHeader,
    OpenFile,
    TwSelect
} from "../annotation-tool.styled";
import ReactModal from 'react-modal';
import Toggle from "react-toggle";
import {FaRegFileAlt} from "react-icons/fa";

function FileMenu({file, setFile, fileName, setFileName, dataType, taskType, metaData, setReset, formats}) {
    const inputFile = useRef(null)
    const inputMeta = useRef(null)
    const [format, setFormat] = useState('');
    const [metaInputData, setMetaInputData] = useState(null);
    const [overwrite, setOverwrite] = useState(false);
    const [importModalOpened, setImportModalOpened] = useState(false);
    const [exportModalOpened, setExportModalOpened] = useState(false);

    useEffect(() => {
        setFormat(formats?.length > 0 ? formats[0].value : '')
    }, [formats])

    const getBase = (data) => {
        switch (data) {
            case "text":
                return 'TEXT'
            case "audio":
            case "video":
                return 'RAW'
            default:
                return 'URL'
        }
    }
    const onChangeFileInput = e => {
        let file = e.target.files[0];
        if (file && metaData('load', {"file": file})) {
            setFileName(file);
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setFile(reader.result);
                handleReset();
            });
            if (getBase(dataType) === 'TEXT') {
                reader.readAsText(file);
            } else if (getBase(dataType) === 'RAW') {
                setFile(file);
                handleReset();
            } else {
                reader.readAsDataURL(file);
            }
        }
    };
    const getInputBase = (fileType) => {
        fileType = fileType.toLowerCase()
        if (fileType.includes('text') || fileType.includes('xml') || fileType.includes('json')) {
            return 'TEXT';
        }
        return 'RAW';
    }
    const onChangeMetaInput = e => {
        let file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setMetaInputData(reader.result)
            });
            if (getInputBase(file.type) === 'TEXT') {
                reader.readAsText(file);
            } else if (getInputBase(file.type) === 'RAW') {
                setMetaInputData(file);
                handleReset();
            }
        }
    };
    const openInput = (inputRef) => {
        inputRef.current.click();
    }

    const callExportMeta = (e) => {
        e.preventDefault()
        metaData('export', formats.find(f => f.value === format))
        closeExportMeta()
    };
    const callImportMeta = () => {
        if (metaInputData) {
            metaData('import', metaInputData, {overwrite: overwrite})
            closeImportMeta()
        }
    };
    const formatChanged = (e) => {
        setFormat(e.target.value)
    }
    const handleReset = () => {
        setReset(true)
    }
    const handleOverrideChange = (e) => {
        e.preventDefault();
        setOverwrite(!overwrite);
    }
    const closeImportMeta = () => {
        setImportModalOpened(false)
        setOverwrite(false)
        setMetaInputData(null)
    }
    const closeExportMeta = () => {
        setExportModalOpened(false)
        setFormat(formats?.length > 0 ? formats[0].value : '')
    }
    const openImportMeta = () => {
        setImportModalOpened(true)
    }
    const openExportMeta = () => {
        if (metaData('export', formats.find(f => f.value === format), {validation: true, file: fileName}))
            setExportModalOpened(true)
    }
    const modalsStyle = {
        overlay: {display: "flex", alignItems: "start", justifyContent: "center", zIndex: 10,},
        content: {
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
        }
    }
    return <React.Fragment>
        <MenuRow className={'center column'}>
            <FileMenuHeader>
                <tbody>
                {fileName && <tr>
                    <th>Filename<span className={"spaced-dots"}>:</span></th>
                    <td style={{overflowWrap: "anywhere"}}>{fileName.name}</td>
                </tr>}
                <tr>
                    <th>Data type<span className={"spaced-dots"}>:</span></th>
                    <td>{dataType}</td>
                </tr>
                <tr>
                    <th>Annotation type<span className={"spaced-dots"}>:</span></th>
                    <td>{taskType}</td>
                </tr>
                </tbody>
            </FileMenuHeader>
        </MenuRow>
        <MenuRow className={'center'}>
            <MenuButton className={"big"} onClick={() => openInput(inputFile)}>Load Data</MenuButton>
            <MenuButton className={"big"} onClick={openImportMeta}>Import Meta</MenuButton>
            <MenuButton className={"big"} onClick={openExportMeta}>Export Meta</MenuButton>
        </MenuRow>
        <MenuRow className={'center'}>
            <MenuButton className={"big"} onClick={handleReset}>Reset</MenuButton>
        </MenuRow>
        <input type='file' id='file' ref={inputFile} style={{display: 'none'}} onChange={onChangeFileInput}/>
        <ReactModal isOpen={importModalOpened} ariaHideApp={false}
                    style={modalsStyle}>
            <ModalHeader>Import Meta</ModalHeader>
            <MenuRow>
                <label className={"toggle-label center"}>
                    <Toggle
                        className='black-toggle'
                        checked={overwrite}
                        aria-labelledby='Overwrite Existing Annotations'
                        onChange={handleOverrideChange}
                    />
                    <span className={"right"}>Overwrite Existing Annotations</span>
                </label>
            </MenuRow>
            <MenuRow>
                <OpenFile>
                    {metaInputData && <span>{inputMeta.current.files[0].name}</span>}
                    {!metaInputData && <span>Open Meta File</span>} <FaRegFileAlt/>
                    <input type='file' id='meta' ref={inputMeta} style={{display: 'none'}}
                           onChange={onChangeMetaInput}/>
                </OpenFile>
            </MenuRow>
            <ModalFooter>
                <ModalButton onClick={callImportMeta}>Import</ModalButton>
                <ModalButton onClick={closeImportMeta}>Cancel</ModalButton>
            </ModalFooter>
        </ReactModal>
        <ReactModal isOpen={exportModalOpened} ariaHideApp={false}
                    style={modalsStyle}>
            <ModalHeader>Export Meta</ModalHeader>
            <MenuRow>
                <p className={'modal-body'}>Which format do you want to export</p>
            </MenuRow>
            <MenuRow>
                Meta-Format
                <TwSelect onChange={formatChanged} value={format}>
                    {formats.map((f, index) => <option value={f.value} key={index}>{f.label}</option>)}
                </TwSelect>
            </MenuRow>
            <ModalFooter>
                <ModalButton onClick={callExportMeta}>Export</ModalButton>
                <ModalButton onClick={closeExportMeta}>Cancel</ModalButton>
            </ModalFooter>
        </ReactModal>
    </React.Fragment>
}

export default FileMenu
