Az  oldalunkat  úgy  terveztük,  hogy  egyszerű  és  átlátható  legyen.  Nincsenek  felesleges  eleme,  csak  amit  tényleg  keresel  letisztult  dizájn  könnyű  navigáció
gyors  vásárlás  minden  úgy  van  kialakítva  hogy  ne  vonja  el  semmi  a  figyelmed  és  könnyedén  megtaláld  amit  szeretnél.

Készítette:  Simicsák  János,  Pór  Dániel  Krisztián

Fejlesztési  környezet:
Node.js
MySQL



Adatbazis:
users
    -user_id
    -username
    -email
    -password
    -created_at
    -profile_pricture
    -city
    -postcode
    -adress
    -phone_number
products
    -products_id
    -category
    -brand
    -size
    -color
    -product_name
    -price
    -is_in_stock
products_images
    -id
    -products_id
    -img_url
cart
    -cart_id
    -user_id
    -quantity
    -product_id
orders
    -order_id
    -user_id
    -order_date
    -total_amount
order_items
    -order_item_id
    -order_id
    -products_id
    -quantity
    -unit_price
newsletter
    -newsletter_id
    -email
    -name
![image](https://github.com/user-attachments/assets/19b6d871-3dc8-420e-b404-1de4ae063700)



Backend
git clone https://github.com/Simii01/s-k_backend.git
cd backend
npm install
npm run dev
![image](https://github.com/user-attachments/assets/83dc8260-fa75-4ae5-a13c-97e4fb871266)


Használt  package-ek:
bcryptjs
cookie-parser
cors
dotenv
express
jsonwebtoken
multer
mysql2
validator


Biztonság:
JWT token alapú hitelesítés
Jelszavak bcryptjs segítségével vannak hashelve
Middleware szinten történik az authentikáció (auth.middleware.js)
A .env fájl tartalmaz minden érzékeny adatot – ne oszd meg publikusan!



Hasznalt eszközök:
VS Code
Postman
DrawSQL
GitHub
W3Schools
ChatGPT
