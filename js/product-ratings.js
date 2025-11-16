import { getJSONData, PRODUCT_INFO_COMMENTS_URL, EXT_TYPE } from './init.js';

const RATINGS_SECTION_ID = 'ratings-section';
const COMMENTS_CONTAINER_ID = 'comments-container';

const ERROR_MESSAGES = {
    NO_PRODUCT: 'No se ha seleccionado un producto.',
    LOAD_ERROR: 'Error al cargar las valoraciones.',
    NO_RATINGS: 'No hay valoraciones disponibles.'
};

let allComments = [];

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

    ratings.forEach(rating => {
        stats.countByRating[rating.score] = (stats.countByRating[rating.score] || 0) + 1;
    });

    const sum = ratings.reduce((acc, rating) => acc + rating.score, 0);
    stats.average = ratings.length > 0 ? (sum / ratings.length).toFixed(1) : 0;

    return stats;
}

function createRatingBar(rating, count, total) {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return `
        <div class="rating-bar-row">
            <div class="rating-label">${createStarRating(rating)}</div>
            <div class="rating-bar-container">
                <div class="rating-bar" 
                     data-rating="${rating}" 
                     style="width: ${percentage}%">
                </div>
            </div>
            <span class="rating-count">${count}</span>
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
                <span class="comment-date">${formatDate(comment.dateTime)}</span>
            </div>
            <div class="comment-body">
                <p class="comment-description">${comment.description}</p>
            </div>
        </div>
    `).join('');

    commentsContainer.innerHTML = `
        <h3 class="comments-title">Comentarios</h3>
        <div class="comments-list">
            ${commentsHTML}
        </div>
    `;
};

function formatDate(dateString) {
    if (typeof dateString === 'string' && dateString.includes('/')) {
        return dateString;
    }
    return new Date(dateString).toLocaleDateString('es-ES');
}

function loadCommentsFromStorage(productId) {
    const stored = localStorage.getItem(`comentarios_${productId}`);
    return stored ? JSON.parse(stored) : null;
}

function saveCommentsToStorage(productId, comments) {
    localStorage.setItem(`comentarios_${productId}`, JSON.stringify(comments));
}

function addNewComment(productId, commentData) {
    const newComment = {
        user: commentData.user || localStorage.getItem('usuarioLogueado') || 'Anónimo',
        description: commentData.description,
        score: commentData.score,
        dateTime: new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString('es-ES')
    };

    allComments.push(newComment);
    saveCommentsToStorage(productId, allComments);

    const stats = calculateRatingStats(allComments);
    renderRatingsSection(stats);
    renderComments(allComments);
}

const initRatingInteraction = () => {
    const stars = document.querySelectorAll('.rate-product-section .star');
    let selectedRating = 0;

    stars.forEach((star, index) => {
        star.addEventListener('mouseover', () => {
            stars.forEach((s, i) => {
                if (i <= index) {
                    s.classList.add('filled');
                    s.classList.add('hover-active');
                } else {
                    s.classList.remove('filled');
                    s.classList.remove('hover-active');
                }
            });
        });

        star.addEventListener('mouseout', () => {
            stars.forEach((s, i) => {
                s.classList.remove('hover-active');
                if (i < selectedRating) {
                    s.classList.add('filled');
                    s.classList.add('selected');
                } else {
                    s.classList.remove('filled');
                    s.classList.remove('selected');
                }
            });
        });

        star.addEventListener('click', () => {
            selectedRating = index + 1;
            
            stars.forEach((s, i) => {
                s.classList.remove('hover-active');
                if (i < selectedRating) {
                    s.classList.add('filled');
                    s.classList.add('selected');
                } else {
                    s.classList.remove('filled');
                    s.classList.remove('selected');
                }
            });
            
            document.querySelector('.rate-product-section').dataset.selectedRating = selectedRating;
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

function initCommentSubmission() {
    const submitButton = document.querySelector('.submit-rating');
    const textarea = document.querySelector('.rate-textarea');
    const rateSection = document.querySelector('.rate-product-section');

    if (!submitButton || !textarea || !rateSection) return;

    submitButton.addEventListener('click', (e) => {
        e.preventDefault();

        const productId = localStorage.getItem('productID');
        if (!productId) {
            alert('Error: No se ha seleccionado un producto.');
            return;
        }

        const selectedRating = parseInt(rateSection.dataset.selectedRating || 0);
        const commentText = textarea.value.trim();

        if (selectedRating === 0) {
            alert('Por favor, selecciona una calificación con estrellas.');
            return;
        }

        if (commentText === '') {
            alert('Por favor, escribe un comentario.');
            return;
        }

        addNewComment(productId, {
            description: commentText,
            score: selectedRating
        });

        textarea.value = '';
        rateSection.dataset.selectedRating = '0';
        
        const stars = document.querySelectorAll('.rate-product-section .star');
        stars.forEach(star => {
            star.classList.remove('filled', 'selected', 'hover-active');
        });

        document.querySelector('.char-count').textContent = '0/1500';

        document.getElementById(COMMENTS_CONTAINER_ID)?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    });
}

async function initRatingsAndComments() {
    try {
        const productId = localStorage.getItem('productID');
        if (!productId) throw new Error(ERROR_MESSAGES.NO_PRODUCT);

        const storedComments = loadCommentsFromStorage(productId);

        if (storedComments) {
            allComments = storedComments;
            const stats = calculateRatingStats(allComments);
            renderRatingsSection(stats);
            renderComments(allComments);
        } else {
            const url = PRODUCT_INFO_COMMENTS_URL + productId + EXT_TYPE;
            const result = await getJSONData(url);
            
            if (result.status === 'ok') {
                allComments = result.data;
                saveCommentsToStorage(productId, allComments);
                
                const stats = calculateRatingStats(allComments);
                renderRatingsSection(stats);
                renderComments(allComments);
            } else {
                throw new Error(ERROR_MESSAGES.LOAD_ERROR);
            }
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
    initCommentSubmission();
});