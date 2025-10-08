const RATINGS_SECTION_ID = 'ratings-section';
const COMMENTS_CONTAINER_ID = 'comments-container';

const ERROR_MESSAGES = {
    NO_PRODUCT: 'No se ha seleccionado un producto.',
    LOAD_ERROR: 'Error al cargar las valoraciones.',
    NO_RATINGS: 'No hay valoraciones disponibles.'
};


const createStarRating = (rating) => {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="star ${i <= rating ? 'filled' : ''}">★</span>`;
    }
    return stars;
};

const renderStars = (score) => {
    return `<div class="comment-stars">${createStarRating(score)}</div>`;
};


function calculateRatingStats(ratings) {
    const stats = {
        average: 0,
        totalCount: ratings.length,
        countByRating: {
            5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        }
    };

    // Contar valoraciones por nivel
    ratings.forEach(rating => {
        stats.countByRating[rating.score] = (stats.countByRating[rating.score] || 0) + 1;
    });

    // Calcular promedio
    const sum = ratings.reduce((acc, rating) => acc + rating.score, 0);
    stats.average = ratings.length > 0 ? (sum / ratings.length).toFixed(1) : 0;

    return stats;
}


function createRatingBar(rating, count, total) {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    const userText = count === 1 ? 'valoración' : 'valoraciones';

    return `
        <div class="rating-bar-row">
            <div class="rating-label">${createStarRating(rating)}</div>
            <div class="rating-bar-container">
                <div class="rating-bar" 
                     data-rating="${rating}" 
                     style="width: ${percentage}%">
                </div>
            </div>
            <span class="rating-count">${count} ${userText}</span>
        </div>
    `;
}


function renderRatingsSection(stats) {
    const ratingsSection = document.getElementById(RATINGS_SECTION_ID);
    if (!ratingsSection) return;

    const content = `
        <div class="ratings-header">
            <h3 class="ratings-title">Valoraciones</h3>
            <span class="ratings-average">${stats.average} / 5</span>
        </div>
        <div class="ratings-bars">
            ${[5, 4, 3, 2, 1].map(rating => createRatingBar(
        rating,
        stats.countByRating[rating],
        stats.totalCount
    )).join('')}
        </div>
    `;

    ratingsSection.innerHTML = content;
}


const renderComments = (comments) => {
    const commentsContainer = document.getElementById(COMMENTS_CONTAINER_ID);
    if (!commentsContainer) return;

    if (!comments || comments.length === 0) {
        commentsContainer.innerHTML = `
            <h3 class="comments-title">Comentarios</h3>
            <p class="no-comments-text">No hay comentarios para este producto.</p>
        `;
        return;
    }

    const commentsHTML = comments.map(comment => `
        <div class="comment-card">
            <div class="comment-header">
                <div class="comment-user-info">
                    <span class="comment-user">${comment.user}</span>
                    ${renderStars(comment.score)}
                </div>
                <span class="comment-date">${new Date(comment.dateTime).toLocaleDateString('es-ES')}</span>
            </div>
            <div class="comment-body">
                <p class="comment-description">${comment.description}</p>
            </div>
        </div>
    `).join('');

    commentsContainer.innerHTML = `
        <h3 class="section-title">Comentarios</h3>
        <div class="comments-list">
            ${commentsHTML}
        </div>
    `;
};


const initRatingInteraction = () => {
    const stars = document.querySelectorAll('.rate-product-section .star');
    let selectedRating = 0;

    stars.forEach((star, index) => {
        star.addEventListener('mouseover', () => {
            for (let i = 0; i <= index; i++) {
                stars[i].classList.add('filled');
            }
            for (let i = index + 1; i < stars.length; i++) {
                stars[i].classList.remove('filled');
            }
        });

        star.addEventListener('mouseout', () => {
            stars.forEach((s, i) => {
                s.classList.toggle('filled', i < selectedRating);
            });
        });

        star.addEventListener('click', () => {
            selectedRating = index + 1;
            stars.forEach((s, i) => {
                s.classList.toggle('filled', i < selectedRating);
            });
        });
    });
};


function initCharCounter() {
    const textarea = document.querySelector('.rate-textarea');
    const charCount = document.querySelector('.char-count');

    if (textarea && charCount) {
        const updateCharCount = () => {
            const current = textarea.value.length;
            const max = textarea.getAttribute('maxlength');
            charCount.textContent = `${current}/${max}`;
        };

        textarea.addEventListener('input', updateCharCount);
        updateCharCount();
    }
}


async function initRatingsAndComments() {
    try {
        const productId = localStorage.getItem('productID');
        if (!productId) throw new Error(ERROR_MESSAGES.NO_PRODUCT);

        const url = PRODUCT_INFO_COMMENTS_URL + productId + EXT_TYPE;

        const result = await getJSONData(url);
        if (result.status === 'ok') {
            const stats = calculateRatingStats(result.data);
            renderRatingsSection(stats);
            renderComments(result.data);
        } else {
            throw new Error(ERROR_MESSAGES.LOAD_ERROR);
        }
    } catch (error) {
        console.error('Error:', error.message);
        const ratingsSection = document.getElementById(RATINGS_SECTION_ID);
        if (ratingsSection) {
            ratingsSection.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    initRatingsAndComments();
    initRatingInteraction();
    initCharCounter();
});