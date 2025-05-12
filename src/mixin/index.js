import { useStore } from '../stores/index';
import axios from 'axios';

const mixin = {
    data: function () {
        return {
            appName: 'ScaleLinode',
            appVersion: 'v0.1',
            paginationSizes: [10, 20, 50, 100, 200, 300, 500, 1000],
            showFilters: true,
            reqFilters: {},
            pagination: {
                per_page: 100,
                current_page: 1,
                total: ''
            },
            MONACO_EDITOR_OPTIONS: {
                automaticLayout: true,
                formatOnType: true,
                formatOnPaste: true,
            },
            READONLY_MONACO_EDITOR_OPTIONS: {
                automaticLayout: true,
                formatOnType: true,
                formatOnPaste: true,
                readOnly: true,
            },
            linodeToken: '',
            corsHost: import.meta.env.VITE_CORS_HOST,
            apiHostProd: import.meta.env.VITE_API_HOST_PROD,
            apiHostUat: import.meta.env.VITE_API_HOST_UAT,
            apiHostDev: import.meta.env.VITE_API_HOST_DEV,
            cloudApi: import.meta.env.VITE_CLOUD_API,
        }
    },
    computed: {
        pageTitle() {
            return useStore().getPageTitle;
        },
        isCollapse() {
            return useStore().getIsCollapse;
        },
        profile() {
            return useStore().getProfile;
        },
        token() {
            return useStore().getToken;
        },
        environment() {
            return useStore().getEnvironment;
        },
        apiUrl() {
            if (this.environment == 'dev') {
                return this.apiHostDev;
            } else if (this.environment == 'prod') {
                return this.apiHostProd;
            }

            return this.apiHostDev;
        },
        profileRoles() {
            const profile = useStore().getProfile;
            if (profile) {
                return profile.roles.map(role => role.name);
            }
            return [];
        },
        profilePermissions() {
            const profile = useStore().getProfile;
            if (profile) {
                return profile.permissions.map(permission => permission);
            }
            return [];
        }
    },
    created: function () { },
    mounted() { },
    methods: {
        logout() {
            localStorage.removeItem('token');
            window.location.reload();
        },
        makeRequest(method, endpoint, data = {}, headers = {}, params = {}) {
            this.loading = true;
        
            let config = {
                method: method,
                url: `${this.apiUrl}${endpoint}`,
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'authorization': `Bearer ${this.token}`,
                    'content-type': 'application/json',
                    ...headers
                }
            };
        
            if (method === 'post') {
                config.data = data;
            } else if (method === 'get') {
                config.params = params;
            }
        
            return axios(config)
                .then(response => response) 
                .catch(error => {
                    this.showErrorMessage(error); 
                    return Promise.reject(error); 
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        generateRandomPassword(length) {
            const specials = '!@#$%^&*()_+{}[]:;"\'<>,.?/';
            const alphanumeric = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

            let password = '';

            // Ensure at least one special character
            const randomSpecial = specials.charAt(Math.floor(Math.random() * specials.length));
            password += randomSpecial;

            // Fill the rest of the password with alphanumeric characters
            const remainingLength = length - 1; // subtract 1 for the special character
            for (let i = 0; i < remainingLength; i++) {
                password += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
            }

            // Shuffle the password characters to make it more random
            password = password.split('').sort(() => Math.random() - 0.5).join('');

            return password;
        },
        copyContent: function (arg) {
            const el = document.createElement('textarea');
            el.value = arg;
            el.setAttribute('readonly', '');
            el.style.position = 'absolute';
            el.style.left = '-9999px';
            document.body.appendChild(el);
            const selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false;
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            if (selected) {
                document.getSelection().removeAllRanges();
                document.getSelection().addRange(selected);
                this.$message({
                    type: 'info',
                    message: 'Copied to clipboard'
                });
            }
        },
        showErrorMessage(error) {
            console.log(error.response.data);
            if (error.response && error.response.data) {
                let errorMessage = 'Error: ';
                const errorData = error.response.data.error;
        
                if (Array.isArray(errorData)) {
                    errorMessage += errorData.join(', '); 
                } else {
                    errorMessage += errorData;
                }
        
                this.$message.error({ message: errorMessage, dangerouslyUseHTMLString: true });
            } else {
                this.$message.error('An unknown error occurred.');
            }
        }
        ,
        timeAgo(dateString) {
            const now = new Date();
            const past = new Date(dateString);

            const secondsAgo = Math.floor((now - past) / 1000);
            const minutesAgo = Math.floor(secondsAgo / 60);
            const hoursAgo = Math.floor(minutesAgo / 60);
            const daysAgo = Math.floor(hoursAgo / 24);
            const weeksAgo = Math.floor(daysAgo / 7);
            const monthsAgo = Math.floor(daysAgo / 30);
            const yearsAgo = Math.floor(daysAgo / 365);

            if (yearsAgo > 0) {
                return `${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago`;
            } else if (monthsAgo > 0) {
                return `${monthsAgo} month${monthsAgo > 1 ? 's' : ''} ago`;
            } else if (weeksAgo > 0) {
                return `${weeksAgo} week${weeksAgo > 1 ? 's' : ''} ago`;
            } else if (daysAgo > 0) {
                return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
            } else if (hoursAgo > 0) {
                return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
            } else if (minutesAgo > 0) {
                return `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
            } else {
                return `${secondsAgo} second${secondsAgo > 1 ? 's' : ''} ago`;
            }
        }
    }
};

export default mixin;