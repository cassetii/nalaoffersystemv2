// Import Firebase
import { db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Global variables
let materials = [];
let priceChart = null;
let profitChart = null;

// DOM Elements
const defaultMarkupInput = document.getElementById('defaultMarkup');
const profitMarginInput = document.getElementById('profitMargin');
const materialNameInput = document.getElementById('materialName');
const materialPriceInput = document.getElementById('materialPrice');
const materialUnitInput = document.getElementById('materialUnit');
const materialsTableBody = document.getElementById('materialsTableBody');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Nala Aircon Management System loaded!');
    initializeApp();
    setupEventListeners();
    loadMaterialsFromFirebase();
});

function initializeApp() {
    // Initialize charts
    initializeCharts();
    
    // Load settings from localStorage
    loadSettings();
    
    console.log('Application initialized successfully');
}

function setupEventListeners() {
    // Apply margins button
    document.getElementById('applyMargins').addEventListener('click', applyMarginsToAll);
    
    // Add material button
    document.getElementById('addMaterial').addEventListener('click', addMaterial);
    
    // Export/Import buttons
    document.getElementById('exportData').addEventListener('click', exportData);
    document.getElementById('importData').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', importData);
    document.getElementById('clearData').addEventListener('click', clearAllData);
    
    // Save settings when changed
    defaultMarkupInput.addEventListener('change', saveSettings);
    profitMarginInput.addEventListener('change', saveSettings);
    
    // Enter key support for adding materials
    materialNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addMaterial();
    });
    materialPriceInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addMaterial();
    });
    materialUnitInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addMaterial();
    });
}

function loadSettings() {
    const savedMarkup = localStorage.getItem('defaultMarkup');
    const savedProfit = localStorage.getItem('profitMargin');
    
    if (savedMarkup) defaultMarkupInput.value = savedMarkup;
    if (savedProfit) profitMarginInput.value = savedProfit;
}

function saveSettings() {
    localStorage.setItem('defaultMarkup', defaultMarkupInput.value);
    localStorage.setItem('profitMargin', profitMarginInput.value);
}

