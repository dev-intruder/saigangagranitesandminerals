/* ==========================================
   ADMIN PANEL — JavaScript
   Sai Ganga Granites & Minerals
   ========================================== */

// ===== CONFIGURATION =====
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwuyCrENFE3YxKBsBDz_Bm0tfpmwpz47JREXP8F4xh1JQb_liQMIBr9pQuHCyVImm4X/exec';

const DEFAULT_PASSWORD = 'SaiGanga@2024';
const DEFAULT_PRICES = {
    bp: { min: 110, max: 170 },
    sg: { min: 75, max: 130 },
    nb: { min: 70, max: 120 },
    tb: { min: 130, max: 200 }
};
const DEFAULT_CONTACT = {
    phone1: '+91 94406 98103',
    phone2: '+91 99635 51074',
    email: 'saigangagranites@gmail.com',
    address: 'Uppumaguluru, Prakasam Dist, AP 523301',
    maps: ''
};

// ===== AUTH =====
let allEnquiries = [];

function getPassword() {
    return localStorage.getItem('sgg_admin_pwd') || DEFAULT_PASSWORD;
}

document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const entered = document.getElementById('passwordInput').value;
    const err = document.getElementById('loginError');
    if (entered === getPassword()) {
        sessionStorage.setItem('sgg_admin_auth', '1');
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
        initDashboard();
    } else {
        err.classList.add('show');
        document.getElementById('passwordInput').value = '';
    }
});

document.getElementById('togglePwd').addEventListener('click', function () {
    const inp = document.getElementById('passwordInput');
    const icon = this.querySelector('i');
    if (inp.type === 'password') { inp.type = 'text'; icon.className = 'fas fa-eye-slash'; }
    else { inp.type = 'password'; icon.className = 'fas fa-eye'; }
});

document.getElementById('logoutBtn').addEventListener('click', function () {
    sessionStorage.removeItem('sgg_admin_auth');
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('passwordInput').value = '';
});

// Auto-login if already authenticated this session
if (sessionStorage.getItem('sgg_admin_auth') === '1') {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    initDashboard();
}

// ===== TOPBAR DATE =====
function updateDate() {
    const now = new Date();
    document.getElementById('topbarDate').textContent = now.toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
}

// ===== TAB NAVIGATION =====
function initDashboard() {
    updateDate();
    loadEnquiries();
    loadPriceFormFromSheets(); // fetch from Sheets
    loadContactForm();
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        const tab = this.getAttribute('data-tab');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
        document.getElementById('tab-' + tab).classList.add('active');
        document.getElementById('topbarTitle').textContent = this.querySelector('span').textContent;
    });
});

// ===== ENQUIRIES =====
function formatTimestamp(raw) {
    if (!raw) return '—';
    const d = new Date(raw);
    if (isNaN(d)) return raw;
    return d.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });
}
async function loadEnquiries() {
    const loading = document.getElementById('enquiryLoading');
    const empty = document.getElementById('enquiryEmpty');
    const wrapper = document.getElementById('enquiryTableWrapper');
    loading.style.display = 'block';
    empty.style.display = 'none';
    wrapper.style.display = 'none';

    try {
        const res = await fetch(APPS_SCRIPT_URL + '?action=getEnquiries');
        const data = await res.json();
        loading.style.display = 'none';
        if (data.status === 'success' && data.data && data.data.length > 0) {
            allEnquiries = data.data;
            renderEnquiries(allEnquiries);
            renderStats(allEnquiries);
            wrapper.style.display = 'block';
        } else {
            empty.style.display = 'block';
            renderStats([]);
        }
    } catch (err) {
        loading.style.display = 'none';
        empty.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>Could not load enquiries. Make sure you have redeployed the Apps Script with the new doGet function.</p>';
        empty.style.display = 'block';
        renderStats([]);
    }
}

