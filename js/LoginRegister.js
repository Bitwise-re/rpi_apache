
const users = JSON.parse(localStorage.getItem('users')) || {};

function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleBtn = document.querySelector('.toggle-btn');
    
    loginForm.classList.toggle('hidden');
    registerForm.classList.toggle('hidden');
    toggleBtn.textContent = loginForm.classList.contains('hidden') ? 
        'Switch to Login' : 'Switch to Register';
}

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = e.target[0].value;
    const password = e.target[1].value;
    
    if (users[username] && users[username] === password) {
        alert('Login successful!');
    } else {
        alert('Invalid credentials!');
    }
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = e.target[0].value;
    const password = e.target[1].value;
    
    if (users[username]) {
        alert('Username already exists!');
    } else {
        users[username] = password;
        localStorage.setItem('users', JSON.stringify(users));
        alert('Registration successful!');
        toggleForms();
    }
});
