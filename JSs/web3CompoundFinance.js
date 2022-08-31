var PROVIDER;
var WEB3;

var filePath_Abi;
var filePath_Addr;

class ClsCToken{
    constructor(address){
        this.address=address;
    }
    setAssetIn(AssetIn){
        this.AssetIn = AssetIn;
    }
    setSymbol(symbol,name) {
        this.symbol = symbol;
        this.name   = name;
    }
    setBalances(balanceOfUnderlying,balanceOf,tokenBalance,borrowBalanceCurrent){
        this.balanceOfUnderlying    = balanceOfUnderlying;
        this.balanceOf              = balanceOf;
        this.tokenBalance           = tokenBalance;
        this.borrowBalanceCurrent   = borrowBalanceCurrent;
    }
    setDecimals(cTokenDecimals,underlyingDecimals){
        this.cTokenDecimals     = cTokenDecimals;
        this.underlyingDecimals = underlyingDecimals;
    }
    setTotals(totalSupply,totalBorrows,totalReserves,totalCash){
        this.totalSupply    = totalSupply;
        this.totalBorrows   = totalBorrows;
        this.totalReserves  = totalReserves;
        this.totalCash      = totalCash;
    }
    setPerBlockRates(supplyRatePerBlock,borrowRatePerBlock){
        this.supplyRatePerBlock = supplyRatePerBlock;
        this.borrowRatePerBlock = borrowRatePerBlock;
    }
    setMantissa(reserveFactorMantissa,collateralFactorMantissa){
        this.reserveFactorMantissa      = reserveFactorMantissa;
        this.collateralFactorMantissa   = collateralFactorMantissa;
    }
    setUnderlyingPrice(underlyingPrice){
        this.underlyingPrice = underlyingPrice;
    }
    setAPYs(supplyAPY,borrowAPY){
        this.supplyAPY = supplyAPY;
        this.borrowAPY = borrowAPY;
    }

}
var cTokensAll_Addr=[];
var cTokensAcc_Addr=[];
var cTokensAll_Cls=[];

var accountCompBalance;

const Dictionary_AssetsTable_Supply = [  
    {title:"Asset"      ,varName:"name"                 },
    {title:"APY/Earned" ,varName:"APY"                  },
    {title:"Balance"    ,varName:"balanceOfUnderlying"  },
    {title:"Price"      ,varName:"underlyingPrice"      },
    {title:"Collateral" ,varName:"AssetIn"              }
];
const Dictionary_AssetsTable_Borrow = [  
    {title:"Asset"      ,varName:"name"                 },
    {title:"APY/accrued",varName:"APY"                  },
    {title:"Balance"    ,varName:"borrowBalanceCurrent" },
    {title:"Price"      ,varName:"underlyingPrice"      }
];
const Dictionary_AllMarketsTable = [  
    {title:"Asset"      ,varName:"name"                 },
    {title:"APY"        ,varName:"APY"                  },
    {title:"Wallet"     ,varName:"tokenBalance"         },
    {title:"Price"      ,varName:"underlyingPrice"      },
    {title:"Collateral" ,varName:"AssetIn"              },
];
//++-----------------------------------------------------------------------------------++

async function compoundFinance_Main(chainId,AccAddress) {
    await compoundFinance_Init(chainId);
    await compoundFinance_getAllMarkets(chainId,AccAddress)
    await compoundFinance_getCTokenInfo();
    await compoundFinance_getCompoundLensInfo(chainId,AccAddress);
    compoundFinance_viewInfo();
    
    //console.log(cTokensAll_Cls);
}

async function compoundFinance_Init(chainId) {
    PROVIDER=window.ethereum;
    WEB3 = new Web3(PROVIDER);

    if (chainId == 1){ // Mainnet
        filePath_Abi = "./contracts_info/compound_finance/mainnet_abi.json";
        filePath_Addr = "./contracts_info/compound_finance/mainnet.json";
    }else if (chainId == 5){ //Goerli
        filePath_Abi = "./contracts_info/compound_finance/goerli_abi.json";
        filePath_Addr = "./contracts_info/compound_finance/goerli.json";
    }
}

