import axios from 'axios';
import React, { useEffect } from 'react'
import TokenSwapUi from '../Components/TokenSwapUi'
import { useOutletContext } from 'react-router-dom'
import { useQuery } from "react-query";
import { SUB_GRAPH_API } from "../services/Constants";
import Loading from "../Utils/Loading";
import ErrorPage from "../Utils/ErrorPage";


function SwapTokensPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(undefined);
  const [data, setData] = React.useState(undefined);
  const [signer, isConnected, network, address, Web3Provider] = useOutletContext()
  // Use React Query hook to retrieve cached data
  const fetchSwapTokens = useQuery(
    "swapTokens",
    async () => {
      const query = `
        {
         tokens(where: {}, orderBy: volumeUSD, orderDirection: desc) {
        id
        name
        decimals
        feesUSD
        derivedETH
        poolCount
        symbol
        volumeUSD
        volume
        untrackedVolumeUSD
        txCount
        totalValueLocked
        totalValueLockedUSDUntracked
        totalValueLockedUSD
        totalSupply
      }
        }
       `;
      const data = await axios.post(SUB_GRAPH_API, { query: query });
      // console.log(data.data.data.tokens);/
      return data.data.data.tokens;
    },
    {
      // Refetch the data every 30 minutes
      staleTime: 1000 * 60 * 30, // 30 minutes in milliseconds
      // Enable background updates so the data is always up-to-date
      refetchIntervalInBackground: true,
      cacheTime: Infinity,
    }
  );
  const {
    data: swapTokens,
    isLoading: swapLoading,
    error: swapError,
  } = fetchSwapTokens;


  useEffect(
    () => {
      setIsLoading(swapLoading)
      setData(swapTokens)
      setError(swapError)
    }, [swapTokens, swapLoading, swapError, setIsLoading, setError, setData]
  )

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorPage message={error.message} />;
  }

  return (
    <>
      <TokenSwapUi signer={signer} isConnected={isConnected} network={network} address={address} provider={Web3Provider} data={data} />
    </>)
}

export default SwapTokensPage