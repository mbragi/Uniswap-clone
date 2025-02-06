import React from 'react'
import { Outlet } from 'react-router-dom'
import { ethers } from 'ethers'
import Navbar from '../Components/Navbar'
import FooterComponent from '../Components/FooterComponent'
import { connectToNetwork, getSigner, getWalletAddress, switchToNetwork } from '../services/provider'
import ErrorPage from '../Utils/ErrorPage'

function Homepage() {
  const [signer, setSigner] = React.useState(undefined);
  const [provider, setProvider] = React.useState(undefined);
  const [network, setNetwork] = React.useState(undefined)
  const [address, setAddress] = React.useState(undefined)
  const [web3Provider, setWeb3Provider] = React.useState(undefined)
  const [error, setError] = React.useState(false)
  const [message, setMessage] = React.useState(undefined)
  const getSignerObj = async (data) => {
    const provider = await new ethers.providers.Web3Provider(data)
    setProvider(provider)
    let signer = await getSigner(provider)
    setSigner(signer)
    const getAddress = await getWalletAddress(signer)
    setAddress(getAddress)
  }
  const isError = (data) => {
    setError(true)
    setMessage(data)
  }
  const selectedWeb3ProviderNetwork = async data => {
    if (provider === undefined) return alert("connect wallet first")
    setNetwork(data)
    let web3Provider = await connectToNetwork(data)
    //call switch to network function
    await switchToNetwork(data, provider)
    setWeb3Provider(web3Provider)
  }
  //function to check if a wallet is currently connected
  const isConnected = () => signer !== undefined;
  return (
    <>
      {
        error ? <ErrorPage message={message} /> :
          <>
            <Navbar displayErrorPage={isError} provider={provider} connectWallet={getSignerObj} isConnected={isConnected} walletAddress={`${address?.substring(0, 10)}...`} setToNetWork={selectedWeb3ProviderNetwork} />
            <Outlet context={[signer, isConnected, network, address, web3Provider]} />
            <div className="footer">
              <FooterComponent />
            </div>
          </>
      }
    </>
  )
}

export default Homepage