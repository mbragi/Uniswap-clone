import React, { useEffect } from "react";
import axios from "axios";
import { useQuery } from "react-query";
import { ethers } from "ethers";
import { COIN_GECKO_API } from "../services/Constants";
import Loading from "../Utils/Loading";
import ErrorPage from "../Utils/ErrorPage";
import Pagination from "../Components/Pagination";
import "../App.css";

function Landing() {
  const [data, setData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [itemsLength, setItemsLength] = React.useState(undefined);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [token, setToken] = React.useState(undefined);


  const handleInputChange = (event) => {
    const value = event.target.value;
    if (value === "") {
      // if search query is empty, show all tokens
      setData(token.slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage));
    } else {
      // filter tokens based on search query
      const filteredData = token.filter((t) =>
        t.name.toLowerCase().includes(value.toLowerCase())
      );
      setData(filteredData);
      setItemsLength(filteredData.length);
    }
  };



  const fetchTopTokens = useQuery(
    "topTokens",
    async () => {
      const data = await axios.get(COIN_GECKO_API);
      console.log(data.data.length);
      setItemsLength(data?.data.length);
      return data.data;
    },
    {
      // Refetch the data every 30 minutes
      staleTime: 1000 * 60 * 30, // 30 minutes in milliseconds
      // Enable background updates so the data is always up-to-date
      refetchIntervalInBackground: true,
      cacheTime: Infinity,
    }
  );



  const itemsPerPage = 10;

  const handlePageChange = (page) => {
    setIsLoading(true)
    const indexOfLast = page * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const filterData = token.slice(indexOfFirst, indexOfLast);
    setData(filterData);
    setPageIndex(page);
    setIsLoading(false)
  };

  // const getTokensLength = tokens => { setItemsLength(tokens.length) }
  const { data: tokens, isLoading: loading, error } = fetchTopTokens;



  useEffect(() => {
    // console.log("swapTokens", swapTokens, swapLoading, swapError);
    setToken(tokens);
    setData(tokens?.slice(0, itemsPerPage));
    setIsLoading(loading);
    setPageIndex(1);
    setIsLoading(loading);
    // localStorage.removeItem("index")
  }, [
    tokens,
    setData,
    loading,
    setIsLoading,

  ]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorPage message={error.message} />;
  }

  return (
    <>
      <div className="hero ">

        <div className="container ">
          <div className="left">
            <h1>Welcome to Proof of Concept</h1>
            <p>
              This is a simple dApp that allows you to Trade your cryptocurrency
            </p>
          </div>

          {/* Right Side */}
          <div className="right">
            <div className="img-container">
              <img
                src="https://cdni.iconscout.com/illustration/premium/thumb/bitcoin-mining-4292737-3562242.png"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
      <div className="tab w-full h-full flex flex-col items-center my-10 space-y-8 ">
        <h1 className="text-3xl  text-center text-white mt-20 hover:text-white font-bold">
          Search  currencies
        </h1>
        <div>
          <input
            type="text"
            placeholder="Search..."
            onChange={handleInputChange}
            className="search-bar-input"
          />
        </div>
        <table className="w-[90%] bg-body rounded-3xl flex flex-col min-h-[300px] p-2 table-responsive">
          {data?.map((token, index) => {
            // let icon = cryptoIcons.get(token.symbol);
            let volume = ethers.utils.commify(token.total_volume);
            return (
              <tbody
                className="w-[100%] flex text-white hover:text-headers justify-evenly items-start border-b-1"
                key={index}
              >
                <tr className="w-[15%]  m-1 p-3 text-sm lg:text-xl font-sans font-bold">
                  <img src={token.image} alt="" width="50px" />
                </tr>
                <tr className="w-[20%] m-1 p-2 text-sm lg:text-xl font-sans font-bold">
                  {token.name}
                </tr>
                <tr className="w-[30%] m-1 p-2 text-sm lg:text-xl font-sans font-bold">
                  ${volume}
                </tr>
              </tbody>
            );
          })}
        </table>
      </div>

      <Pagination
        itemsPerPage={itemsPerPage}
        totalItems={itemsLength}
        currentPage={pageIndex}
        onPageChange={handlePageChange}
      />
    </>
  );
}

export default Landing;
