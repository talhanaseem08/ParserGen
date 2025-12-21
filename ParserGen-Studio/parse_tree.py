"""
Parse tree construction for LR(0) parser.
Builds a parse tree showing how input was parsed.
"""

from typing import List, Optional, Any, Dict
from dataclasses import dataclass, field


@dataclass
class ParseTreeNode:
    """Represents a node in the parse tree."""
    symbol: str  # Terminal or non-terminal
    children: List['ParseTreeNode'] = field(default_factory=list)
    production: Optional[str] = None  # Production used (for non-terminals)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert node to dictionary for JSON serialization."""
        return {
            'symbol': self.symbol,
            'production': self.production,
            'children': [child.to_dict() for child in self.children]
        }
    
    def __repr__(self):
        if self.children:
            return f"{self.symbol}({', '.join(str(c) for c in self.children)})"
        return self.symbol


class ParseTreeBuilder:
    """Builds parse tree from reduce operations."""
    
    def __init__(self, productions: List[Any]):
        """
        Initialize parse tree builder.
        
        Args:
            productions: List of Production objects
        """
        self.productions = productions
        self.tree_stack: List[ParseTreeNode] = []
    
    def reduce(self, production_index: int, num_symbols: int):
        """
        Perform a reduce operation and build parse tree.
        
        Args:
            production_index: Index of production to apply
            num_symbols: Number of symbols to pop from stack
        """
        if production_index >= len(self.productions):
            return
        
        production = self.productions[production_index]
        left_hand_side = production.left
        
        # Pop children from tree stack
        children = []
        for _ in range(num_symbols):
            if self.tree_stack:
                children.insert(0, self.tree_stack.pop())
        
        # Create new node
        node = ParseTreeNode(
            symbol=left_hand_side,
            children=children,
            production=str(production)
        )
        
        # Push new node
        self.tree_stack.append(node)
    
    def shift(self, symbol: str):
        """
        Perform a shift operation (add terminal node).
        
        Args:
            symbol: Terminal symbol to add
        """
        node = ParseTreeNode(symbol=symbol)
        self.tree_stack.append(node)
    
    def get_tree(self) -> Optional[ParseTreeNode]:
        """
        Get the final parse tree.
        
        Returns:
            Root node of parse tree, or None if tree is incomplete
        """
        if len(self.tree_stack) == 1:
            return self.tree_stack[0]
        return None
    
    def reset(self):
        """Reset the tree builder."""
        self.tree_stack = []

