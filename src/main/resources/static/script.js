const API_BASE = "/api/medicines";

const todayDateEl = document.getElementById("todayDate");
const form = document.getElementById("medicineForm");
const formMsg = document.getElementById("formMessage");
const tbody = document.getElementById("medicineTableBody");
const emptyState = document.getElementById("emptyState");

// Stats elements
const statTotal = document.getElementById("statTotal");
const statTaken = document.getElementById("statTaken");
const statPending = document.getElementById("statPending");
const statMissed = document.getElementById("statMissed");

// Set today's date in header and form
document.addEventListener("DOMContentLoaded", () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    todayDateEl.textContent = `Today • ${dd}-${mm}-${yyyy}`;

    const dateInput = document.getElementById("date");
    if (dateInput) {
        dateInput.value = todayStr;
    }

    loadMedicines();
});

// Load all medicines from backend
async function loadMedicines() {
    try {
        const res = await fetch(API_BASE);
        if (!res.ok) {
            throw new Error("Failed to load medicines");
        }
        const data = await res.json();
        renderTable(data);
        updateStats(data);
    } catch (err) {
        console.error(err);
        tbody.innerHTML = "";
        emptyState.textContent = "Unable to load data. Please try again.";
        emptyState.style.display = "block";
    }
}

function renderTable(medicines) {
    tbody.innerHTML = "";

    if (!medicines || medicines.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    medicines.forEach((med) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${escapeHtml(med.name)}</td>
            <td>${escapeHtml(med.dosage)}</td>
            <td>${med.time ?? ""}</td>
            <td>${med.date ?? ""}</td>
            <td>${renderStatusPill(med.status)}</td>
            <td>${med.notes ? escapeHtml(med.notes) : ""}</td>
            <td class="col-actions">
                <div class="row-actions">
                    <button class="btn-pill btn-taken" onclick="changeStatus(${med.id}, 'TAKEN')">Taken</button>
                    <button class="btn-pill btn-missed" onclick="changeStatus(${med.id}, 'MISSED')">Missed</button>
                    <button class="btn-pill btn-delete" onclick="deleteMedicine(${med.id})">Delete</button>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function renderStatusPill(status) {
    const normalized = (status || "PENDING").toUpperCase();
    let cls = "status-pending";
    let label = "Pending";

    if (normalized === "TAKEN") {
        cls = "status-taken";
        label = "Taken";
    } else if (normalized === "MISSED") {
        cls = "status-missed";
        label = "Missed";
    }

    return `<span class="status-pill ${cls}">${label}</span>`;
}

function updateStats(medicines) {
    let total = medicines.length;
    let taken = 0;
    let pending = 0;
    let missed = 0;

    medicines.forEach((med) => {
        const s = (med.status || "PENDING").toUpperCase();
        if (s === "TAKEN") taken++;
        else if (s === "MISSED") missed++;
        else pending++;
    });

    statTotal.textContent = total;
    statTaken.textContent = taken;
    statPending.textContent = pending;
    statMissed.textContent = missed;
}

// Handle add medicine form
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formMsg.textContent = "";

    const name = document.getElementById("medName").value.trim();
    const dosage = document.getElementById("dosage").value.trim();
    const time = document.getElementById("time").value;
    const date = document.getElementById("date").value;
    const notes = document.getElementById("notes").value.trim();

    if (!name || !dosage || !time || !date) {
        formMsg.textContent = "Please fill all required fields.";
        formMsg.style.color = "#f97373";
        return;
    }

    const payload = {
        name,
        dosage,
        time,  // "HH:mm"
        date,  // "YYYY-MM-DD"
        notes,
    };

    try {
        const res = await fetch(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            throw new Error("Failed to save medicine");
        }

        await loadMedicines();
        form.reset();
        // reset date to today
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        document.getElementById("date").value = `${yyyy}-${mm}-${dd}`;

        formMsg.textContent = "Medicine saved successfully.";
        formMsg.style.color = "#4ade80";
    } catch (err) {
        console.error(err);
        formMsg.textContent = "Error while saving. Please try again.";
        formMsg.style.color = "#f97373";
    }
});

// Change status
async function changeStatus(id, status) {
    try {
        const res = await fetch(`${API_BASE}/${id}/status?status=${status}`, {
            method: "PUT",
        });
        if (!res.ok) {
            throw new Error("Failed to update status");
        }
        await loadMedicines();
    } catch (err) {
        console.error(err);
        alert("Could not update status. Check console for details.");
    }
}

// Delete medicine
async function deleteMedicine(id) {
    if (!confirm("Delete this medicine?")) return;

    try {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) {
            throw new Error("Failed to delete");
        }
        await loadMedicines();
    } catch (err) {
        console.error(err);
        alert("Could not delete. Check console for details.");
    }
}

// Simple HTML escape to avoid issues
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
