const express = require("express");
const body_parser = require('body-parser');
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt")

const app = express();
app.use(cors());
app.use(body_parser.json());

const userReg = require("./Userindex")();//for conecting with index.js
app.use("/handleSubmits", userReg); 

app.use(express.json());
const chat_bot = require("./new")();
app.use("/webhook",chat_bot);

const test_bot = require("./chat")();
app.use("/chat_in",test_bot);

const getProd = require("./cust_getproduct")();
app.use("/getproducts",getProd);

const vendorfns = require("./vendor_fns")();
app.use("/vendor",vendorfns);

const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "",
    database: "price_neg"
})

app.post('/handleSubmit', async(req, res) =>{//here handle submit given to indicate index.js
    
    console.log(req.body);
    const adm_name=req.body.adm_name;
    const shop_name=req.body.shop_name;
    const shop_addr=req.body.shop_addr;
    const email=req.body.email;
    const phno=req.body.phno;
    const username=req.body.username;
    const salt=await bcrypt.genSalt(10);
    const password=await bcrypt.hash(req.body.password,salt);
    // bcrypt.hash(password,saltRounds,fuction(err,hash){
    // // var hashedPassword = hash
    
    db.query("INSERT INTO shop(adm_name,shop_name,shop_addr,email,phno,username,password) VALUE (?,?,?,?,?,?,?)",
    [adm_name,shop_name,shop_addr,email,phno,username,password],
    (err,result)=>{
        console.log(result);
        if(err){
            return console.log(err);
        }
        res.send({result});
    }
    ); 
});  
// });

app.post('/login', async(req, res) =>{
    const username = req.body.username;
    const password=req.body.password;
  
    
    db.query("SELECT * FROM shop WHERE username = ? ",[username],
    async(err,result)=>{


        if(err){
            res.send({err: err});
        }
       
        if (result.length > 0)
         { const validp=  await bcrypt.compare(password,result[0].password);   
            
            if(validp==true)
              {
                console.log("---------> Login Successful");
                // res.send({ message: "Successful login" });
                shopid= result[0].shop_id;
                res.status(200).send({shopid}); 
                
              } 
       else {
         
            res.send({ message: "Password does not match" });
          }
        }
        else
        {
            res.send({ message: "User doesn't exist" });
        }
}
);
        
      
      
    });
        
    app.post('/loginnewshop',async(req,res)=>{
        const salt=await bcrypt.genSalt(10);
          console.log(req.body);
          
          const emails=req.body.email;
          const password=await bcrypt.hash(req.body.password,salt);
          console.log(password);
          var sql="UPDATE shop SET  password = ?  WHERE email= ?"
          db.query(sql,[password,emails],
          async(err,result)=>{
            // console.log(result[0]);
        db.query("SELECT * FROM shop WHERE email = ? ",[emails],
        async(err,result)=>{
          console.log(result[0]);
          if (result.length > 0)
             {
                if(password==result[0].password)
                 {res.send({ message: "password updated" });}
             
                }
             
    
          });
          
          console.log("successfully updated");
           
          
            if(err){
              return console.log(err);
            }
          
          }
    
          );
        });
    
        app.post('/forgotpasswordshop',async(req, res) =>{
          
            const email = req.body.email;
            const recoveryque=req.body.recoveryque;
        
            db.query("SELECT * FROM shop WHERE email = ? && recoveryque = ?",[email,recoveryque],
            async(err,result)=>{
             
              console.log(result);
                if(err){
                  return console.log(err);
                }
               
                if (result.length > 0)
                { shop_name= result[0].shop_name;
                    adm_name=result[0].adm_name;
                  
                  shop_id=result[0].shop_id;
                   emails=result[0].email;
                  phno=result[0].phno;
                  shop_addr=result[0].shop_addr;
                  recoveryques=result[0].recoveryque;
                  
                  res.send({shop_name,adm_name,shop_id,emails,phno,shop_addr,recoveryques,message: "authorised access" });
                  console.log("valid mail");
                  // res.send({result});
                }
               else{
                 res.send({ message: "unauthorised access" });
               }
           } );
              
            
            
              });
