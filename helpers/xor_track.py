from pathlib import Path
import os

def xor_file(input_file, output_file):
    key = 63
    chunk_size = 65536
    
    with open(input_file, 'rb') as f_in, open(output_file, 'wb') as f_out:
        while True:
            chunk = f_in.read(chunk_size)
            if not chunk:
                break
            
            xor_chunk = bytes([b ^ key for b in chunk])
            f_out.write(xor_chunk)



directory_path = Path('maps')
directory_Out_path = Path('tracks/')

os.mkdir(directory_Out_path)
files = [p for p in directory_path.iterdir() if p.is_file()]
for file in files:
    xor_file(file, directory_Out_path / file.name)