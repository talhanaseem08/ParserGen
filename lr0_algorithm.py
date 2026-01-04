"""
LR(0) Parsing Table Generator
Implements the complete LR(0) algorithm including:
- Grammar augmentation
- LR(0) item generation
- Closure computation
- GOTO computation
- DFA state construction
- ACTION and GOTO table generation
- Conflict detection
"""

from typing import List, Dict, Set, Tuple, Optional, Any
from collections import defaultdict, OrderedDict
from dataclasses import dataclass, field


@dataclass
class Production:
    """Represents a grammar production rule."""
    left: str  # Non-terminal
    right: List[str]  # Right-hand side (list of symbols)
    
    def __str__(self):
        return f"{self.left} → {' '.join(self.right) if self.right else 'ε'}"
    
    def __hash__(self):
        return hash((self.left, tuple(self.right)))
    
    def __eq__(self, other):
        return isinstance(other, Production) and self.left == other.left and self.right == other.right


@dataclass
class LR0Item:
    """Represents an LR(0) item with a dot position."""
    production: Production
    dot_position: int  # Position of dot in the right-hand side
    
    def __str__(self):
        rhs = self.production.right.copy()
        rhs.insert(self.dot_position, '•')
        rhs_str = ' '.join(rhs) if rhs else '•'
        return f"{self.production.left} → {rhs_str}"
    
    def __hash__(self):
        return hash((self.production, self.dot_position))
    
    def __eq__(self, other):
        return isinstance(other, LR0Item) and \
               self.production == other.production and \
               self.dot_position == other.dot_position
    
    def is_reduce_item(self) -> bool:
        """Check if this is a reduce item (dot at the end)."""
        return self.dot_position >= len(self.production.right)
    
    def is_accept_item(self) -> bool:
        """Check if this is an accept item (S' → S•)."""
        return self.production.left == "S'" and self.is_reduce_item()
    
    def next_symbol(self) -> Optional[str]:
        """Get the symbol after the dot, or None if dot is at the end."""
        if self.dot_position < len(self.production.right):
            return self.production.right[self.dot_position]
        return None


