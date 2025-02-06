import React, {useState} from 'react';
import styled from 'styled-components';
import { StyledButton, StyledForm, StyledInput } from './FormComponents';

const OrderContainer = styled.div`

height: 80vh;

`;

const OrderHeader = styled.div`


  
  
  
`;

const OrderBody = styled.div`

`;

const LimitOrder = styled.h1`
font-size:20px;
color: #fff;
padding-top: 100px;


`;

const Button1 = styled(StyledButton)`

margin: 20px;
padding: 20px;
height: 50px;
text-align: center;
font-size: 15px;
padding-top: 5px;
`;

const Button2 = styled(StyledButton)`
height: 50px;
margin: 20px;
text-align: center;
font-size: 14px;


`;

const Btn = styled.div`

 padding-left: 71rem;
 display: flex;
 padding-bottom: 35px;

    

    
    
    
`;

const Head = styled.h1`
color: #fff;
padding-left: 700px;
margin:10px;
padding-top: 150px;

`;

const Table = styled.div``

function Orders() {
const [btn,SetBtn] = useState("Active orders are not available");

function handleClick() {
  

  SetBtn( "Order history is not available");

}

function orderHistory(){
<div>  
<Table>
  <Table.Head>
    <Table.TR>
      <Table.TH>Heading 1</Table.TH>
      <Table.TH>Heading 2</Table.TH>
    </Table.TR>
  </Table.Head>
  <Table.Body>
    <Table.TR>
      <Table.TH>data 1</Table.TH>
      <Table.TH>data 2</Table.TH>
    </Table.TR>
    <Table.TR>
      <Table.TH>data 3</Table.TH>
      <Table.TH>data 4</Table.TH>
    </Table.TR>
  </Table.Body>
</Table>
</div>
};
const handleUndo = () => {
  SetBtn('Active orders are not available');
};


  return (
    <OrderContainer>
<OrderHeader>
<LimitOrder>
  Limit Orders
</LimitOrder>
<Btn>
<Button1 onClick={handleUndo}>
  Active orders
</Button1>
<Button2 onClick={handleClick}>
  Order history
</Button2>
</Btn>
</OrderHeader>

<OrderBody>
<Head  >
{btn}
</Head>

</OrderBody>
    </OrderContainer>
  )
}

export default Orders