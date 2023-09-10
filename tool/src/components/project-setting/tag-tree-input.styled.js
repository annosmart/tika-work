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

import styled from 'styled-components';

export const LabelsControl = styled.div`
  display: flex;
 
  .react-tagsinput {
    display: block;
    border: solid 2px;
    min-width: 300px;
    max-width: 426px;
    max-height: 4rem;
    overflow: auto;
    padding-top: 2px;

    input {
      margin-bottom: 2px;
    }

    .react-tagsinput-tag {
      margin-bottom: 2px;
      padding: 2px 6px;
    }
  }

  label {
    font-size: 1.3rem;
    margin: 0.2rem 0.4rem;
  }

  input[type="file"] {
    display: none;
  }
`

export const FormInputAdd = styled.input`
  border: solid 2px;
  margin-right: 1rem;
  padding: 0.2rem;
`


export const AddTypeButton = styled.button`
  border: solid 2px;
  cursor: pointer;
`


export const ColorPickerToggle = styled.div`
  display: inline-block;
  cursor: pointer;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.5rem;
  background-color: ${props => props.color || '#000'};
`

export const ColorPickerPopover = styled.div`
  position: absolute;
  z-index: 2;
`
export const ColorPickerCover = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`
