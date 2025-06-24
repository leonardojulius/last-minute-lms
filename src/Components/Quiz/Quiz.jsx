import React, { useEffect, useRef, useState } from 'react';
import './Quiz.css';

const shuffleArray = (array) => {
  return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
};

const shuffleChoices = (q) => {
  const options = [
    { text: q.option1, originalIndex: 1 },
    { text: q.option2, originalIndex: 2 },
    { text: q.option3, originalIndex: 3 },
    { text: q.option4, originalIndex: 4 }
  ];

  const shuffled = shuffleArray(options);
  const newAnswerIndex = shuffled.findIndex(opt => opt.originalIndex === q.ans) + 1;

  return {
    ...q,
    option1: shuffled[0].text,
    option2: shuffled[1].text,
    option3: shuffled[2].text,
    option4: shuffled[3].text,
    ans: newAnswerIndex
  };
};

const Quiz = () => {
  const [shuffledData, setShuffledData] = useState([]);
  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState(null);
  const [lock, setLock] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [eraseStorage, setEraseStorage] = useState(false);

  const Option1 = useRef(null);
  const Option2 = useRef(null);
  const Option3 = useRef(null);
  const Option4 = useRef(null);
  const option_array = [Option1, Option2, Option3, Option4];

  useEffect(() => {
    const storedData = localStorage.getItem("quizData");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      const shuffled = shuffleArray(parsed);
      setShuffledData(shuffled);
      setQuestion(shuffleChoices(shuffled[0]));
      setLoaded(true);
    }
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const parsed = eval(content); // Use JSON.parse if format is JSON only
        if (Array.isArray(parsed)) {
          localStorage.setItem("quizData", JSON.stringify(parsed));
          const shuffled = shuffleArray(parsed);
          setShuffledData(shuffled);
          setIndex(0);
          setScore(0);
          setLock(false);
          setResult(false);
          setQuestion(shuffleChoices(shuffled[0]));
          setLoaded(true);
        } else {
          alert("Invalid quiz file format.");
        }
      } catch (err) {
        alert("Error reading quiz file.");
      }
    };
    reader.readAsText(file);
  };

  const checkAns = (e, ans) => {
    if (!lock) {
      if (question.ans === ans) {
        e.target.classList.add("correct");
        setScore((prev) => prev + 1);
      } else {
        e.target.classList.add("wrong");
        option_array[question.ans - 1].current.classList.add("correct");
      }
      setLock(true);
    }
  };

  const next = () => {
    if (lock) {
      if (index === shuffledData.length - 1) {
        setResult(true);
        return;
      }
      const newIndex = index + 1;
      setIndex(newIndex);
      setQuestion(shuffleChoices(shuffledData[newIndex]));
      setLock(false);
      option_array.forEach((option) => {
        option.current.classList.remove("wrong", "correct");
      });
    }
  };

  const reset = () => {
    if (eraseStorage) {
      localStorage.removeItem("quizData");
      setShuffledData([]);
      setLoaded(false);
      setEraseStorage(false);
      return;
    }
    const reshuffled = shuffleArray(shuffledData);
    setIndex(0);
    setShuffledData(reshuffled);
    setQuestion(shuffleChoices(reshuffled[0]));
    setScore(0);
    setLock(false);
    setResult(false);
  };

  const forceReset = () => {
    localStorage.removeItem("quizData");
    setShuffledData([]);
    setIndex(0);
    setScore(0);
    setLock(false);
    setResult(false);
    setLoaded(false);
    setEraseStorage(false);
  };

  // 📋 Clipboard sample
  const sampleJson = `[
  {
    "question": "Which device is required for the Internet connection?",
    "option1": "Modem",
    "option2": "Router",
    "option3": "LAN Cable",
    "option4": "Pen Drive",
    "ans": 1
  },
  {
    "question": "Which continent has the highest number of countries?",
    "option1": "Asia",
    "option2": "Europe",
    "option3": "North America",
    "option4": "Africa",
    "ans": 4
  }
]`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sampleJson)
      .then(() => alert("Sample format copied to clipboard!"))
      .catch((err) => alert("Failed to copy: " + err));
  };

  if (!loaded) {
    return (
      <div className="container">
        <h1>Upload Quiz File (.txt or .json)</h1>
        <input type="file" accept=".txt,.json" onChange={handleUpload} />

        <button onClick={copyToClipboard} style={{ marginTop: '5px' }}>
          📋 Copy Sample
        </button>

        <pre style={{
          backgroundColor: '#f8f8f8',
          padding: '10px',
          fontSize: '13px',
          whiteSpace: 'pre-wrap'
        }}>
          {sampleJson}
        </pre>

      </div>
    );
  }

  return (
    <div className="container">
      <div className="header-row">
        <h1>Last Minute LMS</h1>
        <button className="force-reset" onClick={() => {
          const confirmReset = window.confirm("Are you sure you want to erase all quiz data?");
          if (confirmReset) {
            forceReset();
          }
        }}>
          🔄
        </button>
      </div>

      <hr />

      {!result ? (
        <>
          <h2>{index + 1}. {question.question}</h2>
          <ul>
            <li ref={Option1} onClick={(e) => checkAns(e, 1)}>{question.option1}</li>
            <li ref={Option2} onClick={(e) => checkAns(e, 2)}>{question.option2}</li>
            <li ref={Option3} onClick={(e) => checkAns(e, 3)}>{question.option3}</li>
            <li ref={Option4} onClick={(e) => checkAns(e, 4)}>{question.option4}</li>
          </ul>
          <button onClick={next}>Next</button>
          <div className="index">{index + 1} of {shuffledData.length} questions</div>
        </>
      ) : (
        <>
          <h2>You Scored {score} out of {shuffledData.length}</h2>
          <button onClick={reset}>Restart</button>
        </>
      )}
    </div>
  );
};

export default Quiz;
