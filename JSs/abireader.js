async function readABI() {
    abi = await fetch("../../contracts_info/compound_finance/mainnet_abi.json")
        .then(response => response.json());

    abi2 = await fetch("../../contracts_info/compound_finance/mainnet_abi.json");
  
    for(contractName in abi)
    {
        console.log(contractName);
    }

    var txtContractName = document.getElementById("txtContractName");

    
    NameStr = txtContractName.value;
    console.log('------- ' + NameStr + " -------------")
    let c1 = await abi2.json().then(r => r[NameStr]);
    for(method in c1){
        console.log(c1[method]);    
        if(c1[method].type=='function' && c1[method].stateMutability=='view'){
        }
    }
    
    console.log(abi);
}