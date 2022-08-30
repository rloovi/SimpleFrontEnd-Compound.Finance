function ShowMsgBox(_message){
    const bodyElmnt = document.getElementsByTagName("body")[0];
    var DivOuter = document.createElement("div");
    var DivInner = document.createElement("div");

    DivOuter.id = "DivMsgBox";
    DivOuter.className = "MsgBox_outer";
    DivInner.className = "MsgBox_Inner";
    

    DivInner.innerText= _message;

    DivOuter.appendChild(DivInner);
    bodyElmnt.appendChild(DivOuter);
    
}

function HideMsgBox(){
    const bodyElmnt = document.getElementsByTagName("body")[0];
    var DivOuter = document.getElementById("DivMsgBox");
    bodyElmnt.removeChild(DivOuter);
}