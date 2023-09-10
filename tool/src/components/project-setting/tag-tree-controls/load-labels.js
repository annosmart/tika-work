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
import TagsInput from 'react-tagsinput'
import 'react-tagsinput/react-tagsinput.css'
import { FaFolderOpen } from "react-icons/fa";
import { LabelsControl } from "../tag-tree-input.styled"
import ReactModal from "react-modal";
import {ModalButton} from "../../annotation/annotation-tool.styled";
function LoadLabels({ labels = [], setLabels, level }) {
    const [modalMessage, setModalMessage] = useState(false)
    const [modalOpened, setModalOpened] = useState(false)
    const openModal = (msg) => {
        setModalMessage(msg)
        setModalOpened(true)
    }
    const handleChange = (tags) => {
        setLabels(tags)
    }
    const showFile = (e) => {
        e.preventDefault();
        if (e.target.value.includes('.txt')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setLabels([...new Set([...labels, ...e.target.result.split(/\r?\n/g)])]);
            };
            reader.readAsText(e.target.files[0]);
        }
        else {
            openModal("you must input only text file !!")
        }
    };
    const disabled = () => {
        return level === 'fixed';
    }
    return <LabelsControl>
        <TagsInput onlyUnique={true} value={labels} onChange={handleChange} disabled={disabled()} inputProps={{
            className: 'react-tagsinput-input',
            placeholder: disabled() ? '' : 'Add a label'
        }} />
        {!disabled() && <label style={{ color: "#000000" }}>
            <FaFolderOpen />
            <input type="file" onChange={showFile} />
        </label>}
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
    </LabelsControl>
}

export default LoadLabels