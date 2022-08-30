var web3 = new Web3();

function BigNumberToString(BigNum) {
    var BN = web3.utils.BN;
    var Rtn = new BN(BigNum).toString();
    return Rtn;
}