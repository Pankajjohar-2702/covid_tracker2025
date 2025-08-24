// Application initialization and page management
let currentUser = null;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    showPage('login');
    updateDashboardStats();
    populatePatientTable();
    initializeFormValidation();
}

// Page Navigation
function showPage(pageId) {
    loadPage(pageId).then(() => {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.add('hidden'));
        
        const targetPage = document.getElementById(pageId + 'Page');
        if (targetPage) {
            targetPage.classList.remove('hidden');
            targetPage.classList.add('fade-in');
        }
        
        // Show/hide navigation based on login status
        const navLinks = document.getElementById('navLinks');
        if (pageId === 'login') {
            navLinks.style.display = 'none';
        } else {
            navLinks.style.display = 'flex';
        }
    });
}

async function loadPage(pageId) {
    try {
        const response = await fetch('pages/${pageId}.html');
        const html = await response.text();
        document.getElementById('pageContainer').innerHTML = html;
    } catch (error) {
        console.error('Error loading page:', error);
    }
}

// Form Validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                showAlert('Please fill in all required fields correctly.', 'warning');
            }
            form.classList.add('was-validated');
        });
    });
}

// Real-time updates simulation
setInterval(() => {
    if (currentUser && !document.getElementById('dashboardPage')?.classList.contains('hidden')) {
        updateDashboardStats();
    }
}, 30000); // Update every 30 seconds
// Authentication functions
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loadingSpinner = event.target.querySelector('.loading');
    
    // Show loading
    loadingSpinner.classList.add('show');
    
    // Simulate API call
    setTimeout(() => {
        loadingSpinner.classList.remove('show');
        
        // Demo credentials validation
        if (username === 'admin' && password === 'admin123') {
            currentUser = { username: username, role: 'admin' };
            showAlert('Login successful! Welcome to the COVID-19 Tracker.', 'success');
            setTimeout(() => showPage('dashboard'), 1500);
        } else {
            showAlert('Invalid credentials. Please use demo credentials: admin/admin123', 'danger');
        }
    }, 1000);
}

function logout() {
    currentUser = null;
    showAlert('You have been logged out successfully.', 'info');
    setTimeout(() => showPage('login'), 1000);
}

function isAuthenticated() {
    return currentUser !== null;
}

function getCurrentUser() {
    return currentUser;
}
// Patient data management
let patientData = [
    { id: 1, name: "John Smith", country: "United States", status: "survived", date: "2024-01-15" },
    { id: 2, name: "Maria Garcia", country: "Spain", status: "survived", date: "2024-01-16" },
    { id: 3, name: "Hans Mueller", country: "Germany", status: "deceased", date: "2024-01-17" },
    { id: 4, name: "Sophie Dubois", country: "France", status: "survived", date: "2024-01-18" },
    { id: 5, name: "Raj Patel", country: "India", status: "survived", date: "2024-01-19" }
];

function addPatient(event) {
    event.preventDefault();
    
    const name = document.getElementById('patientName').value;
    const country = document.getElementById('patientCountry').value;
    const status = document.querySelector('input[name="patientStatus"]:checked').value;
    const loadingSpinner = event.target.querySelector('.loading');
    
    // Show loading
    loadingSpinner.classList.add('show');
    
    // Simulate API call
    setTimeout(() => {
        loadingSpinner.classList.remove('show');
        
        const newPatient = {
            id: patientData.length + 1,
            name: name,
            country: country,
            status: status,
            date: new Date().toISOString().split('T')[0]
        };
        
        patientData.push(newPatient);
        updateDashboardStats();
        populatePatientTable();
        
        // Reset form
        event.target.reset();
        
        showAlert('Patient ${name} has been added successfully.', 'success');
    }, 800);
}

function updateDashboardStats() {
    const total = patientData.length;
    const survived = patientData.filter(p => p.status === 'survived').length;
    const deceased = patientData.filter(p => p.status === 'deceased').length;
    const survivalRate = total > 0 ? Math.round((survived / total) * 100) : 0;
    
    const totalElement = document.getElementById('totalCases');
    const survivedElement = document.getElementById('survivedCases');
    const deceasedElement = document.getElementById('deceasedCases');
    const rateElement = document.getElementById('survivalRate');
    const globalRateElement = document.getElementById('globalSurvivalRate');
    
    if (totalElement) totalElement.textContent = total;
    if (survivedElement) survivedElement.textContent = survived;
    if (deceasedElement) deceasedElement.textContent = deceased;
    if (rateElement) rateElement.textContent = survivalRate + '%';
    if (globalRateElement) globalRateElement.textContent = survivalRate + '%';
    
    // Update progress bar
    const progressBar = document.querySelector('.progress-bar.bg-success');
    if (progressBar) {
        progressBar.style.width = survivalRate + '%';
    }
}

