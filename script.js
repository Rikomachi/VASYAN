// 1. База стоимости (Осколки для E.G.O V тира, как в игре)
const upgradeCosts = {
    'baseId': {
        '1': { threads: 50, shards: 20 },
        '2': { threads: 50, shards: 20 },
        '3': { threads: 50, shards: 20 }
    },
    'id00': {
        '1': { threads: 150, shards: 30 },
        '2': { threads: 140, shards: 30 },
        '3': { threads: 100, shards: 30 }
    },
    'id000': {
        '1': { threads: 250, shards: 50 },
        '2': { threads: 230, shards: 50 },
        '3': { threads: 150, shards: 50 }
    },
    'egoZayin': { 
        '1': { threads: 190, shards: 80 }, 
        '2': { threads: 170, shards: 80 }, 
        '3': { threads: 110, shards: 80 },
        '4': { threads: 0, shards: 125 } 
    },
    'egoTeth': { 
        '1': { threads: 225, shards: 90 }, 
        '2': { threads: 200, shards: 90 }, 
        '3': { threads: 130, shards: 90 },
        '4': { threads: 0, shards: 150 }
    },
    'egoHe': { 
        '1': { threads: 260, shards: 100 }, 
        '2': { threads: 230, shards: 100 }, 
        '3': { threads: 150, shards: 100 },
        '4': { threads: 0, shards: 175 }
    },
    'egoWaw': { 
        '1': { threads: 295, shards: 150 }, 
        '2': { threads: 260, shards: 150 }, 
        '3': { threads: 170, shards: 150 },
        '4': { threads: 0, shards: 225 }
    }
};

let totalTargetShards = 0;
let totalTargetThreads = 0;
let currentSinnerId = "1";

// 2. Подключение к HTML-элементам
const cards = document.querySelectorAll('.sinner-icon');
const btnAdd = document.getElementById('addUpgradeBtn');
const typeIcons = document.querySelectorAll('.type-icon');
const levelIcons = document.querySelectorAll('.level-icon'); // Та самая строчка!
const tier4Icon = document.getElementById('tierIVIcon'); 

const bpSelect = document.getElementById('paidBp');
const mdSelect = document.getElementById('mdType');
const luxSelect = document.getElementById('luxType');

// 3. Обработчики кликов
cards.forEach(card => {
    card.addEventListener('click', function() {
        cards.forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        currentSinnerId = this.getAttribute('data-sinner');
    });
});

typeIcons.forEach(icon => {
    icon.addEventListener('click', function() {
        typeIcons.forEach(i => i.classList.remove('selected'));
        this.classList.add('selected');
        
        const selectedType = this.getAttribute('data-type');
        
        // Предохранитель: меняем видимость, только если иконка реально существует в HTML
        if (tier4Icon) { 
            if (selectedType.includes('ego')) {
                tier4Icon.style.display = 'block';
            } else {
                tier4Icon.style.display = 'none';
                
                if (tier4Icon.classList.contains('selected')) {
                    tier4Icon.classList.remove('selected');
                    const defaultLevel = document.querySelector('.level-icon[data-level="3"]');
                    if (defaultLevel) defaultLevel.classList.add('selected');
                }
            }
        }
    });
});

levelIcons.forEach(icon => {
    icon.addEventListener('click', function() {
        if (this.style.display === 'none') return; // Запрет клика по невидимому
        
        levelIcons.forEach(i => i.classList.remove('selected'));
        this.classList.add('selected');
    });
});

// 4. Корзина
let cart = []; 

btnAdd.addEventListener('click', function() {
    const selectedType = document.querySelector('.type-icon.selected');
    const selectedLevel = document.querySelector('.level-icon.selected');
    const selectedSinner = document.querySelector('.sinner-icon.selected');
    
    if (!selectedType || !selectedLevel || !selectedSinner) return; 
    
    const type = selectedType.getAttribute('data-type');
    const level = selectedLevel.getAttribute('data-level');
    const sinnerName = selectedSinner.getAttribute('alt') || "Sinner"; 
    
    const typeLabel = selectedType.getAttribute('alt') || type;
    const levelLabel = selectedLevel.getAttribute('alt') || level;

    cart.push({
        sinner: sinnerName,
        type: typeLabel,
        level: levelLabel,
        shards: upgradeCosts[type][level]?.shards || 0, // Защита от пустых значений
        threads: upgradeCosts[type][level]?.threads || 0
    });
    
    updateCartUI();
});

