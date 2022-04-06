const backLink = document.getElementById('back');

backLink?.addEventListener("click", startRedirect);

function startRedirect() {
    window.location.href = "/index.html";
}