import React from "react";
import styled from "styled-components";

const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  const handleClick = (page) => {
    onPageChange(page);
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePrevClick = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const active = "bg-transparent text-white";

  return (
    <NavStyled>
      <ButtonStyled onClick={handlePrevClick}>Previous</ButtonStyled>
      <ListStyled>
        {pages.map((page) => {
          return (
            <ListItemStyled key={page}>
              <ButtonStyled
                className={`page-link ${page === currentPage ? active : "bg-transparent text-black"
                  } p-[.5rem] `}
                onClick={() => handleClick(page)}
              >
                {page}
              </ButtonStyled>
            </ListItemStyled>
          );
        })}
      </ListStyled>
      <ButtonStyled onClick={handleNextClick}>Next</ButtonStyled>
    </NavStyled>
  );
};

export default Pagination;

const NavStyled = styled.nav`
  margin: 0;
  padding: 0;
  text-align: center;
  justify-content: center;
  margin-bottom: 2rem;
`;

const ListStyled = styled.ul`
  margin: 0;
  padding: 0;
`;

const ListItemStyled = styled.li`
  display: inline;
`;

const ButtonStyled = styled.button`
  display: inline-block;
  text-decoration: none;
  padding: 5px 10px;
  color: #fff;
  font-weight: 600;

  &:hover {
    // color: #f44336;
    border: 1px solid #ddd;
    border-radius: 5px;
    // transition: 200ms ease-in;
  }
`;
