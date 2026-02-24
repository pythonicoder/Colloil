from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import random
import string

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'colloil-secret-key-2026')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

security = HTTPBearer()

app = FastAPI(title="Colloil API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# --- MODELS ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    surname: str
    phone: str
    address: str
    nickname: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    surname: str
    phone: str
    address: str
    nickname: str
    total_oil_liters: float
    created_at: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    surname: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    nickname: Optional[str] = None

class CourierRequest(BaseModel):
    oil_liters: float
    address: Optional[str] = None
    notes: Optional[str] = None

class CourierRequestResponse(BaseModel):
    id: str
    user_id: str
    oil_liters: float
    address: str
    status: str
    courier_name: str
    estimated_arrival: str
    created_at: str

class Coupon(BaseModel):
    id: str
    partner_name: str
    partner_logo: str
    discount_percent: int
    required_liters: float
    code: Optional[str] = None
    activated: bool
    expires_at: Optional[str] = None

class CollectionPoint(BaseModel):
    id: str
    name: str
    address: str
    lat: float
    lng: float
    opening_hours: str

class Notification(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    read: bool
    created_at: str

# --- HELPERS ---
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def generate_coupon_code() -> str:
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- AUTH ROUTES ---
@api_router.post("/auth/register")
async def register(user: UserCreate):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user.email,
        "password": hash_password(user.password),
        "name": user.name,
        "surname": user.surname,
        "phone": user.phone,
        "address": user.address,
        "nickname": user.nickname or user.name,
        "total_oil_liters": 0.0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    # Initialize default coupons
    default_coupons = [
        {"partner_name": "Hebe", "partner_logo": "https://logo.clearbit.com/hebe.pl", "discount_percent": 15, "required_liters": 5},
        {"partner_name": "Uber Eats", "partner_logo": "https://logo.clearbit.com/ubereats.com", "discount_percent": 10, "required_liters": 8},
        {"partner_name": "Żabka", "partner_logo": "https://logo.clearbit.com/zabka.pl", "discount_percent": 5, "required_liters": 3},
        {"partner_name": "Rossmann", "partner_logo": "https://logo.clearbit.com/rossmann.pl", "discount_percent": 12, "required_liters": 6},
    ]
    for c in default_coupons:
        await db.coupons.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "partner_name": c["partner_name"],
            "partner_logo": c["partner_logo"],
            "discount_percent": c["discount_percent"],
            "required_liters": c["required_liters"],
            "code": None,
            "activated": False,
            "expires_at": None
        })
    
    token = create_token(user_id)
    return {"token": token, "user_id": user_id}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"])
    return {"token": token, "user_id": user["id"]}

# --- USER ROUTES ---
@api_router.get("/user/profile", response_model=UserResponse)
async def get_profile(user=Depends(get_current_user)):
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        surname=user["surname"],
        phone=user["phone"],
        address=user["address"],
        nickname=user["nickname"],
        total_oil_liters=user["total_oil_liters"],
        created_at=user["created_at"]
    )

@api_router.put("/user/profile")
async def update_profile(update: UserUpdate, user=Depends(get_current_user)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one({"id": user["id"]}, {"$set": update_data})
    updated_user = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    return updated_user

# --- COURIER ROUTES ---
@api_router.post("/courier/request", response_model=CourierRequestResponse)
async def request_courier(request: CourierRequest, user=Depends(get_current_user)):
    # Glycerin is approximately 10% of oil volume
    
    courier_names = ["Mehmet K.", "Anna W.", "Piotr B.", "Kasia M.", "Tomasz L."]
    request_id = str(uuid.uuid4())
    
    courier_doc = {
        "id": request_id,
        "user_id": user["id"],
        "oil_liters": request.oil_liters,
        "address": request.address or user["address"],
        "notes": request.notes,
        "status": "pending",
        "courier_name": random.choice(courier_names),
        "estimated_arrival": (datetime.now(timezone.utc) + timedelta(hours=random.randint(1, 3))).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.courier_requests.insert_one(courier_doc)
    
    # Update user's total oil
    new_oil_total = user["total_oil_liters"] + request.oil_liters
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"total_oil_liters": new_oil_total}}
    )
    
    # Create notification
    await db.notifications.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "title": "Kurye Yolda!" if True else "Courier on the way!",
        "message": f"Kurye {courier_doc['courier_name']} yaklaşık {random.randint(1, 3)} saat içinde gelecek.",
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return CourierRequestResponse(**{k: v for k, v in courier_doc.items() if k != "notes"})

