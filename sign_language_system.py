"""
sign_language_system.py
Simple translator that maps words to video file names (static/videos/<file>)
"""

from typing import List, Dict
import string

class TextPreprocessor:
    def __init__(self):
        self.supported_languages = ['en', 'hi', 'mr']

    def normalize_text(self, text: str) -> str:
        text = text.strip().lower()
        translator = str.maketrans('', '', string.punctuation)
        return text.translate(translator)

    def tokenize(self, text: str) -> List[str]:
        return text.split()

class SignLanguageDictionary:
    def __init__(self):
        self.word_to_sign = self.load_dictionary()

    def load_dictionary(self):
        # Map word -> filename (place matching mp4 files in static/videos/)
        return {
            'hello': {'file': 'hello.mp4'},
            'hi': {'file': 'hello.mp4'},
            'thank': {'file': 'thank_you.mp4'},
            'thanks': {'file': 'thank_you.mp4'},
            'you': {'file': 'you.mp4'},
            'help': {'file': 'help.mp4'},
            'please': {'file': 'please.mp4'},
            'sorry': {'file': 'sorry.mp4'},
            'yes': {'file': 'yes.mp4'},
            'no': {'file': 'no.mp4'},
            'what': {'file': 'what.mp4'},
            'where': {'file': 'where.mp4'},
            'when': {'file': 'when.mp4'},
            'who': {'file': 'who.mp4'},
            'how': {'file': 'how.mp4'},
            'one': {'file': '1.mp4'},
            'two': {'file': '2.mp4'},
            'three': {'file': '3.mp4'},
            'four': {'file': '4.mp4'},
            'five': {'file': '5.mp4'},
            # add more mappings here...
        }

    def get_sign(self, word: str):
        return self.word_to_sign.get(word.lower(), None)

    def fingerspell(self, word: str) -> List[Dict]:
        return [{'letter': c.upper(), 'file': f'{c.upper()}.mp4'} for c in word if c.isalpha()]


class SignLanguageTranslator:
    def __init__(self):
        self.preprocessor = TextPreprocessor()
        self.dictionary = SignLanguageDictionary()

    def apply_grammar_rules(self, tokens: List[str]) -> List[str]:
        skip = ['a', 'an', 'the', 'is', 'am', 'are', 'was', 'were']
        return [t for t in tokens if t not in skip]

    def translate(self, text: str) -> List[Dict]:
        normalized = self.preprocessor.normalize_text(text)
        tokens = self.preprocessor.tokenize(normalized)
        tokens = self.apply_grammar_rules(tokens)

        seq = []
        for token in tokens:
            sign = self.dictionary.get_sign(token)
            if sign:
                seq.append({'word': token, 'type': 'sign', 'data': sign})
            else:
                # fallback to fingerspelling (each letter: your static/videos/A.mp4 etc.)
                seq.append({'word': token, 'type': 'fingerspell', 'data': self.dictionary.fingerspell(token)})
        return seq


class SignLanguageTranslationSystem:
    def __init__(self):
        self.translator = SignLanguageTranslator()

    def process_request(self, text: str):
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
