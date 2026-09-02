
import { useEffect, useState } from "react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";


function CustomerDashboard() {
  const { logout } = useAuth();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await api.get("/chat/sessions");
      setSessions(response.data);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  };

  const loadMessages = async (id) => {
    try {
      const response = await api.get(
        `/chat/sessions/${id}/messages`
      );

      setSessionId(id);
      setMessages(
        response.data.map((message) => ({
          role: message.role,
          content: message.content,
        }))
      );
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const startNewChat = () => {
    setSessionId(null);
    setMessages([]);
    setQuestion("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!question.trim() || loading) {
      return;
    }

    const userQuestion = question.trim();

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: userQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await api.post("/chat/", {
        question: userQuestion,
        session_id: sessionId,
      });

      setSessionId(response.data.session_id);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: response.data.answer,
          sources: response.data.sources,
        },
      ]);

      await loadSessions();
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            error.response?.data?.detail ||
            "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">

      <aside>
        <button onClick={startNewChat}>
          + New Chat
        </button>

        <h3>Conversations</h3>

        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => loadMessages(session.id)}
          >
            {session.title || "New Conversation"}
          </button>
        ))}
      </aside>

      <section className="chat-section">

        <header>
          <h1>AI Customer Support</h1>

          <button onClick={logout}>
            Logout
          </button>
        </header>

        <main className="chat-container">

          {messages.length === 0 && (
            <div>
              <h2>How can I help you?</h2>
              <p>
                Ask a question about our products or support policies.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index}>
              <strong>
                {message.role === "user"
                  ? "You"
                  : "AI Assistant"}
              </strong>

              <p>{message.content}</p>

              {message.sources?.length > 0 && (
                <div>
                  <strong>Sources:</strong>

                  {message.sources.map((source, sourceIndex) => (
                    <div key={sourceIndex}>
                      {source.filename}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && <p>AI is thinking...</p>}

        </main>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Ask a question..."
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
          >
            Send
          </button>
        </form>

      </section>

    </div>
  );
}

export default CustomerDashboard;

