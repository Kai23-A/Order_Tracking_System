from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from datetime import timedelta
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
import os
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Date
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from datetime import datetime
import re

# Initialize the Flask app
app = Flask(__name__)

# Set configurations
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = os.urandom(24) 

app.permanent_session_lifetime = timedelta(minutes=30)  


# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# Enum classes for order status, delicacies, and container sizes
class DelicacyType(PyEnum):
    SINUKMANI = "SINUKMANI"
    SAPIN_SAPIN = "SAPIN_SAPIN"
    PUTO = "PUTO"
    PUTO_ALSA = "PUTO_ALSA"
    KUTSINTA = "KUTSINTA"
    PUTO_KUTSINTA = "PUTO_KUTSINTA"
    MAJA = "MAJA"
    PICHI_PICHI = "PICHI_PICHI"
    PALITAW = "PALITAW"
    KARIOKA = "KARIOKA"
    SUMAN_MALAGKIT = "SUMAN_MALAGKIT"
    SUMAN_CASSAVA = "SUMAN_CASSAVA"
    SUMAN_LIHIA = "SUMAN_LIHIA"

class ContainerSize(PyEnum):
    BILAO_10 = "BILAO_10"
    BILAO_12 = "BILAO_12"
    BILAO_14 = "BILAO_14"
    BILAO_16 = "BILAO_16"
    BILAO_18 = "BILAO_18"
    TAB = "TAB"
    SLICE = "SLICE"

