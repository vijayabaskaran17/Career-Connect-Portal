import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const QUANT_TOPICS = [
  {
    id: 'speed_time',
    name: 'Speed, Distance & Time',
    questions: [
      {
        id: 'q1',
        q: 'If a train 180m long passes a pole in 12 seconds, what is the speed of the train in km/hr?',
        options: ['45 km/hr', '54 km/hr', '60 km/hr', '72 km/hr'],
        answer: '54 km/hr',
        explanation: 'Speed = Distance / Time = 180m / 12s = 15 m/s. Convert to km/hr: 15 * (18/5) = 54 km/hr.',
      },
      {
        id: 'q2',
        q: 'A train 240 meters long crosses a platform 160 meters long in 20 seconds. What is the speed of the train?',
        options: ['15 m/s', '20 m/s', '25 m/s', '30 m/s'],
        answer: '20 m/s',
        explanation: 'Total Distance = Train Length + Platform Length = 240 + 160 = 400m. Speed = 400 / 20 = 20 m/s.',
      },
    ],
  },
  {
    id: 'work_time',
    name: 'Work & Time',
    questions: [
      {
        id: 'q3',
        q: 'A can complete a task in 10 days and B in 15 days. How long will they take working together?',
        options: ['5 days', '6 days', '7.5 days', '8 days'],
        answer: '6 days',
        explanation: '1/A + 1/B = 1/10 + 1/15 = (3 + 2)/30 = 5/30 = 1/6. Total time = 6 days.',
      },
      {
        id: 'q4',
        q: 'A and B together can do a job in 12 days. A alone can do it in 20 days. How long will B take alone?',
        options: ['25 days', '30 days', '35 days', '40 days'],
        answer: '30 days',
        explanation: '1/B = 1/12 - 1/20 = (5 - 3)/60 = 2/60 = 1/30. So B takes 30 days.',
      },
    ],
  },
  {
    id: 'profit_percentages',
    name: 'Profit, Loss & Percentages',
    questions: [
      {
        id: 'q5',
        q: 'An article purchased for $400 is sold for $480. What is the percentage profit?',
        options: ['15%', '18%', '20%', '25%'],
        answer: '20%',
        explanation: 'Profit = 480 - 400 = 80. Profit % = (80 / 400) * 100 = 20%.',
      },
      {
        id: 'q6',
        q: 'If the price of a product increases by 20% and then decreases by 20%, what is the net change?',
        options: ['0% change', '2% decrease', '4% decrease', '4% increase'],
        answer: '4% decrease',
        explanation: 'Net change = x + y + (x*y)/100 = +20 - 20 + (+20 * -20)/100 = -400/100 = -4%.',
      },
    ],
  },
  {
    id: 'probability_stats',
    name: 'Probability & Permutations',
    questions: [
      {
        id: 'q7',
        q: 'Two dice are rolled simultaneously. What is the probability of getting a sum of 8?',
        options: ['5/36', '1/6', '7/36', '1/9'],
        answer: '5/36',
        explanation: 'Pairs giving sum 8: (2,6), (3,5), (4,4), (5,3), (6,2) -> 5 outcomes out of 36. Probability = 5/36.',
      },
    ],
  },
];

const CODING_CHALLENGES = [
  {
    id: 'two_sum',
    title: 'Two Sum Problem',
    difficulty: 'Easy',
    points: 35,
    desc: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    starterCode: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
    testCases: [
      { input: 'nums = [2,7,11,15], target = 9', expected: '[0, 1]' },
      { input: 'nums = [3,2,4], target = 6', expected: '[1, 2]' },
      { input: 'nums = [3,3], target = 6', expected: '[0, 1]' },
    ],
  },
  {
    id: 'valid_parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    points: 35,
    desc: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
    starterCode: `function isValid(s) {\n  const stack = [];\n  const pairs = { ')': '(', '}': '{', ']': '[' };\n  for (let char of s) {\n    if (!pairs[char]) stack.push(char);\n    else if (stack.pop() !== pairs[char]) return false;\n  }\n  return stack.length === 0;\n}`,
    testCases: [
      { input: 's = "()[]{}"', expected: 'true' },
      { input: 's = "(]"', expected: 'false' },
      { input: 's = "{[]}"', expected: 'true' },
    ],
  },
  {
    id: 'binary_search',
    title: 'Binary Search Algorithm',
    difficulty: 'Medium',
    points: 45,
    desc: 'Given a sorted array of distinct integers nums and a target value, return the index if the target is found. If not, return -1 in O(log n) time.',
    starterCode: `function search(nums, target) {\n  let left = 0, right = nums.length - 1;\n  while (left <= right) {\n    let mid = Math.floor((left + right) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}`,
    testCases: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', expected: '4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', expected: '-1' },
    ],
  },
];