app.post('/displayProd',(req,res)=>{
    console.log("helloooooooooooooooooooooooooo")
    const item = req.body.item;
    console.log(item);
    
    if(item=="products" || item=="product"){
        db.query("SELECT * FROM products p, category c, subcategory s, shop o WHERE ( p.catg_id = c.catg_id AND p.subcatg_id = s.subcatg_id and p.shop_id = o.shop_id) GROUP BY p.p_name",
    (err,result)=>{
        // if(err){
        //     res.send({err: err});
        // }
        // else{
            console.log(result[1])
            res.send(result)
        
    })
    }
    else{
        db.query("SELECT * FROM products p, category c, subcategory s WHERE ( p.catg_id = c.catg_id AND p.subcatg_id = s.subcatg_id ) AND( p.p_name LIKE '%"+item+"%' OR c.catg_name LIKE '%"+item+"%' OR s.subcatg_name LIKE '%"+item+"%' )",
    (err,result)=>{
        if(err){
            res.send({err: err});
        }
        else{
            console.log(result.length)
            res.send(result)
        }
    })
    }
    

})
app.post('/alreadyincart',(req,res)=>{
    var pid = req.body.pid;
    var userid = req.body.userid;
   db.query("SELECT * FROM cart WHERE pid = ? and user_id =?",[pid,userid],
   (err,result)=>{
       if(result.length>0){
           res.send({msg:"already in cart"})
       }
       else{
           res.send({msg:"item not in cart"})
       }
   })
})
app.post('/cart',(req,res)=>{
    const command = req.body.command;
    var time;
    console.log("command " + command)
    db.query("SELECT timediff(now(),arrival) from cart where timediff(now(),arrival)> '00:05:00'",(err,result)=>{
        if(err){
            return console.log(err);
        }
        for(i=0;i<result.length;i++){

        }
    })
    
    if(command=="insert"){
        const pid = req.body.pid;
        const user_id = req.body.user_id;
        const price = req.body.price;
        const qnty = req.body.qnty;
        const negotiated = req.body.negotiated;
        // console.log(req.body); 
    db.query("SELECT * from cart where pid = ? and user_id = ?",[pid,user_id],(err,result)=>{
        if(err){
            return console.log(err);
        }
        else if(result.length==0){
            db.query("INSERT INTO cart(user_id,pid,qty,price,negotiated,arrival) VALUE(?,?,?,?,?,now())",[user_id,pid,qnty,price,negotiated],
          (err,result)=>{
        // console.log(result);
          if(err){
            return console.log(err);
        }
        if(result){
            res.send(result);
        }
        
        })
        }
        else if(result.length>0 && result[0].negotiated == 0){
            console.log(result)
            db.query("SELECT now()",(err,result)=>{
                // if(err){
                //     return console.log(err);
                // }
                console.log(result);
            })
            db.query("UPDATE cart set qty = (qty+?), arrival= now() where pid = ? and user_id = ?",[qnty,pid,user_id],
          (err,result)=>{
        // console.log(result);
        if(err){
            return console.log(err);
        }
        })
        res.send({msg:"Item already in cart"})
        } 
        else if (result.length>0 && result[0].negotiated){
            console.log(result[0].negotiated)
            res.send({msg:"Negotiated item already in cart"})
        }
    })
   }
   if(command=="display"){
    const user_id = req.body.user_id;
    const negotiated = req.body.negotiated;
    if(negotiated == 0){
        db.query("SELECT * from products p, cart c, users u, shop s, category t, subcategory b where u.user_id = c.user_id and c.pid=p.pid and c.user_id = ? and c.negotiated=0 and p.shop_id=s.shop_id and p.catg_id = t.catg_id and p.subcatg_id = b.subcatg_id ORDER BY c.cart_id DESC",[user_id],
        (err,result)=>{
        if(err){
            return console.log(err)
        }
        // console.log(result)
        res.send(result)
    })
    }
    else if(negotiated == 1){
        db.query("SELECT * from products p, cart c, users u, shop s, category t, subcategory b where u.user_id = c.user_id and c.pid=p.pid and c.user_id = ? and c.negotiated=1  and p.shop_id=s.shop_id and p.catg_id =t.catg_id and p.subcatg_id = b.subcatg_id ORDER BY c.cart_id DESC",[user_id],
    (err,result)=>{
        if(err){
            return console.log(err)
        }
        // console.log(result)
        res.send(result)
    })
    }
    
   }

})

app.post('/removetocart',(req,res)=>{
    const cart_id = req.body.cart_id;
    // console.log(req.body)
    db.query("DELETE FROM cart where cart_id = ?",[cart_id],(err,result)=>{
        if(err){
            return console.log(err)
        }
        // console.log(result)
        res.send(result)
    })
})

