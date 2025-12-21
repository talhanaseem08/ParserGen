# LR(0) and SLR(1) Parser Generator - Project Report

## Table of Contents

1. [Introduction](#1-introduction)
2. [Literature Review](#2-literature-review)
3. [Methodology](#3-methodology)
4. [Implementation](#4-implementation)
5. [Results and Conclusions](#5-results-and-conclusions)
6. [Appendix A: Code](#appendix-a-code)
7. [Appendix B: Configuration Files](#appendix-b-configuration-files)
8. [Appendix C: Database Scheme](#appendix-c-database-scheme)

---

## 1. Introduction

### 1.1 Project Overview

This project implements an educational tool for generating LR(0) and SLR(1) parsing tables from context-free grammars. The tool provides a comprehensive web-based interface for learning and understanding bottom-up parsing algorithms, including automatic table generation, conflict detection, DFA visualization, and input string parsing capabilities.

### 1.2 Objectives

The primary objectives of this project are:

1. **Educational Tool Development**: Create an interactive platform for learning LR(0) and SLR(1) parsing algorithms
2. **Algorithm Implementation**: Implement complete LR(0) and SLR(1) algorithms including:
   - Grammar augmentation
   - LR(0) item generation
   - Closure and GOTO computation
   - FIRST and FOLLOW set computation (for SLR(1))
   - DFA state construction
   - ACTION and GOTO table generation
3. **Conflict Detection**: Automatically detect and highlight Shift/Reduce and Reduce/Reduce conflicts
4. **Visualization**: Provide interactive DFA visualization and parse tree display
5. **Input Parsing**: Enable parsing of input strings using generated tables

### 1.3 Problem Statement

Understanding parsing algorithms is fundamental to compiler design, but the complexity of constructing parsing tables manually makes it difficult for students to grasp the concepts. This project addresses this challenge by providing an automated, visual, and interactive tool that:

- Generates parsing tables automatically from grammar input
- Visualizes the DFA construction process
- Shows step-by-step parsing of input strings
- Highlights conflicts and explains why they occur

### 1.4 Scope

The project scope includes:

- **LR(0) Parser Generator**: Complete implementation of LR(0) algorithm
- **SLR(1) Parser Generator**: Extension to SLR(1) with FOLLOW set computation
- **Web-based UI**: Modern React interface with Tailwind CSS
- **Backend API**: Flask-based REST API
- **Visualization**: DFA graph visualization using D3.js
- **Input Parser**: Full parser engine for parsing input strings

### 1.5 Significance

This tool serves as:
- An educational resource for compiler design courses
- A debugging tool for grammar development
- A learning aid for understanding parsing algorithms
- A reference implementation of LR(0) and SLR(1) algorithms

---

## 2. Literature Review

### 2.1 Bottom-Up Parsing

Bottom-up parsing is a fundamental technique in compiler design where parsing proceeds from leaves to root, building the parse tree from the bottom. LR parsing is a class of bottom-up parsing methods that read input from left to right and construct a rightmost derivation in reverse.

### 2.2 LR(0) Parsing

**LR(0)** (Left-to-Right, Rightmost derivation, 0 lookahead) is the simplest form of LR parsing:

- **Characteristics**:
  - No lookahead symbols
  - Makes parsing decisions based solely on current state
  - Very restrictive - can only parse a limited set of grammars

- **Key Concepts**:
  - **LR(0) Items**: Productions with a dot (•) indicating parsing position
  - **Closure**: Adding items when dot is before a non-terminal
  - **GOTO**: Transitioning to new states by moving dot over symbols
  - **DFA Construction**: Building states from item sets

- **Limitations**:
  - Many grammars have conflicts
  - Cannot handle arithmetic expressions with operators
  - Requires very specific grammar structure

### 2.3 SLR(1) Parsing

**SLR(1)** (Simple LR(1)) extends LR(0) with one symbol of lookahead:

- **Key Difference from LR(0)**:
  - Uses FOLLOW sets to determine when to reduce
  - Reduces only on terminals in FOLLOW set (not all terminals)
  - More powerful than LR(0)

- **FIRST Sets**: Terminals that can start a derivation
- **FOLLOW Sets**: Terminals that can follow a non-terminal
- **Advantages**:
  - Can parse arithmetic expressions
  - Handles more complex grammars
  - Still simpler than full LR(1)

### 2.4 Related Work

Several parser generators exist (yacc, bison, ANTLR), but they:
- Focus on production use, not education
- Don't show the algorithm steps
- Lack visualization of the construction process

This project fills the gap by providing:
- Educational focus
- Step-by-step explanations
- Visual representations
- Interactive learning

### 2.5 Theoretical Foundation

The implementation is based on:
- **Aho, Sethi, Ullman**: "Compilers: Principles, Techniques, and Tools" (Dragon Book)
- Standard LR parsing algorithms
- DFA construction from item sets
- Conflict detection and resolution

---

## 3. Methodology

### 3.1 System Architecture

The system follows a **client-server architecture**:

```
┌─────────────────┐
│   React UI      │  (Frontend)
│   - Grammar Edit│
│   - Tables      │
│   - Visualization│
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│   Flask API     │  (Backend)
│   - LR(0) Algo  │
│   - SLR(1) Algo │
│   - Parser      │
└─────────────────┘
```

### 3.2 Algorithm Design

#### 3.2.1 LR(0) Algorithm

**Step 1: Grammar Augmentation**
```
Original: S → E
Augmented: S' → S
```

**Step 2: LR(0) Item Generation**
```
For each production A → αβ:
  Create items: A → •αβ, A → α•β, A → αβ•
```

**Step 3: Closure Computation**
```
CLOSURE(I):
  repeat
    for each item [A → α•Bβ] in I:
      for each production B → γ:
        add [B → •γ] to I
  until no more items added
```

**Step 4: GOTO Computation**
```
GOTO(I, X):
  J = {}
  for each item [A → α•Xβ] in I:
    add [A → αX•β] to J
  return CLOSURE(J)
```

**Step 5: DFA Construction**
```
States = {I0 = CLOSURE({[S' → •S]})}
while new states can be created:
  for each state I and symbol X:
    if GOTO(I, X) is not empty:
      add new state or transition
```

**Step 6: ACTION Table**
```
For each state I:
  if [A → α•aβ] in I:
    ACTION[I, a] = shift GOTO(I, a)
  if [A → α•] in I (A ≠ S'):
    ACTION[I, b] = reduce A → α (for all terminals b)
  if [S' → S•] in I:
    ACTION[I, $] = accept
```

#### 3.2.2 SLR(1) Algorithm

**Additional Steps:**

**Step 1: FIRST Set Computation**
```
FIRST(terminal) = {terminal}
FIRST(non-terminal):
  For each production A → α:
    FIRST(A) includes FIRST(α) - {ε}
    If ε in FIRST(α):
      FIRST(A) includes ε
```

**Step 2: FOLLOW Set Computation**
```
FOLLOW(S') = {$}
For each production A → αBβ:
  FOLLOW(B) includes FIRST(β) - {ε}
  If ε in FIRST(β):
    FOLLOW(B) includes FOLLOW(A)
```

**Step 3: ACTION Table (SLR(1))**
```
For reduce item [A → α•]:
  ACTION[I, a] = reduce A → α
  ONLY for terminals a in FOLLOW(A)
  (Not for all terminals like LR(0))
```

### 3.3 Conflict Detection

**Shift/Reduce Conflict:**
- Occurs when: `ACTION[state, terminal]` has both shift and reduce
- Detection: Check if same cell has both 's' and 'r' actions

**Reduce/Reduce Conflict:**
- Occurs when: `ACTION[state, terminal]` has multiple reduce actions
- Detection: Check if same cell has multiple 'r' actions

### 3.4 Parsing Algorithm

**Input Parsing Process:**
```
1. Initialize stack with state 0
2. While not done:
   a. Read current token
   b. Look up ACTION[current_state, token]
   c. If SHIFT: push token and new state
   d. If REDUCE: pop symbols, apply production, push non-terminal
   e. If ACCEPT: success
   f. If ERROR: reject
```

---

## 4. Implementation

### 4.1 Technology Stack

**Backend:**
- Python 3.8+
- Flask 3.0.0 (Web framework)
- Flask-CORS 4.0.0 (Cross-origin support)

**Frontend:**
- React 18.2.0 (UI framework)
- Tailwind CSS 3.3.6 (Styling)
- D3.js 7.8.5 (Graph visualization)
- Vite 5.0.8 (Build tool)

### 4.2 Project Structure

```
lr0-parser-generator/
├── app.py                    # Flask backend API
├── lr0_algorithm.py          # LR(0) algorithm implementation
├── slr1_algorithm.py         # SLR(1) algorithm implementation
├── lr0_parser.py             # Parser engine
├── tokenizer.py              # Input tokenizer
├── parse_tree.py             # Parse tree builder
├── requirements.txt          # Python dependencies
├── package.json              # Node.js dependencies
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
├── index.html                # HTML entry point
└── src/
    ├── App.jsx               # Main React component
    ├── main.jsx              # React entry point
    ├── index.css             # Global styles
    └── components/
        ├── GrammarEditor.jsx      # Grammar input
        ├── ResultsPanel.jsx       # Results container
        ├── ItemSets.jsx          # Item sets display
        ├── ActionTable.jsx       # ACTION table
        ├── GotoTable.jsx         # GOTO table
        ├── DFAGraph.jsx          # DFA visualization
        ├── ExplanationPanel.jsx # Step-by-step explanation
        ├── ParserInput.jsx       # Input string entry
        ├── ParseResults.jsx      # Parse results display
        ├── ParseTree.jsx         # Parse tree visualization
        └── ParseSteps.jsx        # Parsing steps
```

### 4.3 Core Components

#### 4.3.1 LR(0) Algorithm (`lr0_algorithm.py`)

**Key Classes:**
- `Production`: Represents grammar production rules
- `LR0Item`: Represents LR(0) items with dot position
- `LR0ParserGenerator`: Main algorithm implementation

**Key Methods:**
- `closure()`: Computes closure of item set
- `goto()`: Computes GOTO function
- `build_dfa()`: Constructs DFA states
- `build_parsing_tables()`: Generates ACTION and GOTO tables

#### 4.3.2 SLR(1) Algorithm (`slr1_algorithm.py`)

**Extends:** `LR0ParserGenerator`

**Additional Methods:**
- `compute_first_sets()`: Computes FIRST sets
- `compute_follow_sets()`: Computes FOLLOW sets
- `first_of_string()`: Computes FIRST for string of symbols
- `build_parsing_tables()`: Overridden to use FOLLOW sets

#### 4.3.3 Parser Engine (`lr0_parser.py`)

**Key Features:**
- Uses ACTION/GOTO tables to parse input
- Maintains parsing stack
- Tracks parsing steps
- Builds parse tree
- Returns accept/reject with details

#### 4.3.4 Frontend Components

**GrammarEditor:**
- Grammar input textarea
- Parser type selection (LR(0)/SLR(1))
- Example grammar buttons
- Auto-updates examples based on parser type

**ResultsPanel:**
- Tabbed interface for tables
- Item Sets, ACTION, GOTO tables
- Color-coded conflict highlighting

**DFAGraph:**
- Interactive D3.js visualization
- Draggable nodes
- Transition labels
- State visualization

**ParseResults:**
- Accept/Reject verdict
- Parse tree visualization
- Step-by-step parsing display

### 4.4 API Endpoints

**POST /api/generate**
- Input: `{grammar: string, parser_type: 'lr0'|'slr1'}`
- Output: Parsing tables, states, conflicts, FIRST/FOLLOW sets

**POST /api/parse**
- Input: `{grammar: string, input: string, parser_type: 'lr0'|'slr1'}`
- Output: Parse result, parse tree, parsing steps

**GET /api/health**
- Health check endpoint

### 4.5 Key Algorithms Implemented

#### Grammar Augmentation
```python
def _augment_grammar(self):
    augmented_prod = Production("S'", [self.start_symbol])
    self.productions.insert(0, augmented_prod)
```

#### Closure Computation
```python
def closure(self, items: Set[LR0Item]) -> Set[LR0Item]:
    closure_set = set(items)
    while changed:
        for item in closure_set:
            if next_symbol is non-terminal:
                add all productions of that non-terminal
    return closure_set
```

#### FOLLOW Set Computation
```python
def compute_follow_sets(self):
    FOLLOW(S') = {$}
    For each production A → αBβ:
        FOLLOW(B) += FIRST(β) - {ε}
        If ε in FIRST(β):
            FOLLOW(B) += FOLLOW(A)
```

---

## 5. Results and Conclusions

### 5.1 Test Results

#### 5.1.1 LR(0) Grammar Tests

**Test 1: Simple Recursion**
```
Grammar: S -> A; A -> a A | b
Result: ✓ LR(0) - No conflicts
States: 6
Input: "a b" → ACCEPT ✓
```

**Test 2: Balanced Parentheses**
```
Grammar: S -> A; A -> ( A ) | a
Result: ✓ LR(0) - No conflicts
States: 7
Input: "(a)" → ACCEPT ✓
```

#### 5.1.2 SLR(1) Grammar Tests

**Test 1: Arithmetic Expressions (Right Recursive)**
```
Grammar: S -> E; E -> T + E | T; T -> F * T | F; F -> ( E ) | id
Result: ✓ SLR(1) - No conflicts
States: 13
Input: "id+id*id" → ACCEPT ✓
```

**Test 2: Arithmetic Expressions (Left Recursive)**
```
Grammar: S -> E; E -> E + T | T; T -> T * F | F; F -> ( E ) | id
Result: ✓ SLR(1) - No conflicts
States: 13
Input: "id+id*id" → ACCEPT ✓
```

### 5.2 Performance Metrics

- **Table Generation**: < 1 second for typical grammars
- **DFA Construction**: Handles up to 50+ states efficiently
- **Parsing Speed**: Real-time parsing for input strings
- **UI Responsiveness**: Smooth interactions, no lag

### 5.3 Features Achieved

✅ **Complete LR(0) Implementation**
- Grammar augmentation
- Item set construction
- DFA building
- Table generation
- Conflict detection

✅ **Complete SLR(1) Implementation**
- FIRST set computation
- FOLLOW set computation
- SLR(1) table generation
- Conflict resolution

✅ **Full Parser Engine**
- Input tokenization
- Stack-based parsing
- Parse tree construction
- Step-by-step tracking

✅ **Rich UI Features**
- Interactive DFA visualization
- Color-coded tables
- Conflict highlighting
- Parse tree display
- Step-by-step explanations

### 5.4 Limitations

1. **LR(0) Restrictiveness**: Many grammars have conflicts in LR(0)
2. **SLR(1) Limitations**: Some grammars need full LR(1) or LALR(1)
3. **Grammar Format**: Requires specific input format
4. **No LALR(1) or LR(1)**: Only implements LR(0) and SLR(1)

### 5.5 Conclusions

**Success Criteria Met:**
- ✅ All core algorithms implemented correctly
- ✅ UI is intuitive and educational
- ✅ Visualizations aid understanding
- ✅ Parser successfully parses input strings
- ✅ Conflict detection works accurately

**Educational Value:**
- Provides hands-on learning experience
- Visual feedback enhances understanding
- Step-by-step explanations clarify concepts
- Interactive exploration of algorithms

**Technical Achievement:**
- Clean, modular code structure
- Extensible design (easy to add LR(1))
- Well-documented implementation
- Production-ready code quality

### 5.6 Future Enhancements

1. **LR(1) Implementation**: Full LR(1) with precise lookahead
2. **LALR(1) Support**: State merging for efficiency
3. **Grammar Validation**: Better error messages
4. **Export Features**: Export tables as images/PDF
5. **Batch Testing**: Test multiple grammars at once
6. **Performance Analysis**: Time/space complexity metrics

---

## Appendix A: Code

### A.1 Core Algorithm Files

#### A.1.1 LR(0) Algorithm (`lr0_algorithm.py`)

[Full code available in `lr0-parser-generator/lr0_algorithm.py`]

**Key Components:**
- `Production` class: Grammar production representation
- `LR0Item` class: LR(0) item with dot position
- `LR0ParserGenerator` class: Main algorithm implementation

**Line Count**: ~390 lines

#### A.1.2 SLR(1) Algorithm (`slr1_algorithm.py`)

[Full code available in `lr0-parser-generator/slr1_algorithm.py`]

**Key Components:**
- Extends `LR0ParserGenerator`
- `compute_first_sets()`: FIRST set computation
- `compute_follow_sets()`: FOLLOW set computation
- Overridden `build_parsing_tables()`: Uses FOLLOW sets

**Line Count**: ~330 lines

#### A.1.3 Parser Engine (`lr0_parser.py`)

[Full code available in `lr0-parser-generator/lr0_parser.py`]

**Key Components:**
- `LR0Parser` class: Parsing engine
- `parse()`: Main parsing method
- Stack management
- Parse tree building

**Line Count**: ~250 lines

#### A.1.4 Tokenizer (`tokenizer.py`)

[Full code available in `lr0-parser-generator/tokenizer.py`]

**Key Components:**
- `Tokenizer` class: Input tokenization
- `tokenize_simple()`: Space and operator splitting
- Token validation

**Line Count**: ~100 lines

#### A.1.5 Parse Tree (`parse_tree.py`)

[Full code available in `lr0-parser-generator/parse_tree.py`]

**Key Components:**
- `ParseTreeNode` class: Tree node structure
- `ParseTreeBuilder` class: Tree construction
- Tree serialization

**Line Count**: ~80 lines

#### A.1.6 Backend API (`app.py`)

[Full code available in `lr0-parser-generator/app.py`]

**Key Components:**
- Flask application setup
- `/api/generate` endpoint
- `/api/parse` endpoint
- Grammar parsing utility

**Line Count**: ~180 lines

### A.2 Frontend Components

#### A.2.1 Main App (`src/App.jsx`)

[Full code available in `lr0-parser-generator/src/App.jsx`]

**Key Features:**
- State management
- API integration
- Component orchestration

**Line Count**: ~180 lines

#### A.2.2 Grammar Editor (`src/components/GrammarEditor.jsx`)

[Full code available in `lr0-parser-generator/src/components/GrammarEditor.jsx`]

**Key Features:**
- Grammar input
- Parser type selection
- Example loading
- Auto-updating examples

**Line Count**: ~200 lines

#### A.2.3 DFA Graph (`src/components/DFAGraph.jsx`)

[Full code available in `lr0-parser-generator/src/components/DFAGraph.jsx`]

**Key Features:**
- D3.js integration
- Force-directed graph
- Interactive nodes
- Transition labels

**Line Count**: ~120 lines

#### A.2.4 Other Components

- `ActionTable.jsx`: ACTION table with conflict highlighting (~80 lines)
- `GotoTable.jsx`: GOTO table display (~60 lines)
- `ItemSets.jsx`: Item sets display (~40 lines)
- `ParseResults.jsx`: Results container (~80 lines)
- `ParseTree.jsx`: Tree visualization (~60 lines)
- `ParseSteps.jsx`: Step-by-step display (~120 lines)
- `ExplanationPanel.jsx`: Algorithm explanation (~110 lines)
- `ParserInput.jsx`: Input string entry (~70 lines)

**Total Frontend Code**: ~1,200 lines

### A.3 Total Code Statistics

- **Backend Python**: ~1,330 lines
- **Frontend React**: ~1,200 lines
- **Configuration**: ~150 lines
- **Total**: ~2,680 lines of code

---

## Appendix B: Configuration Files

### B.1 Python Dependencies (`requirements.txt`)

```
Flask==3.0.0
Flask-CORS==4.0.0
Werkzeug==3.0.1
```

### B.2 Node.js Dependencies (`package.json`)

```json
{
  "name": "lr0-parser-generator",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "d3": "^7.8.5"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.8"
  }
}
```

### B.3 Vite Configuration (`vite.config.js`)

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

### B.4 Tailwind Configuration (`tailwind.config.js`)

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### B.5 PostCSS Configuration (`postcss.config.js`)

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### B.6 HTML Entry Point (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LR(0) Parser Generator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## Appendix C: Database Scheme

### C.1 Database Usage

**This project does NOT use a database.**

The application is stateless and processes requests on-demand:
- Grammar input is sent via API request
- Parsing tables are generated in memory
- Results are returned immediately
- No data persistence required

### C.2 Data Flow

```
User Input → API Request → In-Memory Processing → API Response → UI Display
```

### C.3 Alternative: If Database Were Used

If persistence were needed, a database schema might include:

**Tables:**
- `grammars`: Store user grammars
- `parsing_tables`: Cache generated tables
- `parse_sessions`: Track parsing attempts
- `users`: User accounts (if multi-user)

**Schema Example:**
```sql
CREATE TABLE grammars (
    id INT PRIMARY KEY,
    user_id INT,
    grammar_text TEXT,
    parser_type VARCHAR(10),
    created_at TIMESTAMP
);

CREATE TABLE parsing_tables (
    id INT PRIMARY KEY,
    grammar_id INT,
    table_data JSON,
    created_at TIMESTAMP
);
```

However, for this educational tool, in-memory processing is sufficient and preferred for simplicity.

---

## References

1. Aho, A. V., Sethi, R., & Ullman, J. D. (1986). *Compilers: Principles, Techniques, and Tools*. Addison-Wesley.

2. Hopcroft, J. E., Motwani, R., & Ullman, J. D. (2006). *Introduction to Automata Theory, Languages, and Computation*. Pearson.

3. Grune, D., Bal, H. E., Jacobs, C. J., & Langendoen, K. G. (2012). *Modern Compiler Design*. Springer.

4. React Documentation: https://react.dev/

5. Flask Documentation: https://flask.palletsprojects.com/

6. D3.js Documentation: https://d3js.org/

---

## Acknowledgments

This project implements standard LR parsing algorithms as described in compiler design literature. The implementation follows established theoretical foundations while providing an educational interface for learning these concepts.

---

**Report Generated**: December 2024  
**Project**: LR(0) and SLR(1) Parser Generator  
**Version**: 1.0.0

