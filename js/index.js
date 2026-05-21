const container = document.querySelector('.cards-container');
const message = document.querySelector('.floating-message');
const sectionCart = document.querySelector('.cart-section');
const btnRemoveItems = document.querySelectorAll('.btn-remove-dessert');
const cartProducts = document.querySelector('.cart-items');
const renderTotal = document.querySelector('.cart-total');
const confirmBtn = document.querySelector('.confirm-order-button');
const newOrderButton = document.querySelector('.new-order-button');
const overlay = document.querySelector('.overlay');
const modal = document.querySelector('.confirmation-modal');

function renderDesserts(data) {

    data.forEach((item, index) => {
        const card = document.createElement('article')
        card.classList.add('card')

        card.dataset.id = item.id;

        card.innerHTML = `
            <picture>
                <source media="(max-width:600px)" srcset="${item.image.mobile}">
                <source media="(max-width: 1024px)" srcset="${item.image.tablet}">
                <img src="${item.image.desktop}" alt="${item.name}" class="dessert-image">
            </picture>
            
            <p class="dessert-category">${item.category}</p>
            <h3 class="dessert-name">${item.name}</h3>

            <p class="dessert-price">${item.price.toFixed(2)}</p>

            <div class="cart-actions">
                <button type="button" class="add-to-cart-button">
                    <img class="cart-image" src="./assets/images/icon-add-to-cart.svg" alt="Add to Cart">
                    <span class="add-to-cart-text">Add to Cart</span>
                </button>

                <div class="quantity-controls">
                    <button class="decrement-button">
                        <img class="counter-minus" src="./assets/images/icon-decrement-quantity.svg" alt="Icon decrement quantity">
                    </button>
                    <span class="counter-quantity">1</span>
                    <button class="increment-button">
                        <img class="counter-plus" src="./assets/images/icon-increment-quantity.svg" alt="Icon increment quantity">
                    </button>
                </div>
            </div>
        `
        const buttonsAddCart = card.querySelector('.add-to-cart-button');
        const buttonsCounterMinus = card.querySelector('.decrement-button');
        const buttonsCounterPlus = card.querySelector('.increment-button');    

        buttonsAddCart.addEventListener("click", addToCart);
        buttonsCounterMinus.addEventListener("click", increaseQuantity);
        buttonsCounterPlus.addEventListener("click", incrementQuantity);

        container.appendChild(card)
    });
};

let products = [];
let cartItems = [];

fetch('./data.json')
    .then(res => res.json())
    .then(data => {
        products = data;

        renderDesserts(data)
    });

sectionCart.addEventListener("click", (event) => {
    const button = event.target.closest(".confirm-order-button");

    if (!button) {
        console.error("An error occurred")
        return;
    }

    confirmOrder();
});

function updateCart() {
    const cartTitle = document.querySelector('.cart-title');
    const emptyImage = document.querySelector('.empty-image');
    const emptyText = document.querySelector('.empty-cart-text');

    let total = 0;

    cartItems.forEach(item => {
        total += item.quantity;
    });

    cartTitle.textContent = `Carrinho(${total})`;

    if (cartItems.length === 0) {
        renderTotal.style.display = "none";
    } else {
        renderTotal.style.display = "block";
    }

    if (total === 0) {
        sectionCart.classList.add('empty');
        emptyImage.style.display = 'block';
        emptyText.style.display = 'block';
        cartProducts.style.display = 'none';
        return;
    }
    sectionCart.classList.remove('empty');
    emptyImage.style.display = 'none';
    emptyText.style.display = 'none';
    cartProducts.style.display = 'block';

    cartProducts.innerHTML = "";

    cartItems.forEach((product, index) => {

        const totalPrice = product.price * product.quantity;

        cartProducts.innerHTML += `
            <div class="cart-item">
                <h3 class="cart-item-name">${product.name}</h3>
                <div class="cart-item-details">
                    <p class="price-details"> 
                        <span class="item-quantity">${product.quantity}x</span> $ ${product.price.toFixed(2)} = $ ${totalPrice.toFixed(2)}
                    </p>
                    <button class="remove-item-button" data-index="${index}">
                        <img src="./assets/images/icon-remove-item.svg" alt="Image remove dessert" class="remove-item-icon">
                    </button>
                </div>
                <hr>
            </div>  
        `;

        const totalCost = cartItems.reduce((acumulador, item) => {
            return acumulador + item.price * item.quantity;
        }, 0);

        renderTotal.innerHTML = `
        <div class="order-total">
            <p>Order Total</p> 
            <span class="order-total-price">$ ${totalCost.toFixed(2)}</span>
        </div>
        <div class="carbon-neutral-info">
            <img src="./assets/images/icon-carbon-neutral.svg" alt="It's an image of a carbon-neutral delivery." class="carbon-neutral-icon">
            <span>This is a <strong>carbon-neutral</strong> delivery</span>
        </div>
        <button class="confirm-order-button">
            Confirm Order
        </button>
        `;
    });
}

