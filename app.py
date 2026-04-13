from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from datetime import timedelta
from groq import Groq
import sys

app = Flask(__name__)

# --- ⚙️ Configuration ---
CORS(app, resources={r"/*": {"origins": "*"}}) 
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:admin@localhost:5432/skillswap_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'skillswap-super-secret-key-2026'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# 🤖 Groq AI Client Setup
groq_client = Groq(api_key="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")

# --- 🗄️ Database Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    skills = db.relationship('Skill', backref='owner', lazy=True, cascade="all, delete-orphan")

class Skill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), default='General')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# --- 🏠 Home Route ---
@app.route('/')
def index():
    return jsonify({"status": "Online", "message": "SkillSwap Backend is functional"}), 200

# --- 🤖 AI Assistant Route ---
@app.route('/ask-ai', methods=['POST'])
def ask_ai():
    print("\n--- 🔔 NEW AI REQUEST ---")
    data = request.get_json()
    
    if not data or 'message' not in data:
        print("❌ Error: Request body is empty or missing 'message'")
        return jsonify({"error": "Message content missing"}), 400
        
    user_query = data.get('message')
    print(f"📩 User Message: {user_query}")

    try:
        completion = groq_client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": "You are SkillSwap AI. Give professional roadmaps and skill advice in short 2-3 sentences."},
                {"role": "user", "content": user_query}
            ],
            temperature=0.7,
        )
        reply = completion.choices[0].message.content
        print(f"🤖 AI Success Response: {reply}")
        return jsonify({"reply": reply}), 200
    except Exception as e:
        # Yahan terminal mein asli error dikhega (Rate Limit, Invalid API Key, etc.)
        print(f"🔥 CRITICAL GROQ ERROR: {str(e)}", file=sys.stderr)
        return jsonify({"error": str(e)}), 500

# --- 🔐 Authentication Routes ---
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not all([data.get('username'), data.get('password'), data.get('phone')]):
        return jsonify({"error": "Sare fields bharna zaroori hai!"}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Username already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], password=hashed_pw, phone=data['phone'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Registration successful"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    if user and bcrypt.check_password_hash(user.password, data.get('password')):
        token = create_access_token(identity=str(user.id))
        return jsonify({"access_token": token, "username": user.username}), 200
    return jsonify({"error": "Invalid credentials"}), 401

# --- 🛠️ Skill CRUD Routes ---
@app.route('/skills', methods=['GET'])
def get_skills():
    skills = Skill.query.all()
    return jsonify([{
        "id": s.id, 
        "title": s.title, 
        "description": s.description,
        "owner": s.owner.username,
        "phone": s.owner.phone, 
        "user_id": s.user_id
    } for s in skills]), 200

@app.route('/skills', methods=['POST'])
@jwt_required()
def add_skill():
    uid = int(get_jwt_identity())
    data = request.get_json()
    if not data.get('title'):
        return jsonify({"error": "Title is required"}), 400

    new_skill = Skill(title=data['title'], description=data.get('description', ''), user_id=uid)
    db.session.add(new_skill)
    db.session.commit()
    return jsonify({"message": "Skill added successfully"}), 201

@app.route('/skills/<int:id>', methods=['PUT'])
@jwt_required()
def update_skill(id):
    uid = int(get_jwt_identity())
    skill = Skill.query.get_or_404(id)
    if skill.user_id != uid:
        return jsonify({"error": "Unauthorized"}), 403
    
    data = request.get_json()
    skill.title = data.get('title', skill.title)
    skill.description = data.get('description', skill.description)
    db.session.commit()
    return jsonify({"message": "Updated successfully"}), 200

@app.route('/skills/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_skill(id):
    uid = int(get_jwt_identity())
    skill = Skill.query.get_or_404(id)
    if skill.user_id != uid:
        return jsonify({"error": "Unauthorized"}), 403
    db.session.delete(skill)
    db.session.commit()
    return jsonify({"message": "Deleted successfully"}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)