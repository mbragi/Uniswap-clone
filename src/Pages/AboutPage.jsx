import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 20;
  }
`;



const AboutPageContainer = styled.div`
width: 100%;
height: 100vh;
background: linear-gradient(
    315deg,
    #06070a 2%,
    #06080c 30%,
    rgb(1, 1, 20) 100%,
    rgba(15, 15, 30, 0.5) 100%
  );


  animation: ${fadeIn} 1s ease-in-out;

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`;

const Sometext = styled.div`

color: #fff;
`

function AboutPage() {
  return (
    <AboutPageContainer>
        <Sometext>
    <h1>About Us</h1>
    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Officia, deserunt hic ipsa ex quia alias, molestiae saepe esse non maiores, excepturi deleniti minus dolores ab maxime enim autem tempore quasi..</p>
    </Sometext>
  </AboutPageContainer>
  )
}

export default AboutPage