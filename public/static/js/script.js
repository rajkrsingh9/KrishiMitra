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
    fetch("../html/nav.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("navbar").innerHTML = data;
        });

    fetch("../html/footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer").innerHTML = data;
        });
});






document.addEventListener("DOMContentLoaded", function () {
    const steps = document.querySelectorAll(".form-step");
    const nextBtns = document.querySelectorAll(".next-btn");
    const prevBtns = document.querySelectorAll(".prev-btn");
    const progressBar = document.querySelector(".progress");
    let currentStep = 0;

    function updateFormSteps() {
        steps.forEach((step, index) => {
            step.classList.toggle("active", index === currentStep);
        });
        progressBar.style.width = `${(currentStep / (steps.length - 1)) * 100}%`;
    }

    nextBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            currentStep++;
            updateFormSteps();
        });
    });

    prevBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            currentStep--;
            updateFormSteps();
        });
    });

    updateFormSteps();
});








// document.getElementById("cropForm").addEventListener("submit", async function(event) {
//     event.preventDefault();  // Prevent form from refreshing the page

//     let farmerName = document.getElementById("farmerName").value;
//     let location = document.getElementById("location").value;
//     let landSize = document.getElementById("landSize").value;
//     let termPeriod = document.getElementById("termPeriod").value;
//     let lastCrop = document.getElementById("lastCrop").value;
//     let climateFactors = document.getElementById("climateFactors").value || "Use real-time data";
//     let soilFactors = document.getElementById("soilFactors").value || "Use real-time data";
//     let soilImage = document.getElementById("soilImage").files[0]; 

//     let responseDiv = document.getElementById("response");
//     responseDiv.innerHTML = "<p>⏳ Predicting best crops... Please wait.</p>";

//     let formData = new FormData();
//     formData.append("farmerName", farmerName);
//     formData.append("location", location);
//     formData.append("landSize", landSize);
//     formData.append("termPeriod", termPeriod);
//     formData.append("lastCrop", lastCrop);
//     formData.append("climateFactors", climateFactors);
//     formData.append("soilFactors", soilFactors);
//     if (soilImage) {
//         formData.append("soilImage", soilImage);
//     }

//     // Send data to AI Model (Replace with your Google AI Studio API URL)
//     let api_url = "AIzaSyCWAo0jYRE3_2TEnE182_oHkmIWktk67AU"; // Replace this with actual endpoint

//     try {
//         let response = await fetch(api_url, {
//             method: "POST",
//             body: formData
//         });

//         let result = await response.json();
//         displayResponse(result);
//     } catch (error) {
//         responseDiv.innerHTML = "<p> ❌ Error: Unable to get predictions. </p>";
//         console.error("Error:", error);
//     }
// });

// function displayResponse(result) {
//     let responseDiv = document.getElementById("response");
    
//     let crops = result.topCrops || [];
//     let outputHtml = "<h3>🌾 Recommended Crops:</h3><ul>";
    
//     crops.forEach(crop => {
//         outputHtml += `<li><strong>${crop.name}:</strong> ${crop.reason}</li>`;
//     });

//     outputHtml += "</ul>";
//     responseDiv.innerHTML = outputHtml;
// }

