// ---------- CONFIG ----------
const DATA_PATH = '../database/';

// ---------- DOM refs ----------
const subjectSelect = document.getElementById('subjectSelect');
const unitSelect = document.getElementById('unitSelect');
const numMCQsInput = document.getElementById('numMCQs');
const numSubjectiveInput = document.getElementById('numSubjective');
const generateBtn = document.getElementById('generateTestBtn');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const errorMsg = document.getElementById('errorMsg');
const contentEl = document.getElementById('content');
const unitTitle = document.getElementById('unitTitle');
const unitCounter = document.getElementById('unitCounter');
const mcqList = document.getElementById('mcqList');
const mcqSectionX = document.getElementById('mcqSection');
const subjectiveList = document.getElementById('subjectiveList');
const subjectiveSectionX = document.getElementById('subjectiveSection');
const darkToggle = document.getElementById('darkToggle');
const toggleGradientBGxID = document.getElementById('toggleGradientBGxID');

// ---------- State ----------
let currentData = null;

// ---------- Dark Mode (unchanged) ----------
function setTheme(dark) {
    document.body.classList.toggle('dark', dark);
    const icon = darkToggle.querySelector('i');
    icon.className = dark ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
}
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') setTheme(true);
else setTheme(false);
darkToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark');
    setTheme(!isDark);
});

const isGradientOn = localStorage.getItem("isGradientOn") === "true";

function toggleGradientBG() {
    const nowOn = !document.body.classList.contains("anim");
    document.body.classList[nowOn ? "add" : "remove"]("anim");
    localStorage.setItem("isGradientOn", nowOn);
    toggleGradientBGxID.classList[nowOn ? "add" : "remove"]("enabled");
}

document.body.classList[isGradientOn ? "add" : "remove"]("anim");
toggleGradientBGxID.classList[isGradientOn ? "add" : "remove"]("enabled");

// ---------- Primary color (unchanged) ----------
function change_primary_color(color) {
    document.documentElement.style.setProperty('--primary', color);
    localStorage.setItem('primary_theme_color', color);
}
if (localStorage.getItem("primary_theme_color") !== null) {
    document.documentElement.style.setProperty('--primary', localStorage.getItem('primary_theme_color'));
}

// ---------- Help popup (unchanged) ----------
function popup_help() {
    document.getElementById("help_popup_X888").classList.toggle('open');
}

