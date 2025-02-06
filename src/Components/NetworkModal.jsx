import React, { useState } from "react";
import styled from "styled-components";
import data from "../Utils/networkmodal.json";

const MenuContainer = styled.div`
  position: relative;
`;

const MenuButton = styled.button`
  background-color: transparent;
  color: #fff;
  border: none;
  cursor: pointer;
`;

const MenuList = styled.ul`
  position: absolute;
  top: 100%;
  right: 2;
  border-radius: 10px;
  z-index: 1;
  width: 200px;
  list-style: none;
  padding: 0;
  margin: 0;
  background: linear-gradient(
    315deg,
    #06070a 2%,
    #06080c 30%,
    rgb(1, 1, 20) 100%,
    rgba(15, 15, 30, 0.5) 100%
  );
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const MenuItem = styled.li`
  padding: 15px;
  display: flex;
  width: 100%;
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
  }
`;

function DropdownMenu(props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [changeButton, setChangeButton] = useState(undefined);





  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (item) => {
    props.selectedNetwork(item.name)
    setChangeButton(item.name)
    setIsOpen(!isOpen)
  };

  return (
    <MenuContainer>
      {changeButton === undefined ? <MenuButton onClick={handleButtonClick} >Network</MenuButton> :
        <MenuButton onClick={handleButtonClick}  >{changeButton}</MenuButton>
      }
      {isOpen && (
        <MenuList>
          {data.map((item) => (
            <MenuItem
              key={item.id}
              onClick={() => handleMenuItemClick(item)}
            >
              <img src={item.image} alt="" width="20px" />
              {item.name}
            </MenuItem>
          ))}
        </MenuList>
      )}
    </MenuContainer>
  );
}

export default DropdownMenu;