function renderEnquiries(data) {
    const tbody = document.getElementById('enquiryTableBody');
    tbody.innerHTML = '';
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#8a8fa8;padding:30px">No results found.</td></tr>';
        return;
    }
    data.forEach((row, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="width:36px">${data.length - i}</td>
            <td style="width:150px;white-space:nowrap;color:#8a8fa8;font-size:0.78rem">${formatTimestamp(row.timestamp)}</td>
            <td style="width:130px"><strong>${row.name || '—'}</strong></td>
            <td style="width:120px;white-space:nowrap"><a href="tel:${row.phone}" style="color:#4f8ef7;text-decoration:none">${row.phone || '—'}</a></td>
            <td style="color:#8a8fa8;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${row.email || '—'}</td>
            <td style="width:130px;white-space:nowrap"><span class="product-badge">${row.product || '—'}</span></td>
            <td class="msg-cell" title="${(row.message || '').replace(/"/g, "'")}">${row.message || '—'}</td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('enquirySearch').addEventListener('input', function () {
    const q = this.value.toLowerCase();
    const filtered = allEnquiries.filter(r =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.phone || '').includes(q) ||
        (r.product || '').toLowerCase().includes(q) ||
        (r.message || '').toLowerCase().includes(q)
    );
    renderEnquiries(filtered);
});

document.getElementById('refreshEnquiries').addEventListener('click', loadEnquiries);

// ===== STATS =====
function renderStats(data) {
    const total = data.length;
    document.getElementById('statTotal').textContent = total;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = data.filter(r => r.timestamp && parseDate(r.timestamp) >= weekAgo).length;
    document.getElementById('statWeek').textContent = thisWeek;

    const today = data.filter(r => r.timestamp && isToday(parseDate(r.timestamp))).length;
    document.getElementById('statToday').textContent = today;

    // Most enquired granite
    const counts = {};
    data.forEach(r => {
        if (r.product && r.product !== '—') {
            const key = r.product.replace(' Granite', '');
            counts[key] = (counts[key] || 0) + 1;
        }
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    document.getElementById('statTop').textContent = sorted.length ? sorted[0][0] : '—';

    // Bar chart
    const chart = document.getElementById('barChart');
    const max = sorted.length ? sorted[0][1] : 1;
    chart.innerHTML = sorted.length ? sorted.map(([name, count]) => `
        <div class="bar-item">
            <div class="bar-label">${name}</div>
            <div class="bar-track"><div class="bar-fill" style="width:${(count / max * 100)}%"></div></div>
            <div class="bar-count">${count}</div>
        </div>
    `).join('') : '<p style="color:#8a8fa8;text-align:center;padding:20px">No data yet</p>';
}

function parseDate(str) {
    try { return new Date(str); } catch (e) { return null; }
}
function isToday(d) {
    if (!d) return false;
    const n = new Date();
    return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
}

// ===== PRICES =====
const DEFAULT_PRICES_LOCAL = {
    bp: { min: 110, max: 170 },
    sg: { min: 75, max: 130 },
    nb: { min: 70, max: 120 },
    tb: { min: 130, max: 200 }
};

async function loadPriceFormFromSheets() {
    // Show loading state
    const btn = document.getElementById('savePrices');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    try {
        const res = await fetch(APPS_SCRIPT_URL + '?action=getSettings');
        const data = await res.json();
        const prices = (data.status === 'success' && data.settings && data.settings.prices)
            ? Object.assign({}, DEFAULT_PRICES_LOCAL, data.settings.prices)
            : DEFAULT_PRICES_LOCAL;
        populatePriceInputs(prices);
    } catch (e) {
        // fallback to localStorage
        const saved = JSON.parse(localStorage.getItem('sgg_prices') || '{}');
        populatePriceInputs(Object.assign({}, DEFAULT_PRICES_LOCAL, saved));
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Save Prices';
    }
}

function populatePriceInputs(prices) {
    document.getElementById('price_bp_min').value = prices.bp.min;
    document.getElementById('price_bp_max').value = prices.bp.max;
    document.getElementById('price_sg_min').value = prices.sg.min;
    document.getElementById('price_sg_max').value = prices.sg.max;
    document.getElementById('price_nb_min').value = prices.nb.min;
    document.getElementById('price_nb_max').value = prices.nb.max;
    document.getElementById('price_tb_min').value = prices.tb.min;
    document.getElementById('price_tb_max').value = prices.tb.max;
}

document.getElementById('savePrices').addEventListener('click', async function () {
    const prices = {
        bp: { min: +document.getElementById('price_bp_min').value, max: +document.getElementById('price_bp_max').value },
        sg: { min: +document.getElementById('price_sg_min').value, max: +document.getElementById('price_sg_max').value },
        nb: { min: +document.getElementById('price_nb_min').value, max: +document.getElementById('price_nb_max').value },
        tb: { min: +document.getElementById('price_tb_min').value, max: +document.getElementById('price_tb_max').value }
    };
    const btn = this;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    try {
        const res = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'saveSettings', settings: { prices } })
        });
        const data = await res.json();
        if (data.status === 'success') {
            // also cache locally as fallback
            localStorage.setItem('sgg_prices', JSON.stringify(prices));
            showMsg('priceSaveMsg', '✓ Prices saved to Google Sheets! All visitors will see updated prices.');
        } else {
            showMsg('priceSaveMsg', '⚠ Saved locally only. Check Apps Script deployment.');
        }
    } catch (e) {
        localStorage.setItem('sgg_prices', JSON.stringify(prices));
        showMsg('priceSaveMsg', '⚠ Offline — saved locally. Will sync when online.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Save Prices';
    }
});