async function compoundFinance_getAllMarkets(chainId,AccAddress) {
    var abi = await fetch(filePath_Abi);
    var addr = await fetch(filePath_Addr);
    
    const abi_Comptroller = await abi.json().then(result =>{return result.Comptroller;});
    const addr_Comptroller = await addr.json().then(result =>{return result.Contracts.Comptroller;});
    const contract_Comptroller = await new WEB3.eth.Contract(abi_Comptroller,addr_Comptroller);

    if (chainId == 1){ // Mainnet
        cTokensAll_Addr = await contract_Comptroller.methods.getAllMarkets().call().then(result => {return result;});
    }else if(chainId==5){ //Goerli
        cTokensAll_Addr=[];
        var addr2 = await fetch(filePath_Addr);
        const cTokens = await addr2.json().then(result =>{return result.cTokens;});
        for(var item in cTokens){
            cTokensAll_Addr.push(cTokens[item].address);
        }
    }

    cTokensAcc_Addr = await contract_Comptroller.methods.getAssetsIn(AccAddress).call().then(result => {return result;});

    for(var i=0;i<cTokensAll_Addr.length;i++){
        var item_Addr = cTokensAll_Addr[i];
        cTokensAll_Cls.push(new ClsCToken(item_Addr));
        if(cTokensAcc_Addr.includes(item_Addr)){
            cTokensAll_Cls[i].setAssetIn(true);
        }else{
            cTokensAll_Cls[i].setAssetIn(false);
        }
    }
}

async function compoundFinance_getCTokenInfo() { 
    var abi = await fetch(filePath_Abi);
    var addr = await fetch(filePath_Addr);

    const abi_cErc20Delegate = await abi.json().then(result =>{return result.cErc20Delegate;});
    const cTokens = await addr.json().then(result =>{return result.cTokens;});

    var Dictionary_AddrSymbol=[];
    for (var item in cTokens){
        var item_key = cTokens[item].address;
        var item_val = cTokens[item].symbol;
        var item_name = cTokens[item].name;
        var obj = {"address" : item_key, "symbol" : item_val, "name" : item_name};
        Dictionary_AddrSymbol.push(obj);
    }
    for (var i=0; i<cTokensAll_Addr.length;i++){
        var cToken_Addr = cTokensAll_Addr[i];
        
        var item = Dictionary_AddrSymbol.find(item => String(item.address).toUpperCase()==String(cToken_Addr).toUpperCase());
        var symbol="";
        var name="";
        if( item == undefined || item == null || item.symbol==""){
            const contract_cErc20Delegate = await new WEB3.eth.Contract(abi_cErc20Delegate,cToken_Addr);
            symbol = await contract_cErc20Delegate.methods.symbol().call().then(result => {return result;});
            name = await contract_cErc20Delegate.methods.name().call().then(result => {return result;});
        }else{
            symbol=item.symbol;
            name=item.name;
        }
        cTokensAll_Cls[i].setSymbol(symbol,name);
    }
}

