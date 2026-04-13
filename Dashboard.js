import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../App.css'; // Path for elite Indigo theme

const Dashboard = () => {
    // --- 📝 Original States (FULL INTACT) ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [mySkills, setMySkills] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // --- 🤖 AI Chatbot States (FULL INTACT) ---
    const [aiQuery, setAiQuery] = useState('');
    const [messages, setMessages] = useState([{ role: 'ai', text: 'Hi! Main SkillSwap AI hoon. Roadmap ya tips chahiye?' }]);
    const [loading, setLoading] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false); 

    // 👤 LocalStorage & Auth Logic
    const rawName = localStorage.getItem('username') || 'Guest';
    const currentUsername = rawName.split('@')[0]; 
    const token = localStorage.getItem('token');
    const API_URL = 'http://127.0.0.1:5000/skills';

    // --- 🔄 Fetch Logic ---
    const fetchSkills = useCallback(async () => {
        try {
            const res = await axios.get(API_URL);
            setMySkills(res.data);
        } catch (err) {
            console.error("Fetch error", err);
        }
    }, []);

    useEffect(() => {
        fetchSkills();
    }, [fetchSkills]);

    // --- 🔍 Search Logic ---
    const filteredSkills = mySkills.filter(skill =>
        skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- 🛠️ Skill CRUD Handlers (FULL INTACT) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (editingId) {
                await axios.put(`${API_URL}/${editingId}`, { title, description }, config);
                setEditingId(null);
                alert("Skill Updated! ✨");
            } else {
                await axios.post(API_URL, { title, description }, config);
                alert("Skill Added! ➕");
            }
            setTitle(''); setDescription('');
            fetchSkills();
        } catch (err) {
            alert("Action failed! Login check karein.");
        }
    };

    const startEdit = (skill) => {
        setEditingId(skill.id);
        setTitle(skill.title);
        setDescription(skill.description);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete karein?")) return;
        try {
            await axios.delete(`${API_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchSkills();
        } catch (err) {
            alert("Unauthorized!");
        }
    };

    // --- 🤖 AI Chat Logic (FULL INTACT) ---
    const handleAskAI = async () => {
        if (!aiQuery.trim()) return;
        setLoading(true);
        const userMsg = { role: 'user', text: aiQuery };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setAiQuery('');

        try {
            const res = await axios.post('http://127.0.0.1:5000/ask-ai', 
                { message: aiQuery },
                { headers: { Authorization: `Bearer ${token}` } } 
            );
            setMessages([...newMessages, { role: 'ai', text: res.data.reply }]);
        } catch (err) {
            setMessages([...newMessages, { role: 'ai', text: 'AI is currently offline.' }]);
        }
        setLoading(false);
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.reload(); 
    };

    // --- 🏠 Professional JSX Structure ---
    return (
        <div className="dashboard-container">
            {/* 1. Top Banner */}
            <div className="welcome-banner">
                <div className="text-start">
                    <h2 className="fw-bold mb-0">Welcome Back, {currentUsername}! 🚀</h2>
                    <p className="text-muted mb-0">Exchange Skills, Grow Together.</p>
                </div>
                <button className="btn btn-outline-danger btn-sm px-4" onClick={handleLogout}>Logout</button>
            </div>

            {/* 2. Main Flex Layout (Sidebar + Marketplace) */}
            <div className="main-content-layout" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                
                {/* ➕ Left Sidebar: Form */}
                <div className="form-sidebar" style={{ width: '350px', position: 'sticky', top: '20px' }}>
                    <div className="skill-card p-4 shadow-sm" style={{ borderTop: '4px solid #6366f1' }}>
                        <h5 className="fw-bold mb-3">{editingId ? "📝 Edit Skill" : "➕ Add New Skill"}</h5>
                        <form onSubmit={handleSubmit}>
                            <input type="text" className="form-control mb-2" placeholder="Skill Name" value={title} onChange={(e) => setTitle(e.target.value)} required />
                            <textarea className="form-control mb-3" rows="4" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                            <button className={`btn w-100 fw-bold ${editingId ? 'btn-warning' : 'btn-primary'}`}>
                                {editingId ? "Update Skill" : "Post Skill"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* 📋 Right Area: Marketplace */}
                <div className="marketplace-area" style={{ flex: 1 }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="fw-bold mb-0">Skills Marketplace</h5>
                        <input type="text" className="form-control w-50" placeholder="Search skills..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>

                    {/* --- THE GRID FIX --- */}
                    <div className="skills-grid">
                        {filteredSkills.map(skill => (
                            <div key={skill.id} className="skill-card">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h6 className="fw-bold mb-0 text-dark">{skill.title}</h6>
                                    <div className="d-flex">
                                        <button className="btn btn-sm text-primary p-0 me-2" onClick={() => startEdit(skill)}>Edit</button>
                                        <button className="btn btn-sm text-danger p-0" onClick={() => handleDelete(skill.id)}>Delete</button>
                                    </div>
                                </div>
                                <p className="small text-muted mb-3">{skill.description}</p>
                                <div className="d-flex justify-content-between align-items-center mt-auto">
                                    <span className="badge-user">👤 {skill.owner}</span>
                                    <a href={`https://wa.me/${skill.phone}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-success px-3 fw-bold shadow-sm" style={{ borderRadius: '8px' }}>💬 Chat</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 🤖 Floating AI Assistant UI */}
            <div className="ai-bot-container">
                <button className="bot-toggle-btn shadow-lg" onClick={() => setIsChatOpen(!isChatOpen)}>
                    {isChatOpen ? '✖' : '🤖'}
                </button>

                {isChatOpen && (
                    <div className="chat-window">
                        <div className="chat-header">Skill AI Assistant</div>
                        <div className="chat-messages p-3">
                            {messages.map((m, i) => (
                                <div key={i} className={`mb-3 ${m.role === 'user' ? 'text-end' : 'text-start'}`}>
                                    <div className={`p-2 rounded d-inline-block ${m.role === 'user' ? 'bg-primary text-white' : 'bg-light text-dark border'}`} style={{ maxWidth: '85%' }}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            {loading && <small className="text-muted">Thinking...</small>}
                        </div>
                        <div className="chat-input-area">
                            <input type="text" placeholder="Poocho..." value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAskAI()} />
                            <button className="btn btn-primary send-btn" onClick={handleAskAI}>➤</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;