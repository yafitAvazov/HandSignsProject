const searchInput = document.getElementById('homeSearch');
const searchForm = document.querySelector('.search-panel');
const modeCards = Array.from(document.querySelectorAll('.mode-card'));

const emptyState = document.createElement('p');
emptyState.className = 'empty-state';
emptyState.textContent = 'No matching mode found';
emptyState.hidden = true;
document.querySelector('.quick-grid').after(emptyState);

function filterModes(value) {
    const query = value.trim().toLowerCase();
    let visibleCount = 0;

    modeCards.forEach(card => {
        const content = `${card.textContent} ${card.dataset.keywords}`.toLowerCase();
        const isVisible = !query || content.includes(query);
        card.classList.toggle('is-hidden', !isVisible);
        if (isVisible) {
            visibleCount++;
        }
    });

    emptyState.hidden = visibleCount > 0;
}

searchInput.addEventListener('input', event => {
    filterModes(event.target.value);
});

searchForm.addEventListener('submit', event => {
    event.preventDefault();

    const firstVisibleCard = modeCards.find(card => !card.classList.contains('is-hidden'));
    const link = firstVisibleCard?.querySelector('a');

    if (link) {
        window.location.href = link.href;
    }
});
