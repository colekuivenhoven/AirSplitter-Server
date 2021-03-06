# -*- coding: utf-8 -*-
"""SpleeterAudioIsolation.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1Y13tPqYucfXe4oMM-x3KV6vwUYS3Peuo
"""

!apt install ffmpeg

pip install spleeter

from IPython.display import Audio
from google.colab import files

!wget http://130.45.47.105:3040/song/get/DutchavelliTest.mp3

Audio('DutchavelliTest.mp3')

!spleeter separate -h

!spleeter separate -o output/ DutchavelliTest.mp3

!ls output/DutchavelliTest

files.download('output/DutchavelliTest/vocals.wav')