#!/bin/bash

# Create models directory if it doesn't exist
mkdir -p models

# Download face-api.js models
curl -L https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json -o models/tiny_face_detector_model-weights_manifest.json
curl -L https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1 -o models/tiny_face_detector_model-shard1
curl -L https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json -o models/face_landmark_68_model-weights_manifest.json
curl -L https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1 -o models/face_landmark_68_model-shard1
curl -L https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json -o models/face_recognition_model-weights_manifest.json
curl -L https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1 -o models/face_recognition_model-shard1

echo "Models downloaded successfully!" 