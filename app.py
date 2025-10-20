"""
File: app.py
Description: Main Flask application for Sign Language Translation System
Instructions: Copy this entire file and save as 'app.py' in your project folder
"""

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from sign_language_system import SignLanguageTranslationSystem
import os

app = Flask(__name__)
CORS(app)

# Initialize the translation system
translator = SignLanguageTranslationSystem()

@app.route('/')
def index():
    """Serve main page"""
    return render_template('index.html')


@app.route('/api/translate', methods=['POST'])
def translate():
    """
    Translate text to sign language
    
    Request body:
    {
        "text": "Hello, how are you?",
        "language": "en"  # optional: en, hi, mr
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'status': 'error',
                'error': 'No text provided'
            }), 400
        
        text = data['text']
        
        # Process translation
        result = translator.process_request(text)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500


@app.route('/api/dictionary', methods=['GET'])
def get_dictionary():
    """Get available words in dictionary"""
    dictionary = translator.translator.dictionary.word_to_sign
    return jsonify({
        'total_words': len(dictionary),
        'languages': ['en', 'hi', 'mr'],
        'categories': ['greetings', 'numbers', 'common_phrases', 'alphabets'],
        'words': list(dictionary.keys())[:50]  # First 50 words
    })


@app.route('/api/signs/<word>', methods=['GET'])
def get_sign_info(word):
    """Get detailed information about a specific sign"""
    sign = translator.translator.dictionary.get_sign(word)
    
    if sign:
        return jsonify({
            'word': word,
            'sign_id': sign['sign_id'],
            'video_url': f'/static/videos/{sign["video"]}',
            'description': f'Sign for {word}',
            'category': 'general'
        })
    else:
        return jsonify({
            'error': 'Word not found in dictionary',
            'suggestion': 'Will be fingerspelled'
        }), 404


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Sign Language Translation API',
        'version': '1.0.0',
        'dictionary_size': len(translator.translator.dictionary.word_to_sign)
    })


if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('static/videos', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    os.makedirs('templates', exist_ok=True)
    
    print("\n" + "="*60)
    print("🤟 SIGN LANGUAGE TRANSLATION SYSTEM")
    print("="*60)
    print("\n✅ Server starting...")
    print("📍 Open your browser and go to: http://localhost:5000")
    print("\n📚 API Endpoints:")
    print("   • POST /api/translate - Translate text to sign language")
    print("   • GET  /api/dictionary - View available words")
    print("   • GET  /api/signs/<word> - Get sign information")
    print("   • GET  /api/health - Check system health")
    print("\n💡 Try these test sentences:")
    print("   • hello how are you")
    print("   • thank you for help")
    print("   • नमस्ते धन्यवाद")
    print("\n" + "="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
