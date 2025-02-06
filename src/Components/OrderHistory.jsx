import React, { useState } from 'react'
import styled from 'styled-components';
import { useQueryClient } from 'react-query'
import { useEffect } from 'react';
import { BigNumber } from 'ethers';
const arr = [{
  id: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
  name: "Wrapped Ether",
  symbol: "WETH",
  decimals: 18
},
{
  id: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  name: "Uniswap Token",
  symbol: "UNI",
  decimals: 18
}]
function OrderHistory(props) {
  //function to get value from swap data

  const [swapData, setSwapData] = useState([]);
  const queryClient = new useQueryClient();
  const tokens = queryClient.getQueryData("swapTokens");
  const formattedTokens = tokens.map((token) => {
    return {
      contractId: token.id.toLowerCase(),
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
    };
  });
  function getSwapData(data, tokens) {
    console.log(data, "data")
    console.log("tokens", tokens)
    let array = data
    let zeroAddress = "0x0000000000000000000000000000000000000000"
    array.forEach(element => {
      if (element.path0 === zeroAddress) {
        return alert('these things happen sorry, transaction not found ')
      }
      let tokenObj = {}
      tokenObj['triggerRatio'] = BigNumber.from(element.triggerRatio).toString()
      tokenObj['amountIn'] = BigNumber.from(element.amountIn).toString()
      tokenObj['executionFee'] = BigNumber.from(element.executionFee).toString()
      let token0 = tokens.find(token => token.contractId === element.path0.toLowerCase())
      let token1 = tokens.find(token => token.contractId === element.path1.toLowerCase())
      tokenObj['path0'] = token0.name
      tokenObj['path1'] = token1.name
      tokenObj['path0Symbol'] = token0.symbol
      tokenObj['path1Symbol'] = token1.symbol
      // console.log(tokenObj)
      const format = {
        amountIn: parseFloat(tokenObj.amountIn) / 10 ** token0.decimals,
        triggerRatio: parseFloat(tokenObj.triggerRatio) / 10 ** 30,
        executionFee: parseFloat(tokenObj.executionFee) / 10 ** token0.decimals,
        idx: localStorage.getItem("index"),
        path0Symbol: tokenObj.path0Symbol,
        path1Symbol: tokenObj.path1Symbol
      }
      setSwapData([format])
    });
  }
  let formatted = arr.map((item) => {
    return {
      contractId: item.id.toLowerCase(),
      name: item.name,
      symbol: item.symbol,
      decimals: item.decimals
    }
  })

  useEffect(() => {
    const tokensOnCurrentNetwork = {
      localhost: formattedTokens,
      goerli: formatted
    }
    const network = localStorage.getItem("network")
    console.log(tokensOnCurrentNetwork[network])
    getSwapData(props.data, tokensOnCurrentNetwork[network]);
  });

  return (
    <TableContainer className='my-[1rem] bg-inherit text-white'>
      <thead className='!min-w-[400px] w-[100%] font-bold text-lg' >
        <th className='w-[100px]'>S/N</th>
        <th className='w-[100px]'>Order</th>
        <th className='w-[100px]'>Amount</th>
        <th className='w-[100px]'>Trigger Ratio</th>
        <th className='w-[100px]'>Execution Fee</th>
      </thead>
      {
        swapData.map((item) => {
          // console.log(item)
          return (
            <tbody key={item.contractId} className='!min-w-[400px] w-[100%] text-sm border-b-2 border-black mt-2 '>
              <td className='w-[100px]'>{item.idx}</td>
              <td className='w-[100px]'> {`${item.path0Symbol}-${item.path1Symbol}`} </td>
              <td className='w-[100px]'>{item.amountIn}</td>
              <td className='w-[100px]'>{item.triggerRatio}</td>
              <td className='w-[100px]'>{item.executionFee}</td>
            </tbody>
          )
        })
      }
    </TableContainer>
  );
};




export default OrderHistory
// {
// data
// }



const TableContainer = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: linear-gradient(
    315deg,
    #06070a 2%,
    #06080c 30%,
    rgb(1, 1, 20) 100%,
    rgba(15, 15, 30, 0.5) 100%
  );
  animation: gradient 10s ease infinite;
  background-size: 400% 400%;
  background-attachment: fixed;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
`;
// const TableHeader = styled.tr`
//    background: linear-gradient(
//     315deg,
//     #06070a 2%,
//     #06080c 30%,
//     rgb(1, 1, 20) 100%,
//     rgba(15, 15, 30, 0.5) 100%
//   );
//   animation: gradient 10s ease infinite;
//   background-size: 400% 400%;
//   background-attachment: fixed;
//   color: #fff;
//   font-size: 16px;
//   font-weight: bold;
// `;
// const TableRow = styled.tr`
//   color: #fff;
//   font-size: 14px;
//   padding: 10px;
//   background: linear-gradient(
//     315deg,
//     #06070a 2%,
//     #06080c 30%,
//     rgb(1, 1, 20) 100%,
//     rgba(15, 15, 30, 0.5) 100%
//   );
//   animation: gradient 10s ease infinite;
//   background-size: 400% 400%;
//   background-attachment: fixed;
// `;



