"""
SLR(1) Parsing Table Generator
Simple LR(1) - uses FOLLOW sets instead of precise lookahead
Extends LR(0) with FOLLOW set computation for reduce actions
"""

from typing import List, Dict, Set, Tuple, Optional, Any
from collections import defaultdict
from lr0_algorithm import LR0ParserGenerator, Production, LR0Item


class SLR1ParserGenerator(LR0ParserGenerator):
    """SLR(1) Parser Table Generator - extends LR(0) with FOLLOW sets."""
    
    def __init__(self, grammar: Dict[str, List[List[str]]]):
        """
        Initialize SLR(1) parser generator.
        
        Args:
            grammar: Dictionary mapping non-terminals to list of productions
        """
        super().__init__(grammar)
        self.first_sets: Dict[str, Set[str]] = {}
        self.follow_sets: Dict[str, Set[str]] = {}
        self.is_slr1: bool = True
        
    def compute_first_sets(self):
        """Compute FIRST sets for all symbols."""
        # Initialize FIRST sets
        for symbol in self.non_terminals | self.terminals:
            self.first_sets[symbol] = set()
        
        # FIRST(terminal) = {terminal}
        for terminal in self.terminals:
            self.first_sets[terminal].add(terminal)
        
        # Iterate until no changes
        changed = True
        while changed:
            changed = False
            
            for production in self.productions:
                left = production.left
                right = production.right
                
                if not right:
                    # Epsilon production: FIRST(A) includes ε
                    if 'ε' not in self.first_sets[left]:
                        self.first_sets[left].add('ε')
                        changed = True
                else:
                    # FIRST(A) includes FIRST(α) where A → α
                    all_have_epsilon = True
                    for symbol in right:
                        # Add FIRST(symbol) - {ε} to FIRST(left)
                        first_symbol = self.first_sets.get(symbol, set())
                        to_add = first_symbol - {'ε'}
                        if to_add - self.first_sets[left]:
                            self.first_sets[left].update(to_add)
                            changed = True
                        
                        if 'ε' not in first_symbol:
                            all_have_epsilon = False
                            break
                    
                    # If all symbols have ε, add ε to FIRST(left)
                    if all_have_epsilon and 'ε' not in self.first_sets[left]:
                        self.first_sets[left].add('ε')
                        changed = True
    
    def compute_follow_sets(self):
        """Compute FOLLOW sets for all non-terminals."""
        # Initialize FOLLOW sets
        for non_terminal in self.non_terminals:
            self.follow_sets[non_terminal] = set()
        
        # FOLLOW(S') contains $
        self.follow_sets[self.augmented_start].add('$')
        
        # Iterate until no changes
        changed = True
        while changed:
            changed = False
            
            for production in self.productions:
                left = production.left
                right = production.right
                
                if not right:
                    continue
                
                # For each production A → αBβ
                for i, symbol in enumerate(right):
                    if symbol not in self.non_terminals:
                        continue
                    
                    # FOLLOW(B) includes FIRST(β) - {ε}
                    beta = right[i + 1:]
                    if beta:
                        first_beta = self.first_of_string(beta)
                        to_add = first_beta - {'ε'}
                        if to_add - self.follow_sets[symbol]:
                            self.follow_sets[symbol].update(to_add)
                            changed = True
                        
                        # If ε in FIRST(β), FOLLOW(B) includes FOLLOW(A)
                        if 'ε' in first_beta:
                            if self.follow_sets[left] - self.follow_sets[symbol]:
                                self.follow_sets[symbol].update(self.follow_sets[left])
                                changed = True
                    else:
                        # β is empty, FOLLOW(B) includes FOLLOW(A)
                        if self.follow_sets[left] - self.follow_sets[symbol]:
                            self.follow_sets[symbol].update(self.follow_sets[left])
                            changed = True
    
    def first_of_string(self, symbols: List[str]) -> Set[str]:
        """Compute FIRST set for a string of symbols."""
        if not symbols:
            return {'ε'}
        
        first_set = set()
        all_have_epsilon = True
        
        for symbol in symbols:
            symbol_first = self.first_sets.get(symbol, set())
            first_set.update(symbol_first - {'ε'})
            
            if 'ε' not in symbol_first:
                all_have_epsilon = False
                break
        
        if all_have_epsilon:
            first_set.add('ε')
        
        return first_set
    
    def build_parsing_tables(self):
        """Build ACTION and GOTO parsing tables using SLR(1) method."""
        self.action_table = {}
        self.goto_table = {}
        self.shift_reduce_conflicts = []
        self.reduce_reduce_conflicts = []
        self.is_slr1 = True
        
        # Compute FIRST and FOLLOW sets
        self.compute_first_sets()
        self.compute_follow_sets()
        
        # Track which productions have been processed for reduce actions per state
        processed_reduces = {}  # state_idx -> set of production indices
        
        for state_idx, state in enumerate(self.states):
            processed_reduces[state_idx] = set()
            
            for item in state:
                next_sym = item.next_symbol()
                
                if item.is_accept_item():
                    # Accept action
                    if (state_idx, '$') in self.action_table:
                        self.is_slr1 = False
                    self.action_table[(state_idx, '$')] = 'accept'
                
                elif next_sym and next_sym in self.terminals:
                    # Shift action
                    next_state = self.goto_map.get((state_idx, next_sym))
                    if next_state is not None:
                        action_key = (state_idx, next_sym)
                        if action_key in self.action_table:
                            existing_action = self.action_table[action_key]
                            if existing_action.startswith('r') and existing_action != 'accept':
                                # Shift/Reduce conflict
                                self.is_slr1 = False
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
                    # Reduce action - SLR(1) key difference: only on FOLLOW set
                    prod_idx = self.productions.index(item.production)
                    
                    # Only process each production once per state
                    if prod_idx in processed_reduces[state_idx]:
                        continue
                    processed_reduces[state_idx].add(prod_idx)
                    
                    reduce_action = f"r{prod_idx}"
                    
                    # Get FOLLOW set of left-hand side
                    follow_set = self.follow_sets.get(item.production.left, set())
                    
                    # Add reduce action only for terminals in FOLLOW set
                    for terminal in follow_set:
                        action_key = (state_idx, terminal)
                        if action_key in self.action_table:
                            existing_action = self.action_table[action_key]
                            if existing_action.startswith('s'):
                                # Shift/Reduce conflict
                                self.is_slr1 = False
                                self.shift_reduce_conflicts.append({
                                    'state': state_idx,
                                    'symbol': terminal,
                                    'shift': existing_action,
                                    'reduce': reduce_action
                                })
                            elif existing_action.startswith('r') and existing_action != reduce_action:
                                # Reduce/Reduce conflict (only if different productions)
                                self.is_slr1 = False
                                self.reduce_reduce_conflicts.append({
                                    'state': state_idx,
                                    'symbol': terminal,
                                    'reduce1': existing_action,
                                    'reduce2': reduce_action
                                })
                        else:
                            self.action_table[action_key] = reduce_action
                    
                    # Also handle $ if in FOLLOW set
                    if '$' in follow_set:
                        action_key = (state_idx, '$')
                        if action_key in self.action_table:
                            existing_action = self.action_table[action_key]
                            if existing_action == 'accept':
                                pass  # Don't overwrite accept
                            elif existing_action.startswith('r') and existing_action != reduce_action:
                                # Reduce/Reduce conflict (only if different productions)
                                self.is_slr1 = False
                                self.reduce_reduce_conflicts.append({
                                    'state': state_idx,
                                    'symbol': '$',
                                    'reduce1': existing_action,
                                    'reduce2': reduce_action
                                })
                        else:
                            self.action_table[action_key] = reduce_action
            
            # Build GOTO table for non-terminals
            for non_terminal in self.non_terminals:
                if (state_idx, non_terminal) in self.goto_map:
                    next_state = self.goto_map[(state_idx, non_terminal)]
                    self.goto_table[(state_idx, non_terminal)] = next_state
    
    def generate(self) -> Dict[str, Any]:
        """Generate complete SLR(1) parsing tables and return results."""
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
        
        # Format FIRST sets
        first_sets_formatted = {}
        for symbol, first_set in self.first_sets.items():
            if symbol in self.non_terminals or symbol in self.terminals:
                first_sets_formatted[symbol] = sorted(list(first_set))
        
        # Format FOLLOW sets
        follow_sets_formatted = {}
        for non_terminal, follow_set in self.follow_sets.items():
            follow_sets_formatted[non_terminal] = sorted(list(follow_set))
        
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
            'is_lr0': self.is_slr1,  # For compatibility
            'is_slr1': self.is_slr1,
            'num_states': len(self.states),
            'first_sets': first_sets_formatted,
            'follow_sets': follow_sets_formatted
        }

