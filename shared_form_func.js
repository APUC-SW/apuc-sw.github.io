// CSS Automatic Applier
fetch("/shared_form_style.css").then(response => {
    if (response.ok) {
        response.text().then(text => {
            document.head.appendChild(document.createTextNode(text));
        });
    }
});

// HTML Properties Applier
document.body.style.overflowX = "hidden";
document.body.style.overflowY = "auto";

const footer = document.querySelector("footer");

footer.style.fontSize = "10px";

// Copyright function
const copyrights = document.querySelectorAll("p.copyright-string");

for (let copyright of copyrights) {
  copyright.innerHTML = "© 2018-"
  +new Date().getFullYear()
  +". APUC Software All rights reserved.";
}

/*
const today = new Date();
const year = today.getFullYear();

document.querySelector("#copyright").innerHTML =
  `© ${year}. APUC SW All rights reserved.`;*/
