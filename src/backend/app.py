"""
BatStateU Alangilan Parking Management System - Backend API
Flask/Python Backend Server

This file contains the main Flask application with RESTful API endpoints.
To run this server:
1. Install dependencies: pip install flask flask-cors flask-sqlalchemy flask-jwt-extended
2. Run: python app.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import os

# Initialize Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///parking.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-secret-key-change-in-production'  # Change this!
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
CORS(app)  # Enable CORS for frontend communication
db = SQLAlchemy(app)
jwt = JWTManager(app)

# ========================
# DATABASE MODELS
# ========================

class User(db.Model):
    """User model for authentication"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')  # admin or user
    status = db.Column(db.String(20), nullable=False, default='active')  # active or inactive
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class ParkingSlot(db.Model):
    """Parking slot model"""
    id = db.Column(db.Integer, primary_key=True)
    slot_number = db.Column(db.Integer, unique=True, nullable=False)
    is_occupied = db.Column(db.Boolean, default=False)
    plate_number = db.Column(db.String(20), nullable=True)
    vehicle_type = db.Column(db.String(20), nullable=True)  # car, motorcycle, suv, truck
    check_in_time = db.Column(db.DateTime, nullable=True)

class PricingRate(db.Model):
    """Pricing rates for different vehicle types"""
    id = db.Column(db.Integer, primary_key=True)
    vehicle_type = db.Column(db.String(20), unique=True, nullable=False)
    hourly_rate = db.Column(db.Float, nullable=False)

class Transaction(db.Model):
    """Transaction history"""
    id = db.Column(db.Integer, primary_key=True)
    plate_number = db.Column(db.String(20), nullable=False)
    vehicle_type = db.Column(db.String(20), nullable=False)
    slot_id = db.Column(db.Integer, nullable=False)
    check_in_time = db.Column(db.DateTime, nullable=False)
    check_out_time = db.Column(db.DateTime, nullable=False)
    duration = db.Column(db.Float, nullable=False)  # in hours
    cost = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Reservation(db.Model):
    """Parking reservations"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    username = db.Column(db.String(80), nullable=False)
    plate_number = db.Column(db.String(20), nullable=False)
    vehicle_type = db.Column(db.String(20), nullable=False)
    slot_id = db.Column(db.Integer, nullable=False)
    reservation_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, cancelled, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# ========================
# AUTHENTICATION ROUTES
# ========================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    user = User(
        username=data['username'],
        email=data['email'],
        role=data.get('role', 'user')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user and return JWT token"""
    data = request.get_json()
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if user.status == 'inactive':
        return jsonify({'error': 'Account is inactive'}), 403
    
    access_token = create_access_token(
        identity=user.id,
        additional_claims={'role': user.role, 'username': user.username}
    )
    
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }
    }), 200

# ========================
# PARKING SLOT ROUTES
# ========================

@app.route('/api/parking-slots', methods=['GET'])
@jwt_required()
def get_parking_slots():
    """Get all parking slots"""
    slots = ParkingSlot.query.all()
    return jsonify([{
        'id': slot.id,
        'slotNumber': slot.slot_number,
        'isOccupied': slot.is_occupied,
        'vehicle': {
            'plateNumber': slot.plate_number,
            'vehicleType': slot.vehicle_type,
            'checkInTime': slot.check_in_time.isoformat() if slot.check_in_time else None
        } if slot.is_occupied else None
    } for slot in slots]), 200

@app.route('/api/parking-slots/<int:slot_id>/check-in', methods=['POST'])
@jwt_required()
def check_in(slot_id):
    """Check in a vehicle to a parking slot"""
    data = request.get_json()
    slot = ParkingSlot.query.get(slot_id)
    
    if not slot:
        return jsonify({'error': 'Slot not found'}), 404
    
    if slot.is_occupied:
        return jsonify({'error': 'Slot is already occupied'}), 400
    
    slot.is_occupied = True
    slot.plate_number = data['plateNumber']
    slot.vehicle_type = data['vehicleType']
    slot.check_in_time = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({'message': 'Vehicle checked in successfully'}), 200

@app.route('/api/parking-slots/<int:slot_id>/check-out', methods=['POST'])
@jwt_required()
def check_out(slot_id):
    """Check out a vehicle from a parking slot"""
    slot = ParkingSlot.query.get(slot_id)
    
    if not slot:
        return jsonify({'error': 'Slot not found'}), 404
    
    if not slot.is_occupied:
        return jsonify({'error': 'Slot is not occupied'}), 400
    
    # Calculate duration and cost
    check_out_time = datetime.utcnow()
    duration = (check_out_time - slot.check_in_time).total_seconds() / 3600  # hours
    
    pricing = PricingRate.query.filter_by(vehicle_type=slot.vehicle_type).first()
    cost = duration * pricing.hourly_rate if pricing else 0
    
    # Create transaction record
    transaction = Transaction(
        plate_number=slot.plate_number,
        vehicle_type=slot.vehicle_type,
        slot_id=slot_id,
        check_in_time=slot.check_in_time,
        check_out_time=check_out_time,
        duration=duration,
        cost=cost
    )
    db.session.add(transaction)
    
    # Clear slot
    slot.is_occupied = False
    slot.plate_number = None
    slot.vehicle_type = None
    slot.check_in_time = None
    
    db.session.commit()
    
    return jsonify({
        'message': 'Vehicle checked out successfully',
        'transaction': {
            'duration': duration,
            'cost': cost
        }
    }), 200

