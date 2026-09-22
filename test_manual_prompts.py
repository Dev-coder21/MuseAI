import json
import time
import requests

BASE_URL = "http://127.0.0.1:8000"

test_prompts = [
    {"prompt": "Calm piano music for studying.", "mood": "Calm", "genre": "Ambient", "instrument": "Piano", "tempo": "Slow", "purpose": "Study"},
    {"prompt": "Energetic electronic music for a workout.", "mood": "Energetic", "genre": "Electronic", "instrument": "Drums", "tempo": "Fast", "purpose": "Workout"},
    {"prompt": "Emotional cinematic music with strings.", "mood": "Emotional", "genre": "Cinematic", "instrument": "Strings", "tempo": "Medium", "purpose": "Cinematic"},
    {"prompt": "Peaceful ambient music for meditation.", "mood": "Peaceful", "genre": "Ambient", "instrument": "Flute", "tempo": "Slow", "purpose": "Meditation"},
    {"prompt": "Fast upbeat jazz music with piano and drums.", "mood": "Happy", "genre": "Jazz", "instrument": "Piano", "tempo": "Fast", "purpose": "Background"},
]

results = []

print("=== STARTING MUSEAI MANUAL TEST SUITE (5 PROMPTS) ===")

for idx, req in enumerate(test_prompts, 1):
    print(f"\n--- Test Case {idx}: '{req['prompt']}' ---")
    start_time = time.time()
    resp = requests.post(f"{BASE_URL}/generate", json={**req, "duration": 4})
    elapsed = time.time() - start_time

    if resp.status_code == 200:
        data = resp.json()
        gen_id = data["generation_id"]
        
        # Verify Audio Endpoint
        audio_resp = requests.get(f"{BASE_URL}{data['audio_url']}")
        audio_ok = audio_resp.status_code == 200 and len(audio_resp.content) > 1000
        
        # Verify Waveform Image Endpoint
        wf_resp = requests.get(f"{BASE_URL}{data['waveform_url']}")
        wf_ok = wf_resp.status_code == 200 and len(wf_resp.content) > 1000

        # Verify Spectrogram Image Endpoint
        sp_resp = requests.get(f"{BASE_URL}{data['spectrogram_url']}")
        sp_ok = sp_resp.status_code == 200 and len(sp_resp.content) > 1000

        res_entry = {
            "test_case": idx,
            "prompt": req["prompt"],
            "generation_id": gen_id,
            "duration": data["duration_seconds"],
            "sampling_rate": data["sampling_rate"],
            "generation_time": data["generation_time_seconds"],
            "device": data["device"],
            "audio_valid": audio_ok,
            "waveform_valid": wf_ok,
            "spectrogram_valid": sp_ok,
            "status": "PASSED" if (audio_ok and wf_ok and sp_ok) else "FAILED",
        }
        results.append(res_entry)
        print(f"PASSED: ID={gen_id}, Audio={audio_ok}, Waveform={wf_ok}, Spectrogram={sp_ok} in {elapsed:.2f}s")
    else:
        print(f"FAILED: Status {resp.status_code}, Body: {resp.text}")
        results.append({"test_case": idx, "prompt": req["prompt"], "status": "FAILED"})

print("\n=== FINAL TEST RESULTS SUMMARY ===")
print(json.dumps(results, indent=2))
