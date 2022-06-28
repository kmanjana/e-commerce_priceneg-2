import React, {useEffect,useState} from 'react'
// import 'bootstrap/dist/css/bootstrap.min.css';  
import {Container,Row ,Card, Col, Button, Navbar,Form,FormControl} from 'react-bootstrap';
import {Link, useNavigate} from "react-router-dom"
// import '../styles/displayProd.css'
// import { Crefresh } from './Navbar'
import Axios from 'axios'
import '../styles/DisplayProduct.css';
import { useDispatch, useSelector } from "react-redux";
import * as chatbotActions from '../store/actions/chatbotActions'
import { FaSearch } from "react-icons/fa";

function DisplayProduct() {

  const dispatch = useDispatch() 

  let [prods,setProducts]= useState([]);
  let navigate = useNavigate();
  let [disabled , showDisabled] = useState();
    
    const userLoggedin = ()=>{
      if(localStorage.getItem("user_id")){
        showDisabled(false)
      }
      else{
        showDisabled(true)
      }
    }

  useEffect( ()=>{
    
    userLoggedin();
    prod_display()
    shops()
  },[])


  
  function refreshPage(){
    <div>{prod_display()}</div>
  }
  const prod_display = ()=>{
    const item_n = localStorage.getItem("item");
    console.log("local",item_n);
    Axios.post("http://localhost:3002/displayProd",{
      item: item_n 
    }).then((response)=>{
      setProducts(response.data)
      localStorage.setItem("item","products")
      console.log(response.data)
      // card_display(prod)
    })
    
        // card_display(prod[i]);
      
  }

  const setProd = (prod)=> {
    localStorage.setItem('product_Details',JSON.stringify(prod));
  }

  const addtoCart = (prod)=>{
    Axios.post("http://localhost:3002/cart",{
      command: "insert",
      pid: prod.pid,
      user_id:localStorage.getItem("user_id"),
      qnty: 1,
      price:prod.price,
      negotiated: 0
    }).then((response)=>{
      // setProducts(response.data)
      if(response.data.msg == "Item already in cart"){
        alert("Item is already in cart! Added one more!");
      }
      else if (response.data.msg == "Negotiated item already in cart"){
        alert("This item's price was previously negotiated!")
      }
      else{
        alert("Item added to cart successfully!");
      }
      
      console.log(response.data)
    })
    // navigate('/cart2');
  }  

  const itemRemove = ()=>{
    localStorage.removeItem("pid");
    localStorage.removeItem("qnty");
    localStorage.removeItem("price")
  }

  const negotiate = (prod)=>{
    Axios.post("http://localhost:3002/alreadyincart",{
      pid: prod.pid,
      userid: localStorage.getItem("user_id")
    }).then((response)=>{
      if(response.data.msg == "already in cart"){
        alert("Item is already in cart!")
      }
      else{
        localStorage.setItem("maxprice", prod.price)
        localStorage.setItem("minprice",prod.minprice)
        localStorage.setItem("negotiation", 1)
    const data = {
      command: "###nego",
      text: "Negotiate",
      pid: prod.pid
  }
  dispatch(chatbotActions.textQueryAction(data))
    openForm()
      }
      // card_display(prod)
    })
    
  }

  const openForm = () =>{
    document.getElementById("notif").style.display = "none";
    document.getElementById("chat-wrapper").style.minHeight= "600px";
    document.getElementById("chat-wrapper").style.opacity= "1";
    document.getElementById("chat-wrapper").style.transform= "translate3d(0px, 0px, 0px) scale(1, 1)";
    document.getElementById("chat-wrapper").style.transition= "transform 0.8s ease, opacity 0.8s ease-in"; 
    document.getElementById("open").style.height= "60px"; 
    document.getElementById("open").style.bottom= "25px"; 
    document.getElementById("open").style.width= "60px"; 
    document.getElementById("image").style.height= "40px"; 
    document.getElementById("image").style.width= "40px"; 
    document.getElementById("image").style.paddingBottom= "6px"; 
    document.getElementById("open").style.animation= "none"; 
    // console.log("hi");
}

const [val,setVal]= useState("")

  const search = (e)=>{
    e.preventDefault()
    console.log("val is "+ val)
    Axios.get("http://localhost:3002/search_allproducts/"+val)
    .then((response)=>{
      // console.log(response.data.result)
      setProducts(response.data.result)
    })
  }
  const [shps,showShops]= useState([]);

const shops = () =>{
  Axios.get("http://localhost:3002/allshops")
  .then((response)=>{
      showShops(response.data.result)
     console.log(response.data.result)
      // card_display(prod)
    })
    
}

  const setShopId = (shopid)=> {
    // console.log("shop "+ shopid)
    localStorage.setItem("allshop_shopid", shopid)
    navigate("/allshops")
  }
const [sel,setsel]= useState("default")
  return (
    <div>
      {/* <Link to="/allshops" style={{textDecoration:"none",color:"brown", padding:"5px 5px",float:"right", border:"1px solid brown",marginRight:"40px",fontSize:"20px", backgroundColor:"#c1859133"}}>
      View all shops</Link> */}
      <div>
        

      
      <Form className="d-flex" style={{width:"60%",marginLeft:"15%",marginTop:"10px"}} onSubmit={search}>
      <select value={sel} onChange={(e)=>{setShopId(e.target.value);setsel()}} style={{borderColor:"rgb(192 94 56 / 57%)" ,backgroundColor:"rgb(191 141 151 / 8%)"}}>
              <option value="default" disabled hidden>Shops in ShopHunt</option>
            {shps.map((shp =>
              <option  value = {shp.shop_id}>
              {shp.shop_name}
              </option>
            ))}
            </select>
        <FormControl type="search"  value={val} onChange={(e)=>{setVal(e.target.value)}} placeholder="Search for products..." style={{height:"40px",borderColor:"rgb(192 94 56 / 47%)"}} className="me-2" aria-label="Search" />
        <Button id='searchbutton' style={{margin:"0px", color:"rgb(192 94 56)", borderColor:"rgb(192 94 56)",backgroundColor:"white"}}><FaSearch/></Button>
      </Form>

          

        {/* <input type="search"  value={val} onChange={(e)=>{setVal(e.target.value)}} placeholder="Search" className="me-2" aria-label="Search"/>
        <Button variant="outline-success" onClick={()=>search()}>Search</Button> */}

      </div>
<div class="grid" style={{position: "relative", minHeight: "650px"}}><br></br>
      <div style={{fontFamily:"serif",fontWeight: "bold", fontSize:"24px", borderRadius:"25px" }}>Showing Results for "{localStorage.getItem("item")}" ({prods.length})
        <Button variant='light' onClick={refreshPage} style={{marginLeft:"0px",fontSize:"15px", backgroundColor:"whitesmoke",color:"black",border:"1px solid black"}}>Reload</Button>
      </div>
      {/* <Container className='p-4'> */}
        <Row xs={2} md={4} className="g-4" style={{marginLeft:"30px", marginRight:"30px"}}>
        {prods.map((prod=>
          <Col>
            <Card key={prod.pid} className="box" style={{backgroundColor:"rgb(238 190 64 / 17%)",border: "1px solid #82837f73",marginBottom:"0px",paddingBotton:"0px"}}>
              {/* <div style={{display:"flex",justifyContent:"center", alignItems:"center"}}> */}
              <Link to="/productdetail" onClick={()=>setProd(prod)}style={{textDecoration:"none",color:"black"}}>
            <Card.Img  variant="top" src={prod.img} /></Link>
            {/* </div> */}
            {/* <Card.Body > */}
              {/* <div class="card-text-body" > */}
              <Card.Body>
              <Link to="/productdetail" onClick={()=>setProd(prod)}style={{textDecoration:"none",color:"black"}}>
                
              <Card.Title>{prod.p_name}</Card.Title></Link>
              
            <Card.Subtitle>
                <Col md={8}>{prod.subcatg_name}</Col>
              </Card.Subtitle>
              <Card.Subtitle style={{marginTop:"10px"}}>Sold by {prod.shop_name}</Card.Subtitle>
            <Card.Text>
            <Row md={2}  style={{margin:"2px"}}>
            <Col>₹{prod.price}</Col>
            <Col md={{offset: -2}}><Button disabled={disabled} onClick={()=>negotiate(prod)} style={{backgroundColor:"rgb(93 56 54)",border:"none",fontSize:"19px"}}>Negotiate</Button></Col>
            </Row>
              
            <Card.Body className='last_section' style={{marginTop: "0px"}}>
            <Button disabled={disabled} style={{backgroundColor:"#c05e38", border: "none"}}>Buy Now</Button>
            <Button disabled={disabled} onClick={()=>addtoCart(prod)} style={{backgroundColor:"#e07b3c"}}>Add to Cart</Button>
            </Card.Body>
            </Card.Text>
            
              {/* </div> */}
            </Card.Body>
            </Card>
          </Col>))}
          </Row>
      {/* </Container> */}
      
    </div>
    </div>
    
  )
}

export default DisplayProduct