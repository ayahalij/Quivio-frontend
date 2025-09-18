# Quivio - Personal Lifestyle Journaling Platform

A comprehensive digital wellness companion that helps users track their mental health journey through multiple mediums including mood tracking, written journaling, photography, interactive challenges, and time-locked memory capsules.

## 🌟 Features

### Core Functionality
- **Daily Mood Tracking** - Track emotional states with visual sentiment icons and personal notes
- **Rich Text Journaling** - Write detailed diary entries with word counting and date-locking
- **Photo Memories** - Upload photos with GPS location data and interactive mapping
- **Photography Challenges** - Daily mood-based photography prompts with difficulty levels
- **Memory Capsules** - Time-locked messages to future self or others with media attachments
- **Timeline Calendar** - Monthly view of all activities with comprehensive search
- **Email Notifications** - Automated emails for password recovery and capsule opening

### Advanced Features
- **Interactive Photo Map** - Leaflet-based mapping with location clustering
- **Enhanced Search** - Full-text search across diary entries and mood notes
- **Analytics Dashboard** - Personal statistics and wellness insights
- **Multi-recipient Capsules** - Share time-locked memories with up to 25 recipients
- **Photo Viewer** - Full-screen photo browser with zoom and navigation
- **Responsive Design** - Mobile-optimized interface with bottom navigation

## 🛠 Technology Stack

### Backend
- **Framework:** FastAPI (Python)
- **Database:** SQLite (development) / PostgreSQL (production ready)
- **ORM:** SQLAlchemy with Alembic migrations
- **Authentication:** JWT tokens with refresh mechanism
- **Email Service:** SMTP via Gmail with HTML templates
- **File Storage:** Cloudinary for images and videos
- **API Design:** RESTful architecture with OpenAPI documentation

### Frontend
- **Framework:** React 18
- **UI Library:** Material-UI (MUI) with custom theming
- **Styling:** Kalam font family with custom color palette
- **State Management:** React Context for authentication
- **Routing:** React Router with nested routes
- **HTTP Client:** Axios for API communication
- **Maps:** Leaflet with OpenStreetMap tiles
- **Date Handling:** Day.js for date manipulation

### Development Tools
- **Backend:** Python 3.8+, FastAPI, Uvicorn
- **Frontend:** Node.js, npm/yarn, Create React App
- **Database:** SQLite (local), PostgreSQL (production)
- **Version Control:** Git

## 📁 Project Structure

```
Quivio/
├── backend/
│   ├── app/
│   │   ├── api/endpoints/     # API route handlers
│   │   ├── models/           # SQLAlchemy database models
│   │   ├── services/         # Business logic services
│   │   ├── schemas/          # Pydantic data validation
│   │   └── core/            # Configuration & security
│   ├── alembic/             # Database migrations
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── pages/          # Main application pages
│   │   ├── components/     # Reusable UI components
│   │   ├── services/       # API communication
│   │   ├── contexts/       # React context providers
│   │   └── utils/          # Helper functions
│   └── package.json        # Node.js dependencies
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- Git

### Backend Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Quivio/backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Initialize database:
   ```bash
   alembic upgrade head
   ```

6. Start development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API URL
   ```

4. Start development server:
   ```bash
   npm start
   ```

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=sqlite:///./quivio.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=quivio.dev@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=quivio.dev@gmail.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Frontend (.env.local)
```env
REACT_APP_API_URL=http://localhost:8000
```

## 🎨 Design System

### Color Palette
- **Primary Purple:** #8761a7 (main brand color)
- **Accent Yellow:** #cdd475 (secondary actions)
- **Background Cream:** #fffefb (page backgrounds)
- **Card Background:** #fffbef (content cards)

### Typography
- **Font Family:** "Kalam", cursive (handwritten style)
- **Weights:** 400 (regular), 600 (semi-bold), 700 (bold)

### Mood Color System
- **Very Sad (1):** #ff6b6b (red)
- **Sad (2):** #ffa726 (orange)
- **Neutral (3):** #42a5f5 (blue)
- **Happy (4):** #8cd38f (light green)
- **Very Happy (5):** #47a14a (dark green)

## 📊 Database Schema