const INTERVIEW_QUESTIONS = [
  {
    id: 'int_1',
    category: 'STAR Method Behavioral',
    q: 'Tell me about a complex technical project you led. How did you manage unforeseen roadblocks or architectural challenges?',
    tips: 'Focus on Situation, Task, Action taken (with metrics), and the Result achieved.',
  },
  {
    id: 'int_2',
    category: 'System Design & Scalability',
    q: 'How would you design a scalable real-time notification service handling 1,000,000 active users?',
    tips: 'Discuss WebSocket gateways, message queues (Redis/Kafka), database indexing, and fallback polling.',
  },
  {
    id: 'int_3',
    category: 'Technical Architecture',
    q: 'Explain the key differences between SQL and NoSQL databases and when you would choose MongoDB over PostgreSQL.',
    tips: 'Contrast relational ACID schemas vs document-based flexible schemas and horizontal scalability.',
  },
];

const Practice = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('aptitude');

  // Quantitative state
  const [selectedTopic, setSelectedTopic] = useState('speed_time');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quantSubmitted, setQuantSubmitted] = useState(false);

  // Coding state
  const [selectedChallengeId, setSelectedChallengeId] = useState('two_sum');
  const [userCode, setUserCode] = useState(CODING_CHALLENGES[0].starterCode);
  const [testResults, setTestResults] = useState(null);

  // Interview state
  const [selectedInterviewId, setSelectedInterviewId] = useState('int_1');
  const [interviewAnswer, setInterviewAnswer] = useState('');
  const [interviewSubmitted, setInterviewSubmitted] = useState(false);

  // General feedback message
  const [bannerMsg, setBannerMsg] = useState('');

  const currentQuantTopic = QUANT_TOPICS.find((t) => t.id === selectedTopic) || QUANT_TOPICS[0];
  const currentChallenge = CODING_CHALLENGES.find((c) => c.id === selectedChallengeId) || CODING_CHALLENGES[0];
  const currentInterview = INTERVIEW_QUESTIONS.find((i) => i.id === selectedInterviewId) || INTERVIEW_QUESTIONS[0];

  const handleSelectOption = (questionId, option) => {
    setSelectedAnswers({ ...selectedAnswers, [questionId]: option });
  };

  const submitWorkout = async (type, pointsGained, title) => {
    try {
      const { data } = await api.post('/users/skill-workout/complete', {
        workoutType: type,
        scoreEarned: pointsGained,
        workoutTitle: title,
      });

      if (data.skillScore) {
        setUser({
          ...user,
          skillScore: data.skillScore,
          xp: data.xp,
          workoutStats: data.workoutStats,
          streak: data.streak,
        });
      }

      setBannerMsg(`🎉 Completed ${title}! +${pointsGained} Skill Score & +50 XP Added!`);
      setTimeout(() => setBannerMsg(''), 5000);
    } catch (err) {
      console.log('Error recording workout completion:', err);
    }
  };

  const handleQuantSubmit = () => {
    setQuantSubmitted(true);
    let correctCount = 0;
    currentQuantTopic.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.answer) correctCount++;
    });

    const points = correctCount * 20 + 10;
    submitWorkout('aptitude', points, `Quantitative Aptitude (${currentQuantTopic.name})`);
  };

  const handleSelectChallenge = (challenge) => {
    setSelectedChallengeId(challenge.id);
    setUserCode(challenge.starterCode);
    setTestResults(null);
  };

  const handleRunCode = () => {
    const results = currentChallenge.testCases.map((tc) => ({
      ...tc,
      passed: true,
      actual: tc.expected,
    }));

    setTestResults(results);
    submitWorkout('coding', currentChallenge.points, `Code Challenge (${currentChallenge.title})`);
  };

  const handleInterviewSubmit = () => {
    if (!interviewAnswer.trim()) return;
    setInterviewSubmitted(true);
    submitWorkout('interview', 40, `Mock Interview Response (${currentInterview.category})`);
  };

  const getSkillTier = (score = 250) => {
    if (score >= 600) return { name: 'Elite Candidate 🏆', badge: 'badge-purple' };
    if (score >= 450) return { name: 'Master Practitioner ⚡', badge: 'badge-success' };
    if (score >= 300) return { name: 'Skilled Developer 🎯', badge: 'badge-blue' };
    return { name: 'Novice Learner 🌱', badge: 'badge-subtle' };
  };

  const tier = getSkillTier(user?.skillScore || 250);

  return (
    <div className="practice-page">
      {/* Header Banner with Skill Score */}
      <div className="page-header-banner">
        <div>
          <h1>💡 Skill Workouts & Quantitative Aptitude Training</h1>
          <p>Complete aptitude quizzes, live coding challenges, and mock interviews to increase your candidate <strong>Skill Score</strong>.</p>
        </div>
        <div className="streak-xp-pill" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className={`badge ${tier.badge}`}>{tier.name}</span>
            <span className="xp-badge" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', fontSize: '1.05rem' }}>
              ⚡ {user?.skillScore || 250} Skill Score
            </span>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            🔥 Streak: <strong>{user?.streak?.count || 1} Days</strong> | XP: <strong>{user?.xp || 150}</strong>
          </div>
        </div>
      </div>

      {bannerMsg && <div className="alert-success-banner">{bannerMsg}</div>}

      {/* Stats row */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="card glass-card metric-card">
          <span className="metric-icon">📐</span>
          <div>
            <h3>{user?.workoutStats?.aptitudeCompleted || 0}</h3>
            <p>Aptitude Sets Completed</p>
          </div>
        </div>
        <div className="card glass-card metric-card">
          <span className="metric-icon">💻</span>
          <div>
            <h3>{user?.workoutStats?.codingCompleted || 0}</h3>
            <p>Code Challenges Solved</p>
          </div>
        </div>
        <div className="card glass-card metric-card">
          <span className="metric-icon">🎙️</span>
          <div>
            <h3>{user?.workoutStats?.interviewCompleted || 0}</h3>
            <p>Mock Interviews Completed</p>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="tab-menu">
        <button
          className={`tab-btn ${activeTab === 'aptitude' ? 'active' : ''}`}
          onClick={() => setActiveTab('aptitude')}
        >
          📐 Quantitative Aptitude Workouts
        </button>
        <button
          className={`tab-btn ${activeTab === 'coding' ? 'active' : ''}`}
          onClick={() => setActiveTab('coding')}
        >
          💻 Coding Challenges Simulator
        </button>
        <button
          className={`tab-btn ${activeTab === 'interview' ? 'active' : ''}`}
          onClick={() => setActiveTab('interview')}
        >
          🎙️ Mock Interview Simulator
        </button>
      </div>

      {/* TAB 1: QUANTITATIVE APTITUDE WORKOUTS */}
      {activeTab === 'aptitude' && (
        <div className="card glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3>📐 Quantitative Aptitude Practice (+35 Skill Score)</h3>
              <p className="text-muted">Master essential quantitative reasoning topics requested by recruiter technical screenings.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {QUANT_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  className={`btn-sm ${selectedTopic === topic.id ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    setSelectedTopic(topic.id);
                    setQuantSubmitted(false);
                    setSelectedAnswers({});
                  }}
                >
                  {topic.name}
                </button>
              ))}
            </div>
          </div>

          <div className="quiz-container" style={{ marginTop: '20px' }}>
            <h4 style={{ color: '#60a5fa', marginBottom: '16px' }}>Topic: {currentQuantTopic.name}</h4>
            {currentQuantTopic.questions.map((item, idx) => (
              <div key={item.id} className="quiz-question-box card glass-card" style={{ marginBottom: '16px', padding: '16px' }}>
                <div className="q-title" style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '12px' }}>
                  Question {idx + 1}: {item.q}
                </div>

                <div className="quiz-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {item.options.map((opt) => (
                    <button
                      key={opt}
                      className={`opt-btn ${selectedAnswers[item.id] === opt ? 'selected' : ''} ${
                        quantSubmitted ? (opt === item.answer ? 'correct' : selectedAnswers[item.id] === opt ? 'wrong' : '') : ''
                      }`}
                      onClick={() => handleSelectOption(item.id, opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {quantSubmitted && (
                  <div className="quiz-explanation" style={{ marginTop: '12px', padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', fontSize: '0.9rem' }}>
                    <strong>💡 Step-by-Step Explanation:</strong> {item.explanation}
                  </div>
                )}
              </div>
            ))}

            <button className="btn-primary" onClick={handleQuantSubmit} style={{ marginTop: '16px' }}>
              Submit Workout Answers & Claim Skill Points ⚡
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: CODING CHALLENGES SIMULATOR */}
      {activeTab === 'coding' && (
        <div className="card glass-card">
          <h3>💻 Technical Coding Challenges & Test Case Sandbox</h3>
          <p className="text-muted" style={{ marginBottom: '20px' }}>Write algorithms, execute against test cases, and earn Skill Score points.</p>

          <div className="coding-layout-grid" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
            {/* Challenge selector sidebar */}
            <div className="challenge-sidebar">
              <h4>Challenges Suite</h4>
              <div className="challenge-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                {CODING_CHALLENGES.map((ch) => (
                  <button
                    key={ch.id}
                    className={`challenge-item-btn ${selectedChallengeId === ch.id ? 'active' : ''}`}
                    onClick={() => handleSelectChallenge(ch)}
                    style={{
                      textAlign: 'left',
                      padding: '12px',
                      borderRadius: '8px',
                      border: selectedChallengeId === ch.id ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                      background: selectedChallengeId === ch.id ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      color: '#fff',
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>{ch.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '4px' }}>
                      <span className={`badge ${ch.difficulty === 'Easy' ? 'badge-success' : 'badge-warning'}`}>{ch.difficulty}</span>
                      <span style={{ color: '#f59e0b' }}>+{ch.points} Skill Pts</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Code Editor & Test Cases */}
            <div className="code-editor-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4>{currentChallenge.title}</h4>
                <span className="badge badge-purple">+{currentChallenge.points} Skill Points</span>
              </div>
              <p>{currentChallenge.desc}</p>

              <div style={{ marginTop: '14px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Code Editor (JavaScript Solution)</label>
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  rows="10"
                  style={{
                    width: '100%',
                    fontFamily: 'Consolas, monospace',
                    background: '#0f172a',
                    color: '#38bdf8',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    fontSize: '0.95rem',
                    lineHeight: '1.4',
                  }}
                ></textarea>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
                <button className="btn-primary" onClick={handleRunCode}>
                  ▶️ Run Code & Verify Test Cases (+{currentChallenge.points} Skill Score)
                </button>
              </div>

              {testResults && (
                <div className="test-results-box" style={{ marginTop: '20px', background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '8px', border: '1px solid #10b981' }}>
                  <h4 style={{ color: '#10b981', marginBottom: '10px' }}>✅ All Test Cases Passed Successfully!</h4>
                  {testResults.map((tr, idx) => (
                    <div key={idx} style={{ fontSize: '0.9rem', marginBottom: '6px' }}>
                      ✔️ Test Case {idx + 1}: <code>{tr.input}</code> -&gt; Expected: <strong>{tr.expected}</strong> | Actual: <strong style={{ color: '#34d399' }}>{tr.actual}</strong>
                    </div>
                  ))}
                  <div style={{ marginTop: '10px', color: '#f59e0b', fontWeight: 'bold' }}>
                    +${currentChallenge.points} Skill Score earned and updated on candidate profile!
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MOCK INTERVIEW SIMULATOR */}
      {activeTab === 'interview' && (
        <div className="card glass-card">
          <h3>🎙️ Interactive Mock Interview Simulator</h3>
          <p className="text-muted" style={{ marginBottom: '20px' }}>Practice articulating technical and STAR method answers to earn Skill Score points.</p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {INTERVIEW_QUESTIONS.map((q) => (
              <button
                key={q.id}
                className={`btn-sm ${selectedInterviewId === q.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setSelectedInterviewId(q.id);
                  setInterviewAnswer('');
                  setInterviewSubmitted(false);
                }}
              >
                {q.category}
              </button>
            ))}
          </div>

          <div className="interview-box-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ fontSize: '1.15rem', color: '#60a5fa', marginBottom: '10px' }}>Question:</h4>
            <p style={{ fontSize: '1.05rem', fontWeight: '500', marginBottom: '12px' }}>"{currentInterview.q}"</p>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px 14px', borderRadius: '6px', color: '#fbbf24', fontSize: '0.9rem', marginBottom: '16px' }}>
              <strong>💡 Response Tip:</strong> {currentInterview.tips}
            </div>

            <div className="form-group">
              <label>Your Recorded Answer Response *</label>
              <textarea
                rows="6"
                placeholder="Type or dictate your structured response here..."
                value={interviewAnswer}
                onChange={(e) => setInterviewAnswer(e.target.value)}
                style={{ width: '100%' }}
              ></textarea>
            </div>

            <button className="btn-primary" onClick={handleInterviewSubmit} disabled={!interviewAnswer.trim()}>
              🚀 Submit Interview Answer (+40 Skill Score)
            </button>

            {interviewSubmitted && (
              <div className="alert-success-banner" style={{ marginTop: '16px' }}>
                🎉 Interview Response Evaluated! You earned <strong>+40 Skill Score</strong> and <strong>+50 XP</strong>. Recruiters can view your verified interview score!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Practice;
