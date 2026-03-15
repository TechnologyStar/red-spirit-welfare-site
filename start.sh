#!/bin/bash

echo "Starting Red Spirit Welfare Site..."

cd backend
npm install
npm run init-db &
BACKEND_PID=$!

cd ../frontend
npm install
npm run build

cd ..
wait $BACKEND_PID

cd backend
npm start &
BACKEND_PID=$!

cd ../frontend
npm run preview

trap "kill $BACKEND_PID" EXIT
