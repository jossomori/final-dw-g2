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