async function compoundFinance_getCompoundLensInfo(chainId,AccAddress) {
    var abi = await fetch(filePath_Abi);
    var addr = await fetch(filePath_Addr);

    const abi_CompoundLens = await abi.json().then(result =>{return result.CompoundLens;});
    const addr_CompoundLens = await addr.json().then(result =>{return result.Contracts.CompoundLens;});

    const contract_Lens = await new WEB3.eth.Contract(abi_CompoundLens,addr_CompoundLens);

    addr = await fetch(filePath_Addr);
    var Comp_str = "";
    if (chainId==1){Comp_str="COMP";}
    if (chainId==5){Comp_str="Comp";}
    const addr_Comp = await addr.json().then(result =>{return result.Contracts[Comp_str];});
    
    const Balances = await contract_Lens.methods.cTokenBalancesAll(cTokensAll_Addr,AccAddress).call().then(result => {return result;});
    const Metadata = await contract_Lens.methods.cTokenMetadataAll(cTokensAll_Addr).call().then(result => {return result;});
    const UnderlyingPrices = await contract_Lens.methods.cTokenUnderlyingPriceAll(cTokensAll_Addr).call().then(result => {return result;});
    const Comp = await contract_Lens.methods.getCompBalanceMetadata(addr_Comp,AccAddress).call().then(result => {return result;});

    console.log(Comp);

    const ethMantissa = 1e18;
    const blocksPerDay = 6570; // 13.15 seconds per block
    const daysPerYear = 365;

    for (var i=0; i<cTokensAll_Addr.length;i++){

        cTokensAll_Cls[i].setBalances(Balances[i].balanceOfUnderlying,Balances[i].balanceOf,Balances[i].tokenBalance,Balances[i].borrowBalanceCurrent);
        cTokensAll_Cls[i].setDecimals(Metadata[i].cTokenDecimals,Metadata[i].underlyingDecimals);
        cTokensAll_Cls[i].setTotals(Metadata[i].totalSupply,Metadata[i].totalBorrows,Metadata[i].totalReserves,Metadata[i].totalCash);
        cTokensAll_Cls[i].setPerBlockRates(Metadata[i].supplyRatePerBlock,Metadata[i].borrowRatePerBlock)
        cTokensAll_Cls[i].setMantissa(Metadata[i].reserveFactorMantissa,Metadata[i].collateralFactorMantissa);
        
        const supplyAPY = (((Math.pow((Metadata[i].supplyRatePerBlock / ethMantissa * blocksPerDay) + 1, daysPerYear))) - 1) * 100;
        const borrowAPY = (((Math.pow((Metadata[i].borrowRatePerBlock / ethMantissa * blocksPerDay) + 1, daysPerYear))) - 1) * 100;
        
        cTokensAll_Cls[i].setAPYs(supplyAPY,borrowAPY);

        var underlyingPriceMultiplyer=1;
        if (chainId==5){underlyingPriceMultiplyer=200;}
        
        cTokensAll_Cls[i].setUnderlyingPrice(underlyingPriceMultiplyer*UnderlyingPrices[i].underlyingPrice);
    }

    accountCompBalance = Comp.balance;
}

function compoundFinance_viewInfo() {
    const tblAccMainInfo = document.getElementById("tblAccMainInfo");
    var supplyBalance=0;
    var borrowBalance=0;
    for(var i=0; i<cTokensAll_Cls.length;i++){
        if(cTokensAll_Cls[i].AssetIn){  //Todo must change ....
            var cToken_Price = cTokensAll_Cls[i].underlyingPrice / Math.pow(10,36-cTokensAll_Cls[i].underlyingDecimals);
            var cToken_SupplyBalance = cTokensAll_Cls[i].balanceOfUnderlying / Math.pow(10,36-cTokensAll_Cls[i].underlyingDecimals);
            var cToken_BorrowBalance = cTokensAll_Cls[i].borrowBalanceCurrent / Math.pow(10,36-cTokensAll_Cls[i].underlyingDecimals);

            supplyBalance += cToken_SupplyBalance*cToken_Price;
            borrowBalance += cToken_BorrowBalance*cToken_Price;
        }
    }
    var borrowLimit = supplyBalance *0.75;

    var usedLimit = 0;
    if (borrowLimit>0){
        usedLimit=(borrowBalance/borrowLimit)*100;
    }

    var x = {
        "Supply Balance" :  String(Number(supplyBalance).toFixed(4)) + " $" ,
        "Borrow Balance" :  String(Number(borrowBalance).toFixed(4)) + " $" ,
        "COMP Balance" :    String(Number(accountCompBalance).toFixed(4)) + " $" ,
        "Borrow Limit" :    String(Number(borrowLimit).toFixed(2)) + " $" ,
        "Used Limit" :      String(Number(usedLimit).toFixed(2)) + " %" 
    }

    var htmlStr = "";
    for(item in x){
        //console.log(item + " : " + x[item]);
        htmlStr += "<tr><td class='OutCaptionA'>" + item + "</td></tr>";
        htmlStr += "<tr><td class='OutResultA'>" + x[item] + "</td></tr>";
    }

    tblAccMainInfo.innerHTML = htmlStr;
}

