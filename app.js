const { RPCAgent, setLogLevel } = require("chia-agent");
const dataChk = require("chia-agent/api/rpc");

// console.log(dataChk)
main().catch(e => {
  console.error("=============", e);
});

async function main() {


  setLogLevel("debug"); // none/error/warning/info/debug is available.
  const agent = new RPCAgent({ service: "wallet",configPath:"/home/ubantu/.littlelambocoin/mainnet/config/config.yaml"});
  // console.log(agent)
  // let bl1 = await dataChk.log_in(agent,{"fingerprint":469835177});
  // let newW  = await dataChk.pk_to_address(agent);
  // let nn = await dataChk.get_next_address(agent,{"fingerprint":469835177,"wallet_id": 1, "new_address":true});

  // console.log(bl1)
  // let bl = await dataChk.get_wallet_balance(agent,{"fingerprint":469835177,"wallet_id":1});

  // let cc = await dataChk.get_network_info_of_wallet(agent,{"fingerprint":469835177});
  // let cc = await dataChk.get_wallets(agent,{"fingerprint":469835177,"address":true});

  // console.log(bl1,cc)
  // let tx = await dataChk.send_transaction(agent,{"wallet_id":1,"amount":10,"fee":0,"address":"txch1x830rmtgmtzv4rz3n6m3ajpnnjy3z9953lz6cenf4cm5md22q0jqcr9fyj"});
  // console.log(tx)
  // return
  // let cc = await dataChk.get_network_info_of_wallet(agent,{"fingerprint":469835177});

  
  // let aa1 = await dataChk.add_key(agent, aa);// await dataChk.generate_mnemonic(agent);
  // console.log(aa1)


  // let aa = {
  //   mnemonic: [
  //     "change","basic","ignore","pluck","crumble","test","denial","still","magic","escape","electric","fit","spread","potato","dove","tragic","burden","topic","consider","pumpkin","rack","toss","final","ride"
  //   ],
  //   success: true
  // };
  let aa = await dataChk.generate_mnemonic(agent);
//   console.log(aa);
  let aa1 = await dataChk.add_key(agent, aa);// await dataChk.generate_mnemonic(agent);
  let aa2 = await dataChk.get_private_key(agent, { "fingerprint": aa1.fingerprint });// await dataChk.generate_mnemonic(agent);
  let nn = await dataChk.get_next_address(agent, { "fingerprint": aa1.fingerprint, "wallet_id": 1, "new_address": false });

  let bl1 = await dataChk.log_in(agent, { "fingerprint": aa1.fingerprint });
  console.log({ aa, aa1, aa2, nn, bl1 })


  // let aa =await dataChk.create_new_wallet(agent,{"wallet_type": "did_wallet", "did_type": "new", "amount": 1, "backup_dids": ["did:chia:1njcz5aemq78m2j8gh58y5csfcxpxe8hrzcwevnxdw6rv74lvmtcsjt624c"], "num_of_backup_ids_needed": 1, "fee": 10000000});// await dataChk.generate_mnemonic(agent);



  // let bb =await dataChk.get_wallets(agent);// await dataChk.generate_mnemonic(agent);
  // console.log(bb)
  // let cc =await dataChk.get_transactions(agent,{"wallet_id":3});// await dataChk.generate_mnemonic(agent);
  // console.log(cc)
  return;
}