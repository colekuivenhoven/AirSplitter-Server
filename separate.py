import urllib.request
import os
import sys
from pip._vendor import requests

url = "http://130.45.47.105:3040/song/get-original/"+sys.argv[1]

file_name = url.split('/')[-1]

dir_path = os.path.dirname(os.path.realpath(__file__))
original_path = os.path.join(dir_path, 'original_audio')
file_path_original = os.path.join(original_path, file_name)

os.system('spleeter separate -o output/ -p spleeter:4stems ' + file_path_original)

os.close()