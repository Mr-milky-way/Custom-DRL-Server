import json
import os

# Path to md-cache.mdc
CACHE_FILE = "md-cache.mdc"

# XOR key used by Unity
XOR_KEY = 63

def read_mdc_file(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return []

    with open(file_path, "rb") as f:
        data = bytearray(f.read())

    decrypted = bytearray(b ^ XOR_KEY for b in data)
    json_str = decrypted.decode("utf-8")

    start_idx = json_str.find('[')
    if start_idx == -1:
        print("Could not find JSON array in cache file.")
        return []

    json_str = json_str[start_idx:]
    try:
        maps = json.loads(json_str)
        file = open('tracks.json', 'w')
        file.write(json_str)
        file.close()
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        return []

    return maps

if __name__ == "__main__":
    maps = read_mdc_file(CACHE_FILE)
    if maps:
        print(f"Found {len(maps)} maps in cache.\n")
    else:
        print("No maps found in cache.")
