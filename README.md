# Bachelor Thesis
### Topic: "Interactive 3D web visualisation of accessibility data"
##### [The thesis was written in german]
-----
# Bachelorarbeit
### Thema: "Interaktive 3D Webvisualisierung von Erreichbarkeitsdaten"
-----
##### [I am using MacOS Monterey (v12.2.1)]
-----
## What did i install 
- For DB:
    1) pgAdmin 4 v6.1
    2) PostgreSQL v14.1-1
    3) PostGIS Extention
- For API & Frontend:
    1) Nodejs: v12.18.3
    2) NPM: 6.14.6 
    3) Nodemon: 2.0.15 (global)

## How to set up the project
- DB
    1) Install pgAdmin4
    2) Install PostgreSQL
    3) From App Stack Builder install `PostGIS`
    4) Create Database `Bachelorarbeit`
    5) Create a PostGIS Extention with:
    ```sql
    CREATE EXTENSION POSTGIS
    ```
    6) Restore with `daten.restore`
    7) Add Id column to `routen` Table with:
    ```sql
    ALTER TABLE routen ADD COLUMN id integer;
    ````
    * Now we have in the DB 6 Tables: `barrieren`, `einrichtungen`, `routen`, `spatial_ref_sys`, `strassennetzwerk` & `wohnorte`

- API
    1) Go to `API`
    2) Run 
    ```sh
    npm install
    ```
    3) Run 
    ```sh
    cp .env.example .env
    ```
    4) Enter your configurations in `.env`

- Frontend
    1) Go to `Frontend`
    2) Run
    ```sh
    npm install
    ```


## How to start
- API
    ```sh
    npm start
    ```

- Frontend
    1) Run
    ```sh
    npm start
    ```
    2) Open the [Project - http://localhost:3000](http://localhost:3000/)
        
    * If there is a Problem with starting the server try:
    ```sh
    npx webpack serve --config webpack.dev.js --mode development
    ```
    in this case you may use another operating system or version different than defined by me in the beginning.
    PS: you can always contact me in case you have a problem with starting the server. (you can find my emails down below)