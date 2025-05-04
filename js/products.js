document.addEventListener("DOMContentLoaded", function () {

    const cartBtn = document.getElementById("cart-btn");
    const cartMenu = document.getElementById("cart-menu");
    const closeCart = document.getElementById("close-cart");
    const overlay = document.getElementById("overlay");
    const menuToggle = document.getElementById("menu-toggle");
    const searchBtn = document.getElementById("search-btn");
    const searchContainer = document.getElementById("searchContainer");
    const closeSearchBtn = document.querySelector(".search-header img");
    const clearSearchBtn = document.getElementById("clear-search");
    const searchInput = document.getElementById("search");

    const cartContent = document.querySelector(".cart-content");
    if (cartContent) {
        cartContent.innerHTML = `
            <p>Loading cart...</p>
        `;

        getCart();
    } else {
        console.error("Cart content element not found!");
    }

    function checkOverlay() {
        if (cartMenu.classList.contains("open") || searchContainer.classList.contains("open") || menuToggle.checked) {
            overlay.classList.add("active");
        } else {
            overlay.classList.remove("active");
        }
    }

    cartBtn.addEventListener("click", async function () {
        cartMenu.classList.add("open");
        searchContainer.classList.remove("open");
        checkOverlay();

        await getCart();
    });

    closeCart.addEventListener("click", function () {
        cartMenu.classList.remove("open");
        checkOverlay();
    });

    searchBtn.addEventListener("click", function () {
        searchContainer.classList.add("open");
        cartMenu.classList.remove("open");
        checkOverlay();
    });

    closeSearchBtn.addEventListener("click", function () {
        searchContainer.classList.remove("open");
        checkOverlay();
    });

    document.addEventListener("click", function (event) {
        if (!searchContainer.contains(event.target) && event.target !== searchBtn) {
            searchContainer.classList.remove("open");
            checkOverlay();
        }
    });

    searchContainer.addEventListener("click", function (event) {
        event.stopPropagation();
    });

    if (clearSearchBtn && searchInput) {
        clearSearchBtn.addEventListener("click", function () {
            searchInput.value = "";
            searchInput.focus();
            document.querySelector(".search-result").innerHTML = "";
            console.log("Search input cleared");
        });

        searchInput.addEventListener("input", function () {
            if (searchInput.value.trim() !== "") {
                clearSearchBtn.style.display = "block";
            } else {
                clearSearchBtn.style.display = "none";
            }
        });
    } else {
        console.log("Clear search button or search input not found!");
    }

    searchInput.addEventListener("input", function () {
        const searchTerm = this.value.trim();
        const searchResultContainer = document.querySelector(".search-result");

        if (searchTerm === "") {
            searchResultContainer.innerHTML = "";
            return;
        }

        fetch(`http://127.0.0.1:3000/api/search?q=${encodeURIComponent(searchTerm)}`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                searchResultContainer.innerHTML = "";
                if (data.error) {
                    searchResultContainer.innerHTML = "<p>No results found</p>";
                    return;
                }

                data.forEach((product) => {
                    const imageUrl = product.img_url ? `http://127.0.0.1:3000/uploads/${product.img_url}` : "http://127.0.0.1:3000/uploads/default.jpg";

                    const productHTML = `
                <div class="search-item" onclick="window.location.href='products.html#${product.product_id}'">
                    <img src="${imageUrl}"
                         alt="${product.product_name}"
                         class="search-item-img" />
                    <div class="search-item-info">
                        <span class="category">${product.category}</span>
                        <p class="name">${product.brand} | ${product.size} | ${product.color}</p>
                        <p class="price">${product.price}$</p>
                    </div>
                    <div class="search-item-btn">
                        <button class="search-add-cart-btn"
                                data-product-id="${product.product_id}"
                                onclick="addToCart(event, ${product.product_id})">
                            <p>Add to Cart</p>
                        </button>
                    </div>
                </div>
            `;
                    searchResultContainer.innerHTML += productHTML;
                });
            })
            .catch((err) => console.error("Error fetching search results:", err));
    });

    menuToggle.addEventListener("change", function () {
        checkOverlay();
    });

    overlay.addEventListener("click", function () {
        cartMenu.classList.remove("open");
        searchContainer.classList.remove("open");
        menuToggle.checked = false;
        checkOverlay();
    });
});

document.addEventListener("DOMContentLoaded", () => {
    getCart();
    const productId = location.hash.slice(1) || new URLSearchParams(window.location.search).get("id");

    if (productId) {
        fetchProductDetails(productId);
    } else {
        alert("Product ID is missing. Redirecting to the main page.");
        window.location.href = "../index.html";
    }
});

