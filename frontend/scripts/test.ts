import pkg from '@coral-xyz/anchor';
const { BN, web3 } = pkg;



console.log((new BN("10000000").div(new BN(web3.LAMPORTS_PER_SOL)).toNumber()).toFixed(6))