@api_router.get("/courier/history")
async def get_courier_history(user=Depends(get_current_user)):
    requests = await db.courier_requests.find(
        {"user_id": user["id"]}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return requests

# --- COUPON ROUTES ---
@api_router.get("/coupons", response_model=List[Coupon])
async def get_coupons(user=Depends(get_current_user)):
    coupons = await db.coupons.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    return coupons

@api_router.post("/coupons/{coupon_id}/activate")
async def activate_coupon(coupon_id: str, user=Depends(get_current_user)):
    coupon = await db.coupons.find_one({"id": coupon_id, "user_id": user["id"]})
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    
    if coupon["activated"]:
        raise HTTPException(status_code=400, detail="Coupon already activated")
    
    if user["total_oil_liters"] < coupon["required_liters"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Need {coupon['required_liters']}L of oil. You have {user['total_oil_liters']}L"
        )
    
    code = generate_coupon_code()
    expires = (datetime.now(timezone.utc) + timedelta(days=14)).isoformat()
    
    await db.coupons.update_one(
        {"id": coupon_id},
        {"$set": {"activated": True, "code": code, "expires_at": expires}}
    )
    new_oil_total = max(0, user["total_oil_liters"] - coupon["required_liters"])
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"total_oil_liters": new_oil_total}}
    )
    # Create notification
    await db.notifications.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "title": "Kupon Aktif!",
        "message": f"{coupon['partner_name']} %{coupon['discount_percent']} indirim kuponunuz aktif. Kod: {code}",
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"code": code, "expires_at": expires}

# --- COLLECTION POINTS ---
@api_router.get("/collection-points", response_model=List[CollectionPoint])
async def get_collection_points():
    # Warsaw collection points (static for hackathon)
    points = [
        {"id": "1", "name": "Colloil Center Mokotów", "address": "ul. Puławska 145, Warsaw", "lat": 52.1884, "lng": 21.0243, "opening_hours": "08:00-20:00"},
        {"id": "2", "name": "Colloil Point Ursynów", "address": "ul. KEN 47, Warsaw", "lat": 52.1556, "lng": 21.0322, "opening_hours": "09:00-18:00"},
        {"id": "3", "name": "Colloil Hub Centrum", "address": "ul. Marszałkowska 104, Warsaw", "lat": 52.2297, "lng": 21.0118, "opening_hours": "07:00-21:00"},
        {"id": "4", "name": "Colloil Station Praga", "address": "ul. Targowa 72, Warsaw", "lat": 52.2537, "lng": 21.0410, "opening_hours": "08:00-19:00"},
        {"id": "5", "name": "Colloil Point Wola", "address": "ul. Wolska 88, Warsaw", "lat": 52.2348, "lng": 20.9711, "opening_hours": "09:00-17:00"},
    ]
    return points

# --- NOTIFICATIONS ---
@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(user=Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"user_id": user["id"]}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return notifications

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, user=Depends(get_current_user)):
    await db.notifications.update_one(
        {"id": notification_id, "user_id": user["id"]},
        {"$set": {"read": True}}
    )
    return {"success": True}

# --- INFO ROUTES (Public) ---
@api_router.get("/info/about")
async def get_about():
    return {
        "title": "Who We Are",
        "content": "Colloil is a community-driven platform that transforms waste cooking oil into biodiesel, rewarding households with discounts from partner stores. Founded in Warsaw, we're making sustainability profitable for everyone."
    }

@api_router.get("/info/biodiesel")
async def get_biodiesel_info():
    return {
        "title": "What is Biodiesel?",
        "content": "Biodiesel is a renewable, clean-burning fuel made from waste cooking oil. It produces 74% less CO2 than petroleum diesel and can be used in any diesel engine without modification."
    }

@api_router.get("/info/glycerin")
async def get_glycerin_info():
    return {
        "title": "What is Glycerin?",
        "content": "Glycerin is a natural byproduct of biodiesel production. It's used in cosmetics, pharmaceuticals, and food production. For every 10L of oil, approximately 1L of glycerin is produced."
    }

@api_router.get("/info/community")
async def get_community_info():
    total_users = await db.users.count_documents({})
    total_oil = await db.users.aggregate([{"$group": {"_id": None, "total": {"$sum": "$total_oil_liters"}}}]).to_list(1)
    total_oil_liters = total_oil[0]["total"] if total_oil else 0
    
    return {
        "title": "Community Stats",
        "total_users": total_users,
        "total_oil_collected": total_oil_liters,
        "co2_saved_kg": total_oil_liters * 2.5  # Approximate CO2 savings per liter
    }

@api_router.get("/")
async def root():
    return {"message": "Colloil API v1.0", "status": "running"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
