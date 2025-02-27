const steps = document.querySelectorAll(".form-step");
const nextBtns = document.querySelectorAll(".next-btn");
const prevBtns = document.querySelectorAll(".prev-btn");
const progressBar = document.querySelector(".progress-bar");
const progressSteps = document.querySelectorAll(".progress-step");

let currentStep = 0;

nextBtns.forEach((button, index) => {
    button.addEventListener("click", () => {
        steps[currentStep].classList.remove("active");
        currentStep++;
        steps[currentStep].classList.add("active");
        updateProgress();
    });
});

prevBtns.forEach((button, index) => {
    button.addEventListener("click", () => {
        steps[currentStep].classList.remove("active");
        currentStep--;
        steps[currentStep].classList.add("active");
        updateProgress();
    });
});

function updateProgress() {
    progressSteps.forEach((step, index) => {
        if (index <= currentStep) {
            step.classList.add("active");
        } else {
            step.classList.remove("active");
        }
    });

    progressBar.style.width = `${(currentStep / (steps.length - 1)) * 100}%`;
}




document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("cropForm");
    const resultDiv = document.getElementById("crop-recommendations");

    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent page reload

        // Collect form data
        const formData = new FormData(form);
        const jsonData = {};
        formData.forEach((value, key) => jsonData[key] = value);

        try {
            // Send form data to backend
            const response = await fetch("http://localhost:5000/recommend", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(jsonData),
            });

            const data = await response.json();


            console.log(data.recommendations);

            function cleanJSON(response) {
                // Remove triple backticks and leading/trailing whitespace
                return response.replace(/```json|```/g, "").trim();
            }




    // Function to generate random colors for each box
    function getRandomColor() {
        const colors = ["#FF5733", "#33FF57", "#5733FF", "#F39C12", "#8E44AD"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Function to display the recommendations
    function displayCrops(recommendations) {
        // Parse JSON response


        let cleanResponse = typeof recommendations === "string" ? JSON.parse(cleanJSON(recommendations)) : recommendations;
        let crops = Array.isArray(cleanResponse) ? cleanResponse : cleanResponse.recommendations;
        console.log(crops);


        if (!Array.isArray(crops)) {
            throw new Error("Invalid response format: Expected an array.");
        }
        // Clear previous results
        resultDiv.innerHTML = "<h3>Recommended Crops:</h3>";

        // Create a container for the crop boxes
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.flexWrap = "wrap";
        container.style.justifyContent = "center";
        container.style.gap = "20px";

        // Generate crop boxes
        crops.forEach((crop) => {
            const cropBox = document.createElement("div");
            cropBox.style.width = "350px";
            cropBox.style.height = "450px";
            cropBox.style.display = "flex";
            cropBox.style.flexDirection = "column";
            cropBox.style.alignItems = "center";
            cropBox.style.justifyContent = "center";
            cropBox.style.backgroundColor = getRandomColor();
            cropBox.style.color = "white";
            cropBox.style.fontFamily = "Arial, sans-serif";
            cropBox.style.fontSize = "16px";
            cropBox.style.borderRadius = "10px";
            cropBox.style.padding = "10px";
            cropBox.style.margin = "50px 0";
            cropBox.style.textAlign = "center";
            cropBox.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";

            // Add crop name
            const cropName = document.createElement("h3");
            cropName.innerText = crop.crop;
            cropName.style.margin = "5px 0";

            // Add reason
            const cropReason = document.createElement("p");
            cropReason.innerText = crop.reason;
            cropReason.style.fontSize = "14px";
            cropReason.style.margin = "5px 0";

            // Append elements
            cropBox.appendChild(cropName);
            cropBox.appendChild(cropReason);
            container.appendChild(cropBox);
        });

        // Append container to resultDiv
        resultDiv.appendChild(container);
    }
    displayCrops(data.recommendations); 

        } catch (error) {
            console.error("Error fetching recommendations:", error);
            resultDiv.innerHTML = "<p style='color: red;'>Failed to get crop recommendations.</p>";
        }
        
    
    });
});
