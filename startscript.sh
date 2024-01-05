cd ./server

rm -r ./clientbuild || true 

cd ../client
npm run build
mv ./build ../server/clientbuild

cd ../server
npm start

read -rp "Press Enter to exit..."
