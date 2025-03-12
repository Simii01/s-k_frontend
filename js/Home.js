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
                                <img src="/${product.img_url}" alt="${product.name}" class="search-item-img" />
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


let query = "";

// Update query and refresh data
function setQuery(value, e) {
    e.preventDefault();
    query = value;
    allList();
}

// Fetch and display products on page load
window.onload = () => {
    allList();
    getCart();
};

// Add event listeners to category links
document.querySelectorAll('[id$="-link"]').forEach((link) => {
    link.addEventListener("click", function (e) {
        setQuery(this.textContent, e);
    });
});

// Fetch and display products based on query
async function allList() {
    try {
        const res = await fetch(`/api/listing?${query !== "" ? `type=${query}` : ""}`, {
            method: "GET",
            credentials: "include",
        });

        if (!res.ok) {
            // Handle HTTP errors (e.g., 500 Internal Server Error)
            const errorData = await res.json();
            console.error("Backend error:", errorData);
            return;
        }

        const data = await res.json();

        document.getElementById("produts-cards").innerHTML = ""; // Clear previous products

        if (Array.isArray(data)) {
            data.forEach((item) => {
                const imageUrl = item.img_url ? `/uploads/${item.img_url}` : '/uploads/default.png';

                document.getElementById("produts-cards").innerHTML += `
                <div class="product-card" onclick="location.href = '../products.html#${item.product_id}'">
                <img src="${imageUrl}" 
                     alt="${item.brand}" 
                     class="product-image">
                <h3 class="product-name">${item.brand}</h3> 
                <h3>${item.category} | ${item.color} | ${item.size} </h3>
                <p class="product-price">${item.price}$</p>
                <button class="add-card-btn" onclick="addToCart(event, ${item.product_id})" data-product-id="${item.product_id}">
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

// Add to cart function
async function addToCart(event, productId, quantity = 1) {
    event.stopPropagation(); // Prevent the event from bubbling up to the parent element
    event.preventDefault(); // Prevent any default behavior (e.g., form submission)

    try {
        // Fetch the current cart items
        let cartItems = await fetch("/api/cart", { 
            method: "GET", 
            credentials: "include" 
        }).then(res => res.json());

        // Check if the product already exists in the cart
        let existingItem = cartItems.find(item => item.product_id === productId);

        // If the product exists, increase the quantity
        if (existingItem) {
            quantity += existingItem.quantity;
        }

        // Add or update the product in the cart
        const response = await fetch("/api/cart", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ product_id: productId, quantity }),
            credentials: "include",
        });

        if (response.ok) {
            console.log("Kosár frissítve:", await response.json());
            await getCart(); // Refresh the cart UI
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
            window.location.href = "shop";
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