# ========================
# PRICING ROUTES
# ========================

@app.route('/api/pricing', methods=['GET'])
@jwt_required()
def get_pricing():
    """Get all pricing rates"""
    rates = PricingRate.query.all()
    return jsonify([{
        'id': rate.id,
        'vehicleType': rate.vehicle_type,
        'hourlyRate': rate.hourly_rate
    } for rate in rates]), 200

@app.route('/api/pricing/<int:rate_id>', methods=['PUT'])
@jwt_required()
def update_pricing(rate_id):
    """Update pricing rate (Admin only)"""
    claims = get_jwt_identity()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.get_json()
    rate = PricingRate.query.get(rate_id)
    
    if not rate:
        return jsonify({'error': 'Rate not found'}), 404
    
    rate.hourly_rate = data['hourlyRate']
    db.session.commit()
    
    return jsonify({'message': 'Pricing updated successfully'}), 200

# ========================
# TRANSACTION ROUTES
# ========================

@app.route('/api/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    """Get all transactions"""
    transactions = Transaction.query.order_by(Transaction.created_at.desc()).all()
    return jsonify([{
        'id': t.id,
        'plateNumber': t.plate_number,
        'vehicleType': t.vehicle_type,
        'slotId': t.slot_id,
        'checkInTime': t.check_in_time.isoformat(),
        'checkOutTime': t.check_out_time.isoformat(),
        'duration': t.duration,
        'cost': t.cost
    } for t in transactions]), 200

# ========================
# RESERVATION ROUTES
# ========================

@app.route('/api/reservations', methods=['GET'])
@jwt_required()
def get_reservations():
    """Get all reservations"""
    reservations = Reservation.query.order_by(Reservation.created_at.desc()).all()
    return jsonify([{
        'id': r.id,
        'username': r.username,
        'plateNumber': r.plate_number,
        'vehicleType': r.vehicle_type,
        'slotId': r.slot_id,
        'date': r.reservation_date.isoformat(),
        'status': r.status
    } for r in reservations]), 200

@app.route('/api/reservations', methods=['POST'])
@jwt_required()
def create_reservation():
    """Create a new reservation"""
    data = request.get_json()
    user_id = get_jwt_identity()
    
    reservation = Reservation(
        user_id=user_id,
        username=data['username'],
        plate_number=data['plateNumber'],
        vehicle_type=data['vehicleType'],
        slot_id=data['slotId'],
        reservation_date=datetime.fromisoformat(data['date'])
    )
    
    db.session.add(reservation)
    db.session.commit()
    
    return jsonify({'message': 'Reservation created successfully'}), 201

@app.route('/api/reservations/<int:reservation_id>', methods=['PUT'])
@jwt_required()
def update_reservation(reservation_id):
    """Update reservation status"""
    data = request.get_json()
    reservation = Reservation.query.get(reservation_id)
    
    if not reservation:
        return jsonify({'error': 'Reservation not found'}), 404
    
    reservation.status = data['status']
    db.session.commit()
    
    return jsonify({'message': 'Reservation updated successfully'}), 200

# ========================
# USER MANAGEMENT ROUTES
# ========================

@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    """Get all users (Admin only)"""
    claims = get_jwt_identity()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    users = User.query.all()
    return jsonify([{
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'role': u.role,
        'status': u.status,
        'createdAt': u.created_at.isoformat()
    } for u in users]), 200

# ========================
# INITIALIZATION FUNCTION
# ========================

def init_database():
    """Initialize database with default data"""
    with app.app_context():
        db.create_all()
        
        # Create default admin user
        if not User.query.filter_by(username='admin').first():
            admin = User(username='admin', email='admin@batstateu.edu.ph', role='admin')
            admin.set_password('admin123')
            db.session.add(admin)
        
        # Create default user
        if not User.query.filter_by(username='user').first():
            user = User(username='user', email='user@batstateu.edu.ph', role='user')
            user.set_password('user123')
            db.session.add(user)
        
        # Create parking slots (50 slots)
        if ParkingSlot.query.count() == 0:
            for i in range(1, 51):
                slot = ParkingSlot(slot_number=i)
                db.session.add(slot)
        
        # Create pricing rates
        if PricingRate.query.count() == 0:
            rates = [
                PricingRate(vehicle_type='motorcycle', hourly_rate=20),
                PricingRate(vehicle_type='car', hourly_rate=50),
                PricingRate(vehicle_type='suv', hourly_rate=70),
                PricingRate(vehicle_type='truck', hourly_rate=100)
            ]
            for rate in rates:
                db.session.add(rate)
        
        db.session.commit()
        print("Database initialized successfully!")

# ========================
# MAIN
# ========================

if __name__ == '__main__':
    init_database()
    app.run(debug=True, host='0.0.0.0', port=5000)
