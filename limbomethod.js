app.get('/getAllFingerPrints', async (req, res) => {
    let Wallet = await dataChk.get_public_keys(agent);
    console.log(Wallet)
    return res.status(200).send({
      success: true,
      msg: "data fetched",
      data: Wallet
    })

  });
  app.post("/login", async (req, res) => {

    let sql = `SELECT * FROM wallet where address = '${req.body.address}'`;
    
    con.query(sql, async function (err, result) {
      if (err) throw err;

      if (result.length !== 0) {

        return res.status(200).send({
          success: true,
          msg: "address already present",
          data: [result[0].balance, result[0].wallet_Address]

        })
      }
      else {

        let getPrivateKey = await dataChk.generate_mnemonic(agent);
        console.log(getPrivateKey,"bbbb")

        let createOffer = await dataChk.create_offer_for_ids(agent,{"offer": offer, "validate_only": false, "fee": 0})
        console.log(createOffer)

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

  app.get('/getwallets', async (req, res) => {

    let Wallet = await dataChk.get_wallets(agent);
    console.log(Wallet)
    return res.status(200).send({
      success: true,
      msg: "data fetched",
      data: Wallet

    })

  });

  app.get('/getwalletbalance', async (req, res) => {

    let Wallet = await dataChk.get_wallet_balance(agent, { "wallet_id": 1 });
    console.log(Wallet)
    return res.status(200).send({
      success: true,
      msg: "balance fetched",
      data: Wallet

    })

  });

  app.get('/getTransactions', async (req, res) => {

    let getTransactions = await dataChk.get_transactions(agent, { "wallet_id": 1 });// await dataChk.generate_mnemonic(agent);
    console.log(getTransactions)
    return res.status(200).send({
      success: true,
      msg: "Transactions fetched",
      data: getTransactions

    })

  });