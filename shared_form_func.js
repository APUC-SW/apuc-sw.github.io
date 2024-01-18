// CSS Automatic Applier
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

// Copyright function
const copyrights = document.querySelectorAll("p.copyright");

for (let copyright of copyrights) {
  copyright.innerHTML = "&copy; 2018-2024. APUC Software All rights reserved.";
}

/*
const today = new Date();
const year = today.getFullYear();

document.querySelector("#copyright").innerHTML =
  `© ${year}. APUC SW All rights reserved.`;*/
