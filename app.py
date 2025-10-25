"""
File: app.py
Description: Flask-based Sign Language Translator using ISL Videos
Updated: Fixed 'Video not available' issue and added better API structure
"""

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from sign_language_system import SignLanguageTranslationSystem
import os

app = Flask(__name__)
CORS(app)

# Initialize the translation system
translator = SignLanguageTranslationSystem()


# ================================
# ROUTES
# ================================

@app.route('/')
def index():
    """Serve main webpage"""
    return render_template('index.html')


@app.route('/api/translate', methods=['POST'])
def translate():
    """
    Translate input text into sign language (video version)
    
    Request body:
    {
        "text": "hello how are you"
    }
    """
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'status': 'error', 'error': 'No text provided'}), 400

        text = data['text'].strip()
        print(f"🔤 Received text: {text}")

        # Run translation
        result = translator.process_request(text)

        # Add full video URL paths for frontend
        for item in result.get("sign_sequence", []):
            if item["type"] == "sign":
                video_path = item["data"].get("path")
                if video_path and os.path.exists(video_path):
                    item["video_url"] = f"/{video_path.replace('\\', '/')}"  # for Windows paths
                else:
                    item["video_url"] = None
            else:
                # Fingerspelling (no video)
                item["video_url"] = None

        print(f"✅ Translation completed for: {text}")
        return jsonify(result), 200

    except Exception as e:
        print(f"❌ ERROR in /translate: {e}")
        return jsonify({'status': 'error', 'error': str(e)}), 500


@app.route('/api/dictionary', methods=['GET'])
def get_dictionary():
    """Return a list of available ISL words"""
    dictionary = translator.translator.dictionary.word_to_sign
    return jsonify({
        'total_words': len(dictionary),
        'languages': ['en', 'hi', 'mr'],
        'categories': ['greetings', 'common_phrases', 'numbers', 'emotions', 'family', 'objects'],
        'words': list(dictionary.keys())
    })


@app.route('/api/signs/<word>', methods=['GET'])
def get_sign_info(word):
    """Return information about a specific sign"""
    sign = translator.translator.dictionary.get_sign(word)
    if sign:
        video_path = sign.get('path')
        return jsonify({
            'word': word,
            'video_url': f"/{video_path}",
            'description': f"ISL video sign for '{word}'"
        })
    else:
        return jsonify({
            'error': f"'{word}' not found in dictionary",
            'suggestion': 'Will be fingerspelled'
        }), 404


@app.route('/api/health', methods=['GET'])
def health_check():
    """Basic health check"""
    return jsonify({
        'status': 'healthy',
        'service': 'ISL Video Translation API',
        'version': '2.0',
        'dictionary_size': len(translator.translator.dictionary.word_to_sign)
    })


# ================================
# STARTUP
# ================================

if __name__ == '__main__':
    os.makedirs('static/videos', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    os.makedirs('templates', exist_ok=True)

    print("\n" + "="*65)
    print("🤟 ISL SIGN LANGUAGE TRANSLATION SYSTEM (VIDEO VERSION)")
    print("="*65)
    print("\n✅ Flask server starting...")
    print("📍 URL: http://127.0.0.1:5000")
    print("\n📽 Example test:")
    print("   → hello")
    print("   → thank you")
    print("   → please help me")
    print("\n🗂 Videos must be inside: static/videos/")
    print("="*65 + "\n")

    app.run(debug=True, host='0.0.0.0', port=5000)

