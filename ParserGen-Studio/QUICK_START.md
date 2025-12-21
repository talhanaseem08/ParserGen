# Quick Start Guide

## Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- npm or yarn installed

## First Time Setup

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 2. Install Node.js Dependencies
```bash
npm install
```

## Running the Application

### Step 1: Start Backend Server

Open a terminal in the project folder and run:
```bash
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
```

**Keep this terminal open!**

### Step 2: Start Frontend Server

Open a **NEW terminal** in the same project folder and run:
```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 3: Open in Browser

Open your browser and go to:
```
http://localhost:3000
```

## Usage

1. **Select Parser Type**: Choose LR(0) or SLR(1)
2. **Enter Grammar**: Type or load an example grammar
3. **Generate Tables**: Click "Generate [LR(0)/SLR(1)] Tables"
4. **View Results**: 
   - Check if grammar is valid
   - View parsing tables
   - See DFA visualization
   - Parse input strings

## Example Grammars

### LR(0) Example:
```
S -> A
A -> a A | b
```

### SLR(1) Example:
```
S -> E
E -> T + E | T
T -> F * T | F
F -> ( E ) | id
```

## Troubleshooting

- **Backend not starting?** Check if port 5000 is already in use
- **Frontend not starting?** Check if port 3000 is already in use
- **CORS errors?** Make sure backend is running on port 5000
- **Module not found?** Run `pip install -r requirements.txt` again

## Stopping the Servers

- Press `Ctrl+C` in each terminal to stop the servers