function updateCartUI() {
    const cartList = document.getElementById('cartList');
    if (!cartList) return;
    
    cartList.innerHTML = ''; 
    totalTargetShards = 0;
    totalTargetThreads = 0;

    cart.forEach((item, index) => {
        totalTargetShards += item.shards;
        totalTargetThreads += item.threads;

        const li = document.createElement('li');
        li.className = 'cart-item';
        
        const textSpan = document.createElement('span');
        textSpan.innerHTML = `<strong style="color: #fff;">${item.sinner}</strong> — ${item.type} (${item.level})`;
        
        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.innerText = 'X';
        delBtn.addEventListener('click', () => {
            cart.splice(index, 1);
            updateCartUI();
        });

        li.appendChild(textSpan);
        li.appendChild(delBtn);
        cartList.appendChild(li);
    });

    calculateGrind();
    saveState();
}

// 5. Калькулятор
function calculateGrind() {
    if (!bpSelect || !mdSelect || !luxSelect) return;

    const hasPaidBp = parseInt(bpSelect.value);
    const mdType = parseInt(mdSelect.value);
    const luxType = parseInt(luxSelect.value);

    let bpLevelsPerRun = 0;
    let mdModuleCost = 5;
    const shardsPerBpLevel = hasPaidBp ? 6 : 2;

    if (mdType === 1) bpLevelsPerRun = 3; 
    else if (mdType === 2) bpLevelsPerRun = 5; 
    else if (mdType === 3) { bpLevelsPerRun = 22.5; mdModuleCost = 18; }

    const shardsPerRun = bpLevelsPerRun * shardsPerBpLevel;
    const mdRunsNeeded = totalTargetShards > 0 ? Math.ceil(totalTargetShards / shardsPerRun) : 0;
    const mdTotalModules = mdRunsNeeded * mdModuleCost;

    let threadsPerRun = 6;
    let luxModuleCost = 2;

    if (luxType === 1) { threadsPerRun = 12; luxModuleCost = 2; }
    else if (luxType === 2) { threadsPerRun = 18; luxModuleCost = 4; }
    else if (luxType === 3) { threadsPerRun = 6; luxModuleCost = 2; }
    else if (luxType === 4) { threadsPerRun = 9; luxModuleCost = 4; }

    const luxRunsNeeded = totalTargetThreads > 0 ? Math.ceil(totalTargetThreads / threadsPerRun) : 0;
    const luxTotalModules = luxRunsNeeded * luxModuleCost;

    document.getElementById('outShards').innerText = totalTargetShards;
    document.getElementById('outThreads').innerText = totalTargetThreads;
    document.getElementById('outRuns').innerText = mdRunsNeeded;
    document.getElementById('outLuxRuns').innerText = luxRunsNeeded;
    document.getElementById('outModules').innerText = mdTotalModules + luxTotalModules; 
}

function onSettingsChange() {
    saveState();
    calculateGrind();
}

if (bpSelect) bpSelect.addEventListener('change', onSettingsChange);
if (mdSelect) mdSelect.addEventListener('change', onSettingsChange);
if (luxSelect) luxSelect.addEventListener('change', onSettingsChange);

// 6. Сейв-система
function saveState() {
    localStorage.setItem('caio_cart', JSON.stringify(cart));
    if (bpSelect) localStorage.setItem('caio_bp', bpSelect.value);
    if (mdSelect) localStorage.setItem('caio_md', mdSelect.value);
    if (luxSelect) localStorage.setItem('caio_lux', luxSelect.value);
}

function loadState() {
    const savedCart = localStorage.getItem('caio_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart); 
    }
    
    if (localStorage.getItem('caio_bp') && bpSelect) bpSelect.value = localStorage.getItem('caio_bp');
    if (localStorage.getItem('caio_md') && mdSelect) mdSelect.value = localStorage.getItem('caio_md');
    if (localStorage.getItem('caio_lux') && luxSelect) luxSelect.value = localStorage.getItem('caio_lux');
    
    updateCartUI(); 
}

loadState();

// Инициализация при запуске
if (cards.length > 0) cards[0].click();
if (typeIcons.length > 0) typeIcons[0].click();
if (levelIcons.length > 0) levelIcons[0].click();