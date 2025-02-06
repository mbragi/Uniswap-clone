import React, { useState, useEffect, Fragment } from "react";
import axios from "axios";
import styled from "styled-components";

const Body = styled.div`
  width: 100%;
  background-color: red;
`;

const Results = styled.div`
  width: 50%;
  display: flex;
`;

const Restext = styled.h4`
  color: blue;
`;

const Resp = styled.p`
  color: blue;
`;

const Container = styled.div`
  position: absolute;
  top: 90px;
  left: 33rem;
`;

function CoinModal() {
  return (
    <Fragment>
      <Body>
        <Container>
          <div className="w-[50%] flex flex-nowrap" >
            <img
              src="https://app.uniswap.org/static/media/optimistic_ethereum.34412af2.svg"
              alt=""
              width="30px"
            />
            <p>Polygon</p>
          </div>
        </Container>
      </Body>
    </Fragment>
  );
}

export default CoinModal;
