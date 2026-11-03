const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

let currentTab = 'home';

function estimatePrice(username) {
    const len = username.length;
    if (len <= 4) return Math.floor(Math.random() * 500) + 1000;
    if (len === 5) return Math.floor(Math.random() * 200) + 500;
    if (len === 6) return Math.floor(Math.random() * 100) + 200;
    if (len === 7) return Math.floor(Math.random() * 50) + 100;
    return Math.floor(Math.random() * 20) + 50;
}

async function refresh() {
    try {
        // ЗАМЕНИ ЭТУ ССЫЛКУ НА СВОЮ ИЗ ТУННЕЛЯ ИЛИ RENDER!
        const API_BASE = "https://58ac51d2728111.lhr.life"; 
        
        const r = await fetch(`${API_BASE}/api/stats`);
        const d = await r.json();
        
        document.getElementById('val-checked').textContent = d.checked_count || 0;
        document.getElementById('val-found').textContent = d.found_count || 0;
        
        const s = document.getElementById('val-status');
        s.textContent = d.auto_on ? 'ON' : 'OFF';
        s.parentElement.className = 'stat-card status' + (d.auto_on ? ' on' : '');
        
        const vc = document.getElementById('vip-container');
        if (d.watch_list && d.watch_list.length) {
            vc.innerHTML = d.watch_list.map(n => 
                `<span class="vip-tag">@${n}<span class="del" onclick="removeVip('${n}')">&times;</span></span>`
            ).join('');
        } else {
            vc.innerHTML = '<span class="empty-msg">No VIP names</span>';
        }
        
        const fc = document.getElementById('finds-container');
        if (d.recent_finds && d.recent_finds.length) {
            fc.innerHTML = d.recent_finds.slice(-10).reverse().map(n => 
                `<div class="find-item">
                    <div class="find-info">
                        <span class="find-name">@${n}</span>
                        <span class="find-meta">${n.length} chars</span>
                    </div>
                    <span class="price-badge">$${estimatePrice(n)}</span>
                </div>`
            ).join('');
        } else {
            fc.innerHTML = '<span class="empty-msg">No finds yet...</span>';
        }
    } catch (e) {
        console.error(e);
    }
}

function sendCmd(cmd) {
    const API_BASE = "https://58ac51d2728111.lhr.life"; // Та же ссылка
    fetch(`${API_BASE}/api/command`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({command: cmd})
    }).then(() => setTimeout(refresh, 500));
}

function removeVip(name) {
    sendCmd('/remove ' + name);
}

function openModal() {
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

function submitVip() {
    const v = document.getElementById('vip-input').value.trim().replace(/@/g, '').toLowerCase();
    if (v && v.length >= 5) {
        sendCmd('/add ' + v);
        document.getElementById('vip-input').value = '';
        closeModal();
    }
}

function generateNames() {
    const gc = document.getElementById('gen-container');
    gc.innerHTML = '<div style="text-align:center;color:#999;padding:20px">Generating...</div>';
    setTimeout(() => {
        const names = [];
        for (let i = 0; i < 5; i++) {
            names.push(Array.from({length: 7}, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join(''));
        }
        gc.innerHTML = names.map(n => 
            `<div class="gen-item">
                <span class="gen-name">@${n}</span>
                <span class="price-badge">$${estimatePrice(n)}</span>
            </div>`
        ).join('');
    }, 300);
}

function buyPlan(plan) {
    alert('Payment for ' + plan + ' plan initiated! Check Telegram for payment options.');
}

function copyRefLink() {
    const el = document.getElementById('ref-link');
    el.select();
    document.execCommand('copy');
    alert('Link copied!');
}

document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', e => {
        e.preventDefault();
        const tab = el.dataset.tab;
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        el.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById('tab-' + tab).classList.add('active');
        currentTab = tab;
    });
});

refresh();
setInterval(refresh, 3000);