// Add to cart function
async function addToCart(event, productId) {
    event.preventDefault();
    event.stopPropagation();

    try {
        const cartItems = await fetch("http://127.0.0.1:3000/api/cart", {
            method: "GET",
            credentials: "include",
        }).then((res) => res.json());

        let newQuantity = 1;

        const existingItem = cartItems.find((item) => item.product_id === productId);

        if (existingItem) {
            newQuantity = existingItem.quantity + 1;
        }

        const response = await fetch("http://127.0.0.1:3000/api/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                product_id: productId,
                quantity: newQuantity,
            }),
        });

        if (response.ok) {
            console.log("Kosár frissítve!");
            alert("Kosárba helyezve!");
            await getCart();
        } else {
            console.error("Hiba a kosár frissítésekor.");
        }
    } catch (error) {
        console.error("Hálózati hiba:", error);
    }
}

async function getCart() {
    try {
        const response = await fetch("http://127.0.0.1:3000/api/cart", {
            method: "GET",
            credentials: "include",
        });

        if (response.ok) {
            const cartItems = await response.json();
            console.log("Cart items loaded:", cartItems);
            renderCart(cartItems);
        } else {
            const errorData = await response.json();
            console.error("Error fetching cart:", errorData.error);

            const cartContent = document.querySelector(".cart-content");
            cartContent.innerHTML = `
                <p>Error loading cart. Please try again later.</p>
                <button class="shop-all-btn">Shop All</button>
            `;
        }
    } catch (error) {
        console.error("Network error:", error);

        const cartContent = document.querySelector(".cart-content");
        cartContent.innerHTML = `
            <p>Network error. Please check your connection and try again.</p>
            <button class="shop-all-btn">Shop All</button>
        `;
    }
}

function renderCart(cartItems) {
    const cartContent = document.querySelector(".cart-content");

    if (cartItems.length === 0) {
        cartContent.innerHTML = `
            <p>Your cart is currently empty.</p>
            <button class="shop-all-btn">Shop All</button>
        `;

        document.querySelector(".shop-all-btn").addEventListener("click", () => {
            window.location.href = "Home.html";
        });

        return;
    }

    let total = 0;
    cartContent.innerHTML = "";

    cartItems.forEach((item) => {
        total += item.price * item.quantity;

        cartContent.innerHTML += `
            <div class="cart-item" data-id="${item.product_id}">  
                <div class="cart-item-container">
                    <img class="cart-item-img" src="http://127.0.0.1:3000/uploads/${item.img_url}" alt="${item.product_name}">
                    <div class="cart-item-info">
                        <p class="cart-item-category">Shirt</p>
                        <h4 class="cart-item-name">${item.product_name} | ${item.size ? item.size : ""}</h4>
                        <p class="cart-item-price">${item.price}$</p>
                    </div>
                    <div class="quantity-controls">
                        <button class="decrease">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="increase">+</button>
                    </div>
                </div>
                
            </div>
        `;
    });

    cartContent.innerHTML += `
        <div class="cart-footer">   
            <div class="cart-total">
                <span>Total: ${total}$</span>
            </div>
            <button id="checkout-btn">Checkout</button>
        </div>
    `;

    cartContent.addEventListener("click", async (event) => {
        const button = event.target;
        const cartItem = button.closest(".cart-item");

        if (button.classList.contains("increase") || button.classList.contains("decrease")) {
            if (!cartItem) return;

            const productId = cartItem.getAttribute("data-id");
            let quantityElement = cartItem.querySelector(".quantity");
            let quantity = parseInt(quantityElement.innerText);

            if (button.classList.contains("increase")) {
                quantity++;
            } else if (button.classList.contains("decrease")) {
                if (quantity > 1) {
                    quantity--;
                } else {
                    await removeCartItem(productId);
                    cartItem.remove();
                    return;
                }
            }

            await updateCartItem(productId, quantity);
            quantityElement.innerText = quantity;
        }

        if (button.id === "checkout-btn") {
            window.location.href = "Checkout.html";
        }
    });
}

async function removeCartItem(productId) {
    try {
        const response = await fetch(`http://127.0.0.1:3000/api/cart/${productId}`, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("user"),
            },
            credentials: "include",
        });

        if (response.ok) {
            await getCart();
        } else {
            console.error("Hiba a termék eltávolításakor");
        }
    } catch (error) {
        console.error("Hálózati hiba:", error);
    }
}