function populatePatientTable() {
    const tbody = document.getElementById('patientTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    patientData.forEach(patient => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${patient.id}</td>
            <td>${patient.name}</td>
            <td>${patient.country}</td>
            <td>
                <span class="status-badge status-${patient.status}">
                    <i class="fas fa-${patient.status === 'survived' ? 'heart' : 'cross'} me-1"></i>
                    ${patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                </span>
            </td>
            <td>${formatDate(patient.date)}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="removePatient(${patient.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function removePatient(id) {
    if (confirm('Are you sure you want to remove this patient record?')) {
        patientData = patientData.filter(p => p.id !== id);
        updateDashboardStats();
        populatePatientTable();
        showAlert('Patient record has been removed.', 'info');
    }
}

function exportData() {
    const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Name,Country,Status,Date\n"
        + patientData.map(p => '${p.id},${p.name},${p.country},${p.status},${p.date}').join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "covid_patient_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showAlert('Patient data has been exported successfully.', 'success');
}
// Certificate generation functions
function generateCertificate(event) {
    event.preventDefault();
    
    const name = document.getElementById('certName').value;
    const dob = document.getElementById('certDob').value;
    const idNumber = document.getElementById('certId').value;
    const vaccine = document.getElementById('certVaccine').value;
    const date1 = document.getElementById('certDate1').value;
    const date2 = document.getElementById('certDate2').value;
    const loadingSpinner = event.target.querySelector('.loading');
    
    // Show loading
    loadingSpinner.classList.add('show');
    
    setTimeout(() => {
        loadingSpinner.classList.remove('show');
        
        const certificateContent = generateCertificateContent(name, dob, idNumber, vaccine, date1, date2);
        
        document.getElementById('certificateContent').innerHTML = certificateContent;
        document.getElementById('certificatePreview').classList.remove('hidden');
        
        showAlert('Certificate generated successfully!', 'success');
    }, 1000);
}

function generateCertificateContent(name, dob, idNumber, vaccine, date1, date2) {
    return `
        <div class="text-start">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Date of Birth:</strong> ${formatDate(dob)}</p>
            <p><strong>ID Number:</strong> ${idNumber}</p>
            <p><strong>Vaccine:</strong> ${vaccine}</p>
            <p><strong>First Dose:</strong> ${formatDate(date1)}</p>
            ${date2 ? '<p><strong>Second Dose:</strong> ${formatDate(date2)}</p>' : ''}
            <p><strong>Certificate ID:</strong> COV-${Date.now()}</p>
            <p><strong>Issued:</strong> ${formatDate(new Date().toISOString().split('T')[0])}</p>
        </div>
    `;
}

function downloadCertificate() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('COVID-19 Vaccination Certificate', 20, 30);
    
    // Add content
    doc.setFontSize(12);
    const content = document.getElementById('certificateContent').textContent;
    const lines = content.split('\n').filter(line => line.trim());
    
    let yPosition = 50;
    lines.forEach(line => {
        if (line.trim()) {
            doc.text(line.trim(), 20, yPosition);
            yPosition += 10;
        }
    });
    
    // Add footer
    doc.setFontSize(10);
    doc.text('This is a demo certificate. Not valid for official use.', 20, 250);
    
    doc.save('vaccination-certificate.pdf');
    showAlert('Certificate downloaded successfully!', 'success');
}
// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showAlert(message, type = 'info') {
    const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
    const title = document.getElementById('alertModalTitle');
    const body = document.getElementById('alertModalBody');
    
    const icons = {
        success: 'fa-check-circle text-success',
        danger: 'fa-exclamation-triangle text-danger',
        warning: 'fa-exclamation-triangle text-warning',
        info: 'fa-info-circle text-info'
    };
    
    title.innerHTML = '<i class="fas ${icons[type]} me-2"></i>${type.charAt(0).toUpperCase() + type.slice(1)}';
    body.textContent = message;
    
    alertModal.show();
}

function simulateAjaxCall(endpoint, data, callback) {
    console.log('AJAX call to ${endpoint} with data:', data);
    setTimeout(() => {
        callback({ success: true, message: 'Operation completed successfully' });
    }, 500);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}