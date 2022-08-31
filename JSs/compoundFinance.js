var web3 = new Web3();
var provider;
var accountAddresses;
var activeAccountAddr;
var network_Name;
var network_chainId;

var filePath_Abi;
var filePath_Addr;
var abi;
var addr;
var PROVIDER;
var WEB3;


var Assets_Address=[];
var Assets_Symbol=[];
var Assets_Balance=[];
var Assets_UnderlyingBalance=[];
var Assets_TokenBalance=[];
var Assets_Decimals=[];
var Assets_UnderlyingDecimals=[];
var Assets_BorrowBalance=[];
var Assets_TotalSupply=[];
var Assets_TotalBorrows=[];
var Assets_TotalReserves=[];
var Assets_TotalCash=[];
var Assets_reserveFactorMantissa=[];
var Assets_collateralFactorMantissa=[];
var Assets_underlyingPrice=[];
var Assets_CompBalance=[];
var Assets_borrowRatePerBlock=[];
var Assets_supplyRatePerBlock=[];
var Assets_borrowAPY=[];
var Assets_supplyAPY=[];
var Assets_BorrowLimitUsed=[];

var AccountBorrowLimit=0;
var TotalBorrowLimitUsed=0;

const myAddr = '0xB31B63e6d9cBa8bB544E873E4eB38BA145C1b1E1';
//======================================================================================
async function connectToWallet(){
    try{
        if(!window.ethereum) throw new Error("No crypto wallet found.");
        provider = new ethers.providers.Web3Provider(window.ethereum);
        accountAddresses = await provider.send('eth_requestAccounts',[]);
        activeAccountAddr = accountAddresses[0];
        var netWork = await provider.getNetwork();
        network_Name = netWork.name;
        network_chainId = netWork.chainId;
        console.log("connected!");
    }catch(err){
        console.log("Error:",err);
    }
}

async function main() {
    console.log('salam');
    await Init();
    await getAssetsIn();
    //await getCTokenInfo();
    //await getCompoundLensInfo();
    //calculateBorrowLimits();
/*
    console.log("=====================:");
    console.log("Address: " + Assets_Address);
    console.log("Symbols: " + Assets_Symbol);
    console.log("Balance: " + Assets_Balance);
    console.log("UnderlyingBalance: " + Assets_UnderlyingBalance);
    console.log("TokenBalance: " + Assets_TokenBalance);
    console.log("BorrowBalance: " + Assets_BorrowBalance);
    console.log("TotalSupply: " + Assets_TotalSupply);
    console.log("TotalBorrows: " + Assets_TotalBorrows);
    console.log("TotalReserves: " + Assets_TotalReserves);
    console.log("Totalcash: " + Assets_TotalCash);
    console.log("UnderlyingPrice: " + Assets_underlyingPrice);
    console.log("CompBalance: " + Assets_CompBalance);
    console.log("BorrowAPY:" + Assets_borrowAPY);
    console.log("SupplyAPY: " + Assets_supplyAPY);
    console.log("BorrowLimitUsed:" + Assets_BorrowLimitUsed);
    console.log("AccountBorrowLimit:" + AccountBorrowLimit);
    console.log("TotalBorrowLimitUsed:" + TotalBorrowLimitUsed);
    console.log("=====================:");
*/
}

async function Init() {
    //#todo : networkselected must check befor this method.
    PROVIDER=window.ethereum;
    WEB3 = new Web3(PROVIDER);

    if (network_chainId == 1){ // Mainnet
        filePath_Abi = "./contracts_info/compound_finance/mainnet_abi.json";
        filePath_Addr = "./contracts_info/compound_finance/mainnet.json";
    }else if (network_chainId == 5){ //Goerli
        filePath_Abi = "./contracts_info/compound_finance/goerli_abi.json";
        filePath_Addr = "./contracts_info/compound_finance/goerli.json";
    }

}

async function getAssetsIn() {
    var abi = await fetch(filePath_Abi);
    var addr = await fetch(filePath_Addr);

    const abi_Comptroller = await abi.json().then(result =>{return result.Comptroller;});
    const addr_Comptroller = await addr.json().then(result =>{return result.Contracts.Comptroller;});

    const contract_Comptroller = await new WEB3.eth.Contract(abi_Comptroller,addr_Comptroller);

    Assets_Address = await contract_Comptroller.methods.getAssetsIn(activeAccountAddr).call().then(result => {return result;});
    
    AllMarkets = await contract_Comptroller.methods.getAllMarkets().call().then(result => {return result;});
    
    console.log("AllMarkets");
    console.log(AllMarkets);

    if (network_chainId==1){
        Assets_Address = ['0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5','0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643','0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9'];
    }

    if (network_chainId==5){
        Assets_Address = ['0x20572e4c090f15667cF7378e16FaD2eA0e2f3EfF','0x822397d9a55d0fefd20F5c4bCaB33C5F65bd28Eb','0xCEC4a43eBB02f9B80916F1c718338169d6d5C1F0'];
    }
}

