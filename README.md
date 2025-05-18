# UniteMatch AI

**UniteMatch AI** is a smart team-building assistant for Pokémon Unite. It predicts team win rates and synergy levels based on player roles, lane coverage, metadata, and real user feedback — helping players build stronger, more balanced teams.

---

## Key Features

-  **Team Difficulty Prediction** powered by LightGBM  
-  **Win Rate Estimation** based on synergy and composition  
-  **Dynamic Team Record**: tracks wins and losses  
-  **Synergy Meter**: visual indicator of team cohesion  
-  **User Feedback Loop**: logs real match outcomes to improve future predictions  
-  **Smart Suggestions** engine for missing roles _[Coming Soon]_  

---

## Tech Stack

### Backend

- **FastAPI** + **Python 3**
- **LightGBM**, **RandomForestRegressor**
- **SMOTE**, **Scikit-Learn**, **Pandas**

### Frontend

- **React** + **Next.js (App Router)**
- **Tailwind CSS**, **Framer Motion**
- **React Context API** for global state management

---

## Project Structure

```bash
UniteMatch-AI/
│
├── backend/
│   └── app/
│       ├── charts/               # Model evaluation images (confusion matrix, ROC, etc.)
│       ├── data/                 # Raw and enriched .csv datasets
│       ├── routes/               # FastAPI route handlers (optimize, feedback, data)
│       └── services/             # Core ML models and synergy scoring logic
│
├── frontend/
│   └── src/app/
│       ├── optimizer/
│       │   ├── components/       # UI pieces: Suggestions, SynergyMeter, SelectedTeam
│       │   └── OptimizerPage.js
│       ├── utils/
│       │   ├── api.js            # Handles frontend → backend API calls
│       │   ├── synergy.js        # Scores and ranks suggestions for synergy
│       │   └── synergyBadges.js  # Generates synergy tag badges based on team comp
│       ├── context/
│       │   └── OptimizerContext.js  # Shared state across app
│       └── about/
│           └── page.js           # About screen for app purpose + background
```

---

# Getting Started
## Backend
```bash
cd backend
uvicorn app.main:app --reload
```

## Frontend
```bash
cd frontend
npm install
npm run dev
```

---

# Deployment
### Frontend: [Vercel](https://vercel.com/)  
### Backend: [Render](https://render.com/)

**Environment Variable for Frontend:**  
```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.onrender.com
```

## License
This project is under the MIT License — free to use, modify, and contribute.