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

import styled, {css} from 'styled-components';

export const Container = styled.div`
  display: inline-block;
`

export const FormRow = styled.div`
  display: flex;
  margin: 0.4rem 0;

  &.center {
    margin-top: 1rem;
    align-items: center;
    justify-content: center;
  }

  & > label {
    min-width: 200px;
    text-align: right;
    margin-right: 1rem;
    position: relative;

    .expand {
      position: absolute;
      left: 0;
    }
  }

  .toggle-label {
    display: flex;
    padding-left: 2rem;

    span {
      min-width: 100px;
      font-size: 0.9rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      padding: 0.2rem;

      &.left {
        text-align: right;
      }

      &.right {
        text-align: left;
      }
    }

    .react-toggle {
      margin: 0.2rem 1rem 0;
    }
  }

  select {
    padding: 0.3rem;
    border: solid 2px;
    margin-right: 0.5rem;
  }
`

export const FormRowList = styled(FormRow)`
  flex-direction: column;
  padding-left: 3rem;
  background-color: rgba(0, 0, 0, ${props => props.levelCount * 0.01});
`
export const FormRowCenter = styled(FormRow)`
  justify-content: center;

  &.top {
    margin-top: 1.5rem;
  }
`

export const TwGSB = css`
  border: solid 2px;
  cursor: pointer;
  margin: 0.4rem !important;
  padding: 0.5rem 1rem !important;
  background-color: #000000;
  color: #FFFFFF;
  font-family: Arial -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  font-size: 1rem;

  :hover {
    background-color: #444444;
  }

  &.small {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem !important;
  }
`

export const TwButton = styled.button`
  ${TwGSB}
`

export const TwFileLabel = styled.label`
  display: inline-block;
  min-width: auto !important;
  text-align: center !important;

  ${TwGSB}
  input {
    opacity: 0;
    position: absolute;
    z-index: -1;
  }
`

export const ImageLogo = styled.img`
  width: 200px;
  margin: 1rem;
`