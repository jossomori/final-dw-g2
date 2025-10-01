document.addEventListener("DOMContentLoaded", function() {
	const productID = localStorage.getItem("productID");
	if (!productID) {
		document.querySelector("main .container").innerHTML = '<div class="alert alert-danger text-center">No se ha seleccionado un producto.</div>';
		return;
	}
	const url = `${PRODUCT_INFO_URL}${productID}${EXT_TYPE}`;
	getJSONData(url).then(result => {
		if (result.status === 'ok') {
			const prod = result.data;
			// Galería principal
			console.log('API result:', result);
			if (prod.images && prod.images.length > 0) {
				const mainImg = document.getElementById('main-product-image');
				if (mainImg) {
					mainImg.src = prod.images[0];
					mainImg.alt = prod.name;
				} else {
					console.warn('No se encontró el elemento main-product-image');
				}
			} else {
				console.warn('El producto no tiene imágenes');
			}
			// Miniaturas
			const thumbs = prod.images.map((img, i) => `
				<img src="${img}" alt="${prod.name} miniatura" class="img-fluid rounded ${i === 0 ? 'border-primary' : ''}" style="width:110px;height:70px;object-fit:cover;cursor:pointer;" data-img-idx="${i}">
			`).join('');
			document.getElementById('product-thumbnails').innerHTML = thumbs;
			// Miniaturas: cambiar imagen principal
			document.querySelectorAll('#product-thumbnails img').forEach(thumb => {
				thumb.addEventListener('click', function() {
					document.getElementById('main-product-image').src = this.src;
					document.querySelectorAll('#product-thumbnails img').forEach(t => t.classList.remove('border-primary'));
					this.classList.add('border-primary');
				});
			});
			// Info lateral
			document.getElementById('product-sold-count').textContent = prod.soldCount + ' vendidos';
			document.getElementById('product-name').textContent = prod.name;
			document.title = prod.name + " - eMercado";
			document.getElementById('product-description').textContent = prod.description;
			document.getElementById('product-price').textContent = `USD ${prod.cost}`;
			// Breadcrumb
			const breadcrumbName = document.getElementById('breadcrumb-product-name');
			if (breadcrumbName) breadcrumbName.textContent = prod.name;
			// Productos similares
			if (prod.relatedProducts && prod.relatedProducts.length) {
				const similarList = prod.relatedProducts.map(sim => `
					<div class="col-md-3 mb-4">
						<div class="similar-card h-100" onclick="localStorage.setItem('productID', ${sim.id}); window.location='product-info.html';">
							<img src="${sim.image}" class="similar-img" alt="${sim.name}">
							<div class="similar-info">
								<div class="similar-title-card">${sim.name}</div>
								<div class="similar-desc">Generación 2019, variedad de colores...</div>
								<div class="similar-price">USD ${sim.cost || ''}</div>
							</div>
						</div>
					</div>
				`).join('');
				document.getElementById('similar-products').innerHTML = similarList;
			}
		} else {
			document.querySelector("main .container").innerHTML = '<div class="alert alert-danger text-center">No se pudo cargar la información del producto.</div>';
		}
	});
});

let comentarios = []; // acá vamos a mezclar API + nuevos :D
const productID = localStorage.getItem("productID");

// URL de comentarios de la API :
const COMMENTS_URL = `https://japceibal.github.io/emercado-api/products_comments/${productID}.json`;

// Al cargar la página ;
document.addEventListener("DOMContentLoaded", () => {
  // Primero, veo si ya hay comentarios en localStorage
  const guardados = localStorage.getItem(`comentarios_${productID}`);

  if (guardados) {
    // Si ya existen, los uso
    comentarios = JSON.parse(guardados);
    mostrarComentarios(comentarios);
  } else {
    // Si no existen, los traigo de la API y los guardo
    fetch(COMMENTS_URL)
      .then(res => res.json())
      .then(data => {
        comentarios = data;
        localStorage.setItem(`comentarios_${productID}`, JSON.stringify(comentarios));
        mostrarComentarios(comentarios);
      });
  }
});

// Manejar el formulario
document.getElementById("rating-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const usuario = localStorage.getItem("usuarioLogueado") || "Anónimo";
  const score = parseInt(document.querySelector('input[name="rating"]:checked')?.value || 0);
  const text = document.getElementById("comment-text").value;

  if (score === 0 || text.trim() === "") {
    alert("Debes seleccionar una calificación y escribir un comentario.");
    return;
  }

  const nuevoComentario = {
    user: usuario,
    description: text,
    score: score,
    dateTime: new Date().toLocaleString("es-ES")
  };

  // Lo agrego al array de comentarios
  comentarios.push(nuevoComentario);

  // Actualizo localStorage
  localStorage.setItem(`comentarios_${productID}`, JSON.stringify(comentarios));

  // Muestro todo de nuevo
  mostrarComentarios(comentarios);

  e.target.reset();
});

// Función para renderizar comentarios
function mostrarComentarios(lista) {
  const contenedor = document.getElementById("product-comments");
  let html = "";

  lista.forEach(com => {
    html += `
      <div class="comment border rounded p-2 mb-2">
        <div class="d-flex justify-content-between">
          <strong>${com.user}</strong>
          <small class="text-muted">${com.dateTime}</small>
        </div>
        <div class="stars mb-1">${renderStars(com.score)}</div>
        <p>${com.description}</p>
      </div>
    `;
  });

  contenedor.innerHTML = html;
}

// Función para pintar estrellitas
function renderStars(score) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars += i <= score 
      ? `<span style="color:gold;">★</span>` 
      : `<span style="color:#ccc;">★</span>`;
  }
  return stars;
}
