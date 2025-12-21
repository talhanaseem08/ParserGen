"""
Flask backend API for LR(0) Parser Generator
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from lr0_algorithm import LR0ParserGenerator
from slr1_algorithm import SLR1ParserGenerator
from lr0_parser import LR0Parser
import json
import re

app = Flask(__name__)
CORS(app)


def parse_grammar_input(grammar_text: str) -> dict:
    """
    Parse grammar input text into dictionary format.
    
    Expected format:
    S -> E
    E -> E + T | T
    T -> T * F | F
    F -> ( E ) | id
    """
    grammar = {}
    lines = grammar_text.strip().split('\n')
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        
        # Split by ->
        if '->' not in line:
            continue
        
        parts = line.split('->', 1)
        left = parts[0].strip()
        right = parts[1].strip()
        
        # Split multiple productions by |
        productions = [p.strip() for p in right.split('|')]
        
        if left not in grammar:
            grammar[left] = []
        
        for prod in productions:
            # Split production into symbols
            # Handle epsilon
            if prod == 'ε' or prod == 'epsilon' or prod == '':
                symbols = []
            else:
                # Split by whitespace, but preserve quoted strings
                symbols = []
                current = ''
                in_quotes = False
                
                for char in prod:
                    if char == '"' or char == "'":
                        in_quotes = not in_quotes
                        current += char
                    elif char.isspace() and not in_quotes:
                        if current:
                            symbols.append(current)
                            current = ''
                    else:
                        current += char
                
                if current:
                    symbols.append(current)
            
            grammar[left].append(symbols)
    
    return grammar


@app.route('/api/generate', methods=['POST'])
def generate_parser():
    """Generate LR(0) or SLR(1) parsing tables from grammar input."""
    try:
        data = request.get_json()
        grammar_text = data.get('grammar', '')
        parser_type = data.get('parser_type', 'lr0')  # 'lr0' or 'slr1'
        
        if not grammar_text:
            return jsonify({'error': 'Grammar input is required'}), 400
        
        # Parse grammar
        grammar = parse_grammar_input(grammar_text)
        
        if not grammar:
            return jsonify({'error': 'Invalid grammar format'}), 400
        
        # Generate parser based on type
        if parser_type == 'slr1':
            generator = SLR1ParserGenerator(grammar)
            result = generator.generate()
            result['parser_type'] = 'slr1'
        else:
            generator = LR0ParserGenerator(grammar)
            result = generator.generate()
            result['parser_type'] = 'lr0'
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/parse', methods=['POST'])
def parse_input():
    """Parse input string using generated LR(0) or SLR(1) parsing tables."""
    try:
        data = request.get_json()
        grammar_text = data.get('grammar', '')
        input_string = data.get('input', '')
        parser_type = data.get('parser_type', 'lr0')  # 'lr0' or 'slr1'
        
        if not grammar_text:
            return jsonify({'error': 'Grammar input is required'}), 400
        
        if input_string is None or input_string == '':
            return jsonify({'error': 'Input string is required'}), 400
        
        # Parse grammar
        grammar = parse_grammar_input(grammar_text)
        
        if not grammar:
            return jsonify({'error': 'Invalid grammar format'}), 400
        
        # Generate parser tables based on type
        if parser_type == 'slr1':
            generator = SLR1ParserGenerator(grammar)
            tables_result = generator.generate()
            is_valid = tables_result.get('is_slr1', False)
            error_msg = 'Grammar is not SLR(1). Cannot parse with conflicts.'
        else:
            generator = LR0ParserGenerator(grammar)
            tables_result = generator.generate()
            is_valid = tables_result.get('is_lr0', False)
            error_msg = 'Grammar is not LR(0). Cannot parse with conflicts.'
        
        # Check if grammar is valid
        if not is_valid:
            return jsonify({
                'error': error_msg,
                'conflicts': {
                    'shift_reduce': tables_result['shift_reduce_conflicts'],
                    'reduce_reduce': tables_result['reduce_reduce_conflicts']
                }
            }), 400
        
        # Convert action table format
        action_table = {}
        for state, symbols in tables_result['action_table'].items():
            for symbol, action in symbols.items():
                action_table[(state, symbol)] = action
        
        # Convert goto table format
        goto_table = {}
        for state, non_terminals in tables_result['goto_table'].items():
            for non_terminal, next_state in non_terminals.items():
                goto_table[(state, non_terminal)] = next_state
        
        # Create parser
        parser = LR0Parser(
            action_table=action_table,
            goto_table=goto_table,
            productions=generator.productions,
            terminals=tables_result['terminals'][:-1],  # Remove '$'
            start_symbol=generator.augmented_start
        )
        
        # Parse input
        result = parser.parse(input_string)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

