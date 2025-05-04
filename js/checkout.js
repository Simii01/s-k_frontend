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
    const checkoutForm = document.getElementById("checkoutForm");
    let cartItems = [];

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

        fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`, {
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
                    const imageUrl = product.img_url ? `/uploads/${product.img_url}` : "/uploads/default.jpg";

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

    (async function () {
        const cartItemsContainer = document.getElementById("checkout-cart-items");

        try {
            const res = await fetch("/api/cart", {
                method: "GET",
                credentials: "include",
            });
            cartItems = await res.json();

            if (cartItems.length === 0) {
                cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
            } else {
                let totalPrice = 0;

                cartItemsContainer.innerHTML = cartItems
                    .map((item) => {
                        const itemTotal = item.price * item.quantity;
                        totalPrice += itemTotal;

                        return `
            <div class="checkout-cart-item">
              <img src="/uploads/${item.img_url}" alt="${item.product_name}" class="checkout-item-img" />
              <div>
                <p><strong>${item.product_name}</strong> | ${item.size ? item.size : ""}</p>
                <p>${item.quantity} x ${item.price}$ = ${itemTotal}$</p>
              </div>
            </div>
          `;
                    })
                    .join("");

                cartItemsContainer.innerHTML += `
          <div class="checkout-total">
            <h2>Total: ${totalPrice}$</h2>
          </div>
        `;
            }
        } catch (err) {
            console.error("Hiba a kosár lekérésénél:", err);
        }
    })();

    checkoutForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        if (cartItems.length === 0) {
            alert("A kosár üres!");
            return;
        }

        const formData = new FormData(checkoutForm);
        const data = Object.fromEntries(formData.entries());
        data.cartItems = cartItems.map((item) => ({
            productId: item.product_id,
            quantity: item.quantity,
            unitPrice: item.price,
        }));

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (response.ok) {
                alert("Sikeres rendelés: " + result.message);
                window.location.href = "Home.html";
            } else {
                alert("Hiba: " + result.error || "Rendelés nem sikerült");
            }
        } catch (err) {
            console.error("Rendelés hiba:", err);
            alert("Hiba a rendelés során");
        }
    });
});
