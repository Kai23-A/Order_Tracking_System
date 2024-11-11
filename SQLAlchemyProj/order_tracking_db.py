from sqlalchemy import create_engine, Column, Integer, String, Float, Date, Enum, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from enum import Enum as PyEnum

Base = declarative_base()

# Enums for order status, delicacies, and container sizes
class OrderStatus(PyEnum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CANCELED = "Canceled"

class DelicacyType(PyEnum):
    SINUKMANI = "Sinukmani"
    SAPIN_SAPIN = "Sapin-Sapin"
    PUTO = "Puto"
    PUTO_ALSA = "Puto Alsa"
    KUTSINTA = "Kutsinta"
    PUTO_KUTSINTA = "Puto Kutsinta"
    MAJA = "Maja"
    PICHI_PICHI = "Pichi-Pichi"
    PALITAW = "Palitaw"
    KARIOKA = "Karioka"
    SUMAN_MALAGKIT = "Suman (Malagkit)"
    SUMAN_CASSAVA = "Suman (Cassava)"
    SUMAN_LIHIA = "Suman (Lihia)"

class ContainerSize(PyEnum):
    BILAO_10 = "10' Bilao"
    BILAO_12 = "12' Bilao"
    BILAO_14 = "14' Bilao"
    BILAO_16 = "16' Bilao"
    BILAO_18 = "18' Bilao"
    TAB = "Tab"
    SLICE = "Slice"

# User table
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    orders = relationship("Order", back_populates="user")

# Buyer information table
class BuyerInfo(Base):
    __tablename__ = 'buyer_info'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    contact_number = Column(String(15), nullable=False)  # This will be validated for 11 digits
    address = Column(String(255), nullable=False)
    orders = relationship("Order", back_populates="buyer")

    # Validator for contact number (11 digits only)
    @staticmethod
    def validate_contact_number(contact_number):
        if len(contact_number) == 11 and contact_number.isdigit():
            return True
        return False

# Orders table
class Order(Base):
    __tablename__ = 'orders'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    buyer_id = Column(Integer, ForeignKey('buyer_info.id'), nullable=False)
    delicacy = Column(Enum(DelicacyType), nullable=False)
    quantity = Column(Integer, nullable=False)  # Limited to 1-10
    container_size = Column(Enum(ContainerSize), nullable=False)
    special_request = Column(String(255))
    pickup_place = Column(String(255), nullable=False)
    pickup_date = Column(Date, nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    user = relationship("User", back_populates="orders")
    buyer = relationship("BuyerInfo", back_populates="orders")

    # Validator for quantity (1-10 only)
    @staticmethod
    def validate_quantity(quantity):
        if 1 <= quantity <= 10:
            return True
        return False

# Database setup
engine = create_engine("sqlite:///order_tracking_system.db")
Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)
session = Session()

print("Database setup complete.")