async function getCTokenInfo() {
    var abi = await fetch(filePath_Abi);
    var addr = await fetch(filePath_Addr);

    const abi_cErc20Delegate = await abi.json().then(result =>{return result.cErc20Delegate;});

    const ethMantissa = 1e18;
    const blocksPerDay = 6570; // 13.15 seconds per block
    const daysPerYear = 365;

    for (var i=0; i<Assets_Address.length;i++){
        var addr_i = Assets_Address[i];
        const contract_cErc20Delegate = await new WEB3.eth.Contract(abi_cErc20Delegate,addr_i);
        
        const symbol = await contract_cErc20Delegate.methods.symbol().call().then(result => {return result;});
        Assets_Symbol[i] = symbol;
        
        Assets_supplyRatePerBlock[i] = await contract_cErc20Delegate.methods.supplyRatePerBlock().call().then(result => {return result;});
        Assets_borrowRatePerBlock[i] = await contract_cErc20Delegate.methods.borrowRatePerBlock().call().then(result => {return result;});
        
        Assets_supplyAPY[i] = (((Math.pow((Assets_supplyRatePerBlock[i] / ethMantissa * blocksPerDay) + 1, daysPerYear))) - 1) * 100;
        Assets_borrowAPY[i] = (((Math.pow((Assets_borrowRatePerBlock[i] / ethMantissa * blocksPerDay) + 1, daysPerYear))) - 1) * 100;

        
    }
}

async function getCompoundLensInfo() {
    var abi = await fetch(filePath_Abi);
    var addr = await fetch(filePath_Addr);

    const abi_CompoundLens = await abi.json().then(result =>{return result.CompoundLens;});
    const addr_CompoundLens = await addr.json().then(result =>{return result.Contracts.CompoundLens;});

    const contract_Lens = await new WEB3.eth.Contract(abi_CompoundLens,addr_CompoundLens);
    
    addr = await fetch(filePath_Addr);
    var Comp_str = "";
    if (network_chainId==1){Comp_str="COMP";}
    if (network_chainId==5){Comp_str="Comp";}
    const addr_Comp = await addr.json().then(result =>{return result.Contracts[Comp_str];});
    
    //addr = await fetch(filePath_Addr);
    //const addr_Comptroller = await addr.json().then(result =>{return result.Contracts.Comptroller;});

    for (var i=0; i<Assets_Address.length;i++){
        var addr_i = Assets_Address[i];
        //---
        const cTokenBalances = await contract_Lens.methods.cTokenBalances(addr_i,activeAccountAddr).call().then(result => {return result;});
        Assets_UnderlyingBalance[i]         = cTokenBalances.balanceOfUnderlying;
        Assets_Balance[i]                   = cTokenBalances.balanceOf;
        Assets_TokenBalance[i]              = cTokenBalances.tokenBalance;
        Assets_BorrowBalance[i]             = cTokenBalances.borrowBalanceCurrent
        //---
        const cTokenMetadata = await contract_Lens.methods.cTokenMetadata(addr_i).call().then(result => {return result;});
        Assets_Decimals[i]                  = cTokenMetadata.cTokenDecimals;
        Assets_UnderlyingDecimals[i]        = cTokenMetadata.underlyingDecimals;
        Assets_TotalSupply[i]               = cTokenMetadata.totalSupply;
        Assets_TotalBorrows[i]              = cTokenMetadata.totalBorrows;
        Assets_TotalReserves[i]             = cTokenMetadata.totalReserves;
        Assets_TotalCash[i]                 = cTokenMetadata.totalCash;
        Assets_reserveFactorMantissa[i]     = cTokenMetadata.reserveFactorMantissa;
        Assets_collateralFactorMantissa[i]  = cTokenMetadata.collateralFactorMantissa;
        //---
        const cTokenUnderlyingPrice = await contract_Lens.methods.cTokenUnderlyingPrice(addr_i).call().then(result => {return result;});
        Assets_underlyingPrice[i]           = cTokenUnderlyingPrice.underlyingPrice;
        if (network_chainId==5){
            Assets_underlyingPrice[i]       =2 * cTokenUnderlyingPrice.underlyingPrice;
        }
        //---
        const getCompBalanceMetadata = await contract_Lens.methods.getCompBalanceMetadata(addr_Comp,activeAccountAddr).call().then(result => {return result;});
        Assets_CompBalance[i]               = getCompBalanceMetadata.balance;
        //---
    }

}

function calculateBorrowLimits() {
    var totalUnderlyingAssets=0;
    var totalLimitUsed=0;
    for (var i=0; i<Assets_Address.length;i++){
        var valueUnderlyingAsset = Assets_UnderlyingBalance[i] * Assets_underlyingPrice[i];
        totalUnderlyingAssets+=valueUnderlyingAsset;
    }
    AccountBorrowLimit = totalUnderlyingAssets * 0.75;

    for (var i=0; i<Assets_Address.length;i++){
        Assets_BorrowLimitUsed[i] = (Assets_BorrowBalance[i] * Assets_underlyingPrice[i])/AccountBorrowLimit;
        totalLimitUsed+=Assets_BorrowLimitUsed[i];
    }

    TotalBorrowLimitUsed = totalLimitUsed;

    
}
