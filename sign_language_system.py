"""
Sign Language Translation System - Core Logic
"""

from typing import List, Dict

class TextPreprocessor:
    def __init__(self):
        self.supported_languages = ['en', 'hi', 'mr']
    
    def detect_language(self, text: str) -> str:
        hindi_chars = sum(1 for char in text if '\u0900' <= char <= '\u097F')
        english_chars = sum(1 for char in text if char.isalpha() and char.isascii())
        return 'hi' if hindi_chars > english_chars else 'en'
    
    def normalize_text(self, text: str) -> str:
        import string
        text = text.strip().lower()
        translator = str.maketrans('', '', string.punctuation)
        return text.translate(translator)
    
    def tokenize(self, text: str) -> List[str]:
        return text.split()

class SignLanguageDictionary:
    def __init__(self):
        self.word_to_sign = self.load_dictionary()
    
    def load_dictionary(self):
        return {
            'hello': {'sign_id': 'ISL_001', 'video': 'hello.mp4'},
            'hi': {'sign_id': 'ISL_001', 'video': 'hello.mp4'},
            'thank': {'sign_id': 'ISL_002', 'video': 'thank.mp4'},
            'thanks': {'sign_id': 'ISL_002', 'video': 'thank.mp4'},
            'you': {'sign_id': 'ISL_003', 'video': 'you.mp4'},
            'help': {'sign_id': 'ISL_004', 'video': 'help.mp4'},
            'please': {'sign_id': 'ISL_005', 'video': 'please.mp4'},
            'sorry': {'sign_id': 'ISL_006', 'video': 'sorry.mp4'},
            'yes': {'sign_id': 'ISL_007', 'video': 'yes.mp4'},
            'no': {'sign_id': 'ISL_008', 'video': 'no.mp4'},
            'how': {'sign_id': 'ISL_009', 'video': 'how.mp4'},
            'are': {'sign_id': 'ISL_010', 'video': 'are.mp4'},
            'good': {'sign_id': 'ISL_011', 'video': 'good.mp4'},
            'bad': {'sign_id': 'ISL_012', 'video': 'bad.mp4'},
            'name': {'sign_id': 'ISL_013', 'video': 'name.mp4'},
            'what': {'sign_id': 'ISL_014', 'video': 'what.mp4'},
            'where': {'sign_id': 'ISL_015', 'video': 'where.mp4'},
            'when': {'sign_id': 'ISL_016', 'video': 'when.mp4'},
            'who': {'sign_id': 'ISL_017', 'video': 'who.mp4'},
            'नमस्ते': {'sign_id': 'ISL_001', 'video': 'hello.mp4'},
            'धन्यवाद': {'sign_id': 'ISL_002', 'video': 'thank.mp4'},
            'कृपया': {'sign_id': 'ISL_005', 'video': 'please.mp4'},
            'नमस्कार': {'sign_id': 'ISL_001', 'video': 'hello.mp4'},
        }
    
    def get_sign(self, word: str):
        return self.word_to_sign.get(word.lower(), None)
    
    def fingerspell(self, word: str) -> List[Dict]:
        return [{'letter': char, 'sign_id': f'FS_{char.upper()}'} 
                for char in word if char.isalnum()]

class SignLanguageTranslator:
    def __init__(self):
        self.preprocessor = TextPreprocessor()
        self.dictionary = SignLanguageDictionary()
    
    def apply_grammar_rules(self, tokens: List[str]) -> List[str]:
        articles = ['a', 'an', 'the', 'is', 'am', 'are', 'was', 'were']
        return [t for t in tokens if t not in articles]
    
    def translate(self, text: str) -> List[Dict]:
        if not text.strip():
            return []
        
        normalized = self.preprocessor.normalize_text(text)
        tokens = self.preprocessor.tokenize(normalized)
        tokens = self.apply_grammar_rules(tokens)
        
        sign_sequence = []
        for token in tokens:
            sign = self.dictionary.get_sign(token)
            if sign:
                sign_sequence.append({'word': token, 'type': 'sign', 'data': sign})
            else:
                sign_sequence.append({'word': token, 'type': 'fingerspell', 
                                    'data': self.dictionary.fingerspell(token)})
        return sign_sequence

class SignLanguageTranslationSystem:
    def __init__(self):
        self.translator = SignLanguageTranslator()
    
    def process_request(self, text: str) -> Dict:
        try:
            sign_sequence = self.translator.translate(text)
            return {
                'status': 'success',
                'input_text': text,
                'sign_sequence': sign_sequence,
                'animation': {
                    'total_signs': len(sign_sequence),
                    'estimated_duration': len(sign_sequence) * 2.5
                }
            }
        except Exception as e:
            return {'status': 'error', 'error': str(e)}
