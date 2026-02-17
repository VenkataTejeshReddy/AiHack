const state = {
    currentStep: 1,
    totalSteps: 5,
    data: {
        history: [],
        symptoms: []
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const heroSection = document.getElementById('hero');
    const assessmentSection = document.getElementById('assessment');
    const resultsSection = document.getElementById('results');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const themeBtn = document.getElementById('theme-btn');
    const form = document.getElementById('assessment-form');
    const nextBtns = document.querySelectorAll('.btn-next');
    const prevBtns = document.querySelectorAll('.btn-prev');
    const progressFill = document.querySelector('.progress-fill');
    const stepIndicator = document.querySelector('.step-indicator');

    // Theme Toggle Logic
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    // Navigation Event Listeners
    startBtn.addEventListener('click', () => {
        heroSection.classList.add('hidden');
        assessmentSection.classList.remove('hidden');
        updateProgress();
    });

    restartBtn.addEventListener('click', () => {
        resetApp();
    });

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(state.currentStep)) {
                changeStep(1);
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => changeStep(-1));
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveFormData();
        calculateAndShowResults();
    });

    // Functions
    function changeStep(direction) {
        saveFormData();

        const currentStepEl = document.querySelector(`.form-step[data-step="${state.currentStep}"]`);
        currentStepEl.classList.remove('active');

        state.currentStep += direction;

        const nextStepEl = document.querySelector(`.form-step[data-step="${state.currentStep}"]`);
        nextStepEl.classList.add('active');

        updateProgress();
    }

    function updateProgress() {
        const percent = ((state.currentStep - 1) / (state.totalSteps - 1)) * 100;
        progressFill.style.width = `${percent}%`;
        stepIndicator.textContent = `Step ${state.currentStep} of ${state.totalSteps}`;
    }

    function validateStep(step) {
        const currentStepEl = document.querySelector(`.form-step[data-step="${step}"]`);
        const inputs = currentStepEl.querySelectorAll('input[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value) {
                isValid = false;
                input.style.borderColor = 'var(--danger)';
            } else {
                input.style.borderColor = 'transparent';
            }
        });

        return isValid;
    }

    function saveFormData() {
        const formData = new FormData(form);

        // Basic Fields
        state.data.age = document.getElementById('age').value;
        state.data.gender = document.getElementById('gender').value;
        state.data.bmi = document.getElementById('bmi').value;
        state.data.bp = document.getElementById('bp').value;
        state.data.activity = document.getElementById('activity').value;
        state.data.smoke = document.querySelector('input[name="smoke"]:checked')?.value;

        // Checkboxes (History & Symptoms)
        state.data.history = Array.from(document.querySelectorAll('input[name="history"]:checked')).map(el => el.value);
        state.data.symptoms = Array.from(document.querySelectorAll('input[name="symptom"]:checked')).map(el => el.value);
    }

    function resetApp() {
        resultsSection.classList.add('hidden');
        heroSection.classList.remove('hidden');
        state.currentStep = 1;
        state.data = { history: [], symptoms: [] };
        form.reset();

        document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
        document.querySelector('.form-step[data-step="1"]').classList.add('active');
    }

    function calculateAndShowResults() {
        assessmentSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');

        // Simulate AI Processing
        const messages = ["Analyzing Vitals...", "Checking Medical History...", "Correlating Symptoms...", "Finalizing Prediction..."];
        const riskDescEl = document.getElementById('risk-description');

        let i = 0;
        const interval = setInterval(() => {
            if (i < messages.length) {
                riskDescEl.textContent = messages[i];
                i++;
            } else {
                clearInterval(interval);
            }
        }, 400);

        setTimeout(() => {
            const result = calculateRisk(state.data);
            displayResults(result);
        }, 2000);
    }

    /**
     * ENHANCED MOCK AI ALGORITHM
     */
    function calculateRisk(data) {
        let score = 10;
        const recommendations = [];
        let riskFactors = [];

        const age = parseInt(data.age) || 30;
        const bmi = parseFloat(data.bmi) || 22;
        const bp = parseInt(data.bp) || 120;

        // --- 1. Basic Vitals Analysis ---
        if (age > 50) score += 15;
        if (bmi > 30) {
            score += 20;
            riskFactors.push("High BMI (Obesity)");
            recommendations.push("Adopt a calorie-deficit diet to manage weight.");
        }
        if (bp > 140) {
            score += 25;
            riskFactors.push("Hypertension");
            recommendations.push("Monitor blood pressure daily and reduce sodium intake.");
        }

        // --- 2. Medical History Impact ---
        if (data.history.includes('diabetes')) {
            score += 20;
            riskFactors.push("History of Diabetes");
            recommendations.push("Strictly monitor blood sugar levels.");
        }
        if (data.history.includes('heart_disease')) {
            score += 25;
            riskFactors.push("Family History of Heart Disease");
            recommendations.push("Schedule regular cardiac screenings.");
        }

        // --- 3. Symptom Correlation (The "AI" Part) ---

        // Heart Check
        const heartSymptoms = ['chest_pain', 'shortness_of_breath', 'dizziness', 'fatigue'];
        const userHeartSymptoms = data.symptoms.filter(s => heartSymptoms.includes(s));

        if (userHeartSymptoms.length >= 2) {
            score += 40;
            riskFactors.push("Multiple Cardiac Symptoms");
            recommendations.unshift("⚠️ URGENT: Consult a cardiologist. Your symptoms (Chest Pain/Breathlessness) require immediate attention.");
        } else if (data.symptoms.includes('chest_pain')) {
            score += 30;
            recommendations.unshift("Investigate chest pain with a professional.");
        }

        // Diabetes Check
        const diabeticSymptoms = ['thirst', 'urination', 'fatigue'];
        const userDiabeticSymptoms = data.symptoms.filter(s => diabeticSymptoms.includes(s));

        if (userDiabeticSymptoms.length >= 2) {
            score += 25;
            if (!data.history.includes('diabetes')) {
                riskFactors.push("Potential Diabetes Signs");
                recommendations.push("Screen for Diabetes (Fasting Blood Sugar test recommended).");
            }
        }

        // --- 4. Lifestyle ---
        if (data.smoke === 'yes') {
            score += 20;
            recommendations.push("Stop smoking immediately to reduce heart risk.");
        }
        if (data.activity === 'sedentary') {
            score += 10;
            recommendations.push("Aim for at least 30 minutes of moderate activity daily.");
        }

        return {
            score: Math.min(Math.max(score, 0), 99),
            recommendations: Array.from(new Set(recommendations)).slice(0, 5) // Dedupe and limit
        };
    }

    function displayResults(result) {
        const { score, recommendations } = result;
        const riskScoreEl = document.getElementById('risk-score');
        const riskLevelEl = document.getElementById('risk-level');
        const riskDescEl = document.getElementById('risk-description');
        const listEl = document.getElementById('recommendation-list');
        const ringCircle = document.querySelector('.progress-ring__circle');

        // Determine Level
        let level = 'Low Risk';
        let color = 'var(--success)';
        let desc = 'Great job! Your health metrics are stable.';

        if (score >= 40) {
            level = 'Moderate Risk';
            color = 'var(--warning)';
            desc = 'Attention needed. Some risk factors were identified.';
        }
        if (score >= 75) {
            level = 'High Risk';
            color = 'var(--danger)';
            desc = 'Action required. Significant health risks detected.';
        }

        // UI Updates
        riskLevelEl.textContent = level;
        riskLevelEl.style.color = color;
        riskDescEl.textContent = desc;
        listEl.innerHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');

        // Animation
        const radius = ringCircle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (score / 100) * circumference;

        ringCircle.style.strokeDashoffset = offset;
        ringCircle.style.stroke = color;

        let currentScore = 0;
        const interval = setInterval(() => {
            if (currentScore < score) {
                currentScore++;
                riskScoreEl.textContent = currentScore;
            } else {
                clearInterval(interval);
            }
        }, 20);
    }
});