function showMessage(text) {
    message.textContent = text;
    message.classList.add("show");

    setTimeout(() => {
        message.classList.remove("show");
    }, 2000);
}

function addToCart(event) {
    
    const button = event.currentTarget;
    const card = button.closest('.card');
    const container = button.closest('.cart-actions');

    if (!card || !container) return;

    const id = Number(card.dataset.id);

    const product = products.find(p => p.id === id);

    if (!product) {
        console.error("Product not found.");
        return;
    }

    const existingProduct = cartItems.find(item => item.id === id);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cartItems.push({
            ...product,
            quantity: 1
        });
    }

    updateCart();

    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('active')
    });

    document.querySelectorAll('.cart-actions').forEach(container => {
        container.classList.remove('active')
    })

    card.classList.add('active');
    container.classList.add('active');
}

function resetProductsUI() {
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('active');
    });

    document.querySelectorAll('.cart-actions').forEach(container => {
        container.classList.remove('active');
    });
}

function increaseQuantity(event) {
    const button = event.currentTarget;
    const card = button.closest('.card');
    const counterContainer = button.closest('.quantity-controls')

    const span = counterContainer.querySelector('.counter-quantity');

    const id = Number(card.dataset.id);

    const product = products.find(p => p.id === id);

    if (!product) {
        console.error("Oops, something went wrong. Please try again.")
        return;
    }

    const existingProduct = cartItems.find(item => item.id === id);

    if (existingProduct.quantity > 1) {
        existingProduct.quantity--;
        span.textContent = existingProduct.quantity

        updateCart();
    } else {
        console.warn("Product not found in the cart.")
        showMessage("Oops, something went wrong. Please try again. ")
    }
}

function incrementQuantity(event) {
    const button = event.currentTarget;
    const card = button.closest('.card')
    const counterContainer = button.closest('.quantity-controls')

    const span = counterContainer.querySelector('.counter-quantity');

    const id = Number(card.dataset.id);

    const product = products.find(p => p.id === id);

    if (!product) {
        console.error("Oops, something went wrong. Please try again.")
        return;
    }

    const existingProduct = cartItems.find(item => item.id === id);

    if (existingProduct) {
        existingProduct.quantity++;
        span.textContent = existingProduct.quantity
        updateCart();
    } else {
        console.warn("Product not found in the cart..")
        showMessage("Oops, something went wrong. Please try again")
    }
}

function handleRemoveItem(event) {
    const button = event.target.closest(".remove-item-button");

    if (!button) {
        console.warn("Failed to remove the item.")
        return;
    }

    const index = Number(button.dataset.index);

    const removeProduct = cartItems[index];

    if (!removeProduct) {
        console.warn("Product not found in the cart.");
        return;
    }

    cartItems.splice(index, 1);

    const card = document.querySelector(`[data-id="${removeProduct.id}"]`)

    if (card) {
        card.classList.remove("active");

        const container = card.querySelector(".cart-actions");
        if (container) {
            container.classList.remove("active");
        }

        const counter = card.querySelector(".counter-quantity");

        if (counter) {
            counter.textContent = 1;
        }
    }
    updateCart();
}

function confirmOrder() {
    const confirmContainer = document.querySelector('.confirmation-modal');
    const confirmedItems = document.querySelector('.confirmed-items');

    if (!confirmContainer || !confirmedItems) return;

    confirmedItems.innerHTML = cartItems.map(item => `
        <div class="confirmed-item">
            <div>
                <img src="${item.image.thumbnail}" alt="Product image" class="confirmed-item-image" width="50">    
            </div> 
            <div>
                <div>
                    <h3 class="confirmed-item-name">${item.name}</h3>
                </div>
                <div class="confirmed-item-details">
                    <div>
                        <p class="confirmed-quantity">${item.quantity}x</p>
                    </div>
                    <div>
                        <p class="confirmed-unit-price">$ ${item.price.toFixed(2)}</p>
                    </div>
                </div>
            </div> 
            <div class="confirmed-item-total">  
                <p>$ ${(item.price * item.quantity).toFixed(2)}</p>
            </div>
        </div>
        <hr>
    `).join('');

    const totalCost = cartItems.reduce((acumulador, item) => {
        return acumulador + item.price * item.quantity;
    }, 0);

    const confirmedTotalPrice = document.querySelector('.confirmed-total-price');

    confirmedTotalPrice.innerHTML = `
        <div>
            <p>Order Total</p>
        </div>
        <div>
            <p class="confirmed-total-value">$ ${totalCost.toFixed(2)}</p>
        </div>
    `

    open();
}

function open() {
    overlay.style.display = 'block';
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function close() {
    overlay.style.display = 'none'
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function startNewOrder() {
    close();

    cartItems = [];

    updateCart();

    resetProductsUI();
}

cartProducts.addEventListener("click", handleRemoveItem);

newOrderButton.addEventListener("click", startNewOrder);

updateCart();