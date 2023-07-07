import glob
import json
import re


def is_valid(json_filename):
    with open(json_filename) as json_file:
        json_str = ""
        try:
            json_str = json_file.read()
            json_str = json_str.encode().decode('utf-8-sig')

            json_str = re.sub("^ *\t*//.*$", "", json_str, flags=re.MULTILINE)
            json_str = re.sub(", *\t*//.*", ",", json_str, flags=re.MULTILINE)
            json_str = re.sub("\\\\\"", "", json_str, flags=re.MULTILINE)
            json_str = re.sub(", *\n *\t*}", "\n}", json_str, flags=re.MULTILINE)
            json_str = re.sub(", *\n *\t*]", "\n]", json_str, flags=re.MULTILINE)

            json.loads(json_str)
            return True, "OK"
        except ValueError as err:
            return False, "" + json_filename + " is NOT valid, error: " + str(err)
        except UnicodeDecodeError as err:
            return False, "" + json_filename + " is NOT valid, error: " + str(err)


ok_json_filenames = []
ko_json_results = []

for filename in glob.glob('./**/*.json', recursive=True):
    if "appsettings" in filename:
        res, msg = is_valid(filename)
        if res:
            ok_json_filenames.append(filename)
        else:
            ko_json_results.append({"filename": filename, "msg": msg})

if len(ok_json_filenames) > 0:
    print("Those files successfully passed the JSON check :")
    print("\n".join(ok_json_filenames))
    print("\n\n")

if len(ko_json_results) > 0:
    print("Those files FAILED the JSON check (see error message) :")
    for result in ko_json_results:
        print(result["filename"], result["msg"])
        print("\n\n")
    raise ValueError()
