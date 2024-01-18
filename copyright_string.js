const template = `
  <p>{{text}}</p>
`;

function render(text) {
  const div = document.getElementById("content");
  div.innerHTML = template.replace("{{text}}", text);
}

render("© 2018-2024. APUC Software All rights reserved.");