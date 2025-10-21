"""
Sign Language Translation System - Emoji Version
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
            # Greetings
            'hello': {'sign_id': 'ISL_001', 'emoji': '🤟'},
            'hi': {'sign_id': 'ISL_001', 'emoji': '🤟'},
            'hey': {'sign_id': 'ISL_001', 'emoji': '🤟'},
            'नमस्ते': {'sign_id': 'ISL_001', 'emoji': '🤟'},
            'नमस्कार': {'sign_id': 'ISL_001', 'emoji': '🤟'},
            'good morning': {'sign_id': 'ISL_002', 'emoji': '🌅'},
            'good night': {'sign_id': 'ISL_003', 'emoji': '🌙'},
            
            # Gratitude / Politeness
            'thank': {'sign_id': 'ISL_004', 'emoji': '🙏'},
            'thanks': {'sign_id': 'ISL_004', 'emoji': '🙏'},
            'धन्यवाद': {'sign_id': 'ISL_004', 'emoji': '🙏'},
            'please': {'sign_id': 'ISL_005', 'emoji': '🙏'},
            'कृपया': {'sign_id': 'ISL_005', 'emoji': '🙏'},
            'sorry': {'sign_id': 'ISL_006', 'emoji': '😔'},
            
            # Yes / No / Confirmation
            'yes': {'sign_id': 'ISL_007', 'emoji': '👍'},
            'no': {'sign_id': 'ISL_008', 'emoji': '👎'},
            'ok': {'sign_id': 'ISL_009', 'emoji': '👌'},
            'agree': {'sign_id': 'ISL_010', 'emoji': '🤝'},
            'disagree': {'sign_id': 'ISL_011', 'emoji': '✋'},
            
            # Personal interactions
            'you': {'sign_id': 'ISL_012', 'emoji': '🤲'},
            'me': {'sign_id': 'ISL_013', 'emoji': '🙋'},
            'we': {'sign_id': 'ISL_014', 'emoji': '👨‍👩‍👧‍👦'},
            'friend': {'sign_id': 'ISL_015', 'emoji': '🫂'},
            'help': {'sign_id': 'ISL_016', 'emoji': '🆘'},
            
            # Emotions
            'happy': {'sign_id': 'ISL_017', 'emoji': '😃'},
            'sad': {'sign_id': 'ISL_018', 'emoji': '😢'},
            'angry': {'sign_id': 'ISL_019', 'emoji': '😡'},
            'love': {'sign_id': 'ISL_020', 'emoji': '❤️'},
            'excited': {'sign_id': 'ISL_021', 'emoji': '🤩'},
            'tired': {'sign_id': 'ISL_022', 'emoji': '😴'},
            
            # Common questions
            'what': {'sign_id': 'ISL_023', 'emoji': '❓'},
            'where': {'sign_id': 'ISL_024', 'emoji': '📍'},
            'when': {'sign_id': 'ISL_025', 'emoji': '⏰'},
            'who': {'sign_id': 'ISL_026', 'emoji': '🧑'},
            'how': {'sign_id': 'ISL_027', 'emoji': '❓'},
            
            # Numbers 0-10
            'zero': {'sign_id': 'ISL_028', 'emoji': '0️⃣'},
            'one': {'sign_id': 'ISL_029', 'emoji': '1️⃣'},
            'two': {'sign_id': 'ISL_030', 'emoji': '2️⃣'},
            'three': {'sign_id': 'ISL_031', 'emoji': '3️⃣'},
            'four': {'sign_id': 'ISL_032', 'emoji': '4️⃣'},
            'five': {'sign_id': 'ISL_033', 'emoji': '5️⃣'},
            'six': {'sign_id': 'ISL_034', 'emoji': '6️⃣'},
            'seven': {'sign_id': 'ISL_035', 'emoji': '7️⃣'},
            'eight': {'sign_id': 'ISL_036', 'emoji': '8️⃣'},
            'nine': {'sign_id': 'ISL_037', 'emoji': '9️⃣'},
            'ten': {'sign_id': 'ISL_038', 'emoji': '🔟'},
            
            # Daily objects
            'food': {'sign_id': 'ISL_039', 'emoji': '🍔'},
            'water': {'sign_id': 'ISL_040', 'emoji': '💧'},
            'house': {'sign_id': 'ISL_041', 'emoji': '🏠'},
            'car': {'sign_id': 'ISL_042', 'emoji': '🚗'},
            'phone': {'sign_id': 'ISL_043', 'emoji': '📱'},
            'book': {'sign_id': 'ISL_044', 'emoji': '📖'},
            'school': {'sign_id': 'ISL_045', 'emoji': '🏫'},
            'work': {'sign_id': 'ISL_046', 'emoji': '💼'},
            'sleep': {'sign_id': 'ISL_047', 'emoji': '😴'},
            'play': {'sign_id': 'ISL_048', 'emoji': '🎮'},
            
            # Family
            'mother': {'sign_id': 'ISL_049', 'emoji': '👩‍👧'},
            'father': {'sign_id': 'ISL_050', 'emoji': '👨‍👦'},
            'brother': {'sign_id': 'ISL_051', 'emoji': '👦'},
            'sister': {'sign_id': 'ISL_052', 'emoji': '👧'},
            'child': {'sign_id': 'ISL_053', 'emoji': '🧒'},
            
            # Colors
            'red': {'sign_id': 'ISL_054', 'emoji': '🟥'},
            'blue': {'sign_id': 'ISL_055', 'emoji': '🟦'},
            'green': {'sign_id': 'ISL_056', 'emoji': '🟩'},
            'yellow': {'sign_id': 'ISL_057', 'emoji': '🟨'},
            'black': {'sign_id': 'ISL_058', 'emoji': '⬛'},
            'white': {'sign_id': 'ISL_059', 'emoji': '⬜'},
            
            # Animals
            'dog': {'sign_id': 'ISL_060', 'emoji': '🐶'},
            'cat': {'sign_id': 'ISL_061', 'emoji': '🐱'},
            'bird': {'sign_id': 'ISL_062', 'emoji': '🐦'},
            'fish': {'sign_id': 'ISL_063', 'emoji': '🐟'},
            'cow': {'sign_id': 'ISL_064', 'emoji': '🐄'},
            'lion': {'sign_id': 'ISL_065', 'emoji': '🦁'},
            
            # Emotions / Actions
            'good': {'sign_id': 'ISL_066', 'emoji': '😃'},
            'bad': {'sign_id': 'ISL_067', 'emoji': '😞'},
            'fun': {'sign_id': 'ISL_068', 'emoji': '🎉'},
            'music': {'sign_id': 'ISL_069', 'emoji': '🎵'},
            'movie': {'sign_id': 'ISL_070', 'emoji': '🎬'},
            'game': {'sign_id': 'ISL_071', 'emoji': '🎮'},
            'birthday': {'sign_id': 'ISL_072', 'emoji': '🎂'},
            'congratulations': {'sign_id': 'ISL_073', 'emoji': '🎉'},
            
            # Add more words as needed...
        }
    
    def get_sign(self, word: str):
        return self.word_to_sign.get(word.lower(), None)
    
    def fingerspell(self, word: str) -> List[Dict]:
        return [{'letter': char, 'emoji': '✋', 'sign_id': f'FS_{char.upper()}'}
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