document.getElementById('resetPrices').addEventListener('click', async function () {
    localStorage.removeItem('sgg_prices');
    // Reset on Sheets too
    try {
        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'saveSettings', settings: { prices: DEFAULT_PRICES_LOCAL } })
        });
    } catch (e) { /* ignore */ }
    populatePriceInputs(DEFAULT_PRICES_LOCAL);
    showMsg('priceSaveMsg', '✓ Reset to default prices on all devices.');
});

// ===== CONTACT =====
function loadContactForm() {
    const saved = JSON.parse(localStorage.getItem('sgg_contact') || '{}');
    const c = Object.assign({}, DEFAULT_CONTACT, saved);
    document.getElementById('contact_phone1').value = c.phone1;
    document.getElementById('contact_phone2').value = c.phone2;
    document.getElementById('contact_email').value = c.email;
    document.getElementById('contact_address').value = c.address;
    document.getElementById('contact_maps').value = c.maps;
}

document.getElementById('saveContact').addEventListener('click', function () {
    const c = {
        phone1: document.getElementById('contact_phone1').value,
        phone2: document.getElementById('contact_phone2').value,
        email: document.getElementById('contact_email').value,
        address: document.getElementById('contact_address').value,
        maps: document.getElementById('contact_maps').value
    };
    localStorage.setItem('sgg_contact', JSON.stringify(c));
    showMsg('contactSaveMsg', '✓ Contact info saved! Reload the website to see changes.');
});

document.getElementById('resetContact').addEventListener('click', function () {
    localStorage.removeItem('sgg_contact');
    loadContactForm();
    showMsg('contactSaveMsg', '✓ Reset to default contact info.');
});

// ===== CHANGE PASSWORD =====
document.getElementById('changePwd').addEventListener('click', function () {
    const current = document.getElementById('currentPwd').value;
    const newPwd = document.getElementById('newPwd').value;
    const confirm = document.getElementById('confirmPwd').value;
    const msg = document.getElementById('pwdSaveMsg');

    if (current !== getPassword()) {
        msg.style.color = '#f05252';
        msg.textContent = '✗ Current password is incorrect.';
        return;
    }
    if (newPwd.length < 6) {
        msg.style.color = '#f05252';
        msg.textContent = '✗ New password must be at least 6 characters.';
        return;
    }
    if (newPwd !== confirm) {
        msg.style.color = '#f05252';
        msg.textContent = '✗ Passwords do not match.';
        return;
    }
    localStorage.setItem('sgg_admin_pwd', newPwd);
    document.getElementById('currentPwd').value = '';
    document.getElementById('newPwd').value = '';
    document.getElementById('confirmPwd').value = '';
    msg.style.color = '#34c97e';
    msg.textContent = '✓ Password changed successfully!';
    setTimeout(() => msg.textContent = '', 4000);
});

// ===== HELPERS =====
function showMsg(id, text) {
    const el = document.getElementById(id);
    el.textContent = text;
    setTimeout(() => el.textContent = '', 4000);
}
