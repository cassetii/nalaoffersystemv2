// 🔥 Modern Firebase Configuration for Nala Aircon
// Enhanced with error handling and performance optimizations

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js";
import { getPerformance } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-performance.js";

// 🎯 Enhanced Firebase configuration with environment detection
const firebaseConfig = {
  apiKey: "AIzaSyCuFwg2lnAUPaL8vUeQl3qg7YRrh5jsj6c",
  authDomain: "nalaaircondb.firebaseapp.com",
  projectId: "nalaaircondb",
  storageBucket: "nalaaircondb.firebasestorage.app",
  messagingSenderId: "115578923963",
  appId: "1:115578923963:web:92932277f7d8beff37b29e",
  measurementId: "G-JC9PB6E9JR"
};

// 🚀 Initialize Firebase with enhanced error handling
let app;
let db;
let analytics = null;
let performance = null;

try {
  console.log('🔥 Initializing Firebase...');
  app = initializeApp(firebaseConfig);
  
  // Initialize Firestore with settings for better performance
  db = getFirestore(app);
  
  // Enable offline persistence (optional)
  // enableNetwork(db);
  
  console.log('✅ Firebase initialized successfully');
  
  // Initialize Analytics only if supported (privacy-friendly)
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log('📊 Analytics enabled');
    } else {
      console.log('📊 Analytics not supported in this environment');
    }
  }).catch(error => {
    console.warn('⚠️ Analytics initialization failed:', error);
  });
  
  // Initialize Performance monitoring
  try {
    performance = getPerformance(app);
    console.log('⚡ Performance monitoring enabled');
  } catch (error) {
    console.warn('⚠️ Performance monitoring failed:', error);
  }
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  
  // Show user-friendly error message
  if (typeof showMessage === 'function') {
    showMessage('⚠️ Gagal menghubungkan ke database. Silakan refresh halaman.', 'error');
  }
}

// 🛡️ Connection status monitoring
const monitorConnection = () => {
  // Simple online/offline detection
  window.addEventListener('online', () => {
    console.log('🌐 Connection restored');
    if (typeof showMessage === 'function') {
      showMessage('🌐 Koneksi dipulihkan!', 'success');
    }
  });
  
  window.addEventListener('offline', () => {
    console.log('📴 Connection lost');
    if (typeof showMessage === 'function') {
      showMessage('📴 Koneksi terputus. Data akan disinkronkan saat online.', 'info');
    }
  });
};

// Start monitoring when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', monitorConnection);
} else {
  monitorConnection();
}

// 📱 PWA Support Detection
const detectPWASupport = () => {
  if ('serviceWorker' in navigator) {
    console.log('🔧 Service Worker supported');
    // Could add service worker registration here for offline support
  }
  
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('📱 Running as PWA');
  }
};

detectPWASupport();

// 🎯 Enhanced error handling for exports
const safeExport = (item, name) => {
  if (!item) {
    console.error(`❌ Failed to export ${name} - not initialized`);
    return null;
  }
  return item;
};

// 📤 Safe exports with error handling
export { 
  safeExport(db, 'database') as db, 
  safeExport(analytics, 'analytics') as analytics,
  safeExport(performance, 'performance') as performance,
  app
};

// 🎉 Success notification
console.log('🎯 Nala Aircon Firebase Module Loaded Successfully!');
