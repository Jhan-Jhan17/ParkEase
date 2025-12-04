"""
Database models for BatStateU Parking System
This file separates models from the main app for better organization
"""

from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    """User model for authentication"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')  # admin or user
    status = db.Column(db.String(20), nullable=False, default='active')  # active or inactive
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    reservations = db.relationship('Reservation', backref='user', lazy=True)

    def set_password(self, password):
        """Hash and set user password"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Check if provided password matches hash"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert user object to dictionary"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'status': self.status,
            'createdAt': self.created_at.isoformat()
        }

class ParkingSlot(db.Model):
    """Parking slot model"""
    __tablename__ = 'parking_slots'
    
    id = db.Column(db.Integer, primary_key=True)
    slot_number = db.Column(db.Integer, unique=True, nullable=False, index=True)
    is_occupied = db.Column(db.Boolean, default=False, nullable=False)
    plate_number = db.Column(db.String(20), nullable=True)
    vehicle_type = db.Column(db.String(20), nullable=True)  # car, motorcycle, suv, truck
    check_in_time = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self):
        """Convert slot object to dictionary"""
        return {
            'id': self.id,
            'slotNumber': self.slot_number,
            'isOccupied': self.is_occupied,
            'vehicle': {
                'plateNumber': self.plate_number,
                'vehicleType': self.vehicle_type,
                'checkInTime': self.check_in_time.isoformat() if self.check_in_time else None
            } if self.is_occupied else None
        }

class PricingRate(db.Model):
    """Pricing rates for different vehicle types"""
    __tablename__ = 'pricing_rates'
    
    id = db.Column(db.Integer, primary_key=True)
    vehicle_type = db.Column(db.String(20), unique=True, nullable=False, index=True)
    hourly_rate = db.Column(db.Float, nullable=False)
    
    def to_dict(self):
        """Convert pricing rate object to dictionary"""
        return {
            'id': self.id,
            'vehicleType': self.vehicle_type,
            'hourlyRate': self.hourly_rate
        }

class Transaction(db.Model):
    """Transaction history"""
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    plate_number = db.Column(db.String(20), nullable=False, index=True)
    vehicle_type = db.Column(db.String(20), nullable=False)
    slot_id = db.Column(db.Integer, nullable=False)
    check_in_time = db.Column(db.DateTime, nullable=False)
    check_out_time = db.Column(db.DateTime, nullable=False)
    duration = db.Column(db.Float, nullable=False)  # in hours
    cost = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    def to_dict(self):
        """Convert transaction object to dictionary"""
        return {
            'id': f"txn-{self.id}",
            'plateNumber': self.plate_number,
            'vehicleType': self.vehicle_type,
            'slotId': self.slot_id,
            'checkInTime': self.check_in_time.isoformat(),
            'checkOutTime': self.check_out_time.isoformat(),
            'duration': self.duration,
            'cost': self.cost
        }

class Reservation(db.Model):
    """Parking reservations"""
    __tablename__ = 'reservations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    username = db.Column(db.String(80), nullable=False)
    plate_number = db.Column(db.String(20), nullable=False)
    vehicle_type = db.Column(db.String(20), nullable=False)
    slot_id = db.Column(db.Integer, nullable=False)
    reservation_date = db.Column(db.DateTime, nullable=False, index=True)
    status = db.Column(db.String(20), default='pending', nullable=False)  # pending, confirmed, cancelled, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        """Convert reservation object to dictionary"""
        return {
            'id': f"res-{self.id}",
            'username': self.username,
            'plateNumber': self.plate_number,
            'vehicleType': self.vehicle_type,
            'slotId': self.slot_id,
            'date': self.reservation_date.isoformat(),
            'status': self.status
        }
