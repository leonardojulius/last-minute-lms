import React, { useEffect, useRef, useState } from 'react';
import './Quiz.css';

const shuffleArray = (array) => {
  return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
};

const shuffleOptions = (question) => {
  const options = [
    { text: question.option1, isCorrect: question.ans === 1 },
    { text: question.option2, isCorrect: question.ans === 2 },
    { text: question.option3, isCorrect: question.ans === 3 },
    { text: question.option4, isCorrect: question.ans === 4 },
  ];

  const shuffled = shuffleArray(options);

  return {
    question: question.question,
    options: shuffled,
  };
};

const Quiz = () => {
  const [shuffledData, setShuffledData] = useState([]);
  const [index, setIndex] = useState(0);
  const [lock, setLock] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const Option1 = useRef(null);
  const Option2 = useRef(null);
  const Option3 = useRef(null);
  const Option4 = useRef(null);
  const option_array = [Option1, Option2, Option3, Option4];

  useEffect(() => {
    const storedData = localStorage.getItem("quizData");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      const shuffled = shuffleArray(parsed).map(q => shuffleOptions(q));
      setShuffledData(shuffled);
      setLoaded(true);
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const json = JSON.parse(event.target.result);
        localStorage.setItem("quizData", JSON.stringify(json));
        const shuffled = shuffleArray(json).map(q => shuffleOptions(q));
        setShuffledData(shuffled);
        setIndex(0);
        setScore(0);
        setLock(false);
        setResult(false);
        setLoaded(true);
      } catch (err) {
        alert("Invalid JSON format in uploaded file.");
      }
    };
    reader.readAsText(file);
  };

  if (!loaded) {
    return (
      <div className='container'>
        <h1>Upload Quiz File</h1>
        <input type="file" accept=".json,.txt" onChange={handleFileUpload} />
      </div>
    );
  }

  const currentQuestion = shuffledData[index];

  const checkAns = (e, isCorrect, optionIndex) => {
    if (!lock) {
      if (isCorrect) {
        e.target.classList.add("correct");
        setScore(prev => prev + 1);
      } else {
        e.target.classList.add("wrong");
        const correctIndex = currentQuestion.options.findIndex(opt => opt.isCorrect);
        option_array[correctIndex].current.classList.add("correct");
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
      setIndex(prev => prev + 1);
      setLock(false);
      option_array.forEach(ref => ref.current.classList.remove('correct', 'wrong'));
    }
  };

  const reset = () => {
    const stored = localStorage.getItem("quizData");
    if (stored) {
      const reshuffled = shuffleArray(JSON.parse(stored)).map(q => shuffleOptions(q));
      setShuffledData(reshuffled);
      setIndex(0);
      setScore(0);
      setLock(false);
      setResult(false);
    }
  };

  return (
    <div className='container'>
      <h1>Last Minute LMS</h1>
      <hr />

      {!result ? (
        <>
          <h2>{index + 1}. {currentQuestion.question}</h2>
          <ul>
            {currentQuestion.options.map((option, i) => (
              <li
                key={i}
                ref={option_array[i]}
                onClick={(e) => checkAns(e, option.isCorrect, i)}
              >
                {option.text}
              </li>
            ))}
          </ul>
          <button onClick={next}>Next</button>
          <div className="index">{index + 1} of {shuffledData.length} questions</div>
        </>
      ) : (
        <>
          <h2>You Scored {score} out of {shuffledData.length}</h2>
          <button onClick={reset}>Reset</button>
        </>
      )}
    </div>
  );
};

export default Quiz;
