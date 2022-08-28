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
  const agent = new RPCAgent({ service: "wallet", configPath: "C:/Users/hp/.littlelambocoin/mainnet/config/config.yaml" });
  app.get('/getwalletbalance', async (req, res) => {

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

  app.post('/importwallet', async (req, res) => {

    let mnemonic = req.body.key;
    let password = req.body.password;
    let confirm_password = req.body.confirm_password;
    let hash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);

    let sql = `SELECT * FROM wallet where PrivateKey = '${mnemonic}'`;
    con.query(sql, async function (err, result) {
     
      if (err) throw err;

      if (result.length !== 0) {
        if (password==confirm_password) {
       
          const sql2 = `UPDATE wallet SET password ='${hash}' WHERE PrivateKey='${mnemonic}' `;
          con.query(sql2,  async function (err, result1) {
            if (err) throw err;
            let login = await dataChk.log_in(agent, { "fingerprint":parseInt(result[0].FingerPrint)});
            console.log(parseInt(result[0].FingerPrint), login)
            return res.status(200).send({
              success: true,
              msg: "wallet Added",
              data: result[0].FingerPrint
            })
    
          });
    
    
    
        }
        else{
              return res.status(200).send({
          success: false,
          msg: "password and confirm password not matched",

        })
        }
        

        
      }
      else {

        return res.status(200).send({
          success: false,
          msg: "key not found",

        })


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
      let sql3 = `SELECT * FROM wallet where email = '${email}'`;
    
      con.query(sql3, async function (err, result3) {
        if (err) throw err;
  
        if (result3.length !== 0) {
  
          return res.status(200).send({
            success: true,
            msg: "Email already Used",
            data: result3
  
          })
        }
        else{
          let getPrivateKey = await dataChk.generate_mnemonic(agent);
          secretKey = getPrivateKey.mnemonic.toString();
          console.log(secretKey)
          let sql = `INSERT INTO wallet(password, PrivateKey, email)  VALUES('${hash}','${secretKey}', '${email}')`;
          con.query(sql, async function (err, result) {
    
            if (err) throw err;
            return res.status(200).send({
              success: true,
              msg: "sucessfully registered",
              data: getPrivateKey
    
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
  app.post('/creatnewwallet', async (req, res) => {
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
};


main();