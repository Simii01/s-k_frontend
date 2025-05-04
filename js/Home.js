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

    function checkOverlay() {
        if (cartMenu.classList.contains("open") || searchContainer.classList.contains("open") || menuToggle.checked) {
            overlay.classList.add("active");
        } else {
            overlay.classList.remove("active");
        }
    }

    cartBtn.addEventListener("click", function () {
        cartMenu.classList.add("open");
        searchContainer.classList.remove("open");
        checkOverlay();
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

function renderPage() {
    allList();
    getCart();
}

let query = "";

function setQuery(value, e) {
    e.preventDefault();
    query = value;
    allList();
}

window.onload = () => {
    allList();
    getCart();
};

document.querySelectorAll('[id$="-link"]').forEach((link) => {
    link.addEventListener("click", function (e) {
        setQuery(this.textContent, e);
    });
});

async function allList() {
    try {
        const res = await fetch(`http://127.0.0.1:3000/api/listing?${query !== "" ? `type=${query}` : ""}`, {
            method: "GET",
            credentials: "include",
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error("Backend error:", errorData);
            return;
        }

        const data = await res.json();

        document.getElementById("produts-cards").innerHTML = "";

        if (Array.isArray(data)) {
            data.forEach((item) => {
                const imageUrl = item.img_url ? `http://127.0.0.1:3000/uploads/${item.img_url}` : "/uploads/default.jpg";

                document.getElementById("produts-cards").innerHTML += `
                <div class="product-card" onclick="location.href = '../products.html#${item.product_id}'">
                <img src="${imageUrl}" 
                     alt="${item.brand}" 
                     class="product-image">
                <h3 class="product-name">${item.brand}</h3> 
                <h3>${item.category} | ${item.color} | ${item.size} </h3>
                <p class="product-price">${item.price}$</p>
                <button class="add-cart-btn" onclick="addToCart(event, ${item.product_id})" data-product-id="${item.product_id}">
                    <p>Add to Cart</p>
                </button>
            </div>
                `;
            });
        } else {
            console.error("Expected an array but got:", data);
        }
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

async function addToCart(event, productId, quantity = 1) {
    event.stopPropagation();
    event.preventDefault();

    try {
        let cartItems = await fetch("http://127.0.0.1:3000/api/cart", {
            method: "GET",
            credentials: "include",
        }).then((res) => res.json());

        let existingItem = cartItems.find((item) => item.product_id === productId);

        if (existingItem) {
            quantity += existingItem.quantity;
        }

        const response = await fetch("http://127.0.0.1:3000/api/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                product_id: productId,
                quantity,
            }),
            credentials: "include",
        });

        if (response.ok) {
            console.log("Kosár frissítve:", await response.json());
            await getCart();
        } else {
            console.error("Hiba:", await response.json());
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
            console.log(cartItems);
            renderCart(cartItems);
        } else {
            const errorData = await response.json();
            console.error("Error fetching cart:", errorData.error);
        }
    } catch (error) {
        console.error("Network error:", error);
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
                        <h4 class="cart-item-name">${item.product_name} | ${item.size ? item.size : "N/A"}</h4>
                        <p class="cart-item-price">${item.price}$</p>
                    </div>
                    <div class="quantity-controls">
                        <button class="decrease">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="increase">+</button>
                    </div>
                </div>
                <hr class="cart-hr">
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
            body: JSON.stringify({
                product_id: productId,
                quantity,
            }),
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

document.querySelector(".newsletter-form button").addEventListener("click", function (e) {
    e.preventDefault();

    const email = document.querySelector('.newsletter-form input[type="email"]').value.trim();

    if (!email) {
        alert("Please enter your email.");
        return;
    }

    fetch("http://localhost:3000/api/newsletter", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            if (data.message) {
                alert("Thank you for subscribing!");
            } else {
                alert("Error: " + data.error);
            }
        })
        .catch((error) => {
            console.error("Fetch error:", error);
        });
});

