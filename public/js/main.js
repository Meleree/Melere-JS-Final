document.addEventListener('DOMContentLoaded', () => {
    const miBoton = document.getElementById('miBoton');
    if (miBoton) {
        miBoton.addEventListener('click', iniciarSesion);
    } else {
        console.error("El botón 'miBoton' no se encontró.");
    }

    const sinRegistroBtn = document.getElementById('sinRegistroBtn');
    if (sinRegistroBtn) {
        sinRegistroBtn.addEventListener('click', () => {
            Swal.fire("Bienvenido a Melere");
            cerrarPopup();
        });
    } else {
        console.error("El botón 'sinRegistroBtn' no se encontró.");
    }

    cargarArticulos();
    mostrarPopup();
});

function mostrarPopup() {
    document.getElementById('loginPopup').style.display = 'block';
}

function cerrarPopup() {
    document.getElementById('loginPopup').style.display = 'none';
}

let carrito = [];
const IVA = 0.21;
const articulos = [];

const usuarioCorrecto = "usuario";  
const contrasenaCorrecta = "1234";  

function iniciarSesion() {
    const nombreUsuario = document.getElementById('nombreUsuario').value.trim();
    const contrasena = document.getElementById('contrasena').value;

    if (nombreUsuario === "" || contrasena === "") {
        Swal.fire("Por favor, completa ambos campos");
    } else if (nombreUsuario === usuarioCorrecto && contrasena === contrasenaCorrecta) {
        Swal.fire("Bienvenido " + nombreUsuario + " a Melere");
        cerrarPopup();
        localStorage.setItem('nombreUsuario', nombreUsuario);
    } else {
        Swal.fire("Nombre de usuario o contraseña incorrectos");
    }
}

async function cargarArticulos() {
    try {
        const response = await fetch('./JSON/articulos.json');
        if (!response.ok) {
            throw new Error('Error al cargar los artículos');
        }
        const data = await response.json();
        articulos.push(...data);
        mostrarArticulos();
    } catch (error) {
        console.error('Error al cargar los artículos:', error);
    }
}

function mostrarArticulos() {
    const contenedor = document.getElementById('contenedor-articulos');
    contenedor.innerHTML = ''; 
    
    articulos.forEach(articulo => {
        const articuloDiv = document.createElement('div');
        articuloDiv.classList.add('articulo');
        
        const tallasDiv = document.createElement('div');
        tallasDiv.classList.add('tallas');
        articulo.talleProducto.forEach(talla => {
            const tallaBtn = document.createElement('button');
            tallaBtn.textContent = talla;
            tallaBtn.classList.add('talla-btn');
            tallaBtn.onclick = () => {
                agregarAlCarrito(articulo, talla);
            };
            tallasDiv.appendChild(tallaBtn);
        });
        
        const precioConIVA = (articulo.precioProducto * (1 + IVA)).toFixed(2);

        articuloDiv.innerHTML = `
            <img src="${articulo.imagenUrl}" alt="${articulo.nombreProducto}">
            <h3>${articulo.nombreProducto}</h3>
            <p>Precio: $${precioConIVA}</p>
        `;
        
        articuloDiv.appendChild(tallasDiv);
        contenedor.appendChild(articuloDiv);
    });
}

function buscarArticulos() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const articulosFiltrados = articulos.filter(articulo => 
        articulo.nombreProducto.toLowerCase().includes(input)
    );
    mostrarArticulosFiltrados(articulosFiltrados);
}

function mostrarArticulosFiltrados(articulosFiltrados) {
    const contenedor = document.getElementById('contenedor-articulos');
    contenedor.innerHTML = ''; 
    articulosFiltrados.forEach(articulo => {
        const articuloDiv = document.createElement('div');
        articuloDiv.classList.add('articulo');
        const tallasDiv = document.createElement('div');
        tallasDiv.classList.add('tallas');
        articulo.talleProducto.forEach(talla => {
            const tallaBtn = document.createElement('button');
            tallaBtn.textContent = talla;
            tallaBtn.classList.add('talla-btn');
            tallaBtn.onclick = () => {
                seleccionarTalla(talla, articulo.id);
            };
            tallasDiv.appendChild(tallaBtn);
        });
        const precioConIVA = (articulo.precioProducto * (1 + IVA)).toFixed(2);
        articuloDiv.innerHTML = `
            <img src="${articulo.imagenUrl}" alt="${articulo.nombreProducto}">
            <h3>${articulo.nombreProducto}</h3>
            <p>Precio: $${precioConIVA}</p>
        `;
        
        articuloDiv.appendChild(tallasDiv);
        contenedor.appendChild(articuloDiv);
    });
}

function seleccionarTalla(talla, articuloId) {
    const articulo = articulos.find(a => a.id === articuloId);
    if (articulo) {
        let itemEnCarrito = carrito.find(item => item.articulo.id === articulo.id && item.talla === talla);
        if (itemEnCarrito) {
            itemEnCarrito.cantidad += 1; 
        } else {
            carrito.push({ articulo, cantidad: 1, talla }); 
        }
        actualizarContadorCarrito();
    }
}

