// Authentication System for SEO Dashboard
class AuthSystem {
    constructor() {
        this.accessToken = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.init();
    }

    init() {
        this.renderAuthForm();
        this.attachEventListeners();
    }

    renderAuthForm() {
        const container = document.getElementById('auth-container');
        const isLogin = !window.location.hash || window.location.hash === '#login';
        
        container.innerHTML = `
            <div class="glass-card rounded-xl p-8 w-full max-w-md">
                <!-- Logo and Title -->
                <div class="text-center mb-8">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-brand-orange rounded-full mb-4">
                        <i class="fas fa-chart-line text-white text-2xl"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-white">SEO Dashboard</h1>
                    <p class="text-gray-400 mt-2">Conversion System</p>
                </div>

                <!-- Tab Switcher -->
                <div class="flex mb-6 bg-gray-800 rounded-lg p-1">
                    <button 
                        class="tab-btn flex-1 py-2 px-4 rounded-md transition-all ${isLogin ? 'bg-brand-orange text-white' : 'text-gray-400'}"
                        data-tab="login">
                        Login
                    </button>
                    <button 
                        class="tab-btn flex-1 py-2 px-4 rounded-md transition-all ${!isLogin ? 'bg-brand-orange text-white' : 'text-gray-400'}"
                        data-tab="register">
                        Register
                    </button>
                </div>

                <!-- Login Form -->
                <div id="login-form" class="${!isLogin ? 'hidden' : ''}">
                    <form id="loginForm">
                        <div class="mb-4">
                            <label class="block text-gray-300 text-sm font-medium mb-2" for="login-email">
                                Email Address
                            </label>
                            <div class="relative">
                                <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <i class="fas fa-envelope text-gray-500"></i>
                                </span>
                                <input
                                    type="email"
                                    id="login-email"
                                    name="email"
                                    required
                                    class="w-full bg-gray-800 text-white pl-10 pr-3 py-3 rounded-lg border border-gray-700 focus:border-brand-orange focus:outline-none"
                                    placeholder="admin@conversionsystem.com"
                                >
                            </div>
                        </div>

                        <div class="mb-6">
                            <label class="block text-gray-300 text-sm font-medium mb-2" for="login-password">
                                Password
                            </label>
                            <div class="relative">
                                <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <i class="fas fa-lock text-gray-500"></i>
                                </span>
                                <input
                                    type="password"
                                    id="login-password"
                                    name="password"
                                    required
                                    class="w-full bg-gray-800 text-white pl-10 pr-3 py-3 rounded-lg border border-gray-700 focus:border-brand-orange focus:outline-none"
                                    placeholder="••••••••"
                                >
                            </div>
                        </div>

                        <button
                            type="submit"
                            class="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        >
                            <i class="fas fa-sign-in-alt mr-2"></i>
                            Sign In
                        </button>
                    </form>
                </div>

                <!-- Register Form -->
                <div id="register-form" class="${isLogin ? 'hidden' : ''}">
                    <form id="registerForm">
                        <div class="mb-4">
                            <label class="block text-gray-300 text-sm font-medium mb-2" for="register-name">
                                Full Name
                            </label>
                            <div class="relative">
                                <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <i class="fas fa-user text-gray-500"></i>
                                </span>
                                <input
                                    type="text"
                                    id="register-name"
                                    name="name"
                                    required
                                    class="w-full bg-gray-800 text-white pl-10 pr-3 py-3 rounded-lg border border-gray-700 focus:border-brand-orange focus:outline-none"
                                    placeholder="John Doe"
                                >
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="block text-gray-300 text-sm font-medium mb-2" for="register-email">
                                Email Address
                            </label>
                            <div class="relative">
                                <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <i class="fas fa-envelope text-gray-500"></i>
                                </span>
                                <input
                                    type="email"
                                    id="register-email"
                                    name="email"
                                    required
                                    class="w-full bg-gray-800 text-white pl-10 pr-3 py-3 rounded-lg border border-gray-700 focus:border-brand-orange focus:outline-none"
                                    placeholder="john@example.com"
                                >
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="block text-gray-300 text-sm font-medium mb-2" for="register-password">
                                Password
                            </label>
                            <div class="relative">
                                <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <i class="fas fa-lock text-gray-500"></i>
                                </span>
                                <input
                                    type="password"
                                    id="register-password"
                                    name="password"
                                    required
                                    minlength="6"
                                    class="w-full bg-gray-800 text-white pl-10 pr-3 py-3 rounded-lg border border-gray-700 focus:border-brand-orange focus:outline-none"
                                    placeholder="••••••••"
                                >
                            </div>
                            <p class="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                        </div>

                        <div class="mb-6">
                            <label class="block text-gray-300 text-sm font-medium mb-2" for="register-team">
                                Team Name (Optional)
                            </label>
                            <div class="relative">
                                <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <i class="fas fa-users text-gray-500"></i>
                                </span>
                                <input
                                    type="text"
                                    id="register-team"
                                    name="teamName"
                                    class="w-full bg-gray-800 text-white pl-10 pr-3 py-3 rounded-lg border border-gray-700 focus:border-brand-orange focus:outline-none"
                                    placeholder="My Team"
                                >
                            </div>
                            <p class="text-xs text-gray-500 mt-1">Leave empty to create a personal team</p>
                        </div>

                        <button
                            type="submit"
                            class="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        >
                            <i class="fas fa-user-plus mr-2"></i>
                            Create Account
                        </button>
                    </form>
                </div>

                <!-- Error/Success Messages -->
                <div id="auth-message" class="mt-4 hidden">
                    <div class="p-3 rounded-lg" id="message-content"></div>
                </div>

                <!-- Demo Account Info -->
                <div class="mt-6 pt-6 border-t border-gray-700 text-center">
                    <p class="text-sm text-gray-400">Demo Account:</p>
                    <p class="text-xs text-gray-500 mt-1">Email: demo@conversionsystem.com</p>
                    <p class="text-xs text-gray-500">Password: demo123</p>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                window.location.hash = tab;
                this.renderAuthForm();
                this.attachEventListeners();
            });
        });

        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin(new FormData(loginForm));
            });
        }

        // Register form submission
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleRegister(new FormData(registerForm));
            });
        }
    }

    async handleLogin(formData) {
        const email = formData.get('email');
        const password = formData.get('password');

        this.showMessage('info', 'Logging in...');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store tokens and user info
                localStorage.setItem('accessToken', data.tokens.accessToken);
                localStorage.setItem('refreshToken', data.tokens.refreshToken);
                localStorage.setItem('user', JSON.stringify(data.user));

                this.showMessage('success', 'Login successful! Redirecting...');
                
                // Redirect to dashboard immediately
                // Using replace to prevent back button issues
                setTimeout(() => {
                    window.location.replace('/');
                }, 500);
            } else {
                this.showMessage('error', data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('error', 'Network error. Please try again.');
        }
    }

    async handleRegister(formData) {
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const teamName = formData.get('teamName');

        this.showMessage('info', 'Creating account...');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, teamName })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store tokens and user info
                localStorage.setItem('accessToken', data.tokens.accessToken);
                localStorage.setItem('refreshToken', data.tokens.refreshToken);
                localStorage.setItem('user', JSON.stringify(data.user));

                this.showMessage('success', 'Account created successfully! Redirecting...');
                
                // Redirect to dashboard immediately
                // Using replace to prevent back button issues
                setTimeout(() => {
                    window.location.replace('/');
                }, 500);
            } else {
                this.showMessage('error', data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Register error:', error);
            this.showMessage('error', 'Network error. Please try again.');
        }
    }

    showMessage(type, text) {
        const messageContainer = document.getElementById('auth-message');
        const messageContent = document.getElementById('message-content');
        
        messageContainer.classList.remove('hidden');
        messageContent.className = 'p-3 rounded-lg';
        
        if (type === 'success') {
            messageContent.classList.add('bg-green-900', 'text-green-300');
            messageContent.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${text}`;
        } else if (type === 'error') {
            messageContent.classList.add('bg-red-900', 'text-red-300');
            messageContent.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${text}`;
        } else {
            messageContent.classList.add('bg-blue-900', 'text-blue-300');
            messageContent.innerHTML = `<i class="fas fa-info-circle mr-2"></i>${text}`;
        }

        // Auto-hide after 5 seconds for non-success messages
        if (type !== 'success') {
            setTimeout(() => {
                messageContainer.classList.add('hidden');
            }, 5000);
        }
    }

    // Token refresh helper
    async refreshAccessToken() {
        if (!this.refreshToken) return false;

        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                localStorage.setItem('accessToken', data.tokens.accessToken);
                localStorage.setItem('refreshToken', data.tokens.refreshToken);
                this.accessToken = data.tokens.accessToken;
                this.refreshToken = data.tokens.refreshToken;
                return true;
            }
        } catch (error) {
            console.error('Token refresh error:', error);
        }

        return false;
    }

    // Axios interceptor for automatic token handling
    setupAxiosInterceptors() {
        // Request interceptor to add token
        axios.interceptors.request.use(
            (config) => {
                if (this.accessToken) {
                    config.headers.Authorization = `Bearer ${this.accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor for token refresh
        axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    
                    const refreshed = await this.refreshAccessToken();
                    if (refreshed) {
                        originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
                        return axios(originalRequest);
                    } else {
                        // Refresh failed, redirect to login
                        window.location.href = '/login';
                    }
                }

                return Promise.reject(error);
            }
        );
    }
}

// Initialize authentication system
const authSystem = new AuthSystem();
authSystem.setupAxiosInterceptors();