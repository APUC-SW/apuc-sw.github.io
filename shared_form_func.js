fetch("/shared_form_style.css").then(response => {
    if (response.ok) {
        response.text().then(text => {
            document.head.appendChild(document.createTextNode(text));
        });
    }
});

document.body.style.overflowX = "hidden";
document.body.style.overflowY = "auto";

const footer = document.querySelector("footer");

footer.style.fontSize = "10px";

const today = new Date();
const year = today.getFullYear();

document.querySelector("#copyright").innerHTML =
  `© ${year}. APUC SW All rights reserved.`;