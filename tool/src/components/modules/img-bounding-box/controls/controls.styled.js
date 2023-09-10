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

import styled from "styled-components";

export const ModuleToolButton = styled.button`
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
`