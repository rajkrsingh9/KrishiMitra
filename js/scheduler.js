async function scheduleEvent() {
    const summary = document.getElementById("eventSummary").value;
    const dateTimeInput = document.getElementById("eventDateTime").value;

    if (!summary || !dateTimeInput) {
        alert("Please fill in all fields.");
        return;
    }

    // Convert datetime-local to ISO format (Google Calendar requires this format)
    const dateTime = new Date(dateTimeInput).toISOString();

    const response = await fetch("http://localhost:5000/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary, dateTime }),
    });

    const data = await response.json();
    document.getElementById("result").innerHTML = data.success 
        ? `Event Scheduled: <a href="${data.link}" target="_blank">View Event</a>` 
        : "Failed to schedule.";
}

fetch("http://localhost:5000/schedule", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      summary: "Irrigation Check",
      dateTime: "2025-03-01T08:00:00+05:30"
    })
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Error:", error));
  