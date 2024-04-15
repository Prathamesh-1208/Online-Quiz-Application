import React, { useState , useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { fetchQuizForUser } from '../../utils/QuizService'
import AnswerOption from '../../utils/AnswerOption'

const Quiz = () => {
    const [quizQuestions, setquizQuestions] = useState([{
        id: "", correctAnswers: "", question: "", questionType: ""
    }])

    const [selectedAnswers, setSelectedAnswers] = useState([{ id: "", answer: "" }])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [totalScores, setTotalScores] = useState(0)
    const location = useLocation()
    const navigate = useNavigate()
    const { selectedSubject, selectedNumOfQuestion } = location.state

    useEffect(() => {
        fetchQuizData()
    }, [])

    const fetchQuizData = async () => {
        if (selectedNumOfQuestion && selectedSubject) {
            const questions = await fetchQuizForUser(selectedNumOfQuestion, selectedSubject)
            setquizQuestions(questions)
        }
    }

    const handleAnswerChange = (questionId, answer) => {
        setSelectedAnswers((prevAnswers) => {
            const existingAnswerIndex = prevAnswers.findIndex((answerobj) => answerobj.id === questionId)
            const selectedAnswer = Array.isArray(answer) ? answer.map((a) => a.charAt(0)) : answer.charAt(0)

            if (existingAnswerIndex !== -1) {
                const updatedAnswers = [...prevAnswers]
                updatedAnswers[existingAnswerIndex] = { id: questionId, answer: selectedAnswer }
                console.log(updatedAnswers)
                return updatedAnswers
            }
            else {
                const newAnswer = { id: questionId, answer: selectedAnswer }
                return [...prevAnswers, newAnswer]
            }
        })
    }

    const ischecked = (questionId, choice) => {
        const selectedAnswer = selectedAnswers.find((answer) => answer.id === questionId)
        if (!selectedAnswer) {
            return false

        }
        if (Array.isArray(selectedAnswer.answer)) {
            return selectedAnswer.answer.includes(choice.charAt(0))
        }
        return selectedAnswer.answer === choice.charAt(0)
    }

    const handleCheckboxChange = (questionId, choice) => {
        setSelectedAnswers((prevAnswers) => {
            const existingAnswerIndex = prevAnswers.findIndex((answerObj) => answerObj.id === questionId)
            const selectedAnswer = Array.isArray(choice) ? choice.map((c) => c.charAt(0)) : choice.charAt(0)

            if (existingAnswerIndex !== -1) {
                const updatedAnswers = [...prevAnswers]
                const existingAnswers = updatedAnswers[existingAnswerIndex].answer
                let newAnswer
                if (Array.isArray(existingAnswers)) {
                    newAnswer = existingAnswers.includes(selectedAnswer) ? existingAnswers.filter((a) => a !== selectedAnswer)
                        : [...existingAnswers, selectedAnswer]

                } else {
                    newAnswer = [existingAnswers, selectedAnswer]
                }
                updatedAnswers[existingAnswerIndex] = { id: questionId, answer: newAnswer }
                console.log(updatedAnswers)
                return updatedAnswers
            } else {
                const newAnswer = { id: questionId, answer: [selectedAnswer] }
                return [...prevAnswers, newAnswer]
            }
        })
    }

    const handleSubmit = () => {
        let scores = 0;
        quizQuestions.forEach((question) => {
            const selectedAnswer = selectedAnswers.find((answer) => answer.id === question.id)
            if (selectedAnswer) {
                const selectedOptions = Array.isArray(selectedAnswer.answer)
                    ? selectedAnswer.answer : [selectedAnswer.answer];
                const correctOptions = Array.isArray(question.correctAnswers)
                    ? question.correctAnswers : [question.correctAnswers];
                const isCorrect = selectedOptions.every((option) =>
                    correctOptions.includes(option))

                if (isCorrect) {
                    scores++;
                }
            }
        })

        setTotalScores(scores)
        setSelectedAnswers([])
        setCurrentQuestionIndex(0)
        navigate("/quiz-result", { state: { quizQuestions, totalScores: scores } })
    }

    const handleNextQuestion = () => {
        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
            console.log(selectedAnswers)
        }
        else {
            handleSubmit()
        }
    }

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prevIndex) => prevIndex - 1)
        }

    }





    return (
        <div className="p-5">
        <h3 className="text-info">
            Question {quizQuestions.length > 0 ? currentQuestionIndex + 1 : 0} of {quizQuestions.length}
        </h3>

        <h4 className="mb-4">
            <pre>{quizQuestions[currentQuestionIndex]?.question}</pre>
        </h4>

        <AnswerOption
            question={quizQuestions[currentQuestionIndex]}
            isChecked={ischecked}
            handleAnswerChange={handleAnswerChange}
            handleCheckboxChange={handleCheckboxChange}
        />

        <div className="mt-4">
            <button
                className="btn btn-sm btn-primary me-2"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}>
                Previous question
            </button>
            <button
                className={`btn btn-sm btn-info ${
                    currentQuestionIndex === quizQuestions.length - 1 && "btn btn-sm btn-warning"
                }`}
                onClick={handleNextQuestion}
                disabled={
                    !selectedAnswers.find(
                        (answer) =>
                            answer.id === quizQuestions[currentQuestionIndex]?.id || answer.answer.length > 0
                    )
                }>
                {currentQuestionIndex === quizQuestions.length - 1 ? "Submit quiz" : "Next question"}
            </button>
        </div>
    </div>
    )
}

export default Quiz