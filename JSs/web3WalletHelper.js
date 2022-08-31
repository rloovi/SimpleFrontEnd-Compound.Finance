var web3 = new Web3();
var provider;
var wallet_AccountAddresses;
var wallet_ActiveAccountAddr;
var wallet_NetworkName;
var wallet_ChainId;

var chainNameDictionary={
    1: "Ethereum",
    2: "Ropsten",
    3: "kovan",
    4: "Rinkeby",
    5: "Goerli"
}

const walletHelper_ElmntAccId = "spnWallet";
const walletHelper_ElmntBlckchnInfo = "divBlockchainInfo";
const walletHelper_WaitGifAddr = "./images/img_wait1.png";

function walletHelper_viewInfo() {
    const elmntAcc = document.getElementById(walletHelper_ElmntAccId);
    var strAddr = String(wallet_ActiveAccountAddr);
    var accountAddrMinimal = strAddr.substring(0,7) + "..." + strAddr.substring(38,42);
    elmntAcc.innerText = accountAddrMinimal;
    //---
    const elmntBlckchnInfo = document.getElementById(walletHelper_ElmntBlckchnInfo);
    var blockchainLogoAddr = "./images/" + wallet_NetworkName + "_logo.png";
    var strHtml =  "<span>" + wallet_NetworkName + "</span>";
                    
    var img =  new Image(); 
    img.src = blockchainLogoAddr; //Todo: Some times dont work truely.
    if(img.width!=0){
        strHtml = "<img class='blockchainLogo' src=" + blockchainLogoAddr + ">" + strHtml;
    }
    elmntBlckchnInfo.innerHTML = strHtml;
}

function walletHelper_showWaitAnimation() {
    const elmnt = document.getElementById(walletHelper_ElmntAccId);
    elmnt.innerHTML="<img class='animationRotate' src=" + walletHelper_WaitGifAddr + ">";
}
function walletHelper_Disconected() {
    const elmntAcc = document.getElementById(walletHelper_ElmntAccId);
    elmntAcc.innerHTML="Connect Wallet";
    const elmntBlckchnInfo = document.getElementById(walletHelper_ElmntBlckchnInfo);
    elmntBlckchnInfo.innerHTML="";
}

async function walletHelper_walletConnected(){
    wallet_ActiveAccountAddr = wallet_AccountAddresses[0];
    var netWork = await provider.getNetwork();
    wallet_ChainId = netWork.chainId;
    wallet_NetworkName= chainNameDictionary[wallet_ChainId];
    walletHelper_viewInfo();
    ConnectToContract();
}

async function walletHelper_checkConnection(){
    walletHelper_showWaitAnimation();
    try{
        if(!window.ethereum) throw new Error("No crypto wallet found.");
        provider = new ethers.providers.Web3Provider(window.ethereum);
        wallet_AccountAddresses = await provider.listAccounts();
        if(wallet_AccountAddresses.length>0){
            await walletHelper_walletConnected();
        }else{
            walletHelper_Disconected();
        }
    }catch(err){
        walletHelper_ErrorHandler(err);
    }
}

async function walletHelper_ConnectToWallet(){
    walletHelper_showWaitAnimation();
    try{
        if(!window.ethereum) throw new Error("No crypto wallet found.");
        provider = new ethers.providers.Web3Provider(window.ethereum);
        wallet_AccountAddresses = await provider.send('eth_requestAccounts',[]);
        if(wallet_AccountAddresses.length>0){
            await walletHelper_walletConnected();
        }else{
            walletHelper_Disconected();
        }
    }catch(err){
        walletHelper_ErrorHandler(err);

    }
}

function walletHelper_ErrorHandler(err) {
    if (err.code==4001){ //User rejected the request.
        walletHelper_Disconected();
    }else{
        walletHelper_Disconected();
        console.log(err);
        alert(err.message);
    }
}

window.ethereum.on('accountsChanged',async (accounts) =>{
    walletHelper_checkConnection();
  })

window.ethereum.on('chainChanged',async (chainid) =>{
    walletHelper_checkConnection();
  })


function ConnectToContract() {
    compoundFinance_Main(wallet_ChainId,wallet_ActiveAccountAddr)
}

