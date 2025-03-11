document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements
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

    // Function to check if any menu is open
    function checkOverlay() {
        if (cartMenu.style.right === "0px" || searchContainer.style.right === "0px" || menuToggle.checked) {
            overlay.classList.add("active");
        } else {
            overlay.classList.remove("active");
        }
    }

    //-----CART-----//

    // Open Cart
    cartBtn.addEventListener("click", function () {
        cartMenu.style.right = "0";
        searchContainer.style.right = "-400px"; // Close search if open
        checkOverlay();
    });

    // Close Cart
    closeCart.addEventListener("click", function () {
        cartMenu.style.right = "-400px";
        checkOverlay();
    });

    //-----SEARCH-----//

    // Open Search
    searchBtn.addEventListener("click", function () {
        searchContainer.style.right = "0";
        cartMenu.style.right = "-400px"; // Close cart if open
        checkOverlay();
    });

    // Close Search
    closeSearchBtn.addEventListener("click", function () {
        searchContainer.style.right = "-400px";
        checkOverlay();
    });

    // Hide search when clicking outside
    document.addEventListener("click", function (event) {
        if (!searchContainer.contains(event.target) && event.target !== searchBtn) {
            searchContainer.style.right = "-400px";
            checkOverlay();
        }
    });

    // Prevent search from closing when clicking inside
    searchContainer.addEventListener("click", function (event) {
        event.stopPropagation();
    });

    // Clear Search Input
    if (clearSearchBtn && searchInput) {
        clearSearchBtn.addEventListener("click", function () {
            searchInput.value = ""; // Clear the input field
            searchInput.focus(); // Keep focus on the input field
            document.querySelector(".search-result").innerHTML = ""; // Clear search results
            console.log("Search input cleared"); // Debugging
        });

        // Show/hide clear button based on input
        searchInput.addEventListener("input", function () {
            if (searchInput.value.trim() !== "") {
                clearSearchBtn.style.display = "block"; // Show clear button
            } else {
                clearSearchBtn.style.display = "none"; // Hide clear button
            }
        });
    } else {
        console.log("Clear search button or search input not found!");
    }

    //-----SEARCH RESULTS-----//

    // Fetch and display search results
    searchInput.addEventListener("input", function () {
        let searchTerm = this.value.trim();
        let searchResultContainer = document.querySelector(".search-result");

        if (searchTerm.length > 0) {
            fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`)
                .then((response) => response.json())
                .then((data) => {
                    searchResultContainer.innerHTML = ""; // Clear previous results
                    if (data.error) {
                        searchResultContainer.innerHTML = "<p>No results found</p>";
                        return;
                    }
                    data.forEach((product) => {
                        let productHTML = `
                            <div class="search-item">
                                <img src="index.html/uploads/${product.img_url}" alt="${product.name}" class="search-item-img" />
                                <div class="search-item-info">
                                    <span class="category">${product.category}</span>
                                    <p class="name">${product.brand} | ${product.size} | ${product.color}</p>
                                    <p class="price">${product.price}$</p>
                                </div>
                               <div class="search-item-btn">
                                <button class="search-add-card-btn" data-product-id="${product.product_id}"><p>Add to Cart</p></button>
                               </div>
                                    
                            </div>
                        `;
                        searchResultContainer.innerHTML += productHTML;
                    });
                })
                .catch((error) => console.error("Error fetching search results:", error));
        } else {
            searchResultContainer.innerHTML = ""; // Clear results if search term is empty
        }
    });

    //-----HAMBURGER MENU-----//

    // Toggle overlay when hamburger menu is opened
    menuToggle.addEventListener("change", function () {
        checkOverlay();
    });

    // Hide overlay if clicked (closes everything)
    overlay.addEventListener("click", function () {
        cartMenu.style.right = "-400px";
        searchContainer.style.right = "-400px";
        menuToggle.checked = false;
        checkOverlay();
    });
});

//-----LISTING-----//

function renderPage() {
    console.log("asd")
    allList();
    getCart();
}



// Fetch and display products on page load
window.onload = () => {
    getCart();
};





// Add to cart function
async function addToCart(productId, quantity = 1) {
    try {
        let cartItems = await fetch("/api/cart", { method: "GET", credentials: "include" })
            .then(res => res.json());

        let existingItem = cartItems.find(item => item.product_id === productId);

        if (existingItem) {
            quantity += existingItem.quantity; // Ha már van benne, növeljük az értéket
        }

        const response = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id: productId, quantity }),
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
        const response = await fetch("/api/cart", {
            method: "GET",
            credentials: "include",
        });

        if (response.ok) {
            const cartItems = await response.json();
            console.log(cartItems)
            renderCart(cartItems);
        } else {
            const errorData = await response.json(); // Parse error response
            console.error("Error fetching cart:", errorData.error);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}
// Render the cart
function renderCart(cartItems) {
    const cartContent = document.querySelector(".cart-content");

    if (cartItems.length === 0) {
        cartContent.innerHTML = `
            <p>Your cart is currently empty.</p>
            <button class="shop-all-btn">Shop All</button>
        `;

        document.querySelector(".shop-all-btn").addEventListener("click", () => {
            window.location.href = "../home.html";
        });

        return;
    }

    let total = 0;
    cartContent.innerHTML = ""; // Előző tartalom törlése

    cartItems.forEach((item) => {
        total += item.price * item.quantity;

        cartContent.innerHTML += `
            <div class="cart-item" data-id="${item.product_id}">
                <div class="cart-item-container">
                    <img class="cart-item-img" src="index.html/uploads/${item.img_url}" alt="${item.product_name}">
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
        <div class="cart-total">
            <span>Total: ${total}$</span>
        </div>
        <button id="checkout-btn">Checkout</button>
    `;

    document.getElementById("checkout-btn").addEventListener("click", () => {
        alert("Proceeding to checkout...");
    });

    // **FONTOS: Az előző eseménykezelőt töröljük, hogy ne fusson duplán!**
    const newCartContent = cartContent.cloneNode(true);
    cartContent.parentNode.replaceChild(newCartContent, cartContent);

    // Új eseménykezelő hozzáadása
    newCartContent.addEventListener("click", async (event) => {
        const button = event.target;
        const cartItem = button.closest(".cart-item");
        if (!cartItem) return;

        const productId = cartItem.getAttribute("data-id");
        let quantityElement = cartItem.querySelector(".quantity");
        let quantity = parseInt(quantityElement.innerText);

        if (button.classList.contains("increase")) {
            quantity++;  // ✅ Most már csak 1-et ad hozzá, nem 2-t
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
        quantityElement.innerText = quantity;  // Frissítjük a számot a felületen
    });
}


async function removeCartItem(productId) {
    try {
        const response = await fetch(`/api/cart/${productId}`, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("user"),
            },
            credentials: "include",
        });

        if (response.ok) {
            await getCart(); // Frissítse a kosarat
        } else {
            console.error("Hiba a termék eltávolításakor");
        }
    } catch (error) {
        console.error("Hálózati hiba:", error);
    }
}


async function updateCartItem(productId, quantity) {
    try {
        const response = await fetch("/api/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("user"),
            },
            body: JSON.stringify({ product_id: productId, quantity }),
            credentials: "include",
        });

        if (response.ok) {
            await getCart(); // Refresh cart
        } else {
            const errorData = await response.json(); // Parse error response
            console.error("Error updating cart item:", errorData.error);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const productId = location.hash.slice(1);
    console.log("Product ID from URL:", productId);

    if (productId) {
        fetchProductDetails(productId);
    } else {
        console.error("Product ID not found in URL.");
        alert("Product ID is missing. Redirecting to the main page.");
        window.location.href = "../index.html";
    }
});

async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`/api/product/${productId}`, { 
            method: 'GET',
            credentials: 'include' });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Backend error:", errorData);
            alert("Failed to fetch product details. Please try again later.");
            return;
        }

        const product = await response.json();
        console.log("Fetched Product Data:", product);
        const images = document.getElementById('images');

        document.getElementById('product-image').src = product.img_url ? product.img_url : "default.jpg";
        document.getElementById('product-image').alt = product.product_name || "Product Image";
        document.getElementById('product-name').textContent = product.product_name || "N/A";
        document.getElementById('product-price').textContent = product.price ? `${product.price}$` : "N/A";
        
        updateSize(product.size, product.is_in_stock);
        updateColors(product.color);
    } catch (error) {
        console.error('Error fetching product details:', error);
        alert("An error occurred. Please try again later.");
    }
}

function updateSize(size, isInStock) {
    const sizeContainer = document.getElementById('product-size');
    sizeContainer.innerHTML = size.split(',').map(size => {
        const isDisabled = !isInStock.includes(size.trim());
        return `<button ${isDisabled ? 'disabled' : ''}>${size.trim()}</button>`;
    }).join('');
}

function updateColors(colors) {
    const colorsSelect = document.getElementById('product-colors');
    colorsSelect.innerHTML = colors.split(',').map(color => `<option>${color.trim()}</option>`).join('');
}

document.getElementById('product-colors').addEventListener('change', function () {
    updateProductVariant(this.value, null);
});

document.getElementById('product-size').addEventListener('click', function (event) {
    if (event.target.tagName === 'BUTTON' && !event.target.disabled) {
        updateProductVariant(null, event.target.textContent);
    }
});

async function updateProductVariant(color = null, size = null) {
    const productId = location.hash.slice(1);
    try {
        const response = await fetch(`/api/product_variant/${productId}?color=${color || ''}&size=${size || ''}`);
        if (!response.ok) throw new Error("Failed to fetch variant data");

        const product = await response.json();
        document.getElementById('product-image').src = product.img_url || "default.jpg";
        document.getElementById('product-name').textContent = product.product_name || "N/A";
        document.getElementById('product-price').textContent = product.price ? `${product.price}$` : "N/A";
        updateSize(product.size, product.is_in_stock);
    } catch (error) {
        console.error("Error updating product variant:", error);
    }
}