function mostrarCarrito() {
    const cartOverlay = document.getElementById('cartOverlay');
    const cartContents = document.getElementById('cartContents');
    
    if (carrito.length === 0) {
        cartContents.innerHTML = "<p>El carrito está vacío.</p>";
    } else {
        let resumenCarrito = "";
        let total = 0;
        carrito.forEach((item, index) => {
            const precioConIVA = (item.articulo.precioProducto * (1 + IVA)).toFixed(2);
            const subtotal = (item.cantidad * item.articulo.precioProducto * (1 + IVA)).toFixed(2);
            resumenCarrito += `
            <div class="cart-item">
                <img src="${item.articulo.imagenUrl}" alt="${item.articulo.nombreProducto}" width="50">
                <p><strong>Artículo:</strong> ${item.articulo.nombreProducto}</p>
                <p><strong>Talla:</strong> ${item.talla}</p>
                <p><strong>Precio Unitario (con IVA):</strong> $${precioConIVA}</p>
                <p><strong>Subtotal:</strong> $${subtotal}</p>
                <button onclick="actualizarCantidad(${index}, carrito[${index}].cantidad - 1)">-</button>
                <input type="number" value="${item.cantidad}" min="1" onchange="actualizarCantidad(${index}, this.value)">
                <button onclick="actualizarCantidad(${index}, carrito[${index}].cantidad + 1)">+</button>
                <button onclick="eliminarArticulo(${index})">Eliminar</button>
            </div>
            `;
            total += parseFloat(subtotal);
        });
        resumenCarrito += `<p><strong>Total:</strong> $${total.toFixed(2)}</p>`;
        cartContents.innerHTML = resumenCarrito;
    }
    cartOverlay.style.display = 'flex'; 
}

function eliminarArticulo(index) {
    carrito.splice(index, 1); 
    actualizarContadorCarrito(); 
    mostrarCarrito(); 
}

function cerrarCarrito() {
    const cartOverlay = document.getElementById('cartOverlay');
    cartOverlay.style.display = 'none'; 
}

function finalizarCompra() {
    const medioPago = document.getElementById('medioPago').value;
    const medioEnvio = document.getElementById('medioEnvio').value;        
    if (carrito.length === 0) {
        Swal.fire("Tu carrito está vacío. No puedes finalizar la compra");
        return;
    }
    if (medioPago === "opcion") {
        Swal.fire("Por favor, selecciona un medio de pago válido");
        return;
    }
    if (medioEnvio === "opcion") {
        Swal.fire("Por favor, selecciona un medio de envío válido");
        return;
    }        
    Swal.fire("¡Gracias por tu compra! Tu pedido ha sido procesado");
    carrito = [];
    actualizarContadorCarrito();
    cerrarCarrito();
}

function agregarAlCarrito(articulo, talla) {
    let itemEnCarrito = carrito.find(item => item.articulo.id === articulo.id && item.talla === talla);
    if (itemEnCarrito) {
        itemEnCarrito.cantidad += 1;
    } else {
        carrito.push({ articulo, cantidad: 1, talla });
    }
    actualizarContadorCarrito();
}

        
function actualizarCantidad(index, nuevaCantidad) {
    if (nuevaCantidad < 1) {
        carrito.splice(index, 1);
        Swal.fire("El artículo ha sido eliminado del carrito");
    } else {
        carrito[index].cantidad = nuevaCantidad;
    }

    actualizarContadorCarrito();
    mostrarCarrito();
}

function actualizarContadorCarrito() {
    const cartCount = document.getElementById('cartCount');
    cartCount.textContent = carrito.reduce((total, item) => total + item.cantidad, 0);
}
        
function mostrarPopup() {
    document.getElementById('loginPopup').style.display = 'block';
}

function cerrarPopup() {
    document.getElementById('loginPopup').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    emailjs.init("qtZMHmSS3H2qtNkHe"); 
});

const formulario = document.getElementById('miFormulario');
formulario.addEventListener('submit', (event) => {
    event.preventDefault(); 
    enviarEmail(); 
});

function enviarEmail() {
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();

    if (!nombre || !email || !mensaje) {
        Swal.fire("Por favor, completa todos los campos");
        return;
    }

    const templateParams = {
        name: 'Nombre de prueba',
        email: 'test@example.com',
        message: 'Este es un mensaje de prueba.'
    };

    console.log("Enviando email con los siguientes parámetros:", templateParams);

    emailjs.send('MELERE', 'template_ry4ihet', templateParams)
        .then((response) => {
            console.log('SUCCESS!', response.status, response.text);
            Swal.fire("Correo enviado con éxito!");
        }, (error) => {
            console.error('FAILED...', error);
            Swal.fire("Error al enviar el correo");
        });
}

window.onload = function() {
    mostrarPopup();
    cargarArticulos();
};