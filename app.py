"""
File: app.py
Description: Flask backend for Sign Language Translation System (Video + JSON)
"""

from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from sign_language_system import SignLanguageTranslationSystem
import os

app = Flask(__name__)
CORS(app)

# Initialize translation system
translator = SignLanguageTranslationSystem()

# ---------------------------
# ROUTES
# ---------------------------

@app.route('/')
def index():
    """Serve main webpage"""
    return render_template('index.html')


@app.route('/api/translate', methods=['POST'])
def api_translate():
    """
    Translate input text into sign language (returns video file info in JSON)
    Example Request:
        { "text": "hello how are you" }
    """
    try:
        # safer parsing
        data = request.get_json(silent=True)
        if not data or 'text' not in data:
            return jsonify({"status": "error", "error": "Missing 'text' in request"}), 400

        text = data['text'].strip()
        if not text:
            return jsonify({"status": "error", "error": "Empty text"}), 400

        result = translator.process_request(text)

        # Attach standardized video_url to each sign item for frontend
        for item in result.get("sign_sequence", []):
            # only for sign entries, not fingerspell
            if item.get("type") == "sign":
                data_obj = item.get("data", {})
                # Some dictionary versions use 'path' or 'file'
                video_path = data_obj.get("path") or (f"static/videos/{data_obj.get('file')}" if data_obj.get("file") else None)
                if video_path:
                    # ensure local file exists before returning URL
                    # normalize slashes for web
                    fixed = video_path.replace("\\", "/")
                    if os.path.exists(video_path) or os.path.exists(fixed.lstrip("/")):
                        item["video_url"] = f"/{fixed.lstrip('/')}"
                    else:
                        # file missing - return None so frontend can handle
                        item["video_url"] = None
                else:
                    item["video_url"] = None
            else:
                item["video_url"] = None

        return jsonify(result), 200

    except Exception as e:
        # log error to console for debugging
        print("ERROR in /api/translate:", e)
        return jsonify({"status": "error", "error": str(e)}), 500


@app.route('/api/dictionary', methods=['GET'])
def api_dictionary():
    """Return available words and mapped video files"""
    words = translator.translator.dictionary.word_to_sign
    return jsonify({
        "status": "success",
        "total_words": len(words),
        "words": list(words.keys())
    })


@app.route('/api/sign/<word>', methods=['GET'])
def api_sign(word):
    """Return sign (video) info for a specific word"""
    sign = translator.translator.dictionary.get_sign(word)
    if sign:
        # normalize and present path as web URL
        video_path = sign.get("path") or (f"static/videos/{sign.get('file')}" if sign.get('file') else None)
        if video_path:
            video_path = video_path.replace("\\", "/")
            return jsonify({"word": word, "video_path": video_path, "video_url": f"/{video_path.lstrip('/')}", "status": "success"}), 200
        return jsonify({"word": word, "status": "not_found"}), 404
    else:
        return jsonify({"word": word, "status": "not_found"}), 404


@app.route('/static/videos/<path:filename>')
def serve_video(filename):
    """Serve video files from static/videos"""
    return send_from_directory("static/videos", filename)


@app.route('/api/health', methods=['GET'])
def health_check():
    """Check API health"""
    return jsonify({
        "status": "healthy",
        "service": "Sign Language Translator",
        "video_count": len(translator.translator.dictionary.word_to_sign)
    })


# ---------------------------
# SERVER STARTUP
# ---------------------------
if __name__ == '__main__':
    os.makedirs("static/videos", exist_ok=True)
    os.makedirs("static/css", exist_ok=True)
    os.makedirs("static/js", exist_ok=True)

    print("\n" + "="*60)
    print("🤟 INDIAN SIGN LANGUAGE TRANSLATOR (Video-based)")
    print("="*60)
    print("\n🌐 Visit: http://127.0.0.1:5000")
    print("📡 API:")
    print("  POST /api/translate")
    print("  GET  /api/dictionary")
    print("  GET  /api/sign/<word>")
    print("  GET  /api/health")
    print("="*60 + "\n")

    app.run(debug=True, host="0.0.0.0", port=5000)
