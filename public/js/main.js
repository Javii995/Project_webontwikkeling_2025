// Main JavaScript for Marvel Rivals App

document.addEventListener('DOMContentLoaded', function () {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Search functionality enhancement
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        // Auto-focus search input when page loads
        searchInput.focus();

        // Clear search with Escape key
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                this.value = '';
                this.form.submit();
            }
        });

        // Add search icon animation
        const searchButton = searchInput.nextElementSibling;
        if (searchButton && searchButton.type !== 'hidden') {
            searchInput.addEventListener('input', function () {
                if (this.value.length > 0) {
                    searchButton.classList.add('btn-success');
                    searchButton.classList.remove('btn-primary');
                } else {
                    searchButton.classList.add('btn-primary');
                    searchButton.classList.remove('btn-success');
                }
            });
        }
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Image loading with fallback
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function () {
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyOC4wMDAzQzI0LjQxODMgMjguMDAwMyAyOCAyNC40MTg2IDI4IDIwLjAwMDNDMjggMTUuNTgyIDI0LjQxODMgMTIuMDAwMyAyMCAxMi4wMDAzQzE1LjU4MTcgMTIuMDAwMyAxMiAxNS41ODIgMTIgMjAuMDAwM0MxMiAyNC40MTg2IDE1LjU4MTcgMjguMDAwMyAyMCAyOC4wMDAzWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
            this.alt = 'Image not available';
            this.classList.add('opacity-50');
        });

        // Add loading animation
        img.addEventListener('load', function () {
            this.classList.add('fade-in');
        });
    });

    // Table row hover effects
    document.querySelectorAll('.table tbody tr').forEach(row => {
        row.addEventListener('mouseenter', function () {
            this.style.backgroundColor = '#f8f9fa';
            this.style.cursor = 'pointer';
        });

        row.addEventListener('mouseleave', function () {
            this.style.backgroundColor = '';
        });
    });

    // Character/Team card hover effects
    document.querySelectorAll('.team-member-card').forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });

    // Loading states for buttons - FIX: Don't interfere with form submissions
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function (e) {
            // ONLY add loading for links that aren't form submits or anchor links
            if (this.tagName === 'A' && !this.href.includes('#') && this.type !== 'submit') {
                const originalText = this.innerHTML;
                const loadingText = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';

                this.innerHTML = loadingText;
                this.disabled = true;

                // Re-enable after 2 seconds (fallback)
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.disabled = false;
                }, 2000);
            }
            // Don't interfere with form submit buttons or other functionality
        });
    });

    // Console log for debugging
    console.log('🦸‍♂️ Marvel Rivals App loaded successfully!');
    console.log('🚀 All interactive features initialized');
});

// Utility function for showing notifications
function showNotification(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alertDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Error handling for fetch requests
window.addEventListener('unhandledrejection', function (event) {
    console.error('Unhandled promise rejection:', event.reason);
    showNotification('Something went wrong. Please try again.', 'danger');
});