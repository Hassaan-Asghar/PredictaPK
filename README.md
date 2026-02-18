
#  PredictaPK | AI Powered Price Valuation System

PredictaPK is a sophisticated full-stack AI application designed to provide accurate market value predictions for **Cars**, **Bikes**, **Houses (Buy/Rent)** in Pakistan. By leveraging advanced machine learning models (XGBoost/RandomForest) and **Explainable AI (SHAP)**, it not only predicts prices but also explains *why*, offering transparency to users.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC)

## Features

*   **Multi-Category Predictions**: Instant valuation for Cars, Motorcycles, and Real Estate (Sales & Rentals).
*   **Explainable AI (XAI)**: Integrated **SHAP (SHapley Additive exPlanations)** visualization to break down how each feature (e.g., Mileage, Location, Model Year) contributes to the final price.
*   **Smart Input Forms**: Dynamic forms with searchable dropdowns (`Combobox`), auto-complete, and dependent fields (e.g., Locations valid for a selected City).
*   **Modern UI/UX**: Built with a "Midnight Luxe" aesthetic using **Tailwind CSS v4** and **Framer Motion** for smooth animations and transitions.
*   **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile experiences.

## Tech Stack

### **Frontend**
*   **Framework**: Next.js 16 (App Router)
*   **Library**: React 19
*   **Styling**: Tailwind CSS v4, Lucide React (Icons)
*   **Animation**: Framer Motion
*   **Charts**: Recharts (for SHAP visualizations)
*   **HTTP Client**: Axios/Fetch API

### **Backend**
*   **Framework**: FastAPI (Python)
*   **Server**: Uvicorn
*   **ML Libraries**: Scikit-Learn, Pandas, NumPy, XGBoost
*   **Explainability**: SHAP (Shapley Additive Explanations)
*   **Data Processing**: Joblib (Model serialization)

## Project Structure

```bash
PredictaPK/
├── backend/                # Python FastAPI Backend
│   ├── main.py             # Entry point for the API
│   ├── requirements.txt    # Python dependencies
│   └── ...
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   ├── components/     # Reusable UI components (PredictionForm, ShapChart)
│   │   └── lib/            # Utilities and helpers
│   ├── public/             # Static assets
│   ├── package.json        # Node dependencies
│   └── ...
├── models/                 # Pre-trained ML models (.pkl) and encoders
│   ├── model_car.pkl
│   ├── model_bike.pkl
│   ├── model_house_buy.pkl
│   └── ...
├── dataset/                # Raw and processed datasets (CSV)
└── README.md               # Project Documentation
```

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
*   **Node.js** (v18 or higher)
*   **Python** (v3.9 or higher)
*   **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/PredictaPK.git
cd PredictaPK
```

### 2. Backend Setup
Navigate to the backend directory and set up the Python environment.

```bash
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi "uvicorn[standard]" pandas joblib scikit-learn shap numpy
# OR if requirements.txt exists:
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*The backend API will be available at `http://localhost:8000`.*

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and start the Next.js app.

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```
*The frontend will be available at `http://localhost:3000`.*

## Deployment

### Frontend (Vercel)
The customized Next.js frontend is optimized for **Vercel**.
1.  Push your code to GitHub.
2.  Import the project into Vercel.
3.  Set the `Root Directory` to `frontend`.
4.  Configure Environment Variables if needed (e.g., `NEXT_PUBLIC_API_URL` pointing to your deployed backend).
5.  Deploy!

### Backend (Railway / Render)
The FastAPI backend can be easily deployed on **Railway** or **Render**.
1.  Push your code to GitHub.
2.  Create a new service on Railway/Render connected to your repo.
3.  Set the `Root Directory` to `backend` (or configuring the build command to allow running from root).
4.  **Build Command**: `pip install -r requirements.txt`
5.  **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## Future Improvements
*   [ ] User Authentication (Save prediction history).
*   [ ] Historical Price Trends analysis.
*   [ ] Comparison tool for multiple vehicles/properties.
*   [ ] Dark/Light mode toggle.

---

**Developed with ❤️ by Hassaan Asghar**
