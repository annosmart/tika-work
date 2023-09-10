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