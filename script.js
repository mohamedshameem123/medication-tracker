const API = "/api/medicines";

const container = document.getElementById("medicineTableBody");
const form = document.getElementById("medicineForm");
const message = document.getElementById("formMessage");

const stats = {
    total: document.getElementById("statTotal"),
    taken: document.getElementById("statTaken"),
    pending: document.getElementById("statPending"),
    missed: document.getElementById("statMissed"),
};

// ✅ INIT
document.addEventListener("DOMContentLoaded", () => {
    setTodayDate();
    loadMedicines();
});

// 📅 Set today's date
function setTodayDate() {
    const today = new Date();
    document.getElementById("todayDate").textContent =
        today.toLocaleDateString();

    document.getElementById("date").value =
        today.toISOString().split("T")[0];
}

// 🔄 API helper
async function apiCall(url, options = {}) {
    try {
        const res = await fetch(url, options);

        if (!res.ok) throw new Error("Server error");

        return await res.json();
    } catch (err) {
        showMessage("⚠️ Network error", "error");
        console.error(err);
        return null;
    }
}

// 📥 Load medicines
async function loadMedicines() {
    showLoading();

    const data = await apiCall(API);
    if (!data) return;

    renderMedicines(data);
    updateStats(data);
}

// 🔄 Loading UI
function showLoading() {
    container.innerHTML = `<p style="opacity:.7">Loading...</p>`;
}

// 🧱 Render cards
function renderMedicines(data) {
    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = `<p>No medicines yet</p>`;
        return;
    }

    const fragment = document.createDocumentFragment();

    data.forEach(med => {
        const card = document.createElement("div");
        card.className = "med-card";

        card.innerHTML = `
            <div>
                <strong>${escapeHTML(med.name)}</strong><br>
                ${escapeHTML(med.dosage)} • ${med.time}
            </div>

            <div>
                <span class="status ${med.status.toLowerCase()}">
                    ${med.status}
                </span>
                <br>
                <button onclick="updateStatus(${med.id}, 'TAKEN')">✔</button>
                <button onclick="updateStatus(${med.id}, 'MISSED')">✖</button>
                <button onclick="deleteMedicine(${med.id})">🗑</button>
            </div>
        `;

        fragment.appendChild(card);
    });

    container.appendChild(fragment);
}

// 📊 Stats
function updateStats(data) {
    let taken = 0, missed = 0, pending = 0;

    data.forEach(m => {
        const s = m.status || "PENDING";
        if (s === "TAKEN") taken++;
        else if (s === "MISSED") missed++;
        else pending++;
    });

    stats.total.textContent = data.length;
    stats.taken.textContent = taken;
    stats.missed.textContent = missed;
    stats.pending.textContent = pending;
}

// ➕ Add medicine
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        name: medName.value.trim(),
        dosage: dosage.value.trim(),
        time: time.value,
        date: date.value,
        notes: notes.value.trim(),
    };

    if (!payload.name || !payload.dosage) {
        return showMessage("Fill all required fields", "error");
    }

    showMessage("Saving...", "info");

    await apiCall(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    form.reset();
    setTodayDate();

    showMessage("✔ Added successfully", "success");
    loadMedicines();
});

// 🔄 Update status
async function updateStatus(id, status) {
    await apiCall(`${API}/${id}/status?status=${status}`, {
        method: "PUT",
    });

    loadMedicines();
}

// ❌ Delete
async function deleteMedicine(id) {
    if (!confirm("Delete this medicine?")) return;

    await apiCall(`${API}/${id}`, {
        method: "DELETE",
    });

    showMessage("Deleted", "info");
    loadMedicines();
}

// 💬 Message system
function showMessage(text, type) {
    message.textContent = text;

    const colors = {
        success: "#4ade80",
        error: "#f87171",
        info: "#60a5fa",
    };

    message.style.color = colors[type] || "#fff";

    setTimeout(() => {
        message.textContent = "";
    }, 2000);
}

// 🔒 Escape HTML
function escapeHTML(str) {
    return str.replace(/[&<>"']/g, m => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    })[m]);
}