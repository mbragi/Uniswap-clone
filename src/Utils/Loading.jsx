import React, { useState, useEffect } from "react";
import { DotLoader } from "react-spinners";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  background: linear-gradient(
    315deg,
    #06070a 2%,
    #06080c 30%,
    rgb(1, 1, 20) 100%,
    rgba(15, 15, 30, 0.5) 100%
  );
  animation: gradient 15s ease infinite;
  background-size: 400% 400%;
  background-attachment: fixed;
  /* background-color:   #09203F → #537895; */
  text-align: center;
  justify-content: center;
  width: 100%;
  height: 86vh;
`;

const Library = styled.div`
  position: absolute;
  justify-content: center;

  bottom: 300px;
`;
const Txt = styled.h1`
  font-size: 70px;
  color: #e1f6f4;
`;

const Move = styled.div`
  position: absolute;
  right: 20px;
`;
function Loading() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
  }, []);

  return (
    <Container>
      <Library>
        <Move>
          <DotLoader
            title="lad"
            color={"aliceblue"}
            loading={isLoading}
            size={190}
            aria-label="Loading Spinner"
            data-testid="loader"
            speedMultiplier={1}
          />
        </Move>
        <Txt>Wait a moment !!!</Txt>
      </Library>
    </Container>
  );
}

export default Loading;
