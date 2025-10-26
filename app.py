"""
app.py
Flask backend for Sign Language Translation System (Video + JSON)
"""
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from sign_language_system import SignLanguageTranslationSystem
import os

app = Flask(__name__, static_folder="static")
CORS(app)

translator = SignLanguageTranslationSystem()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/translate', methods=['POST'])
def api_translate():
    try:
        data = request.get_json(silent=True)
        if not data or 'text' not in data:
            return jsonify({"status": "error", "error": "Missing 'text' in request"}), 400

        text = data['text'].strip()
        if not text:
            return jsonify({"status": "error", "error": "Empty text"}), 400

        result = translator.process_request(text)

        # Attach video_url for sign items (ensure correct web path)
        for item in result.get("sign_sequence", []):
            if item.get("type") == "sign":
                data_obj = item.get("data", {})
                # prefer explicit file key if present
                video_file = data_obj.get("file") or data_obj.get("video") or data_obj.get("video_file")
                if video_file:
                    # normalize and check absolute path
                    abs_path = os.path.join(app.root_path, "static", "videos", video_file)
                    abs_path = os.path.normpath(abs_path)
                    if os.path.exists(abs_path):
                        item["video_url"] = f"/static/videos/{os.path.basename(video_file)}"
                    else:
                        # try common fallback: word.mp4
                        word = item.get("word", "")
                        fallback = f"/static/videos/{word}.mp4"
                        if os.path.exists(os.path.normpath(os.path.join(app.root_path, fallback.lstrip("/")))):
                            item["video_url"] = fallback
                        else:
                            item["video_url"] = None
                else:
                    # no explicit video file; try fallback by word
                    word = item.get("word", "")
                    fallback = f"/static/videos/{word}.mp4"
                    if os.path.exists(os.path.normpath(os.path.join(app.root_path, fallback.lstrip("/")))):
                        item["video_url"] = fallback
                    else:
                        item["video_url"] = None
            else:
                item["video_url"] = None

        # debug prints (visible in Flask terminal)
        print("🎬 Translation for:", text)
        for i, s in enumerate(result.get("sign_sequence", []), 1):
            print(f" {i}. {s.get('word')} -> {s.get('video_url')}")

        return jsonify(result), 200

    except Exception as e:
        print("ERROR in /api/translate:", e)
        return jsonify({"status": "error", "error": str(e)}), 500


@app.route('/api/dictionary', methods=['GET'])
def api_dictionary():
    words = translator.translator.dictionary.word_to_sign
    return jsonify({"status": "success", "total_words": len(words), "words": list(words.keys())})


@app.route('/api/sign/<word>', methods=['GET'])
def api_sign(word):
    sign = translator.translator.dictionary.get_sign(word)
    if sign:
        video_file = sign.get("file") or sign.get("video") or sign.get("video_file")
        if video_file:
            abs_path = os.path.join(app.root_path, "static", "videos", video_file)
            if os.path.exists(abs_path):
                return jsonify({"word": word, "video_url": f"/static/videos/{video_file}", "status": "success"}), 200
        # fallback by word.mp4
        fallback = f"/static/videos/{word}.mp4"
        if os.path.exists(os.path.normpath(os.path.join(app.root_path, fallback.lstrip("/")))):
            return jsonify({"word": word, "video_url": fallback, "status": "success"}), 200
    return jsonify({"word": word, "status": "not_found"}), 404


@app.route('/static/videos/<path:filename>')
def serve_video(filename):
    videos_dir = os.path.join(app.root_path, "static", "videos")
    full = os.path.join(videos_dir, filename)
    print("🎥 Serve request for:", full)
    if os.path.exists(os.path.normpath(full)):
        return send_from_directory(videos_dir, filename)
    else:
        print("❌ File not found:", full)
        return jsonify({"error": "Video not found"}), 404


@app.route('/api/health', methods=['GET'])
def health_check():
    count = len(translator.translator.dictionary.word_to_sign)
    return jsonify({"status": "healthy", "video_count": count})


if __name__ == '__main__':
    os.makedirs(os.path.join("static", "videos"), exist_ok=True)
    os.makedirs(os.path.join("static", "css"), exist_ok=True)
    os.makedirs(os.path.join("static", "js"), exist_ok=True)
    print("Starting Flask on http://127.0.0.1:5000")
    app.run(debug=True, host="0.0.0.0", port=5000)
