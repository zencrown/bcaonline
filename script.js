// ---------- CONFIG ----------
const DATA_PATH = './database/';

// ---------- DOM refs ----------
const subjectSelect = document.getElementById('subjectSelect');
const unitSelect = document.getElementById('unitSelect');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const errorMsg = document.getElementById('errorMsg');
const contentEl = document.getElementById('content');
const unitTitle = document.getElementById('unitTitle');
const unitCounter = document.getElementById('unitCounter');
const mcqList = document.getElementById('mcqList');
const subjectiveList = document.getElementById('subjectiveList');
const darkToggle = document.getElementById('darkToggle');

// ---------- State ----------
let currentData = null;

// ---------- Dark Mode ----------
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

// ---------- Helper: Append MCQs to container ----------
function appendMCQs(mcqs, container) {
    if (!mcqs || mcqs.length === 0) {
        const p = document.createElement('p');
        const icon = document.createElement('i');
        icon.className = 'fas fa-info-circle';
        p.appendChild(icon);
        p.appendChild(document.createTextNode(' No MCQs for this unit.'));
        container.appendChild(p);
        return;
    }

    mcqs.forEach((mcq, i) => {
        const block = document.createElement('div');
        block.className = 'mcq-block';

        const qDiv = document.createElement('div');
        qDiv.className = 'mcq-question';
        const qNum = document.createElement('span');
        qNum.className = 'q-num';
        qNum.textContent = `${i + 1}.`;
        qDiv.appendChild(qNum);
        const qText = document.createTextNode(' ' + mcq.question);
        qDiv.appendChild(qText);
        block.appendChild(qDiv);

        const optsDiv = document.createElement('div');
        optsDiv.className = 'mcq-options';

        let correctLetter = '';
        mcq.options.forEach((opt, idx) => {
            if (opt.correct) {
                correctLetter = String.fromCharCode(65 + idx);
            }
        });

        mcq.options.forEach((opt, idx) => {
            const optDiv = document.createElement('div');
            optDiv.className = 'mcq-option';
            if (opt.correct) {
                optDiv.classList.add('correct');
            }

            const letter = String.fromCharCode(65 + idx);
            const icon = document.createElement('span');
            icon.className = 'opt-icon';
            const iconElem = document.createElement('i');
            iconElem.className = opt.correct ? 'fas fa-circle-check' : 'fas fa-circle';
            iconElem.style.color = opt.correct ? 'var(--primary)' : 'var(--opt-icon-text2)';
            icon.appendChild(iconElem);
            optDiv.appendChild(icon);

            const optText = document.createElement('span');
            optText.className = 'opt-text';
            optText.textContent = `${letter}. ${opt.text}`;
            optDiv.appendChild(optText);

            optsDiv.appendChild(optDiv);
        });

        if (correctLetter) {
            const hint = document.createElement('div');
            hint.style.cssText = 'margin-top:0.5rem; font-size:0.9rem; color:var(--primary); font-weight:500;';
            const hintIcon = document.createElement('i');
            hintIcon.className = 'fas fa-check-circle';
            hint.appendChild(hintIcon);
            const hintText = document.createTextNode(` Correct Answer: ${correctLetter}`);
            hint.appendChild(hintText);
            optsDiv.appendChild(hint);
        }

        block.appendChild(optsDiv);
        container.appendChild(block);
    });
}