function compoundFinance_ViewSupplyAssets(Dictionary_referenceTable,minBalance) {
    //var mainddiv    = document.getElementById("div1");
    var tblAssets   = document.createElement("table");
    var thead       = document.createElement("thead");
    var tbody       = document.createElement("tbody");
    
    for(var i=0;i<cTokensAll_Cls.length;i++){
        if (i==0){// create table header before adding rows
            var tr = document.createElement("tr");
            for(var j=0;j<Dictionary_referenceTable.length;j++){
                var th = document.createElement("th");
                th.innerText = Dictionary_referenceTable[j].title;
                tr.appendChild(th);
            }
            thead.appendChild(tr);
            tblAssets.appendChild(thead);
        }
        if(cTokensAll_Cls[i].balanceOfUnderlying>minBalance){
            var tr = document.createElement("tr");
            for(var j=0;j<Dictionary_referenceTable.length;j++){
                var td = document.createElement("td");
                var varName = Dictionary_referenceTable[j].varName;
                var varVal = cTokensAll_Cls[i][varName];
                var cTokenAddr = cTokensAll_Cls[i]["address"];
                if(varName=="APY"){varVal = cTokensAll_Cls[i]["supplyAPY"];}
                var underlyingDecimals = cTokensAll_Cls[i]["underlyingDecimals"];
                if(varName=="AssetIn"){
                    var divSwitch = CreateToggleSwitch("switch_" + i,varVal,cTokenAddr);
                    td.appendChild (divSwitch) ;
                }else{
                    td.innerText = formatStringAccordingToVarName(varVal,varName,underlyingDecimals);
                }
                
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
    }
    tblAssets.appendChild(tbody);
    tblAssets.className="tokensTable";
    //mainddiv.appendChild(tblAssets);
    return(tblAssets);
}

function compoundFinance_ViewBorrowAssets(Dictionary_referenceTable,minBalance) {
    var tblAssets   = document.createElement("table");
    var thead       = document.createElement("thead");
    var tbody       = document.createElement("tbody");
    
    for(var i=0;i<cTokensAll_Cls.length;i++){
        if (i==0){// create table header before adding rows
            var tr = document.createElement("tr");
            for(var j=0;j<Dictionary_referenceTable.length;j++){
                var th = document.createElement("th");
                th.innerText = Dictionary_referenceTable[j].title;
                tr.appendChild(th);
            }
            thead.appendChild(tr);
            tblAssets.appendChild(thead);
        }
        if(cTokensAll_Cls[i].borrowBalanceCurrent>minBalance){
            var tr = document.createElement("tr");
            for(var j=0;j<Dictionary_referenceTable.length;j++){
                var td = document.createElement("td");
                var varName = Dictionary_referenceTable[j].varName;
                var varVal = cTokensAll_Cls[i][varName];
                if(varName=="APY"){varVal = cTokensAll_Cls[i]["borrowAPY"];}
                var underlyingDecimals = cTokensAll_Cls[i]["underlyingDecimals"];
                if(varName=="AssetIn"){
                    var divSwitch = CreateToggleSwitch("switch_" + i,varVal);
                    td.appendChild (divSwitch) ;
                }else{
                    td.innerText = formatStringAccordingToVarName(varVal,varName,underlyingDecimals);
                }
                
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
    }
    tblAssets.appendChild(tbody);
    tblAssets.className="tokensTable";
    //mainddiv.appendChild(tblAssets);
    return(tblAssets);
}

function formatStringAccordingToVarName(varValue, varName, decimals) {
    
    if(varName=="APY")                  {return Number(varValue).toFixed(4); }
    if(varName=="balanceOfUnderlying")  {return Number(varValue/Math.pow(10,36-decimals)).toFixed(4); }
    if(varName=="borrowBalanceCurrent") {return Number(varValue/Math.pow(10,36-decimals)).toFixed(4); }
    if(varName=="tokenBalance")         {return Number(varValue/Math.pow(10,36-decimals)).toFixed(4); }
    if(varName=="underlyingPrice")      {return Number(varValue/Math.pow(10,36-decimals)).toFixed(4); }
    if(varName=="AssetIn")              {return varValue;}

    if(varName=="name"){
        var str1 = String(varValue).replace("Compound","");
        var str2 = str1.replace("📈","");
        var str3 = str2.replace(/^\s+|\s+$/g, "");
        return  str3
    }
}

function CreateToggleSwitch(id,value,cTokenAddress) {
    var divSwitch = document.createElement("div");
    var inputSwitch = document.createElement("input");
    var labelSwitch = document.createElement("label");
    
    inputSwitch.id = id;
    inputSwitch.type = "checkbox";
    inputSwitch.className = "toggleSwitch_inpt";
    inputSwitch.checked = value;
    

    //labelSwitch.setAttribute("for", id)
    labelSwitch.className = "toggleSwitch_lbl";
    labelSwitch.setAttribute("onClick","ChangeCollateralPos('" + id + "','" + cTokenAddress + "')");
    

    divSwitch.appendChild(inputSwitch);
    divSwitch.appendChild(labelSwitch);
    divSwitch.style="width:100%;"
    return divSwitch;
}


function viewTab_SupplyingAssets(){
    var div1=document.getElementById("div1");
    var div2=document.getElementById("div2");
    var x1 = compoundFinance_ViewSupplyAssets(Dictionary_AssetsTable_Supply,0);
    var x2 = compoundFinance_ViewSupplyAssets(Dictionary_AllMarketsTable,-1);
    
    div1.innerHTML="";
    div2.innerHTML="";

    div1.appendChild(x1);
    div2.appendChild(x2);
}

function viewTab_BorrowingAssets(){
    var div1=document.getElementById("div1");
    var div2=document.getElementById("div2");
    var x1 = compoundFinance_ViewBorrowAssets(Dictionary_AssetsTable_Borrow,0);
    var x2 = compoundFinance_ViewBorrowAssets(Dictionary_AllMarketsTable,-1);
    
    div1.innerHTML="";
    div2.innerHTML="";

    div1.appendChild(x1);
    div2.appendChild(x2);
}

async function ChangeCollateralPos(id,cTokenAddress){
    var ElmntCheckBox = document.getElementById(id);
    var abi = await fetch(filePath_Abi);
    var addr = await fetch(filePath_Addr);

    const abi_Comptroller = await abi.json().then(result =>{return result.Comptroller;});
    const addr_Comptroller = await addr.json().then(result =>{return result.Contracts.Comptroller;});
    const contract_Comptroller = await new WEB3.eth.Contract(abi_Comptroller,addr_Comptroller);
    const signer = provider.getSigner();    
    
    var cTokensArr = [cTokenAddress];
    
    var ABIFunc="";
    if (ElmntCheckBox.checked==false){
        ABIFunc = contract_Comptroller.methods.enterMarkets(cTokensArr).encodeABI();
    }else{
        ABIFunc = contract_Comptroller.methods.exitMarket(cTokenAddress).encodeABI();
    }

    ShowMsgBox('Confirm this transaction...','Set this asset collateral on/off');
    var txObject={from: wallet_ActiveAccountAddr, to:addr_Comptroller, data:ABIFunc};
    try{
        const tx = await signer.sendTransaction(txObject); //todo : this type of transactions must handle in wallethelper.
    }catch(err){
        console.log("error: " + err);
    }
    HideMsgBox();
    
}