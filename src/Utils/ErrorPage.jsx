import React, { useState, useEffect } from "react";
import { HashLoader } from "react-spinners";
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
  /* background-color: #282c34; */
  text-align: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
`;

const Library = styled.div`
  position: absolute;

  bottom: 350px;
`;
function ErrorPage({ message }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setIsLoading(true);
    if (message) {
      return setErrorMessage(message);
    }
    return setErrorMessage("PAGE NOT FOUND!");
  }, [message]);

  return (
    <Container>
      <Library>
        <HashLoader
          color={"#fff"}
          loading={isLoading}
          size={100}
          aria-label="Loading Spinner"
          data-testid="loader"
          speedMultiplier={2}
        />
        <h1 className="text-white">{errorMessage}</h1>
      </Library>
    </Container>
  );
}

export default ErrorPage;
