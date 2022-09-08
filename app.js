const { RPCAgent, setLogLevel } = require("chia-agent");
const dataChk = require("chia-agent/api/rpc");
const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors')  //use this

const moment = require("moment")
const app = express();
const port = 8007;
app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const jwt = require('jsonwebtoken');
const CryptoJS = require("crypto-js");


app.use(cors())
const mysql = require('mysql');
const con = mysql.createConnection({
  host: '3.108.64.60',
  user: "esp",
  password: "Espsoft123#",
  database: "littlelambocoin",
})
con.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("connect");
  }
})



async function main() {

  setLogLevel("debug"); // none/error/warning/info/debug is available.

 const agent = new RPCAgent({ service: "wallet", configPath: "/home/ubantu/.littlelambocoin/mainnet/config/config.yaml" });
// const agent = new RPCAgent({ service: "wallet", configPath: "C:/Users/hp/.littlelambocoin/mainnet/config/config.yaml" });



//  let catList = await dataChk.get_cat_list(agent);
//     console.log(catList)
    // let catListName = await dataChk.cat_asset_id_to_name(agent,{asset_id:"6d95dae356e32a71db5ddcb42224754a02524c615c5fc35f568c2af04774e589"});
    // console.log(catListName)
    // let Wallet = await dataChk.get_wallet_balance(agent, { "wallet_id": 1 });
    // console.log(Wallet)
    // let create_new_wallet = await dataChk.create_new_wallet(agent, {  "wallet_type": "cat_wallet" ,"name":"the new cat" , mode:'existing', asset_id:'6d95dae356e32a71db5ddcb42224754a02524c615c5fc35f568c2af04774e589'});
    // console.log(create_new_wallet);

    // let create_offers = await dataChk.create_offer_for_ids(agent,
    //   //  {offer:{1:1}, requests:{1:0.0}, filepath:"/home/ubantu/Kamlesh/llc/offer"}
    //   {
    //     "offer": {
    //         "1": 10000000000000,
    //         "1": 1000
    //     },
    //     "fee": 0
    // }
    //    );
    // console.log(create_offers);
//  let sendTransaction = await dataChk.send_transaction(agent, { wallet_id: '1', amount: 1, fee: 0, address: "llc12frfwaj5xpgnhnwsweq7kcclgtjtmudhj3q9q3tfh27elm67m5sq98577a" })
//  console.log(sendTransaction)

app.get('/getwalletbalance', async (req, res) => {
  //  let wallet_id=req.body.wallet_id;
    let Wallet = await dataChk.get_wallet_balance(agent, { "wallet_id": 1 });
    console.log(Wallet)
    if(Wallet.success==true){
      return res.status(200).send({
        success: true,
        msg: "balance fetched",
        data: Wallet.wallet_balance.confirmed_wallet_balance

      })
    }
    else{
      return res.status(200).send({
        success: false,
        msg: "balance not fetched",

      })
    }


  });
  app.post('/login', async (req, res) => {

    let email=req.body.email;
    let password =req.body.password;
    let sql = `SELECT * FROM UserLogin where email = '${email}'`;
    let hash = CryptoJS.SHA256(req.body.password).toString(CryptoJS.enc.Hex);
    console.log(hash)

    con.query(sql, async function (err, result) {
      if (err) throw err;

      if (result.length !== 0) {
        console.log("email present")
        let sql1 = `SELECT * FROM UserLogin where email = '${email}' and password = '${hash}'`;
    
        con.query(sql1, async function (err, result1) {
          if (err) throw err;
          if (result1.length !== 0) {
            console.log(result1.length !== 0)
            let sql5 = `SELECT * FROM wallet where UserId = '${result1[0].id}'`;

            con.query(sql5, async function (err, result5) {

 
              console.log(result5, "Dfklkfkg")
              if (err) throw err;

              if (result5[0].FingerPrint !== "") {


                let login = await dataChk.log_in(agent, { "fingerprint":(parseInt(result5[0].FingerPrint))});
                console.log(parseInt(result[0].FingerPrint), login)
          console.log(result5.length, 'legth')
                return res.status(200).send({
                  success: true,
                  msg: "user already into data base redirect to homepage",
                  data:result5
                  
                  
        
                })
              }
              else{


                return res.status(200).send({
                  success: true,
                  msg: "redirected to select wallet",
                  data:result1
        
                })
              }
            
        
            });
        
            // console.log("password not  present")

            // return res.status(200).send({
            //   success: true,
            //   msg: "Login sucess",
            //   data:result1
              
    
            // })
          }
          else{
            return res.status(200).send({
              success: false,
              msg: "password not matched",
    
            })
          }
        
    
        });
    
    
      }
      else{
        return res.status(200).send({
          success: false,
          msg: "Email not registered",
         

        })
      }
    

    });



  });

  app.post('/importwallet', async (req, res) => {
  let UserId= req.body.userId;
    let mnemonic = req.body.mnemonic;
    
    let array1 = mnemonic.toString().split(',');
    console.log(array1, "array converted");

    console.log(mnemonic, "user enetered")
    let getPrivateKey = {
      mnemonic: array1,
      success: true
    }
    let sql = `SELECT * FROM wallet where PrivateKey = '${mnemonic}'`;
    con.query(sql, async function (err, result) {
console.log(result,'545555')
      if (err) throw err;


      if (result.length !== 0) {
       

        const sql2 = `UPDATE wallet SET FingerPrint ='${result[0].FingerPrint}',wallet_Address ='${result[0].wallet_Address}', PrivateKey='${result[0].PrivateKey}' , Name='${'Account 1'}',  WHERE UserId='${UserId}' `;
        con.query(sql2,  async function (err, result1) {
          if (err) throw err;
       console.log(result1, "ressss1111111")
       if(result1){

        console.log("wallet imported added to user id")
        let login = await dataChk.log_in(agent, { "fingerprint":parseInt(result[0].FingerPrint)});
            console.log(parseInt(result[0].FingerPrint), login)
            return res.status(200).send({
              success: true,
              msg: "wallet Imported",
              data: result[0]
            })
        
       }else{
        return res.status(200).send({
          success: false,
          msg: "new wallet not imported",

        })
       }

        });
            

   
      }
      
      else {

        
        let addKeyToWallet = await dataChk.add_key(agent, getPrivateKey);

        console.log(getPrivateKey, addKeyToWallet, "addddddddddd")
        let getFingerPrint = await dataChk.get_private_key(agent, { "fingerprint": addKeyToWallet.fingerprint });
        let getAddress = await dataChk.get_next_address(agent, { "fingerprint": addKeyToWallet.fingerprint, "wallet_id": 1, "new_address": false });

        let login = await dataChk.log_in(agent, { "fingerprint":getFingerPrint.private_key.fingerprint});
         console.log(getFingerPrint.private_key.fingerprint,"kmfkkg",login)
        // const sql2 = `INSERT INTO wallet( PrivateKey, FingerPrint, wallet_Address)  VALUES('${getPrivateKey.mnemonic}','${getFingerPrint.private_key.fingerprint}', '${getAddress.address}')`;
        const sql2=`UPDATE wallet SET FingerPrint ='${getFingerPrint.private_key.fingerprint}',wallet_Address ='${getAddress.address}', PrivateKey='${getPrivateKey.mnemonic}',Name='${'Account 1'}', WHERE UserId='${UserId}' `
        con.query(sql2,  async function (err, result1) {
          if (err) throw err;
     
       if(result1){
        return res.status(200).send({
          success: true,
          msg: "new wallet Imported",
          data: {FingerPrint:getFingerPrint.private_key.fingerprint, address:getAddress.address}
        })
       }else{
        return res.status(200).send({
          success: false,
          msg: "new wallet not imported",

        })
       }

        });


     


      }


    });




  });

  app.get('/getassets', async (req, res) => {

    let catList = await dataChk.get_cat_list(agent);
    console.log(catList)

    return res.status(200).send({
      success: false,
      msg: "list found",
      data: catList

    })

  });

  app.post('/getAllAccounts', async (req, res) => {
    let userId= req.body.userId;
    console.log(userId, "=======")
    let sql = `SELECT * FROM wallet where UserId = '${userId}'`;
    con.query(sql, async function (err, result) {
console.log(result,'545555')
      if (err) throw err;

      if(result.length!==0){
        console.log(result.length!==0)
        return res.status(200).send({
          success: true,
          msg: "list found",
          data: result
    
        })
      
      }
      else{
        return res.status(200).send({
          success: false,
          msg: "list not found",
          data: result
    
        })
      
      }

    });


    

  });


  app.post("/sendtransactions", async (req, res) => {
    let Amount = parseInt(req.body.amount);
    let fee = parseInt(req.body.fee);
    let ReciverAddress = req.body.address;
    let sendTransaction = await dataChk.send_transaction(agent, { wallet_id: '1', amount: Amount, fee: fee, address: ReciverAddress })
    console.log(sendTransaction)
  if(sendTransaction.success){
    return res.status(200).send({
      success: true,
      msg: "sucessfully transfered",
      data: sendTransaction

    })

  }
  else{
    return res.status(200).send({
      success: false,
      msg: "not transferred",
      data: sendTransaction

    })

  }

  }
  )
  app.get('/getwalletTransactions', async (req, res) => {
    let Wallet = await dataChk.get_transactions(agent, { wallet_id: 1 });
    console.log(Wallet)

    return res.status(200).send({
      success: true,
      msg: "get transactions",
      data: Wallet

    })


  });

  app.post('/switchaccount', async (req, res) => {
    let fingerprint=req.body.fingerprint;
    let login = await dataChk.log_in(agent, { "fingerprint": parseInt(fingerprint)});
          console.log(login)

    return res.status(200).send({
      success: true,
      msg: "accoun switched",
      data: login

    })


  });

  app.post("/signup", async (req, res) => {
    let email=req.body.email
    let password = req.body.password;
    let confirm_password = req.body.confirm_password;
    let hash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
    if (password == confirm_password) {
      let sql3 = `SELECT * FROM UserLogin where email = '${email}'`;

      con.query(sql3, async function (err, result3) {
        if (err) throw err;

        if (result3.length !== 0) {

          return res.status(200).send({
            success: true,
            msg: "Email already Used try to login",
            data: result3

          })
        }
        else{
    
          let sql = `INSERT INTO UserLogin(password, email)  VALUES('${hash}', '${email}')`;
          con.query(sql, async function (err, result) {
  
         
            if (err) throw err;

            if(result){
              console.log(result.insertId,"sdfdg")
              let sql1 = `INSERT INTO wallet(UserId)  VALUES('${result.insertId}')`;

              con.query(sql1, async function (err, result1) {
                return res.status(200).send({
                  success: true,
                  msg: "sucessfully user id created",
                  data:result
    
    
                })
    
              })
            }
           


          });
        }


      });


    }
    else {
      return res.status(200).send({
        success: false,
        msg: "password and conform password not matched ",


      })
    }


  }


  )
  app.post('/matchPhrase', async (req, res) => {
    let UserId= req.body.userId;
    let mnemonic = req.body.mnemonic;
    console.log(mnemonic)
    let getPrivateKey = {
      mnemonic: mnemonic,
      success: true
    }

    console.log(getPrivateKey, "llllllll")


      let addKeyToWallet = await dataChk.add_key(agent, getPrivateKey);
      console.log(addKeyToWallet, "addd")
          let getFingerPrint = await dataChk.get_private_key(agent, { "fingerprint": addKeyToWallet.fingerprint });
          let getAddress = await dataChk.get_next_address(agent, { "fingerprint": addKeyToWallet.fingerprint, "wallet_id": 1, "new_address": false });
          let login = await dataChk.log_in(agent, { "fingerprint": getFingerPrint.private_key.fingerprint });
          console.log(login)
          console.log(getFingerPrint, "address")

          const sql2 = `UPDATE wallet SET PrivateKey='${getPrivateKey.mnemonic}', FingerPrint ='${getFingerPrint.private_key.fingerprint}',wallet_Address ='${getAddress.address}',Name='${'Account 1'}', WHERE UserId='${UserId}' `;
          console.log(getPrivateKey.mnemonic,getFingerPrint.private_key.fingerprint,getAddress.address ,UserId , "database")
          con.query(sql2, function (err, result1) {

            console.log(result1, 'dcdfdfdd')
 if(result1){
  return res.status(200).send({
    success: true,
    msg: "wallet generated",
    data: {FingerPrint:getFingerPrint.private_key.fingerprint, address:getAddress.address}

  })

 }

 else{
  return res.status(200).send({
    success: false,
    msg: "wallet not generated",
    data: result1

  })
 }

          
          });
   





  }










  )
  app.post('/importAnotherAcc', async (req, res) => {

    let UserId= req.body.userId;
    let mnemonic = req.body.mnemonic;
    let name=req.body.name;
    let array1 = mnemonic.toString();
    console.log(array1, "converted string ");

    let array2 = mnemonic.toString().split(",");
    console.log(array2, "array string ");
    console.log(mnemonic, "user entered ")
    let getPrivateKey = {
      mnemonic: array2,
      success: true
    }

    let sql = `SELECT * FROM wallet where PrivateKey = '${array1}'`;
    con.query(sql, async function (err, result) {
      if (err) throw err;


      if (result.length !== 0) {
       
   console.log(result.length !== 0, "data present")
     const sql2 = `INSERT INTO wallet(UserId, PrivateKey, FingerPrint, wallet_Address, Name)  VALUES( '${UserId}' ,'${result[0].PrivateKey}','${result[0].FingerPrint}', '${result[0].wallet_Address}', '${name}') `;

        // const sql2 = `UPDATE wallet SET FingerPrint ='${result[0].FingerPrint}',wallet_Address ='${result[0].wallet_Address}', PrivateKey='${result[0].PrivateKey}' WHERE UserId='${UserId}' `;
        con.query(sql2,  async function (err, result1) {
          if (err) throw err;
       if(result1.affectedRows!==0){

        console.log(result1.affectedRows!==0,"wallet imported added to user id")
        let login = await dataChk.log_in(agent, { "fingerprint":parseInt(result[0].FingerPrint)});
            return res.status(200).send({
              success: true,
              msg: "wallet Imported",
              data: result[0]
            })
        
       }else{
        return res.status(200).send({
          success: false,
          msg: "new wallet not imported",

        })
       }

        });
            

   
      }
      
      else {

        console.log("<<<<<<<<<<<<")
        console.log(getPrivateKey, "keyyyyyyyyyyyyyyyyyyyyyyyy")

        let addKeyToWallet = await dataChk.add_key(agent, getPrivateKey);
        console.log(addKeyToWallet, "add key")

        let getFingerPrint = await dataChk.get_private_key(agent, { "fingerprint": addKeyToWallet.fingerprint });
        console.log(getFingerPrint, "addget finger key")

        let getAddress = await dataChk.get_next_address(agent, { "fingerprint": addKeyToWallet.fingerprint, "wallet_id": 1, "new_address": false });

        let login = await dataChk.log_in(agent, { "fingerprint":getFingerPrint.private_key.fingerprint});
        const sql2 = `INSERT INTO wallet(UserId, PrivateKey, FingerPrint, wallet_Address, Name)  VALUES('${UserId}','${getPrivateKey.mnemonic}',  '${getFingerPrint.private_key.fingerprint}', '${getAddress.address}', '${name}')`;
        //const sql2=`UPDATE wallet SET FingerPrint ='${getFingerPrint.private_key.fingerprint}',wallet_Address ='${getAddress.address}', PrivateKey='${getPrivateKey.mnemonic}' WHERE UserId='${UserId}' `
        con.query(sql2,  async function (err, result1) {

          if (err) throw err;
     
       if(result1.affectedRows!==0){
        console.log(result1.affectedRows!==0, "final")

        return res.status(200).send({
          success: true,
          msg: "new wallet Imported",
          data: {FingerPrint:getFingerPrint.private_key.fingerprint, address:getAddress.address}
        })
       }else{
        return res.status(200).send({
          success: false,
          msg: "new wallet not imported",

        })
       }

        });


     


      }


    });


  
    });
  
  app.get('/generatemnemonic', async (req, res) => {
    let getPrivateKey = await dataChk.generate_mnemonic(agent);

    return res.status(200).send({
      success: true,
      msg: "mnemonic generated",
      data: getPrivateKey

    })


  }










  )

  app.post('/creatnewwallet', async (req, res) => {
    let UserId= req.body.userId;

          let getPrivateKey = await dataChk.generate_mnemonic(agent);
  
          let addKeyToWallet = await dataChk.add_key(agent, getPrivateKey);
          let getFingerPrint = await dataChk.get_private_key(agent, { "fingerprint": addKeyToWallet.fingerprint });
          let getAddress = await dataChk.get_next_address(agent, { "fingerprint": addKeyToWallet.fingerprint, "wallet_id": 1, "new_address": false });

          let login = await dataChk.log_in(agent, { "fingerprint": getFingerPrint.private_key.fingerprint });
          console.log(login)
          // const sql2 = `INSERT INTO wallet(PrivateKey, FingerPrint, wallet_Address)  VALUES('${getPrivateKey.mnemonic}','${getFingerPrint.private_key.fingerprint}', '${getAddress.address}') `;
          const sql2 = `UPDATE wallet SET FingerPrint ='${getFingerPrint.private_key.fingerprint}',wallet_Address ='${getAddress.address}', PrivateKey='${getPrivateKey.mnemonic}' WHERE UserId='${UserId}' `;

          con.query(sql2, function (err, result1) {


            return res.status(200).send({
              success: true,
              msg: "wallet generated",
              data: { key:getPrivateKey.mnemonic, fingerprint:getFingerPrint.private_key.fingerprint, wallet_address:getAddress.address }

            })

          });
        
      

  



  



  }










  )

  app.post('/addanotherAccount', async (req, res) => {
    let UserId= req.body.userId;
    let name=req.body.name

          let getPrivateKey = await dataChk.generate_mnemonic(agent);

          let addKeyToWallet = await dataChk.add_key(agent, getPrivateKey);
          let getFingerPrint = await dataChk.get_private_key(agent, { "fingerprint": addKeyToWallet.fingerprint });
          let getAddress = await dataChk.get_next_address(agent, { "fingerprint": addKeyToWallet.fingerprint, "wallet_id": 1, "new_address": false });

          let login = await dataChk.log_in(agent, { "fingerprint": getFingerPrint.private_key.fingerprint });
          console.log(login)
          const sql2 = `INSERT INTO wallet(UserId, PrivateKey, FingerPrint, wallet_Address, Name)  VALUES( '${UserId}' ,'${getPrivateKey.mnemonic}','${getFingerPrint.private_key.fingerprint}', '${getAddress.address}', '${name}') `;
          // const sql2 = `UPDATE wallet SET FingerPrint ='${getFingerPrint.private_key.fingerprint}',wallet_Address ='${getAddress.address}', PrivateKey='${getPrivateKey.mnemonic}' WHERE UserId='${UserId}' `;

          con.query(sql2, function (err, result1) {

console.log(result1,"inserted ")
            return res.status(200).send({
              success: true,
              msg: "another wallet generated",
              data: { key:getPrivateKey.mnemonic, fingerprint:getFingerPrint.private_key.fingerprint, wallet_address:getAddress.address },result1

            })

          });
        
      

  



  



  }










  )

};


main();