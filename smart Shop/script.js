// Global Application State
let productsState = [];
let cartState = [];
let userBalance = parseFloat(localStorage.getItem('smartshop_balance')) || 1000;
let appliedDiscount = 0;
let currentSlide = 0;

// Initialize Web Application
document.addEventListener("DOMContentLoaded", () => {
    updateBalanceUI();
    fetchProducts();
    initSlider();
    initReviews();
    initTodos();
    setupEventListeners();
});

// Update Balance UI and LocalStorage
function updateBalanceUI() {
    document.getElementById('userBalance').innerText = userBalance.toFixed(2);
    localStorage.setItem('smartshop_balance', userBalance);
}

// Fetch Products from FakeStore REST API
async function fetchProducts() {
    const grid = document.getElementById('productGrid');
    try {
        const res = await fetch('https://fakestoreapi.com/products');
        if (!res.ok) throw new Error("API Fetch failed");
        productsState = await res.json();
    } catch (err) {
        console.warn("Using fallback mock dataset:", err);
        productsState = [
            { id: 1, title: "Fjallraven Backpack", price: 109.95, category: "men's clothing", image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg", rating: { rate: 3.9 } },
            { id: 2, title: "Casual Premium T-Shirt", price: 22.3, category: "men's clothing", image: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg", rating: { rate: 4.1 } },
            { id: 3, title: "Cotton Jacket", price: 55.99, category: "men's clothing", image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg", rating: { rate: 4.7 } }
        ];
    }
    renderProducts(productsState);
    populateCategories(productsState);
}

// Render Products Grid
function renderProducts(products) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = products.map(item => `
        <div class="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition flex flex-col justify-between">
            <div>
                <img src="${item.image}" alt="${item.title}" class="h-40 w-full object-contain mb-4">
                <span class="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium uppercase">${item.category}</span>
                <h4 class="font-semibold text-gray-800 text-sm line-clamp-2 mt-2">${item.title}</h4>
            </div>
            <div class="mt-4 pt-3 border-t flex items-center justify-between">
                <div>
                    <span class="text-lg font-bold text-gray-900">${item.price} BDT</span>
                    <div class="text-xs text-yellow-500"><i class="fa-solid fa-star"></i> ${item.rating?.rate || '4.5'}</div>
                </div>
                <button onclick="addToCart(${item.id})" class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg font-medium transition">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

// Populate Dynamic Category Dropdown
function populateCategories(products) {
    const filter = document.getElementById('categoryFilter');
    const categories = ['all', ...new Set(products.map(p => p.category))];
    filter.innerHTML = categories.map(cat => `<option value="${cat}">${cat.toUpperCase()}</option>`).join('');
}

// Add Item to Shopping Cart
function addToCart(productId) {
    const product = productsState.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cartState.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartState.push({ ...product, quantity: 1 });
    }
    updateCartUI();
}

// Update Cart Summary and Dynamic DOM Calculations
function updateCartUI() {
    const list = document.getElementById('cartItemsList');
    const count = document.getElementById('cartItemCount');
    
    const subtotal = cartState.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const delivery = cartState.length > 0 ? 50 : 0;
    const shipping = cartState.length > 0 ? 30 : 0;
    const discountAmount = (subtotal * appliedDiscount);
    const total = subtotal + delivery + shipping - discountAmount;

    count.innerText = cartState.reduce((acc, i) => acc + i.quantity, 0);

    if (cartState.length === 0) {
        list.innerHTML = `<p class="text-gray-400 text-sm text-center py-6">Your cart is empty.</p>`;
    } else {
        list.innerHTML = cartState.map(item => `
            <div class="py-2 flex justify-between items-center text-sm">
                <div class="flex-grow pr-2">
                    <p class="font-medium text-gray-800 line-clamp-1">${item.title}</p>
                    <p class="text-xs text-gray-500">${item.price} x ${item.quantity}</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                    <button onclick="removeFromCart(${item.id})" class="text-red-500 hover:text-red-700 text-xs"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }

    document.getElementById('cartSubtotal').innerText = `${subtotal.toFixed(2)} BDT`;
    document.getElementById('cartDelivery').innerText = `${delivery.toFixed(2)} BDT`;
    document.getElementById('cartShipping').innerText = `${shipping.toFixed(2)} BDT`;
    document.getElementById('cartDiscount').innerText = `-${discountAmount.toFixed(2)} BDT`;
    document.getElementById('cartTotal').innerText = `${total.toFixed(2)} BDT`;
}

// Remove Item from Cart
function removeFromCart(id) {
    cartState = cartState.filter(item => item.id !== id);
    updateCartUI();
}

// Hero Image Slider
function initSlider() {
    const track = document.getElementById('sliderTrack');
    const prev = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');

    const updateSlider = () => {
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
    };

    next.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % 2;
        updateSlider();
    });

    prev.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + 2) % 2;
        updateSlider();
    });

    setInterval(() => {
        currentSlide = (currentSlide + 1) % 2;
        updateSlider();
    }, 5000);
}

