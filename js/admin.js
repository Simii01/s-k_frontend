document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.is_admin) {
        window.location.href = "Home.html";
        return;
    }

    document.getElementById("admin-username").textContent = user.username;

    const sidebarToggle = document.getElementById("sidebar-toggle");
    const sidebar = document.querySelector(".admin-sidebar");
    sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("active");
    });

    const menuItems = document.querySelectorAll(".sidebar-menu li");
    menuItems.forEach((item) => {
        item.addEventListener("click", () => {
            const section = item.dataset.section;
            menuItems.forEach((i) => i.classList.remove("active"));
            item.classList.add("active");

            document.querySelectorAll(".admin-section").forEach((s) => s.classList.remove("active"));
            document.getElementById(section).classList.add("active");
        });
    });

    document.getElementById("logout-btn").addEventListener("click", () => {
        localStorage.removeItem("user");
        window.location.href = "index.html";
    });

    loadDashboardStats();
    loadProducts();
    loadUsers();
    loadOrders();

    const productModal = document.getElementById("product-modal");
    const addProductBtn = document.getElementById("add-product-btn");
    const productForm = document.getElementById("product-form");
    const closeModalBtns = document.querySelectorAll(".close-modal");

    document.getElementById("product-images").addEventListener("change", () => {
        console.log("Image input changed. Current productId:", document.getElementById("product-id").value);
    });

    addProductBtn.addEventListener("click", () => {
        productForm.reset();
        document.getElementById("product-id").value = "";
        document.getElementById("product-modal-title").textContent = "Új termék";
        productModal.style.display = "block";
    });

    window.editProduct = async (id) => {
        try {
            const response = await fetch(`http://127.0.0.1:3000/api/admin/products/${id}`, { credentials: "include" });
            const product = await response.json();

            document.getElementById("product-id").value = product.product_id;
            document.getElementById("product-name").value = product.product_name;
            document.getElementById("product-category").value = product.category;
            document.getElementById("product-brand").value = product.brand;
            document.getElementById("product-size").value = product.size;
            document.getElementById("product-color").value = product.color;
            document.getElementById("product-price").value = product.price;
            document.getElementById("product-stock").checked = product.is_in_stock;
            document.getElementById("product-modal-title").textContent = "Termék szerkesztése";
            productModal.style.display = "block";
        } catch (error) {
            console.error("Error loading product:", error);
        }
    };

    productForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData();
        const productId = document.getElementById("product-id").value;
        console.log("Submitting product form. productId:", productId);

        formData.append("product_name", document.getElementById("product-name").value);
        formData.append("category", document.getElementById("product-category").value);
        formData.append("brand", document.getElementById("product-brand").value);
        formData.append("size", document.getElementById("product-size").value);
        formData.append("color", document.getElementById("product-color").value);
        formData.append("price", document.getElementById("product-price").value);
        formData.append("is_in_stock", document.getElementById("product-stock").checked ? 1 : 0);

        const images = document.getElementById("product-images").files;
        for (let i = 0; i < images.length; i++) {
            formData.append("images", images[i]);
        }

        try {
            const url = productId ? `http://127.0.0.1:3000/api/admin/products/${productId}` : "http://127.0.0.1:3000/api/admin/products";

            const response = await fetch(url, {
                method: productId ? "PUT" : "POST",
                body: formData,
                credentials: "include",
            });

            if (response.ok) {
                productModal.style.display = "none";
                loadProducts();
                alert("Termék sikeresen mentve!");
            } else {
                const data = await response.json();
                alert(data.error || "Hiba történt a mentés során!");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Hiba történt a mentés során!");
        }
    });

    const userModal = document.getElementById("user-modal");
    const addUserBtn = document.getElementById("add-user-btn");
    const userForm = document.getElementById("user-form");

    addUserBtn.addEventListener("click", () => {
        userForm.reset();
        document.getElementById("user-id").value = "";
        document.getElementById("user-modal-title").textContent = "Új felhasználó";
        userModal.style.display = "block";
    });

    userForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const userId = document.getElementById("user-id").value;
        const userData = {
            username: document.getElementById("user-username").value,
            email: document.getElementById("user-email").value,
            password: document.getElementById("user-password").value,
            is_admin: document.getElementById("user-is-admin").checked ? 1 : 0,
        };

        try {
            const url = userId ? `http://127.0.0.1:3000/api/admin/users/${userId}` : "http://127.0.0.1:3000/api/admin/users";

            const response = await fetch(url, {
                method: userId ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
                credentials: "include",
            });

            if (response.ok) {
                userModal.style.display = "none";
                loadUsers();
                alert("Felhasználó sikeresen mentve!");
            } else {
                const data = await response.json();
                alert(data.error || "Hiba történt a mentés során!");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Hiba történt a mentés során!");
        }
    });

    closeModalBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".modal").forEach((modal) => {
                modal.style.display = "none";
            });
        });
    });

    async function loadDashboardStats() {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Nincs hitelesítési token");
            }

            const [productsRes, usersRes, ordersRes] = await Promise.all([
                fetch("http://127.0.0.1:3000/api/admin/products", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: "include",
                }),
                fetch("http://127.0.0.1:3000/api/admin/users", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: "include",
                }),
                fetch("http://127.0.0.1:3000/api/admin/orders", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: "include",
                }),
            ]);

            if (!productsRes.ok || !usersRes.ok || !ordersRes.ok) {
                const errorData = await productsRes.json();
                throw new Error(errorData.error || "Hiba a statisztikák betöltésekor");
            }

            const products = await productsRes.json();
            const users = await usersRes.json();
            const orders = await ordersRes.json();

            const productsArray = Array.isArray(products) ? products : [];
            const usersArray = Array.isArray(users) ? users : [];
            const ordersArray = Array.isArray(orders) ? orders : [];

            document.getElementById("total-products").textContent = productsArray.length;
            document.getElementById("total-users").textContent = usersArray.length;
            document.getElementById("total-orders").textContent = ordersArray.length;
        } catch (error) {
            console.error("Error loading stats:", error);
            document.getElementById("total-products").textContent = "0";
            document.getElementById("total-users").textContent = "0";
            document.getElementById("total-orders").textContent = "0";
            alert("Error loading dashboard stats: " + error.message);
        }
    }

    async function loadProducts() {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Nincs hitelesítési token");
            }

            const response = await fetch("http://127.0.0.1:3000/api/admin/products", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Hiba a termékek betöltésekor");
            }

            const data = await response.json();
            const products = Array.isArray(data) ? data : [];

            const tbody = document.getElementById("products-table-body");
            tbody.innerHTML = products
                .map(
                    (product) => `
                <tr>
                    <td>${product.product_id}</td>
                    <td>${product.product_name}</td>
                    <td>${product.category}</td>
                    <td>${product.brand}</td>
                    <td>${product.price}</td>
                    <td>${product.is_in_stock ? "Igen" : "Nem"}</td>
                    <td>
                        <button onclick="editProduct(${product.product_id})" class="btn-primary">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteProduct(${product.product_id})" class="btn-danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `
                )
                .join("");
        } catch (error) {
            console.error("Error loading products:", error);
            const tbody = document.getElementById("products-table-body");
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Hiba történt az adatok betöltése során</td></tr>';
            alert("Error loading products: " + error.message);
        }
    }

    async function loadUsers() {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Nincs hitelesítési token");
            }

            const response = await fetch("http://127.0.0.1:3000/api/admin/users", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Hiba a felhasználók betöltésekor");
            }

            const data = await response.json();
            const users = Array.isArray(data) ? data : [];

            const tbody = document.getElementById("users-table-body");
            tbody.innerHTML = users
                .map(
                    (user) => `
                <tr>
                    <td>${user.user_id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.is_admin ? "Igen" : "Nem"}</td>
                    <td>
                        <button onclick="editUser(${user.user_id})" class="btn-primary">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteUser(${user.user_id})" class="btn-danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `
                )
                .join("");
        } catch (error) {
            console.error("Error loading users:", error);
            const tbody = document.getElementById("users-table-body");
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Hiba történt az adatok betöltése során</td></tr>';
            alert("Error loading users: " + error.message);
        }
    }

    async function loadOrders() {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Nincs hitelesítési token");
            }

            const response = await fetch("http://127.0.0.1:3000/api/admin/orders", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Hiba a rendelések betöltésekor");
            }

            const data = await response.json();
            const orders = Array.isArray(data) ? data : [];

            const tbody = document.getElementById("orders-table-body");
            tbody.innerHTML = orders
                .map(
                    (order) => `
                <tr>
                    <td>${order.order_id}</td>
                    <td>${order.username}</td>
                    <td>${new Date(order.order_date).toLocaleDateString()}</td>
                    <td>-</td>
                    <td>${order.total_amount ? order.total_amount + "$" : "-"}</td>
                    <td>
                        <button onclick="viewOrder(${order.order_id})" class="btn-primary">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="deleteOrder(${order.order_id})" class="btn-danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `
                )
                .join("");
        } catch (error) {
            console.error("Error loading orders:", error);
            const tbody = document.getElementById("orders-table-body");
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Hiba történt az adatok betöltése során</td></tr>';
            alert("Error loading orders: " + error.message);
        }
    }

    window.deleteProduct = async (id) => {
        if (confirm("Biztosan törölni szeretnéd ezt a terméket?")) {
            try {
                const response = await fetch(`http://127.0.0.1:3000/api/admin/products/${id}`, {
                    method: "DELETE",
                    credentials: "include",
                });

                if (response.ok) {
                    loadProducts();
                    alert("Termék sikeresen törölve!");
                } else {
                    const data = await response.json();
                    alert(data.error || "Hiba történt a törlés során!");
                }
            } catch (error) {
                console.error("Error deleting product:", error);
            }
        }
    };

    window.editUser = async (userId) => {
        try {
            const response = await fetch(`http://127.0.0.1:3000/api/admin/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                credentials: "include",
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Felhasználó nem található");
                }
                const error = await response.json();
                throw new Error(error.error || "Hiba a felhasználó betöltésekor");
            }

            const user = await response.json();

            document.getElementById("user-id").value = user.user_id;
            document.getElementById("user-username").value = user.username;
            document.getElementById("user-email").value = user.email;
            document.getElementById("user-is-admin").checked = user.is_admin;

            document.getElementById("user-modal").style.display = "block";
            document.getElementById("user-modal-title").textContent = "Felhasználó szerkesztése";
        } catch (error) {
            console.error("Hiba a felhasználó betöltésekor:", error);
            alert(error.message);
        }
    };

    window.updateUser = async () => {
        try {
            const userId = document.getElementById("user-id").value;
            const username = document.getElementById("user-username").value;
            const email = document.getElementById("user-email").value;
            const password = document.getElementById("user-password").value;
            const isAdmin = document.getElementById("user-is-admin").checked;

            const userData = {
                username,
                email,
                is_admin: isAdmin,
            };

            if (password) {
                userData.password = password;
            }

            const response = await fetch(`http://127.0.0.1:3000/api/admin/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                credentials: "include",
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Hiba a felhasználó frissítésekor");
            }

            const result = await response.json();
            alert(result.message);
            document.getElementById("user-modal").style.display = "none";
            loadUsers();
        } catch (error) {
            console.error("Hiba a felhasználó frissítésekor:", error);
            alert(error.message);
        }
    };

    window.deleteUser = async (id) => {
        if (confirm("Biztosan törölni szeretnéd ezt a felhasználót?")) {
            try {
                const response = await fetch(`http://127.0.0.1:3000/api/admin/users/${id}`, {
                    method: "DELETE",
                    credentials: "include",
                });

                if (response.ok) {
                    loadUsers();
                    alert("Felhasználó sikeresen törölve!");
                } else {
                    const data = await response.json();
                    alert(data.error || "Hiba történt a törlés során!");
                }
            } catch (error) {
                console.error("Hiba a felhasználó törlésekor:", error);
            }
        }
    };

    window.viewOrder = async (orderId) => {
        try {
            const response = await fetch(`http://127.0.0.1:3000/api/admin/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                credentials: "include",
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Rendelés nem található");
                }
                const error = await response.json();
                throw new Error(error.error || "Hiba a rendelés betöltésekor");
            }

            const order = await response.json();

            const orderDate = new Date(order.order_date).toLocaleString("hu-HU", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            });

            let orderDetailsHTML = `
                <div class="order-info">
                    <p><strong>Rendelés ID:</strong> ${order.order_id}</p>
                    <p><strong>Felhasználó:</strong> ${order.username}</p>
                    <p><strong>Dátum:</strong> ${orderDate}</p>
                    <p><strong>Státusz:</strong> ${order.status}</p>
                    <p><strong>Összeg:</strong> ${order.total_amount}$</p>
                </div>
                <div class="order-items">
                    <h3>Termékek</h3>
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Termék</th>
                                <th>Mennyiség</th>
                                <th>Egységár</th>
                                <th>Összesen</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            if (order.items && Array.isArray(order.items)) {
                orderDetailsHTML += order.items
                    .map(
                        (item) => `
                    <tr>
                        <td>${item.product_name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.unit_price}$</td>
                        <td>${(item.quantity * item.unit_price).toFixed(2)}$</td>
                    </tr>
                `
                    )
                    .join("");
            } else {
                orderDetailsHTML += '<tr><td colspan="4">Nincsenek termékek a rendelésben</td></tr>';
            }

            orderDetailsHTML += `
                        </tbody>
                    </table>
                </div>
            `;

            document.getElementById("order-details").innerHTML = orderDetailsHTML;
            document.getElementById("order-modal").style.display = "block";
        } catch (error) {
            console.error("Error loading order:", error);
            alert(error.message);
        }
    };

    window.deleteOrder = async (id) => {
        if (confirm("Biztosan törölni szeretnéd ezt a rendelést?")) {
            try {
                const response = await fetch(`http://127.0.0.1:3000/api/admin/orders/${id}`, {
                    method: "DELETE",
                    credentials: "include",
                });

                if (response.ok) {
                    loadOrders();
                    alert("Rendelés sikeresen törölve!");
                } else {
                    const data = await response.json();
                    alert(data.error || "Hiba történt a törlés során!");
                }
            } catch (error) {
                console.error("Hiba a rendelés törlésekor:", error);
            }
        }
    };
});