app.post('/total_price',(req,res)=>{
    const user_id = req.body.user_id;
    db.query("SELECT SUM(qty*price) as total from cart c where c.user_id= ?",[user_id],(err,result)=>{
        if(err){
            return console.log(err)
        }
        // console.log(result)
        res.send(result)
    })
})

// app.post('/qtyChange',(req,res)=>{
//     const change = req.body.change;
//     const cart_id = req.body.cart_id
//     const user_id = req.body.user_id
//     var time
//     if(change=='increase'){
        
//         db.query("UPDATE cart SET qty=qty+1, arrival=now() where cart_id=? and user_id=?",[cart_id,user_id],(err,result)=>{
//             if(err){
//                 return console.log(err)
//             }
//             res.send(result)
//         })
//     }
//     else if(change=='decrease'){
//         db.query("UPDATE cart SET qty=qty-1, arrival=now() where cart_id=? and user_id=?",[cart_id,user_id],(err,result)=>{
//             if(err){
//                 return console.log(err)
//             }
//             res.send(result)
//         })
//     }

// })

app.post('/otherSeller',(req,res)=>{
    const pid = req.body.pid;
    const p_name = req.body.p_name;

    db.query('select * from products p, shop s, category c, subcategory b where p.shop_id=s.shop_id and p.catg_id = c.catg_id and p.subcatg_id = b.subcatg_id and p.pid!=? and p.p_name LIKE "%'+[p_name ]+'%"',
    [pid],(err,result)=>{
        if(err){
            return console.log(err)
        }
        console.log(result)
        res.send(result)
    })
})

app.post('/cart_count',(req,res)=>{
    const user_id =req.body.user_id;
    db.query("SELECT count(*) as count from cart where user_id=?",[user_id],(err,result)=>{
        if(err){
            return console.log(err)
        }
        console.log(result)
        res.send(result)
    })

    
})

