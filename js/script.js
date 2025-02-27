function toggleMenu() {
    const navLinks = document.getElementById("nav-links");
    const loginLink = document.getElementById("login-link");
    
    if (navLinks.style.display === "block") {
        navLinks.style.display = "none";
        loginLink.style.display = "none";
    } else {
        navLinks.style.display = "block";
        loginLink.style.display = "block";
    }
}


document.addEventListener("DOMContentLoaded", function() {
    fetch("nav.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("navbar").innerHTML = data;
        });

    fetch("footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer").innerHTML = data;
        });
});




