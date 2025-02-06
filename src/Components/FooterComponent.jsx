import React from "react";
import styled from "styled-components";

const FooterComponent = () => {
  return (
    <Box>
      <h1
        style={{
          color: "white",
          textAlign: "center",
          fontSize: "30px",
          fontWeight: "bold",
          marginTop: "-50px",
        }}
      >
        Proof of Concept
      </h1>
      <Container>
        <Row>
          <Column>
            <Heading>App</Heading>
            <FooterLink href="#">Swap Tokens</FooterLink>
            <FooterLink href="#">Limit Trade</FooterLink>
            <FooterLink href="#">NFTs</FooterLink>
          </Column>
          <Column>
            <Heading>Company</Heading>
            <FooterLink href="#">Blog</FooterLink>
            <FooterLink href="#">Carreers</FooterLink>
          </Column>
          <Column>
            <Heading>Get Help</Heading>
            <FooterLink href="#">Contact Us</FooterLink>
            <FooterLink href="#">Help Center</FooterLink>
          </Column>
        </Row>
      </Container>
    </Box>
  );
};
export default FooterComponent;

export const Box = styled.div`
  padding: 50px 60px;
  background: #03001c;
  position: relative;
  bottom: 0;
  width: 100%;

  @media (max-width: 1000px) {
    padding: 100px 30px;
  }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 1000px;
  margin: 0 auto;
  /* background: red; */
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-left: 60px;
`;

export const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
  grid-gap: 100px;

  @media (max-width: 1000px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
`;

export const FooterLink = styled.a`
  color: #fff;
  margin-bottom: 20px;
  font-size: 18px;
  text-decoration: none;

  &:hover {
    color: #6c86ad;
    transition: 200ms ease-in;
  }
`;

export const Heading = styled.p`
  font-size: 24px;
  color: #fff;
  margin-bottom: 10px;
  margin-top: 10px;
  font-weight: bold;
`;
