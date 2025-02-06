import React, { useState, useRef } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../App.css";
import NetworkModal from "./NetworkModal";

const Navbar = (props) => {
  const navRef = useRef();

  const showNavbar = () => {
    navRef.current.classList.toggle("responsive_nav");
  };

  const closeNavbar = () => {
    navRef.current.classList.remove("responsive_nav");
  };
  const [provider, setProvider] = useState(undefined)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null);
  const [connButtonText, setConnButtonText] = useState("Connect Wallet");

  const connectWalletHandler = async () => {
    setConnButtonText('Loading...')
    if (window.ethereum && props.provider === undefined) {
      props.connectWallet(window.ethereum)
      setProvider(provider)
    } else if (!window.ethereum) {
      setIsError(true)
      setErrorMessage("Please install MetaMask browser extension to interact");
    }
    props.connectWallet(window.ethereum)
  };
  if (isError) {
    props.displayErrorPage(errorMessage)
  }
  return (
    <header>
      <Link className="logo" to="/">
        Proof of Concept
      </Link>
      <nav ref={navRef}>

        <Link to="/" onClick={closeNavbar}>
          Limit Trade
        </Link>
        <Link to="/SwapToken" onClick={closeNavbar}>
          Swap Token
        </Link>
        <Link to="/About" onClick={closeNavbar}>
          About Us
        </Link>

        <Link className="conn-btn">{<NetworkModal selectedNetwork={props.setToNetWork} />}</Link>

        {
          props.isConnected() ?
            <Link onClick={connectWalletHandler} className="conn-btn animate-wiggle">
              {props.walletAddress}
            </Link> :
            <Link onClick={connectWalletHandler} className="conn-btn animate-bounce">
              {connButtonText}
            </Link>
        }
        <button className="nav-btn nav-close-btn" onClick={showNavbar}>
          <FaTimes />
        </button>
      </nav>
      <button className="nav-btn" onClick={showNavbar}>
        <FaBars />
      </button>
    </header>
  );
};

export default Navbar;
