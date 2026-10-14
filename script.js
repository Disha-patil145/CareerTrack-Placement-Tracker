// ==========================================
// CAREERTRACK - JOB APPLICATION TRACKER
// ==========================================

// ==========================================
// 1. GET HTML ELEMENTS
// ==========================================

const applicationForm = document.getElementById("applicationForm");
const applicationList = document.getElementById("applicationList");

const totalApplications = document.getElementById("totalApplications");
const totalInterviews = document.getElementById("totalInterviews");

// ==========================================
// 2. LOAD SAVED APPLICATIONS
// ==========================================

let applications = JSON.parse(
    localStorage.getItem("careerTrackApplications") || "[]"
);

let editingIndex = null;

// ==========================================
// 3. SAVE APPLICATIONS
// ==========================================

function saveApplications() {
    localStorage.setItem(
        "careerTrackApplications",
        JSON.stringify(applications)
    );
}

// ==========================================
// 4. RENDER APPLICATIONS
// ==========================================

function renderApplications() {
    applicationList.innerHTML = "";

    const searchInput = document.getElementById("searchApplication");
    const filterStatus = document.getElementById("filterStatus");

    const searchText = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const selectedStatus = filterStatus
        ? filterStatus.value
        : "All";

    // Search and filter applications.
    // Keep the original array index so Edit and Delete work
    // even when the table is filtered.
    const filteredApplications = applications
        .map((application, index) => ({
            ...application,
            originalIndex: index
        }))
        .filter(application => {
            const company = (application.company || "").toLowerCase();
            const role = (application.role || "").toLowerCase();

            const matchesSearch =
                company.includes(searchText) ||
                role.includes(searchText);

            const matchesStatus =
                selectedStatus === "All" ||
                application.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });

    // Display an empty message when no applications match.
    if (filteredApplications.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;

        cell.textContent = applications.length === 0
            ? "No applications added yet."
            : "No matching applications found.";

        row.appendChild(cell);
        applicationList.appendChild(row);
    }

    // Display matching applications.
    filteredApplications.forEach(application => {
        const index = application.originalIndex;

        const row = document.createElement("tr");

        // Company
        const companyCell = document.createElement("td");
        companyCell.textContent = application.company || "";

        // Job role
        const roleCell = document.createElement("td");
        roleCell.textContent = application.role || "";

        // Application date
        const applicationDateCell = document.createElement("td");
        applicationDateCell.textContent =
            application.applicationDate || "Not provided";

        // Follow-up date
        const followUpDateCell = document.createElement("td");
        followUpDateCell.textContent =
            application.followUpDate || "Not scheduled";

        // Status badge
        const statusCell = document.createElement("td");
        const badge = document.createElement("span");

        const currentStatus = application.status || "Applied";

        badge.className =
            "status-badge status-" + currentStatus.toLowerCase();

        badge.textContent = currentStatus;

        statusCell.appendChild(badge);

        // Action buttons
        const actionCell = document.createElement("td");

        // ==========================================
        // EDIT BUTTON
        // ==========================================

        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.style.width = "auto";
        editButton.style.marginRight = "8px";

        editButton.addEventListener("click", () => {
            // Fill the form with the selected application's data.
            document.getElementById("company").value =
                application.company || "";

            document.getElementById("role").value =
                application.role || "";

            document.getElementById("applicationDate").value =
                application.applicationDate || "";

            document.getElementById("followUpDate").value =
                application.followUpDate || "";

            document.getElementById("status").value =
                currentStatus;

            // Remember which application is being edited.
            editingIndex = index;

            // Change the submit button's label.
            applicationForm.querySelector(
                'button[type="submit"]'
            ).textContent = "Update Application";

            // Scroll to the form.
            applicationForm.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        });

        // ==========================================
        // DELETE BUTTON
        // ==========================================

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            const confirmed = confirm(
                "Are you sure you want to delete this application?"
            );

            if (!confirmed) {
                return;
            }

            applications.splice(index, 1);

            // Keep the editing index correct after deletion.
            if (editingIndex === index) {
                resetForm();
            } else if (
                editingIndex !== null &&
                editingIndex > index
            ) {
                editingIndex--;
            }

            saveApplications();
            renderApplications();
        });

        actionCell.append(editButton, deleteButton);

        // Add all six cells to the row.
        row.append(
            companyCell,
            roleCell,
            applicationDateCell,
            followUpDateCell,
            statusCell,
            actionCell
        );

        applicationList.appendChild(row);
    });

    // ==========================================
    // UPDATE DASHBOARD STATISTICS
    // ==========================================

    totalApplications.textContent = applications.length;

    totalInterviews.textContent = applications.filter(
        application => application.status === "Interview"
    ).length;
}