// Customer Reviews Rotation
function initReviews() {
    const reviews = [
        { text: "SmartShop features super fast shipping and high-quality products!", author: "Rahim Ahmed", rating: 5 },
        { text: "Great user interface and seamless REST API integration.", author: "Tanvir Hossain", rating: 4 },
        { text: "Loved the promo code feature and easy balance system.", author: "Sultana Razia", rating: 5 }
    ];
    let idx = 0;
    setInterval(() => {
        idx = (idx + 1) % reviews.length;
        document.getElementById('reviewText').innerText = `"${reviews[idx].text}"`;
        document.getElementById('reviewAuthor').innerText = reviews[idx].author;
    }, 4000);
}

// Task Manager System (To-Do List)
function initTodos() {
    const form = document.getElementById('todoForm');
    const list = document.getElementById('todoList');
    let todos = JSON.parse(localStorage.getItem('smartshop_todos')) || [];

    const renderTodos = () => {
        list.innerHTML = todos.map((t, index) => `
            <li class="py-2.5 flex items-center justify-between text-sm">
                <span onclick="toggleTodo(${index})" class="cursor-pointer ${t.completed ? 'completed-task' : 'text-gray-800'}">
                    <i class="fa-regular ${t.completed ? 'fa-square-check text-green-600' : 'fa-square'} mr-2"></i> ${t.text}
                </span>
                <button onclick="deleteTodo(${index})" class="text-red-500 hover:text-red-700"><i class="fa-solid fa-xmark"></i></button>
            </li>
        `).join('');
        localStorage.setItem('smartshop_todos', JSON.stringify(todos));
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('todoInput');
        if (input.value.trim()) {
            todos.push({ text: input.value.trim(), completed: false });
            input.value = '';
            renderTodos();
        }
    });

    window.toggleTodo = (index) => {
        todos[index].completed = !todos[index].completed;
        renderTodos();
    };

    window.deleteTodo = (index) => {
        todos.splice(index, 1);
        renderTodos();
    };

    renderTodos();
}

// Setup Event Listeners
function setupEventListeners() {
    // Add Money Button
    document.getElementById('addMoneyBtn').addEventListener('click', () => {
        userBalance += 1000;
        updateBalanceUI();
        alert("Success! 1000 BDT added to your balance.");
    });

    // Apply Coupon Code
    document.getElementById('applyCouponBtn').addEventListener('click', () => {
        const code = document.getElementById('couponInput').value.trim();
        if (code === 'SMART10') {
            appliedDiscount = 0.10;
            alert("10% Coupon Applied Successfully!");
            updateCartUI();
        } else {
            alert("Invalid Coupon Code. Try 'SMART10'");
        }
    });

    // Checkout Validation
    document.getElementById('checkoutBtn').addEventListener('click', () => {
        const subtotal = cartState.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const total = subtotal + (cartState.length > 0 ? 80 : 0) - (subtotal * appliedDiscount);

        if (total === 0) return alert("Your cart is empty!");
        if (total > userBalance) {
            alert("Warning: Insufficient balance! Please click '+ Add' to top up your account.");
        } else {
            userBalance -= total;
            cartState = [];
            updateBalanceUI();
            updateCartUI();
            alert("Order placed successfully! Thank you for shopping.");
        }
    });

    // Search and Category Filter
    document.getElementById('searchInput').addEventListener('input', filterProducts);
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);

    // Modal Events
    const modal = document.getElementById('apiModal');
    document.getElementById('openApiModal').onclick = () => modal.classList.replace('hidden', 'flex');
    document.getElementById('closeApiModal').onclick = () => modal.classList.replace('flex', 'hidden');
}

// Filter Products
function filterProducts() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const cat = document.getElementById('categoryFilter').value;

    const filtered = productsState.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search);
        const matchesCat = cat === 'all' || p.category === cat;
        return matchesSearch && matchesCat;
    });

    renderProducts(filtered);
}

// Mock API Endpoint Inspector
function inspectEndpoint(path) {
    const view = document.getElementById('apiResponseView');
    let responseData = {};

    if (path === '/api/v1/products') responseData = productsState.slice(0, 2);
    else if (path === '/api/v1/user/balance') responseData = { user: "Md. Zumaith Hossain", balance: userBalance, currency: "BDT" };
    else if (path === '/api/v1/todos') responseData = JSON.parse(localStorage.getItem('smartshop_todos')) || [];

    view.innerText = JSON.stringify({ status: 200, path: path, data: responseData }, null, 2);
}