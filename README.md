# S&K – Minimalista Ruházati Webshop

Az oldalunk célja, hogy egyszerű és átlátható vásárlási élményt nyújtson. Nincsenek felesleges elemek csak a legszükségesebbek, letisztult dizájn, könnyű navigáció és gyors vásárlás. Minden az egyszerűségre törekszik.

Készítette

- Simicsák János  
- Pór Dániel Krisztián

Fejlesztési környezet

- Node.js  
- MySQL

Projekt indítása

`bash
-git clone https://github.com/Simii01/s-k_backend.git
-cd backend
-npm install
-npm run dev


Tesztfelhasználók

Email	Jelszó
-admin@a.com	200510
-simi@a.com	    200510

Használt package-ek

-bcryptjs
-cookie-parser
-cors
-dotenv
-express
-jsonwebtoken
-multer
-mysql2
-validator



![image](https://github.com/user-attachments/assets/ebd6d648-297f-4622-89ac-9fa5f5a3edbd)


Biztonság
-JWT token alapú hitelesítés
-Jelszavak bcryptjs segítségével hashelve
-Middleware szintű autentikáció (auth.middleware.js)
-Érzékeny adatok .env fájlban tárolva
Adatbázis struktúra

users
 ├─ user_id
 ├─ username
 ├─ email
 ├─ password
 ├─ created_at
 ├─ profile_picture
 ├─ city
 ├─ postcode
 ├─ address
 ├─ phone_number

products
 ├─ products_id
 ├─ category
 ├─ brand
 ├─ size
 ├─ color
 ├─ product_name
 ├─ price
 ├─ is_in_stock

products_images
 ├─ id
 ├─ products_id
 ├─ img_url

cart
 ├─ cart_id
 ├─ user_id
 ├─ quantity
 ├─ product_id

orders
 ├─ order_id
 ├─ user_id
 ├─ order_date
 ├─ total_amount

order_items
 ├─ order_item_id
 ├─ order_id
 ├─ products_id
 ├─ quantity
 ├─ unit_price

newsletter
 ├─ newsletter_id
 ├─ email
 ├─ name
![image](https://github.com/user-attachments/assets/19b6d871-3dc8-420e-b404-1de4ae063700)
 
# Mappa struktúra
-Backend

```
backend/
├── app.js
├── routes/
│   └── adminRoutes.js
├── uploads/          
└── .env            
```
API Útvonalak

Felhasználói Útvonalak
- `POST /api/Register` 
- `POST /api/Login`  
- `POST /api/Logout` 
- `GET /api/Profile`
- `PUT /api/editProfilePic`
- `PUT /api/editProfilePassword` 
- `PUT /api/editProfileUsername`
- `PUT /api/editProfileEmail`

Termék Útvonalak
- `GET /api/listing`
- `GET /api/product/:product_id`
- `GET /api/variants/:product_id`
- `GET /api/search`

Kosár Útvonalak
- `POST /api/cart`
- `GET /api/cart`
- `DELETE /api/cart/:product_id`
- `DELETE /api/cart`

Rendelés Útvonalak
- `POST /api/order`
- `POST /api/checkout`

### Admin Útvonalak
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PUT /api/admin/users/:id`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `DELETE /api/admin/orders/:id`

![image](https://github.com/user-attachments/assets/31800657-d5ea-4332-9368-b9957f82905d)

![image](https://github.com/user-attachments/assets/5162efe2-daba-41f3-b0c5-01e2ceb9af07)

![image](https://github.com/user-attachments/assets/ec4c2f41-292f-4f56-8e1c-996fdedd9d76)

Biztonság

- JWT token alapú authentikáció
- Admin jogosultság ellenőrzés
- Jelszavak bcrypt hasheléssel tárolva
- CORS védelem
- Képfeltöltés validáció
- Tranzakciós biztonság az adatbázis műveleteknél

-Frontend


├── admin.html
├── Home.html
├── checkout.html
├── products.html
├── index.html
├── Register.html
├── Profile.html
├── Profilenamechange.html
├── Passwordchange.html
├── Emailchange.html
├── netlify.toml
├── _redirects
├── images/
│   └── ...
├── js/
│   ├── admin.js
│   ├── Home.js
│   ├── checkout.js
│   ├── products.js
│   ├── Login.js
│   ├── Register.js
│   ├── Profile.js
│   ├── Profilenamechange.js
│   ├── Passwordchange.js
│   ├── Emailchange.js
│   └── ... 
├── css/
│   ├── admin.css
│   ├── Home.css
│   ├── checkout.css
│   ├── products.css
│   ├── Login.css
│   ├── Register.css
│   ├── Profile.css
│   ├── Profilenamechange.css
│   ├── Passwordchange.css
│   ├── Emailchange.css
│   ├── hamburger-menu.css
│   └── ... 
├── .vscode/
│   └── ... 
├── .git/
│   └── ... 

Egy pár kép a projektről



![image](https://github.com/user-attachments/assets/c8a347d7-838e-4372-bf38-2fc26c5a7887)


![image](https://github.com/user-attachments/assets/5979be68-d336-4cb3-9824-89a2e449061d)


![image](https://github.com/user-attachments/assets/4628c688-5554-42a0-9e0f-975eaad5ea0d)


 Használt eszközök a projekt elkészítése során

-Visual Studio Code
-Postman
-DrawSQL
-GitHub
-W3Schools
-ChatGPT