// ==========================================
// 5. RESET APPLICATION FORM
// ==========================================

function resetForm() {
    applicationForm.reset();

    editingIndex = null;

    applicationForm.querySelector(
        'button[type="submit"]'
    ).textContent = "Add Application";
}

// ==========================================
// 6. ADD OR UPDATE APPLICATION
// ==========================================

applicationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Read form values.
    const company = document.getElementById("company").value.trim();
    const role = document.getElementById("role").value.trim();

    const applicationDate =
        document.getElementById("applicationDate").value;

    const followUpDate =
        document.getElementById("followUpDate").value;

    const status = document.getElementById("status").value;

    // Validate required fields.
    if (!company || !role || !applicationDate) {
        alert(
            "Please enter the company name, job role, and application date."
        );
        return;
    }

    // Ensure the follow-up date is not earlier than the application date.
    if (followUpDate && followUpDate < applicationDate) {
        alert(
            "Follow-up date cannot be earlier than the application date."
        );
        return;
    }

    // Create the application object.
    const application = {
        company,
        role,
        applicationDate,
        followUpDate,
        status
    };

    // Update the existing application or add a new one.
    if (editingIndex !== null) {
        if (
            editingIndex < 0 ||
            editingIndex >= applications.length
        ) {
            alert("Application not found. Please try again.");
            resetForm();
            return;
        }

        // Update individual fields without replacing unrelated data.
        applications[editingIndex].company = company;
        applications[editingIndex].role = role;
        applications[editingIndex].applicationDate = applicationDate;
        applications[editingIndex].followUpDate = followUpDate;
        applications[editingIndex].status = status;

    } else {
        // Add a new application.
        applications.push(application);
    }

    // Save data, refresh the table, and reset the form.
    saveApplications();
    renderApplications();
    resetForm();
});

// ==========================================
// PLACEMENT PREPARATION TRACKER
// ==========================================

// ==========================================
// 7. SKILL NAMES
// ==========================================

const skillNames = [
    "dsa",
    "dbms",
    "os",
    "networks",
    "oops"
];

// ==========================================
// 8. LOAD SAVED SKILL PROGRESS
// ==========================================

let skillProgress = JSON.parse(
    localStorage.getItem("careerTrackSkillProgress") || "{}"
);

// ==========================================
// 9. DISPLAY SKILL PROGRESS
// ==========================================

function renderSkillProgress() {
    let totalProgress = 0;

    skillNames.forEach(skill => {
        const progress = Number(skillProgress[skill] ?? 0);

        // Update individual progress bar.
        document.getElementById(skill).value = progress;

        // Update percentage input.
        document.getElementById(skill + "Input").value = progress;

        // Update progress text.
        document.getElementById(skill + "Text").textContent =
            progress + "% completed";

        totalProgress += progress;
    });

    // Calculate average preparation progress.
    const averageProgress = Math.round(
        totalProgress / skillNames.length
    );

    // Update dashboard percentage.
    document.getElementById("overallProgress").textContent =
        averageProgress + "%";

    // Update dashboard progress bar.
    document.getElementById("overallProgressBar").value =
        averageProgress;
}

// ==========================================
// 10. SAVE SKILL PROGRESS
// ==========================================

document.querySelectorAll("[data-skill]").forEach(button => {
    button.addEventListener("click", () => {
        const skill = button.dataset.skill;

        const input = document.getElementById(skill + "Input");
        const progress = Number(input.value);

        // Validate the percentage.
        if (
            input.value.trim() === "" ||
            !Number.isInteger(progress) ||
            progress < 0 ||
            progress > 100
        ) {
            alert(
                "Please enter a whole number between 0 and 100."
            );
            return;
        }

        // Save progress.
        skillProgress[skill] = progress;

        localStorage.setItem(
            "careerTrackSkillProgress",
            JSON.stringify(skillProgress)
        );

        // Refresh progress display.
        renderSkillProgress();

        alert("Preparation progress saved successfully!");
    });
});

// ==========================================
// 11. SEARCH APPLICATIONS
// ==========================================

const searchApplication =
    document.getElementById("searchApplication");

if (searchApplication) {
    searchApplication.addEventListener(
        "input",
        renderApplications
    );
}

// ==========================================
// 12. FILTER APPLICATIONS
// ==========================================

const filterStatus = document.getElementById("filterStatus");

if (filterStatus) {
    filterStatus.addEventListener(
        "change",
        renderApplications
    );
}

// ==========================================
// 13. INITIALIZE CAREERTRACK
// ==========================================

// Display saved applications.
renderApplications();

// Display saved preparation progress.
renderSkillProgress();