import styled from "styled-components";

export const ModuleRow = styled.div`
  display: flex;
  margin: 1rem;

  &.center {
    align-items: center;
    justify-content: center;
  }

  &.toolbar {
    align-items: center;
    justify-content: space-evenly;
  }
  &.flex-column{
    flex-direction: column;
  }

  .react-tagsinput{
    width: 100%;
  }
`

export const ModuleButton = styled.button`
  border: solid 2px;
  box-shadow: #000 2px 2px;
  margin: 0.2rem 0.2rem;
  padding: 0.3rem 0.6rem;

  &.icon {
    padding: 0.4rem 0.6rem;
    font-size: 1.4rem;
  }
`