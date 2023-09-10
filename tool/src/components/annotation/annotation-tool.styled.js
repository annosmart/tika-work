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

export const AnnotationToolContainer = styled.div.attrs(props => ({
    style: {
        height: `${props.height}px`,
    }
}))`
  display: block;
  position: relative;
  width: 100%;
  min-width: 790px;
  overflow: hidden;
`
export const LeftPanel = styled.div`
  display: block;
  width: 35%;
  min-width: 330px;
`

export const MenuRow = styled.div`
  display: flex;
  margin: 1rem;

  &.center {
    align-items: center;
    justify-content: center;
  }

  &.column {
    flex-direction: column;
  }

  &.toolbar {
    align-items: center;
    justify-content: space-evenly;
  }

  &.toolbar.middle {
    justify-content: center;

    label {
      margin: auto 1rem;
    }
  }

  &.toolbar.small {
    .icon {
      font-size: 1rem;
    }
  }

  .toggle-label {
    display: flex;
    padding-left: 2rem;

    &.center {
      padding-left: 0;

      .react-toggle {
        margin-left: 0;
      }
    }

    span.left {
      min-width: 100px;
      text-align: right;
    }

    .react-toggle {
      margin: 0 1rem;
    }
  }

  p.modal-body {
    text-align: left;
    margin: 0;
  }
`
export const MenuButton = styled.button`
  border: solid 2px;
  box-shadow: #000 2px 2px;
  margin: 0.2rem 0.2rem;
  padding: 0.3rem 0.6rem;
  cursor: pointer;

  &.icon {
    padding: 0.4rem 0.6rem;
    font-size: 1.4rem;
  }

  &.active {
    background-color: #FFFFFF;
    box-shadow: none;
  }
  &.big {
    font-size: 1.1rem;
  }
`

export const TwSelect = styled.select`
  border: solid 2px;
  margin: 0 1rem;
  padding: 0.3rem;
`

export const ModalButton = styled.button`
  border: solid 2px;
  box-shadow: #000 2px 2px;
  margin: 0.2rem 0.2rem;
  padding: 0.3rem 0.6rem;
`

export const ImageLogo = styled.img`
  width: 200px;
  margin: 0 1rem;
  cursor: pointer;
`

export const ModalHeader = styled.h3`
  width: 100%;
  padding-bottom: 1rem;
  border-bottom: solid 1px #000;
`


export const ModalFooter = styled(MenuRow)`
  width: 100%;
  padding-top: 1rem;
  border-top: solid 1px #000;
  margin: 0;
  align-items: end;
  justify-content: end;
`


export const OpenFile = styled.label`
  border: 1px solid #ccc;
  display: inline-block;
  padding: 6px 12px;
  cursor: pointer;
`


export const FileMenuHeader = styled.table`
  th {
    text-align: right;
    font-weight: normal;
  }

  td {
    font-weight: bold;
  }

  .spaced-dots {
    margin: auto 1rem;
  }
`

