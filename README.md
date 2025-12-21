# ParserGen Studio

**Interactive LR(0) & SLR(1) Parser Generator & Visualizer**

An educational web-based tool for generating LR(0) and SLR(1) parsing tables from context-free grammars. Automatically constructs parsing tables, visualizes DFAs, detects conflicts, and parses input strings with step-by-step analysis.

![ParserGen Studio](https://img.shields.io/badge/Parser-LR%280%29%20%26%20SLR%281%29-blue)
![Python](https://img.shields.io/badge/Python-3.8+-green)
![React](https://img.shields.io/badge/React-18.2-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌐 Live Demo

**Access the live application:** [https://parser-gen.vercel.app/](https://parser-gen.vercel.app/)

Try it out without any installation! The live version is fully functional and ready to use.

## ✨ Features

### Core Functionality
- **Grammar Augmentation**: Automatically augments grammar with S' → S
- **LR(0) & SLR(1) Support**: Switch between LR(0) and SLR(1) parsing
- **Item Set Generation**: Creates LR(0) items with dot notation
- **Closure & GOTO Computation**: Implements closure and GOTO functions
- **DFA Construction**: Builds LR(0) DFA states and transitions
- **Parsing Tables**: Generates ACTION and GOTO tables
- **Conflict Detection**: Identifies Shift/Reduce and Reduce/Reduce conflicts
- **FIRST & FOLLOW Sets**: Computes and displays FIRST/FOLLOW sets for SLR(1)

### Visualization & Analysis
- **Interactive DFA Graph**: Visualize states and transitions using D3.js
- **Color-Coded Tables**: ACTION and GOTO tables with conflict highlighting
- **Parse Tree Visualization**: See the parse tree for accepted strings
- **Step-by-Step Parsing**: Detailed parsing steps with stack visualization
- **Algorithm Explanation**: Step-by-step explanation of the algorithm

### User Experience
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **Example Grammars**: Quick-load examples for LR(0) and SLR(1)
- **Input Parsing**: Parse input strings using generated tables
- **Real-time Feedback**: Instant conflict detection and grammar validation

## 🚀 Quick Start

### Option 1: Use Live Version (Recommended)

**🌐 Access the live application:** [https://parser-gen.vercel.app/](https://parser-gen.vercel.app/)

No installation required! Just open the link and start using the tool.

### Option 2: Run Locally

### Prerequisites

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)

### Installation

1. **Clone or download this repository**

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

### Running the Application

#### Step 1: Start Backend Server

Open a terminal in the project directory:

```bash
python app.py
```

The backend will run on `http://localhost:5000`

**Keep this terminal open!**

#### Step 2: Start Frontend Server

Open a **new terminal** in the same directory:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

#### Step 3: Open in Browser

Navigate to: **http://localhost:3000**

## 📖 Usage Guide

### 1. Select Parser Type

Choose between:
- **LR(0)**: Simple, no lookahead
- **SLR(1)**: Uses FOLLOW sets for reduce actions (more powerful)

### 2. Enter Grammar

Type your context-free grammar in the editor:

```
S -> E
E -> T + E | T
T -> F * T | F
F -> ( E ) | id
```

**Format:**
- `NonTerminal -> Production1 | Production2 | ...`
- Use `|` to separate alternatives
- Use `ε` or empty for epsilon productions

### 3. Generate Tables

Click **"Generate [LR(0)/SLR(1)] Tables"** to:
- Build DFA states
- Generate ACTION and GOTO tables
- Detect conflicts
- Compute FIRST/FOLLOW sets (for SLR(1))

### 4. View Results

- **Verdict**: See if grammar is LR(0) or SLR(1)
- **Item Sets**: View all LR(0) item sets
- **ACTION Table**: Shift/reduce actions with conflict highlighting
- **GOTO Table**: Non-terminal transitions
- **DFA Graph**: Interactive visualization
- **Explanation**: Step-by-step algorithm details

### 5. Parse Input Strings

1. Enter an input string (e.g., `id+id*id`)
2. Click **"Parse Input"**
3. View:
   - Accept/Reject verdict
   - Parse tree visualization
   - Step-by-step parsing process

## 📚 Example Grammars

### LR(0) Examples

**Simple Recursion:**
```
S -> A
A -> a A | b
```

**Balanced Parentheses:**
```
S -> A
A -> ( A ) | a
```

### SLR(1) Examples

**Arithmetic Expressions (Right Recursive):**
```
S -> E
E -> T + E | T
T -> F * T | F
F -> ( E ) | id
```

**Arithmetic Expressions (Left Recursive):**
```
S -> E
E -> E + T | T
T -> T * F | F
F -> ( E ) | id
```

## 🏗️ Project Structure

```
ParserGen-Studio/
├── app.py                    # Flask backend API
├── lr0_algorithm.py          # LR(0) algorithm implementation
├── slr1_algorithm.py         # SLR(1) algorithm implementation
├── lr0_parser.py             # Parser engine
├── tokenizer.py              # Input tokenizer
├── parse_tree.py             # Parse tree builder
├── requirements.txt          # Python dependencies
├── package.json              # Node.js dependencies
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── index.html                # HTML entry point
├── PROJECT_REPORT.md         # Complete project documentation
├── QUICK_START.md            # Quick start guide
└── src/
    ├── App.jsx               # Main React component
    ├── main.jsx              # React entry point
    ├── index.css             # Global styles
    └── components/
        ├── GrammarEditor.jsx      # Grammar input editor
        ├── ResultsPanel.jsx       # Results container with tabs
        ├── ItemSets.jsx          # LR(0) item sets display
        ├── ActionTable.jsx       # ACTION table with conflict highlighting
        ├── GotoTable.jsx         # GOTO table display
        ├── DFAGraph.jsx          # DFA visualization
        ├── ExplanationPanel.jsx  # Step-by-step explanation
        ├── ParserInput.jsx       # Input string entry
        ├── ParseResults.jsx      # Parse results display
        ├── ParseTree.jsx         # Parse tree visualization
        └── ParseSteps.jsx        # Parsing steps display
```

## 🔧 Technology Stack

### Backend
- **Python 3.8+**
- **Flask 3.0.0** - Web framework
- **Flask-CORS 4.0.0** - Cross-origin support

### Frontend
- **React 18.2.0** - UI framework
- **Vite 5.0.8** - Build tool
- **Tailwind CSS 3.3.6** - Styling
- **D3.js 7.8.5** - Graph visualization

## 📡 API Endpoints

### POST `/api/generate`

Generate parsing tables from grammar.

**Request:**
```json
{
  "grammar": "S -> E\nE -> E + T | T",
  "parser_type": "lr0"  // or "slr1"
}
```

**Response:**
```json
{
  "augmented_grammar": ["S' → S", "S → E", ...],
  "states": [...],
  "action_table": {...},
  "goto_table": {...},
  "dfa_transitions": [...],
  "terminals": [...],
  "non_terminals": [...],
  "shift_reduce_conflicts": [...],
  "reduce_reduce_conflicts": [...],
  "is_lr0": true,
  "is_slr1": false,
  "first_sets": {...},  // for SLR(1)
  "follow_sets": {...},  // for SLR(1)
  "num_states": 5
}
```

### POST `/api/parse`

Parse an input string using generated tables.

**Request:**
```json
{
  "grammar": "S -> E\nE -> E + T | T",
  "input": "id+id*id",
  "parser_type": "slr1"
}
```

**Response:**
```json
{
  "accepted": true,
  "parse_tree": {...},
  "steps": [...]
}
```

### GET `/api/health`

Health check endpoint.

## 🐛 Troubleshooting

### Backend Issues

**Port 5000 already in use:**
```bash
# Find and kill process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in app.py
```

**Module not found:**
```bash
pip install -r requirements.txt
```

### Frontend Issues

**Port 3000 already in use:**
```bash
# Find and kill process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Dependencies not installed:**
```bash
npm install
```

**CORS errors:**
- Make sure backend is running on port 5000
- Check that Flask-CORS is installed

### Common Issues

**Grammar not parsing:**
- Check grammar format (use `->` not `→`)
- Ensure terminals match input tokens
- Verify grammar is valid for selected parser type

**Tables not generating:**
- Check browser console for errors
- Verify backend is running
- Check grammar syntax

## 📝 Development

### Building for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Code Structure

- **Backend**: Python files in root directory
- **Frontend**: React components in `src/` directory
- **Configuration**: Config files in root directory

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

- Based on standard LR parsing algorithms from compiler design literature
- Uses D3.js for graph visualization
- Built with React and Flask

## 📧 Support

For issues, questions, or contributions, please refer to the project documentation in `PROJECT_REPORT.md`.

---

**Made with ❤️ for Compiler Design Education**