// ---------- Load subject JSON ----------
async function loadSubjectData(subjectName) {
    loadingEl.style.display = 'block';
    errorEl.style.display = 'none';
    contentEl.style.display = 'none';
    unitSelect.innerHTML = '<option value="">— Select a unit —</option>';
    mcqList.innerHTML = '';
    subjectiveList.innerHTML = '';
    
    try {
        const url = `${DATA_PATH}${subjectName}.json`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load ${subjectName}.json (HTTP ${response.status})`);
        currentData = await response.json();
        
        if (currentData && currentData.all_units && currentData.all_units.length > 0) {
            const allOpt = document.createElement('option');
            allOpt.value = 'all';
            allOpt.textContent = 'All';
            unitSelect.appendChild(allOpt);
            
            currentData.all_units.forEach((unit, idx) => {
                const opt = document.createElement('option');
                opt.value = idx;
                const num = String(idx + 1).padStart(2, '0');
                opt.textContent = `${num} - ${unit.name || ''}`;
                unitSelect.appendChild(opt);
            });
            unitSelect.value = '0';
            loadingEl.style.display = 'none';
            contentEl.style.display = 'block';
        } else {
            throw new Error('No units found in the JSON file.');
        }
    } catch (err) {
        loadingEl.style.display = 'none';
        errorEl.style.display = 'flex';
        errorMsg.textContent = err.message;
        console.error(err);
        currentData = null;
    }
}

// ---------- Helper: Shuffle and pick random subset ----------
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function getRandomSubset(array, count) {
    if (!array || array.length === 0) return [];
    const shuffled = shuffleArray(array);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// ---------- Generate Test ----------
function generateTest() {
    const subject = subjectSelect.value;
    if (!subject) { alert('Please select a subject.'); return; }
    
    const unitVal = unitSelect.value;
    if (!unitVal) { alert('Please select a unit.'); return; }
    
    let mcqCount = parseInt(numMCQsInput.value, 10);
    let subjCount = parseInt(numSubjectiveInput.value, 10);
    if (isNaN(mcqCount) || mcqCount < 1) mcqCount = 1;
    if (isNaN(subjCount) || subjCount < 1) subjCount = 1;
    if (mcqCount > 70) mcqCount = 70;
    if (subjCount > 40) subjCount = 40;
    numMCQsInput.value = mcqCount;
    numSubjectiveInput.value = subjCount;
    
    if (!currentData) {
        alert('Please wait, loading subject data…');
        return;
    }
    
    let selectedMCQs = [];
    let selectedSubjective = [];
    
    if (unitVal === 'all') {
        currentData.all_units.forEach(unit => {
            if (unit.mcqs) selectedMCQs = selectedMCQs.concat(unit.mcqs);
            if (unit.subjective_questions) selectedSubjective = selectedSubjective.concat(unit.subjective_questions);
        });
    } else {
        const idx = parseInt(unitVal, 10);
        const unit = currentData.all_units[idx];
        if (!unit) { alert('Unit not found.'); return; }
        if (unit.mcqs) selectedMCQs = selectedMCQs.concat(unit.mcqs);
        if (unit.subjective_questions) selectedSubjective = selectedSubjective.concat(unit.subjective_questions);
    }
    
    const mcqLimit = Math.min(mcqCount, selectedMCQs.length);
    const subjLimit = Math.min(subjCount, selectedSubjective.length);
    const mcqSample = getRandomSubset(selectedMCQs, mcqLimit);
    const subjSample = getRandomSubset(selectedSubjective, subjLimit);
    
    renderTest(mcqSample, subjSample, unitVal);
    generateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Again';
    
    mcqSectionX.style.display = "block";
    subjectiveSectionX.style.display = "block";
    subjectiveSectionX.style.marginTop = "5rem";
}

// ---------- Render test content ----------
function renderTest(mcqs, subjectiveQuestions, unitVal) {
    mcqList.innerHTML = '';
    subjectiveList.innerHTML = '';
    contentEl.style.display = 'block';
    
    if (unitVal === 'all') {
        unitTitle.textContent = 'All Units · Test';
        unitCounter.style.display = 'none';
    } else {
        const idx = parseInt(unitVal, 10);
        const unit = currentData.all_units[idx];
        const num = String(idx + 1).padStart(2, '0');
        const total = String(currentData.all_units.length).padStart(2, '0');
        unitTitle.textContent = `${num} - ${unit.name || ''} · Test`;
        unitCounter.style.display = 'inline';
        unitCounter.textContent = `Unit ${num} of ${total}`;
    }
    
    // ---- render MCQs ----
    if (!mcqs || mcqs.length === 0) {
        const p = document.createElement('p');
        p.innerHTML = '<i class="fas fa-info-circle"></i> No MCQs available for this test.';
        mcqList.appendChild(p);
    } else {
        mcqs.forEach((mcq, i) => {
            const block = document.createElement('div');
            block.className = 'mcq-block';
            
            const qDiv = document.createElement('div');
            qDiv.className = 'mcq-question';
            const qNum = document.createElement('span');
            qNum.className = 'q-num';
            qNum.textContent = `${i + 1}.`;
            qDiv.appendChild(qNum);
            qDiv.appendChild(document.createTextNode(' ' + mcq.question));
            block.appendChild(qDiv);
            
            const optsDiv = document.createElement('div');
            optsDiv.className = 'mcq-options';
            
            mcq.options.forEach((opt, idx) => {
                const optDiv = document.createElement('div');
                optDiv.className = 'mcq-option';
                optDiv.dataset.correct = opt.correct ? 'true' : 'false';
                
                const letter = String.fromCharCode(65 + idx);
                const icon = document.createElement('span');
                icon.className = 'opt-icon';
                const iconElem = document.createElement('i');
                iconElem.className = 'far fa-circle';
                iconElem.style.color = 'var(--opt-icon-text2)';
                icon.appendChild(iconElem);
                optDiv.appendChild(icon);
                
                const optText = document.createElement('span');
                optText.className = 'opt-text';
                optText.textContent = `${letter}. ${opt.text}`;
                optDiv.appendChild(optText);
                
                optDiv.addEventListener('click', function(e) {
                    const parentBlock = this.closest('.mcq-block');
                    if (parentBlock.dataset.answered === 'true') return;
                    parentBlock.dataset.answered = 'true';
                    
                    const allOpts = parentBlock.querySelectorAll('.mcq-option');
                    allOpts.forEach(o => o.style.pointerEvents = 'none');
                    
                    const isCorrect = this.dataset.correct === 'true';
                    if (isCorrect) {
                        correct_mcq_option(this);
                    } else {
                        wrong_mcq_option(this);
                        // highlight the correct option
                        allOpts.forEach(o => {
                            if (o.dataset.correct === 'true') {
                                o.classList.add('correct');
                                const correctIcon = o.querySelector('.opt-icon i');
                                if (correctIcon) {
                                    correctIcon.className = 'fas fa-circle-check';
                                }
                            }
                        });
                    }
                });
                
                optsDiv.appendChild(optDiv);
            });
            
            block.appendChild(optsDiv);
            mcqList.appendChild(block);
        });
    }
    
    // ---- render Subjective ----
    if (!subjectiveQuestions || subjectiveQuestions.length === 0) {
        const p = document.createElement('p');
        p.innerHTML = '<i class="fas fa-info-circle"></i> No subjective questions for this test.';
        subjectiveList.appendChild(p);
    } else {
        const ul = document.createElement('ul');
        ul.className = 'subjective-list';
        subjectiveQuestions.forEach((q, i) => {
            const li = document.createElement('li');
            const qNumSpan = document.createElement('span');
            qNumSpan.className = 'q-num';
            qNumSpan.textContent = `${i + 1}.`;
            li.appendChild(qNumSpan);
            const qTextSpan = document.createElement('span');
            qTextSpan.textContent = q;
            li.appendChild(qTextSpan);
            ul.appendChild(li);
        });
        subjectiveList.appendChild(ul);
    }
}

// ---------- FEEDBACK FUNCTIONS (CSS-BASED) ----------
function correct_mcq_option(el) {
    el.classList.add('correct');
    const icon = el.querySelector('.opt-icon i');
    if (icon) {
        icon.className = 'fas fa-circle-check';
        // color is now managed by CSS (.mcq-option.correct .opt-icon i)
    }
}

function wrong_mcq_option(el) {
    el.classList.add('wrong');
    const icon = el.querySelector('.opt-icon i');
    if (icon) {
        icon.className = 'fas fa-circle-xmark';
        // color is now managed by CSS (.mcq-option.wrong .opt-icon i)
    }
}

// ---------- Event listeners ----------
subjectSelect.addEventListener('change', () => {
    generateBtn.innerHTML = '<i class="fas fa-play"></i> Generate';
    const subject = subjectSelect.value;
    if (subject) {
        loadSubjectData(subject);
    } else {
        contentEl.style.display = 'none';
        unitSelect.innerHTML = '<option value="">— Select a unit —</option>';
        mcqList.innerHTML = '';
        subjectiveList.innerHTML = '';
        currentData = null;
    }
});

unitSelect.addEventListener('change', () => {
    generateBtn.innerHTML = '<i class="fas fa-play"></i> Generate';
    mcqList.innerHTML = '';
    subjectiveList.innerHTML = '';
    contentEl.style.display = 'none';
});

generateBtn.addEventListener('click', generateTest);

// MCQs – max 70
numMCQsInput.addEventListener('blur', function() {
    let val = parseInt(this.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 70) val = 70;
    this.value = val;
});

// Subjective – max 40 (keep intact)
numSubjectiveInput.addEventListener('blur', function() {
    let val = parseInt(this.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 40) val = 40;
    this.value = val;
});

// ---------- PWA: Service Worker registration ----------
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Path resolves up to the site root, same scope/file as the main page registers
        navigator.serviceWorker.register('../sw.js')
            .then((reg) => console.log('Service worker registered:', reg.scope))
            .catch((err) => console.warn('Service worker registration failed:', err));
    });
}