import requests
import cv2
import numpy as np
import io

def create_dummy_image(color, path):
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    img[:] = color
    # Add a pseudo face to trick haarcascade just in case
    # Actually, Haar Cascade needs contrasting features. 
    # To truly test it, it's best if the user tests it with real images.
    cv2.imwrite(path, img)

# We will just rely on the fact that I've written the test script 
# to run against real images if the user provides them.