async function loadMaterialsFromFirebase() {
    try {
        showMessage('Memuat data dari Firebase...', 'info');
        
        // Real-time listener untuk materials collection
        const materialsCollection = collection(db, 'materials');
        onSnapshot(materialsCollection, (snapshot) => {
            materials = [];
            snapshot.forEach((doc) => {
                materials.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            renderMaterialsTable();
            updateCharts();
            updateSummary();
            hideMessage();
        });
        
    } catch (error) {
        console.error('Error loading materials:', error);
        showMessage('Error memuat data: ' + error.message, 'error');
    }
}

async function addMaterial() {
    const name = materialNameInput.value.trim();
    const price = parseFloat(materialPriceInput.value);
    const unit = materialUnitInput.value.trim();
    
    if (!name || !price || price <= 0 || !unit) {
        showMessage('Mohon isi semua field dengan benar!', 'error');
        return;
    }
    
    const defaultMarkup = parseFloat(defaultMarkupInput.value) || 30;
    const profitMargin = parseFloat(profitMarginInput.value) || 15;
    
    const material = {
        name,
        unit,
        realPrice: price,
        markup: defaultMarkup,
        profitMargin: profitMargin,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    try {
        await addDoc(collection(db, 'materials'), material);
        
        // Clear inputs
        materialNameInput.value = '';
        materialPriceInput.value = '';
        materialUnitInput.value = '';
        
        showMessage('Material berhasil ditambahkan!', 'success');
    } catch (error) {
        console.error('Error adding material:', error);
        showMessage('Error menambahkan material: ' + error.message, 'error');
    }
}

function calculatePrices(material) {
    const realPrice = material.realPrice || 0;
    const markup = material.markup || 0;
    const profitMargin = material.profitMargin || 0;
    
    const markupPrice = realPrice * (1 + markup / 100);
    const finalPrice = markupPrice * (1 + profitMargin / 100);
    const profit = finalPrice - realPrice;
    
    return {
        markupPrice: markupPrice,
        finalPrice: finalPrice,
        profit: profit
    };
}

function renderMaterialsTable() {
    materialsTableBody.innerHTML = '';
    
    materials.forEach((material, index) => {
        const prices = calculatePrices(material);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${material.name}</td>
            <td>${material.unit}</td>
            <td>${formatCurrency(material.realPrice)}</td>
            <td>
                <input type="number" class="editable" value="${material.markup}" 
                       min="0" max="1000" step="0.1" 
                       onchange="updateMaterial('${material.id}', 'markup', this.value)">
            </td>
            <td>${formatCurrency(prices.markupPrice)}</td>
            <td>
                <input type="number" class="editable" value="${material.profitMargin}" 
                       min="0" max="1000" step="0.1" 
                       onchange="updateMaterial('${material.id}', 'profitMargin', this.value)">
            </td>
            <td>${formatCurrency(prices.finalPrice)}</td>
            <td>${formatCurrency(prices.profit)}</td>
            <td>
                <button class="btn btn-edit" onclick="editMaterial('${material.id}')">Edit</button>
                <button class="btn btn-delete" onclick="deleteMaterial('${material.id}')">Hapus</button>
            </td>
        `;
        materialsTableBody.appendChild(row);
    });
}

window.updateMaterial = async function(id, field, value) {
    try {
        const materialRef = doc(db, 'materials', id);
        await updateDoc(materialRef, {
            [field]: parseFloat(value),
            updatedAt: new Date()
        });
        
        showMessage('Material berhasil diupdate!', 'success');
    } catch (error) {
        console.error('Error updating material:', error);
        showMessage('Error mengupdate material: ' + error.message, 'error');
    }
};

window.editMaterial = function(id) {
    const material = materials.find(m => m.id === id);
    if (material) {
        const newName = prompt('Nama Material:', material.name);
        const newPrice = prompt('Harga Real:', material.realPrice);
        const newUnit = prompt('Unit:', material.unit);
        
        if (newName && newPrice && newUnit) {
            updateMaterialComplete(id, {
                name: newName.trim(),
                realPrice: parseFloat(newPrice),
                unit: newUnit.trim()
            });
        }
    }
};

async function updateMaterialComplete(id, updates) {
    try {
        const materialRef = doc(db, 'materials', id);
        await updateDoc(materialRef, {
            ...updates,
            updatedAt: new Date()
        });
        
        showMessage('Material berhasil diupdate!', 'success');
    } catch (error) {
        console.error('Error updating material:', error);
        showMessage('Error mengupdate material: ' + error.message, 'error');
    }
}

window.deleteMaterial = async function(id) {
    if (confirm('Yakin ingin menghapus material ini?')) {
        try {
            await deleteDoc(doc(db, 'materials', id));
            showMessage('Material berhasil dihapus!', 'success');
        } catch (error) {
            console.error('Error deleting material:', error);
            showMessage('Error menghapus material: ' + error.message, 'error');
        }
    }
};

async function applyMarginsToAll() {
    const defaultMarkup = parseFloat(defaultMarkupInput.value) || 30;
    const profitMargin = parseFloat(profitMarginInput.value) || 15;
    
    if (confirm(`Terapkan markup ${defaultMarkup}% dan profit margin ${profitMargin}% ke semua material?`)) {
        try {
            const promises = materials.map(material => {
                const materialRef = doc(db, 'materials', material.id);
                return updateDoc(materialRef, {
                    markup: defaultMarkup,
                    profitMargin: profitMargin,
                    updatedAt: new Date()
                });
            });
            
            await Promise.all(promises);
            showMessage('Margin berhasil diterapkan ke semua material!', 'success');
        } catch (error) {
            console.error('Error applying margins:', error);
            showMessage('Error menerapkan margin: ' + error.message, 'error');
        }
    }
}

function initializeCharts() {
    // Price Comparison Chart
    const priceCtx = document.getElementById('priceComparisonChart').getContext('2d');
    priceChart = new Chart(priceCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Harga Real',
                    data: [],
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Harga Markup',
                    data: [],
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'Rp ' + value.toLocaleString('id-ID');
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': Rp ' + 
                                   context.parsed.y.toLocaleString('id-ID');
                        }
                    }
                }
            }
        }
    });
    
    // Profit Analysis Chart
    const profitCtx = document.getElementById('profitAnalysisChart').getContext('2d');
    profitChart = new Chart(profitCtx, {
        type: 'doughnut',
        data: {
            labels: ['Total Harga Real', 'Total Keuntungan'],
            datasets: [{
                data: [0, 0],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 206, 86, 0.8)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': Rp ' + 
                                   context.parsed.toLocaleString('id-ID');
                        }
                    }
                }
            }
        }
    });
}

function updateCharts() {
    if (!priceChart || !profitChart) return;
    
    // Update Price Comparison Chart
    const labels = materials.map(m => m.name.length > 15 ? m.name.substring(0, 15) + '...' : m.name);
    const realPrices = materials.map(m => m.realPrice);
    const markupPrices = materials.map(m => calculatePrices(m).markupPrice);
    
    priceChart.data.labels = labels;
    priceChart.data.datasets[0].data = realPrices;
    priceChart.data.datasets[1].data = markupPrices;
    priceChart.update();
    
    // Update Profit Analysis Chart
    const totalReal = materials.reduce((sum, m) => sum + m.realPrice, 0);
    const totalProfit = materials.reduce((sum, m) => sum + calculatePrices(m).profit, 0);
    
    profitChart.data.datasets[0].data = [totalReal, totalProfit];
    profitChart.update();
}

function updateSummary() {
    const totalReal = materials.reduce((sum, m) => sum + m.realPrice, 0);
    const totalMarkup = materials.reduce((sum, m) => sum + calculatePrices(m).markupPrice, 0);
    const totalFinal = materials.reduce((sum, m) => sum + calculatePrices(m).finalPrice, 0);
    const totalProfit = materials.reduce((sum, m) => sum + calculatePrices(m).profit, 0);
    
    document.getElementById('totalRealPrice').textContent = formatCurrency(totalReal);
    document.getElementById('totalMarkupPrice').textContent = formatCurrency(totalMarkup);
    document.getElementById('totalFinalPrice').textContent = formatCurrency(totalFinal);
    document.getElementById('totalProfit').textContent = formatCurrency(totalProfit);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function exportData() {
    const dataToExport = {
        materials: materials,
        settings: {
            defaultMarkup: defaultMarkupInput.value,
            profitMargin: profitMarginInput.value
        },
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `nala-aircon-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showMessage('Data berhasil diekspor!', 'success');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (importedData.materials && Array.isArray(importedData.materials)) {
                // Clear existing data
                await clearAllData(false);
                
                // Import materials to Firebase
                const promises = importedData.materials.map(material => {
                    // Remove id from imported material to let Firebase generate new ones
                    const { id, ...materialData } = material;
                    return addDoc(collection(db, 'materials'), {
                        ...materialData,
                        importedAt: new Date()
                    });
                });
                
                await Promise.all(promises);
                
                // Import settings
                if (importedData.settings) {
                    defaultMarkupInput.value = importedData.settings.defaultMarkup || 30;
                    profitMarginInput.value = importedData.settings.profitMargin || 15;
                    saveSettings();
                }
                
                showMessage('Data berhasil diimpor!', 'success');
            } else {
                showMessage('Format file tidak valid!', 'error');
            }
        } catch (error) {
            console.error('Error importing data:', error);
            showMessage('Error mengimpor data: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
}

async function clearAllData(showConfirm = true) {
    if (showConfirm && !confirm('Yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan!')) {
        return;
    }
    
    try {
        // Delete all materials from Firebase
        const promises = materials.map(material => 
            deleteDoc(doc(db, 'materials', material.id))
        );
        
        await Promise.all(promises);
        
        showMessage('Semua data berhasil dihapus!', 'success');
    } catch (error) {
        console.error('Error clearing data:', error);
        showMessage('Error menghapus data: ' + error.message, 'error');
    }
}

function showMessage(text, type = 'info') {
    // Remove existing message
    hideMessage();
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    message.id = 'statusMessage';
    
    // Insert after header
    const header = document.querySelector('header');
    header.parentNode.insertBefore(message, header.nextSibling);
    
    // Auto hide success and info messages after 3 seconds
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            hideMessage();
        }, 3000);
    }
}

function hideMessage() {
    const existingMessage = document.getElementById('statusMessage');
    if (existingMessage) {
        existingMessage.remove();
    }
}

// Initialize sample data if no data exists
async function initializeSampleData() {
    if (materials.length === 0) {
        const sampleMaterials = [
            { name: 'AC Split 1 PK', unit: 'unit', realPrice: 2500000, markup: 30, profitMargin: 15 },
            { name: 'Pipa Tembaga 1/2"', unit: 'meter', realPrice: 85000, markup: 25, profitMargin: 15 },
            { name: 'Freon R32', unit: 'kg', realPrice: 120000, markup: 35, profitMargin: 15 },
            { name: 'Kabel NYM 3x2.5', unit: 'meter', realPrice: 15000, markup: 20, profitMargin: 15 }
        ];
        
        try {
            const promises = sampleMaterials.map(material => 
                addDoc(collection(db, 'materials'), {
                    ...material,
                    createdAt: new Date(),
                    updatedAt: new Date()
                })
            );
            
            await Promise.all(promises);
            console.log('Sample data initialized');
        } catch (error) {
            console.error('Error initializing sample data:', error);
        }
    }
}

// Add sample data button (for demo purposes)
setTimeout(() => {
    if (materials.length === 0) {
        const addSampleBtn = document.createElement('button');
        addSampleBtn.textContent = 'Tambah Data Contoh';
        addSampleBtn.className = 'btn btn-secondary';
        addSampleBtn.onclick = initializeSampleData;
        
        const dataManagement = document.querySelector('.data-management');
        if (dataManagement) {
            dataManagement.appendChild(addSampleBtn);
        }
    }
}, 2000);