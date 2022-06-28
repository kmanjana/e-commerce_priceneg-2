import React, {useEffect,useState} from 'react'
import Axios from 'axios'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {  faArrowLeftLong, faCartShopping, faPlus, faMinus, faTrash} from '@fortawesome/free-solid-svg-icons'
import {Container,Row ,Card, Col, Button} from 'react-bootstrap';
import "../styles/cart2.css"
import {Link, useNavigate} from "react-router-dom"

function Cart2() {

  let [prods,setProducts]= useState([]);
  let [negprods,setNegProducts]= useState([]);
  let index = 0;
  const [total_price,setTotal]= useState("");
  // const [p_name,setProd_name]=useState("");
  // const [pid,setPid]= useState("")
  // const [user_id,setUserId]=useState("");
  // const [price,setPrice]= useState("")
  // const [qnty,setQnty]=useState("");
  // const [brand,setBrand]= useState("")

  useEffect( ()=>{
    prod_display()
    negprod_display()
    total()
    // window.history.scrollRestoration = 'auto'
    
  },[])

  const prod_display = ()=>{
    // setPid(localStorage.getItem("pid")) 
    // setUserId(localStorage.getItem("user_id"))
    // setQnty(localStorage.getItem("qnty")) 
    // setPrice(localStorage.getItem("price")) 

    // console.log("local",pid);
    Axios.post("http://localhost:3002/cart",{
      command: "display",
      user_id: localStorage.getItem("user_id"),
      negotiated:0
    }).then((response)=>{
      setProducts(response.data)
      console.log(response.data)
      // itemRemove();
      // card_display(prod)
    })
       
        // card_display(prod[i]);
      }
     
  const total = ()=>{
    Axios.post("http://localhost:3002/total_price",{
      user_id:localStorage.getItem("user_id")
    }).then((response)=>{
       setTotal(response.data[0].total.toFixed(2))
       console.log(total_price)
    })
  }

  // const increase= (prod)=>{
  //    let qty = parseInt(prod.qty)
  //    qty = qty+1
  //    console.log(qty)
  //   //  localStorage.setItem("oldquantity",prod.qty)
  //   //  localStorage.setItem("prod_id",prod.pid)
  //    Axios.post("http://localhost:3002/qtyChange",{
  //    change: "increase",
  //    cart_id: prod.cart_id,
  //    user_id: localStorage.getItem("user_id")
  //   }).then((response)=>{
  //     console.log(response)
  //     window.location.reload();
  //   })
  // }
  // const decrease= (prod)=>{
    
  //   if(prod.qty!=1){
  //   //   localStorage.setItem("oldquantity",prod.qty)
  //   //  localStorage.setItem("prod_id",prod.pid)
  //     Axios.post("http://localhost:3002/qtyChange",{
  //    change: "decrease",
  //    cart_id: prod.cart_id,
  //    user_id: localStorage.getItem("user_id")
  //   }).then((response)=>{
  //     console.log(response)
  //     window.location.reload();

  //   })
  //   }
  //   else if(prod.qty==1){
  //       removetocart(prod);
  //   }
    
  // }
  const removetocart= (prod)=>{
    console.log(prod.cart_id)
    if(window.confirm("Are you sure you want to remove this item?")){
    Axios.post("http://localhost:3002/removetocart",{
     cart_id: prod.cart_id
    }).then((response)=>{
      console.log(response)
      window.location.reload();
    })}
 }
 const discountprice1 = (prod) =>{
  var profit = prod.price - prod.minprice; 
  var qnty_profit = (prod.qty * prod.price) - (prod.qty * prod.minprice);
  var extra_profit = qnty_profit - profit;
  var new_price = ((prod.qty * prod.price) - (extra_profit * 0.1)).toFixed(2);
  // console.log("new "+new_price)
  if(prod.qty >1){
    return <div>
    <span><div style={{textDecoration:"line-through", color:"grey",fontWeight:"300",textDecorationThickness: "0.01em"}} >{(prod.qty * prod.price).toFixed(2)}</div>
    <div style={{fontWeight:"500"}}>{new_price}</div></span>
  </div>
  }
  else if(prod.qty = 1){
    return <div style={{fontWeight:"500"}}>
    {new_price}
  </div>
  }
  
}

function range(start, end) {
  return Array(end - start + 1).fill().map((_, idx) => 
                                              <option>{start + idx}</option>)
}
//  const [qnty,setQuantity]=useState("default");

const setQt = (prod,qty) =>{
// console.log("qn" + qnty)
Axios.put("http://localhost:3002/qtySelect",{
 cart_id: prod.cart_id,
 user_id: localStorage.getItem("user_id"),
 qnty: qty
}).then((response)=>{
  console.log(response)
  window.location.reload();
})
}

const setProd = (prod)=> {
  localStorage.setItem('product_Details',JSON.stringify(prod));
}

 const shopping_cartdisp = ()=>{
   if(prods.length > 0){
    document.getElementById("shopcart").style.display = "block";
    document.getElementById("shopspace").style.height = "350px";
    document.getElementById("full").style.height = "0px";
    document.getElementById("full").style.display = "none";
     return <div>
    <Container className='mt-2'>
      <Row className='mt-3'>
        <table className="table table-hover text-center table-responsive-sm caption-top">
          <caption className='text-dark bg-light'>Shopping Cart <FontAwesomeIcon icon={faCartShopping} /></caption>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Product</th>
              <th scope="col">Product Name</th>
              <th scope="col">Price</th>
              <th scope="col">Quantity</th>
              <th scope="col">Remove</th>
            </tr>
          </thead>
          <tbody>
            {
              prods.map((prod =>
                    
                < tr key={prod.pid}>
                  <th scope="row">{++index}</th>
                  <th scope="row">
                    <img src={prod.img} style={{ width: '4rem' }} />
                  </th>

                  <td>
                  <Link to="/productdetail" onClick={()=>setProd(prod)}style={{textDecoration:"none",color:"black"}}>
                    {prod.p_name}<br></br>
                  <div style={{fontWeight:"200"}}>Sold by {prod.shop_name}</div>
                  </Link>
                  </td>
                  
                  <td>
                    {discountprice1(prod)}
                  </td>
                <td>
                  <tr>
                  <td>
                  <select id="select" value={prod.qty} onChange={(e)=>{setQt(prod,e.target.value)}}  style={{fontWeight:"500"}}>
                      <option value="default" disabled hidden>{prod.qty}</option>
                    {range(1,prod.qnty)}
                    </select>
                    {/* <button
                      onClick={() => decrease(prod)}
                      className="btn btn-primary btn-sm"
                    >
                      -
                    </button>
                  </td>
                  <td>
                    <button className='btn btn-light btn-sm' disabled>
                      {prod.qty}
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => increase(prod)}

                      className="btn btn-primary btn-sm"
                      size="sm"
                    >
                      +
                    </button> */}
                  </td>
                  </tr>
                </td>
                  <td>
                    <button onClick={() => removetocart(prod)} className="btn btn-danger" style={{backgroundColor:"#a20d0d"}}>
                      <FontAwesomeIcon icon={faTrash} />
                      </button>
                  </td >
                </tr >
              ))}
          </tbody>
        </table>
      </Row>
      {/* <Row>
        <Col className="text-center">
          <h4>TOTAL: {total_price}</h4>
        </Col>
      </Row> */}
      </Container>
     </div>
   }
 }
 //------------------------------------------
const negprod_display = ()=>{
  Axios.post("http://localhost:3002/cart",{
    command: "display",
    user_id: localStorage.getItem("user_id"),
    negotiated:1
  }).then((response)=>{
    setNegProducts(response.data)
    console.log(response.data)
  })
} 
   
 const negprodcart_disp = ()=>{

  if(negprods.length > 0){
    
   document.getElementById("negcart").style.display = "block";
   document.getElementById("shopspace").style.height = "0px";
   document.getElementById("negspace").style.height = "350px";
   document.getElementById("full").style.height = "0px";
    document.getElementById("full").style.display = "none";
    return <div>
   <Container className='mt-2'>
    <Row className='mt-3'>
      <table className="table table-hover text-center table-responsive-sm caption-top">
        <caption className='text-dark bg-light'>Negotiated Products</caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Product</th>
            <th scope="col">Product Name</th>
            <th scope="col">Price</th>
            <th scope="col">Quantity</th>
            <th scope="col">Remove</th>
          </tr>
        </thead>
        <tbody>
          {
            negprods.map((negprod =>
               
              < tr key={negprod.pid}>
                <th scope="row">{++index}</th>
                <th scope="row">
                  <img src={negprod.img} style={{ width: '4rem' }} />
                </th>
                <td>{negprod.p_name}<br></br>
                <div style={{fontWeight:"200"}}>Sold by {negprod.shop_name}</div>
                  </td>
                <td>{discountprice1(negprod)}</td>
                {/* <td>{negprod.price}</td> */}
                {/* <td style={{textAlign:"center"}}>
                    {negprod.qty}
                </td> */}
                <td>
                  <tr>
                  <td>
                    <select id="select" value={negprod.qty} onChange={(e)=>{setQt(negprod,e.target.value)}}  style={{fontWeight:"500"}}>
                      <option value="default" disabled hidden>{negprod.qty}</option>
                    {range(1,negprod.qnty)}
                    </select>
                  </td>
                  </tr>
                </td>
                <td>
                  <button onClick={() => removetocart(negprod)} className="btn btn-danger" style={{backgroundColor:"#a20d0d"}}>
                    <FontAwesomeIcon icon={faTrash} />
                    </button>
                </td >
              </tr >
            ))}
        </tbody>
      </table>
    </Row>
    <Row>
      <Col className="text-center">
        <h4>TOTAL: {total_price}</h4>
      </Col>
    </Row>
    </Container>
    </div>
  }
}

  return (
    <div>
  <div id = 'full' style={{height:"500px",textAlign:"center",paddingTop:"50px"}}>
    No items in cart!
  </div>
  <div className='cart-div' id='shopcart' style={{display:"none"}}>
      {shopping_cartdisp()}
      
    </div>
    <div id = "shopspace" ></div>
    <div className='cart-div' id = 'negcart' style={{display:"none"}}>
    {negprodcart_disp()}
    <div id = "negspace"></div>
  </div>
    </div>
    
    
  )
}

export default Cart2