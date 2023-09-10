import React from "react";
import {ModuleToolButton} from "./controls.styled";

function ToolButton({name, toolName, changeTool, children, title, style = {}}) {
    const handleClick = () => {
        changeTool(name)
    };
    return <ModuleToolButton style={style} onClick={handleClick} title={title}
                             className={`icon ${toolName && name === toolName ? 'active' : ''}`}>{children}</ModuleToolButton>
}

export default ToolButton