// ======================================
// LOGIN SYSTEM
// ======================================

const loginButton = document.getElementById("loginButton");

if (loginButton) {
    const correctUser = "admin";
    const correctPassword = "1234";

    loginButton.addEventListener("click", function () {
        const userId = document.getElementById("userId").value.trim();
        const password = document.getElementById("password").value.trim();

        if (userId === "" || password === "") {
            alert("Please fill in all fields");
            return;
        }

        if (userId === correctUser && password === correctPassword) {
            window.location.href = "dashboard.html";
        } else {
            alert("Wrong user id or password");
        }
    });
}



// ======================================
// DASHBOARD ELEMENTS
// ======================================

const openModalButton = document.getElementById("openModalButton");
const addModal = document.getElementById("addModal");
const closeModalButton = document.getElementById("closeModalButton");
const saveRecordButton = document.getElementById("saveRecordButton");
const tableBody = document.getElementById("tableBody");

const editSelectedButton = document.getElementById("editSelectedButton");
const deleteSelectedButton = document.getElementById("deleteSelectedButton");

const modalTitle = document.getElementById("modalTitle");

const deleteModal = document.getElementById("deleteModal");
const confirmDeleteButton = document.getElementById("confirmDeleteButton");
const cancelDeleteButton = document.getElementById("cancelDeleteButton");

const documentModal = document.getElementById("documentModal");
const closeDocumentModalButton = document.getElementById("closeDocumentModalButton");
const saveDocumentButton = document.getElementById("saveDocumentButton");
const documentInput = document.getElementById("documentInput");
const documentListArea = document.getElementById("documentListArea");
const documentPreviewArea = document.getElementById("documentPreviewArea");

const mapModal = document.getElementById("mapModal");
const closeMapModalButton = document.getElementById("closeMapModalButton");
const routeMapFrame = document.getElementById("routeMapFrame");
const selectedRouteText = document.getElementById("selectedRouteText");

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const paginationButtons = document.querySelectorAll(".pagination-area button");
const paginationText = document.querySelector(".pagination-area span");
const previousButton = paginationButtons[0];
const nextButton = paginationButtons[1];



// ======================================
// APP STATE
// ======================================

let records = [];
let selectedIndex = null;
let activeDocumentIndex = null;
let editMode = false;
let searchText = "";

const rowsPerPage = 10;
let currentPage = 1;



// ======================================
// LOCAL STORAGE
// ======================================

function saveRecordsToLocalStorage() {
    localStorage.setItem("carRouteRecords", JSON.stringify(records));
}

function loadRecordsFromLocalStorage() {
    const savedRecords = JSON.parse(localStorage.getItem("carRouteRecords"));

    if (savedRecords && Array.isArray(savedRecords)) {
        records = savedRecords;

        records.forEach(function (record) {
            if (!Array.isArray(record.documents)) {
                record.documents = [];

                if (record.documentName && record.documentFile) {
                    record.documents.push({
                        id: Date.now() + Math.random(),
                        name: record.documentName,
                        file: record.documentFile,
                        type: record.documentType || ""
                    });
                }
            }

            delete record.documentName;
            delete record.documentFile;
            delete record.documentType;
        });
    } else {
        records = [];
    }
}



// ======================================
// SAMPLE DATA
// ======================================

