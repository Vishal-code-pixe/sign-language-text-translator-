"""
Sign Language Translation System - Video Version
(Uses actual .mp4 sign language clips instead of emojis)
"""

import os
from typing import List, Dict

class TextPreprocessor:
    def __init__(self):
        self.supported_languages = ['en', 'hi', 'mr']

    def detect_language(self, text: str) -> str:
        hindi_chars = sum(1 for c in text if '\u0900' <= c <= '\u097F')
        english_chars = sum(1 for c in text if c.isascii() and c.isalpha())
        return 'hi' if hindi_chars > english_chars else 'en'

    def normalize_text(self, text: str) -> str:
        import string
        text = text.strip().lower()
        return text.translate(str.maketrans('', '', string.punctuation))

    def tokenize(self, text: str) -> List[str]:
        return text.split()

class SignLanguageDictionary:
    def __init__(self):
        self.word_to_sign = self.load_dictionary()

    def load_dictionary(self):
        """
        Maps words to corresponding sign language video filenames (.mp4)
        All videos should be stored inside: static/videos/
        """
        return {
            # Greetings
            'hello': 'hello.mp4',
            'hi': 'hello.mp4',
            'hey': 'hello.mp4',
            'नमस्ते': 'namaste.mp4',
            'good morning': 'good_morning.mp4',
            'good night': 'good_night.mp4',

            # Gratitude / Politeness
            'thank': 'thank_you.mp4',
            'thanks': 'thank_you.mp4',
            'धन्यवाद': 'thank_you.mp4',
            'please': 'please.mp4',
            'कृपया': 'please.mp4',
            'sorry': 'sorry.mp4',

            # Confirmation
            'yes': 'yes.mp4',
            'no': 'no.mp4',
            'ok': 'ok.mp4',
            'agree': 'agree.mp4',
            'disagree': 'disagree.mp4',

            # Personal
            'you': 'you.mp4',
            'me': 'me.mp4',
            'we': 'we.mp4',
            'friend': 'friend.mp4',
            'help': 'help.mp4',

            # Emotions
            'happy': 'happy.mp4',
            'sad': 'sad.mp4',
            'angry': 'angry.mp4',
            'love': 'love.mp4',
            'excited': 'excited.mp4',

            # Common questions
            'what': 'what.mp4',
            'where': 'where.mp4',
            'when': 'when.mp4',
            'who': 'who.mp4',
            'how': 'how.mp4',

            # Numbers
            'one': '1.mp4',
            'two': '2.mp4',
            'three': '3.mp4',
            'four': '4.mp4',
            'five': '5.mp4',
            'six': '6.mp4',
            'seven': '7.mp4',
            'eight': '8.mp4',
            'nine': '9.mp4',
            'ten': '10.mp4',

            # Objects
            'food': 'food.mp4',
            'water': 'water.mp4',
            'house': 'house.mp4',
            'car': 'car.mp4',
            'book': 'book.mp4',
            'school': 'school.mp4',
            'work': 'work.mp4',
            'sleep': 'sleep.mp4',
            'play': 'play.mp4',

            # Family
            'mother': 'mother.mp4',
            'father': 'father.mp4',
            'brother': 'brother.mp4',
            'sister': 'sister.mp4',
            'child': 'child.mp4',
        }

    def get_sign(self, word: str):
        filename = self.word_to_sign.get(word.lower())
        if filename:
            return {
                'file': filename,
                'path': f'static/videos/{filename}'
            }
        return None

    def fingerspell(self, word: str) -> List[Dict]:
        """
        Fallback for unknown words: creates letter-by-letter signs.
        """
        return [
            {'letter': c.upper(), 'file': f'{c.upper()}.mp4',
             'path': f'static/videos/{c.upper()}.mp4'}
            for c in word if c.isalpha()
        ]

class SignLanguageTranslator:
    def __init__(self):
        self.preprocessor = TextPreprocessor()
        self.dictionary = SignLanguageDictionary()

    def apply_grammar_rules(self, tokens: List[str]) -> List[str]:
        skip_words = ['a', 'an', 'the', 'is', 'am', 'are', 'was', 'were']
        return [t for t in tokens if t not in skip_words]

    def translate(self, text: str) -> List[Dict]:
        if not text.strip():
            return []

        normalized = self.preprocessor.normalize_text(text)
        tokens = self.apply_grammar_rules(self.preprocessor.tokenize(normalized))

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
            seq = self.translator.translate(text)
            return {
                'status': 'success',
                'input_text': text,
                'sign_sequence': seq,
                'animation': {
                    'total_signs': len(seq),
                    'estimated_duration': len(seq) * 2.5
                }
            }
        except Exception as e:
            return {'status': 'error', 'error': str(e)}
