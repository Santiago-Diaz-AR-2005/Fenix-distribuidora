// Sample Data with "Golden/Premium" aesthetic
const products = [
    {
        id: 1,
        name: "Reloj Fenix Gold",
        price: 4999.00,
        description: "Elegancia atemporal con acabados en oro de 24k.",
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" // Placeholder
    },
    {
        id: 2,
        name: "Cadena Renacer",
        price: 2500.00,
        description: "Diseño intrincado que simboliza el poder del renacimiento.",
        image: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" // Placeholder
    },
    {
        id: 3,
        name: "Anillo Imperial",
        price: 1800.00,
        description: "Un símbolo de poder para quienes lideran su propio destino.",
        image: "https://images.unsplash.com/photo-1622398925373-3f9162db8d87?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" // Placeholder
    },
    {
        id: 4,
        name: "Brazalete Solar",
        price: 3200.00,
        description: "Brilla con la intensidad del sol naciente.",
        image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" // Placeholder
    },
    {
        id: 5,
        name: "Gafas de Sol Onyx",
        price: 1500.00,
        description: "Misterio y estilo en cada mirada.",
        image: "https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" // Placeholder
    },
    {
        id: 6,
        name: "Perfume Liquid Gold",
        price: 5500.00,
        description: "Una fragancia que deja una huella imborrable.",
        image: "https://images.unsplash.com/photo-1594035910387-fea477942698?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" // Placeholder
    }
];

// App State
let cart = JSON.parse(localStorage.getItem('fenix_cart')) || [];

// DOM Elements
const productsGrid = document.getElementById('products');
const cartSidebar = document.getElementById('cart-sidebar');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartCountElement = document.getElementById('cart-count');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartUI();
});

// Render Products
function renderProducts() {
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <span class="product-price">$${product.price.toLocaleString()}</span>
                <button class="add-btn" onclick="addToCart(${product.id})">
                    Agregar <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Cart Functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    // Open cart to show feedback
    cartSidebar.classList.add('open');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('fenix_cart', JSON.stringify(cart));
}

function updateCartUI() {
    // Update count badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;

    // Update list
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toLocaleString()} x ${item.quantity}</p>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="remove-item-btn" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = `$${total.toLocaleString()}`;
}

function toggleCart() {
    cartSidebar.classList.toggle('open');
}

// Checkout & PDF Logic
async function checkout() {
    if (cart.length === 0) {
        alert("Tu carrito está vacío. Agrega productos para brillar.");
        return;
    }

    // 1. Generate PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Theme Colors for PDF
    const goldColor = [212, 175, 55];
    const blackColor = [20, 20, 20];

    // Header
    doc.setFillColor(...blackColor); // Black background header
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(...goldColor); // Gold Text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("FENIX - Orden de Compra", 105, 20, null, null, "center");

    // Order info
    doc.setTextColor(0, 0, 0); // Reset text to black for body
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 50);

    // Table Data
    const tableColumn = ["Producto", "Cantidad", "Precio Unit.", "Total"];
    const tableRows = [];

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const row = [
            item.name,
            item.quantity.toString(),
            `$${item.price.toLocaleString()}`,
            `$${itemTotal.toLocaleString()}`
        ];
        tableRows.push(row);
    });

    // AutoTable Plugin
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 60,
        theme: 'grid',
        headStyles: { fillColor: blackColor, textColor: goldColor },
        styles: { font: "helvetica", fontSize: 10 }
    });

    // Grand Total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalY = doc.lastAutoTable.finalY + 15;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Total a Pagar: $${total.toLocaleString()}`, 14, finalY);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Gracias por elegir FENIX. Tu estilo, tu renacer.", 105, 280, null, null, "center");

    // Save PDF logic changed to handle Blob for sharing
    const pdfBlob = doc.output('blob');
    const fileName = `Pedido_Fenix_${Date.now()}.pdf`;
    const file = new File([pdfBlob], fileName, { type: "application/pdf" });

    // 2. WhatsApp Integration / Sharing
    const phoneNumber = "5493812466931";

    // Build detailed text message
    let orderDetails = cart.map(item => `• ${item.name} (x${item.quantity}): $${(item.price * item.quantity).toLocaleString()}`).join('\n');
    const message = `Hola FENIX! ✨\n\nQuiero realizar el siguiente pedido:\n\n${orderDetails}\n\n*Total a pagar: $${total.toLocaleString()}*\n\n(He generado el comprobante PDF para mi control).`;

    // Try Web Share API first (For Mobile/Modern Browsers)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
            files: [file],
            title: 'Pedido Fenix',
            text: message
        })
            .then(() => console.log('Compartido con éxito'))
            .catch((error) => console.log('Error al compartir', error));
    } else {
        // Fallback: Download PDF + Text Message
        doc.save(fileName);

        setTimeout(() => {
            const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(waUrl, '_blank');
        }, 1000);
    }
}