function createSampleRecords() {
    const firstNames = [
        "Ahmet", "Mehmet", "Ali", "Veli", "Mustafa",
        "Hasan", "Huseyin", "Ibrahim", "Yusuf", "Emre"
    ];

    const lastNames = [
        "Yilmaz", "Kaya", "Demir", "Sahin", "Celik",
        "Arslan", "Aydin", "Ozdemir", "Aslan", "Dogan"
    ];

    const vehicles = [
        "Ford Transit",
        "Fiat Doblo",
        "Renault Kangoo",
        "Volkswagen Crafter",
        "Mercedes Sprinter",
        "Peugeot Partner",
        "Citroen Berlingo",
        "Iveco Daily",
        "Toyota Hilux",
        "Isuzu D-Max"
    ];

    const routes = [
        "Antalya Kemer",
        "Antalya Alanya",
        "Antalya Manavgat",
        "Antalya Serik",
        "Antalya Finike",
        "Antalya Kas",
        "Antalya Korkuteli",
        "Antalya Elmali",
        "Antalya Gazipasa",
        "Antalya Demre"
    ];

    const sampleRecords = [];

    for (let i = 1; i <= 100; i++) {
        const firstName = firstNames[(i - 1) % firstNames.length];
        const lastName = lastNames[(i - 1) % lastNames.length];
        const vehicle = vehicles[(i - 1) % vehicles.length];
        const route = routes[(i - 1) % routes.length];
        const plateNumber = 100 + i;
        const plate = `07 CR ${plateNumber}`;

        sampleRecords.push({
            no: i,
            firstName: firstName,
            lastName: lastName,
            vehicle: vehicle,
            plate: plate,
            route: route,
            documents: []
        });
    }

    return sampleRecords;
}

function seedSampleRecordsIfEmpty() {
    if (records.length === 0) {
        records = createSampleRecords();
        saveRecordsToLocalStorage();
    }
}



// ======================================
// FORM MODAL
// ======================================

if (openModalButton && addModal && closeModalButton) {
    openModalButton.addEventListener("click", function () {
        editMode = false;

        if (modalTitle) {
            modalTitle.textContent = "Add New Record";
        }

        clearFormFields();
        addModal.classList.add("show");
    });

    closeModalButton.addEventListener("click", function () {
        editMode = false;

        if (modalTitle) {
            modalTitle.textContent = "Add New Record";
        }

        addModal.classList.remove("show");
    });
}



// ======================================
// SAVE SYSTEM
// ======================================

if (saveRecordButton && tableBody) {
    saveRecordButton.addEventListener("click", function () {
        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const vehicle = document.getElementById("vehicle").value.trim();
        const plate = document.getElementById("plate").value.trim();
        const route = document.getElementById("route").value.trim();

        if (
            firstName === "" ||
            lastName === "" ||
            vehicle === "" ||
            plate === "" ||
            route === ""
        ) {
            alert("Please fill in all fields");
            return;
        }

        if (editMode && selectedIndex !== null) {
            records[selectedIndex].firstName = firstName;
            records[selectedIndex].lastName = lastName;
            records[selectedIndex].vehicle = vehicle;
            records[selectedIndex].plate = plate;
            records[selectedIndex].route = route;

            editMode = false;
        } else {
            const newRecord = {
                no: records.length + 1,
                firstName: firstName,
                lastName: lastName,
                vehicle: vehicle,
                plate: plate,
                route: route,
                documents: []
            };

            records.push(newRecord);
            currentPage = Math.ceil(records.length / rowsPerPage);
        }

        saveRecordsToLocalStorage();
        renderTable();
        clearFormFields();

        if (modalTitle) {
            modalTitle.textContent = "Add New Record";
        }

        if (addModal) {
            addModal.classList.remove("show");
        }
    });
}



// ======================================
// FORM CLEAR
// ======================================

function clearFormFields() {
    const firstName = document.getElementById("firstName");
    const lastName = document.getElementById("lastName");
    const vehicle = document.getElementById("vehicle");
    const plate = document.getElementById("plate");
    const route = document.getElementById("route");

    if (firstName) firstName.value = "";
    if (lastName) lastName.value = "";
    if (vehicle) vehicle.value = "";
    if (plate) plate.value = "";
    if (route) route.value = "";
}



// ======================================
// FILTER + PAGINATION
// ======================================

function getFilteredRecords() {
    return records.filter(function (record) {
        const fullText = `
            ${record.firstName}
            ${record.lastName}
            ${record.vehicle}
            ${record.plate}
            ${record.route}
        `.toLowerCase();

        return fullText.includes(searchText.toLowerCase());
    });
}

function getTotalPages() {
    const filteredRecords = getFilteredRecords();
    return Math.max(1, Math.ceil(filteredRecords.length / rowsPerPage));
}

