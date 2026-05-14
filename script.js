// Navegação entre Seções
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.page-section');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.getAttribute('data-page');

        if (!page) return;

        // Atualiza UI do Menu
        navItems.forEach(i => {
            i.classList.remove('active', 'text-indigo-500');
            i.classList.add('text-slate-400');
        });
        item.classList.add('active', 'text-indigo-500');
        item.classList.remove('text-slate-400');

        // Alterna Seções
        sections.forEach(section => {
            section.classList.add('hidden');
        });
        const targetSection = document.getElementById(`${page}-section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
    });
});

// Lógica de Edição de Perfil
const editModal = document.getElementById('edit-modal');
const quickMenu = document.getElementById('quick-menu');
const bottomSheetEdit = editModal ? editModal.querySelector('.bottom-sheet') : null;
const bottomSheetQuick = quickMenu ? quickMenu.querySelector('.bottom-sheet') : null;

function openEditModal() {
    editModal.classList.remove('hidden');
    setTimeout(() => bottomSheetEdit.classList.add('active'), 10);

    // Carrega valores atuais nos inputs
    document.getElementById('input-name').value = document.getElementById('display-name').innerText;
    document.getElementById('input-username').value = document.getElementById('display-username').innerText.replace('@', '');
}

function closeEditModal() {
    bottomSheetEdit.classList.remove('active');
    setTimeout(() => editModal.classList.add('hidden'), 300);
}

function openQuickMenu() {
    quickMenu.classList.remove('hidden');
    setTimeout(() => bottomSheetQuick.classList.add('active'), 10);
}

function closeQuickMenu() {
    if (!bottomSheetQuick) return;
    bottomSheetQuick.classList.remove('active');
    setTimeout(() => {
        quickMenu.classList.add('hidden');
        toggleMoreOptions(false);
        // Reset transform para a próxima vez
        bottomSheetQuick.style.transform = '';
    }, 300);
}

// Lógica de "Swipe down to close" para Bottom Sheets
let touchStartY = 0;
let currentTranslateY = 0;

function initBottomSheetGestures(sheet, closeFn) {
    if (!sheet) return;

    sheet.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        sheet.style.transition = 'none'; // Desativa transição durante o drag
    });

    sheet.addEventListener('touchmove', (e) => {
        const touchY = e.touches[0].clientY;
        const deltaY = touchY - touchStartY;

        if (deltaY > 0) { // Só arrasta para baixo
            currentTranslateY = deltaY;
            sheet.style.transform = `translateY(${deltaY}px)`;
        }
    });

    sheet.addEventListener('touchend', () => {
        sheet.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

        if (currentTranslateY > 120) { // Threshold para fechar
            closeFn();
        } else {
            sheet.style.transform = 'translateY(0)';
        }
        currentTranslateY = 0;
    });
}

// Lógica de Novo Post
function openPostModal() {
    const modal = document.getElementById('post-modal');
    const sheet = modal.querySelector('.bottom-sheet');
    modal.classList.remove('hidden');
    setTimeout(() => sheet.classList.add('active'), 10);
    closeQuickMenu();
}

function closePostModal() {
    const modal = document.getElementById('post-modal');
    const sheet = modal.querySelector('.bottom-sheet');
    sheet.classList.remove('active');
    setTimeout(() => {
        modal.classList.add('hidden');
        sheet.style.transform = '';
    }, 300);
}

function handleCreatePost() {
    const content = document.getElementById('post-content').value;
    if (!content.trim()) {
        showAlert("Escreva algo antes de publicar!", "fa-triangle-exclamation");
        return;
    }

    const newPost = {
        id: Date.now(),
        content: content,
        author: localStorage.getItem('user_name') || 'Usuário Premium',
        date: 'Agora mesmo',
        icon: 'fa-message',
        color: 'indigo'
    };

    // Salva no LocalStorage
    let posts = JSON.parse(localStorage.getItem('user_posts') || '[]');
    posts.unshift(newPost);
    localStorage.setItem('user_posts', JSON.stringify(posts));

    // Feedback e Reset
    document.getElementById('post-content').value = '';
    closePostModal();
    showAlert("Postado com sucesso!", "fa-check-circle");
    renderPosts();
}

function renderPosts() {
    const container = document.getElementById('posts-container');
    if (!container) return;

    // Mantém o cabeçalho "Recentes"
    const header = `
        <div class="flex justify-between items-center px-1">
            <span class="font-bold text-slate-800">Recentes</span>
            <a href="#" class="text-xs font-bold text-indigo-500 uppercase tracking-widest">Ver tudo</a>
        </div>
    `;

    let posts = JSON.parse(localStorage.getItem('user_posts') || '[]');
    
    // Se não houver posts, mostra alguns placeholders
    if (posts.length === 0) {
        posts = [
            { content: "Bem-vindo ao seu novo feed dinâmico!", author: "Sistema", date: "Há 1 min", icon: "fa-rocket", color: "emerald" },
            { content: "Explore as funcionalidades do Menu Rápido.", author: "Guia", date: "Há 5 min", icon: "fa-lightbulb", color: "amber" }
        ];
    }

    const postsHtml = posts.map(post => `
        <div class="card p-4 rounded-3xl flex items-center space-x-4 animate-fade-in">
            <div class="w-12 h-12 bg-${post.color || 'slate'}-100 rounded-2xl flex items-center justify-center text-${post.color || 'slate'}-500">
                <i class="fa-solid ${post.icon || 'fa-image'}"></i>
            </div>
            <div class="flex-1">
                <h4 class="font-bold text-slate-800 text-sm line-clamp-1">${post.content}</h4>
                <p class="text-[10px] text-slate-400 font-medium">${post.author} • ${post.date}</p>
            </div>
            <i class="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
        </div>
    `).join('');

    container.innerHTML = header + postsHtml;
}

// Inicializa gestos nos modais
window.addEventListener('load', () => {
    initBottomSheetGestures(bottomSheetEdit, closeEditModal);
    initBottomSheetGestures(bottomSheetQuick, closeQuickMenu);
    
    const mapModal = document.getElementById('map-modal');
    if (mapModal) {
        const mapSheet = mapModal.querySelector('.bottom-sheet');
        initBottomSheetGestures(mapSheet, closeMapModal);
    }

    const postModal = document.getElementById('post-modal');
    if (postModal) {
        const postSheet = postModal.querySelector('.bottom-sheet');
        initBottomSheetGestures(postSheet, closePostModal);
    }

    renderPosts();
});

function toggleMoreOptions(showMore) {
    const p1 = document.getElementById('quick-page-1');
    const p2 = document.getElementById('quick-page-2');

    if (showMore) {
        p1.classList.add('hidden');
        p2.classList.remove('hidden');
    } else {
        p2.classList.add('hidden');
        p1.classList.remove('hidden');
    }
}

function saveProfile() {
    const newName = document.getElementById('input-name').value;
    const newUsername = document.getElementById('input-username').value;
    const currentImg = document.getElementById('profile-img').src;

    if (newName && newUsername) {
        // Atualiza UI
        document.getElementById('display-name').innerText = newName;
        document.getElementById('display-username').innerText = '@' + newUsername;

        // Salva no LocalStorage
        localStorage.setItem('userProfile', JSON.stringify({
            name: newName,
            username: newUsername,
            image: currentImg
        }));

        closeEditModal();

        // Feedback de sucesso
        console.log('Perfil atualizado!');
    }
}

// Lógica de Upload de Imagem
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const base64Image = e.target.result;
            document.getElementById('profile-img').src = base64Image;

            // Salva a imagem imediatamente
            const savedProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
            savedProfile.image = base64Image;
            localStorage.setItem('userProfile', JSON.stringify(savedProfile));
        };
        reader.readAsDataURL(file);
    }
}

// Carregar Perfil Salvo ao Iniciar
function loadProfile() {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        if (profile.name) document.getElementById('display-name').innerText = profile.name;
        if (profile.username) document.getElementById('display-username').innerText = '@' + profile.username;
        if (profile.image) document.getElementById('profile-img').src = profile.image;
    }
}

// Executar loadProfile ao carregar a página
window.addEventListener('load', () => {
    loadProfile();
    checkAuth();
});

// Lógica de Autenticação
const authSection = document.getElementById('auth-section');
const mainHeader = document.getElementById('main-header');
const mainNav = document.getElementById('main-nav');
const scrollContainer = document.getElementById('scroll-container');

function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn) {
        authSection.classList.add('hidden');
        mainHeader.classList.remove('hidden');
        mainNav.classList.remove('hidden');
        scrollContainer.classList.remove('hidden');
    } else {
        authSection.classList.remove('hidden');
        mainHeader.classList.add('hidden');
        mainNav.classList.add('hidden');
        scrollContainer.classList.add('hidden');
    }
}

// Lógica de Câmera
let cameraStream = null;

async function openCamera() {
    const modal = document.getElementById('camera-modal');
    const video = document.getElementById('camera-video');

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' }, // Tenta usar a câmera traseira
            audio: false 
        });
        video.srcObject = cameraStream;
        modal.classList.remove('hidden');
        closeQuickMenu(); // Fecha o menu de ações ao abrir a câmera
    } catch (err) {
        console.error("Erro ao acessar a câmera: ", err);
        showAlert("Erro ao acessar a câmera. Verifique as permissões.", "fa-triangle-exclamation");
    }
}

function closeCamera() {
    const modal = document.getElementById('camera-modal');
    const video = document.getElementById('camera-video');

    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    video.srcObject = null;
    modal.classList.add('hidden');
}

function takePhoto() {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    const flash = document.getElementById('camera-flash');

    // Efeito de Flash
    flash.classList.remove('opacity-0');
    flash.classList.add('opacity-100');
    setTimeout(() => {
        flash.classList.remove('opacity-100');
        flash.classList.add('opacity-0');
    }, 100);

    // Captura o frame atual do vídeo no canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converte para Base64 (poderia ser enviado para um servidor ou salvo)
    const photoData = canvas.toDataURL('image/jpeg');
    console.log("Foto capturada!");
    
    // Pequeno feedback visual e fecha após 1s (opcional)
    setTimeout(() => {
        showAlert("Foto capturada com sucesso!", "fa-camera");
        closeCamera();
    }, 500);
}

// Lógica de Check-in (GPS)
let leafletMap = null;

function handleCheckIn() {
    if (!navigator.geolocation) {
        showAlert("Seu navegador não suporta GPS.", "fa-triangle-exclamation");
        return;
    }

    showAlert("Obtendo localização...", "fa-location-crosshairs");
    closeQuickMenu();

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Salva no histórico
            saveLocation(lat, lng);
            
            console.log(`Localização: ${lat}, ${lng}`);
            
            setTimeout(() => {
                showAlert(`Check-in realizado! Local salvo no mapa.`, "fa-location-dot");
            }, 1000);
        },
        (error) => {
            console.error("Erro GPS:", error);
            let msg = "Não foi possível obter sua localização.";
            if (error.code === 1) msg = "Permissão de GPS negada.";
            showAlert(msg, "fa-triangle-exclamation");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
}

function saveLocation(lat, lng) {
    let history = JSON.parse(localStorage.getItem('checkin_history') || '[]');
    history.push({
        lat,
        lng,
        date: new Date().toLocaleString('pt-BR')
    });
    localStorage.setItem('checkin_history', JSON.stringify(history));
}

function openMapModal() {
    const modal = document.getElementById('map-modal');
    const sheet = modal.querySelector('.bottom-sheet');
    modal.classList.remove('hidden');
    
    // Animação de subida
    setTimeout(() => sheet.classList.add('active'), 10);
    
    closeQuickMenu();

    // Inicializa o mapa Leaflet
    setTimeout(() => {
        if (!leafletMap) {
            leafletMap = L.map('map', {
                zoomControl: false // Desativa botões de zoom para visual limpo
            }).setView([0, 0], 2);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(leafletMap);
        }
        
        // Garante que o Leaflet recalcule o tamanho após o modal abrir
        leafletMap.invalidateSize();
        renderMarkers();
    }, 400); // Espera a animação do bottom sheet
}

function renderMarkers() {
    if (!leafletMap) return;

    // Limpa marcadores existentes para evitar duplicatas ao reabrir
    leafletMap.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            leafletMap.removeLayer(layer);
        }
    });

    const history = JSON.parse(localStorage.getItem('checkin_history') || '[]');
    
    if (history.length > 0) {
        const bounds = [];
        history.forEach(loc => {
            L.marker([loc.lat, loc.lng])
                .addTo(leafletMap)
                .bindPopup(`<b>Check-in</b><br>${loc.date}`);
            bounds.push([loc.lat, loc.lng]);
        });
        
        // Ajusta o zoom para mostrar todos os pontos
        leafletMap.fitBounds(bounds, { padding: [50, 50] });
    }
}

function closeMapModal() {
    const modal = document.getElementById('map-modal');
    const sheet = modal.querySelector('.bottom-sheet');
    
    sheet.classList.remove('active');
    setTimeout(() => {
        modal.classList.add('hidden');
        sheet.style.transform = ''; // Reset do arraste
    }, 300);
}

function clearCheckInHistory() {
    if (confirm("Deseja realmente apagar todo o histórico de locais?")) {
        localStorage.removeItem('checkin_history');
        if (leafletMap) {
            leafletMap.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    leafletMap.removeLayer(layer);
                }
            });
        }
        showAlert("Histórico limpo!", "fa-trash-can");
    }
}

function handleLogin() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;

    if (user && pass) {
        // Simulação de login
        localStorage.setItem('isLoggedIn', 'true');
        checkAuth();
        showAlert('Bem-vindo de volta!', 'fa-circle-check');
    } else {
        showAlert('Preencha e-mail e senha.');
    }
}

let verificationTimer;
let attemptsLeft = 3;
let isRecoveryMode = false;

function handleSignup() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const pass = document.getElementById('signup-pass').value;

    if (name && email && pass) {
        isRecoveryMode = false;
        // Simulação de transição para verificação
        toggleAuth('verify');
        startTimer();

        // Salva temporariamente
        localStorage.setItem('tempProfile', JSON.stringify({
            name: name,
            username: email.split('@')[0],
            image: 'https://i.pravatar.cc/300',
            password: pass
        }));
    } else {
        showAlert('Preencha todos os campos.');
    }
}

function handleRecovery() {
    const email = document.getElementById('recovery-email').value;
    if (email) {
        isRecoveryMode = true;
        toggleAuth('verify');
        startTimer();
        showAlert('Código de recuperação enviado!');
    } else {
        showAlert('Digite seu e-mail.');
    }
}

function toggleAuth(mode) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const verifyForm = document.getElementById('verify-form');
    const recoveryForm = document.getElementById('recovery-form');
    const newPasswordForm = document.getElementById('new-password-form');
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');

    loginForm.classList.add('hidden');
    signupForm.classList.add('hidden');
    verifyForm.classList.add('hidden');
    recoveryForm.classList.add('hidden');
    newPasswordForm.classList.add('hidden');

    if (mode === 'signup') {
        signupForm.classList.remove('hidden');
        title.innerText = 'Nova Conta';
        subtitle.innerText = 'Comece sua jornada premium';
    } else if (mode === 'verify') {
        verifyForm.classList.remove('hidden');
        title.innerText = 'Verificação';
        subtitle.innerText = 'Digite o código enviado';
    } else if (mode === 'recovery') {
        recoveryForm.classList.remove('hidden');
        title.innerText = 'Recuperação';
        subtitle.innerText = 'Digite seu e-mail cadastrado';
    } else if (mode === 'new-password') {
        newPasswordForm.classList.remove('hidden');
        title.innerText = 'Nova Senha';
        subtitle.innerText = 'Escolha sua nova senha forte';
    } else {
        loginForm.classList.remove('hidden');
        title.innerText = 'Bem-vindo';
        subtitle.innerText = 'Faça login para continuar';
    }
}

// Lógica de Verificação
function startTimer() {
    let timeLeft = 60;
    const timerCount = document.getElementById('timer-count');
    const timerText = document.getElementById('timer-text');
    const resendBtn = document.getElementById('resend-btn');

    resendBtn.classList.add('hidden');
    timerText.classList.remove('hidden');

    clearInterval(verificationTimer);
    verificationTimer = setInterval(() => {
        timeLeft--;
        timerCount.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(verificationTimer);
            timerText.classList.add('hidden');
            resendBtn.classList.remove('hidden');
        }
    }, 1000);
}

function handleVerify() {
    const otpInputs = document.querySelectorAll('.otp-input');
    const code = Array.from(otpInputs).map(i => i.value).join('');

    if (code.length === 6) {
        if (code === '123456') { // Código de teste
            if (isRecoveryMode) {
                toggleAuth('new-password');
                showAlert('Código aceito. Defina sua nova senha.', 'fa-circle-check');
            } else {
                const temp = JSON.parse(localStorage.getItem('tempProfile'));
                localStorage.setItem('userProfile', JSON.stringify(temp));
                localStorage.setItem('isLoggedIn', 'true');
                checkAuth();
                showAlert('Conta verificada com sucesso!', 'fa-circle-check');
            }
        } else {
            attemptsLeft--;
            document.getElementById('attempts-count').innerText = attemptsLeft;
            if (attemptsLeft <= 0) {
                showAlert('Muitas tentativas. Volte amanhã ou tente fazer login.', 'fa-circle-xmark');
                setTimeout(() => {
                    toggleAuth('login');
                    // Reset para permitir nova tentativa se ele tentar cadastrar de novo
                    attemptsLeft = 3;
                    document.getElementById('attempts-count').innerText = attemptsLeft;
                }, 3000);
            } else {
                showAlert(`Código incorreto. Você tem ${attemptsLeft} tentativas.`, 'fa-triangle-exclamation');
            }
        }
    } else {
        showAlert('Digite o código de 6 dígitos.');
    }
}

function handleResend() {
    showAlert('Novo código enviado para seu e-mail.');
    startTimer();
}

function handleUpdatePassword() {
    const p1 = document.getElementById('new-pass').value;
    const p2 = document.getElementById('new-pass-confirm').value;

    if (p1 && p1 === p2) {
        // Simulação de atualização de senha
        showAlert('Senha alterada com sucesso!', 'fa-circle-check');
        setTimeout(() => toggleAuth('login'), 2000);
    } else {
        showAlert('As senhas não coincidem ou estão vazias.');
    }
}

// Auto-focus para inputs de código
document.querySelectorAll('.otp-input').forEach((input, idx) => {
    input.addEventListener('keyup', (e) => {
        if (e.key >= 0 && e.key <= 9) {
            if (input.nextElementSibling) input.nextElementSibling.focus();
        } else if (e.key === 'Backspace') {
            if (input.previousElementSibling) input.previousElementSibling.focus();
        }
    });
});

// Alerta Customizado
function showAlert(msg, icon = 'fa-circle-info') {
    const alert = document.getElementById('custom-alert');
    const message = document.getElementById('alert-message');
    const iconEl = document.getElementById('alert-icon');

    message.innerText = msg;
    iconEl.innerHTML = `<i class="fa-solid ${icon}"></i>`;

    alert.classList.add('active');
    setTimeout(() => {
        alert.classList.remove('active');
    }, 3000);
}

function handleLogout() {
    localStorage.setItem('isLoggedIn', 'false');
    checkAuth();
    console.log('Logout realizado!');
}

// Lógica de Desenvolvimento: Limpar Cache
async function clearAppCache() {
    if (confirm('Deseja limpar o cache e forçar a atualização do app?')) {
        // 1. Desregistrar Service Workers
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
                await registration.unregister();
            }
        }

        // 2. Deletar todos os Caches
        if ('caches' in window) {
            const keys = await caches.keys();
            for (let key of keys) {
                await caches.delete(key);
            }
        }

        // 3. Limpar LocalStorage (Desconectar usuário e resetar perfil)
        localStorage.clear();

        // 4. Recarregar a página
        location.reload(true);
    }
}

// Registro do Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registrado!', reg))
            .catch(err => console.log('Erro ao registrar Service Worker', err));
    });
}

// Lógica de Instalação PWA
let deferredPrompt;
const installBanner = document.getElementById('install-banner');
const successToast = document.getElementById('success-toast');

window.addEventListener('beforeinstallprompt', (e) => {
    // Não bloqueamos mais o padrão do navegador
    deferredPrompt = e;
    installBanner.classList.remove('hidden');
});

installBanner.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Usuário escolheu: ${outcome}`);
        deferredPrompt = null;
        installBanner.classList.add('hidden');
    }
});

window.addEventListener('appinstalled', (event) => {
    console.log('App instalado com sucesso!');
    installBanner.classList.add('hidden');

    // Mostra o toast de sucesso
    successToast.classList.remove('hidden');

    // Esconde o toast após 4 segundos
    setTimeout(() => {
        successToast.classList.add('hidden');
    }, 4000);
});