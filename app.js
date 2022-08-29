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
 console.log(dataChk)

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
        let sql1 = `SELECT * FROM UserLogin where password = '${hash}'`;
    
        con.query(sql1, async function (err, result1) {
          if (err) throw err;
    
          if (result1.length !== 0) {
     
            return res.status(200).send({
              success: true,
              msg: "Login sucess",
             
    
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

    let mnemonic = req.body;
    // let password = req.body.password;
    // const finalMnemonic = mnemonic.split(",");
    console.log(mnemonic)

    // let confirm_password = req.body.confirm_password;
    // let hash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
    let getPrivateKey = {
      mnemonic: mnemonic,
      success: true
    }
    let sql = `SELECT * FROM wallet where PrivateKey = '${mnemonic}'`;
    con.query(sql, async function (err, result) {

      if (err) throw err;

      if (result.length !== 0) {
        
        
            let login = await dataChk.log_in(agent, { "fingerprint":parseInt(result[0].FingerPrint)});
            console.log(parseInt(result[0].FingerPrint), login)
            return res.status(200).send({
              success: true,
              msg: "wallet Imported",
              data: result[0]
            })

   
      }
      else {
        let addKeyToWallet = await dataChk.add_key(agent, getPrivateKey);
        let getFingerPrint = await dataChk.get_private_key(agent, { "fingerprint": addKeyToWallet.fingerprint });
        let getAddress = await dataChk.get_next_address(agent, { "fingerprint": addKeyToWallet.fingerprint, "wallet_id": 1, "new_address": false });

        let login = await dataChk.log_in(agent, { "fingerprint":getFingerPrint.private_key.fingerprint});
        console.log(getFingerPrint.private_key.fingerprint, login)
        const sql2 = `INSERT INTO wallet( PrivateKey, FingerPrint, wallet_Address)  VALUES('${getPrivateKey.mnemonic}','${getFingerPrint.private_key.fingerprint}', '${getAddress.address}')`;
        con.query(sql2,  async function (err, result1) {
          if (err) throw err;
     
       if(result1){
        return res.status(200).send({
          success: true,
          msg: "new wallet Imported",
          data: result1[0]
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
    let Amount = req.body.amount;
    let fee = req.body.fee;
    let ReciverAddress = req.body.address;
    let sendTransaction = await dataChk.send_transaction(agent, { wallet_id: '1', amount: Amount, fee: fee, address: ReciverAddress })
    console.log(sendTransaction)
    return res.status(200).send({
      success: true,
      msg: "sucessfully registered",
      data: sendTransaction

    })


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
          // let getPrivateKey = await dataChk.generate_mnemonic(agent);
          // secretKey = getPrivateKey.mnemonic.toString();
          // console.log(secretKey)
          let sql = `INSERT INTO UserLogin(password, email)  VALUES('${hash}', '${email}')`;
          con.query(sql, async function (err, result) {

            if (err) throw err;
            return res.status(200).send({
              success: true,
              msg: "sucessfully registered",


            })



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
   
          let getPrivateKey = await dataChk.generate_mnemonic(agent);
  
          let addKeyToWallet = await dataChk.add_key(agent, getPrivateKey);
          let getFingerPrint = await dataChk.get_private_key(agent, { "fingerprint": addKeyToWallet.fingerprint });
          let getAddress = await dataChk.get_next_address(agent, { "fingerprint": addKeyToWallet.fingerprint, "wallet_id": 1, "new_address": false });

          let login = await dataChk.log_in(agent, { "fingerprint": getFingerPrint.private_key.fingerprint });
          console.log(login)
          const sql2 = `INSERT INTO wallet(PrivateKey, FingerPrint, wallet_Address)  VALUES('${getPrivateKey.mnemonic}','${getFingerPrint.private_key.fingerprint}', '${getAddress.address}') `;
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