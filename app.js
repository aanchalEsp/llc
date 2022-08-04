const { RPCAgent, setLogLevel } = require("chia-agent");
const dataChk = require("chia-agent/api/rpc");
const express = require('express');
const bodyParser = require('body-parser');
const moment=require("moment")
const app = express();
const port = 8008;
app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
console.log(dataChk)

  setLogLevel("debug"); // none/error/warning/info/debug is available.
  const agent = new RPCAgent({ service: "wallet", configPath: "/home/ubantu/.littlelambocoin/mainnet/config/config.yaml" });

  
  app.post("/login", async (req, res) => {

    let sql = `SELECT * FROM wallet where address = '${req.body.address}'`;
    con.query(sql, async function (err, result) {
      if (err) throw err;
      console.log(result)
      if (result.length !== 0) {
        return res.status(200).send({
          success: true,
          msg: "address already present",
          data: [result[0].balance, result[0].wallet_Address]

        })
      }
      else {
        let getPrivateKey = await dataChk.generate_mnemonic(agent);
        // let getPrivateKey = {
        //   mnemonic: ['boring','among','milk','claim','educate','belt','portion','render','dial','melt','snack','flight','useful','delay','correct','slim','melody','apology','draft','stay','clinic','gold','achieve','habit' ],
        //   success: true
        // };
        let addKeyToWallet = await dataChk.add_key(agent, getPrivateKey);// await dataChk.generate_mnemonic(agent);
        let getFingerPrint = await dataChk.get_private_key(agent, { "fingerprint": addKeyToWallet.fingerprint });// await dataChk.generate_mnemonic(agent);
        let getAddress = await dataChk.get_next_address(agent, { "fingerprint": addKeyToWallet.fingerprint, "wallet_id": 1, "new_address": false });
        console.log(getPrivateKey, addKeyToWallet, getFingerPrint, getAddress)
        const sql2 = `INSERT INTO wallet(address, PrivateKey, FingerPrint, wallet_Address)  VALUES('${req.body.address}','${getPrivateKey.mnemonic}','${getFingerPrint.private_key.fingerprint}', '${getAddress.address}')  `;
let status =await dataChk.get_sync_status(agent)
console.log(status)
        con.query(sql2, function (err, result) {
          if (err) throw err;
          console.log(err)

          return res.status(200).send({
            success: true,
            msg: "wallet generated",
            data: [{ "getPrivateKey": getPrivateKey.mnemonic, "getFingerPrint": getFingerPrint.private_key.fingerprint, "getaddress": getAddress.address }]

          })

        });
      }


    });


  }


  )
  

  
  app.get('/getTransactions', async (req, res) => {
    const sql = `SELECT FingerPrint FROM wallet`;
    con.query(sql, async function (err, result) {

      if (err) throw err;

      if (result.length > 0) {
        for (let i = 0; i < result.length; i++) {

          console.log(result[i].FingerPrint);
          let login = await dataChk.log_in(agent, { "fingerprint": parseInt(result[i].FingerPrint) });
          console.log(login)
          let Wallet = await dataChk.get_transactions(agent, { wallet_id: 1 });
      
          if (Wallet.success) {
            const Wallets = Wallet.transactions;
         
            const AllTransactions = Wallets.map(item => {
              return item;
            })
            for (let i = 0; i < AllTransactions.length; i++) {
            

            const sqll = `SELECT wallet_address FROM wallet where wallet_address = '${AllTransactions[i].to_address}'`;
          
            con.query(sqll, function (err, results) {

              if (err) throw err;


              if (results.length > 0) {
             
                const sql = `SELECT * FROM transaction where hash ='${AllTransactions[i]?.to_puzzle_hash}'`;
                con.query(sql, function (err, getResult) {
                 

                  if (err) throw err;
                  if (getResult.length > 0) {
                    console.log("already present")
                    return res.status(200).send({
                      success: false,
                      msg: "already inserted",
                      data: getResult

                    })


                  }
                  else {

                    const sql2 = `INSERT INTO transaction(address, amount, status,type,  hash,create_at) Values('${AllTransactions[i]?.to_address}','${AllTransactions[i]?.amount / 10 **3}','${1}','${AllTransactions[i]?.type}','${AllTransactions[i]?.to_puzzle_hash}','${moment.unix(AllTransactions[i]?.created_at_time).format()}')`;
                    console.log(sql2)
                    con.query(sql2, function (err, result) {
                      console.log("transaction records inserted")

                      if (err) throw err;
                    
                      return res.status(200).send({
                        success: true,
                        msg: "transactions inserted",
                        data: result

                      })

                    });
                  }


                });




              }

            });



          }

        }
        }


      }
      else {
        return res.status(200).send({
          success: false,
          msg: "not found",

        })
      }


    });




  });

  

}
main().catch(e => {
  console.error("=============", e);
});
