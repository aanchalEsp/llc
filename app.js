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
//  let catList = await dataChk.get_cat_list(agent);
//     console.log(catList)
    // let catListName = await dataChk.cat_asset_id_to_name(agent,{asset_id:"6d95dae356e32a71db5ddcb42224754a02524c615c5fc35f568c2af04774e589"});
    // console.log(catListName)
    let Wallet = await dataChk.get_wallet_balance(agent, { "wallet_id": 1 });
    console.log(Wallet)
    // let create_new_wallet = await dataChk.create_new_wallet(agent, {  "wallet_type": "cat_wallet" ,"name":"the new cat" , mode:'existing', asset_id:'6d95dae356e32a71db5ddcb42224754a02524c615c5fc35f568c2af04774e589'});
    // console.log(create_new_wallet);

    let create_offers = await dataChk.create_offer_for_ids(agent,
      //  {offer:{1:1}, requests:{1:0.0}, filepath:"/home/ubantu/Kamlesh/llc/offer"}
      {
        "offer": {
            "1": 10000000000000,
            "1": 1000
        },
        "fee": 0
    }
       );
    console.log(create_offers);
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
            console.log("password not  present")

            return res.status(200).send({
              success: true,
              msg: "Login sucess",
              data:result1
              
    
            })
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
    console.log(mnemonic)
    let getPrivateKey = {
      mnemonic: mnemonic,
      success: true
    }
    let sql = `SELECT * FROM wallet where PrivateKey = '${mnemonic}'`;
    con.query(sql, async function (err, result) {
console.log(result,'545555')
      if (err) throw err;


      if (result.length !== 0) {
       

        const sql2 = `UPDATE wallet SET FingerPrint ='${result[0].FingerPrint}',wallet_Address ='${result[0].wallet_Address}', PrivateKey='${result[0].PrivateKey}' WHERE UserId='${UserId}' `;
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
        let getFingerPrint = await dataChk.get_private_key(agent, { "fingerprint": addKeyToWallet.fingerprint });
        let getAddress = await dataChk.get_next_address(agent, { "fingerprint": addKeyToWallet.fingerprint, "wallet_id": 1, "new_address": false });

        let login = await dataChk.log_in(agent, { "fingerprint":getFingerPrint.private_key.fingerprint});
         console.log(getFingerPrint.private_key.fingerprint,"kmfkkg",login)
        // const sql2 = `INSERT INTO wallet( PrivateKey, FingerPrint, wallet_Address)  VALUES('${getPrivateKey.mnemonic}','${getFingerPrint.private_key.fingerprint}', '${getAddress.address}')`;
        const sql2=`UPDATE wallet SET FingerPrint ='${getFingerPrint.private_key.fingerprint}',wallet_Address ='${getAddress.address}', PrivateKey='${getPrivateKey.mnemonic}' WHERE UserId='${UserId}' `
        con.query(sql2,  async function (err, result1) {
          if (err) throw err;
     
       if(result1){
        console.log("new wallet imported added to user id")
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
  app.post('/creatnewwallets', async (req, res) => {
    let sql = `SELECT PrivateKey FROM wallet`;
    let mnemonic = req.body.key;
    const finalMnemonic = mnemonic.split(",");
    let getPrivateKey = {
      mnemonic: finalMnemonic,
      success: true
    }
    con.query(sql, function (err, result) {
      const person = result.filter(async element => {

        if (element.PrivateKey === mnemonic) {
          console.log(element.PrivateKey===mnemonic,'key matched')

          let addKeyToWallet = await dataChk.add_key(agent, getPrivateKey);
          let getFingerPrint = await dataChk.get_private_key(agent, { "fingerprint": addKeyToWallet.fingerprint });
          let getAddress = await dataChk.get_next_address(agent, { "fingerprint": addKeyToWallet.fingerprint, "wallet_id": 1, "new_address": false });

          let login = await dataChk.log_in(agent, { "fingerprint": getFingerPrint.private_key.fingerprint });
          console.log(login)
          const sql2 = `UPDATE wallet SET FingerPrint ='${getFingerPrint.private_key.fingerprint}',wallet_Address ='${getAddress.address}' WHERE PrivateKey='${mnemonic}' `;
          con.query(sql2, function (err, result1) {


            return res.status(200).send({
              success: true,
              msg: "wallet generated",
              data: result1

            })

          });
        }
        else{
          console.log("key not found")
          // return res.status(400).send({
          //       success: false,
          //       msg: "key not matched",

          //     })
        }

      })



    });



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
};


main();