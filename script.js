// 🚀 Nala Aircon - Modern Enhanced JavaScript
// Advanced features with smooth animations and enhanced UX

import { db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    onSnapshot,
    query,
    orderBy,
    limit,
    where
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// 🎯 Enhanced Global State Management
class NalaAirconApp {
    constructor() {
        this.materials = [];
        this.priceChart = null;
        this.profitChart = null;
        this.isLoading = false;
        this.settings = {
            defaultMarkup: 30,
            profitMargin: 15,
            currency: 'IDR',
            autoSave: true
        };
        this.animations = {
            duration: 300,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        };
    }

    // 🎨 Enhanced initialization with loading states
    async init() {
        try {
            console.log('🚀 Initializing Nala Aircon App...');
            this.showLoadingState();
            
            await this.initializeDOM();
            await this.setupEventListeners();
            await this.loadSettings();
            await this.initializeCharts();
            await this.loadMaterialsFromFirebase();
            
            this.hideLoadingState();
            this.showWelcomeMessage();
            
            console.log('✅ App initialized successfully!');
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.showMessage('⚠️ Gagal memuat aplikasi. Silakan refresh halaman.', 'error');
        }
    }

    // 🎭 DOM Ready Check
    initializeDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    // 🎨 Enhanced Loading States
    showLoadingState() {
        const loadingHTML = `
            <div id="appLoader" class="app-loader">
                <div class="loader-content">
                    <div class="modern-spinner"></div>
                    <h3>🎯 Memuat Nala Aircon...</h3>
                    <p>Menyiapkan dashboard untuk Anda</p>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', loadingHTML);
        
        // Add loading styles
        const style = document.createElement('style');
        style.textContent = `
            .app-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                backdrop-filter: blur(10px);
            }
            .loader-content {
                text-align: center;
                color: white;
            }
            .modern-spinner {
                width: 60px;
                height: 60px;
                border: 4px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 1s ease-in-out infinite;
                margin: 0 auto 20px;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    hideLoadingState() {
        const loader = document.getElementById('appLoader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);
        }
    }

    // 🎉 Enhanced Event Listeners with Modern Patterns
    setupEventListeners() {
        // Main action buttons
        this.bindEvent('applyMargins', 'click', () => this.applyMarginsToAll());
        this.bindEvent('addMaterial', 'click', () => this.addMaterial());
        
        // Data management
        this.bindEvent('exportData', 'click', () => this.exportData());
        this.bindEvent('importData', 'click', () => this.triggerImport());
        this.bindEvent('importFile', 'change', (e) => this.importData(e));
        this.bindEvent('clearData', 'click', () => this.clearAllData());
        this.bindEvent('addSampleData', 'click', () => this.initializeSampleData());
        
        // Settings auto-save
        this.bindEvent('defaultMarkup', 'input', () => this.debouncedSaveSettings());
        this.bindEvent('profitMargin', 'input', () => this.debouncedSaveSettings());
        
        // Enhanced form submission
        this.setupFormSubmission();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Floating action button
        this.bindEvent('floatingAction', 'click', () => this.scrollToTop());
    }

    // 🎯 Utility method for event binding with error handling
    bindEvent(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, (e) => {
                try {
                    handler(e);
                } catch (error) {
                    console.error(`Error in ${elementId} ${event} handler:`, error);
                    this.showMessage('⚠️ Terjadi kesalahan. Silakan coba lagi.', 'error');
                }
            });
        }
    }

    // ⌨️ Keyboard Shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S = Save/Apply margins
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.applyMarginsToAll();
            }
            
            // Ctrl/Cmd + N = Add new material
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                document.getElementById('materialName')?.focus();
            }
            
            // Escape = Close modals/clear forms
            if (e.key === 'Escape') {
                this.clearForms();
            }
        });
    }

    // 📝 Enhanced Form Submission
    setupFormSubmission() {
        const inputs = ['materialName', 'materialPrice', 'materialUnit'];
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.addMaterial();
                    }
                });
            }
        });
    }

    // 💾 Enhanced Settings Management
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('nalaAirconSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
            
            // Apply to DOM
            const markupInput = document.getElementById('defaultMarkup');
            const profitInput = document.getElementById('profitMargin');
            
            if (markupInput) markupInput.value = this.settings.defaultMarkup;
            if (profitInput) profitInput.value = this.settings.profitMargin;
            
        } catch (error) {
            console.warn('Settings load failed:', error);
        }
    }

    saveSettings() {
        try {
            const markupInput = document.getElementById('defaultMarkup');
            const profitInput = document.getElementById('profitMargin');
            
            this.settings.defaultMarkup = parseFloat(markupInput?.value) || 30;
            this.settings.profitMargin = parseFloat(profitInput?.value) || 15;
            this.settings.lastSaved = new Date().toISOString();
            
            localStorage.setItem('nalaAirconSettings', JSON.stringify(this.settings));
            
        } catch (error) {
            console.warn('Settings save failed:', error);
        }
    }

    // 🚀 Debounced settings save for better performance
    debouncedSaveSettings = this.debounce(() => this.saveSettings(), 500);

    // 🔥 Enhanced Firebase Integration
    async loadMaterialsFromFirebase() {
        try {
            this.showMessage('🔄 Memuat data dari cloud...', 'info');
            
            const materialsCollection = collection(db, 'materials');
            const q = query(materialsCollection, orderBy('updatedAt', 'desc'));
            
            // Real-time listener with enhanced error handling
            onSnapshot(q, 
                (snapshot) => {
                    this.materials = [];
                    snapshot.forEach((doc) => {
                        this.materials.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });
                    
                    this.renderMaterialsTable();
                    this.updateCharts();
                    this.updateSummary();
                    this.hideMessage();
                    
                    console.log(`📊 Loaded ${this.materials.length} materials`);
                },
                (error) => {
                    console.error('Firebase listener error:', error);
                    this.showMessage('⚠️ Gagal memuat data real-time. Menggunakan data lokal.', 'error');
                    this.loadMaterialsFromLocalStorage();
                }
            );
            
        } catch (error) {
            console.error('Error setting up Firebase listener:', error);
            this.showMessage('⚠️ Gagal terhubung ke cloud. Mode offline aktif.', 'error');
            this.loadMaterialsFromLocalStorage();
        }
    }

    // 💾 Fallback local storage
    loadMaterialsFromLocalStorage() {
        try {
            const localMaterials = localStorage.getItem('nalaAirconMaterials');
            if (localMaterials) {
                this.materials = JSON.parse(localMaterials);
                this.renderMaterialsTable();
                this.updateCharts();
                this.updateSummary();
            }
        } catch (error) {
            console.warn('Local storage load failed:', error);
        }
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('nalaAirconMaterials', JSON.stringify(this.materials));
        } catch (error) {
            console.warn('Local storage save failed:', error);
        }
    }

    // ➕ Enhanced Add Material with Validation
    async addMaterial() {
        const nameInput = document.getElementById('materialName');
        const priceInput = document.getElementById('materialPrice');
        const unitInput = document.getElementById('materialUnit');
        
        const name = nameInput?.value.trim();
        const price = parseFloat(priceInput?.value);
        const unit = unitInput?.value.trim();
        
        // Enhanced validation
        const validation = this.validateMaterialInput(name, price, unit);
        if (!validation.isValid) {
            this.showMessage(`⚠️ ${validation.message}`, 'error');
            validation.field?.focus();
            return;
        }
        
        // Check for duplicates
        const isDuplicate = this.materials.some(material => 
            material.name.toLowerCase() === name.toLowerCase()
        );
        
        if (isDuplicate) {
            const proceed = confirm('Material dengan nama serupa sudah ada. Tetap tambahkan?');
            if (!proceed) return;
        }
        
        const material = {
            name,
            unit,
            realPrice: price,
            markup: this.settings.defaultMarkup,
            profitMargin: this.settings.profitMargin,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        try {
            this.setButtonLoading('addMaterial', true);
            
            // Add to Firebase
            if (db) {
                await addDoc(collection(db, 'materials'), material);
            }
            
            // Clear inputs with animation
            this.clearFormInputs([nameInput, priceInput, unitInput]);
            
            this.showMessage('✅ Material berhasil ditambahkan!', 'success');
            
            // Focus back to first input for quick addition
            nameInput?.focus();
            
        } catch (error) {
            console.error('Error adding material:', error);
            this.showMessage('❌ Gagal menambahkan material: ' + error.message, 'error');
            
            // Add to local storage as fallback
            this.materials.push({ ...material, id: Date.now().toString() });
            this.saveToLocalStorage();
            this.renderMaterialsTable();
            this.updateCharts();
            this.updateSummary();
            
        } finally {
            this.setButtonLoading('addMaterial', false);
        }
    }

    // 🔍 Enhanced Input Validation
    validateMaterialInput(name, price, unit) {
        if (!name) {
            return { isValid: false, message: 'Nama material tidak boleh kosong!', field: document.getElementById('materialName') };
        }
        
        if (name.length < 2) {
            return { isValid: false, message: 'Nama material minimal 2 karakter!', field: document.getElementById('materialName') };
        }
        
        if (!price || price <= 0) {
            return { isValid: false, message: 'Harga harus lebih dari 0!', field: document.getElementById('materialPrice') };
        }
        
        if (price > 1000000000) {
            return { isValid: false, message: 'Harga terlalu besar!', field: document.getElementById('materialPrice') };
        }
        
        if (!unit) {
            return { isValid: false, message: 'Unit tidak boleh kosong!', field: document.getElementById('materialUnit') };
        }
        
        return { isValid: true };
    }

    // 🧮 Enhanced Price Calculations
    calculatePrices(material) {
        const realPrice = material.realPrice || 0;
        const markup = material.markup || 0;
        const profitMargin = material.profitMargin || 0;
        
        const markupPrice = realPrice * (1 + markup / 100);
        const finalPrice = markupPrice * (1 + profitMargin / 100);
        const profit = finalPrice - realPrice;
        
        return {
            realPrice,
            markupPrice,
            finalPrice,
            profit,
            markupAmount: markupPrice - realPrice,
            profitAmount: finalPrice - markupPrice,
            totalMargin: ((finalPrice - realPrice) / realPrice) * 100
        };
    }

    // 🎨 Enhanced Table Rendering with Animations
    renderMaterialsTable() {
        const tbody = document.getElementById('materialsTableBody');
        if (!tbody) return;
        
        // Smooth fade out
        tbody.style.opacity = '0.5';
        
        setTimeout(() => {
            tbody.innerHTML = '';
            
            this.materials.forEach((material, index) => {
                const prices = this.calculatePrices(material);
                const row = this.createMaterialRow(material, prices, index);
                tbody.appendChild(row);
            });
            
            // Smooth fade in
            tbody.style.opacity = '1';
            
            // Animate new rows
            const rows = tbody.querySelectorAll('tr');
            rows.forEach((row, index) => {
                row.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s both`;
            });
            
        }, 200);
    }

    // 🏗️ Create Enhanced Table Row
    createMaterialRow(material, prices, index) {
        const row = document.createElement('tr');
        row.style.animationDelay = `${index * 0.05}s`;
        row.className = 'material-row';
        
        row.innerHTML = `
            <td class="font-weight-bold">${this.escapeHtml(material.name)}</td>
            <td><span class="badge badge-secondary">${this.escapeHtml(material.unit)}</span></td>
            <td class="text-primary font-weight-bold">${this.formatCurrency(material.realPrice)}</td>
            <td>
                <input type="number" class="editable modern-input" 
                       value="${material.markup}" 
                       min="0" max="1000" step="0.1" 
                       data-material-id="${material.id}"
                       data-field="markup"
                       title="Markup percentage">
            </td>
            <td class="text-success font-weight-bold">${this.formatCurrency(prices.markupPrice)}</td>
            <td>
                <input type="number" class="editable modern-input" 
                       value="${material.profitMargin}" 
                       min="0" max="1000" step="0.1" 
                       data-material-id="${material.id}"
                       data-field="profitMargin"
                       title="Profit margin percentage">
            </td>
            <td class="text-warning font-weight-bold">${this.formatCurrency(prices.finalPrice)}</td>
            <td class="text-info font-weight-bold">${this.formatCurrency(prices.profit)}</td>
            <td class="text-center">
                <button class="btn btn-edit btn-sm" onclick="app.editMaterial('${material.id}')" title="Edit material">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-delete btn-sm" onclick="app.deleteMaterial('${material.id}')" title="Delete material">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        // Add event listeners for editable inputs
        const editableInputs = row.querySelectorAll('.editable');
        editableInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.updateMaterialField(e.target.dataset.materialId, e.target.dataset.field, e.target.value);
            });
            
            input.addEventListener('blur', (e) => {
                e.target.classList.add('input-saved');
                setTimeout(() => e.target.classList.remove('input-saved'), 1000);
            });
        });
        
        return row;
    }

    // 🔒 XSS Protection
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // 📊 Enhanced Charts with Modern Styling
    initializeCharts() {
        this.initializePriceChart();
        this.initializeProfitChart();
    }

    initializePriceChart() {
        const ctx = document.getElementById('priceComparisonChart');
        if (!ctx) return;
        
        this.priceChart = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Harga Real',
                        data: [],
                        backgroundColor: 'rgba(102, 126, 234, 0.8)',
                        borderColor: 'rgba(102, 126, 234, 1)',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false,
                    },
                    {
                        label: 'Harga Final',
                        data: [],
                        backgroundColor: 'rgba(74, 201, 255, 0.8)',
                        borderColor: 'rgba(74, 201, 255, 1)',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                family: 'Inter',
                                size: 12,
                                weight: '600'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: { family: 'Inter', size: 14, weight: '600' },
                        bodyFont: { family: 'Inter', size: 12 },
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${this.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(102, 126, 234, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            font: { family: 'Inter', size: 11 },
                            callback: (value) => this.formatCurrency(value, true)
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { family: 'Inter', size: 11, weight: '500' },
                            maxRotation: 45
                        }
                    }
                }
            }
        });
    }

    initializeProfitChart() {
        const ctx = document.getElementById('profitAnalysisChart');
        if (!ctx) return;
        
        this.profitChart = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Modal', 'Keuntungan'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(74, 201, 255, 0.8)'
                    ],
                    borderColor: [
                        'rgba(102, 126, 234, 1)',
                        'rgba(74, 201, 255, 1)'
                    ],
                    borderWidth: 3,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                animation: {
                    animateRotate: true,
                    duration: 1000
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: { family: 'Inter', size: 12, weight: '600' }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        callbacks: {
                            label: (context) => {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${this.formatCurrency(context.parsed)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // 📈 Enhanced Chart Updates
    updateCharts() {
        if (!this.priceChart || !this.profitChart) return;
        
        // Update price comparison chart
        const labels = this.materials.map(m => m.name.length > 15 ? m.name.substring(0, 15) + '...' : m.name);
        const realPrices = this.materials.map(m => m.realPrice);
        const finalPrices = this.materials.map(m => this.calculatePrices(m).finalPrice);
        
        this.priceChart.data.labels = labels;
        this.priceChart.data.datasets[0].data = realPrices;
        this.priceChart.data.datasets[1].data = finalPrices;
        this.priceChart.update('active');
        
        // Update profit analysis chart
        const totalReal = this.materials.reduce((sum, m) => sum + m.realPrice, 0);
        const totalProfit = this.materials.reduce((sum, m) => sum + this.calculatePrices(m).profit, 0);
        
        this.profitChart.data.datasets[0].data = [totalReal, totalProfit];
        this.profitChart.update('active');
    }

    // 📊 Enhanced Summary with Animations
    updateSummary() {
        const totals = this.calculateTotals();
        
        this.animateValue('totalRealPrice', totals.realPrice);
        this.animateValue('totalMarkupPrice', totals.markupPrice);
        this.animateValue('totalFinalPrice', totals.finalPrice);
        this.animateValue('totalProfit', totals.profit);
    }

    calculateTotals() {
        return this.materials.reduce((totals, material) => {
            const prices = this.calculatePrices(material);
            totals.realPrice += material.realPrice;
            totals.markupPrice += prices.markupPrice;
            totals.finalPrice += prices.finalPrice;
            totals.profit += prices.profit;
            return totals;
        }, { realPrice: 0, markupPrice: 0, finalPrice: 0, profit: 0 });
    }

    // 🎭 Value Animation
    animateValue(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const startValue = 0;
        const duration = 1000;
        const start = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = startValue + (targetValue - startValue) * this.easeOutQuart(progress);
            element.textContent = this.formatCurrency(currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // 🎨 Easing function
    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    // 💰 Enhanced Currency Formatting
    formatCurrency(amount, short = false) {
        if (short && amount >= 1000000) {
            return `Rp ${(amount / 1000000).toFixed(1)}M`;
        }
        if (short && amount >= 1000) {
            return `Rp ${(amount / 1000).toFixed(1)}K`;
        }
        
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // 🔄 Enhanced Material Updates
    async updateMaterialField(id, field, value) {
        try {
            const numericValue = parseFloat(value);
            if (isNaN(numericValue) || numericValue < 0) {
                this.showMessage('⚠️ Nilai harus berupa angka positif!', 'error');
                return;
            }
            
            if (db) {
                const materialRef = doc(db, 'materials', id);
                await updateDoc(materialRef, {
                    [field]: numericValue,
                    updatedAt: new Date()
                });
            }
            
            // Update local data
            const material = this.materials.find(m => m.id === id);
            if (material) {
                material[field] = numericValue;
                this.saveToLocalStorage();
            }
            
            // Visual feedback
            this.showMessage('✅ Berhasil diperbarui!', 'success');
            
        } catch (error) {
            console.error('Error updating material:', error);
            this.showMessage('❌ Gagal memperbarui: ' + error.message, 'error');
        }
    }

    // ✏️ Enhanced Edit Material
    editMaterial(id) {
        const material = this.materials.find(m => m.id === id);
        if (!material) return;
        
        const modal = this.createEditModal(material);
        document.body.appendChild(modal);
        
        // Animate modal in
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
    }

    createEditModal(material) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Edit Material</h3>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Nama Material:</label>
                        <input type="text" id="editName" value="${material.name}" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Harga Real:</label>
                        <input type="number" id="editPrice" value="${material.realPrice}" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Unit:</label>
                        <input type="text" id="editUnit" value="${material.unit}" class="form-control">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i> Batal
                    </button>
                    <button class="btn btn-primary" onclick="app.saveEditedMaterial('${material.id}')">
                        <i class="fas fa-save"></i> Simpan
                    </button>
                </div>
            </div>
        `;
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .modal-overlay.show {
                opacity: 1;
            }
            .modal-content {
                background: white;
                border-radius: 16px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                transform: scale(0.8);
                transition: transform 0.3s ease;
            }
            .modal-overlay.show .modal-content {
                transform: scale(1);
            }
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .modal-body {
                padding: 20px;
            }
            .modal-footer {
                padding: 20px;
                border-top: 1px solid #eee;
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }
            .form-group {
                margin-bottom: 20px;
            }
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 600;
            }
            .form-control {
                width: 100%;
                padding: 12px;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                font-size: 1rem;
            }
            .close-btn {
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                color: #999;
            }
        `;
        document.head.appendChild(style);
        
        return modal;
    }

    async saveEditedMaterial(id) {
        const name = document.getElementById('editName')?.value.trim();
        const price = parseFloat(document.getElementById('editPrice')?.value);
        const unit = document.getElementById('editUnit')?.value.trim();
        
        const validation = this.validateMaterialInput(name, price, unit);
        if (!validation.isValid) {
            this.showMessage(`⚠️ ${validation.message}`, 'error');
            return;
        }
        
        try {
            if (db) {
                const materialRef = doc(db, 'materials', id);
                await updateDoc(materialRef, {
                    name,
                    realPrice: price,
                    unit,
                    updatedAt: new Date()
                });
            }
            
            // Update local data
            const material = this.materials.find(m => m.id === id);
            if (material) {
                material.name = name;
                material.realPrice = price;
                material.unit = unit;
                this.saveToLocalStorage();
            }
            
            this.showMessage('✅ Material berhasil diperbarui!', 'success');
            
            // Close modal
            document.querySelector('.modal-overlay')?.remove();
            
        } catch (error) {
            console.error('Error updating material:', error);
            this.showMessage('❌ Gagal memperbarui material: ' + error.message, 'error');
        }
    }

    // 🗑️ Enhanced Delete Material
    async deleteMaterial(id) {
        const material = this.materials.find(m => m.id === id);
        if (!material) return;
        
        const confirmed = await this.showConfirmDialog(
            '🗑️ Hapus Material',
            `Yakin ingin menghapus "${material.name}"? Tindakan ini tidak dapat dibatalkan.`,
            'Hapus',
            'btn-danger'
        );
        
        if (!confirmed) return;
        
        try {
            if (db) {
                await deleteDoc(doc(db, 'materials', id));
            }
            
            // Remove from local data
            this.materials = this.materials.filter(m => m.id !== id);
            this.saveToLocalStorage();
            
            this.showMessage('✅ Material berhasil dihapus!', 'success');
            
        } catch (error) {
            console.error('Error deleting material:', error);
            this.showMessage('❌ Gagal menghapus material: ' + error.message, 'error');
        }
    }

    // ⚙️ Enhanced Apply Margins
    async applyMarginsToAll() {
        const defaultMarkup = parseFloat(document.getElementById('defaultMarkup')?.value) || 30;
        const profitMargin = parseFloat(document.getElementById('profitMargin')?.value) || 15;
        
        const confirmed = await this.showConfirmDialog(
            '⚙️ Terapkan Margin',
            `Terapkan markup ${defaultMarkup}% dan profit margin ${profitMargin}% ke semua ${this.materials.length} material?`,
            'Terapkan',
            'btn-primary'
        );
        
        if (!confirmed) return;
        
        try {
            this.setButtonLoading('applyMargins', true);
            
            if (db) {
                const promises = this.materials.map(material => {
                    const materialRef = doc(db, 'materials', material.id);
                    return updateDoc(materialRef, {
                        markup: defaultMarkup,
                        profitMargin: profitMargin,
                        updatedAt: new Date()
                    });
                });
                
                await Promise.all(promises);
            }
            
            // Update local data
            this.materials.forEach(material => {
                material.markup = defaultMarkup;
                material.profitMargin = profitMargin;
            });
            this.saveToLocalStorage();
            
            this.showMessage('✅ Margin berhasil diterapkan ke semua material!', 'success');
            
        } catch (error) {
            console.error('Error applying margins:', error);
            this.showMessage('❌ Gagal menerapkan margin: ' + error.message, 'error');
        } finally {
            this.setButtonLoading('applyMargins', false);
        }
    }

    // 💾 Enhanced Export Data
    exportData() {
        try {
            const exportData = {
                materials: this.materials,
                settings: this.settings,
                exportInfo: {
                    version: '2.0',
                    exportDate: new Date().toISOString(),
                    totalMaterials: this.materials.length,
                    totals: this.calculateTotals()
                }
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `nala-aircon-${new Date().toISOString().split('T')[0]}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(link.href);
            
            this.showMessage('📁 Data berhasil diekspor!', 'success');
            
        } catch (error) {
            console.error('Export error:', error);
            this.showMessage('❌ Gagal mengekspor data: ' + error.message, 'error');
        }
    }

    // 📁 Enhanced Import Data
    triggerImport() {
        document.getElementById('importFile')?.click();
    }

    async importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const text = await this.readFileAsText(file);
            const importedData = JSON.parse(text);
            
            if (!importedData.materials || !Array.isArray(importedData.materials)) {
                throw new Error('Format file tidak valid!');
            }
            
            const confirmed = await this.showConfirmDialog(
                '📁 Import Data',
                `Import ${importedData.materials.length} material? Data yang ada akan diganti.`,
                'Import',
                'btn-primary'
            );
            
            if (!confirmed) return;
            
            // Clear existing data
            await this.clearAllData(false);
            
            // Import materials
            if (db) {
                const promises = importedData.materials.map(material => {
                    const { id, ...materialData } = material;
                    return addDoc(collection(db, 'materials'), {
                        ...materialData,
                        importedAt: new Date()
                    });
                });
                
                await Promise.all(promises);
            }
            
            // Import settings
            if (importedData.settings) {
                this.settings = { ...this.settings, ...importedData.settings };
                this.saveSettings();
            }
            
            this.showMessage('📁 Data berhasil diimpor!', 'success');
            
        } catch (error) {
            console.error('Import error:', error);
            this.showMessage('❌ Gagal mengimpor data: ' + error.message, 'error');
        } finally {
            event.target.value = '';
        }
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Gagal membaca file'));
            reader.readAsText(file);
        });
    }

    // 🗑️ Enhanced Clear All Data
    async clearAllData(showConfirm = true) {
        if (showConfirm) {
            const confirmed = await this.showConfirmDialog(
                '🗑️ Hapus Semua Data',
                'Yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan!',
                'Hapus Semua',
                'btn-danger'
            );
            
            if (!confirmed) return;
        }
        
        try {
            if (db && this.materials.length > 0) {
                const promises = this.materials.map(material => 
                    deleteDoc(doc(db, 'materials', material.id))
                );
                
                await Promise.all(promises);
            }
            
            this.materials = [];
            this.saveToLocalStorage();
            
            this.showMessage('🗑️ Semua data berhasil dihapus!', 'info');
            
        } catch (error) {
            console.error('Error clearing data:', error);
            this.showMessage('❌ Gagal menghapus data: ' + error.message, 'error');
        }
    }

    // 🎯 Initialize Sample Data
    async initializeSampleData() {
        const sampleMaterials = [
            { name: 'AC Split 1 PK Daikin', unit: 'unit', realPrice: 2500000, markup: 30, profitMargin: 15 },
            { name: 'AC Split 1.5 PK LG', unit: 'unit', realPrice: 3200000, markup: 28, profitMargin: 15 },
            { name: 'Pipa Tembaga 1/2"', unit: 'meter', realPrice: 85000, markup: 25, profitMargin: 15 },
            { name: 'Pipa Tembaga 5/8"', unit: 'meter', realPrice: 95000, markup: 25, profitMargin: 15 },
            { name: 'Freon R32', unit: 'kg', realPrice: 120000, markup: 35, profitMargin: 15 },
            { name: 'Kabel NYM 3x2.5', unit: 'meter', realPrice: 15000, markup: 20, profitMargin: 15 },
            { name: 'Bracket AC', unit: 'set', realPrice: 75000, markup: 30, profitMargin: 15 },
            { name: 'Isolasi Pipa', unit: 'meter', realPrice: 12000, markup: 25, profitMargin: 15 }
        ];
        
        try {
            this.setButtonLoading('addSampleData', true);
            
            if (db) {
                const promises = sampleMaterials.map(material => 
                    addDoc(collection(db, 'materials'), {
                        ...material,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    })
                );
                
                await Promise.all(promises);
            }
            
            this.showMessage('🎯 Data contoh berhasil ditambahkan!', 'success');
            
        } catch (error) {
            console.error('Error adding sample data:', error);
            this.showMessage('❌ Gagal menambahkan data contoh: ' + error.message, 'error');
        } finally {
            this.setButtonLoading('addSampleData', false);
        }
    }

    // 🎨 Enhanced UI Utilities
    showMessage(text, type = 'info', duration = 4000) {
        this.hideMessage();
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-circle'
        };
        
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.id = 'statusMessage';
        message.innerHTML = `<i class="${icons[type] || icons.info}"></i> ${text}`;
        
        const header = document.querySelector('.header');
        if (header) {
            header.parentNode.insertBefore(message, header.nextSibling);
        } else {
            document.body.prepend(message);
        }
        
        if (duration > 0) {
            setTimeout(() => this.hideMessage(), duration);
        }
    }

    hideMessage() {
        const existingMessage = document.getElementById('statusMessage');
        if (existingMessage) {
            existingMessage.style.opacity = '0';
            setTimeout(() => existingMessage.remove(), 300);
        }
    }

    showWelcomeMessage() {
        setTimeout(() => {
            this.showMessage('🎉 Selamat datang di Nala Aircon Dashboard! Sistem siap digunakan.', 'success');
        }, 1000);
    }

    // 🔘 Enhanced Button States
    setButtonLoading(buttonId, isLoading) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            button.classList.add('loading');
        } else {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText || button.innerHTML;
            button.classList.remove('loading');
        }
    }

    // 💬 Enhanced Confirm Dialog
    showConfirmDialog(title, message, confirmText = 'OK', confirmClass = 'btn-primary') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay confirm-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${title}</h3>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove(); window.confirmResolve(false);">
                            <i class="fas fa-times"></i> Batal
                        </button>
                        <button class="btn ${confirmClass}" onclick="this.closest('.modal-overlay').remove(); window.confirmResolve(true);">
                            <i class="fas fa-check"></i> ${confirmText}
                        </button>
                    </div>
                </div>
            `;
            
            window.confirmResolve = resolve;
            document.body.appendChild(modal);
            
            requestAnimationFrame(() => {
                modal.classList.add('show');
            });
        });
    }

    // 🧹 Utility Methods
    clearForms() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
        inputs.forEach(input => {
            if (!input.classList.contains('editable')) {
                input.value = '';
            }
        });
    }

    clearFormInputs(inputs) {
        inputs.forEach(input => {
            if (input) {
                input.value = '';
                input.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    input.style.transform = 'scale(1)';
                }, 150);
            }
        });
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // 🔧 Utility: Debounce
    debounce(func, wait) {
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
}

// 🚀 Initialize App
const app = new NalaAirconApp();

// Global app instance for window methods
window.app = app;

// Start the application
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// 🎉 Success message
console.log('🎯 Nala Aircon Modern JavaScript Module Loaded!');
