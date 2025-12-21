"""
LR(0) Parser Engine
Uses ACTION and GOTO tables to parse input strings.
"""

from typing import List, Dict, Optional, Any, Tuple
from parse_tree import ParseTreeBuilder, ParseTreeNode
from tokenizer import Tokenizer


class LR0Parser:
    """LR(0) Parser that uses ACTION and GOTO tables to parse input."""
    
    def __init__(self, action_table: Dict[Tuple[int, str], str],
                 goto_table: Dict[Tuple[int, str], int],
                 productions: List[Any],
                 terminals: List[str],
                 start_symbol: str = "S'"):
        """
        Initialize LR(0) parser.
        
        Args:
            action_table: ACTION table {(state, terminal): action}
            goto_table: GOTO table {(state, non_terminal): next_state}
            productions: List of Production objects
            terminals: List of terminal symbols
            start_symbol: Augmented start symbol (default: "S'")
        """
        self.action_table = action_table
        self.goto_table = goto_table
        self.productions = productions
        self.terminals = terminals
        self.start_symbol = start_symbol
        self.tokenizer = Tokenizer(terminals)
        
        # Parse state
        self.stack: List[Any] = []  # Alternates: state, symbol, state, symbol, ...
        self.input_tokens: List[str] = []
        self.current_token_index: int = 0
        self.steps: List[Dict[str, Any]] = []
        self.tree_builder = ParseTreeBuilder(productions)
    
    def parse(self, input_string: str) -> Dict[str, Any]:
        """
        Parse input string using ACTION and GOTO tables.
        
        Args:
            input_string: Input string to parse
            
        Returns:
            Dictionary with parse results:
            {
                'accepted': bool,
                'error': str or None,
                'parse_tree': dict or None,
                'steps': list of parsing steps
            }
        """
        # Reset state
        self.stack = [0]  # Start with state 0
        self.current_token_index = 0
        self.steps = []
        self.tree_builder.reset()
        
        # Tokenize input
        try:
            self.input_tokens = self.tokenizer.tokenize_simple(input_string)
        except ValueError as e:
            return {
                'accepted': False,
                'error': str(e),
                'parse_tree': None,
                'steps': []
            }
        
        step_count = 0
        max_steps = 1000  # Prevent infinite loops
        
        while step_count < max_steps:
            step_count += 1
            
            # Get current state (top of stack)
            current_state = self.stack[-1] if self.stack else None
            
            if current_state is None:
                return {
                    'accepted': False,
                    'error': 'Stack is empty',
                    'parse_tree': None,
                    'steps': self.steps
                }
            
            # Get current token
            if self.current_token_index >= len(self.input_tokens):
                return {
                    'accepted': False,
                    'error': 'Unexpected end of input',
                    'parse_tree': None,
                    'steps': self.steps
                }
            
            current_token = self.input_tokens[self.current_token_index]
            
            # Look up action
            action_key = (current_state, current_token)
            action = self.action_table.get(action_key)
            
            # Record step
            step = {
                'step': step_count,
                'stack': self.stack.copy(),
                'input': self.input_tokens[self.current_token_index:],
                'action': action or 'ERROR',
                'state': current_state,
                'token': current_token
            }
            
            if action is None:
                # Error - no action defined
                step['error'] = f"No action defined for state {current_state} and token '{current_token}'"
                self.steps.append(step)
                return {
                    'accepted': False,
                    'error': step['error'],
                    'parse_tree': None,
                    'steps': self.steps
                }
            
            # Handle action
            if action == 'accept':
                # Success!
                step['message'] = 'Input accepted!'
                self.steps.append(step)
                parse_tree = self.tree_builder.get_tree()
                return {
                    'accepted': True,
                    'error': None,
                    'parse_tree': parse_tree.to_dict() if parse_tree else None,
                    'steps': self.steps
                }
            
            elif action.startswith('s'):
                # Shift action: sN means shift and go to state N
                next_state = int(action[1:])
                
                # Push token and state
                self.stack.append(current_token)
                self.stack.append(next_state)
                
                # Add to parse tree
                self.tree_builder.shift(current_token)
                
                # Move to next token
                self.current_token_index += 1
                
                step['message'] = f'Shift {current_token}, goto state {next_state}'
                self.steps.append(step)
            
            elif action.startswith('r'):
                # Reduce action: rN means reduce using production N
                production_index = int(action[1:])
                
                if production_index >= len(self.productions):
                    step['error'] = f'Invalid production index: {production_index}'
                    self.steps.append(step)
                    return {
                        'accepted': False,
                        'error': step['error'],
                        'parse_tree': None,
                        'steps': self.steps
                    }
                
                production = self.productions[production_index]
                # For epsilon productions, num_symbols is 0
                num_symbols = len(production.right) * 2 if production.right else 0  # Each symbol has state and symbol
                
                # Pop symbols from stack
                if len(self.stack) < num_symbols:
                    step['error'] = f'Stack underflow: trying to pop {num_symbols} items from stack of size {len(self.stack)}'
                    self.steps.append(step)
                    return {
                        'accepted': False,
                        'error': step['error'],
                        'parse_tree': None,
                        'steps': self.steps
                    }
                
                # Pop symbols (and their states)
                popped_symbols = []
                for _ in range(num_symbols):
                    popped_symbols.insert(0, self.stack.pop())
                
                # Get state after popping
                if not self.stack:
                    step['error'] = 'Stack empty after popping'
                    self.steps.append(step)
                    return {
                        'accepted': False,
                        'error': step['error'],
                        'parse_tree': None,
                        'steps': self.steps
                    }
                
                state_after_pop = self.stack[-1]
                
                # Look up GOTO
                goto_key = (state_after_pop, production.left)
                next_state = self.goto_table.get(goto_key)
                
                if next_state is None:
                    step['error'] = f'No GOTO defined for state {state_after_pop} and non-terminal {production.left}'
                    self.steps.append(step)
                    return {
                        'accepted': False,
                        'error': step['error'],
                        'parse_tree': None,
                        'steps': self.steps
                    }
                
                # Push non-terminal and new state
                self.stack.append(production.left)
                self.stack.append(next_state)
                
                # Update parse tree
                num_rhs_symbols = len(production.right) if production.right else 0
                self.tree_builder.reduce(production_index, num_rhs_symbols)
                
                step['message'] = f'Reduce {production}, goto state {next_state}'
                step['production'] = str(production)
                self.steps.append(step)
            
            else:
                # Unknown action
                step['error'] = f'Unknown action: {action}'
                self.steps.append(step)
                return {
                    'accepted': False,
                    'error': step['error'],
                    'parse_tree': None,
                    'steps': self.steps
                }
        
        # Too many steps
        return {
            'accepted': False,
            'error': f'Parser exceeded maximum steps ({max_steps})',
            'parse_tree': None,
            'steps': self.steps
        }

