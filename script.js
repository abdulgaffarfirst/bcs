// গ্লোবাল ভেরিয়েবল ডিক্লারেশন
let currentQuestions = []; // বর্তমান ক্যাটাগরির প্রশ্নগুলো
let userAnswers = {}; // ইউজারের দেওয়া উত্তরগুলো
let currentPage = 1; // বর্তমান পৃষ্ঠা নম্বর
const perPage = 15; // প্রতি পৃষ্ঠায় প্রশ্ন সংখ্যা
let totalTime = 0; // মোট সময় (সেকেন্ডে)
let globalTimer; // গ্লোবাল টাইমার রেফারেন্স

/**
 * ক্যাটাগরি লোড করার ফাংশন
 * @param {string} category - প্রশ্নের ক্যাটাগরি (bangla, english, math, gk)
 */
function loadCategory(category) {
  // UI আপডেট
  document.getElementById('category-menu').style.display = 'none';
  document.getElementById('quiz-section').style.display = 'block';
  document.getElementById('result').innerHTML = '';

  // প্রশ্ন লোড এবং র্যান্ডমাইজ
  currentQuestions = shuffleArray(allQuestions.filter(q => q.category === category));
  
  // স্টেট রিসেট
  userAnswers = {};
  currentPage = 1;
  totalTime = currentQuestions.length * 25; // প্রতি প্রশ্নের জন্য 25 সেকেন্ড

  // UI ইনিশিয়ালাইজ
  renderQuestions();
  renderPagination();
  startGlobalTimer();
}

/**
 * গ্লোবাল টাইমার শুরু করার ফাংশন
 */
function startGlobalTimer() {
  if (globalTimer) clearInterval(globalTimer);
  updateGlobalTimer();
  
  globalTimer = setInterval(() => {
    totalTime--;
    updateGlobalTimer();
    
    if (totalTime <= 0) {
      clearInterval(globalTimer);
      alert("সময় শেষ! আপনার উত্তর স্বয়ংক্রিয়ভাবে সাবমিট করা হয়েছে।");
      submitQuiz();
    }
  }, 1000);
}

/**
 * টাইমার আপডেট করার ফাংশন
 */
function updateGlobalTimer() {
  const minutes = Math.floor(totalTime / 60);
  const seconds = totalTime % 60;
  document.getElementById('global-timer').textContent = 
    `⏳ মোট সময় বাকি: ${minutes} মিনিট ${seconds} সেকেন্ড`;
}

/**
 * প্রশ্ন রেন্ডার করার ফাংশন
 */
function renderQuestions() {
  const container = document.getElementById('quiz-container');
  container.innerHTML = '';

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const questionsToShow = currentQuestions.slice(start, end);

  questionsToShow.forEach((q, index) => {
    const realIndex = start + index;
    const selectedOption = userAnswers[realIndex];
    const isAnswered = selectedOption !== undefined;

    const questionHtml = `
      <div class="question">
        <p>${realIndex + 1}. ${q.question}</p>
        ${q.options.map((opt, j) => {
          const isUserAnswer = isAnswered && j === selectedOption;
          const isCorrectAnswer = j === q.answer;
          
          // অপশন ক্লাস নির্ধারণ
          let optionClass = '';
          if (isAnswered) {
            if (isUserAnswer && isCorrectAnswer) {
              optionClass = 'correct-answer';
            } else if (isUserAnswer) {
              optionClass = 'wrong-answer';
            } else if (isCorrectAnswer) {
              optionClass = 'correct-answer';
            } else {
              optionClass = 'disabled-option';
            }
          }
          
          return `
            <label class="option-label ${optionClass}" 
                   onclick="selectAnswer(${realIndex}, ${j})">
              <span class="option-letter">${String.fromCharCode(2433 + j)}</span>
              <span class="option-text">${opt}</span>
            </label>
          `;
        }).join('')}
      </div>
    `;
    container.innerHTML += questionHtml;
  });

  updateProgressBar();
}

/**
 * উত্তর সিলেক্ট করার ফাংশন
 * @param {number} questionIndex - প্রশ্নের ইন্ডেক্স
 * @param {number} optionIndex - অপশনের ইন্ডেক্স
 */
function selectAnswer(questionIndex, optionIndex) {
  if (userAnswers[questionIndex] === undefined) {
    userAnswers[questionIndex] = optionIndex;
    renderQuestions();
  }
}

/**
 * পেজিনেশন রেন্ডার করার ফাংশন
 */
function renderPagination() {
  const totalPages = Math.ceil(currentQuestions.length / perPage);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';
  
  for (let i = 1; i <= totalPages; i++) {
    const active = i === currentPage ? 'active' : '';
    pagination.innerHTML += `<button class="${active}" onclick="gotoPage(${i})">${i}</button>`;
  }
}

/**
 * নির্দিষ্ট পেজে যাওয়ার ফাংশন
 * @param {number} page - টার্গেট পেজ নম্বর
 */
