// JavaScript voor de Marvel Rivals app
// Dit wordt geladen op elke pagina

document.addEventListener('DOMContentLoaded', function () {
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(el => new bootstrap.Tooltip(el));

    const zoekInput = document.getElementById('searchInput');
    if (zoekInput) {
        zoekInput.focus();

        zoekInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                this.value = '';
                this.form.submit();
            }
        });
    }

    // Als een plaatje niet laadt, laat dat netjes zien
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function () {
            this.style.opacity = '0.5';
            this.alt = 'Afbeelding niet beschikbaar';
        });
    });

    // Tabel rijen hover effect - maakt het duidelijker waar je muis is
    document.querySelectorAll('.table tbody tr').forEach(row => {
        row.addEventListener('mouseenter', () => {
            row.style.backgroundColor = '#f8f9fa';
            row.style.cursor = 'pointer';
        });

        row.addEventListener('mouseleave', () => {
            row.style.backgroundColor = '';
        });
    });

    // Karakter kaartjes hover effect
    document.querySelectorAll('.team-member-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-2px)';
            card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });
    });

    console.log('Marvel Rivals app geladen en klaar voor gebruik');
});