// ---------- Helper: Append Subjective questions to container ----------
function appendSubjective(questions, container) {
    if (!questions || questions.length === 0) {
        const p = document.createElement('p');
        const icon = document.createElement('i');
        icon.className = 'fas fa-info-circle';
        p.appendChild(icon);
        p.appendChild(document.createTextNode(' No subjective questions for this unit.'));
        container.appendChild(p);
        return;
    }

    const ul = document.createElement('ul');
    ul.className = 'subjective-list';
    questions.forEach((q, i) => {
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
    container.appendChild(ul);
}

// ---------- Load Subject ----------
async function loadSubject(subjectName) {
    loadingEl.style.display = 'block';
    errorEl.style.display = 'none';
    contentEl.style.display = 'none';
    unitSelect.innerHTML = '';
    mcqList.innerHTML = '';
    subjectiveList.innerHTML = '';

    try {
        const url = `${DATA_PATH}${subjectName}.json`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to load ${subjectName}.json (HTTP ${response.status})`);
        }

        currentData = await response.json();

        if (currentData && currentData.all_units && currentData.all_units.length > 0) {
            // Add "All" option
            const allOpt = document.createElement('option');
            allOpt.value = 'all';
            allOpt.textContent = 'All';
            unitSelect.appendChild(allOpt);

            // Add unit options with zero‑padded numbers
            currentData.all_units.forEach((unit, idx) => {
                const opt = document.createElement('option');
                opt.value = idx;
                const num = String(idx + 1).padStart(2, '0');
                opt.textContent = `${num} - ${unit.name || ''}`;
                unitSelect.appendChild(opt);
            });

            // Set default to Unit 1 (index 0)
            unitSelect.value = '0';
            displayUnit('0');
        } else {
            throw new Error('No units found in the JSON file.');
        }

        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';

    } catch (err) {
        loadingEl.style.display = 'none';
        errorEl.style.display = 'flex';
        errorMsg.textContent = err.message;
        console.error(err);
    }
}

// ---------- Display Unit(s) ----------
function displayUnit(selected) {
    if (!currentData || !currentData.all_units) return;

    // Clear containers
    mcqList.innerHTML = '';
    subjectiveList.innerHTML = '';

    if (selected === 'all') {
        unitTitle.textContent = 'All Units';
        unitCounter.style.display = 'none';

        currentData.all_units.forEach((unit, idx) => {
            // Unit header with zero‑padded number
            const header = document.createElement('h3');
            header.style.cssText = 'margin-top: 2rem; color: var(--primary); border-bottom: 2px solid var(--border); padding-bottom: 0.5rem;';
            const num = String(idx + 1).padStart(2, '0');
            header.textContent = `Unit ${num}: ${unit.name || ''}`;
            mcqList.appendChild(header);

            // Append MCQs for this unit
            appendMCQs(unit.mcqs, mcqList);

            // Append Subjective for this unit (separate container)
            // Add a small separator before subjective if MCQs exist
            if (unit.mcqs && unit.mcqs.length > 0) {
                const sep = document.createElement('hr');
                sep.style.cssText = 'border: 0; border-top: 1px dashed var(--border); margin: 1rem 0;';
                subjectiveList.appendChild(sep);
            }
            appendSubjective(unit.subjective_questions, subjectiveList);
        });
    } else {
        const idx = parseInt(selected, 10);
        const unit = currentData.all_units[idx];
        const num = String(idx + 1).padStart(2, '0');
        const total = String(currentData.all_units.length).padStart(2, '0');
        unitTitle.textContent = `${num} - ${unit.name || ''}`;
        unitCounter.style.display = 'inline';
        unitCounter.textContent = `Unit ${num} of ${total}`;

        appendMCQs(unit.mcqs, mcqList);
        appendSubjective(unit.subjective_questions, subjectiveList);
    }
}

// ---------- Event Listeners ----------
subjectSelect.addEventListener('change', () => {
    const subject = subjectSelect.value;
    if (subject) {
        loadSubject(subject);
    } else {
        contentEl.style.display = 'none';
        unitSelect.innerHTML = '';
    }
});

unitSelect.addEventListener('change', () => {
    const val = unitSelect.value;
    if (val !== '') {
        displayUnit(val);
    } else {
        contentEl.style.display = 'none';
    }
});

// ---------- Primary Color Toggles ---------
function change_primary_color(color) {
    document.documentElement.style.setProperty('--primary', color);
}

// ----------- POPUP HELP ------------
function popup_help() {
	document.getElementById("help_popup_X888").classList.toggle('open');
}

// ---------- Initial Load ----------
document.addEventListener('DOMContentLoaded', () => {
    loadSubject(subjectSelect.value);
});