function gotoPage(page) {
  currentPage = page;
  renderQuestions();
  renderPagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * প্রগ্রেস বার আপডেট করার ফাংশন
 */
function updateProgressBar() {
  const total = currentQuestions.length;
  const answered = Object.keys(userAnswers).length;
  const progress = (answered / total) * 100;
  document.getElementById('progress-bar').style.width = `${progress}%`;
}

/**
 * কুইজ সাবমিট করার ফাংশন
 */
function submitQuiz() {
  clearInterval(globalTimer);
  document.getElementById('quiz-section').style.display = 'none';

  // ফলাফল ক্যালকুলেশন
  let correct = 0, incorrect = 0, unanswered = 0;
  window.correctQuestions = [];
  window.incorrectQuestions = [];
  window.unansweredQuestions = [];

  currentQuestions.forEach((q, i) => {
    if (userAnswers[i] === undefined) {
      unanswered++;
      window.unansweredQuestions.push({ index: i, question: q });
    } else if (userAnswers[i] === q.answer) {
      correct++;
      window.correctQuestions.push({ index: i, question: q });
    } else {
      incorrect++;
      window.incorrectQuestions.push({ index: i, question: q });
    }
  });

  // ফলাফল UI
  document.getElementById('result').innerHTML = `
    <h3>ফলাফল</h3>
    <p>মোট প্রশ্ন: ${currentQuestions.length}</p>
    
    <div class="result-item">
      <p>সঠিক উত্তর: ${correct} 
        <button class="toggle-btn" onclick="toggleQuestions('correct')">সঠিক উত্তর গুলো দেখুন</button>
      </p>
      <div id="correct-questions" class="questions-container" style="display:none;"></div>
    </div>
    
    <div class="result-item">
      <p>ভুল উত্তর: ${incorrect} 
        <button class="toggle-btn" onclick="toggleQuestions('incorrect')">ভুল উত্তর গুলো দেখুন</button>
      </p>
      <div id="incorrect-questions" class="questions-container" style="display:none;"></div>
    </div>
    
    <div class="result-item">
      <p>উত্তর দেয়নি: ${unanswered} 
        <button class="toggle-btn" onclick="toggleQuestions('unanswered')">উত্তর না দেওয়া গুলো দেখুন</button>
      </p>
      <div id="unanswered-questions" class="questions-container" style="display:none;"></div>
    </div>
    
    <button onclick="location.reload()" class="restart-btn">আবার শুরু করুন</button>
  `;
}

/**
 * প্রশ্ন টগল করার ফাংশন (সঠিক/ভুল/অউত্তরিত)
 * @param {string} type - প্রশ্নের টাইপ (correct/incorrect/unanswered)
 */
function toggleQuestions(type) {
  // সব কন্টেইনার বন্ধ করুন
  document.querySelectorAll('.questions-container').forEach(c => c.style.display = 'none');
  
  const container = document.getElementById(`${type}-questions`);
  if (container.style.display === 'block') {
    container.style.display = 'none';
    return;
  }

  container.innerHTML = '';
  window[`${type}Questions`].forEach(({ index, question }) => {
    container.innerHTML += `
      <div class="question ${type}-item">
        <p><strong>${index + 1}. ${question.question}</strong></p>
        <p>সঠিক উত্তর: ${question.options[question.answer]}</p>
        ${type === 'incorrect' ? `<p>আপনার উত্তর: ${question.options[userAnswers[index]]}</p>` : ''}
      </div>
    `;
  });
  
  container.style.display = 'block';
}

/**
 * অ্যারে র্যান্ডমাইজ করার ফাংশন
 * @param {Array} array - ইনপুট অ্যারে
 * @returns {Array} র্যান্ডমাইজড অ্যারে
 */
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// প্রশ্ন রেন্ডার করার ফাংশন
function renderQuestions() {
  const container = document.getElementById('quiz-container');
  container.innerHTML = '';

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const questionsToShow = currentQuestions.slice(start, end);

  questionsToShow.forEach((q, index) => {
    const realIndex = start + index;
    const selectedOption = userAnswers[realIndex];
    const isAnswered = selectedOption !== undefined;
    const optionLetters = ['ক', 'খ', 'গ', 'ঘ']; // বাংলা অপশন লেটার

    const questionHtml = `
      <div class="question">
        <p>${realIndex + 1}. ${q.question}</p>
        ${q.options.map((opt, j) => {
          const isSelected = isAnswered && j === selectedOption;
          const isCorrect = j === q.answer;
          
          // অপশন ক্লাস নির্ধারণ
          let optionClass = '';
          if (isAnswered) {
            if (isSelected) {
              optionClass = 'selected-answer'; // ইউজারের নির্বাচিত উত্তর
            } else {
              optionClass = 'disabled-option'; // বাকি অপশনগুলো
            }
          }
          
          return `
            <label class="option-label ${optionClass}" 
                   onclick="selectAnswer(${realIndex}, ${j})">
              <span class="option-letter">${optionLetters[j]}</span>
              <span class="option-text">${opt}</span>
            </label>
          `;
        }).join('')}
      </div>
    `;
    container.innerHTML += questionHtml;
  });

  updateProgressBar();
}