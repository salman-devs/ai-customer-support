import { useEffect, useState } from "react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";


function EvaluationDashboard() {
  const { user, logout } = useAuth();

  const [cases, setCases] = useState([]);
  const [summary, setSummary] = useState(null);
  const [results, setResults] = useState({});

  const [question, setQuestion] = useState("");
  const [expectedAnswer, setExpectedAnswer] = useState("");
  const [expectedDocument, setExpectedDocument] = useState("");

  const [loading, setLoading] = useState(false);
  const [runningCase, setRunningCase] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  const loadData = async () => {
    try {
      const [casesResponse, summaryResponse] = await Promise.all([
        api.get("/evaluations/"),
        api.get("/evaluations/summary"),
      ]);

      const evaluationCases = casesResponse.data;

      setCases(evaluationCases);
      setSummary(summaryResponse.data);

      const resultEntries = await Promise.all(
        evaluationCases.map(async (evaluationCase) => {
          try {
            const response = await api.get(
              `/evaluations/${evaluationCase.id}/results`
            );

            return [
              evaluationCase.id,
              response.data,
            ];
          } catch {
            return [
              evaluationCase.id,
              [],
            ];
          }
        })
      );

      setResults(Object.fromEntries(resultEntries));
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Failed to load evaluation data."
      );
    }
  };


  useEffect(() => {
    loadData();
  }, []);


  const handleCreateCase = async (event) => {
    event.preventDefault();

    if (!question.trim() || !expectedAnswer.trim()) {
      setError(
        "Question and expected answer are required."
      );
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await api.post("/evaluations/", {
        question: question.trim(),
        expected_answer: expectedAnswer.trim(),
        expected_document:
          expectedDocument.trim() || null,
      });

      setQuestion("");
      setExpectedAnswer("");
      setExpectedDocument("");

      setMessage(
        "Evaluation case created successfully."
      );

      await loadData();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Failed to create evaluation case."
      );
    } finally {
      setLoading(false);
    }
  };


  const handleRunCase = async (caseId) => {
    setRunningCase(caseId);
    setError("");
    setMessage("");

    try {
      const response = await api.post(
        `/evaluations/${caseId}/run`
      );

      setResults((previous) => ({
        ...previous,
        [caseId]: [
          response.data,
          ...(previous[caseId] || []),
        ],
      }));

      setMessage(
        response.data.answer_correct
          ? "Evaluation completed — answer correct."
          : "Evaluation completed — answer needs improvement."
      );

      await loadData();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Failed to run evaluation."
      );
    } finally {
      setRunningCase(null);
    }
  };


  const handleDeleteCase = async (caseId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this evaluation case?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/evaluations/${caseId}`
      );

      setMessage(
        "Evaluation case deleted successfully."
      );

      setError("");

      await loadData();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Failed to delete evaluation case."
      );
    }
  };


  return (
    <div className="admin-app">

      <header className="admin-header">

        <div className="admin-brand">

          <div className="brand-icon small">
            ✦
          </div>

          <div>
            <h1>
              AI Support Admin
            </h1>

            <p>
              RAG evaluation
            </p>
          </div>

        </div>


        <div className="admin-user">

          <div>
            <strong>
              {user?.name || "Admin"}
            </strong>

            <span>
              Administrator
            </span>
          </div>

          <button onClick={logout}>
            Logout
          </button>

        </div>

      </header>


      <main className="admin-content">

        <section className="admin-page-heading">

          <div>

            <h2>
              RAG Evaluation
            </h2>

            <p>
              Measure retrieval quality, answer correctness,
              faithfulness, and response latency.
            </p>

          </div>

        </section>


        {summary && (

          <section className="stats-grid">

            <div className="stat-card">
              <span className="stat-label">
                Total evaluations
              </span>

              <strong className="stat-value">
                {summary.total_evaluations}
              </strong>
            </div>


            <div className="stat-card">
              <span className="stat-label">
                Retrieval relevance
              </span>

              <strong className="stat-value">
                {summary.retrieval_relevance}%
              </strong>
            </div>


            <div className="stat-card">
              <span className="stat-label">
                Answer correctness
              </span>

              <strong className="stat-value">
                {summary.answer_correctness}%
              </strong>
            </div>


            <div className="stat-card">
              <span className="stat-label">
                Faithfulness
              </span>

              <strong className="stat-value">
                {summary.faithfulness}%
              </strong>
            </div>


            <div className="stat-card">
              <span className="stat-label">
                Average latency
              </span>

              <strong className="stat-value">
                {summary.average_latency_ms} ms
              </strong>
            </div>

          </section>

        )}


        <section className="admin-card">

          <div className="card-heading">

            <div>

              <h2>
                Create evaluation case
              </h2>

              <p>
                Add a question and expected answer
                for testing the RAG system.
              </p>

            </div>

          </div>


          <form
            className="evaluation-form"
            onSubmit={handleCreateCase}
          >

            <div className="form-group">

              <label htmlFor="evaluation-question">
                Question
              </label>

              <textarea
                id="evaluation-question"
                placeholder="Example: How many days do customers have to request a refund?"
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                rows="3"
              />

            </div>


            <div className="form-group">

              <label htmlFor="expected-answer">
                Expected answer
              </label>

              <textarea
                id="expected-answer"
                placeholder="Example: Customers can request a refund within 30 days of purchase."
                value={expectedAnswer}
                onChange={(event) =>
                  setExpectedAnswer(event.target.value)
                }
                rows="3"
              />

            </div>


            <div className="form-group">

              <label htmlFor="expected-document">
                Expected document
              </label>

              <input
                id="expected-document"
                type="text"
                placeholder="Example: refund_policy.txt"
                value={expectedDocument}
                onChange={(event) =>
                  setExpectedDocument(event.target.value)
                }
              />

            </div>


            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create evaluation case"}
            </button>

          </form>


          {message && (
            <div className="success-message">
              {message}
            </div>
          )}


          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

        </section>


        <section className="admin-card">

          <div className="card-heading">

            <div>

              <h2>
                Evaluation cases
              </h2>

              <p>
                Run your test cases against the current RAG pipeline.
              </p>

            </div>

          </div>


          {cases.length === 0 ? (

            <div className="empty-documents">

              <div className="empty-icon">
                🧪
              </div>

              <h3>
                No evaluation cases yet
              </h3>

              <p>
                Create your first test case above.
              </p>

            </div>

          ) : (

            <div className="evaluation-cases">

              {cases.map((evaluationCase) => {

                const caseResults =
                  results[evaluationCase.id] || [];

                const latestResult =
                  caseResults[0];

                return (
                  <div
                    className="evaluation-case"
                    key={evaluationCase.id}
                  >

                    <div className="evaluation-case-header">

                      <div>

                        <span className="evaluation-case-id">
                          Case #{evaluationCase.id}
                        </span>

                        <h3>
                          {evaluationCase.question}
                        </h3>

                      </div>


                      <div className="evaluation-actions">

                        <button
                          className="run-button"
                          onClick={() =>
                            handleRunCase(
                              evaluationCase.id
                            )
                          }
                          disabled={
                            runningCase ===
                            evaluationCase.id
                          }
                        >
                          {runningCase ===
                          evaluationCase.id
                            ? "Running..."
                            : "Run"}
                        </button>


                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDeleteCase(
                              evaluationCase.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>


                    <div className="evaluation-details">

                      <div>
                        <span>
                          Expected answer
                        </span>

                        <p>
                          {evaluationCase.expected_answer}
                        </p>
                      </div>


                      <div>
                        <span>
                          Expected document
                        </span>

                        <p>
                          {evaluationCase.expected_document || "-"}
                        </p>
                      </div>

                    </div>


                    {latestResult && (

                      <div className="evaluation-result">

                        <div className="result-header">
                          <h4>
                            Latest result
                          </h4>

                          <span
                            className={
                              latestResult.answer_correct
                                ? "result-status correct"
                                : "result-status incorrect"
                            }
                          >
                            {latestResult.answer_correct
                              ? "Correct"
                              : "Needs improvement"}
                          </span>
                        </div>


                        <div className="generated-answer">

                          <span>
                            Generated answer
                          </span>

                          <p>
                            {latestResult.generated_answer}
                          </p>

                        </div>


                        <div className="result-metrics">

                          <div>
                            <span>
                              Answer similarity
                            </span>

                            <strong>
                              {(
                                latestResult.answer_similarity *
                                100
                              ).toFixed(1)}%
                            </strong>
                          </div>


                          <div>
                            <span>
                              Retrieval
                            </span>

                            <strong>
                              {latestResult.retrieval_relevant === null
                                ? "-"
                                : latestResult.retrieval_relevant
                                  ? "Relevant"
                                  : "Not relevant"}
                            </strong>
                          </div>


                          <div>
                            <span>
                              Faithfulness
                            </span>

                            <strong>
                              {(
                                latestResult.faithfulness_score *
                                100
                              ).toFixed(1)}%
                            </strong>
                          </div>


                          <div>
                            <span>
                              Latency
                            </span>

                            <strong>
                              {latestResult.latency_ms.toFixed(0)} ms
                            </strong>
                          </div>

                        </div>

                      </div>

                    )}

                  </div>
                );

              })}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}


export default EvaluationDashboard;