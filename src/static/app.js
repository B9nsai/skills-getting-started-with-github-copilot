document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const participantsList = document.getElementById("participants-list");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list using renderActivities
      renderActivities(activities);

      // Populate select dropdown
      Object.keys(activities).forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Refresh activities to update participants list
      fetchActivities();

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Helper to create a participants section
  function createParticipantsSection(participants) {
    const section = document.createElement('div');
    section.className = 'participants-section';
    const title = document.createElement('div');
    title.className = 'participants-title';
    title.textContent = 'Participants:';
    section.appendChild(title);
    if (participants && participants.length > 0) {
      const list = document.createElement('ul');
      list.className = 'participants-list';
      participants.forEach(email => {
        const li = document.createElement('li');
        li.textContent = email;
        list.appendChild(li);
      });
      section.appendChild(list);
    } else {
      const none = document.createElement('div');
      none.className = 'participants-none';
      none.textContent = 'No participants yet.';
      section.appendChild(none);
    }
    return section;
  }

  // Patch the code that renders activities
  function renderActivities(activities) {
    const activitiesList = document.getElementById('activities-list');
    activitiesList.innerHTML = '';
    Object.entries(activities).forEach(([name, info]) => {
      const card = document.createElement('div');
      card.className = 'activity-card';
      card.innerHTML = `
        <h4>${name}</h4>
        <p><strong>Description:</strong> ${info.description}</p>
        <p><strong>Schedule:</strong> ${info.schedule}</p>
        <p><strong>Max Participants:</strong> ${info.max_participants}</p>
      `;
      // Add participants section
      card.appendChild(createParticipantsSection(info.participants));
      activitiesList.appendChild(card);
    });
  }

  // Initialize app
  fetchActivities();
});
