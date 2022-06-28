import React, { useEffect, useState } from 'react'
import Axios from 'axios'
import {Link } from "react-router-dom"
import '../styles/Single_shop_prods.css'
import { BiUserCircle, BiRupee } from "react-icons/bi";
import { FaPlus, FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
// import { BsHeart, BsHeartFill } from "react-icons/bs";
// import Table from 'react-bootstrap/Table'
import {Container,Row ,Card, Col, Button, Navbar,Form,FormControl} from 'react-bootstrap';
import Category from './Category'
import { FaSearch } from "react-icons/fa";

function Products() {
  let [adm_name , getAdmin] = useState("");
  let [shop_name , getShopName] = useState("");
  let [products , showProducts] = useState([]);

  useEffect( () =>{
    getAdminInfo(); 
    getProducts();
  } , [] )

  const getAdminInfo = ()=> {
    let shopid = localStorage.getItem('shop_ID')
    Axios.get("http://localhost:3002/vendor/getshopadminfo/"+shopid)
    .then((response)=>{
      // console.log(response);
      let shopinfo = response.data.result[0];
      let username = shopinfo.username;
      let shopname = shopinfo.shop_name;
      getAdmin(username);
      getShopName(shopname)
      // console.log(username);
    })
  }

  const getProducts = () =>{
    let shopid = localStorage.getItem('shop_ID');
    Axios.get("http://localhost:3002/vendor/getproducts/"+shopid)
    .then((response)=>{
      let resp= response.data.result;
      console.log(resp);
      showProducts(resp);
    })
  }
  const setProd = (prod)=> {
    localStorage.setItem('product_Details',JSON.stringify(prod));
  }
  const deleteProd = (product)=> {
    let prodid = product.pid;
   if( window.confirm('Are you sure want to delete this item?')){
    Axios.delete("http://localhost:3002/vendor/deleteproduct/"+prodid)
    .then((response)=>{
      window.location.reload(false);
      products = products.filter(p => p !== product);
    })
   }
  }
  const [val,setVal]= useState("")

  const searchshoprod = (e)=>{
    e.preventDefault()
    console.log("val is "+ val)
    var shopid= localStorage.getItem("shop_ID")
    Axios.get("http://localhost:3002/search_shopprod/"+val+"/"+shopid)
    .then((response)=>{
      // console.log(response.data.result)
      showProducts(response.data.result)
    })
  }

  return (
    <div>
      
      {/* <div  style={{float:'right'}}>
      <BiUserCircle style={{fontSize: '30px'}} />
      <span style={{ fontSize: '20px' ,paddingRight: '50px'}}>{adm_name}</span>
      </div> */}
      <Category/>
      
      <div >
        <div id='shp' style={{paddingTop:"1%"}}>{shop_name}</div>
      </div>
      <Form className="d-flex" style={{width:"50%",marginLeft:"25%",marginTop:"10px"}} onSubmit={searchshoprod}>
        <FormControl type="search"  value={val} onChange={(e)=>{setVal(e.target.value)}} placeholder="Search for products in your shop..." style={{height:"40px",borderColor:"rgb(192 94 56 / 47%)"}} className="me-2" aria-label="Search" />
        <Button id='searchbutton' style={{margin:"0px", color:"rgb(192 94 56)", borderColor:"rgb(192 94 56)",backgroundColor:"white"}}><FaSearch/></Button>
      </Form>
      <br></br>
      <div style={{paddingLeft:"25%",marginRight:"30%"}}>
      <div className="d-grid">
        <Button  variant="success" size="lg" style={{backgroundColor:"#026802"}}><FaPlus style={{marginBottom:"6px",marginRight:"10px"}}/>
        <Link style={{color:'white',textDecoration:'none'}} to = "/addproduct">ADD PRODUCT</Link>
        </Button>
      </div>
      </div>
      <br></br>
      {/* <Table striped bordered hover responsive style={{width:"80%", marginLeft:"10%"}}>
  <thead>
    <tr>
      <th>product name</th>
      <th>price</th>
    </tr>
  </thead>
  <tbody>
    
    {products.map((product=>
      <tr key={product.pid}>
      <td>{product.p_name}</td>
      <td>{product.price}</td>
    </tr>
    ))}
    
  </tbody>
</Table> */}

        <Row xs={2} md={4} className="g-4" style={{marginLeft:"30px", marginRight:"30px"}}>
  {products.map((product => 
    <Col>
      <Card key={product.pid}  className="box" style={{backgroundColor:"rgb(238 190 64 / 17%)",border: "1px solid #82837f73"}}>
        <Link to="/productdetail" onClick={()=>setProd(product)}style={{textDecoration:"none",color:"black"}}>
        <Card.Img variant="top" src={product.img}  /></Link>
        <Card.Body>
          <Card.Title style={{fontSize:"20px"}}>{product.p_name}</Card.Title>
          <Card.Subtitle>{product.brand}</Card.Subtitle>
          <Card.Text>
          <div className="text">
            
                    <div className="price" style={{paddingTop:"2%",paddingRight:"10%"}}>
                        <h5 style={{fontWeight:'bold'}}><BiRupee style={{fontSize: '23px'}}/>{product.price}</h5>
                    </div>
                    <Row>
                      <Col md={5}><Link to='/editproduct' onClick={()=>setProd(product)} style={{textDecoration:"none"}}><Button className='butto' style={{backgroundColor:"rgb(76, 132, 76)",border:"none",fontSize:"20px"}}><FaEdit/>&nbsp;EDIT</Button></Link></Col>
                      <Col md={2}></Col>
                      <Col md={5}><Button className='butto' onClick={()=>deleteProd(product)} style={{backgroundColor:"#de3131",border:"none",fontSize:"20px"}}><MdDelete/>&nbsp;DELETE</Button></Col>
                    </Row>
                </div>
          </Card.Text>
        </Card.Body>
        
      </Card>
    </Col>
  ))}
</Row>


</div>
  )
}

export default Products
