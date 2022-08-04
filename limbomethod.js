app.get('/getAllFingerPrints', async (req, res) => {
    let Wallet = await dataChk.get_public_keys(agent);
    console.log(Wallet)
    return res.status(200).send({
      success: true,
      msg: "data fetched",
      data: Wallet
    })

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