async function updateCartItem(productId, quantity) {
    try {
        const response = await fetch("http://127.0.0.1:3000/api/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("user"),
            },
            body: JSON.stringify({ product_id: productId, quantity }),
            credentials: "include",
        });

        if (response.ok) {
            await getCart();
        } else {
            const errorData = await response.json();
            console.error("Error updating cart item:", errorData.error);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}

const BASE_URL = "http://127.0.0.1:3000";
const API_URL = `${BASE_URL}/api`;

document.addEventListener("DOMContentLoaded", () => {
    const productId = location.hash.slice(1) || new URLSearchParams(window.location.search).get("id");
    if (productId) {
        fetchProductDetails(productId);
    } else {
        alert("Product ID is missing. Redirecting to the main page.");
        window.location.href = "../index.html";
    }
});

async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`${API_URL}/product/${productId}`, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            alert("Failed to fetch product details. Please try again later.");
            return;
        }

        const data = await response.json();
        const details = document.getElementById("details");
        const carousel = document.querySelector("#carousel-image");

        details.innerHTML = `
        <h1 id="product-name">${data.product_name}</h1>
        <p class="price" id="product-price">${data.price} $</p>
        <p class="tax">Tax included</p>
  
        <div class="sizes">
          <label>Size:</label>
          <div id="size-buttons"></div>
        </div>
  
        <div>
          <label>Color:</label>
          <select class="color" id="color-select"></select>
        </div>
  
        <button class="add-cart-btn">ADD TO CART</button>
      `;

        const images = [data.img1, data.img2, data.img3].filter(Boolean);
        carousel.src = `${BASE_URL}/uploads/${images[0] || "default.jpg"}`;
        startCarousel(images);

        document.querySelector(".add-cart-btn").addEventListener("click", async () => {
            try {
                const cartItems = await fetch(`${API_URL}/cart`, {
                    method: "GET",
                    credentials: "include",
                }).then((res) => res.json());

                let quantity = 1;
                const existingItem = cartItems.find((item) => item.product_id === data.product_id);

                if (existingItem) {
                    quantity = existingItem.quantity + 1;
                }

                const response = await fetch(`${API_URL}/cart`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        product_id: data.product_id,
                        quantity: quantity,
                    }),
                });

                if (response.ok) {
                    alert("Kosárba helyezve! 🎉");
                    getCart();
                } else {
                    console.error("Hiba a kosárhoz adáskor");
                }
            } catch (err) {
                console.error("Hiba a kosárhoz adáskor:", err);
            }
        });

        const variantRes = await fetch(`${API_URL}/variants/${data.product_id}`, {
            credentials: "include",
        });
        const variants = await variantRes.json();

        const sizeContainer = document.getElementById("size-buttons");
        const colorSelect = document.getElementById("color-select");

        const uniqueSizes = [...new Set(variants.map((v) => v.size))];
        const uniqueColors = [...new Set(variants.map((v) => v.color))];

        sizeContainer.innerHTML = "";
        uniqueSizes.forEach((size) => {
            const btn = document.createElement("button");
            btn.textContent = size;

            const matchingVariant = variants.find((v) => v.size === size && v.color === data.color);

            if (matchingVariant) {
                btn.addEventListener("click", () => {
                    location.href = `products.html?id=${matchingVariant.product_id}`;
                });
            } else {
                btn.disabled = true;
                btn.style.backgroundColor = "#ccc";
                btn.style.cursor = "not-allowed";
            }

            sizeContainer.appendChild(btn);
        });

        colorSelect.innerHTML = "";
        uniqueColors.forEach((color) => {
            const opt = document.createElement("option");
            opt.textContent = color;

            const matchingVariant = variants.find((v) => v.color === color && v.size === data.size);

            if (matchingVariant) {
                opt.value = matchingVariant.product_id;
                if (color === data.color) {
                    opt.selected = true;
                }
            } else {
                opt.disabled = true;
            }

            colorSelect.appendChild(opt);
        });

        colorSelect.addEventListener("change", (e) => {
            const id = e.target.value;
            if (id) {
                location.href = `products.html?id=${id}`;
            }
        });
    } catch (error) {
        console.error("Hiba a termék betöltésekor:", error);
        alert("Hiba történt a termék betöltésekor.");
    }
}

function startCarousel(images) {
    let index = 0;
    const carouselImage = document.getElementById("carousel-image");

    setInterval(() => {
        index = (index + 1) % images.length;
        carouselImage.style.opacity = 0;
        setTimeout(() => {
            carouselImage.src = `${BASE_URL}/uploads/${images[index]}`;
            carouselImage.style.opacity = 1;
        }, 500);
    }, 5000);
}