class OrderStatus(PyEnum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    REMOVED = "Removed"

# User table definition
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    orders = relationship("Order", back_populates="user")

# Buyer information table
class BuyerInfo(db.Model):
    __tablename__ = 'buyer_info'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    contact_number = db.Column(db.String(15), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    orders = relationship("Order", back_populates="buyer")

# Orders table definition
class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, ForeignKey('users.id'), nullable=False)
    buyer_id = db.Column(db.Integer, ForeignKey('buyer_info.id'), nullable=False)
    delicacy = db.Column(db.Enum(DelicacyType), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    container_size = db.Column(db.Enum(ContainerSize), nullable=False)
    special_request = db.Column(db.String(255))
    pickup_place = db.Column(db.String(255), nullable=False)
    pickup_date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    status = db.Column(db.Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)

    user = relationship("User", back_populates="orders")
    buyer = relationship("BuyerInfo", back_populates="orders")


# Create tables before the first request
@app.before_request
def create_tables():
    db.create_all()
    # Check if a user exists, create one if not
    if not User.query.first():
        default_user = User(
            username="admin",
            password=bcrypt.generate_password_hash("password")
        )
        db.session.add(default_user)
        db.session.commit()

@app.route('/')
def index():
    return render_template('index.html')

# Login route
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
    
        username = request.form['username']
        password = request.form['password']

        # Retrieve the first (and only) user from the database
        user = User.query.first()

        # Check if user exists and if the password and username match
        if user and bcrypt.check_password_hash(user.password, password) and user.username == username:
            return redirect(url_for('order_form'))
        else:
            flash("Invalid username or password. Please try again.")
            return redirect(url_for('login'))

    return render_template('login.html')

@app.route('/order_form', methods=['GET', 'POST'])
def order_form():
    if request.method == 'POST':
        # Retrieving form data
        name = request.form.get('customer_name')
        contact_number = request.form.get('contactNumber')
        address = request.form.get('address')
        pickup_place = request.form.get('pickupPlace')
        pickup_date = datetime.strptime(request.form.get('pickupDate'), "%Y-%m-%d")
        delicacy_display = request.form.get('delicacy')
        quantity = int(request.form.get('quantity', 1)) 
        container_size = request.form.get('container')
        special_request = request.form.get('specialRequest', '')

        # Validate contact number (11 digits)
        if not re.match(r'^\d{11}$', contact_number):
            flash("Invalid contact number. It must be exactly 11 digits.")
            return redirect(url_for('order_form'))

        # Validate quantity based on the delicacies
        if quantity < 1 or quantity > 10:  
            flash("Quantity must be between 1 and 10.")
            return redirect(url_for('order_form'))

        # Debugging: Print form data
        print(f"Form data before saving: {name}, {contact_number}, {address}, {pickup_place}, {pickup_date}, {delicacy_display}, {quantity}, {container_size}, {special_request}")

        # Retrieve or create buyer
        buyer = BuyerInfo.query.filter_by(
            name=name,
            contact_number=contact_number,
            address=address
        ).first()

        if not buyer:
            print(f"Creating new buyer: {name}")
            buyer = BuyerInfo(
                name=name,
                contact_number=contact_number,
                address=address
            )
            db.session.add(buyer)
            db.session.commit()

        # Sanitize and validate Enum values
        try:
            # Convert the input to uppercase and replace hyphens with underscores
            delicacy_display_cleaned = delicacy_display.strip().upper().replace("-", "_")
            container_display_cleaned = container_size.strip().upper().replace("-", "_")

            # Try to access the Enum values
            delicacy_display = DelicacyType[delicacy_display_cleaned]
            container_size = ContainerSize[container_display_cleaned]
        except KeyError as e:
            print(f"Enum value error: {e}")
            flash(f'Invalid enum value: {e}', 'error')
            return redirect(url_for('order_form'))

        # Create and add new order directly to the database
        new_order = Order(
            user_id=User.query.first().id, 
            buyer_id=buyer.id,
            delicacy=delicacy_display,
            quantity=quantity,
            container_size=container_size,
            special_request=special_request,
            pickup_place=pickup_place,
            pickup_date=pickup_date,
            status=OrderStatus.PENDING
        )

        db.session.add(new_order)

        # Commit the transaction to save the order in the database
        try:
            db.session.commit()
            flash("Order submitted successfully!")
        except Exception as e:
            db.session.rollback()
            print(f"Error committing to the database: {e}")
            flash("Error submitting the order. Please try again.", 'error')

        return redirect(url_for('order_form'))  

    return render_template('order_form.html')


# Radix Sort by Date
def radix_sort_by_date(orders):
    def get_date_key(order):
        # Return a tuple of (year, month, day) as a numeric key for sorting
        return (order.pickup_date.year, order.pickup_date.month, order.pickup_date.day)
   
    # Apply Radix Sort (sorting by year, then month, then day)
    return radix_sort_orders(orders, get_date_key)

# Radix Sort by Date
def radix_sort_by_date(orders):
    def get_date_key(order):
        # Return a tuple of (year, month, day) as a numeric key for sorting
        return (order.pickup_date.year, order.pickup_date.month, order.pickup_date.day)
   
    # Apply Radix Sort (sorting by year, then month, then day)
    return radix_sort_orders(orders, get_date_key)

# Radix Sort implementation
def radix_sort_orders(orders, key_func):
    # Convert each key returned by the key_func to a string for sorting
    def get_digit(key, exp):
        # Convert each part of the key (tuple) into a string
        key_str = ''.join(str(i).zfill(4) for i in key) 
        return int(key_str[-(exp + 1)]) if len(key_str) > exp else 0

    # Find the maximum number of digits in the keys
    max_value = max([len(''.join(str(i).zfill(4) for i in key_func(order))) for order in orders])

    for exp in range(max_value):
        buckets = [[] for _ in range(10)]
        for order in orders:
            key = key_func(order)
            digit = get_digit(key, exp)
            buckets[digit].append(order)

        orders = [order for bucket in buckets for order in bucket]

    return orders

# Quick Sort by Delicacy
def quick_sort_delicacy(orders):
    def quick_sort(orders, low, high):
        if low < high:
            pi = partition(orders, low, high)
            quick_sort(orders, low, pi - 1)
            quick_sort(orders, pi + 1, high)

    def partition(orders, low, high):
        pivot = orders[high].delicacy.name
        i = low - 1
        for j in range(low, high):
            if orders[j].delicacy.name <= pivot:
                i += 1
                orders[i], orders[j] = orders[j], orders[i]
        orders[i + 1], orders[high] = orders[high], orders[i + 1]
        return i + 1

    quick_sort(orders, 0, len(orders) - 1)
    return orders

# Cycle Sort by Status
def cycle_sort_status(orders):
    def cycle_sort(orders):
        n = len(orders)
        for cycle_start in range(n - 1):
            item = orders[cycle_start]
            pos = cycle_start

            for i in range(cycle_start + 1, n):
                if orders[i].status.name < item.status.name:
                    pos += 1

            if pos == cycle_start:
                continue

            while item.status.name == orders[pos].status.name:
                pos += 1

            orders[pos], item = item, orders[pos]

            while pos != cycle_start:
                pos = cycle_start
                for i in range(cycle_start + 1, n):
                    if orders[i].status.name < item.status.name:
                        pos += 1

                while item.status.name == orders[pos].status.name:
                    pos += 1

                orders[pos], item = item, orders[pos]

        return orders

    return cycle_sort(orders)

# Flask route for order management with sorting
@app.route('/order_management')
def order_management():
    sort_by = request.args.get('sort_by', default='pickup_date', type=str)
    sort_algorithm = request.args.get('sort_algorithm', default='radix', type=str)
   
    # Validate the 'sort_by' and 'sort_algorithm' parameters to ensure they are valid
    valid_sort_fields = ['pickup_date', 'delicacy', 'status']
    valid_sort_algorithms = ['radix', 'quick', 'cycle'] 

    if sort_by not in valid_sort_fields:
        return "Invalid sort option!", 400  

    if sort_algorithm not in valid_sort_algorithms:
        return "Invalid sort algorithm!", 400  
   
    # Assuming you have a method to fetch all orders
    orders = Order.query.filter(Order.status != OrderStatus.REMOVED).all()  

    # Apply the selected sorting algorithm
    if sort_algorithm == 'radix':
        if sort_by == 'pickup_date':
            orders = radix_sort_by_date(orders)  

    elif sort_algorithm == 'quick':
        if sort_by == 'delicacy':
            orders = quick_sort_delicacy(orders)

    elif sort_algorithm == 'cycle':
        if sort_by == 'status':
            orders = cycle_sort_status(orders)

    return render_template('order_management.html', orders=orders)

@app.route('/remove_order/<int:order_id>', methods=['POST'])
def remove_order(order_id):
    order = Order.query.get_or_404(order_id)
    order.status = OrderStatus.REMOVED  
    db.session.commit()

    return jsonify({"success": True})  

# Flask route for updating order
@app.route('/update_order/<int:orderId>', methods=['POST'])
def update_order(orderId):
    data = request.json  # Receive the JSON data
    order = Order.query.get(orderId)  # Get the order by ID

    if not order:
        return jsonify(success=False, message="Order not found")

    try:
        # Update each field with the received data, handling enums and date parsing
        if 'customer_name' in data:
            order.buyer.name = data['customer_name']
        if 'contact_number' in data:
            order.buyer.contact_number = data['contact_number']
        if 'address' in data:
            order.buyer.address = data['address']
        if 'pickup_place' in data:
            order.pickup_place = data['pickup_place']
        if 'pickup_date' in data:
            order.pickup_date = datetime.strptime(data['pickup_date'], "%Y-%m-%d")
        
        # Update delicacy enum
        if 'delicacy' in data:
            try:
                order.delicacy = DelicacyType[data['delicacy'].upper().replace("-", "_")]
            except KeyError:
                return jsonify(success=False, message="Invalid delicacy type")
        
        # Update container size enum
        if 'container' in data:
            try:
                order.container_size = ContainerSize[data['container'].upper().replace("-", "_")]
            except KeyError:
                return jsonify(success=False, message="Invalid container size")
        
        # Update quantity and special request
        if 'quantity' in data:
            order.quantity = int(data['quantity'])
        if 'special_request' in data:
            order.special_request = data['special_request']
        
        # Update status enum
        if 'status' in data:
            try:
                order.status = OrderStatus[data['status'].upper().replace(" ", "_")]
            except KeyError:
                return jsonify(success=False, message="Invalid order status")

        # Commit changes to the database
        db.session.commit()
        return jsonify(success=True, order=data)
    except Exception as e:
        db.session.rollback()  # Rollback on any error
        print(f"Error updating order: {e}")
        return jsonify(success=False, message="An error occurred while updating the order")


@app.route('/delete_order/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    order = Order.query.get_or_404(order_id)
    db.session.delete(order)
    db.session.commit()
    return '', 204  

@app.route('/order_history')
def order_history():
    # Fetch all orders including the removed ones
    orders = Order.query.all()  
    return render_template('order_history.html', orders=orders)

@app.route('/order_tracking')
def order_tracking():
    return render_template('order_tracking.html')

if __name__ == '__main__':
    app.run(debug=True) 