function updatePaginationUI(customTotalPages) {
    const totalPages = customTotalPages || getTotalPages();

    if (paginationText) {
        paginationText.textContent = `Page ${currentPage} / ${totalPages}`;
    }

    if (previousButton) {
        previousButton.disabled = currentPage === 1;
        previousButton.style.opacity = currentPage === 1 ? "0.5" : "1";
    }

    if (nextButton) {
        nextButton.disabled = currentPage === totalPages;
        nextButton.style.opacity = currentPage === totalPages ? "0.5" : "1";
    }
}



// ======================================
// TABLE RENDER
// ======================================

function renderTable() {
    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    if (records.length === 0) {
        currentPage = 1;
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-row">No records yet.</td>
            </tr>
        `;
        updatePaginationUI(1);
        return;
    }

    const filteredRecords = getFilteredRecords();

    if (filteredRecords.length === 0) {
        currentPage = 1;
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-row">No matching records found.</td>
            </tr>
        `;
        updatePaginationUI(1);
        return;
    }

    const totalPages = Math.max(1, Math.ceil(filteredRecords.length / rowsPerPage));

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageRecords = filteredRecords.slice(startIndex, endIndex);

    pageRecords.forEach(function (record, pageIndex) {
        const realRecord = pageRecords[pageIndex];
        const realIndex = records.indexOf(realRecord);
        const documentCount = Array.isArray(record.documents) ? record.documents.length : 0;

        tableBody.innerHTML += `
            <tr class="data-row" data-index="${realIndex}">
                <td>${record.no}</td>
                <td>${record.firstName}</td>
                <td>${record.lastName}</td>
                <td>${record.vehicle}</td>
                <td>${record.plate}</td>

                <td>
                    <div class="document-cell">
                        <span class="doc-count-badge ${documentCount === 0 ? "empty" : ""}">
                            ${documentCount}
                        </span>

                        <button class="mini-doc-btn open-document-button" data-index="${realIndex}" title="Belge Paneli">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                    </div>
                </td>

                <td>
                    <div class="route-cell">
                        <span class="route-text">${record.route}</span>

                        <button class="map-open-btn open-map-button" data-index="${realIndex}" title="Haritada Gör">
                            <i class="fa-solid fa-map-location-dot"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    attachRowEvents();
    attachDocumentButtonEvents();
    attachMapButtonEvents();
    updatePaginationUI(totalPages);
}

function attachRowEvents() {
    const allRows = document.querySelectorAll(".data-row");

    allRows.forEach(function (row) {
        row.addEventListener("click", function () {
            allRows.forEach(function (item) {
                item.classList.remove("selected-row");
            });

            row.classList.add("selected-row");
            selectedIndex = Number(row.getAttribute("data-index"));
        });
    });
}

function attachDocumentButtonEvents() {
    const allDocumentButtons = document.querySelectorAll(".open-document-button");

    allDocumentButtons.forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.stopPropagation();

            const index = Number(button.getAttribute("data-index"));
            activeDocumentIndex = index;
            openDocumentModal(index);
        });
    });
}

function attachMapButtonEvents() {
    const allMapButtons = document.querySelectorAll(".open-map-button");

    allMapButtons.forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.stopPropagation();

            const index = Number(button.getAttribute("data-index"));
            openMapModal(index);
        });
    });
}



// ======================================
// PAGINATION EVENTS
// ======================================

if (previousButton) {
    previousButton.addEventListener("click", function () {
        if (currentPage > 1) {
            currentPage--;
            selectedIndex = null;
            renderTable();
        }
    });
}

if (nextButton) {
    nextButton.addEventListener("click", function () {
        if (currentPage < getTotalPages()) {
            currentPage++;
            selectedIndex = null;
            renderTable();
        }
    });
}



// ======================================
// SEARCH SYSTEM
// ======================================

if (searchButton) {
    searchButton.addEventListener("click", function () {
        if (!searchInput) {
            return;
        }

        searchText = searchInput.value.trim();
        currentPage = 1;
        selectedIndex = null;
        renderTable();
    });
}

if (searchInput) {
    searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            searchText = searchInput.value.trim();
            currentPage = 1;
            selectedIndex = null;
            renderTable();
        }
    });
}



// ======================================
// EDIT SYSTEM
// ======================================

if (editSelectedButton) {
    editSelectedButton.addEventListener("click", function () {
        if (selectedIndex === null) {
            alert("Please select a row first");
            return;
        }

        const record = records[selectedIndex];

        document.getElementById("firstName").value = record.firstName;
        document.getElementById("lastName").value = record.lastName;
        document.getElementById("vehicle").value = record.vehicle;
        document.getElementById("plate").value = record.plate;
        document.getElementById("route").value = record.route;

        editMode = true;

        if (modalTitle) {
            modalTitle.textContent = "Edit Record";
        }

        addModal.classList.add("show");
    });
}



// ======================================
// DELETE SYSTEM
// ======================================

if (deleteSelectedButton) {
    deleteSelectedButton.addEventListener("click", function () {
        if (selectedIndex === null) {
            alert("Please select a row first");
            return;
        }

        if (deleteModal) {
            deleteModal.classList.add("show");
        }
    });
}

if (confirmDeleteButton) {
    confirmDeleteButton.addEventListener("click", function () {
        if (selectedIndex === null) {
            if (deleteModal) {
                deleteModal.classList.remove("show");
            }
            return;
        }

        records.splice(selectedIndex, 1);

        records.forEach(function (record, index) {
            record.no = index + 1;
        });

        selectedIndex = null;

        saveRecordsToLocalStorage();
        renderTable();

        if (deleteModal) {
            deleteModal.classList.remove("show");
        }
    });
}

if (cancelDeleteButton) {
    cancelDeleteButton.addEventListener("click", function () {
        if (deleteModal) {
            deleteModal.classList.remove("show");
        }
    });
}



// ======================================
// DOCUMENT MODAL SYSTEM
// ======================================

function openDocumentModal(index) {
    const record = records[index];

    if (!record) {
        return;
    }

    if (!Array.isArray(record.documents)) {
        record.documents = [];
    }

    if (documentInput) {
        documentInput.value = "";
    }

    renderDocumentList(index);

    if (documentPreviewArea) {
        documentPreviewArea.innerHTML = `<p>Görüntülemek için listeden bir belge seç.</p>`;
    }

    if (documentModal) {
        documentModal.classList.add("show");
    }
}

function renderDocumentList(index) {
    const record = records[index];

    if (!documentListArea || !record) {
        return;
    }

    if (!Array.isArray(record.documents) || record.documents.length === 0) {
        documentListArea.innerHTML = `<p>Henüz belge yok.</p>`;
        return;
    }

    documentListArea.innerHTML = "";

    record.documents.forEach(function (doc) {
        const typeText = getDocumentTypeText(doc.type, doc.name);

        documentListArea.innerHTML += `
            <div class="document-item">
                <div class="document-item-left">
                    <div class="document-name">${doc.name}</div>
                    <div class="document-type">${typeText}</div>
                </div>

                <div class="document-item-actions">
                    <button class="document-action-btn document-view-btn" data-doc-id="${doc.id}">
                        Goruntule
                    </button>

                    <button class="document-action-btn document-delete-btn" data-doc-id="${doc.id}">
                        Sil
                    </button>
                </div>
            </div>
        `;
    });

    attachDocumentListEvents(index);
}

function attachDocumentListEvents(index) {
    const viewButtons = document.querySelectorAll(".document-view-btn");
    const deleteButtons = document.querySelectorAll(".document-delete-btn");

    viewButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const docId = Number(button.getAttribute("data-doc-id"));
            const record = records[index];

            const doc = record.documents.find(function (item) {
                return item.id === docId;
            });

            if (!doc) {
                return;
            }

            showSingleDocumentPreview(doc);
        });
    });

    deleteButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const docId = Number(button.getAttribute("data-doc-id"));
            const record = records[index];

            record.documents = record.documents.filter(function (item) {
                return item.id !== docId;
            });

            saveRecordsToLocalStorage();
            renderDocumentList(index);
            renderTable();

            if (documentPreviewArea) {
                documentPreviewArea.innerHTML = `<p>Görüntülemek için listeden bir belge seç.</p>`;
            }
        });
    });
}

function showSingleDocumentPreview(doc) {
    if (!documentPreviewArea) {
        return;
    }

    if (!doc || !doc.file) {
        documentPreviewArea.innerHTML = `<p>Belge bulunamadi.</p>`;
        return;
    }

    if (doc.type.startsWith("image/")) {
        documentPreviewArea.innerHTML = `
            <img src="${doc.file}" alt="Belge Gorseli">
        `;
        return;
    }

    if (doc.type === "application/pdf") {
        documentPreviewArea.innerHTML = `
            <iframe src="${doc.file}"></iframe>
        `;
        return;
    }

    documentPreviewArea.innerHTML = `
        <p>Bu dosya tarayici icinde onizlenemiyor.</p>
        <p><strong>Dosya Adi:</strong> ${doc.name}</p>
        <p><a href="${doc.file}" download="${doc.name}">Dosyayi indir</a></p>
    `;
}

function getDocumentTypeText(type, name) {
    if (type.startsWith("image/")) {
        return "Image File";
    }

    if (type === "application/pdf") {
        return "PDF Document";
    }

    if (name.toLowerCase().endsWith(".rar")) {
        return "RAR Archive";
    }

    return type || "Unknown File";
}

if (closeDocumentModalButton) {
    closeDocumentModalButton.addEventListener("click", function () {
        if (documentModal) {
            documentModal.classList.remove("show");
        }

        if (documentInput) {
            documentInput.value = "";
        }

        if (documentPreviewArea) {
            documentPreviewArea.innerHTML = `<p>Görüntülemek için listeden bir belge seç.</p>`;
        }
    });
}

if (saveDocumentButton) {
    saveDocumentButton.addEventListener("click", function () {
        if (activeDocumentIndex === null) {
            return;
        }

        if (!documentInput || !documentInput.files || documentInput.files.length === 0) {
            alert("Please select a file first");
            return;
        }

        const file = documentInput.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const newDocument = {
                id: Date.now(),
                name: file.name,
                file: e.target.result,
                type: file.type || ""
            };

            if (!Array.isArray(records[activeDocumentIndex].documents)) {
                records[activeDocumentIndex].documents = [];
            }

            records[activeDocumentIndex].documents.push(newDocument);

            saveRecordsToLocalStorage();
            renderDocumentList(activeDocumentIndex);
            renderTable();

            if (documentInput) {
                documentInput.value = "";
            }
        };

        reader.readAsDataURL(file);
    });
}



// ======================================
// MAP MODAL SYSTEM
// ======================================

function openMapModal(index) {
    const record = records[index];

    if (!record || !record.route) {
        alert("Rota bilgisi bulunamadi");
        return;
    }

    const routeQuery = encodeURIComponent(record.route);
    const mapUrl = `https://www.google.com/maps?q=${routeQuery}&output=embed`;

    if (selectedRouteText) {
        selectedRouteText.textContent = record.route;
    }

    if (routeMapFrame) {
        routeMapFrame.src = mapUrl;
    }

    if (mapModal) {
        mapModal.classList.add("show");
    }
}

if (closeMapModalButton) {
    closeMapModalButton.addEventListener("click", function () {
        if (mapModal) {
            mapModal.classList.remove("show");
        }

        if (routeMapFrame) {
            routeMapFrame.src = "";
        }

        if (selectedRouteText) {
            selectedRouteText.textContent = "Rota bilgisi yok";
        }
    });
}



// ======================================
// APP START
// ======================================

loadRecordsFromLocalStorage();
seedSampleRecordsIfEmpty();
renderTable();