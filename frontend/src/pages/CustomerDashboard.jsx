import { useEffect, useState } from "react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";


function CustomerDashboard() {
  const { user, logout } = useAuth();

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
    <div className="customer-app">

      {/* Sidebar */}

      <aside className="chat-sidebar">

        <div className="sidebar-header">

          <div className="sidebar-brand">
            <div className="brand-icon small">
              ✦
            </div>

            <span>
              AI Support
            </span>
          </div>

        </div>


        <button
          className="new-chat-button"
          onClick={startNewChat}
        >
          + New conversation
        </button>


        <div className="conversation-section">

          <p className="conversation-label">
            Conversations
          </p>


          <div className="conversation-list">

            {sessions.length === 0 ? (

              <p className="empty-conversations">
                No conversations yet
              </p>

            ) : (

              sessions.map((session) => (

                <button
                  key={session.id}
                  className={
                    session.id === sessionId
                      ? "conversation active"
                      : "conversation"
                  }
                  onClick={() => loadMessages(session.id)}
                >
                  {session.title || "New conversation"}
                </button>

              ))

            )}

          </div>

        </div>


        <div className="sidebar-footer">

          <div className="user-info">

            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>

              <strong>
                {user?.name || "User"}
              </strong>

              <span>
                {user?.email || ""}
              </span>

            </div>

          </div>


          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </aside>


      {/* Main Chat */}

      <section className="chat-main">

        <header className="chat-header">

          <div>
            <h1>
              AI Customer Support
            </h1>

            <p>
              Ask questions about our products and support policies
            </p>
          </div>

        </header>


        <main className="messages-container">

          {messages.length === 0 && (

            <div className="welcome-message">

              <div className="welcome-icon">
                ✦
              </div>

              <h2>
                How can we help?
              </h2>

              <p>
                Ask a question about our products,
                policies, or support documentation.
              </p>

            </div>

          )}


          <div className="messages">

            {messages.map((message, index) => (

              <div
                key={index}
                className={
                  message.role === "user"
                    ? "message user-message"
                    : "message assistant-message"
                }
              >

                <div className="message-avatar">
                  {message.role === "user" ? "U" : "✦"}
                </div>


                <div className="message-content">

                  <strong>
                    {message.role === "user"
                      ? "You"
                      : "AI Assistant"}
                  </strong>

                  <p>
                    {message.content}
                  </p>


                  {message.sources?.length > 0 && (

                    <div className="sources">

                      <span className="sources-title">
                        Sources
                      </span>

                      {message.sources.map(
                        (source, sourceIndex) => (

                          <div
                            className="source-item"
                            key={sourceIndex}
                          >
                            {source.filename}
                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>

              </div>

            ))}


            {loading && (

              <div className="message assistant-message">

                <div className="message-avatar">
                  ✦
                </div>

                <div className="message-content">

                  <strong>
                    AI Assistant
                  </strong>

                  <p className="thinking">
                    Thinking...
                  </p>

                </div>

              </div>

            )}

          </div>

        </main>


        {/* Chat Input */}

        <div className="chat-input-container">

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              placeholder="Ask a question..."
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !question.trim()}
            >
              Send
            </button>

          </form>

          <p className="input-hint">
            AI answers are generated from the support knowledge base.
          </p>

        </div>

      </section>

    </div>
  );
}


export default CustomerDashboard;