app.post('/edit_profile',(req,res)=>{
    console.log("edit")
    
    const command = req.body.command;
    if(command=="display_user"){
        const user_id =req.body.user_id;
        db.query("SELECT first_name,middle_name,last_name,home_addr,email,phno from users where user_id=?",[user_id],(err,result)=>{
            if(err){
                return console.log(err)
            }
            console.log(result)
            res.send(result)  
        })
    }

    if(command=="display_shop"){
        const shop_ID =req.body.shop_ID;
        db.query("SELECT shop_name,adm_name,shop_addr,email,phno,username from shop where shop_ID=?",[shop_ID],(err,result)=>{
            if(err){
                return console.log(err)
            }
            console.log(result)
            res.send(result)  
        })
    }
    if(command=="update_user"){
        console.log(req.body)
        const user_id = req.body.user_id;
        const fname = req.body.fname
        const mname = req.body.mname
        const lname = req.body.lname
        const addr = req.body.addr
        const phno = req.body.phno

        if(fname!=''){
            db.query("update users set first_name=? where user_id=?",[fname,user_id],(err,result)=>{
                if(err){
                    console.log(err)
                }
            })
        }
        if(mname!=''){
            db.query("update users set middle_name=? where user_id=?",[mname,user_id],(err,result)=>{
                if(err){
                    console.log(err)
                }
            })
        }
        if(lname!=''){
            db.query("update users set last_name=? where user_id=?",[lname,user_id],(err,result)=>{
                if(err){
                    console.log(err)
                }
            })
        }
        if(addr!=''){
            db.query("update users set home_addr=? where user_id=?",[addr,user_id],(err,result)=>{
                if(err){
                    console.log(err)
                }
            })
        }
        if(phno!=''){
            db.query("update users set phno=? where user_id=?",[phno,user_id],(err,result)=>{
                if(err){
                    console.log(err)
                }
            })
        }
        db.query("select * from users where user_id=?",[user_id],(err,result)=>{
            if(err){
                console.log(err)
            }
            res.send(result)
        })
    }

    if(command=="update_shop"){
        console.log(req.body)
        const shop_ID = req.body.shop_ID;
        const sname = req.body.sname
        const name = req.body.name
        // const uname = req.body.uname
        const addr = req.body.addr
        const phno = req.body.phno
        let shop_ID1 = req.body.shop_ID;
        let sname1 = req.body.sname
        let name1 = req.body.name
        // const uname = req.body.uname
        let addr1 = req.body.addr
        let phno1 = req.body.phno
        db.query("select shop_name,adm_name,shop_addr,phno from shop where shop_ID=?",[shop_ID],(err,result)=>{
            if(err){
                console.log(err)
            }
            console.log(result.data)
        })

        if(sname!=''){
            db.query("update shop set shop_name=? where shop_ID=?",[sname,shop_ID],(err,result)=>{
                if(err){
                    console.log(err)
                }
            })
        }
        if(name!=''){
            db.query("update users set adm_name=? where shop_ID=?",[name,shop_ID],(err,result)=>{
                if(err){
                    console.log(err)
                }
            })
        }
        // if(lname!=''){
        //     db.query("update user set username=? where shop_ID=?",[uname,shop_ID],(err,result)=>{
        //         if(err){
        //             console.log(err)
        //         }
        //     })
        // }
        if(addr!=''){
            db.query("update users set shop_addr=? where shop_ID=?",[addr,shop_ID],(err,result)=>{
                if(err){
                    console.log(err)
                }
            })
        }
        if(phno!=''){
            db.query("update shop set phno=? where shop_ID=?",[phno,shop_ID],(err,result)=>{
                if(err){
                    console.log(err)
                }
            })
        }
        db.query("select * from shop where shop_ID=?",[shop_ID],(err,result)=>{
            if(err){
                console.log(err)
            }
            res.send(result)
        })
    }
    
})
app.put('/qtySelect',(req,res)=>{
    const cart_id = req.body.cart_id
    const user_id = req.body.user_id
    const qnty = req.body.qnty

    db.query('UPDATE cart SET qty=? WHERE cart_id=? and user_id=?',
    [qnty,cart_id,user_id],(err,result)=>{
        if(err){
            return console.log(err)
        }
        console.log(result)
        res.send(result)
    })
})
app.get("/search_allproducts/:val",(req,res) =>{
    var searchval = req.params.val;
    console.log("searchval " +searchval)
    db.query("SELECT * FROM products p, shop s WHERE p.shop_id=s.shop_id and p.p_name LIKE'%"+searchval+"%'",
        (err,result)=>{
            // console.log(result);
            if(err){
                return console.log(err);
            }
           res.send({result});
        }
        ); 
})
app.get("/search_shopprod/:val/:shopid",(req,res) =>{
    var searchval = req.params.val;
    var shopid = req.params.shopid;
    console.log("shopid " +shopid)
    db.query("SELECT * FROM products WHERE shop_id = ? AND p_name LIKE'%"+searchval+"%'",[shopid],
        (err,result)=>{
            // console.log(result);
            if(err){
                return console.log(err);
            }
           res.send({result});
        }
        ); 
})
app.post("/search_inshop",(req,res) =>{
    var searchval = req.body.val;
    var shopid = req.body.shopid;
    console.log("searchval " +searchval)
    db.query("SELECT * FROM products WHERE shop_id=? and p_name LIKE'%"+searchval+"%'",[shopid],
        (err,result)=>{
            // console.log(result);
            if(err){
                return console.log(err);
            }
           res.send({result});
        }
        ); 
})
app.get("/allshops",(req,res) =>{
   
    db.query("SELECT * FROM shop",
        (err,result)=>{
            // console.log(result);
            if(err){
                return console.log(err);
            }
           res.send({result});
        }
        ); 
})
app.post("/shopProd",(req,res) =>{
   var shopid = req.body.shopid;
    db.query("SELECT * FROM products p, shop s WHERE p.shop_id=s.shop_id and p.shop_id=?",[shopid],
        (err,result)=>{
            console.log(result);
            if(err){
                return console.log(err);
            }
           res.send({result});
        }
        ); 
})
app.post("/getshopd",(req,res) =>{
    var shopid = req.body.shopid;
     db.query("SELECT * FROM shop WHERE shop_id=?",[shopid],
         (err,result)=>{
             console.log(result);
             if(err){
                 return console.log(err);
             }
            res.send({result});
         }
         ); 
 })
// app.put("/negpriceupdate",(req,res) =>{
//     var cartid = req.body.cart_id;
//     var userid = req.body.user_id;
//     var price = req.body.price;
//     db.query("UPDATE cart SET price=? WHERE cart_id=? and user_id=?", 
//         [price,cartid,userid],
//         (err,result)=>{
//             console.log(result);
//             if(err){
//                 return console.log(err);
//             }
//            res.send({price});
//         }
//         ); 
// })


const port = process.env.PORT || 3002;
app.listen(port,()=>{console.log("Server Ready at "+port)});