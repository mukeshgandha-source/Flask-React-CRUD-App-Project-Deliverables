import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ toggleForm }) => { 
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState(''); 

    const handleRegister = async (e) => {
        e.preventDefault();
        
        // 🛡️ Final check: Agar number 10 digit se kam hai toh alert do
        if (phone.length !== 10) {
            alert("WhatsApp number sahi se daalein (sirf 10 digits)!");
            return;
        }

        try {
            const res = await axios.post('http://127.0.0.1:5000/register', { username, password, phone });
            alert(res.data.message + " ! Ab login karo.");
            toggleForm(); 
        } catch (err) {
            alert("Registration failed! Details check karein.");
        }
    };

    return (
        <div className="card shadow-lg border-0 mx-auto" style={{ maxWidth: '500px', borderRadius: '15px' }}>
            <div className="card-body p-5">
                <h2 className="text-center fw-bold mb-4 text-primary">Naya Account Banayein</h2>
                <form onSubmit={handleRegister}>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Username</label>
                        <input type="text" className="form-control form-control-lg" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    
                    <div className="mb-3">
                        <label className="form-label fw-bold">WhatsApp Number</label>
                        <input 
                            type="text" 
                            className="form-control form-control-lg" 
                            placeholder="e.g. 9876543210" 
                            value={phone} 
                            onChange={(e) => {
                                // ✨ Logic: Sirf numbers allow honge aur max 10 digits
                                const val = e.target.value.replace(/\D/g, ''); 
                                if (val.length <= 10) setPhone(val);
                            }} 
                            required 
                        />
                        <small className="text-muted">{phone.length}/10 digits</small>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold">Password</label>
                        <input type="password" className="form-control form-control-lg" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    
                    <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold shadow-sm mb-3">Sign Up Free</button>
                </form>
                <hr />
                <p className="text-center mb-0">
                    Pehle se account hai? <button className="btn btn-link fw-bold p-0 text-decoration-none" onClick={toggleForm}>Login Karein</button>
                </p>
            </div>
        </div>
    );
};

export default Register;