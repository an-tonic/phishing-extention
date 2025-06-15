const explanationPopup = document.createElement("div");
explanationPopup.id = "explanation-popup";
explanationPopup.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #fff;
    color: #000;
    padding: 12px 12px;
    border: 1px solid #ccc;
    border-radius: 6px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    max-width: 300px;
    z-index: 10000;
    display: none;
`;

const contentDiv = document.createElement("div");
contentDiv.id = "explanation-content";
explanationPopup.appendChild(contentDiv);

const closeBtn = document.createElement("div");
closeBtn.id = "explanation-close";
closeBtn.textContent = "✖";
closeBtn.style.cssText = `
    position: absolute;
    top: 4px;
    right: 6px;
    cursor: pointer;
`;
closeBtn.onclick = () => {
    explanationPopup.style.display = "none";
};

explanationPopup.appendChild(closeBtn);
document.body.appendChild(explanationPopup);

export { explanationPopup, contentDiv as explanationContent };
