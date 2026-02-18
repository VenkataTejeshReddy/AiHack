const state = {
    currentStep: 1,
    totalSteps: 5,
    data: {
        history: [],
        symptoms: []
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // --- SHARED LOGIC (All Pages) ---
    const themeBtn = document.getElementById('theme-btn');

    // Auth Check on Load
    checkAuth();

    // Daily Tip (Landing Page Only)
    loadDailyTip();

    // Theme Toggle Logic
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeBtn) updateThemeIcon(savedTheme);

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    // --- AUTH LOGIC ---
    function checkAuth() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const loginBtns = document.querySelectorAll('a[href="login.html"]'); // Target all login links

        if (user) {
            loginBtns.forEach(btn => {
                btn.textContent = `Hi, ${user.name.split(' ')[0]}`;
                btn.href = '#'; // Or a profile page
                btn.classList.add('active-user');
                // Optional: Add logout listener
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (confirm("Log out?")) {
                        localStorage.removeItem('currentUser');
                        window.location.reload();
                    }
                });
            });
        }
    }

    function loadDailyTip() {
        const tipEl = document.getElementById('daily-tip-text');
        if (!tipEl) return;

        const tips = [
            "Drink at least 8 glasses of water today.",
            "Take a 10-minute walk after lunch.",
            "Reduce screen time an hour before bed.",
            "Eat a fruit instead of a sugary snack.",
            "Did you know? Laughing boosts heart health!"
        ];

        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        tipEl.textContent = randomTip;
    }

    // --- LOGIN PAGE SPECIFIC ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const toggleBtn = document.getElementById('auth-toggle-btn');
        const nameGroup = document.getElementById('name-group');
        const title = document.getElementById('auth-title');
        const submitBtn = document.getElementById('auth-submit-btn');
        const switchText = document.getElementById('auth-switch-text');
        let isSignUp = false;

        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            isSignUp = !isSignUp;
            if (isSignUp) {
                nameGroup.classList.remove('hidden');
                title.textContent = "Create Account";
                submitBtn.textContent = "Sign Up";
                switchText.textContent = "Already have an account?";
                toggleBtn.textContent = "Sign In";
                document.getElementById('name').required = true;
            } else {
                nameGroup.classList.add('hidden');
                title.textContent = "Welcome Back";
                submitBtn.textContent = "Sign In";
                switchText.textContent = "Don't have an account?";
                toggleBtn.textContent = "Sign Up";
                document.getElementById('name').required = false;
            }
        });

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const name = isSignUp ? document.getElementById('name').value : "User"; // Default name if signing in mocking existing user

            // Mock Auth Success
            const user = { name: name, email: email };
            localStorage.setItem('currentUser', JSON.stringify(user));

            // Redirect
            window.location.href = 'index.html';
        });
    }

    // --- ASSESSMENT PAGE LOGIC ---
    if (document.getElementById('assessment-form')) {
        initAssessment();
    }

    function initAssessment() {
        // DOM Elements
        const heroSection = document.getElementById('hero');
        const assessmentSection = document.getElementById('assessment');
        const resultsSection = document.getElementById('results');
        const startBtn = document.getElementById('start-btn');
        const restartBtn = document.getElementById('restart-btn');
        const form = document.getElementById('assessment-form');
        const nextBtns = document.querySelectorAll('.btn-next');
        const prevBtns = document.querySelectorAll('.btn-prev');
        const progressFill = document.querySelector('.progress-fill');
        const stepIndicator = document.querySelector('.step-indicator');

        // Initial setup
        updateProgress();

        // Navigation Event Listeners
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                heroSection.classList.add('hidden');
                assessmentSection.classList.remove('hidden');
                updateProgress();
            });
        }

        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                window.location.reload();
            });
        }

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

            // Add exit animation class
            currentStepEl.classList.add('exiting');
            currentStepEl.classList.remove('active');

            // Wait for animation to finish before hiding completely
            setTimeout(() => {
                currentStepEl.classList.remove('exiting');
            }, 500);

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
            // Basic Fields (Safety check for existence)
            if (document.getElementById('age')) state.data.age = document.getElementById('age').value;
            if (document.getElementById('gender')) state.data.gender = document.getElementById('gender').value;
            if (document.getElementById('bmi')) state.data.bmi = document.getElementById('bmi').value;
            if (document.getElementById('bp')) state.data.bp = document.getElementById('bp').value;

            // New Card Inputs for Lifestyle
            state.data.activity = document.querySelector('input[name="activity"]:checked')?.value || 'moderate';
            state.data.smoke = document.querySelector('input[name="smoke"]:checked')?.value || 'no';

            // Checkboxes (History & Symptoms)
            state.data.history = Array.from(document.querySelectorAll('input[name="history"]:checked')).map(el => el.value);
            state.data.symptoms = Array.from(document.querySelectorAll('input[name="symptom"]:checked')).map(el => el.value);
        }

        function calculateAndShowResults() {
            assessmentSection.classList.add('hidden');
            resultsSection.classList.remove('hidden');

            // Simulate AI Processing
            const messages = ["Analyzing Vitals...", "Checking Medical History...", "Correlating Symptoms...", "Generating Action Plan..."];
            const riskDescEl = document.getElementById('risk-description');

            let i = 0;
            const interval = setInterval(() => {
                if (i < messages.length) {
                    riskDescEl.textContent = messages[i];
                    i++;
                } else {
                    clearInterval(interval);
                }
            }, 500);

            setTimeout(() => {
                const result = calculateRisk(state.data);
                displayResults(result);
            }, 2500);
        }
    }

    /**
     * ENHANCED MOCK AI ALGORITHM & INSIGHTS
     */
    function calculateRisk(data) {
        let score = 10;
        const recommendations = [];
        const positives = [];
        const actionPlan = [];

        let cardiacRisk = 15;
        let metabolicRisk = 15;

        const age = parseInt(data.age) || 30;
        const bmi = parseFloat(data.bmi) || 22;
        const bp = parseInt(data.bp) || 120;

        // --- 1. Basic Vitals Analysis ---
        if (age < 40) positives.push("Young Age Group");

        if (bmi > 30) {
            score += 20;
            metabolicRisk += 30;
            recommendations.push("BMI indicates obesity range.");
            actionPlan.push({ type: 'urgent', text: "Start a calorie-deficit diet plan." });
            actionPlan.push({ type: 'longterm', text: "Target 5-10% weight loss in 6 months." });
        } else if (bmi >= 18.5 && bmi <= 24.9) {
            positives.push("Healthy BMI");
        }

        if (bp > 140) {
            score += 25;
            cardiacRisk += 30;
            recommendations.push("High Blood Pressure detected.");
            actionPlan.push({ type: 'urgent', text: "Monitor BP twice daily for a week." });
        } else {
            positives.push("Normal Blood Pressure");
        }

        // --- 2. Medical History Impact ---
        if (data.history.includes('diabetes')) {
            score += 20;
            metabolicRisk += 40;
            actionPlan.push({ type: 'regular', text: "Quarterly HbA1c tests." });
        }
        if (data.history.includes('heart_disease')) {
            score += 25;
            cardiacRisk += 30;
        }

        // --- 3. Symptom Correlation ---
        // Heart Check
        const heartSymptoms = ['chest_pain', 'shortness_of_breath', 'dizziness', 'fatigue'];
        const userHeartSymptoms = data.symptoms.filter(s => heartSymptoms.includes(s));

        if (userHeartSymptoms.length >= 2) {
            score += 40;
            cardiacRisk += 50;
            recommendations.unshift("⚠️ Multiple cardiac symptoms reported.");
            actionPlan.unshift({ type: 'urgent', text: "Consult a Cardiologist IMMEDIATELY." });
        }

        // Diabetes Check
        const diabeticSymptoms = ['thirst', 'urination', 'fatigue'];
        const userDiabeticSymptoms = data.symptoms.filter(s => diabeticSymptoms.includes(s));

        if (userDiabeticSymptoms.length >= 2 && !data.history.includes('diabetes')) {
            score += 25;
            metabolicRisk += 30;
            recommendations.push("Symptoms suggest potential diabetes.");
            actionPlan.push({ type: 'urgent', text: "Schedule a Fasting Blood Sugar test." });
        }

        // --- 4. Lifestyle ---
        if (data.smoke === 'yes') {
            score += 20;
            cardiacRisk += 20;
            actionPlan.push({ type: 'urgent', text: "Begin smoking cessation program." });
        } else {
            positives.push("Non-Smoker");
        }

        if (data.activity === 'sedentary') {
            score += 10;
            metabolicRisk += 10;
            actionPlan.push({ type: 'regular', text: "Walk 30 mins daily." });
        } else if (data.activity === 'active') {
            positives.push("Active Lifestyle");
        }

        // Fill gaps if empty
        if (recommendations.length === 0) recommendations.push("Maintain your current healthy habits.");
        if (actionPlan.length === 0) actionPlan.push({ type: 'regular', text: "Routine annual checkup." });

        return {
            score: Math.min(Math.max(score, 0), 99),
            cardiacScore: Math.min(Math.max(cardiacRisk, 0), 100),
            metabolicScore: Math.min(Math.max(metabolicRisk, 0), 100),
            recommendations: Array.from(new Set(recommendations)).slice(0, 4),
            positives: positives.slice(0, 4),
            actionPlan: actionPlan.slice(0, 4)
        };
    }

    function displayResults(result) {
        const { score, cardiacScore, metabolicScore, recommendations, positives, actionPlan } = result;

        const riskScoreEl = document.getElementById('risk-score');
        const riskLevelEl = document.getElementById('risk-level');
        const riskDescEl = document.getElementById('risk-description');
        const listEl = document.getElementById('recommendation-list');
        const ringCircle = document.querySelector('.progress-ring__circle');

        // New Elements
        const markersEl = document.getElementById('positive-markers');
        const actionPlanEl = document.getElementById('action-timeline');

        // Insight Bars
        const cardiacBar = document.getElementById('cardiac-bar');
        const metabolicBar = document.getElementById('metabolic-bar');
        const cardiacScoreEl = document.getElementById('cardiac-score');
        const metabolicScoreEl = document.getElementById('metabolic-score');

        // Determine Level
        let level = 'Low Risk';
        let color = 'var(--success)';
        let desc = 'Great job! Your health metrics are stable.';

        if (score >= 40) {
            level = 'Moderate Risk';
            color = 'var(--warning)';
            desc = 'Attention needed. See action plan.';
        }
        if (score >= 75) {
            level = 'High Risk';
            color = 'var(--danger)';
            desc = 'Immediate action required.';
        }

        // UI Updates
        riskLevelEl.textContent = level;
        riskLevelEl.style.color = color;
        riskDescEl.textContent = desc;

        // Render Lists
        listEl.innerHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');

        // Render Positives
        if (positives.length > 0) {
            markersEl.innerHTML = positives.map(p => `
                <div class="marker-pill">
                    <span>✓</span> ${p}
                </div>
            `).join('');
        } else {
            markersEl.innerHTML = '<span style="color:var(--text-muted); font-size:0.9rem;">No specific strengths detected.</span>';
        }

        // Render Action Plan (with Doctor Button)
        actionPlanEl.innerHTML = actionPlan.map(action => {
            let icon = '📅'; // Default regular
            let extraBtn = '';

            if (action.type === 'urgent') {
                icon = '🚨';
                extraBtn = `<button class="btn-sm-action" onclick="window.open('https://www.google.com/search?q=cardiologist+near+me', '_blank')">Find Specialist</button>`;
            }
            if (action.type === 'longterm') icon = '🎯';

            return `
            <div class="timeline-item">
                <div class="timeline-icon">${icon}</div>
                <div class="timeline-content">
                    <h4>${action.text}</h4>
                    <p>${action.type === 'urgent' ? 'Do this immediately' : 'Maintain consistency'}</p>
                    ${extraBtn}
                </div>
            </div>`;
        }).join('');

        // Update Insights
        cardiacBar.style.width = `${cardiacScore}%`;
        metabolicBar.style.width = `${metabolicScore}%`;
        cardiacScoreEl.textContent = `${cardiacScore}%`;
        metabolicScoreEl.textContent = `${metabolicScore}%`;

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
