const apiUrl = "http://localhost:3000";

let allProducts = [];
let selectedCategory = "all";
let editId = null;

const getProducts = () => {
  axios.get(`${apiUrl}/products`).then((res) => {
    allProducts = res.data;
    showProducts(allProducts);
  });
};

const showProducts = (products) => {
  const container = document.getElementById("productsContainer");

  if (!products || products.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; padding: 2rem;">Məhsul tapılmadı</p>';
    return;
  }

  container.innerHTML = products
    .map(
      (p) => `
        <div class="product-card">
            <img src="${p.image}" alt="${p.name}">
            <div class="product-info">
                <div class="product-category">${p.category}</div>
                <h3 class="product-name">${p.name}</h3>
                <p class="product-description">${p.description}</p>
                <div class="product-sizes">
                    ${p.sizes
                      .map((size) => `<span class="size-badge">${size}</span>`)
                      .join("")}
                </div>
                <div class="price-wrapper">
                  <div class="product-price">${p.price} AZN</div>
                </div>
                <div class="product-actions">
                  <button class="btn-ghost quickview-btn" onclick="openQuickView(${
                    p.id
                  })">Tez Bax</button>
                  <button class="btn cta" onclick="addToCart(${
                    p.id
                  })">Səbətə at</button>
                </div>
            </div>
        </div>
    `
    )
    .join("");
};

const searchProduct = () => {
  const searchText = document.getElementById("searchInput").value.toLowerCase();

  let filtered = allProducts;

  if (selectedCategory !== "all") {
    filtered = filtered.filter((p) => p.category === selectedCategory);
  }

  if (searchText) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(searchText) ||
        p.description.toLowerCase().includes(searchText)
    );
  }

  showProducts(filtered);
};

const selectCategory = (category) => {
  selectedCategory = category;

  const buttons = document.querySelectorAll(".category-btn");
  buttons.forEach((btn) => btn.classList.remove("active"));

  event.target.classList.add("active");

  searchProduct();
};

const checkLogin = () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "admin" && password === "admin123") {
    localStorage.setItem("adminLogin", "yes");
    alert("Giriş uğurlu!");
    window.location.href = "admin.html";
  } else {
    const errorDiv = document.getElementById("errorMessage");
    errorDiv.textContent = "İstifadəçi adı və ya şifrə yanlışdır!";
    errorDiv.classList.add("show");
  }
};

const logout = () => {
  localStorage.removeItem("adminLogin");
  alert("Çıxış edildi!");
  window.location.href = "login.html";
};

const checkAdminAuth = () => {
  const isAdmin = localStorage.getItem("adminLogin");
  if (isAdmin !== "yes") {
    alert("Əvvəlcə giriş etməlisiniz!");
    window.location.href = "login.html";
  }
};

const getAdminProducts = () => {
  axios.get(`${apiUrl}/products`).then((res) => {
    allProducts = res.data;
    showAdminTable();
  });
};

const showAdminTable = () => {
  const tbody = document.getElementById("productsTableBody");

  tbody.innerHTML = allProducts
    .map(
      (p) => `
        <tr>
            <td>${p.id}</td>
            <td><img src="${p.image}" class="product-img"></td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>${p.price} AZN</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editProduct(${p.id})"> Redaktə</button>
                    <button class="btn-delete" onclick="deleteProduct(${p.id})"> Sil</button>
                </div>
            </td>
        </tr>
    `
    )
    .join("");
};

const openForm = () => {
  document.getElementById("productFormContainer").classList.remove("hidden");
  document.getElementById("formTitle").textContent = "Yeni Məhsul Əlavə Et";
  editId = null;
};

const closeForm = () => {
  document.getElementById("productFormContainer").classList.add("hidden");
  document.getElementById("productForm").reset();
  editId = null;
};

const saveProduct = () => {
  const name = document.getElementById("productName").value;
  const category = document.getElementById("productCategory").value;
  const price = document.getElementById("productPrice").value;
  const image = document.getElementById("productImage").value;
  const description = document.getElementById("productDescription").value;
  const sizesText = document.getElementById("productSizes").value;

  const sizes = sizesText.split(",").map((s) => s.trim());

  const productData = {
    name: name,
    category: category,
    price: price,
    image: image,
    description: description,
    sizes: sizes,
  };

  if (editId) {
    axios.put(`${apiUrl}/products/${editId}`, productData).then(() => {
      alert("Məhsul yeniləndi!");
      closeForm();
      getAdminProducts();
    });
  } else {
    axios.post(`${apiUrl}/products`, productData).then(() => {
      alert("Məhsul əlavə edildi!");
      closeForm();
      getAdminProducts();
    });
  }
};

const editProduct = (id) => {
  axios.get(`${apiUrl}/products/${id}`).then((res) => {
    const p = res.data;

    document.getElementById("productName").value = p.name;
    document.getElementById("productCategory").value = p.category;
    document.getElementById("productPrice").value = p.price;
    document.getElementById("productImage").value = p.image;
    document.getElementById("productDescription").value = p.description;
    document.getElementById("productSizes").value = p.sizes.join(", ");

    document.getElementById("productFormContainer").classList.remove("hidden");
    document.getElementById("formTitle").textContent = "Məhsulu Redaktə Et";

    editId = id;
  });
};

const deleteProduct = (id) => {
  const confirmDelete = window.confirm(
    "Bu məhsulu silmək istədiyinizdən əminsiniz?"
  );

  if (confirmDelete) {
    axios.delete(`${apiUrl}/products/${id}`).then(() => {
      alert("Məhsul silindi!");
      getAdminProducts();
    });
  }
};

function addToCart(id) {
  const product = allProducts.find((p) => p.id === id);
  if (!product) return alert("Məhsul tapılmadı");
  alert(`${product.name} səbətə əlavə edildi.`);
}

/* Quick View modal */
function openQuickView(id) {
  const p = allProducts.find((x) => x.id === id);
  if (!p) return;

  const modal = document.getElementById("quickViewModal");
  modal.querySelector(".modal-image").src = p.image;
  modal.querySelector(".modal-image").alt = p.name;
  modal.querySelector(".modal-name").textContent = p.name;
  modal.querySelector(".modal-category").textContent = p.category;
  modal.querySelector(".modal-desc").textContent = p.description;
  modal.querySelector(".modal-sizes").innerHTML = p.sizes
    .map((s) => `<span class="size-badge">${s}</span>`)
    .join("");
  modal.querySelector(".modal-price").textContent = `${p.price} AZN`;

  const modalAdd = document.getElementById("modalAddToCart");
  modalAdd.onclick = function () {
    addToCart(p.id);
    closeQuickView();
  };

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeQuickView() {
  const modal = document.getElementById("quickViewModal");
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

/* Sorting */
function sortProducts(sortType) {
  let sorted = [...allProducts];
  if (sortType === "price-asc") {
    sorted.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortType === "price-desc") {
    sorted.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sortType === "newest") {
    sorted.sort((a, b) => Number(b.id) - Number(a.id));
  }

  // apply category/search filters then show
  const searchText = (document.getElementById("searchInput") || {}).value || "";
  if (selectedCategory !== "all") {
    sorted = sorted.filter((p) => p.category === selectedCategory);
  }
  if (searchText) {
    const low = searchText.toLowerCase();
    sorted = sorted.filter(
      (p) =>
        p.name.toLowerCase().includes(low) ||
        p.description.toLowerCase().includes(low)
    );
  }
  showProducts(sorted);
}
