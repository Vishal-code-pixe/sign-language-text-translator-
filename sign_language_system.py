"""
Sign Language Translation System - Flask Video Version
(Uses actual .mp4 sign language clips from static/videos/)
"""

import os
from typing import List, Dict


# ---------------------------------
# TEXT PREPROCESSING
# ---------------------------------
class TextPreprocessor:
    def __init__(self):
        self.supported_languages = ['en', 'hi', 'mr']

    def detect_language(self, text: str) -> str:
        hindi_chars = sum(1 for c in text if '\u0900' <= c <= '\u097F')
        english_chars = sum(1 for c in text if c.isascii() and c.isalpha())
        return 'hi' if hindi_chars > english_chars else 'en'

    def normalize_text(self, text: str) -> str:
        import string
        return text.strip().lower().translate(str.maketrans('', '', string.punctuation))

    def tokenize(self, text: str) -> List[str]:
        return text.split()


# ---------------------------------
# SIGN LANGUAGE DICTIONARY
# ---------------------------------
class SignLanguageDictionary:
    def __init__(self):
        self.base_path = "static/videos"
        self.word_to_sign = self.load_dictionary()

    def load_dictionary(self):
        """
        Maps words to corresponding sign language .mp4 filenames
        """
        return {
            # Greetings
            'hello': 'hello.mp4',
            'hi': 'hello.mp4',
            'hey': 'hello.mp4',
            'नमस्ते': 'namaste.mp4',
            'good morning': 'good_morning.mp4',
            'good night': 'good_night.mp4',

            # Gratitude
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

            # Questions
            'what': 'what.mp4',
            'where': 'where.mp4',
            'when': 'when.mp4',
            'who': 'who.mp4',
            'how': 'how.mp4',
        }

    def get_sign(self, word: str):
        filename = self.word_to_sign.get(word.lower())
        if filename:
            video_url = f"/static/videos/{filename}"
            return {
                'sign_id': f"ISL_{word.upper()}",
                'video_url': video_url,
                'exists': os.path.exists(os.path.join(self.base_path, filename))
            }
        return None

    def fingerspell(self, word: str) -> List[Dict]:
        """
        Fallback for unknown words (returns letter placeholders)
        """
        return [
            {
                'letter': c.upper(),
                'sign_id': f'FS_{c.upper()}',
                'video_url': f"/static/videos/{c.upper()}.mp4",
                'exists': os.path.exists(os.path.join(self.base_path, f"{c.upper()}.mp4"))
            }
            for c in word if c.isalpha()
        ]


# ---------------------------------
# TRANSLATION SYSTEM
# ---------------------------------
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
            if sign and sign['exists']:
                sign_sequence.append({
                    'word': token,
                    'type': 'sign',
                    'video_url': sign['video_url']
                })
            else:
                # fallback to fingerspelling
                letters = self.dictionary.fingerspell(token)
                sign_sequence.append({
                    'word': token,
                    'type': 'fingerspell',
                    'letters': letters
                })

        return sign_sequence


# ---------------------------------
# MAIN SYSTEM WRAPPER
# ---------------------------------
class SignLanguageTranslationSystem:
    def __init__(self):
        self.translator = SignLanguageTranslator()

    def process_request(self, text: str) -> Dict:
        try:
            sequence = self.translator.translate(text)
            return {
                'status': 'success',
                'input_text': text,
                'sign_sequence': sequence,
                'animation': {
                    'total_signs': len(sequence),
                    'estimated_duration': len(sequence) * 2.5
                }
            }
        except Exception as e:
            return {'status': 'error', 'error': str(e)}
