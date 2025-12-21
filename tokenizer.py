"""
Simple tokenizer for LR(0) parser input strings.
Converts input string into list of tokens.
"""

from typing import List


class Tokenizer:
    """Tokenizes input strings for LR(0) parser."""
    
    def __init__(self, terminals: List[str]):
        """
        Initialize tokenizer with list of valid terminals.
        
        Args:
            terminals: List of terminal symbols in the grammar
        """
        self.terminals = terminals
        # Sort by length (longest first) to match multi-character terminals first
        self.terminals_sorted = sorted(terminals, key=len, reverse=True)
    
    def tokenize(self, input_string: str) -> List[str]:
        """
        Tokenize input string into list of tokens.
        
        Args:
            input_string: Input string to tokenize
            
        Returns:
            List of tokens (terminals) with '$' appended at the end
        """
        if not input_string.strip():
            return ['$']
        
        tokens = []
        remaining = input_string.strip()
        
        while remaining:
            matched = False
            
            # Try to match each terminal (longest first)
            for terminal in self.terminals_sorted:
                # Handle special characters that need escaping
                if terminal.startswith(remaining[:len(terminal)]):
                    tokens.append(terminal)
                    remaining = remaining[len(terminal):].strip()
                    matched = True
                    break
                # For simple terminals, check if they match at start
                elif remaining.startswith(terminal):
                    tokens.append(terminal)
                    remaining = remaining[len(terminal):].strip()
                    matched = True
                    break
            
            if not matched:
                # Try to match single character
                if remaining:
                    char = remaining[0]
                    if char in self.terminals:
                        tokens.append(char)
                        remaining = remaining[1:].strip()
                    else:
                        # Unknown token - return error
                        raise ValueError(f"Unknown token: '{char}' at position {len(input_string) - len(remaining)}")
        
        # Add end marker
        tokens.append('$')
        return tokens
    
    def tokenize_simple(self, input_string: str) -> List[str]:
        """
        Simple tokenization - split by whitespace and operators.
        Automatically splits on operators like +, *, (, ), etc.
        Useful for grammars with space-separated tokens or expressions.
        
        Args:
            input_string: Input string to tokenize
            
        Returns:
            List of tokens
        """
        if not input_string.strip():
            return ['$']
        
        # Common operators that should be split
        operators = ['+', '-', '*', '/', '(', ')', '=', ',', ';', ':', '.', '&', '|', '!', '<', '>']
        
        # First, split by whitespace
        parts = input_string.split()
        tokens = []
        
        for part in parts:
            if not part.strip():
                continue
            
            # Check if part contains operators
            current_token = ''
            i = 0
            
            while i < len(part):
                char = part[i]
                
                # If it's an operator, add current token (if any) and the operator
                if char in operators:
                    if current_token:
                        tokens.append(current_token)
                        current_token = ''
                    tokens.append(char)
                else:
                    current_token += char
                
                i += 1
            
            # Add remaining token
            if current_token:
                tokens.append(current_token)
        
        # Validate tokens
        for token in tokens:
            if token not in self.terminals and token != '$':
                raise ValueError(f"Unknown token: '{token}'. Valid terminals: {self.terminals}")
        
        tokens.append('$')
        return tokens

