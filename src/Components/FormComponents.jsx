import styled from "styled-components";

export const StyledForm = styled.form`
  /* background-color: #f4f4f4;
  padding: 20px;
  border-radius: 5px; */

  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

export const StyledLabel = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: ${(props) => (props.invalid ? "red" : "black")};
`;

export const StyledInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

export const StyledButton = styled.button`
  background-color: rgba(47, 138, 245, 0.16);
  color: #2f8af5;
  font-weight: 600;
  font-size: 20px;
  padding: 15px;
  width: 95%;
  margin: 0 auto;
  margin-top: 12px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  // box-shadow: 0 0 40px 40px ${(props) => props.theme.blue} inset,
  //   0 0 0 0 ${(props) => props.theme.blue};
  transition: all 150ms ease-in-out;
  &:disabled {
    opacity: 0.5;
  }
  &:enabled {
    opacity: 1;
  }
  opacity: ${(props) => (!props.enabled ? 0.5 : 1)};

  &:hover {
    box-shadow: 0 0 10px 0 ${(props) => props.theme.blue} inset,
      0 0 10px 4px ${(props) => props.theme.blue};
  }
`;

export const StyledAlert = styled.div`
  padding: 10px;
  background-color: #f44336;
  color: white;
  margin-top: 10px;
  border-radius: 5px;
`;
