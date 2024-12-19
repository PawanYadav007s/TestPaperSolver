// Global variables for progress tracking
let currentProgress = 0;
let progressInterval;

// Utility function to handle notifications
class NotificationManager {
    static show(message, type = 'success') {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create and show new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Progress bar management
class ProgressManager {
    static updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (currentProgress < 90) {
            currentProgress += Math.random() * 15;
            currentProgress = Math.min(currentProgress, 90);
            progressFill.style.width = `${currentProgress}%`;
            progressText.textContent = `${Math.round(currentProgress)}%`;
        }
    }

    static simulateProgress() {
        currentProgress = 0;
        clearInterval(progressInterval);
        progressInterval = setInterval(this.updateProgress, 1000);
    }

    static complete() {
        clearInterval(progressInterval);
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        progressFill.style.width = '100%';
        progressText.textContent = '100%';
    }
}

// File upload handling
class FileUploadManager {
    constructor() {
        this.form = document.getElementById('upload-form');
        this.processingStatus = document.getElementById('processing-status');
        this.fileInput = document.querySelector('input[type="file"]');
        this.fileInfo = document.getElementById('file-info');
        this.fileName = document.getElementById('file-name');
        this.fileLabel = document.getElementById('file-label');
        this.submitBtn = document.getElementById('submit-btn');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File selection handler
        this.fileInput.addEventListener('change', (e) => this.handleFileSelection(e));
        
        // Form submission handler
        this.form.addEventListener('submit', (e) => this.handleFormSubmission(e));

        // Drag and drop handlers
        this.fileLabel.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.fileLabel.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.fileLabel.addEventListener('drop', (e) => this.handleDrop(e));
    }

    handleFileSelection(event) {
        const file = event.target.files[0];
        if (file) {
            this.updateFileInfo(file);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        this.fileLabel.classList.add('bg-blue-100');
    }

    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        this.fileLabel.classList.remove('bg-blue-100');
    }

    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        this.fileLabel.classList.remove('bg-blue-100');

        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'application/pdf') {
                this.fileInput.files = files;
                this.updateFileInfo(file);
            } else {
                NotificationManager.show('Please upload a PDF file only', 'error');
            }
        }
    }

    updateFileInfo(file) {
        this.fileName.textContent = file.name;
        this.fileInfo.classList.remove('hidden');
        this.fileLabel.classList.add('bg-blue-500', 'text-white');
        NotificationManager.show('PDF file selected: ' + file.name);
    }

    async handleFormSubmission(event) {
        event.preventDefault();
        
        if (!this.fileInput.files[0]) {
            NotificationManager.show('Please select a PDF file first!', 'error');
            return;
        }

        NotificationManager.show('Starting PDF processing...');
        this.form.style.display = 'none';
        this.processingStatus.classList.remove('hidden');
        ProgressManager.simulateProgress();

        try {
            const formData = new FormData(this.form);
            const response = await fetch('/', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Processing failed');
            }

            const blob = await response.blob();
            await this.handleSuccessfulUpload(blob);
        } catch (error) {
            this.handleUploadError(error);
        }
    }

    async handleSuccessfulUpload(blob) {
        ProgressManager.complete();
        
        // Create and trigger download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'processed_qa.docx';
        
        NotificationManager.show('Processing complete! Download starting...');
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        // Show success notification after a delay
        setTimeout(() => {
            NotificationManager.show('File downloaded successfully!');
        }, 1000);
        
        // Reset form after delay
        setTimeout(() => {
            this.resetForm();
        }, 2000);
    }

    handleUploadError(error) {
        NotificationManager.show('Error processing PDF: ' + error.message, 'error');
        this.form.style.display = 'block';
        this.processingStatus.classList.add('hidden');
    }

    resetForm() {
        this.form.style.display = 'block';
        this.processingStatus.classList.add('hidden');
        this.form.reset();
        this.fileInfo.classList.add('hidden');
        this.fileLabel.classList.remove('bg-blue-500', 'text-white');
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FileUploadManager();
});