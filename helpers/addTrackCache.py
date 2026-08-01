import json

with open("../CtracksC.json", "r") as f1:
    File1 = json.load(f1)

with open("../mdc-cache.json", "r") as f2:
    File2 = json.load(f2)

for track in File2:
    if track["guid"] not in [t["guid"] for t in File1]:
        File1.append(track)

OutFile = open("../CtracksC.json", "w")
json.dump(File1, OutFile, indent=2)
OutFile.close()