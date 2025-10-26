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
    """
    try:
        data = request.get_json(silent=True)
        if not data or 'text' not in data:
            return jsonify({"status": "error", "error": "Missing 'text' in request"}), 400

        text = data['text'].strip()
        if not text:
            return jsonify({"status": "error", "error": "Empty text"}), 400

        result = translator.process_request(text)
        print(f"\n🧠 Processing request for: '{text}'")

        for item in result.get("sign_sequence", []):
            if item.get("type") == "sign":
                data_obj = item.get("data", {})
                video_file = data_obj.get("file")

                if video_file:
                    abs_path = os.path.join(app.root_path, "static", "videos", video_file)
                    abs_path = os.path.normpath(abs_path)
                    web_path = f"/static/videos/{video_file}"

                    # Debugging info
                    print(f"🔍 Checking: {abs_path}")

                    if os.path.exists(abs_path):
                        item["video_url"] = web_path
                        print(f"✅ Found and linked: {web_path}")
                    else:
                        print(f"⚠️ File not found: {abs_path}")
                        item["video_url"] = None
                else:
                    item["video_url"] = None
            else:
                item["video_url"] = None

        print("\n🎬 Final translation result:")
        for i, s in enumerate(result.get("sign_sequence", [])):
            print(f" {i+1}. {s.get('word')} → {s.get('video_url')}")

        return jsonify(result), 200

    except Exception as e:
        print("🔥 ERROR in /api/translate:", e)
        return jsonify({"status": "error", "error": str(e)}), 500


@app.route('/api/sign/<word>', methods=['GET'])
def api_sign(word):
    """Return sign (video) info for a specific word"""
    sign = translator.translator.dictionary.get_sign(word)
    if sign:
        video_file = sign.get("file")
        abs_path = os.path.join(app.root_path, "static", "videos", video_file)
        abs_path = os.path.normpath(abs_path)
        web_path = f"/static/videos/{video_file}"

        if os.path.exists(abs_path):
            print(f"✅ [api/sign] Serving '{word}' → {web_path}")
            return jsonify({"word": word, "video_url": web_path, "status": "success"}), 200
        else:
            print(f"⚠️ [api/sign] Missing file: {abs_path}")
    return jsonify({"word": word, "status": "not_found"}), 404


@app.route('/static/videos/<path:filename>')
def serve_video(filename):
    """Serve video files from static/videos"""
    full_path = os.path.join(app.root_path, "static", "videos", filename)
    print(f"🎥 Request received for: {full_path}")

    if os.path.exists(full_path):
        print("✅ File found, serving video.")
        return send_from_directory(os.path.join(app.root_path, "static", "videos"), filename)
    else:
        print("❌ File not found:", full_path)
        return jsonify({"error": f"Video '{filename}' not found"}), 404


@app.route('/api/dictionary', methods=['GET'])
def api_dictionary():
    """Return available words and mapped video files"""
    words = translator.translator.dictionary.word_to_sign
    return jsonify({
        "status": "success",
        "total_words": len(words),
        "words": list(words.keys())
    })


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