class LR0ParserGenerator:
    """LR(0) Parser Table Generator."""
    
    def __init__(self, grammar: Dict[str, List[List[str]]]):
        """
        Initialize with a grammar.
        
        Args:
            grammar: Dictionary mapping non-terminals to list of productions
                    Example: {'S': [['E'], ['a']], 'E': [['E', '+', 'T'], ['T']]}
        """
        self.original_grammar = grammar
        self.productions: List[Production] = []
        self.non_terminals: Set[str] = set()
        self.terminals: Set[str] = set()
        self.start_symbol = None
        self.augmented_start = "S'"
        
        # Parse grammar and extract symbols
        self._parse_grammar()
        self._extract_symbols()
        
        # Augment grammar
        self._augment_grammar()
        
        # LR(0) items and states
        self.items: List[LR0Item] = []
        self.states: List[Set[LR0Item]] = []
        self.goto_map: Dict[Tuple[int, str], int] = {}  # (state, symbol) -> next_state
        
        # Parsing tables
        self.action_table: Dict[Tuple[int, str], str] = {}  # (state, terminal) -> action
        self.goto_table: Dict[Tuple[int, str], int] = {}  # (state, non_terminal) -> state
        
        # Conflict tracking
        self.shift_reduce_conflicts: List[Dict[str, Any]] = []
        self.reduce_reduce_conflicts: List[Dict[str, Any]] = []
        self.is_lr0: bool = True
    
    def _parse_grammar(self):
        """Parse the input grammar into Production objects."""
        if not self.original_grammar:
            raise ValueError("Grammar cannot be empty")
        
        # Find start symbol (first non-terminal in grammar)
        self.start_symbol = list(self.original_grammar.keys())[0]
        
        for left, right_sides in self.original_grammar.items():
            self.non_terminals.add(left)
            for right in right_sides:
                # Handle epsilon (empty production)
                if right == ['ε'] or right == []:
                    self.productions.append(Production(left, []))
                else:
                    self.productions.append(Production(left, right))
    
    def _extract_symbols(self):
        """Extract all terminals and non-terminals from the grammar."""
        for prod in self.productions:
            for symbol in prod.right:
                if symbol not in self.non_terminals:
                    self.terminals.add(symbol)
    
    def _augment_grammar(self):
        """Augment the grammar by adding S' → S production."""
        # Add augmented start production
        augmented_prod = Production(self.augmented_start, [self.start_symbol])
        self.productions.insert(0, augmented_prod)
        self.non_terminals.add(self.augmented_start)
    
    def closure(self, items: Set[LR0Item]) -> Set[LR0Item]:
        """
        Compute the closure of a set of LR(0) items.
        
        Closure rule: If A → α•Bβ is in closure, and B → γ is a production,
        then add B → •γ to closure.
        """
        closure_set = set(items)
        changed = True
        
        while changed:
            changed = False
            new_items = set()
            
            for item in closure_set:
                next_sym = item.next_symbol()
                if next_sym and next_sym in self.non_terminals:
                    # Add all productions of this non-terminal with dot at start
                    for prod in self.productions:
                        if prod.left == next_sym:
                            new_item = LR0Item(prod, 0)
                            if new_item not in closure_set:
                                new_items.add(new_item)
                                changed = True
            
            closure_set.update(new_items)
        
        return closure_set
    
    def goto(self, items: Set[LR0Item], symbol: str) -> Set[LR0Item]:
        """
        Compute GOTO(I, X) where I is a set of items and X is a symbol.
        
        GOTO rule: Move dot over X and compute closure.
        """
        goto_set = set()
        
        for item in items:
            next_sym = item.next_symbol()
            if next_sym == symbol:
                # Move dot forward
                new_item = LR0Item(item.production, item.dot_position + 1)
                goto_set.add(new_item)
        
        return self.closure(goto_set)
    
    def build_dfa(self):
        """Build the LR(0) DFA by constructing all states."""
        # Initialize I0 with augmented start item
        initial_item = LR0Item(self.productions[0], 0)
        I0 = self.closure({initial_item})
        
        self.states = [I0]
        self.goto_map = {}
        state_queue = [0]
        processed = set()
        
        while state_queue:
            state_idx = state_queue.pop(0)
            if state_idx in processed:
                continue
            processed.add(state_idx)
            
            current_state = self.states[state_idx]
            
            # Find all symbols that can be transitioned over
            symbols = set()
            for item in current_state:
                next_sym = item.next_symbol()
                if next_sym:
                    symbols.add(next_sym)
            
            # Sort symbols to make state creation deterministic
            # Process start symbol first, then other non-terminals, then terminals
            def symbol_key(s):
                if s == self.start_symbol:
                    return (0, s)  # Start symbol first
                elif s in self.non_terminals:
                    return (1, s)  # Other non-terminals second
                else:
                    return (2, s)  # Terminals last
            sorted_symbols = sorted(symbols, key=symbol_key)
            
            # Compute GOTO for each symbol
            for symbol in sorted_symbols:
                new_state = self.goto(current_state, symbol)
                
                if not new_state:
                    continue
                
                # Check if this state already exists
                existing_idx = None
                for idx, existing_state in enumerate(self.states):
                    # Compare sets - they are equal if they have the same items
                    if len(existing_state) == len(new_state) and existing_state == new_state:
                        existing_idx = idx
                        break
                
                if existing_idx is None:
                    # New state
                    existing_idx = len(self.states)
                    self.states.append(new_state)
                    state_queue.append(existing_idx)
                
                # Record transition
                self.goto_map[(state_idx, symbol)] = existing_idx
    
    def build_parsing_tables(self):
        """Build ACTION and GOTO parsing tables."""
        self.action_table = {}
        self.goto_table = {}
        self.shift_reduce_conflicts = []
        self.reduce_reduce_conflicts = []
        self.is_lr0 = True
        
        for state_idx, state in enumerate(self.states):
            for item in state:
                next_sym = item.next_symbol()
                
                if item.is_accept_item():
                    # Accept action
                    if (state_idx, '$') in self.action_table:
                        # Conflict
                        self.is_lr0 = False
                    self.action_table[(state_idx, '$')] = 'accept'
                
                elif next_sym and next_sym in self.terminals:
                    # Shift action
                    next_state = self.goto_map.get((state_idx, next_sym))
                    if next_state is not None:
                        action_key = (state_idx, next_sym)
                        if action_key in self.action_table:
                            # Shift/Reduce conflict
                            existing_action = self.action_table[action_key]
                            if existing_action.startswith('r') and existing_action != 'accept':
                                self.is_lr0 = False
                                self.shift_reduce_conflicts.append({
                                    'state': state_idx,
                                    'symbol': next_sym,
                                    'shift': f"s{next_state}",
                                    'reduce': existing_action
                                })
                                # Keep shift (default resolution)
                                self.action_table[action_key] = f"s{next_state}"
                        else:
                            self.action_table[action_key] = f"s{next_state}"
                
                elif item.is_reduce_item() and not item.is_accept_item():
                    # Reduce action (but not accept item - that's handled separately)
                    prod_idx = self.productions.index(item.production)
                    reduce_action = f"r{prod_idx}"
                    
                    # Add reduce action for all terminals (including $)
                    for terminal in self.terminals:
                        action_key = (state_idx, terminal)
                        if action_key in self.action_table:
                            existing_action = self.action_table[action_key]
                            if existing_action.startswith('s'):
                                # Shift/Reduce conflict
                                self.is_lr0 = False
                                self.shift_reduce_conflicts.append({
                                    'state': state_idx,
                                    'symbol': terminal,
                                    'shift': existing_action,
                                    'reduce': reduce_action
                                })
                                # Don't overwrite shift action
                            elif existing_action.startswith('r'):
                                # Reduce/Reduce conflict
                                self.is_lr0 = False
                                self.reduce_reduce_conflicts.append({
                                    'state': state_idx,
                                    'symbol': terminal,
                                    'reduce1': existing_action,
                                    'reduce2': reduce_action
                                })
                                # Keep first reduce (or could keep second)
                        else:
                            self.action_table[action_key] = reduce_action
                    
                    # Also add for end marker
                    action_key = (state_idx, '$')
                    if action_key in self.action_table:
                        existing_action = self.action_table[action_key]
                        if existing_action == 'accept':
                            # Don't overwrite accept
                            pass
                        elif existing_action.startswith('r'):
                            # Reduce/Reduce conflict
                            self.is_lr0 = False
                            self.reduce_reduce_conflicts.append({
                                'state': state_idx,
                                'symbol': '$',
                                'reduce1': existing_action,
                                'reduce2': reduce_action
                            })
                            self.action_table[action_key] = reduce_action
                        else:
                            self.action_table[action_key] = reduce_action
                    else:
                        self.action_table[action_key] = reduce_action
            
            # Build GOTO table for non-terminals
            for non_terminal in self.non_terminals:
                if (state_idx, non_terminal) in self.goto_map:
                    next_state = self.goto_map[(state_idx, non_terminal)]
                    self.goto_table[(state_idx, non_terminal)] = next_state
    
    def generate(self) -> Dict[str, Any]:
        """Generate complete LR(0) parsing tables and return results."""
        self.build_dfa()
        self.build_parsing_tables()
        
        # Format states for display
        formatted_states = []
        for idx, state in enumerate(self.states):
            items_list = [str(item) for item in sorted(state, key=lambda x: (x.production.left, x.dot_position))]
            formatted_states.append({
                'id': idx,
                'items': items_list
            })
        
        # Format productions
        formatted_productions = [str(prod) for prod in self.productions]
        
        # Format ACTION table
        action_table_formatted = {}
        for (state, symbol), action in self.action_table.items():
            if state not in action_table_formatted:
                action_table_formatted[state] = {}
            action_table_formatted[state][symbol] = action
        
        # Format GOTO table
        goto_table_formatted = {}
        for (state, non_terminal), next_state in self.goto_table.items():
            if state not in goto_table_formatted:
                goto_table_formatted[state] = {}
            goto_table_formatted[state][non_terminal] = next_state
        
        # Format DFA transitions
        dfa_transitions = []
        for (state, symbol), next_state in self.goto_map.items():
            dfa_transitions.append({
                'from': state,
                'to': next_state,
                'symbol': symbol
            })
        
        return {
            'augmented_grammar': formatted_productions,
            'states': formatted_states,
            'action_table': action_table_formatted,
            'goto_table': goto_table_formatted,
            'dfa_transitions': dfa_transitions,
            'terminals': sorted(list(self.terminals)) + ['$'],
            'non_terminals': sorted(list(self.non_terminals)),
            'shift_reduce_conflicts': self.shift_reduce_conflicts,
            'reduce_reduce_conflicts': self.reduce_reduce_conflicts,
            'is_lr0': self.is_lr0,
            'num_states': len(self.states)
        }

