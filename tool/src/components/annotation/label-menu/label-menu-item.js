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
import {Item, Submenu} from "react-contexify";
import LabelMenuSearch from "./label-menu-search";

// helper function to get list of flat labels
const MAX_SHOW = 8
const getLocalLabels = (base, item, fullPath, query = "", usedLabels = [], labelExclusivity = false) => {
    if (!item) {
        return {count: 0, data: []}
    }
    if (item.labels?.length > 0) {
        let filteredItems = item.labels.filter(l => (typeof l === "string" ? l : l.name).toLowerCase().includes(query.toLowerCase()))
        if (labelExclusivity) {
            const containsLabel = (labels, label) => {
                return labels && label && labels.some(l => l.type === label.type && l.tags.length === label.tags.length && l.tags.every((e, i) => e === label.tags[i]))
            }
            filteredItems = filteredItems.filter(l => {
                return typeof l !== "string" || !containsLabel(usedLabels, {
                    type: base?.name,
                    tags: [...(fullPath ?? []), ...(item === base ? [] : [item.name]), l]
                })
            })
        }
        return {
            count: item.labels.length,
            data: filteredItems
        };
    } else if (item.levels?.length > 0) {
        return {
            count: item.levels.length,
            data: item.levels.filter(l => l.name.toLowerCase().includes(query.toLowerCase()))
        };
    }
    return {count: 0, data: []}
}

// component for context menu item
function LabelMenuItem({
                           base,
                           fullPath,
                           item,
                           miKey = "k",
                           labelSelected,
                           usedLabels,
                           labelExclusivity,
                           hasExtraData
                       }) {
    const [labels, setLabels] = useState(getLocalLabels(base, item, fullPath, "", usedLabels, labelExclusivity))
    const [query, setQuery] = useState("")

    useEffect(() => {
        setLabels(getLocalLabels(base, item, fullPath, query, usedLabels, labelExclusivity))
    }, [item, query, usedLabels]);

    function handleItemClick(base, item) {
        labelSelected({
            type: 'label',
            fullPath: fullPath,
            label: typeof item === "string" ? item : item.name,
            format: {boxColor: base.boxColor, textColor: base.textColor}
        })
    }

    function searchChange(e) {
        setQuery(e.target.value)
    }

    const menuItem = () => {
        const getItems = () => {
            return <React.Fragment>
                {labels.count > MAX_SHOW &&
                <LabelMenuSearch key={'search'} searchChange={searchChange} hasExtraData={hasExtraData}/>}
                {labels.data.map((l, i) => (
                    <LabelMenuItem base={base ?? l} fullPath={fullPath ? [...fullPath, item.name ?? item] : []}
                                   item={l} miKey={i} labelSelected={labelSelected} usedLabels={usedLabels}
                                   labelExclusivity={labelExclusivity}/>))}
                {labels.data.length === 0 && <Item disabled>No labels available </Item>}
            </React.Fragment>
        }
        if (typeof item === 'string') {
            return <Item key={miKey} onClick={() => handleItemClick(base, item)}>
                {item}
            </Item>
        } else if (fullPath) {
            return <Submenu label={item.name} arrow={"⯈"}>{getItems()}</Submenu>
        } else {
            return getItems()
        }
    }
    return menuItem()
}

export default LabelMenuItem