### Core Tables
- **users** - User accounts and profiles
- **moods** - Daily mood tracking entries
- **diary_entries** - Written journal entries
- **photos** - Photo memories with metadata
- **challenges** - Photography challenges
- **capsules** - Time-locked memory capsules
- **capsule_recipients** - Multi-recipient capsule sharing
- **password_reset_tokens** - Secure password recovery

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- CORS protection for API endpoints
- Input validation with Pydantic schemas
- SQL injection prevention via SQLAlchemy ORM
- Secure file upload with Cloudinary
- Rate limiting on sensitive endpoints

## 📱 Mobile Responsiveness

- Bottom navigation for mobile devices
- Touch-friendly interface elements
- Responsive grid layouts
- Optimized image loading
- Mobile-first CSS approach

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📦 Deployment

### Production Deployment
1. **Backend:** Deploy to Railway, Render, or Heroku
2. **Frontend:** Deploy to Vercel or Netlify
3. **Database:** Migrate to PostgreSQL
4. **File Storage:** Configure Cloudinary for production
5. **Domain:** Set up custom domain with SSL

### Environment Configuration
- Update CORS settings for production domain
- Set secure JWT secrets
- Configure production email settings
- Set up production database connection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m "Add feature"`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint and Prettier for JavaScript/React code
- Write comprehensive tests for new features
- Update documentation for API changes
- Maintain consistent styling with existing codebase

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Known Issues

- Map clustering requires optimization for large datasets
- Email delivery may be delayed during high traffic
- Photo upload size limited to 10MB per file
- Calendar navigation on mobile needs UX improvements

## 🔮 Future Enhancements

- **Social Features:** Friend connections and shared journals
- **Data Export:** PDF generation and data backup
- **Integrations:** Spotify mood tracking, weather correlation
- **AI Features:** Mood pattern analysis and insights
- **Accessibility:** Enhanced screen reader support
- **Performance:** Image optimization and lazy loading

## 🎓 About This Project

Quivio is my capstone project for the General Assembly Software Engineering Immersive program. This full-stack application represents the culmination of intensive training in modern web development technologies and represents my journey from beginner to full-stack developer.

### Project Objectives
- Demonstrate proficiency in full-stack development using Python/FastAPI and React
- Implement complex features including authentication, file uploads, email services, and real-time data
- Create a meaningful application that addresses real-world wellness and mental health needs
- Apply software engineering best practices including testing, documentation, and deployment

### Technical Achievements
- Built a complete RESTful API with 20+ endpoints
- Implemented secure authentication with JWT tokens and refresh mechanisms
- Integrated third-party services (Cloudinary, Gmail SMTP, Leaflet mapping)
- Created a responsive, accessible React frontend with Material-UI
- Designed and implemented a normalized database schema with 8+ related tables
- Developed real-time features including time-locked capsules and email notifications

### Learning Journey
This project showcases skills developed across the entire General Assembly curriculum:
- **Backend Development:** Python, FastAPI, SQLAlchemy, database design
- **Frontend Development:** React, Material-UI, state management, responsive design
- **Database Management:** SQL, migrations, relationships, query optimization
- **DevOps & Deployment:** Environment configuration, API documentation, version control
- **Software Engineering:** Code organization, testing, documentation, security best practices

## 🙏 Acknowledgments

Special thanks to **General Assembly** for providing world-class instruction and an incredible learning environment. This project would not have been possible without the guidance, support, and expertise of the entire GA team.

### Gratitude to Instructors
Heartfelt appreciation to all the General Assembly instructors who shared their knowledge, provided mentorship, and supported my growth throughout this intensive program. Your dedication to student success and passion for teaching made this journey both challenging and rewarding.

### GA Community
Thanks to my fellow students and the entire General Assembly community for creating a collaborative learning environment where questions were encouraged, knowledge was shared, and everyone supported each other's success.

The skills, confidence, and professional network gained through General Assembly have been invaluable in bringing Quivio from concept to reality.

---

**General Assembly Software Engineering Immersive - Final Project**  
*Demonstrating full-stack development proficiency and real-world application building*

---

**Built with ❤️ for personal wellness and digital journaling**