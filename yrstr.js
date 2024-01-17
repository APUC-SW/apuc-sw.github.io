const today = new Date();
const year = today.getFullYear();

document.querySelector("#copyright").innerHTML =
  `© ${year}. APUC SW All rights reserved.`;