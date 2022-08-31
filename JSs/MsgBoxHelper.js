function ShowMsgBox(_title,_message){
    const bodyElmnt = document.getElementsByTagName("body")[0];
    var DivOuter = document.createElement("div");
    var DivInner = document.createElement("div");
    var divClose = document.createElement("div");

    var lblTitle = document.createElement("label");
    var lblMessage = document.createElement("label");

    DivOuter.id = "DivMsgBox";
    DivOuter.className = "MsgBox_Outer";
    DivInner.className = "MsgBox_Inner";
    divClose.className = "MsgBox_CloseBtn";
    lblTitle.className = "MsgBox_Title";
    lblMessage.className = "MsgBox_Message";

    divClose.setAttribute("onClick","HideMsgBox()");
    lblTitle.innerText= _title;
    lblMessage.innerText= _message;

    DivInner.appendChild(divClose);
    DivInner.appendChild(lblTitle);
    DivInner.appendChild(lblMessage);

    DivOuter.appendChild(DivInner);
    bodyElmnt.appendChild(DivOuter);
    
}

function HideMsgBox(){
    const bodyElmnt = document.getElementsByTagName("body")[0];
    var DivOuter = document.getElementById("DivMsgBox");
    bodyElmnt.removeChild(DivOuter);
}